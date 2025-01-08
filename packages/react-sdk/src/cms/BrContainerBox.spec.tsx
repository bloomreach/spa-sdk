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
import { BrContainerBox } from './BrContainerBox';

describe('BrContainerBox', () => {
  const props = {
    component: {} as jest.Mocked<Container>,
    page: { isPreview: jest.fn() } as unknown as jest.Mocked<Page>,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render itself as div element', () => {
    const element = render(<BrContainerBox {...props} />);

    expect(element.container?.firstChild?.nodeName).toBe('DIV');
    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render children as div elements', () => {
    const element = render(
      <BrContainerBox {...props}>
        <a />
        <b />
      </BrContainerBox>,
    );

    expect(element.asFragment()).toMatchSnapshot();
  });

  it('should render preview classes', () => {
    props.page.isPreview.mockReturnValue(true);

    const element = render(
      <BrContainerBox {...props}>
        <a />
        <b />
      </BrContainerBox>,
    );

    expect(element.container.querySelector('.hst-container')).toBeInTheDocument();
    expect(element.container.querySelector('.hst-container-item')).toBeInTheDocument();
  });
});
