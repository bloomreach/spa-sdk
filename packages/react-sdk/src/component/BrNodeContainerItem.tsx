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

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ContainerItem, TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { BrContainerItemUndefined } from '../cms';
import { BrProps } from './BrProps';
import { BrMappingContext } from './BrMappingContext';
import { BrMeta } from '../meta';

export function BrNodeContainerItem(
  props: React.PropsWithChildren<BrProps<ContainerItem>>,
): React.ReactElement {
  const context = useContext(BrMappingContext);
  const { component, page, children } = props;
  const [forcedRerenders, setForcedRerenders] = useState(0);

  const onUpdate = useCallback((): void => {
    // Trigger a rerender of this component due to a non-react 3rd party event
    setForcedRerenders((c) => c + 1);
  }, []);

  useEffect(() => {
    component?.on('update', onUpdate);

    return () => {
      component?.off('update', onUpdate);
    };
  }, [component, onUpdate]);

  useEffect(() => {
    // Skip the mount event page sync as BrPage just called it
    if (forcedRerenders > 0) {
      page?.sync();
    }
  }, [page, forcedRerenders]);

  const getMapping = (): React.ComponentType<BrProps> => {
    const type = component?.getType();

    if (type && type in context) {
      return context[type] as React.ComponentType<BrProps>;
    }

    return (
      (context[
        TYPE_CONTAINER_ITEM_UNDEFINED as any
      ] as React.ComponentType<BrProps>) ?? BrContainerItemUndefined
    );
  };

  const mapping = getMapping();
  const meta = component?.getMeta();
  const content = mapping ? React.createElement(mapping, props) : children;

  return React.createElement(BrMeta, { meta }, content);
}
