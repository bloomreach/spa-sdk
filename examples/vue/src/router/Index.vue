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
  <br-page :configuration="configuration" :mapping="mapping">
    <template v-slot="{ page }: { page: Page }">
      <template v-if="page">
        <header>
          <nav class="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
            <div class="container">
              <router-link :to="page.getUrl('/')" class="navbar-brand">
                {{ page.getTitle() || 'brXM + Vue.js = ♥' }}
              </router-link>
              <div class="collapse navbar-collapse">
                <br-component component="menu"/>
              </div>
            </div>
          </nav>
        </header>
        <section class="container flex-fill pt-3">
          <br-component component="main"/>
        </section>
        <footer class="bg-dark text-light py-3">
          <div class="container clearfix">
            <div class="float-left pr-3">&copy; Bloomreach</div>
            <div class="overflow-hidden">
              <br-component component="bottom"/>
            </div>
          </div>
        </footer>
      </template>
    </template>
  </br-page>
</template>

<script setup lang="ts">
import BrBanner from '@/components/BrBanner.vue';
import BrContent from '@/components/BrContent.vue';
import BrMenu from '@/components/BrMenu.vue';
import BrNewsList from '@/components/BrNewsList.vue';
import { buildConfiguration } from '@/utils/buildConfiguration';
import type { Configuration, Page } from '@bloomreach/spa-sdk';
import type { BrMapping } from '@bloomreach/vue-sdk';
import { BrComponent, BrPage } from '@bloomreach/vue-sdk';
import axios from 'axios';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const configuration = computed<Configuration>(() => ({
  ...buildConfiguration(`${route.fullPath}`, axios),
  debug: true,
}));

const mapping: BrMapping = {
  Banner: BrBanner,
  Content: BrContent,
  menu: BrMenu,
  'News List': BrNewsList,
  'Simple Content': BrContent,
};

</script>
