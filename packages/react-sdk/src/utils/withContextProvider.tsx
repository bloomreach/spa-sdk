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

import React, { ReactElement } from 'react';
import { BrPageContext } from '../page';
import { BrComponentContext, BrMappingContext } from '../component';

export const withPageContextProvider = (context?: any, children?: ReactElement): React.ReactElement => {
  if (!context) {
    return children as React.ReactElement;
  }

  return <BrPageContext.Provider value={context}>{children}</BrPageContext.Provider>;
};

export const withMappingContextProvider = (context?: any, children?: ReactElement): React.ReactElement => {
  if (!context) {
    return children as React.ReactElement;
  }

  return (
    <BrMappingContext.Provider value={context}>
      {children}
    </BrMappingContext.Provider>
  );
};

export const withComponentContextProvider = (context?: any, children?: ReactElement): React.ReactElement => {
  if (!context) {
    return children as React.ReactElement;
  }

  return <BrComponentContext.Provider value={context}>{children}</BrComponentContext.Provider>;
};
