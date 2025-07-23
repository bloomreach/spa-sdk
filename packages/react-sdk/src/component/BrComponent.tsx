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

import { Component } from '@bloomreach/spa-sdk';
import React, { useContext } from 'react';
import { BrComponentContext } from './BrComponentContext';
import { BrNode } from './BrNode';

interface BrComponentProps {
  /**
   * The path to a component.
   * The path is defined as a slash-separated components name chain
   * relative to the current component (e.g. `main/container`).
   * If it is omitted, all the children will be rendered.
   */
  // eslint-disable-next-line react/require-default-props
  path?: string;
}

/**
 * The brXM component.
 */
export function BrComponent({ path, children }: React.PropsWithChildren<BrComponentProps>): React.ReactElement {
  const context = useContext(BrComponentContext);

  function getComponents(): Component[] {
    if (!context || Object.keys(context).length === 0) {
      return [];
    }
    if (!path) {
      return context.getChildren();
    }

    const component = context.getComponent(...path.split('/'));

    return component ? [component] : [];
  }

  function renderComponents(): React.ReactElement[] {
    return getComponents().map((component, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <BrNode key={index} component={component}>
        {children}
      </BrNode>
    ));
  }

  return <>{renderComponents()}</>;
}
