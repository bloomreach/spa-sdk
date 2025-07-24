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

import React from 'react';
import { Component, Container, ContainerItem, Page } from '@bloomreach/spa-sdk';

type BrComponent =
  | React.ComponentType<BrProps<Component>>
  | React.ComponentType<BrProps<Container>>
  | React.ComponentType<BrProps<ContainerItem>>;

type BrMapping = Record<keyof any, BrComponent>;

/**
 * Core properties required by all Bloomreach React SDK components.
 * Provides the essential page and mapping data needed for component rendering
 * and interaction with the Bloomreach Experience Manager.
 */
export interface BrCoreProps {
  /**
   * The current page instance from the Bloomreach Page Model API.
   * Contains all page-level data, metadata, and configuration needed
   * for rendering and preview mode integration.
   */
  page: Page;

  /**
   * Component mapping object that defines how brXM component types
   * are mapped to React components. Used for dynamic component resolution
   * during page rendering.
   */
  mapping: BrMapping;
}

/**
 * Properties for components that work with a specific brXM component instance.
 * Extends BrCoreProps with optional component data.
 */
export interface BrComponentProps<T extends Component = Component> extends BrCoreProps {
  /**
   * The brXM component instance containing component-specific data,
   * configuration, and metadata from the Bloomreach Experience Manager.
   */
  component?: T;
}

/**
 * Render props pattern interface for BrPage component.
 * Allows child functions to receive page, mapping, and component data
 * as function parameters for flexible rendering patterns.
 */
export interface BrPageRenderProps extends BrCoreProps {
  /**
   * The root component of the current page, if available.
   * Represents the top-level container component that holds
   * all page content and layout structure.
   */
  component?: Component;
}

/**
 * The mapped component properties.
 * @deprecated Use BrComponentProps instead. This interface will be updated
 * to require page and mapping props in the next major version.
 */
export interface BrProps<T extends Component = Component> {
  /**
   * The mapped component.
   */
  component?: T;

  /**
   * The current page.
   */
  page?: Page;

  /**
   * Component mapping for dynamic component resolution.
   */
  mapping?: BrMapping;
}
