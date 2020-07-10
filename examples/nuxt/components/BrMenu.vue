<!--
  Copyright 2020 Hippo B.V. (http://www.onehippo.com)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  -->

<template>
  <ul v-if="menu" class="navbar-nav col-12" :class="{ 'has-edit-button': page.isPreview() }">
    <br-manage-menu-button :menu="menu" />
    <li v-for="(item, index) in menu.siteMenuItems" :key="index" class="nav-item" :class="{ active: item.selected }">
      <span v-if="!item._links.site" class="nav-link text-capitalize disabled">
        {{ item.name }}
      </span>

      <a
        v-else-if="item._links.site.type === TYPE_LINK_EXTERNAL"
        class="nav-link text-capitalize"
        :href="item._links.site.href"
      >
        {{ item.name }}
      </a>

      <nuxt-link v-else :to="page.getUrl(item._links.site)" class="nav-link text-capitalize">
        {{ item.name }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component as BrComponent, Page, TYPE_LINK_EXTERNAL } from '@bloomreach/spa-sdk';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({
  computed: {
    menu(this: BrMenu) {
      return this.component.getModels<MenuModels>()?.menu;
    },
  },
  data: () => ({ TYPE_LINK_EXTERNAL }),
  name: 'br-menu',
})
export default class BrMenu extends Vue {
  @Prop() component!: BrComponent;

  @Prop() page!: Page;
}
</script>