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

import { Component, Page } from '@bloomreach/spa-sdk';
import React from 'react';
import { BrNode } from './BrNode';
import { BrProps, BrMapping } from './BrProps';

/**
 * Render props pattern interface for BrComponent component.
 * Allows child functions to receive page, mapping, and component data
 * as function parameters for flexible rendering patterns.
 */
export interface BrComponentRenderProps extends BrProps<Component> {
  /**
   * The specific brXM component instance for the current iteration.
   * Contains component-specific data, configuration, and metadata.
   */
  component: Component;

  /**
   * Whether the component is rendered as a client component.
   */
  isClientComponent: boolean;
}

export interface BrComponentProps extends BrProps<Component> {
  /**
   * The path to a component.
   * The path is defined as a slash-separated components name chain
   * relative to the current component (e.g. `main/container`).
   * If it is omitted, all the children will be rendered.
   */
  path?: string;

  /**
   * The brXM component instance containing component-specific data,
   * configuration, and metadata from the Bloomreach Experience Manager.
   */
  component: Component;

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
      <BrNode
        key={comp.getId()}
        component={comp}
        page={page}
        mapping={mapping}
      >
        {typeof children === 'function' ? children({
          page,
          component: comp,
          mapping,
          isClientComponent: true,
        }) : children}
      </BrNode>
    ));
  }

  return <>{renderComponents()}</>;
}
