<!--
  Copyright 2024-2026 Bloomreach

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
  <br-page :configuration="{ ...configuration, httpClient: axios }" :mapping="mapping" :page="page">
    <template v-slot="{ page }">
      <template v-if="page">
        <header>
          <nav class="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
            <div class="container">
              <nuxt-link :to="page.getUrl('/')" class="navbar-brand">
                {{ page.getTitle() || 'brXM + Nuxt = ♥' }}
              </nuxt-link>
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
import { extractSearchParams, initialize, type Configuration } from '@bloomreach/spa-sdk';

const config = useRuntimeConfig();
const route = useRoute();

const mapping: BrMapping = {
  Banner: BrBanner,
  Content: BrContent,
  menu: BrMenu,
  'News List': BrNewsList,
  'Simple Content': BrContent,
};

const configuration = computed(() => {
  const configObj = {
    path: route.fullPath,
    endpoint: config.public.NUXT_APP_BRXM_ENDPOINT,
    debug: true,
  } as Configuration;

  if (!config.public.NUXT_APP_BRXM_ENDPOINT && config.public.NUXT_APP_BR_MULTI_TENANT_SUPPORT) {
    const endpointQueryParameter = 'endpoint';
    const { searchParams } = extractSearchParams(configObj.path!, [endpointQueryParameter].filter(Boolean));

    return {
      ...configObj,
      endpoint: searchParams.get(endpointQueryParameter) ?? '',
      baseUrl: `?${endpointQueryParameter}=${searchParams.get(endpointQueryParameter)}`,
    }
  }

  return configObj;
});

const { data } = await useAsyncData(
  `page-${route.fullPath}`,
  async (context) => {
    const page = await initialize({
      ...configuration.value,
      httpClient: axios,
      request: context?.ssrContext?.event?.node?.req,
    });

    return { page: page.toJSON() };
  }
)

const page = computed(() => data.value?.page);

</script>
