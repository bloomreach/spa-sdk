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
import { ContainerItem, Page, TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrContainerItemUndefined } from '../cms';
import { BrNodeContainerItemServer } from './BrNodeContainerItemServer';
import { BrMapping } from './BrProps';

jest.mock('@bloomreach/spa-sdk', () => () => ({ [TYPE_CONTAINER_ITEM_UNDEFINED]: 'StringValue' }));

describe('BrNodeContainerItemServer', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Container item mapping', () => {
    it('should use container item type for mapping', () => {
      mockComponent.getType.mockReturnValueOnce('test');
      render(
        <BrNodeContainerItemServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(mockComponent.getType).toBeCalled();
    });

    it('should render undefined container item', () => {
      const element = render(
        <BrNodeContainerItemServer
          component={mockComponent}
          page={mockPage}
          mapping={{}}
        >
          <a />
        </BrNodeContainerItemServer>,
      );

      const undefinedItem = render(
        <BrContainerItemUndefined
          component={mockComponent}
          page={mockPage}
          mapping={{}}
        >
          <a />
        </BrContainerItemUndefined>,
      );

      expect(element.container).toContainHTML(undefinedItem.container.innerHTML);
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should override undefined container item when mapping provided', () => {
      mockComponent.getType.mockReturnValueOnce('test');
      const element = render(
        <BrNodeContainerItemServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <a />
        </BrNodeContainerItemServer>,
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render mapped component when type matches', () => {
      mockComponent.getType.mockReturnValueOnce('test');
      const element = render(
        <BrNodeContainerItemServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(element.getByText('Test')).toBeInTheDocument();
    });

    it('should use custom undefined container item mapping when provided', () => {
      const customUndefinedMapping: BrMapping = {
        [TYPE_CONTAINER_ITEM_UNDEFINED]: ({ children }: React.PropsWithChildren<any>) => (
          <div className="custom-undefined">{children}</div>
        ),
      };

      const element = render(
        <BrNodeContainerItemServer
          component={mockComponent}
          page={mockPage}
          mapping={customUndefinedMapping}
        >
          <a />
        </BrNodeContainerItemServer>,
      );

      expect(element.container.querySelector('.custom-undefined')).toBeInTheDocument();
      expect(element.container.querySelector('a')).toBeInTheDocument();
    });
  });
});
