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
import { Container, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrContainerNoMarkup } from './BrContainerNoMarkup';

describe('BrContainerNoMarkup', () => {
  const props = {
    component: {} as jest.Mocked<Container>,
    page: { isPreview: jest.fn() } as unknown as jest.Mocked<Page>,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not render itself', () => {
    const element = render(<BrContainerNoMarkup {...props} />);

    expect(element.container.firstChild).toBe(null);
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render children as they are', () => {
    const element = render(
      <BrContainerNoMarkup {...props}>
        <a />
        <b />
      </BrContainerNoMarkup>,
    );

    const a = element.container.querySelector('a');
    const b = element.container.querySelector('b');

    expect(element.container.childNodes.item(0).isEqualNode(a)).toBe(true);
    expect(element.container.childNodes.item(1).isEqualNode(b)).toBe(true);
    expect(element.asFragment()).toMatchSnapshot();
  });
});
