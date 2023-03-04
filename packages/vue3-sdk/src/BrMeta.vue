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
  <slot />
</template>

<script setup lang="ts">
import type { MetaCollection } from '@bloomreach/spa-sdk';
import {
  getCurrentInstance,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  ref,
  watch,
} from 'vue';

const props = defineProps<{ meta?: MetaCollection }>();
const metaRef = ref(props.meta);
let clear: ReturnType<MetaCollection['render']> | undefined;

const inject = () => {
  const { proxy } = getCurrentInstance()!;
  const el = proxy?.$el as Node;
  clear = el && metaRef?.value?.render(el, el);
};

watch(metaRef, () => {
  const { proxy } = getCurrentInstance()!;
  proxy?.$forceUpdate();
}, { deep: false });

onMounted(() => inject());
onBeforeUpdate(() => clear?.());
onUpdated(() => inject());
onBeforeUnmount(() => clear?.());
</script>
