// SDK Components
export { BrPage } from './br-page.js';
export { BrComponent, BrComponentNode } from './br-component.js';
export { BrContainer } from './br-container.js';
export { BrContainerItem } from './br-container-item.js';
export { BrManageContentButton } from './br-manage-content-button.js';
export { BrManageMenuButton } from './br-manage-menu-button.js';

// Lit Contexts
export { brPageContext, brComponentContext, brMappingContext } from './context.js';

// Utilities
export { getContainerItemContent, getDocumentData, isInternalLink, isExternalLink } from './utils.js';

// Re-export type guards from utils
export {
  isComponent,
  isContainer,
  isContainerItem,
  isContent,
  isDocument,
  isImageSet,
  isLink,
  isMenu,
  isMetaComment,
  isMeta,
  isPage,
  isPagination,
  isReference,
} from './utils.js';

// Re-export commonly used types from @bloomreach/spa-sdk
export type {
  Page,
  Component,
  ContainerItem,
  Container,
  Content,
  Document,
  ImageSet,
  Image,
  Link,
  Menu,
  Menu10,
  MenuItem,
  MetaCollection,
  MetaComment,
  Meta,
  PageModel,
  Configuration,
  ManageContentButton,
  Reference,
} from '@bloomreach/spa-sdk';

// Re-export initialize and destroy for direct use
export { initialize, destroy } from '@bloomreach/spa-sdk';
