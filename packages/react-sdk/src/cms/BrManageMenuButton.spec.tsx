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
import { Menu, MetaCollection, Page } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrManageMenuButton } from './BrManageMenuButton';
import { withContextProvider } from '../utils/withContextProvider';

describe('BrManageMenuButton', () => {
  const context = {
    isPreview: jest.fn(),
    getButton: jest.fn(),
  } as unknown as jest.Mocked<Page>;
  let props: React.ComponentProps<typeof BrManageMenuButton>;

  beforeEach(() => {
    jest.restoreAllMocks();

    props = { menu: {} as Menu };

    (BrManageMenuButton as any).contextTypes = {
      isPreview: () => null,
      getButton: () => null,
    };
    delete (BrManageMenuButton as Partial<typeof BrManageMenuButton>).contextType;
  });

  it('should only render in preview mode', () => {
    context.isPreview.mockReturnValueOnce(false);
    const element = render(withContextProvider(context, <BrManageMenuButton {...props} />));

    expect(element.container.firstChild).toBe(null);
  });

  it('should render a menu-button meta-data', () => {
    const meta = {} as MetaCollection;
    (props as any).menu = {} as Menu;
    context.isPreview.mockReturnValueOnce(true);
    context.getButton.mockReturnValueOnce(meta);
    render(withContextProvider(context, <BrManageMenuButton {...props} />));

    expect(context.getButton).toBeCalledWith(expect.any(String), props.menu);
  });
});
