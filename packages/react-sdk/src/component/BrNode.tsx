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
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { BrMeta } from '../meta';
import { BrNodeContainer } from './BrNodeContainer';
import { BrNodeContainerItem } from './BrNodeContainerItem';
import { BrNodeComponent } from './BrNodeComponent';
import { BrComponentProps } from './BrProps';

type BrNodeProps = BrComponentProps

/**
 * Core node component for rendering brXM components with prop drilling.
 */
export function BrNode({
  children,
  component,
  page,
  mapping,
}: React.PropsWithChildren<BrNodeProps>): React.ReactElement {
  function renderNode(): React.ReactElement | React.ReactNode {
    if (React.Children.count(children)) {
      return <BrMeta meta={component?.getMeta()}>{children}</BrMeta>;
    }

    // Pass down all props to child components
    const childrenList = component?.getChildren().map((child) => (
      <BrNode
        key={child.getId()}
        component={child}
        page={page}
        mapping={mapping}
      />
    ));

    if (isContainer(component)) {
      return (
        <BrNodeContainer component={component} page={page} mapping={mapping}>
          {childrenList}
        </BrNodeContainer>
      );
    }

    if (isContainerItem(component)) {
      return (
        <BrNodeContainerItem component={component} page={page} mapping={mapping}>
          {childrenList}
        </BrNodeContainerItem>
      );
    }

    return (
      <BrNodeComponent component={component} page={page} mapping={mapping}>
        {childrenList}
      </BrNodeComponent>
    );
  }

  return <>{renderNode()}</>;
}
