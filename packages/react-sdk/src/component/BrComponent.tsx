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
import { BrNode } from './BrNode';
import { BrComponentProps as BrCoreComponentProps, BrComponentRenderProps } from './BrProps';

interface BrComponentProps extends BrCoreComponentProps {
  /**
   * The path to a component.
   * The path is defined as a slash-separated components name chain
   * relative to the current component (e.g. `main/container`).
   * If it is omitted, all the children will be rendered.
   */
  path?: string;

  /**
   * Child components or render function that receives page, component, and mapping data.
   * Supports both regular React children and render props pattern for accessing component data.
   */
  children?: React.ReactNode | ((props: BrComponentRenderProps) => React.ReactNode);
}

/**
 * The brXM component with prop-based data access.
 */
export function BrComponent({
  path,
  children,
  component,
  page,
  mapping,
}: BrComponentProps): React.ReactElement {
  function getComponents(): Component[] {
    if (!component || Object.keys(component).length === 0) {
      return [];
    }
    if (!path) {
      return component.getChildren();
    }

    const targetComponent = component.getComponent(...path.split('/'));
    return targetComponent ? [targetComponent] : [];
  }

  function renderComponents(): React.ReactElement[] {
    return getComponents().map((comp) => (
      <BrNode
        key={comp.getId()}
        component={comp}
        page={page}
        mapping={mapping}
      >
        {typeof children === 'function'
          ? children({ page, component: comp, mapping })
          : children}
      </BrNode>
    ));
  }

  return <>{renderComponents()}</>;
}
