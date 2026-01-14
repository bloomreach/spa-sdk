/*
 * Copyright 2019-2026 Bloomreach
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
import { isContainer, isContainerItem, Component, MetaCollection, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrNode } from './BrNode';
import { BrNodeComponent } from './BrNodeComponent';
import { BrNodeContainer } from './BrNodeContainer';
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { BrMeta } from '../meta';
import { BrMapping } from './BrProps';

jest.mock('@bloomreach/spa-sdk');

describe('BrNode', () => {
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

  it('should render a component meta-data', () => {
    const meta = {} as MetaCollection;
    mockComponent.getMeta.mockReturnValueOnce(meta);
    const element = render(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeMeta = render(<BrMeta meta={mockComponent.getMeta()} />);

    expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a component', () => {
    const element = render(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeComponent = render(
      <BrNodeComponent
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container.isEqualNode(nodeComponent.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a container', () => {
    jest.mocked(isContainer).mockReturnValueOnce(true);
    const element = render(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeContainer = render(
      <BrNodeContainer
        page={mockPage}
        component={mockComponent as any}
        mapping={mockMapping}
      />,
    );

    expect(element.container.isEqualNode(nodeContainer.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a container item', () => {
    jest.mocked(isContainerItem).mockReturnValueOnce(true);
    const element = render(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const nodeContainerItem = render(
      <BrNodeContainerItem
        page={mockPage}
        component={mockComponent as any}
        mapping={mockMapping}
      />,
    );

    expect(element.container.isEqualNode(nodeContainerItem.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render children if present', () => {
    const element = render(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        <a />
        <b />
      </BrNode>,
    );

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
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should properly thread props to child BrNode components', () => {
    const childComponent = {
      ...mockComponent,
      getName: jest.fn(() => 'ChildComponent'),
    } as unknown as Component;

    mockComponent.getChildren.mockReturnValueOnce([childComponent]);

    const { container } = render(
      <BrNode
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
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    // Test container type
    jest.mocked(isContainer).mockReturnValue(true);
    jest.mocked(isContainerItem).mockReturnValue(false);

    rerender(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    // Test container item type
    jest.mocked(isContainer).mockReturnValue(false);
    jest.mocked(isContainerItem).mockReturnValue(true);

    rerender(
      <BrNode
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );
  });
});
