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

<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue';
import type { Configuration } from '@bloomreach/spa-sdk';
import type { BrMapping } from '@bloomreach/vue3-sdk';
import { BrComponent, BrPage } from '@bloomreach/vue3-sdk';
import axios from 'axios';
import { ref } from 'vue';

const mapping: BrMapping = {
  'Banner': HelloWorld,
};

const configuration = ref<Configuration>({
  httpClient: axios,
  endpoint: 'http://localhost:8080/delivery/site/v1/channels/spa-vue-csr/pages',
  path: '/',
});
</script>

<template>
  <h1>BrPage</h1>
  <br-page :configuration="configuration" :mapping="mapping">
    <template #default="{ component, page }">
     <template v-if="page">
       <h1>This is a page with version {{ page.getVersion() }}</h1>
       <div>
         <h1>Menu</h1>
         <br-component :component="'menu'"></br-component>
       </div>
       <div>
         <h1>Main</h1>
         <br-component :component="'main'">
           <h1>Container</h1>
           <br-component :component="'container'"></br-component>
           <h1>Container2</h1>
           <br-component :component="'container2'"></br-component>
         </br-component>
       </div>
       <div>
         <h1>Footer</h1>
         <br-component :component="'bottom'"></br-component>
       </div>
     </template>
    </template>
  </br-page>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app .has-edit-button {
  position: relative;
}
</style>
