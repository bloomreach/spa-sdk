/*
 * Copyright 2025 Bloomreach
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

// This component is RSC-safe in live mode. It subscribes to CMS update events only in preview.

import React from 'react';
import { TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { BrContainerItemUndefined } from '../cms';
import type { BrProps } from './BrProps';
import type { BrContainerItemProps } from './BrNodeContainerItem';

/**
 * Node container item component for rendering brXM container items with prop-based mapping.
 */
export function BrNodeContainerItemServer(
  props: BrContainerItemProps,
): React.ReactElement {
  const { component, mapping, children } = props;

  const getMapping = (): React.ComponentType<BrProps> => {
    const type = component?.getType();

    if (type && type in mapping) {
      return mapping[type] as React.ComponentType<BrProps>;
    }

    return (
      (mapping[
        TYPE_CONTAINER_ITEM_UNDEFINED as any
      ] as React.ComponentType<BrProps>) ?? BrContainerItemUndefined
    );
  };

  const containerItemMapping = getMapping();
  const content = containerItemMapping ? React.createElement(containerItemMapping, props) : children;

  return (content as React.ReactElement);
}
