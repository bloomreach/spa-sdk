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
  <br-node-component v-if="state || configuration.NBRMode" :component="root">
    <slot :component="root" :page="state"/>
  </br-node-component>
</template>

<script setup lang="ts">
import BrNodeComponent from '@/BrNodeComponent.vue';
import { mapping$, page$ } from '@/providerKeys';
import type { Component, Configuration, Page, PageModel } from '@bloomreach/spa-sdk';
import { destroy, initialize } from '@bloomreach/spa-sdk';
import { computed, onMounted, onServerPrefetch, onUnmounted, onUpdated, provide, ref, toRefs, watch } from 'vue';
import type { BrMapping } from '../typings';

function destroyPage() {
  if (state.value) {
    destroy(state.value);
  }
}

const props = defineProps<{
  page?: Page | PageModel,
  configuration: Configuration,
  mapping: BrMapping,
}>();
const { configuration, mapping } = toRefs(props);
const state = ref<Page>();
let loading: Promise<Page> | null = null;

provide(page$, state);
provide(mapping$, mapping);

watch(configuration, async (current, previous) => {
  if (!previous && props.page) {
    state.value = await initialize(current, props.page);
    return;
  }

  destroyPage();
  loading = initialize(current);
  state.value = await loading;
  loading = null;
}, { deep: true, immediate: true });

onUnmounted(() => {
  destroyPage();
});

onMounted(() => {
  state.value?.sync();
});

onUpdated(() => {
  state.value?.sync();
});

onServerPrefetch(async () => {
  await loading;
});

const root = computed<Component | undefined>(() => state.value?.getComponent());
</script>
