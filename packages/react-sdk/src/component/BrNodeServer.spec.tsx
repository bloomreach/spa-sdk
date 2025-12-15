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
import { isContainer, isContainerItem, Component, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrNodeServer } from './BrNodeServer';
import { BrNodeComponentServer } from './BrNodeComponentServer';
import { BrNodeContainerServer } from './BrNodeContainerServer';
import { BrNodeContainerItemServer } from './BrNodeContainerItemServer';
import { BrMapping } from './BrProps';

jest.mock('@bloomreach/spa-sdk');

describe('BrNodeServer', () => {
  const mockPage = {
    isPreview: jest.fn(),
  } as unknown as jest.Mocked<Page>;

  const mockMapping: BrMapping = {
    TestComponent: () => <div>Test Component</div>,
  };

  const mockComponent = {
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(() => []),
    getName: jest.fn(),
    getId: jest.fn(() => 'mock-component-id'),
    getType: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  } as unknown as jest.Mocked<Component>;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should render a component', () => {
    const element = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeComponent = render(
      <BrNodeComponentServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container).toContainHTML(nodeComponent.container.innerHTML);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a container', () => {
    jest.mocked(isContainer).mockReturnValueOnce(true);
    const element = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeContainer = render(
      <BrNodeContainerServer
        page={mockPage}
        component={mockComponent as any}
        mapping={mockMapping}
      />,
    );

    expect(element.container).toContainHTML(nodeContainer.container.innerHTML);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a container item', () => {
    jest.mocked(isContainerItem).mockReturnValueOnce(true);
    const element = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeContainerItem = render(
      <BrNodeContainerItemServer
        page={mockPage}
        component={mockComponent as any}
        mapping={mockMapping}
      />,
    );

    expect(element.container).toContainHTML(nodeContainerItem.container.innerHTML);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render children if present', () => {
    const element = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        <a />
        <b />
      </BrNodeServer>,
    );

    expect(element.container.querySelector('a')).toBeInTheDocument();
    expect(element.container.querySelector('b')).toBeInTheDocument();
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render model children if component children are not present', () => {
    const component1 = {
      ...mockComponent,
      getId: jest.fn(() => 'mock-component-id-1'),
    } as unknown as Component;
    const component2 = {
      ...mockComponent,
      getId: jest.fn(() => 'mock-component-id-2'),
    } as unknown as Component;
    mockComponent.getChildren.mockReturnValueOnce([component1, component2]);
    const element = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should properly thread props to child BrNodeServer components', () => {
    const childComponent = {
      ...mockComponent,
      getName: jest.fn(() => 'ChildComponent'),
    } as unknown as Component;

    mockComponent.getChildren.mockReturnValueOnce([childComponent]);

    const { container } = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    // Verify that child components are rendered
    expect(container).toMatchSnapshot();
  });

  it('should handle component type resolution correctly', () => {
    // Test component type
    jest.mocked(isContainer).mockReturnValue(false);
    jest.mocked(isContainerItem).mockReturnValue(false);

    const { rerender } = render(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    // Test container type
    jest.mocked(isContainer).mockReturnValue(true);
    jest.mocked(isContainerItem).mockReturnValue(false);

    rerender(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    // Test container item type
    jest.mocked(isContainer).mockReturnValue(false);
    jest.mocked(isContainerItem).mockReturnValue(true);

    rerender(
      <BrNodeServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );
  });
});
