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
  <br-page :configuration="configuration" :mapping="mapping" :page="page">
    <template #default="props">
      <template v-if="props.page">
        <header>
          <nav class="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
            <div class="container">
              <nuxt-link :to="props.page.getUrl('/')" class="navbar-brand">
                {{ props.page.getTitle() || 'brXM + Nuxt.js = ♥' }}
              </nuxt-link>
              <div class="collapse navbar-collapse">
                <br-component component="menu" />
              </div>
            </div>
          </nav>
        </header>
        <section class="container flex-fill pt-3">
          <br-component component="main" />
        </section>
        <footer class="bg-dark text-light py-3">
          <div class="container clearfix">
            <div class="float-left pr-3">&copy; Bloomreach</div>
            <div class="overflow-hidden">
              <br-component component="footer" />
            </div>
          </div>
        </footer>
        <br-cookie-consent :is-preview="props.page.isPreview()" :path="configuration.path"></br-cookie-consent>
      </template>
    </template>
  </br-page>
</template>

<script lang="ts">
import { Configuration, initialize } from '@bloomreach/spa-sdk';
import { Component, Vue, Watch } from 'nuxt-property-decorator';

import Banner from '~/components/BrBanner.vue';
import Content from '~/components/BrContent.vue';
import Menu from '~/components/BrMenu.vue';
import NewsList from '~/components/BrNewsList.vue';
import CookieConsent from '~/components/BrCookieConsent.vue';
import { buildConfiguration } from '~/utils/buildConfiguration';

@Component({
  components: { 'br-cookie-consent': CookieConsent },
  async asyncData(context) {
    const configuration = buildConfiguration(context.route.fullPath);

    const page = await initialize({
      ...configuration,
      visitor: context.nuxtState?.visitor,
      httpClient: context.$axios,
      request: context.req,
    });

    if (process.server) {
      context.beforeNuxtRender(({ nuxtState }) => {
        nuxtState.visitor = page.getVisitor();
      });
    }

    return { configuration, page };
  },

  data: () => ({
    mapping: {
      Banner,
      Content,
      menu: Menu,
      'News List': NewsList,
      'Simple Content': Content,
    },
  }),
})
export default class App extends Vue {
  configuration!: Configuration;

  beforeMount() {
    this.configuration.httpClient = this.$axios;
  }

  beforeUpdate() {
    this.configuration.httpClient = this.$axios;
  }

  @Watch('$route', { deep: true })
  navigate() {
    this.$set(this.configuration, 'path', this.$route.fullPath);
  }
}
</script>
