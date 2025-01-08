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
import { isContainer, isContainerItem, Component, MetaCollection, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrNode } from './BrNode';
import { BrNodeComponent } from './BrNodeComponent';
import { BrNodeContainer } from './BrNodeContainer';
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { withContextProvider } from '../utils/withContextProvider';
import { BrMeta } from '../meta';

jest.mock('@bloomreach/spa-sdk');

describe('BrNode', () => {
  const context = {
    isPreview: jest.fn(),
  } as unknown as jest.Mocked<Page>;
  const props = {
    component: {
      getChildren: jest.fn(() => []),
      getMeta: jest.fn(() => []),
      getName: jest.fn(),
      getType: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as jest.Mocked<Component>,
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    (BrNode as any).contextTypes = {
      isPreview: () => null,
    };
    delete (BrNode as Partial<typeof BrNode>).contextType;
  });

  it('should render a component meta-data', () => {
    const meta = {} as MetaCollection;
    props.component.getMeta.mockReturnValueOnce(meta);
    const element = render(<BrNode {...props} />);

    const nodeMeta = render(withContextProvider(context, <BrMeta meta={props.component.getMeta()} />));

    expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a component', () => {
    const element = render(withContextProvider(context, <BrNode {...props} />));

    const nodeComponent = render(withContextProvider(context, <BrNodeComponent {...props} />));

    expect(element.container.isEqualNode(nodeComponent.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a container', () => {
    jest.mocked(isContainer).mockReturnValueOnce(true);
    const element = render(withContextProvider(context, <BrNode {...props} />));

    const nodeContainer = render(<BrNodeContainer page={context} component={props.component as any} />);

    expect(element.container.isEqualNode(nodeContainer.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a container item', () => {
    jest.mocked(isContainerItem).mockReturnValueOnce(true);
    const element = render(withContextProvider(context, <BrNode {...props} />));

    const nodeContainerItem = render(<BrNodeContainerItem page={context} component={props.component as any} />);

    expect(element.container.isEqualNode(nodeContainerItem.container)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render children if present', () => {
    const element = render(
      <BrNode {...props}>
        <a />
        <b />
      </BrNode>,
    );

    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render model children if component children are not present', () => {
    const component1 = { ...props.component } as Component;
    const component2 = { ...props.component } as Component;
    props.component.getChildren.mockReturnValueOnce([component1, component2]);
    const element = render(<BrNode {...props} />);

    expect(element.asFragment()).toMatchSnapshot();
  });
});
