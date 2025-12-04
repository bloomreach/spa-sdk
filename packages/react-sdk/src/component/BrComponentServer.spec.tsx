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
import { BrComponentServer } from './BrComponentServer';
import { BrNodeServer } from './BrNodeServer';
import { BrMapping } from './BrProps';

jest.mock('@bloomreach/spa-sdk');

describe('BrComponentServer', () => {
  const mockPage = {
    isPreview: jest.fn(),
  } as unknown as jest.Mocked<Page>;

  const mockMapping: BrMapping = {
    TestComponent: () => <div>Test Component</div>,
  };

  const mockComponent = {
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(),
    getComponent: jest.fn(),
    getName: jest.fn(),
    getId: jest.fn(() => 'mock-component-id'),
  } as unknown as jest.Mocked<Component>;

  const childComponent = {
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(),
    getName: jest.fn(),
    getId: jest.fn(() => 'mock-child-component-id'),
  } as unknown as Component;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should render nothing if component has no children', () => {
    const element = render(
      <BrComponentServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container.firstChild).toBe(null);
  });

  it('should render children if path is not set', () => {
    const component1 = { ...childComponent, getId: jest.fn(() => 'component-1-id') } as Component;
    const component2 = { ...childComponent, getId: jest.fn(() => 'component-2-id') } as Component;
    mockComponent.getChildren.mockReturnValueOnce([component1, component2]);

    const element = render(
      <BrComponentServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(mockComponent.getChildren).toBeCalled();

    const node1 = render(
      <BrNodeServer
        component={component1}
        page={mockPage}
        mapping={mockMapping}
      />,
    );
    const node2 = render(
      <BrNodeServer
        component={component2}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container).toContainHTML(node1.container.innerHTML);
    expect(element.container).toContainHTML(node2.container.innerHTML);
  });

  it('should split path by slashes', () => {
    render(
      <BrComponentServer
        path="a/b"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(mockComponent.getComponent).toBeCalledWith('a', 'b');
  });

  it('should render nothing if no component found', () => {
    const element = render(
      <BrComponentServer
        path="a/b"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container.firstChild).toBe(null);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render found component', () => {
    mockComponent.getComponent.mockReturnValueOnce(childComponent);
    const element = render(
      <BrComponentServer
        path="a/b"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    const node = render(
      <BrNodeServer
        component={childComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container).toContainHTML(node.container.innerHTML);
  });

  it('should pass children down', () => {
    mockComponent.getComponent.mockReturnValueOnce(childComponent);
    const element = render(
      <BrComponentServer
        path="a/b"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        <a />
      </BrComponentServer>,
    );

    const node = render(
      <BrNodeServer
        component={childComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        <a />
      </BrNodeServer>,
    );

    expect(element.container).toContainHTML(node.container.innerHTML);
  });

  it('should handle empty component object', () => {
    const emptyComponent = {
      getComponent: jest.fn(() => null),
    } as unknown as Component;
    const element = render(
      <BrComponentServer
        path="a/b"
        component={emptyComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(element.container.firstChild).toBe(null);
  });

  it('should handle nested component paths', () => {
    const nestedComponent = { ...childComponent, getId: jest.fn(() => 'nested-component-id') } as Component;
    mockComponent.getComponent.mockReturnValueOnce(nestedComponent);

    render(
      <BrComponentServer
        path="main/content/header"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      />,
    );

    expect(mockComponent.getComponent).toBeCalledWith('main', 'content', 'header');
  });

  it('should support render props pattern', () => {
    mockComponent.getComponent.mockReturnValueOnce(childComponent);

    const renderFunction = jest.fn(() => <div>Render Props Test</div>);

    render(
      <BrComponentServer
        path="a/b"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        {renderFunction}
      </BrComponentServer>,
    );

    expect(renderFunction).toHaveBeenCalledWith({
      page: mockPage,
      component: childComponent,
      mapping: mockMapping,
      isClientComponent: false,
    });
  });

  it('should handle render props with multiple components', () => {
    const component1 = { ...childComponent, getId: jest.fn(() => 'component-1-id') } as Component;
    const component2 = { ...childComponent, getId: jest.fn(() => 'component-2-id') } as Component;
    mockComponent.getChildren.mockReturnValueOnce([component1, component2]);

    const renderFunction = jest.fn(() => <div>Multiple Components</div>);

    render(
      <BrComponentServer
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        {renderFunction}
      </BrComponentServer>,
    );

    expect(renderFunction).toHaveBeenCalledTimes(2);
    expect(renderFunction).toHaveBeenNthCalledWith(1, {
      page: mockPage,
      component: component1,
      mapping: mockMapping,
      isClientComponent: false,
    });
    expect(renderFunction).toHaveBeenNthCalledWith(2, {
      page: mockPage,
      component: component2,
      mapping: mockMapping,
      isClientComponent: false,
    });
  });

  it('should maintain backward compatibility with regular children', () => {
    mockComponent.getComponent.mockReturnValueOnce(childComponent);

    const element = render(
      <BrComponentServer
        path="a/b"
        component={mockComponent}
        page={mockPage}
        mapping={mockMapping}
      >
        <div>Regular Child</div>
      </BrComponentServer>,
    );

    expect(element.getByText('Regular Child')).toBeInTheDocument();
  });
});
