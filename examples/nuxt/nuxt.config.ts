/*
 * Copyright 2024-2025 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://nuxt.com/docs/api/configuration/nuxt-config
const ARG_PORT = '--port';
const port = process.argv.find((arg) => arg.startsWith(`${ARG_PORT}=`));

export default defineNuxtConfig({
 devtools: { enabled: true },

 app: {
   head: {
     title: 'brXM + Nuxt = ♥️',
     meta: [
       { charset: 'utf-8' },
       { name: 'viewport', content: 'width=device-width, initial-scale=1' },
       {
         name: 'description',
         content: process.env.npm_package_description || '',
       },
     ],
     link: [
       {
         rel: 'stylesheet',
         href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css',
         integrity: 'sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk',
         crossorigin: 'anonymous',
       },
     ],
   },
 },

 runtimeConfig: {
   public: {
     NUXT_APP_BRXM_ENDPOINT: process.env.NUXT_APP_BRXM_ENDPOINT,
     NUXT_APP_BR_MULTI_TENANT_SUPPORT: process.env.NUXT_APP_BR_MULTI_TENANT_SUPPORT,
   },
 },

 devServer: {
   port: (port && Number(port.substring(ARG_PORT.length + 1))) || 3007,
 },

 devServerHandlers: [],

 typescript: {
   typeCheck: false,
 },

 telemetry: false,

 build: {
   transpile: [
     ({ isServer }: any) => (isServer ? 'server' : 'client'),
     ...(process.env.NODE_ENV === 'production' ? ['emittery'] : [])
   ]
 },

 nitro: {
   moduleSideEffects: ['reflect-metadata']
 },

 compatibilityDate: '2025-02-05'
})
