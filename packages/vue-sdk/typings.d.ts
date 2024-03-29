/*
 * Copyright 2020-2023 Bloomreach
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

import { VueConstructor } from 'vue';

/**
 * The brXM SDK plugin.
 */
export declare function BrSdk(vue: VueConstructor): void;

/**
 * The button component that opens for editing a content.
 */
export declare const BrManageContentButton: VueConstructor;

/**
 * The button component that opens a menu editor.
 */
export declare const BrManageMenuButton: VueConstructor;

/**
 * The brXM component.
 */
export declare const BrComponent: VueConstructor;

/**
 * The brXM page.
 */
export declare const BrPage: VueConstructor;
