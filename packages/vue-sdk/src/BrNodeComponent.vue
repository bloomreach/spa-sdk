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
  <br-meta :meta="meta" :key="componentRef?.getId()">
    <slot>
      <br-node-container-item v-if="isContainerItem(componentRef)"/>

      <br-node-container v-else-if="isContainer(componentRef)">
        <br-node-component v-for="child in children" :key="(child as Component).getId()" :component="child"/>
      </br-node-container>

      <component v-else-if="name && name in mapping" :is="mapping[name]" :component="componentRef" :page="page"/>

      <br-node-component v-else v-for="child in children" :key="(child as Component).getId()" :component="child"/>
    </slot>
  </br-meta>
</template>

<script setup lang="ts">
import BrMeta from '@/BrMeta.vue';
import BrNodeContainer from '@/BrNodeContainer.vue';
import BrNodeContainerItem from '@/BrNodeContainerItem.vue';
import { component$, mapping$, page$ } from '@/providerKeys';
import type { Component } from '@bloomreach/spa-sdk';
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { computed, inject, provide, toRefs } from 'vue';

const props = defineProps<{ component: Component | undefined }>();
const { component: componentRef } = toRefs(props);
const page = inject(page$);
const mapping = inject(mapping$)!;

const children = computed(() => componentRef?.value?.getChildren());
const meta = computed(() => componentRef?.value?.getMeta());
const name = computed(() => componentRef?.value?.getName());

provide(component$, componentRef);
</script>
