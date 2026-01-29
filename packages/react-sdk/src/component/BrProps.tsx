/*
 * Copyright 2019-2026 Bloomreach
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
 * The mapped component properties for Bloomreach React SDK components.
 */
export interface BrProps<T extends Component = Component> {
  /**
   * The brXM component instance containing component-specific data,
   * configuration, and metadata from the Bloomreach Experience Manager.
   */
  component?: T;

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

  /**
   * Whether the component is rendered as a client component.
   */
  isClientComponent?: boolean;
}
