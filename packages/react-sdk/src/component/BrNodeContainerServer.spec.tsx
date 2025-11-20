/*
 * Copyright 2025 Bloomreach
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
import { BrNodeContainerServer } from './BrNodeContainerServer';
import { BrMapping } from './BrProps';

describe('BrNodeContainerServer', () => {
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

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Container type mapping', () => {
    it('should use container type for mapping', () => {
      render(
        <BrNodeContainerServer
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
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerServer>,
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render inline container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_INLINE);
      const element = render(
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerServer>,
      );

      const inlineContainer = render(
        <BrContainerInline
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrContainerInline>,
      );

      expect(element.container).toContainHTML(inlineContainer.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render no markup container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_NO_MARKUP);
      const element = render(
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerServer>,
      );

      const noMarkupContainer = render(
        <BrContainerNoMarkup
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrContainerNoMarkup>,
      );

      expect(element.container).toContainHTML(noMarkupContainer.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render ordered list container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_ORDERED_LIST);
      const element = render(
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerServer>,
      );

      const orderedListContainer = render(
        <BrContainerOrderedList
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrContainerOrderedList>,
      );

      expect(element.container).toContainHTML(orderedListContainer.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render unordered list container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_UNORDERED_LIST);
      const element = render(
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerServer>,
      );

      const unorderedListContainer = render(
        <BrContainerUnorderedList
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrContainerUnorderedList>,
      );

      expect(element.container).toContainHTML(unorderedListContainer.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render box container', () => {
      mockComponent.getType.mockReturnValue(TYPE_CONTAINER_BOX);
      const element = render(
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerServer>,
      );

      const boxContainer = render(
        <BrContainerBox
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrContainerBox>,
      );

      expect(element.container).toContainHTML(boxContainer.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render box container on an unknown type', () => {
      const element = render(
        <BrNodeContainerServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      const boxContainer = render(
        <BrContainerBox
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(element.container).toContainHTML(boxContainer.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });
  });
});
