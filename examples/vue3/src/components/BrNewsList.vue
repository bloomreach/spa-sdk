<!--
  Copyright 2020-2023 Bloomreach

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
  <div v-if="pageable">
    <br-news-list-item v-for="(item, key) in pageable.items" :key="key" :document="page.getContent(item)" :page="page"/>
    <div v-if="page.isPreview()" class="has-edit-button float-right">
      <br-manage-content-button
        document-template-query="new-news-document"
        folder-template-query="new-news-folder"
        root="news"
      />
    </div>
    <br-news-list-pagination v-if="pageable.showPagination" :pageable="pageable" :page="page"/>
  </div>
</template>

<script setup lang="ts">
import type { Component, Page } from '@bloomreach/spa-sdk';
import { computed, toRefs } from 'vue';
import BrNewsListItem from './BrNewsListItem.vue';
import BrNewsListPagination from './BrNewsListPagination.vue';

const props = defineProps<{
  component: Component,
  page: Page,
}>();
const { page } = toRefs(props);
const pageable = computed(() => props.component.getModels<PageableModels>().pageable);
</script>
