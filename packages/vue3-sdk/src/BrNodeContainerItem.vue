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
  <component
    :is="mapping[componentType]"
    v-if="componentType && componentType in mapping"
    :component="passedComponent"
    :page="page"
  />

  <component
    :is="mapping[TYPE_CONTAINER_ITEM_UNDEFINED]"
    v-else-if="TYPE_CONTAINER_ITEM_UNDEFINED in mapping"
    :component="passedComponent"
    :page="page"
  />

  <br-container-item-undefined v-else-if="passedComponent" :component="passedComponent"/>
</template>

<script setup lang="ts">
import { component$, mapping$, page$ } from '@/providerKeys';
import type { Component, ContainerItem } from '@bloomreach/spa-sdk';
import { TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import type { Ref } from 'vue';
import { computed, inject, onUnmounted, ref, watch } from 'vue';
import BrContainerItemUndefined from '@/BrContainerItemUndefined.vue';

const page = inject(page$)!;
const mapping = inject(mapping$)!;
const component = inject<Ref<ContainerItem>>(component$)!;
const componentType = computed(() => component.value.getType());
let unsubscribe: ReturnType<ContainerItem['on']>;

function shallowClone(value: ContainerItem): ContainerItem {
  const cloned = Object.create(Object.getPrototypeOf(value));
  return Object.assign(cloned, value);
}

// Need to create a new object on every change of container item internals
// or the unref`ed object reference in the template wont change and the 'component' props
// will not trigger updates in child components
// https://vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-in-templates
// https://vuejs.org/api/reactivity-utilities.html#unref
const passedComponent = ref<ContainerItem>(component.value);
const updateHook = () => {
  passedComponent.value = shallowClone(component.value);
  page.value.sync();
};
onUnmounted(() => unsubscribe?.());

watch(
  component,
  () => {
    unsubscribe?.();
    unsubscribe = component.value.on('update', updateHook);
  }, { immediate: true, deep: true },
);
</script>
