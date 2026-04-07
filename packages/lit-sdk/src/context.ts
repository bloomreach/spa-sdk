import { createContext } from '@lit/context';
import type { Page, Component } from '@bloomreach/spa-sdk';

/**
 * Lit Context for the brXM Page object.
 * Provided by <br-page>, consumed by all SDK components.
 */
export const brPageContext = createContext<Page | undefined>('br-page');

/**
 * Lit Context for the current Component in the tree.
 * Each <br-component> provides its resolved component to children.
 */
export const brComponentContext = createContext<Component | undefined>('br-component');

/**
 * Lit Context for the component type mapping.
 * Maps brXM ctype strings to Lit custom element tag names.
 * Example: { 'Hero': 'bank-hero', 'Features': 'bank-features' }
 */
export const brMappingContext = createContext<Record<string, string>>('br-mapping');
