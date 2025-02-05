<!--
  Copyright 2023-2025 Bloomreach

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
  <br-meta :meta="meta" :key="component?.getId()">
    <component
      v-if="containerType && containerType in mapping"
      :is="mapping[containerType]"
      :component="component"
      :page="page">
      <slot/>
    </component>

    <br-container-inline
      v-else-if="containerType === TYPE_CONTAINER_INLINE"
      :component="component"
      :page="page">
      <slot/>
    </br-container-inline>

    <br-container-no-markup
      v-else-if="containerType === TYPE_CONTAINER_NO_MARKUP"
      :component="component"
      :page="page">
      <slot/>
    </br-container-no-markup>

    <br-container-ordered-list
      v-else-if="containerType === TYPE_CONTAINER_ORDERED_LIST"
      :component="component"
      :page="page">
      <slot/>
    </br-container-ordered-list>

    <br-container-unordered-list
      v-else-if="containerType === TYPE_CONTAINER_UNORDERED_LIST"
      :component="component"
      :page="page">
      <slot/>
    </br-container-unordered-list>

    <br-container-box
      v-else
      :component="component"
      :page="page">
      <slot/>
    </br-container-box>
  </br-meta>
</template>

<script setup lang="ts">
import { component$, mapping$, page$ } from '@/providerKeys';
import type { Container } from '@bloomreach/spa-sdk';
import {
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import type { Ref } from 'vue';
import { computed, inject } from 'vue';
import type { BrMapping } from '../typings';
import BrMeta from './BrMeta.vue';
import BrContainerBox from './BrContainerBox.vue';
import BrContainerInline from './BrContainerInline.vue';
import BrContainerNoMarkup from './BrContainerNoMarkup.vue';
import BrContainerOrderedList from './BrContainerOrderedList.vue';
import BrContainerUnorderedList from './BrContainerUnorderedList.vue';

const page = inject(page$);
const component = inject<Ref<Container>>(component$);
const mapping = inject(mapping$) as Ref<BrMapping>;
const containerType = computed(() => component?.value?.getType());
const meta = computed(() => component?.value?.getMeta());
</script>
