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
  <br-node-component v-if="page || configuration.NBRMode" :component="root">
    <slot :component="root" :page="page"/>
  </br-node-component>
</template>

<script setup lang="ts">
import BrNodeComponent from '@/BrNodeComponent.vue';
import { mapping$, page$ } from '@/providerKeys';
import type { Configuration, Page, PageModel } from '@bloomreach/spa-sdk';
import { destroy, initialize } from '@bloomreach/spa-sdk';
import {
  computed,
  onMounted,
  onServerPrefetch,
  onUnmounted,
  onUpdated,
  provide,
  ref,
  toRaw,
  toRefs,
  watch,
} from 'vue';
import type { BrMapping } from '../typings';

function destroyPage() {
  if (page.value) {
    destroy(page.value);
  }
}

const props = defineProps<{
  page?: Page | PageModel,
  configuration: Configuration,
  mapping: BrMapping,
}>();
const { configuration, mapping } = toRefs(props);
const page = ref<Page | undefined>();
const root = computed(() => page.value?.getComponent());
let loading: Promise<Page> | null = null;

provide(page$, page);
provide(mapping$, mapping);

watch(configuration, async (current, previous) => {
  if (!previous && props.page) {
    page.value = initialize(current, props.page);
    return;
  }

  destroyPage();
  loading = initialize(current);
  page.value = await loading;
  loading = null;
}, { deep: true, immediate: true });

onMounted(() => {
  const sdkPage = toRaw(page.value);
  sdkPage?.sync();
});
onUpdated(() => {
  const sdkPage = toRaw(page.value);
  sdkPage?.sync();
});
onUnmounted(() => destroyPage());
onServerPrefetch(async () => await loading);
</script>
