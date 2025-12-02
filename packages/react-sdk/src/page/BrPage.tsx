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

import { Component, Configuration, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import React, { useEffect, useState } from 'react';
import { BrNode } from '../component';
import type { BrMapping } from '../component';

/**
 * Render props pattern interface for BrPage component.
 * Allows child functions to receive page, mapping, and component data
 * as function parameters for flexible rendering patterns.
 */
export interface BrPageRenderProps {
  /**
   * The current page instance from the Bloomreach Page Model API.
   */
  page: Page;

  /**
   * Component mapping object that defines how brXM component types
   * are mapped to React components. Used for dynamic component resolution
   * during page rendering.
   */
  mapping: BrMapping;

  /**
   * The root component of the current page.
   * Represents the top-level container component that holds
   * all page content and layout structure.
   */
  component: Component;
}

export interface BrPageProps {
  /**
   * The configuration of the SPA SDK.
   * @see https://www.npmjs.com/package/@bloomreach/spa-sdk#configuration
   */
  configuration: Configuration;

  /**
   * The brXM and React components mapping.
   */
  mapping: BrMapping;

  /**
   * The pre-initialized page instance or prefetched page model.
   * Mostly this property should be used to transfer state from the server-side to the client-side.
   */
  page?: Page | PageModel;

  /**
   * Child components or render function that receives page, component, and mapping data.
   * Supports both regular React children and render props pattern for accessing page data.
   * In NBRMode, also supports simple functions that return React components without requiring parameters.
   */
  children?: React.ReactNode | ((props: BrPageRenderProps) => React.ReactNode) | (() => React.ReactNode);
}

/**
 * Client-side implementation for BrPage that handles lifecycle and syncing.
 * For backwards compatibility
 */
export function BrPage({
  configuration,
  mapping,
  page: initialPage,
  children,
}: BrPageProps): React.ReactElement | null {
  const [page, setPage] = useState<Page | undefined>(() => {
    return initialPage ? initialize(configuration, initialPage as PageModel) : undefined;
  });

  useEffect(() => {
    // This flag prevents state updates if the component unmounts during an async operation.
    let isMounted = true;

    const initializePage = async (): Promise<void> => {
      // If a page model was provided (e.g., from server), initialize synchronously without fetching.
      // Otherwise, fetch on the client (e.g., NBRMode or client-only scenarios).
      const newPage = initialPage
        ? initialize(configuration, initialPage as PageModel)
        : await initialize(configuration);

      if (isMounted) {
        setPage(newPage);
      }
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, [configuration, initialPage]);

  useEffect(() => {
    page?.sync();
  }, [page]);

  // In NBRMode, render children even if page is not loaded yet
  // Otherwise, wait for page to be loaded
  if (!page) {
    if (configuration.NBRMode) {
      const regularChildren = typeof children === 'function' ? undefined : (children as React.ReactNode);
      return <>{regularChildren}</>;
    }

    return null;
  }

  const component = page.getComponent();

  const renderedChildren = typeof children === 'function'
    ? (children as (props: BrPageRenderProps) => React.ReactNode)({ page, component, mapping: mapping as BrMapping })
    : children;

  return (
    <BrNode page={page} mapping={mapping as BrMapping} component={component}>
      {renderedChildren}
    </BrNode>
  );
}
