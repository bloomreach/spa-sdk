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
import { Component, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrNodeComponentServer } from './BrNodeComponentServer';
import { BrMapping } from './BrProps';

describe('BrNodeComponentServer', () => {
  const mockMapping: BrMapping = {
    test: ({ children }: React.PropsWithChildren<any>) => <a>{children}</a>,
  };

  const mockComponent = {
    getName: jest.fn(),
    getMeta: jest.fn(),
  } as unknown as jest.Mocked<Component>;

  const mockPage = {} as jest.Mocked<Page>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Component mapping resolution', () => {
    it('should use component name for mapping', () => {
      render(
        <BrNodeComponentServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        />,
      );

      expect(mockComponent.getName).toBeCalled();
    });

    it('should render mapped component when mapping exists', () => {
      mockComponent.getName.mockReturnValue('test');
      const element = render(
        <BrNodeComponentServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <b />
        </BrNodeComponentServer>,
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should fallback to children when there is no mapping', () => {
      mockComponent.getName.mockReturnValue('something');
      const element = render(
        <BrNodeComponentServer
          component={mockComponent}
          page={mockPage}
          mapping={mockMapping}
        >
          <b />
        </BrNodeComponentServer>,
      );

      expect(element.container.querySelector('b')).toBeInTheDocument();
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render children when no mapping provided', () => {
      const element = render(
        <BrNodeComponentServer
          component={mockComponent}
          page={mockPage}
          mapping={{}}
        >
          <b />
        </BrNodeComponentServer>,
      );

      expect(element.container.querySelector('b')).toBeInTheDocument();
      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should pass props correctly to mapped component', () => {
      const TestComponent = jest.fn(() => <div>Test</div>);
      const testMapping = { test: TestComponent };

      mockComponent.getName.mockReturnValue('test');

      render(
        <BrNodeComponentServer
          component={mockComponent}
          page={mockPage}
          mapping={testMapping}
        />,
      );

      expect(TestComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          component: mockComponent,
          page: mockPage,
          mapping: testMapping,
        }),
        undefined,
      );
    });
  });
});
