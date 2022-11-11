/*
 * Copyright 2019-2022 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { ContainerItem, MetaCollection, Page, TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { act, render } from '@testing-library/react';
import { BrContainerItemUndefined } from '../cms';
import { BrNodeComponent } from './BrNodeComponent';
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { BrMeta } from '../meta';
import { withContextProvider } from '../utils/withContextProvider';

jest.mock('@bloomreach/spa-sdk', () => () => ({ [TYPE_CONTAINER_ITEM_UNDEFINED]: 'StringValue' }));

describe('BrNodeContainerItem', () => {
  const props = {
    component: {
      getType: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      getMeta: jest.fn(),
    } as unknown as jest.Mocked<ContainerItem>,
    page: { sync: jest.fn() } as unknown as jest.Mocked<Page>,
  };

  const emptyMeta = {} as MetaCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    props.component.getMeta.mockReturnValue(emptyMeta);
  });

  describe('componentDidMount', () => {
    it('should subscribe for update event on mount', () => {
      render(<BrNodeContainerItem {...props} />);

      expect(props.component.on).toBeCalledWith('update', expect.any(Function));
    });
  });

  describe('componentDidUpdate', () => {
    it('should resubscribe on component update', () => {
      const element = render(<BrNodeContainerItem {...props} />);

      jest.clearAllMocks();
      render(<BrNodeContainerItem component={{ ...props.component }} />, { container: element.container });

      expect(props.component.off).toBeCalledWith('update', expect.any(Function));
      expect(props.component.on).toBeCalledWith('update', expect.any(Function));
    });
  });

  describe('componentWillUnmount', () => {
    it('should unsubscribe from update event on unmount', () => {
      const element = render(<BrNodeContainerItem {...props} />);
      element.unmount();

      expect(props.component.off).toBeCalledWith('update', props.component.on.mock.calls[0][1]);
    });
  });

  describe('getMapping', () => {
    beforeEach(() => {
      (BrNodeContainerItem as any).contextTypes = { [TYPE_CONTAINER_ITEM_UNDEFINED]: () => null };
      delete (BrNodeComponent as Partial<typeof BrNodeComponent>).contextType;
    });

    it('should use container item type for mapping', () => {
      props.component.getType.mockReturnValueOnce('test');
      (BrNodeContainerItem as any).contextTypes = { test: () => null };
      render(
        withContextProvider(
          {
            test: () => <div>Test</div>,
          },
          <BrNodeContainerItem {...props} />,
        ),
      );

      expect(props.component.getType).toBeCalled();
    });

    it('should render undefined container item', () => {
      const element = render(
        <BrNodeContainerItem {...props}>
          <a />
        </BrNodeContainerItem>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerItemUndefined {...props}>
            <a />
          </BrContainerItemUndefined>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should override undefined container item', () => {
      props.component.getType.mockReturnValueOnce('test');
      const element = render(
        withContextProvider(
          {
            [TYPE_CONTAINER_ITEM_UNDEFINED]: ({ children }: React.PropsWithChildren<typeof props>) => (
              <div>{children}</div>
            ),
          },
          <BrNodeContainerItem {...props}>
            <a />
          </BrNodeContainerItem>,
        ),
      );

      expect(element.asFragment()).toMatchSnapshot();
    });
  });

  describe('onUpdate', () => {
    it('should trigger sync on update event', async () => {
      render(<BrNodeContainerItem {...props} />);

      await act(() => props.component.on.mock.calls[0][1]({}));

      expect(props.page.sync).toBeCalled();
    });
  });
});
