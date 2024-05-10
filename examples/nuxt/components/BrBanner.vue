<!--
  Copyright 2024 Bloomreach

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
  <div v-if="document" class="jumbotron mb-3" :class="{ 'has-edit-button': isPreview }">
    <br-manage-content-button
        :content="document"
        document-template-query="new-banner-document"
        folder-template-query="new-banner-folder"
        parameter="document"
        root="banners"
        picker-selectable-node-types="best:banner,hap:bannerdocument"
        :relative="true"
    />
    <h1 v-if="data?.title">{{ data.title }}</h1>
    <img v-if="image" class="img-fluid" :src="image.getOriginal()?.getUrl()" :alt="data?.title" />
    <div v-if="html" v-html="html"/>
    <p v-if="link" className="lead">
      <router-link :to="link.getUrl()" class="btn btn-primary btn-lg" role="button">Learn more</router-link>
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { Component, Document, ImageSet, Page } from '@bloomreach/spa-sdk';
import { sanitize } from '~/utils/sanitize';

const props = defineProps<{
  component: Component,
  page: Page
}>();

const documentRef = computed(() => props.component.getModels<DocumentModels>().document);
const document = computed(() => documentRef.value && props.page.getContent<Document>(documentRef.value));
const data = computed(() => document.value?.getData<DocumentData>());
const image = computed(() => data.value?.image && props.page.getContent<ImageSet>(data.value?.image));
const link = computed(() => data.value?.link && props.page.getContent<Document>(data.value?.link));
const isPreview = computed(() => props.page.isPreview());
const html = ref<string | null>();
watch(documentRef, () => {
  if (data.value?.content) {
    html.value = props.page.rewriteLinks(sanitize(data.value.content.value));
  }
}, { immediate: true });
</script>
