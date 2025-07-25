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
import { isContainer, isContainerItem, Component } from '@bloomreach/spa-sdk';
import { BrMeta } from '../meta';
import { BrPageContext } from '../page';
import { BrComponentContext } from './BrComponentContext';
import { BrNodeContainer } from './BrNodeContainer';
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { BrNodeComponent } from './BrNodeComponent';

interface BrNodeProps {
  component?: Component;
}

export function BrNode({ children, component }: React.PropsWithChildren<BrNodeProps>): React.ReactElement {
  const context = useContext(BrPageContext);

  function renderNode(): React.ReactElement | React.ReactNode {
    if (React.Children.count(children)) {
      return <BrMeta meta={component?.getMeta()}>{children}</BrMeta>;
    }

    // eslint-disable-next-line react/no-array-index-key
    const childrenList = component?.getChildren().map((child, index) => <BrNode key={index} component={child} />);

    if (isContainer(component)) {
      return (
        <BrNodeContainer component={component} page={context!}>
          {childrenList}
        </BrNodeContainer>
      );
    }

    if (isContainerItem(component)) {
      return (
        <BrNodeContainerItem component={component} page={context!}>
          {childrenList}
        </BrNodeContainerItem>
      );
    }

    return (
      <BrNodeComponent component={component} page={context!}>
        {childrenList}
      </BrNodeComponent>
    );
  }

  return <BrComponentContext.Provider value={component}>{renderNode()}</BrComponentContext.Provider>;
}
