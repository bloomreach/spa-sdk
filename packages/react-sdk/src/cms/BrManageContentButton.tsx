/*
 * Copyright 2019-2025 Bloomreach
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

import React, { useContext } from 'react';
import { ManageContentButton, TYPE_MANAGE_CONTENT_BUTTON } from '@bloomreach/spa-sdk';
import { BrMeta } from '../meta';
import { BrPageContext } from '../page/BrPageContext';

/**
 * The button component that opens for editing a content.
 */
export function BrManageContentButton(props: ManageContentButton): React.ReactElement | null {
  const page = useContext(BrPageContext);

  return page?.isPreview() ? <BrMeta meta={page.getButton(TYPE_MANAGE_CONTENT_BUTTON, props)} /> : null;
}
