/*
 * Copyright 2019 Bloomreach
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
import { shallow } from 'enzyme';
import { Container, Page } from '@bloomreach/spa-sdk';
import { BrContainerInline } from './BrContainerInline';

describe('BrContainerInline', () => {
  const props = {
    component: {} as jest.Mocked<Container>,
    page: { isPreview: jest.fn() } as unknown as jest.Mocked<Page>,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render itself as div element', () => {
    const wrapper = shallow(<BrContainerInline {...props} />);

    expect(wrapper.equals(<div />)).toBe(true);
  });

  it('should render children as span elements', () => {
    const wrapper = shallow(
      <BrContainerInline {...props}>
        <a />
        <b />
      </BrContainerInline>,
    );

    expect(
      wrapper.equals(
        <div>
          <span>
            <a />
          </span>
          <span>
            <b />
          </span>
        </div>,
      ),
    ).toBe(true);
  });

  it('should render preview classes', () => {
    props.page.isPreview.mockReturnValue(true);

    const wrapper = shallow(
      <BrContainerInline {...props}>
        <a />
        <b />
      </BrContainerInline>,
    );

    expect(
      wrapper.equals(
        <div className="hst-container">
          <span className="hst-container-item">
            <a />
          </span>
          <span className="hst-container-item">
            <b />
          </span>
        </div>,
      ),
    ).toBe(true);
  });
});
