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
  <span v-if="meta && meta.length > 0" style="display: none;" ref="head"/>
  <slot/>
  <span v-if="meta && meta.length > 0" style="display: none;" ref="tail"/>
</template>

<script setup lang="ts">
import type { MetaCollection } from '@bloomreach/spa-sdk';
import { getCurrentInstance, onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, ref, watch } from 'vue';

const props = defineProps<{ meta?: MetaCollection }>();
const meta = ref(props.meta);
let clear: ReturnType<MetaCollection['render']> | undefined;

const head = ref<HTMLSpanElement>();
const tail = ref<HTMLSpanElement>();

const inject = () => {
  if (!head.value?.nextSibling || !tail.value) {
    return;
  }

  clear = meta.value?.render(head.value.nextSibling, tail.value);
};

watch(meta, () => getCurrentInstance()?.proxy?.$forceUpdate(), { deep: false });
onMounted(() => inject());
onUpdated(() => inject());
onBeforeUnmount(() => clear?.());
onBeforeUpdate(() => clear?.());
</script>
