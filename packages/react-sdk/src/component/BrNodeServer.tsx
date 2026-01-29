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
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { BrNodeComponentServer } from './BrNodeComponentServer';
import { BrNodeContainerItemServer } from './BrNodeContainerItemServer';
import { BrNodeContainerServer } from './BrNodeContainerServer';
import type { BrNodeProps } from './BrNode';

/**
 * Core node component for rendering brXM components with prop drilling.
 */
export function BrNodeServer({
  children,
  component,
  page,
  mapping,
}: BrNodeProps): React.ReactElement {
  if (React.Children.count(children)) {
    return (
      <>
        {children}
      </>
    );
  }

  const props = {
    page,
    mapping,
  };

  // Pass down all props to child components
  const childrenList = component
    .getChildren()
    .map((child) => (
      <BrNodeServer key={child.getId()} component={child} {...props} />
    ));

  if (isContainer(component)) {
    return (
      <BrNodeContainerServer component={component} {...props}>
        {childrenList}
      </BrNodeContainerServer>
    );
  }

  if (isContainerItem(component)) {
    return (
      <BrNodeContainerItemServer component={component} {...props}>
        {childrenList}
      </BrNodeContainerItemServer>
    );
  }

  return (
    <BrNodeComponentServer component={component} {...props}>
      {childrenList}
    </BrNodeComponentServer>
  );
}
