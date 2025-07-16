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

import React, { useContext } from 'react';
import {
  Container,
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import { BrProps } from './BrProps';
import { BrMappingContext } from './BrMappingContext';
import { BrMeta } from '../meta';
import {
  BrContainerBox,
  BrContainerInline,
  BrContainerNoMarkup,
  BrContainerOrderedList,
  BrContainerUnorderedList,
} from '../cms';

export function BrNodeContainer(props: React.PropsWithChildren<BrProps<Container>>): React.ReactElement {
  const context = useContext(BrMappingContext);
  const { component, children } = props;

  const getMapping = (): React.ComponentType<BrProps> => {
    const type = component?.getType();

    if (type && type in context) {
      return context[type] as React.ComponentType<BrProps>;
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

  const mapping = getMapping();
  const meta = component?.getMeta();
  const content = mapping ? React.createElement(mapping, props) : children;

  return React.createElement(BrMeta, { meta }, content);
}
