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

import { Configuration, destroy, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import React, { useEffect, useRef, useState } from 'react';
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
 * Custom hook for managing Page lifecycle and state.
 * Handles async initialization, props changes, and cleanup.
 */
function usePage(
  configuration: Configuration,
  initialPage?: Page | PageModel,
): Page | undefined {
  const [page, setPage] = useState<Page | undefined>(undefined);
  const pageRef = useRef<Page | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const initializePage = async (): Promise<void> => {
      let newPage: Page;
      if (initialPage) {
        newPage = initialize(configuration, initialPage);
      } else {
        newPage = await initialize(configuration);
      }

      if (isMounted) {
        pageRef.current = newPage;
        setPage(newPage);
      } else {
        destroy(newPage);
      }
    };

    initializePage();

    return () => {
      isMounted = false;
      if (pageRef.current) {
        destroy(pageRef.current);
        pageRef.current = undefined;
      }
    };
  }, [configuration, initialPage]);

  useEffect(() => {
    if (page) {
      page.sync();
    }
  }, [page]);

  return page;
}

/**
 * The brXM page.
 */
export function BrPage({
  configuration,
  mapping,
  page: initialPage,
  children,
}: React.PropsWithChildren<BrPageProps>): React.ReactElement | null {
  const page = usePage(configuration, initialPage);

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
