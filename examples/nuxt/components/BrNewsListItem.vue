<!--
  Copyright 2024-2025 Bloomreach

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
  <div class="card mb-3">
    <div class="card-body">
      <br-manage-content-button :content="document" />
      <h2 v-if="data?.title" class="card-title">
        <nuxt-link :to="document?.getUrl() || ''">{{ data.title }}</nuxt-link>
      </h2>
      <div v-if="data?.author" class="card-subtitle mb-3 text-muted">
        {{ data.author }}
      </div>
      <div v-if="data?.date" class="card-subtitle mb-3 small text-muted">
        {{ formatDate(data.date) }}
      </div>
      <p v-if="data?.introduction" class="card-text">
        {{ data.introduction }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '@bloomreach/spa-sdk';
import { formatDate } from '@/utils/dates';

const props = defineProps<{
  document?: Document,
}>();
const { document } = toRefs(props);
const data = computed(() => document?.value?.getData<DocumentData>());
</script>
