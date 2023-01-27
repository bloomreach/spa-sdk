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
import { ContainerItem, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrContainerItemUndefined } from './BrContainerItemUndefined';

describe('BrContainerItemUndefined', () => {
  const props = {
    component: { getType: () => 'something' } as unknown as jest.Mocked<ContainerItem>,
    page: {} as unknown as jest.Mocked<Page>,
  };

  it('should render a message', () => {
    const element = render(<BrContainerItemUndefined {...props} />);

    expect(element.getByText('Component "something" is not defined.')).toBeInTheDocument();
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render a message if component is not defined', () => {
    const customProps = { ...props, component: undefined };
    const element = render(<BrContainerItemUndefined {...customProps} />);

    expect(element.getByText('Component "undefined" is not defined.')).toBeInTheDocument();
    expect(element.asFragment()).toMatchSnapshot();
  });
});
