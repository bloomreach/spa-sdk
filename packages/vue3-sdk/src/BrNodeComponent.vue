<!--
  - Copyright 2023 Bloomreach
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -   http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <br-meta :meta="meta">
    <slot>
      <br-node-container-item v-if="isContainerItem(component)"/>

      <br-node-container v-else-if="isContainer(component)">
        <br-node-component v-for="(component, key) in children" :key="key" :component="component"/>
      </br-node-container>

      <component v-else-if="name && name in mapping" :is="mapping[name]" :component="component" :page="page"/>

      <br-node-component v-else v-for="(component, key) in children" :key="key" :component="component"/>
    </slot>
  </br-meta>
</template>

<script setup lang="ts">
import BrMeta from '@/BrMeta.vue';
import BrNodeContainer from '@/BrNodeContainer.vue';
import BrNodeContainerItem from '@/BrNodeContainerItem.vue';
import { component$, mapping$, page$ } from '@/providerKeys';
import type { Component, Page } from '@bloomreach/spa-sdk';
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { inject, provide } from 'vue';
import type { Ref } from 'vue';

const { component } = defineProps<{ component?: Component }>();
const page = inject(page$, {} as Ref<Page>);
const mapping = inject(mapping$, {});
const children = component?.getChildren();
const meta = component?.getMeta();
const name = component?.getName();

provide(component$, component);
</script>
