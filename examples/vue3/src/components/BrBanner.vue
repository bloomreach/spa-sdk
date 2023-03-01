<!--
  - Copyright 2020-2023 Bloomreach
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -   https://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <div v-if="document" class="jumbotron mb-3" :class="{ 'has-edit-button': page.isPreview() }">
    <br-manage-content-button
      :content="document"
      document-template-query="new-banner-document"
      folder-template-query="new-banner-folder"
      parameter="document"
      root="banners"
      picker-selectable-node-types="best:banner,hap:bannerdocument"
      :relative="true"
    />
    <h1 v-if="data.title">{{ data.title }}</h1>
    <img v-if="image" class="img-fluid" :src="image.getOriginal().getUrl()" :alt="data.title" />
    <div v-if="html" v-html="html" />
    <p v-if="link" className="lead">
      <router-link :to="link.getUrl()" class="btn btn-primary btn-lg" role="button">Learn more</router-link>
    </p>
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
const link = data?.link && page.getContent<Document>(data.link);
const html = await page.prepareHTML(documentRef, 'content');
</script>
