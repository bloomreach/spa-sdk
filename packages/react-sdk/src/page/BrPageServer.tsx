/*
 * Copyright 2025-2026 Bloomreach
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

import { Page, initialize } from '@bloomreach/spa-sdk';
import React from 'react';
import { BrNodeServer } from '../component';
import type { BrPageProps } from './BrPage';

/**
 * The brXM page component with React Server Components (RSC) support.
 */
export async function BrPageServer(props: BrPageProps): Promise<React.ReactElement | null> {
  const { configuration, mapping, page: initialPage, children } = props;

  let page: Page | undefined;

  if (initialPage) {
    page = initialize(configuration, initialPage);
  } else if (!configuration.NBRMode) {
    page = await initialize(configuration);
  }

  if (!page) {
    return null;
  }

  const component = page.getComponent();

  const renderedChildren = typeof children === 'function'
    ? children({ page, component, mapping, isClientComponent: false })
    : children;

  return (
    <BrNodeServer page={page} mapping={mapping} component={component}>
      {renderedChildren}
    </BrNodeServer>
  );
}
