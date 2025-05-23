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
import { BrMeta } from '../meta';
import { BrMappingContext } from './BrMappingContext';
import { BrProps } from './BrProps';

export class BrNodeComponent<T extends Component> extends React.Component<React.PropsWithChildren<BrProps<T>>> {
  static contextType = BrMappingContext;

  context!: React.ContextType<typeof BrMappingContext>;

  protected getMapping(): React.ComponentType<BrProps> | undefined {
    return this.props.component && (this.context[this.props.component.getName()] as React.ComponentType<BrProps>);
  }

  render(): React.ReactNode {
    const mapping = this.getMapping();
    const meta = this.props.component?.getMeta();

    const children = mapping ? React.createElement(mapping, this.props) : this.props.children;

    return React.createElement(BrMeta, { meta }, children);
  }
}
