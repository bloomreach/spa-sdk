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
  <ul v-if="menu" class="navbar-nav col-12" :class="{ 'has-edit-button': isPreview }">
    <br-manage-menu-button :menu="menu" />

    <li v-for="(item, index) in menu.getItems()" :key="index" class="nav-item" :class="{ active: item.isSelected() }">
      <span v-if="!item.getUrl()" class="nav-link text-capitalize disabled">
        {{ item.getName() }}
      </span>

      <a v-else-if="item.getLink()?.type === TYPE_LINK_EXTERNAL" class="nav-link text-capitalize" :href="item.getUrl()">
        {{ item.getName() }}
      </a>

      <nuxt-link v-else :to="item.getUrl() || ''" class="nav-link text-capitalize">
        {{ item.getName() }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Component, Menu, Page } from '@bloomreach/spa-sdk';
import { isMenu, TYPE_LINK_EXTERNAL } from '@bloomreach/spa-sdk';

const props = defineProps<{
  component: Component,
  page: Page,
}>();

const menu = computed(() => {
  const menuRef = props.component.getModels<MenuModels>()?.menu;
  const menu = menuRef && props.page.getContent<Menu>(menuRef);

  return isMenu(menu) ? menu : undefined;
});
const isPreview = computed(() => props.page.isPreview());
</script>
