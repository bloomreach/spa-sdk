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
import type { BrProps } from './BrProps';

/**
 * Node component for rendering brXM components with prop-based mapping resolution.
 */
export function BrNodeComponentServer<T extends Component>(
  props: React.PropsWithChildren<BrProps<T>>,
): React.ReactElement {
  const { component, mapping, children } = props;

  const componentName = component?.getName();
  const resolvedMapping = component && componentName && (mapping[componentName] as React.ComponentType<BrProps>);
  const content = resolvedMapping
    ? React.createElement(resolvedMapping, { ...props, isClientComponent: false })
    : children;

  return (content as React.ReactElement);
}
