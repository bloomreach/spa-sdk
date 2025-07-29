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

export type BrMappedComponent =
  | React.ComponentType<BrProps<Component>>
  | React.ComponentType<BrProps<Container>>
  | React.ComponentType<BrProps<ContainerItem>>;

export type BrMapping = Record<keyof any, BrMappedComponent>;

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
export interface BrPageRenderProps {
  /**
   * The current page instance from the Bloomreach Page Model API.
   * May be undefined during initial page loading.
   */
  page?: Page;

  /**
   * Component mapping object that defines how brXM component types
   * are mapped to React components. Used for dynamic component resolution
   * during page rendering.
   */
  mapping: BrMapping;

  /**
   * The root component of the current page, if available.
   * Represents the top-level container component that holds
   * all page content and layout structure.
   */
  component?: Component;
}

/**
 * Render props pattern interface for BrComponent component.
 * Allows child functions to receive page, mapping, and component data
 * as function parameters for flexible rendering patterns.
 */
export interface BrComponentRenderProps {
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
   * The specific brXM component instance for the current iteration.
   * Contains component-specific data, configuration, and metadata.
   */
  component: Component;
}

/**
 * The mapped component properties for Bloomreach React SDK components.
 *
 * This interface requires page and mapping props for React Server Components (RSC)
 * compatibility. Context-based state management has been removed in favor of explicit prop drilling.
 *
 * @since 25.0.0
 */
export type BrProps<T extends Component = Component> = BrComponentProps<T>
