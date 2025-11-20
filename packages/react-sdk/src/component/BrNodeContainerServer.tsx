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
import {
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import { BrProps } from './BrProps';
import {
  BrContainerBox,
  BrContainerInline,
  BrContainerNoMarkup,
  BrContainerOrderedList,
  BrContainerUnorderedList,
} from '../cms';
import type { BrContainerProps } from './BrNodeContainer';

/**
 * Node container component for rendering brXM container components with prop-based mapping.
 */
export function BrNodeContainerServer(props: BrContainerProps): React.ReactElement {
  const { component, mapping, children } = props;

  const getMapping = (): React.ComponentType<BrProps> => {
    const type = component.getType();

    if (type && type in mapping) {
      return mapping[type] as React.ComponentType<BrProps>;
    }

    switch (type) {
      case TYPE_CONTAINER_INLINE:
        return BrContainerInline;
      case TYPE_CONTAINER_NO_MARKUP:
        return BrContainerNoMarkup;
      case TYPE_CONTAINER_ORDERED_LIST:
        return BrContainerOrderedList;
      case TYPE_CONTAINER_UNORDERED_LIST:
        return BrContainerUnorderedList;
      default:
        return BrContainerBox;
    }
  };

  const containerMapping = getMapping();
  const content = containerMapping ? React.createElement(containerMapping, props) : children;

  return (content as React.ReactElement);
}
