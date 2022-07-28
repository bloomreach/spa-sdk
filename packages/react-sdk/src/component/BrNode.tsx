/*
 * Copyright 2019-2020 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { isContainer, isContainerItem, Component } from '@bloomreach/spa-sdk';
import { BrMeta } from '../meta';
import { BrPageContext } from '../page/BrPageContext';
import { BrComponentContext } from './BrComponentContext';
import { BrNodeContainer } from './BrNodeContainer';
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { BrNodeComponent } from './BrNodeComponent';

interface BrNodeProps {
  component?: Component;
}

export class BrNode extends React.Component<BrNodeProps> {
  static contextType = BrPageContext;

  context: React.ContextType<typeof BrPageContext>;

  private renderNode(): JSX.Element | React.ReactNode {
    const { children, component } = this.props;

    if (React.Children.count(children)) {
      return <BrMeta meta={component?.getMeta()}>{children}</BrMeta>;
    }

    // eslint-disable-next-line react/no-array-index-key
    const childrenList = component?.getChildren().map((child, index) => <BrNode key={index} component={child} />);

    if (isContainer(component)) {
      return (
        <BrNodeContainer component={component} page={this.context!}>
          {childrenList}
        </BrNodeContainer>
      );
    }

    if (isContainerItem(component)) {
      return (
        <BrNodeContainerItem component={component} page={this.context!}>
          {childrenList}
        </BrNodeContainerItem>
      );
    }

    return (
      <BrNodeComponent component={component} page={this.context!}>
        {childrenList}
      </BrNodeComponent>
    );
  }

  render(): JSX.Element {
    const { component } = this.props;

    return <BrComponentContext.Provider value={component}>{this.renderNode()}</BrComponentContext.Provider>;
  }
}
