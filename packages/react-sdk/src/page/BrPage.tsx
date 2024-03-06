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

import { Configuration, destroy, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import React from 'react';
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
export function BrPage(props: React.PropsWithChildren<BrPageProps>): JSX.Element | null {
  const { page, configuration, mapping, children } = props;
  const pageDerivedFromProps = React.useMemo<Page | undefined>(() => page && initialize(configuration, page), [page, configuration]);
  const [pageInState, setPageInState] = React.useState<Page | undefined>(pageDerivedFromProps);

  const initializePageInState = React.useCallback<() => Promise<void>>(async () => {
    try {
      const initializedPage = await initialize(configuration);
      setPageInState(initializedPage);
    } catch (error) {
      setPageInState(() => { throw error; });
    }
  }, [configuration]);

  React.useEffect(() => {
    if (!pageDerivedFromProps) {
      initializePageInState();
    } else if (pageInState !== pageDerivedFromProps) {
      setPageInState(pageDerivedFromProps);
    }
  }, [pageDerivedFromProps]);

  React.useEffect(() => {
    pageInState?.sync();

    return () => {
      if (pageInState) {
        destroy(pageInState);
      }
    };
  }, [pageInState]);

  return (
    <BrPageContext.Provider value={pageInState}>
      <BrMappingContext.Provider value={mapping}>
        {!pageInState && !configuration.NBRMode && null}
        {(pageInState || configuration.NBRMode) && <BrNode component={pageInState?.getComponent()}>{children}</BrNode>}
      </BrMappingContext.Provider>
    </BrPageContext.Provider>
  );
}
