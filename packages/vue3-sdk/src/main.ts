/*
 * Copyright 2023 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import BrComponent from '@/BrComponent.vue';
import BrManageContentButton from '@/BrManageContentButton.vue';
import BrManageMenuButton from '@/BrManageMenuButton.vue';
import BrPage from '@/BrPage.vue';
import type { App } from 'vue';

/**
 * The brXM SDK plugin.
 */
export const BrSdk = {
  install(app: App): void {
    app.component('br-component', BrComponent);
    app.component('br-manage-content-button', BrManageContentButton);
    app.component('br-manage-menu-button', BrManageMenuButton);
    app.component('br-page', BrPage);
  },
};

export { BrComponent, BrManageContentButton, BrManageMenuButton, BrPage };
