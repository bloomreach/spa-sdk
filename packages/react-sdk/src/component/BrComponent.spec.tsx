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
import { Component } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrComponent } from './BrComponent';
import { BrNode } from './BrNode';
import { withContextProvider } from '../utils/withContextProvider';

jest.mock('@bloomreach/spa-sdk');

describe('BrComponent', () => {
  const context = {
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(),
    getComponent: jest.fn(),
  } as unknown as jest.Mocked<Component>;
  const component = {
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(),
    getName: jest.fn(),
  } as unknown as Component;

  beforeEach(() => {
    jest.restoreAllMocks();

    (BrComponent as any).contextTypes = {
      getChildren: () => null,
      getMeta: () => null,
      getComponent: () => null,
    };
    delete (BrComponent as Partial<typeof BrComponent>).contextType;
  });

  it('should render nothing if there is no context', () => {
    delete (BrComponent as any).contextTypes;
    const element = render(<BrComponent />);

    expect(element.container.firstChild).toBe(null);
  });

  it('should render children if path is not set', () => {
    const component1 = { ...component } as Component;
    const component2 = { ...component } as Component;
    context.getChildren.mockReturnValueOnce([component1, component2]);
    const element = render(withContextProvider(context, <BrComponent />));

    expect(context.getChildren).toBeCalled();

    const node1 = render(withContextProvider(context, <BrNode component={component1} />));
    const node2 = render(withContextProvider(context, <BrNode component={component2} />));

    expect(element.container).toContainHTML(node1.container.innerHTML);
    expect(element.container).toContainHTML(node2.container.innerHTML);
  });

  it('should split path by slashes', () => {
    render(withContextProvider(context, <BrComponent path="a/b" />));

    expect(context.getComponent).toBeCalledWith('a', 'b');
  });

  it('should render nothing if no component found', () => {
    const element = render(withContextProvider(context, <BrComponent path="a/b" />));

    expect(element.container.firstChild).toBe(null);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render found component', () => {
    context.getComponent.mockReturnValueOnce(component);
    const element = render(withContextProvider(context, <BrComponent path="a/b" />));

    const node = render(withContextProvider(context, <BrNode component={component} />));

    expect(element.container).toContainHTML(node.container.innerHTML);
  });

  it('should pass children down', () => {
    context.getComponent.mockReturnValueOnce(component);
    const element = render(
      withContextProvider(
        context,
        <BrComponent path="a/b">
          <a />
        </BrComponent>,
      ),
    );
    const node = render(
      withContextProvider(
        context,
        <BrNode component={component}>
          <a />
        </BrNode>,
      ),
    );

    expect(element.container).toContainHTML(node.container.innerHTML);
  });
});
