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
import {
  Container,
  MetaCollection,
  Page,
  TYPE_CONTAINER_BOX,
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import {
  BrContainerBox,
  BrContainerInline,
  BrContainerNoMarkup,
  BrContainerOrderedList,
  BrContainerUnorderedList,
} from '../cms';
import { BrNodeComponent } from './BrNodeComponent';
import { BrNodeContainer } from './BrNodeContainer';
import { BrMeta } from '../meta';
import { withContextProvider } from '../utils/withContextProvider';

describe('BrNodeContainer', () => {
  const props = {
    component: { getType: jest.fn(), getMeta: jest.fn() } as unknown as jest.Mocked<Container>,
    page: { isPreview: jest.fn(() => false) } as unknown as jest.Mocked<Page>,
  };

  const emptyMeta = {} as MetaCollection;

  beforeEach(() => {
    jest.resetAllMocks();

    props.component.getMeta.mockReturnValue(emptyMeta);
  });

  describe('getMapping', () => {
    beforeEach(() => {
      (BrNodeContainer as any).contextTypes = { test: () => null };
      delete (BrNodeComponent as Partial<typeof BrNodeComponent>).contextType;
    });

    it('should use container type for mapping', () => {
      render(<BrNodeContainer {...props} />);

      expect(props.component.getType).toBeCalled();
    });

    it('should render a mapped container', () => {
      props.component.getType.mockReturnValue('test' as ReturnType<Container['getType']>);
      const element = render(
        withContextProvider(
          {
            test: ({ children }: React.PropsWithChildren<typeof props>) => <div>{children}</div>,
          },
          <BrNodeContainer {...props}>
            <a />
          </BrNodeContainer>,
        ),
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render inline container', () => {
      props.component.getType.mockReturnValue(TYPE_CONTAINER_INLINE);
      const element = render(
        <BrNodeContainer {...props}>
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerInline {...props}>
            <a />
          </BrContainerInline>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render no markup container', () => {
      props.component.getType.mockReturnValue(TYPE_CONTAINER_NO_MARKUP);
      const element = render(
        <BrNodeContainer {...props}>
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerNoMarkup {...props}>
            <a />
          </BrContainerNoMarkup>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render ordered list container', () => {
      props.component.getType.mockReturnValue(TYPE_CONTAINER_ORDERED_LIST);
      const element = render(
        <BrNodeContainer {...props}>
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerOrderedList {...props}>
            <a />
          </BrContainerOrderedList>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render unordered list container', () => {
      props.component.getType.mockReturnValue(TYPE_CONTAINER_UNORDERED_LIST);
      const element = render(
        <BrNodeContainer {...props}>
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerUnorderedList {...props}>
            <a />
          </BrContainerUnorderedList>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render box container', () => {
      props.component.getType.mockReturnValue(TYPE_CONTAINER_BOX);
      const element = render(
        <BrNodeContainer {...props}>
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerBox {...props}>
            <a />
          </BrContainerBox>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render box container on an unknown type', () => {
      const element = render(<BrNodeContainer {...props} />);

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerBox {...props} />
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });
  });
});
