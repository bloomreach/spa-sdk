<!--
  Copyright 2023 Bloomreach

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  -->

<template>
  <Suspense>
    <component
      :is="mapping[componentType]"
      v-if="componentType && componentType in mapping"
      :component="component"
      :page="page"
    />

    <component
      :is="mapping[TYPE_CONTAINER_ITEM_UNDEFINED]"
      v-else-if="TYPE_CONTAINER_ITEM_UNDEFINED in mapping"
      :component="component"
      :page="page"
    />

    <br-container-item-undefined v-else-if="component" :component="component"/>
  </Suspense>
</template>

<script setup lang="ts">
import { component$, mapping$, page$ } from '@/providerKeys';
import type { ContainerItem } from '@bloomreach/spa-sdk';
import { TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { computed, inject } from 'vue';
import BrContainerItemUndefined from './BrContainerItemUndefined.vue';

const page = inject(page$);
const mapping = inject(mapping$, {});
const component = inject<ContainerItem>(component$);
const componentType = computed(() => component?.getType());
</script>
