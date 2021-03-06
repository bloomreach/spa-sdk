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
    const wrapper = shallow(<BrContainerNoMarkup {...props} />);

    expect(wrapper.equals(<></>)).toBe(true);
  });

  it('should render children as they are', () => {
    const wrapper = shallow(
      <BrContainerNoMarkup {...props}>
        <a />
        <b />
      </BrContainerNoMarkup>,
    );

    expect(
      wrapper.equals(
        <>
          <a />
          <b />
        </>,
      ),
    ).toBe(true);
  });
});
