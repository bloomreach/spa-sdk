# Breaking Changes - React Server Components Migration

This document outlines all breaking changes introduced when migrating from React Context to prop drilling for React Server Components (RSC) support.

## Overview

The React SDK has been migrated from using React Context to explicit prop drilling to enable React Server Components compatibility. This is a **major breaking change** that affects all components and requires updates to existing applications.

## Core Component Changes

### BrPage Component
**File**: `src/page/BrPage.tsx`

- **BREAKING CHANGE**: This component no longer provides React Context. Instead, it uses prop drilling to pass `page` and `mapping` data to child components.
- All child components now receive `page` and `mapping` as explicit props
- Applications must update their component implementations to handle these new required props

### BrNode Component  
**File**: `src/component/BrNode.tsx`

- **BREAKING CHANGE**: This component no longer provides ComponentContext.
- Now passes `page` and `mapping` props explicitly to all child components
- Component mapping resolution is now done through props instead of context

### BrComponent Component
**File**: `src/component/BrComponent.tsx`

- **BREAKING CHANGE**: This component no longer uses ComponentContext.
- Now requires `page` and `mapping` props to be passed explicitly
- Component resolution and rendering logic updated for prop-based architecture

### BrNodeComponent Component
**File**: `src/component/BrNodeComponent.tsx`

- **BREAKING CHANGE**: This component no longer uses MappingContext.
- Component mapping is now received through props instead of context
- All mapped components receive `page` and `mapping` as props

### BrNodeContainer Component
**File**: `src/component/BrNodeContainer.tsx`

- **BREAKING CHANGE**: This component no longer uses MappingContext.
- Container components now receive mapping information through props
- Child components are rendered with explicit `page` and `mapping` props

### BrNodeContainerItem Component
**File**: `src/component/BrNodeContainerItem.tsx`

- **BREAKING CHANGE**: This component no longer uses MappingContext.
- Container item rendering now uses prop-based mapping resolution
- All container items receive `page` and `mapping` props

## CMS Component Changes

### BrManageContentButton Component
**File**: `src/cms/BrManageContentButton.tsx`

- **BREAKING CHANGE**: This component no longer uses PageContext.
- Now requires `page` prop to be passed explicitly for content management functionality

### BrManageMenuButton Component  
**File**: `src/cms/BrManageMenuButton.tsx`

- **BREAKING CHANGE**: This component no longer uses PageContext.
- Now requires `page` prop to be passed explicitly for menu management functionality

## TypeScript Interface Changes

### BrProps Interface
**File**: `src/component/BrProps.tsx`

- **BREAKING CHANGE**: This interface now requires `page` and `mapping` props for all components.
- New core interfaces added:
  - `BrCoreProps`: Defines required `page` and `mapping` props
  - `BrComponentProps`: Extends `BrCoreProps` with optional `component` prop
  - `BrPageRenderProps`: Defines render props pattern parameters
- All component interfaces now extend from these base interfaces

## Migration Impact

### For Application Developers

1. **Component Implementation**: All custom components mapped in the `mapping` object must now accept `page` and `mapping` props:
   ```typescript
   // Before (Context-based)
   function MyComponent() {
     const page = useContext(BrPageContext);
     const component = useContext(BrComponentContext);
     // ...
   }

   // After (Prop-based)
   function MyComponent({ page, component, mapping }: BrComponentProps) {
     // page and mapping are now props
     // ...
   }
   ```

2. **Type Safety**: All component functions must be updated to match the new prop interfaces
3. **Context Removal**: Applications can no longer use the removed context hooks and providers

### Removed Context APIs

The following React Context APIs have been completely removed:
- `BrPageContext` and `BrPageProvider`
- `BrComponentContext` and `BrComponentProvider` 
- `BrMappingContext` and `BrMappingProvider`
- `withContextProvider` HOC utility

## Benefits

1. **React Server Components Support**: Components can now run on the server
2. **Improved Performance**: Eliminates context re-renders and provider overhead
3. **Better TypeScript Safety**: Explicit prop typing prevents runtime errors
4. **Clearer Data Flow**: Props make data dependencies explicit and easier to trace

## Version Impact

This change requires a **major version bump** due to the extensive breaking changes to the public API.