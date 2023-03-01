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
  <div v-if="document" :class="{ 'has-edit-button': page.isPreview() }">
    <br-manage-content-button :content="document" />
    <img v-if="image" class="img-fluid mb-3" :src="image.getOriginal().getUrl()" :alt="data.title" />
    <h1 v-if="data.title">{{ data.title }}</h1>
    <p v-if="data.author" class="mb-3 text-muted">{{ data.author }}</p>
    <p v-if="date" class="mb-3 small text-muted">{{ formatDate(date) }}</p>
    <div v-if="html" v-html="html" />
  </div>
</template>

<script lang="ts" setup>
import type { Component, Document, ImageSet, Page } from '@bloomreach/spa-sdk';

const { component, page } = defineProps<{
  component: Component,
  page: Page
}>();

const { document: documentRef } = component.getModels<DocumentModels>();
const document = documentRef && page.getContent<Document>(documentRef);
const data = document?.getData<DocumentData>();
const image = data?.image && page.getContent<ImageSet>(data.image);
const date = data?.date ?? data?.publicationDate;
const formatDate = (date: number) => (new Date(date).toDateString());
const html = await page.prepareHTML(documentRef, 'content');
</script>
