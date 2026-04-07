import {
  getContainerItemContent as sdkGetContainerItemContent,
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
  TYPE_LINK_EXTERNAL,
  TYPE_LINK_INTERNAL,
  type ContainerItem,
  type Page,
  type Content,
  type Reference,
} from '@bloomreach/spa-sdk';

// Re-export type guards for convenience
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
};

/**
 * Resolves content data for a container item.
 * Wraps the SDK's getContainerItemContent with proper typing.
 */
export function getContainerItemContent<T>(
  component: ContainerItem,
  page: Page,
): T | undefined {
  return sdkGetContainerItemContent<T>(component, page) ?? undefined;
}

/**
 * Resolves document data for a container item that uses BaseHstDynamicComponent.
 *
 * These components store a document reference in `models.document` (a $ref),
 * NOT in the `content` field. This is the standard pattern for brXM dynamic
 * components with a document picker parameter.
 *
 * Tries three strategies in order:
 * 1. models.document $ref → page.getContent() → getData()
 * 2. SDK's getContainerItemContent() (for content-field pattern)
 * 3. Returns undefined if neither works
 */
export function getDocumentData<T>(
  component: ContainerItem,
  page: Page,
): T | undefined {
  // Strategy 1: models.document $ref (BaseHstDynamicComponent pattern)
  const models = component.getModels<{ document?: Reference }>();
  if (models?.document) {
    const content = page.getContent<Content>(models.document);
    if (content && typeof content === 'object' && 'getData' in content) {
      return (content as Content).getData() as T;
    }
    // If getContent returned raw data directly
    if (content && typeof content === 'object') {
      return content as T;
    }
  }

  // Strategy 2: content $ref (getContainerItemContent pattern)
  const contentData = sdkGetContainerItemContent<T>(component, page);
  if (contentData) { return contentData; }

  return undefined;
}

/**
 * Check if a Link object is an internal (SPA) link.
 */
export function isInternalLink(link: unknown): boolean {
  return isLink(link) && link.type === TYPE_LINK_INTERNAL;
}

/**
 * Check if a Link object is an external link.
 */
export function isExternalLink(link: unknown): boolean {
  return isLink(link) && link.type === TYPE_LINK_EXTERNAL;
}
