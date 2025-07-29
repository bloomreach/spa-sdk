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
import { BrNodeContainer } from './BrNodeContainer';
import { BrMeta } from '../meta';
import { BrMapping } from './BrProps';

describe('BrNodeContainer', () => {
  const mockMapping: BrMapping = {
    test: ({ children }: React.PropsWithChildren<any>) => <div>{children}</div>,
  };

  const mockComponent = {
    getType: jest.fn(),
    getMeta: jest.fn(),
  } as unknown as jest.Mocked<Container>;

  const mockPage = {
    isPreview: jest.fn(() => false),
  } as unknown as jest.Mocked<Page>;

  const emptyMeta = {} as MetaCollection;

  beforeEach(() => {
    jest.resetAllMocks();

    mockComponent.getMeta.mockReturnValue(emptyMeta);
  });

  describe('Container type mapping', () => {
    it('should use container type for mapping', () => {
      render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(mockComponent.getType).toBeCalled();
    });

    it('should render a mapped container', () => {
      mockComponent.getType.mockReturnValue('test' as ReturnType<Container['getType']>);
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainer>,
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render inline container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_INLINE);
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerInline
            component={mockComponent}
            page={mockPage}
            mapping={mockMapping}
          >
            <a />
          </BrContainerInline>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render no markup container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_NO_MARKUP);
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerNoMarkup
            component={mockComponent}
            page={mockPage}
            mapping={mockMapping}
          >
            <a />
          </BrContainerNoMarkup>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render ordered list container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_ORDERED_LIST);
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerOrderedList
            component={mockComponent}
            page={mockPage}
            mapping={mockMapping}
          >
            <a />
          </BrContainerOrderedList>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render unordered list container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_UNORDERED_LIST);
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerUnorderedList
            component={mockComponent}
            page={mockPage}
            mapping={mockMapping}
          >
            <a />
          </BrContainerUnorderedList>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render box container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_BOX);
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainer>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerBox
            component={mockComponent}
            page={mockPage}
            mapping={mockMapping}
          >
            <a />
          </BrContainerBox>
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render box container on an unknown type', () => {
      const element = render(
        <BrNodeContainer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <BrContainerBox
            component={mockComponent}
            page={mockPage}
            mapping={mockMapping}
          />
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });
  });
});
