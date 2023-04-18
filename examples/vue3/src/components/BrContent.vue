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
  <div v-if="document" :class="{ 'has-edit-button': isPreview }">
    <br-manage-content-button :content="document"/>
    <img v-if="image" class="img-fluid mb-3" :src="image.getOriginal()?.getUrl()" :alt="data?.title"/>
    <h1 v-if="data?.title">{{ data.title }}</h1>
    <p v-if="data?.author" class="mb-3 text-muted">{{ data.author }}</p>
    <p v-if="date" class="mb-3 small text-muted">{{ formatDate(date) }}</p>
    <div v-if="html" v-html="html"/>
  </div>
</template>

<script lang="ts" setup>
import { formatDate } from '@/utils/dates';
import type { Component, Document, ImageSet, Page } from '@bloomreach/spa-sdk';
import { computed } from 'vue';

const props = defineProps<{
  component: Component,
  page: Page
}>();

const documentRef = computed(() => props.component.getModels<DocumentModels>().document);
const document = computed(() => documentRef.value && props.page.getContent<Document>(documentRef.value));
const data = computed(() => document.value?.getData<DocumentData>());
const image = computed(() => data.value?.image && props.page.getContent<ImageSet>(data.value.image));
const date = computed(() => data.value?.date ?? data.value?.publicationDate);
const isPreview = computed(() => props.page.isPreview());
const html = computed(() => props.page.prepareHTML(documentRef.value, 'content'));
</script>
