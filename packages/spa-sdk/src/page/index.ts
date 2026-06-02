/*
 * Copyright 2019-2026 Bloomreach
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

import { Typed } from 'emittery';
import { PageModel } from './page';

export type EventBus = Typed<{ 'page.update': { page: PageModel } }>;

export {
  Component,
  isComponent,
  TYPE_COMPONENT,
  TYPE_COMPONENT_CONTAINER,
  TYPE_COMPONENT_CONTAINER_ITEM,
} from './component';
export {
  Container,
  isContainer,
  TYPE_CONTAINER_BOX,
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from './container';
export {
  ContainerItem,
  getContainerItemContent,
  isContainerItem,
  TYPE_CONTAINER_ITEM_UNDEFINED,
} from './container-item';
export { Document, TYPE_DOCUMENT, isDocument } from './document';
export { ImageSet, TYPE_IMAGE_SET, isImageSet } from './image-set';
export { Image } from './image';
export { Link, TYPE_LINK_EXTERNAL, TYPE_LINK_INTERNAL, TYPE_LINK_RESOURCE, isLink } from './link';
export { ManageContentButton, TYPE_MANAGE_CONTENT_BUTTON } from './button-manage-content';
export { MenuItem } from './menu-item';
export { TYPE_MANAGE_MENU_BUTTON, TYPE_MENU, isMenu, Menu } from './menu';
export { MetaCollection } from './meta-collection';
export { MetaComment, isMetaComment } from './meta-comment';
export { Meta, META_POSITION_BEGIN, META_POSITION_END, isMeta } from './meta';
export { Page, PageModel, isPage } from './page';
export { PaginationItem } from './pagination-item';
export { Pagination, isPagination } from './pagination';
export { Reference, isReference } from './reference';
export { Visitor, Visit } from './relevance';
