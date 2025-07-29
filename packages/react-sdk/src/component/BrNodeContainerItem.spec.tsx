/*
 * Copyright 2019-2025 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
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
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { BrMeta } from '../meta';
import { BrMapping } from './BrProps';

jest.mock('@bloomreach/spa-sdk', () => () => ({ [TYPE_CONTAINER_ITEM_UNDEFINED]: 'StringValue' }));

describe('BrNodeContainerItem', () => {
  const mockMapping: BrMapping = {
    test: () => <div>Test</div>,
    [TYPE_CONTAINER_ITEM_UNDEFINED]: ({ children }: React.PropsWithChildren<any>) => <div>{children}</div>,
  };

  const mockComponent = {
    getType: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getMeta: jest.fn(),
  } as unknown as jest.Mocked<ContainerItem>;

  const mockPage = {
    sync: jest.fn(),
  } as unknown as jest.Mocked<Page>;

  const emptyMeta = {} as MetaCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    mockComponent.getMeta.mockReturnValue(emptyMeta);
  });

  describe('Event handling', () => {
    it('should subscribe for update event on mount', () => {
      render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(mockComponent.on).toBeCalledWith('update', expect.any(Function));
    });

    it('should resubscribe on component update', () => {
      const newComponent = { ...mockComponent } as jest.Mocked<ContainerItem>;
      const { rerender } = render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      jest.clearAllMocks();
      rerender(
        <BrNodeContainerItem
          component={newComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(mockComponent.off).toBeCalledWith('update', expect.any(Function));
      expect(newComponent.on).toBeCalledWith('update', expect.any(Function));
    });

    it('should unsubscribe from update event on unmount', () => {
      const element = render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      element.unmount();

      expect(mockComponent.off).toBeCalledWith('update', mockComponent.on.mock.calls[0][1]);
    });

    it('should trigger sync on update event', async () => {
      render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      await act(() => mockComponent.on.mock.calls[0][1]({}));

      expect(mockPage.sync).toBeCalled();
    });
  });

  describe('Container item mapping', () => {
    it('should use container item type for mapping', () => {
      mockComponent.getType.mockReturnValueOnce('test');
      render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(mockComponent.getType).toBeCalled();
    });

    it('should render undefined container item', () => {
      const element = render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={{}}
        >
          <a />
        </BrNodeContainerItem>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerItemUndefined
            component={mockComponent}
            page={mockPage}
            mapping={{}}
          >
            <a />
          </BrContainerItemUndefined>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should override undefined container item when mapping provided', () => {
      mockComponent.getType.mockReturnValueOnce('test');
      const element = render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerItem>,
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render mapped component when type matches', () => {
      mockComponent.getType.mockReturnValueOnce('test');
      const element = render(
        <BrNodeContainerItem
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(element.getByText('Test')).toBeInTheDocument();
    });
  });
});
