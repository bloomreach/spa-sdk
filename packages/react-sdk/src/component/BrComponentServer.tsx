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
import React from 'react';
import { BrNodeServer } from './BrNodeServer';
import type { BrComponentProps } from './BrComponent';

/**
 * The brXM component with prop-based data access.
 */
export function BrComponentServer({
  path,
  children,
  component,
  page,
  mapping,
}: BrComponentProps): React.ReactElement {
  function getComponents(): Component[] {
    // If no path was provided render all the components children
    if (!path) {
      return component.getChildren();
    }

    const targetComponent = component.getComponent(...path.split('/'));
    // If the provided path did not result in a component in this tree render nothing
    return targetComponent ? [targetComponent] : [];
  }

  function renderComponents(): React.ReactElement[] {
    return getComponents().map((comp) => (
      <BrNodeServer
        key={comp.getId()}
        component={comp}
        page={page}
        mapping={mapping}
      >
        {typeof children === 'function' ? children({
          page,
          component: comp,
          mapping,
          isClientComponent: false,
        }) : children}
      </BrNodeServer>
    ));
  }

  return <>{renderComponents()}</>;
}
