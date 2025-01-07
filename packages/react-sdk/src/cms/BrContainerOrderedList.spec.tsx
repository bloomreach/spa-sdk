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
import { Container, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrContainerOrderedList } from './BrContainerOrderedList';

describe('BrContainerOrderedList', () => {
  const props = {
    component: {} as jest.Mocked<Container>,
    page: { isPreview: jest.fn() } as unknown as jest.Mocked<Page>,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render itself as ol element', () => {
    const element = render(<BrContainerOrderedList {...props} />);

    expect(element.container?.firstChild?.nodeName).toBe('OL');
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render children as li elements', () => {
    const element = render(
      <BrContainerOrderedList {...props}>
        <a />
        <b />
      </BrContainerOrderedList>,
    );

    expect(element.container.querySelector('ol')?.firstChild?.nodeName).toBe('LI');
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render preview classes', () => {
    props.page.isPreview.mockReturnValue(true);

    const element = render(
      <BrContainerOrderedList {...props}>
        <a />
        <b />
      </BrContainerOrderedList>,
    );

    expect(element.container.querySelector('.hst-container')?.nodeName).toBe('OL');
    expect(element.container.querySelector('.hst-container-item')?.nodeName).toBe('LI');
    expect(element.asFragment()).toMatchSnapshot();
  });
});
