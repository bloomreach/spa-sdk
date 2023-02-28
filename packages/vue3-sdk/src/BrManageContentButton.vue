<!--
  copyright 2020-2023 bloomreach

  licensed under the apache license, version 2.0 (the "license");
  you may not use this file except in compliance with the license.
  you may obtain a copy of the license at

   http://www.apache.org/licenses/license-2.0

  unless required by applicable law or agreed to in writing, software
  distributed under the license is distributed on an "as is" basis,
  without warranties or conditions of any kind, either express or implied.
  see the license for the specific language governing permissions and
  limitations under the license.
  -->

<template>
  <br-meta v-if="page && page?.isPreview()" :meta="meta"/>
</template>

<script setup lang="ts">
import { page$ } from '@/providerKeys';
import type { ManageContentButton, Page } from '@bloomreach/spa-sdk';
import { TYPE_MANAGE_CONTENT_BUTTON } from '@bloomreach/spa-sdk';
import { computed, inject } from 'vue';
import BrMeta from './BrMeta.vue';

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

const page = inject<Page | null>(page$);
const meta = computed(() => page?.getButton(TYPE_MANAGE_CONTENT_BUTTON, props));
</script>
