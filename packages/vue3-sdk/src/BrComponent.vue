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
  <br-node-component v-for="component in components" :component="component">
    <slot :component="component" :page="page"></slot>
  </br-node-component>
</template>

<script setup lang="ts">
import BrNodeComponent from '@/BrNodeComponent.vue';
import { component$, page$ } from '@/providerKeys';
import type { Component } from '@bloomreach/spa-sdk';
import { isComponent } from '@bloomreach/spa-sdk';
import { computed, inject } from 'vue';

function getComponents(
  parentComponent: Component | undefined,
  propsComponent: Component | string | undefined,
): Component[] {
  if (isComponent(propsComponent)) {
    return [propsComponent];
  }

  if (!parentComponent) {
    return [];
  }

  if (!propsComponent) {
    return parentComponent.getChildren();
  }

  const parentComponents = parentComponent.getComponent(...propsComponent.split('/'));
  return parentComponents ? [parentComponents] : [];
}

const props = defineProps<{ component?: Component | string }>();
const page = inject(page$);
const parent = inject(component$);
const components = computed(() => getComponents(parent?.value, props.component));
</script>
