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
  <br-meta v-if="page && page?.isPreview()" :meta="meta"/>
</template>

<script setup lang="ts">
import { page$ } from '@/providerKeys';
import type { ManageContentButton, MetaCollection } from '@bloomreach/spa-sdk';
import { TYPE_MANAGE_CONTENT_BUTTON } from '@bloomreach/spa-sdk';
import { computed, inject } from 'vue';
import BrMeta from '@/BrMeta.vue';

const props = defineProps<{
  content?: ManageContentButton['content'],
  documentTemplateQuery?: ManageContentButton['documentTemplateQuery'],
  folderTemplateQuery?: ManageContentButton['folderTemplateQuery'],
  path?: ManageContentButton['path'],
  parameter?: ManageContentButton['parameter'],
  pickerConfiguration?: ManageContentButton['pickerConfiguration'],
  pickerEnableUpload?: ManageContentButton['pickerEnableUpload'],
  pickerInitialPath?: ManageContentButton['pickerInitialPath'],
  pickerRemembersLastVisited?: ManageContentButton['pickerRemembersLastVisited'],
  pickerRootPath?: ManageContentButton['pickerRootPath'],
  pickerSelectableNodeTypes?: ManageContentButton['pickerSelectableNodeTypes'],
  relative?: ManageContentButton['relative'],
  root?: ManageContentButton['root'],
}>();

const page = inject(page$);
const meta = computed<MetaCollection | undefined>(() => page?.value?.getButton(TYPE_MANAGE_CONTENT_BUTTON, props));
</script>
