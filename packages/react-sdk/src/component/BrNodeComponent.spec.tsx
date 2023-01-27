/*
 * Copyright 2019-2023 Bloomreach
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
import { Component, MetaCollection, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrNodeComponent } from './BrNodeComponent';
import { BrMeta } from '../meta';
import { withContextProvider } from '../utils/withContextProvider';

describe('BrNodeComponent', () => {
  const context = {
    test: ({ children }: React.PropsWithChildren<typeof props>) => <a>{children}</a>,
  };
  const props = {
    component: { getName: jest.fn(), getMeta: jest.fn() } as unknown as jest.Mocked<Component>,
    page: {} as jest.Mocked<Page>,
  };

  const emptyMeta = {} as MetaCollection;

  beforeEach(() => {
    jest.resetAllMocks();

    props.component.getMeta.mockReturnValue(emptyMeta);
  });

  describe('getMapping', () => {
    it('should use component name for mapping', () => {
      render(<BrNodeComponent {...props} />);

      expect(props.component.getName).toBeCalled();
    });
  });

  describe('render', () => {
    beforeEach(() => {
      (BrNodeComponent as any).contextTypes = { test: () => null };
      delete (BrNodeComponent as Partial<typeof BrNodeComponent>).contextType;
    });

    it('should fallback when there is no mapping', () => {
      props.component.getName.mockReturnValue('something');
      const element = render(
        withContextProvider(
          context,
          <BrNodeComponent {...props}>
            <b />
          </BrNodeComponent>,
        ),
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <b />
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
    });

    it('should render a mapped component', () => {
      props.component.getName.mockReturnValue('test');
      const element = render(
        withContextProvider(
          context,
          <BrNodeComponent {...props}>
            <b />
          </BrNodeComponent>,
        ),
      );

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render children on a fallback', () => {
      const element = render(
        <BrNodeComponent {...props}>
          <b />
        </BrNodeComponent>,
      );

      const nodeMeta = render(
        <BrMeta meta={emptyMeta}>
          <b />
        </BrMeta>,
      );

      expect(element.container.isEqualNode(nodeMeta.container)).toBe(true);
      expect(element.asFragment()).toMatchSnapshot();
    });
  });
});
