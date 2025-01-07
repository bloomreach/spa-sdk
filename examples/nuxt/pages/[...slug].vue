<!--
  Copyright 2024-2025 Bloomreach

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
  <br-page :configuration="configuration" :mapping="mapping" :page="page">
    <template v-slot="{ page }">
      <template v-if="page">
        <header>
          <nav class="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
            <div class="container">
              <router-link :to="page.getUrl('/')" class="navbar-brand">
                {{ page.getTitle() || 'brXM + Nuxt = ♥' }}
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
import type { BrMapping } from '@bloomreach/vue-sdk';
import { BrComponent, BrPage } from '@bloomreach/vue-sdk';
import axios from 'axios';
import { BrBanner, BrContent, BrMenu, BrNewsList } from '#components';
import { buildConfiguration } from '~/utils/buildConfiguration';
import { initialize } from '@bloomreach/spa-sdk';

const config = useRuntimeConfig();
const route = useRoute();

const endpoint = config.public.NUXT_APP_BRXM_ENDPOINT ?? '';
const baseUrl = config.public.BASE_URL !== '/' ? config.public.BASE_URL ?? '' : '';
const hasMultiTenantSupport = config.public.NUXT_APP_BR_MULTI_TENANT_SUPPORT === 'true';

const mapping: BrMapping = {
  Banner: BrBanner,
  Content: BrContent,
  menu: BrMenu,
  'News List': BrNewsList,
  'Simple Content': BrContent,
};

const configuration = {
  ...buildConfiguration(`${route.fullPath}`, axios, baseUrl, endpoint, hasMultiTenantSupport),
};

const { data } = await useAsyncData(async (context) => {
  const page = await initialize({
    ...configuration,
    httpClient: axios,
    request: context?.ssrContext?.event?.node?.req,
  });

  return { page: page.toJSON() };
})

const page = data.value?.page;

</script>
