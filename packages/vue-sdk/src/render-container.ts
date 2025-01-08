/*
 * Copyright 2023-2025 Bloomreach
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

import { page$ } from '@/providerKeys';
import type { VNode } from 'vue';
import { computed, h, inject, useSlots } from 'vue';

export function useRenderContainer(
  containerTag: string,
  containerItemTag: string,
) {
  const page = inject(page$);
  const isPreview = computed(() => page?.value?.isPreview());

  const getChildNodes = () => {
    const slots = useSlots();
    const slotDefaultRootNode = slots.default!()[0];
    const rootNodeChildren = slotDefaultRootNode.children as VNode[] | undefined;
    const containerItems = rootNodeChildren?.[0]?.children;

    return (containerItems as VNode[] | undefined)
      ?.map((node) => h(
        containerItemTag,
        { class: { 'hst-container-item': isPreview } },
        [node],
      ));
  };

  return () => h(
    containerTag,
    { class: { 'hst-container': isPreview } },
    getChildNodes(),
  );
}
