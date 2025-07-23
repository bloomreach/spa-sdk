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

import { Configuration, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import React, { useEffect, useState } from 'react';
import { BrMappingContext, BrNode } from '../component';
import { BrPageContext } from './BrPageContext';

interface BrPageProps {
  /**
   * The configuration of the SPA SDK.
   * @see https://www.npmjs.com/package/@bloomreach/spa-sdk#configuration
   */
  configuration: Configuration;

  /**
   * The brXM and React components mapping.
   */
  mapping: React.ContextType<typeof BrMappingContext>;

  /**
   * The pre-initialized page instance or prefetched page model.
   * Mostly this property should be used to transfer state from the server-side to the client-side.
   */
  // eslint-disable-next-line react/require-default-props
  page?: Page | PageModel;
}

/**
 * @typedef {Object} BrPageProps
 * @property {Configuration} configuration The configuration of the SPA SDK.
 * @property {Object} mapping The brXM and React components mapping.
 * @property {Page | PageModel | undefined} page The pre-initialized page instance or prefetched page model.
 * Mostly this property should be used to transfer state from the server-side to the client-side.
 */

/**
 * The brXM page.
 */
export function BrPage({
  configuration,
  mapping,
  page: initialPage,
  children,
}: React.PropsWithChildren<BrPageProps>): React.ReactElement | null {
  const [page, setPage] = useState<Page | undefined>(() => {
    return initialPage ? initialize(configuration, initialPage) : undefined;
  });

  useEffect(() => {
    // This flag prevents state updates if the component unmounts during an async operation.
    let isMounted = true;

    const initializePage = async (): Promise<void> => {
      // If a page model is provided (e.g., from SSR), initialize synchronously.
      // Otherwise, fetch the page model asynchronously from the Page Model API.
      const newPage = initialPage ? initialize(configuration, initialPage) : await initialize(configuration);

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

  return (
    <BrPageContext.Provider value={page}>
      <BrMappingContext.Provider value={mapping}>
        {!page && !configuration.NBRMode && null}
        {(page || configuration.NBRMode) && (
          <BrNode component={page?.getComponent()}>{children}</BrNode>
        )}
      </BrMappingContext.Provider>
    </BrPageContext.Provider>
  );
}
