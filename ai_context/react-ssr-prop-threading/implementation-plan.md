# Implementation Plan: React SDK Context to Prop Drilling Migration for RSC Support

## Executive Summary

This implementation plan provides a complete migration of the Bloomreach React SDK from React Context-based state management to prop drilling, enabling React Server Components (RSC) support. The implementation will be done in one complete change with subtasks for progress tracking.

**Scope**: 41 files requiring modification across the React SDK
**Approach**: Breaking change implementation with direct context removal
**Validation**: Comprehensive testing and example application updates

---

## Implementation Overview

The migration will be implemented as a single comprehensive change rather than atomic changes to avoid backwards compatibility constraints. Progress will be tracked through subtasks organized by functional areas.

## Task 1: TypeScript Interface Foundation [DONE]

**Files Affected**: `packages/react-sdk/src/component/BrProps.tsx`

**Description**: Update core TypeScript interfaces to support required prop drilling architecture, establishing the foundation for all subsequent changes.

**Subtasks**:
1. Create new `BrCoreProps` interface with required `page` and `mapping` properties
2. Update existing `BrProps` interface to extend `BrCoreProps` and make `page` and `mapping` required
3. Add new `BrComponentProps` interface for components that include component data
4. Add comprehensive JSDoc documentation for all new interfaces
5. Create `BrPageRenderProps` interface for render props pattern support

---

## Task 2: Core Component Migration (BrPage) [PENDING]

**Files Affected**: `packages/react-sdk/src/page/BrPage.tsx`, `packages/react-sdk/src/page/BrPage.spec.tsx`

**Description**: Migrate BrPage component from context providers to prop drilling with render props support.

**Subtasks**:
1. Update BrPage component interface to support both children and render props patterns
2. Implement prop drilling by passing `page`, `mapping`, and `component` to child components
3. Remove BrPageContext.Provider and BrMappingContext.Provider usage
4. Add render props support for `children` function parameter
5. Update BrPage.spec.tsx to test prop drilling instead of context provision
6. Add tests for render props pattern functionality

---

## Task 3: Core Component Migration (BrNode) [PENDING]

**Files Affected**: `packages/react-sdk/src/component/BrNode.tsx`, `packages/react-sdk/src/component/BrNode.spec.tsx`

**Description**: Migrate BrNode component from context consumption/provision to pure prop threading for all child components.

**Subtasks**:
1. Update BrNode props interface to accept required `page`, `mapping`, and optional `component`
2. Remove BrComponentContext.Provider usage from BrNode
3. Remove BrPageContext consumption from BrNode
4. Thread props down to BrNodeContainer, BrNodeComponent, and BrNodeContainerItem
5. Update children rendering logic to pass props to child BrNode instances
6. Update BrNode.spec.tsx to provide required props instead of context

---

## Task 4: Core Component Migration (BrComponent) [PENDING]

**Files Affected**: `packages/react-sdk/src/component/BrComponent.tsx`, `packages/react-sdk/src/component/BrComponent.spec.tsx`

**Description**: Migrate BrComponent from context consumption to prop-based component resolution and rendering.

**Subtasks**:
1. Update BrComponent props interface to include required `page` and `mapping` props
2. Remove useContext(BrComponentContext) and use props.component instead
3. Update component path resolution to use props.component
4. Thread props down to child BrNode components in getComponents logic
5. Update BrComponent.spec.tsx to provide required props
6. Add tests for path-based component resolution with props

---

## Task 5: Node Component Migration [PENDING]

**Files Affected**: 
- `packages/react-sdk/src/component/BrNodeComponent.tsx`
- `packages/react-sdk/src/component/BrNodeContainer.tsx` 
- `packages/react-sdk/src/component/BrNodeContainerItem.tsx`
- `packages/react-sdk/src/component/BrNodeComponent.spec.tsx`
- `packages/react-sdk/src/component/BrNodeContainer.spec.tsx`
- `packages/react-sdk/src/component/BrNodeContainerItem.spec.tsx`

**Description**: Migrate all node-level components from context consumption to prop-based data access and component resolution.

**Subtasks**:
1. Update BrNodeComponent to receive `page`, `mapping`, and `component` via props
2. Remove useContext(BrMappingContext) from BrNodeComponent and use props.mapping
3. Update component mapping resolution to use props.mapping directly
4. Update BrNodeContainer to accept and use required props
5. Update BrNodeContainerItem to accept and use required props
6. Update all test files to provide props instead of context
7. Add tests for component mapping resolution with props

---

## Task 6: CMS Component Migration [PENDING]

**Files Affected**: 
- `packages/react-sdk/src/cms/BrManageContentButton.tsx`
- `packages/react-sdk/src/cms/BrManageMenuButton.tsx`
- All container component files (6 files: BrContainerBox, BrContainerInline, BrContainerNoMarkup, BrContainerOrderedList, BrContainerUnorderedList, BrContainerItemUndefined)
- All corresponding test files (8 test files)

**Description**: Migrate all CMS and container components from context consumption to required prop interfaces.

**Subtasks**:
1. Update BrManageContentButton interface to extend BrCoreProps (require page and mapping)
2. Remove useContext(BrPageContext) from BrManageContentButton and use props.page
3. Update BrManageMenuButton interface to extend BrCoreProps
4. Remove useContext(BrPageContext) from BrManageMenuButton and use props.page
5. Update all 6 container components to accept BrProps with required page and mapping
6. Update all CMS and container component test files to provide required props
7. Add tests for preview mode functionality using props.page

---

## Task 7: Context Infrastructure Removal [PENDING]

**Files Affected**: 
- `packages/react-sdk/src/page/BrPageContext.ts`
- `packages/react-sdk/src/component/BrComponentContext.ts`
- `packages/react-sdk/src/component/BrMappingContext.ts`
- `packages/react-sdk/src/utils/withContextProvider.tsx`
- `packages/react-sdk/src/index.ts` (export removal)
- `packages/react-sdk/src/page/index.ts` (export removal)
- `packages/react-sdk/src/component/index.ts` (export removal)

**Description**: Remove all React Context infrastructure including context definitions, providers, and utility functions since components now use prop drilling.

**Subtasks**:
1. Delete BrPageContext.ts file entirely
2. Delete BrComponentContext.ts file entirely  
3. Delete BrMappingContext.ts file entirely
4. Delete withContextProvider.tsx utility file entirely
5. Remove context-related exports from all index files
6. Search for any remaining context imports or usage across all files

---

## Task 8: Test Suite Comprehensive Update [PENDING]

**Files Affected**: All remaining test files not updated in previous tasks (approximately 10 additional test files)

**Description**: Update any remaining test files to use prop-based testing patterns instead of context utilities, ensuring complete test coverage for the new prop drilling architecture.

**Subtasks**:
1. Identify all test files that still use withContextProvider utilities
2. Update test files to directly provide props instead of wrapping with context providers
3. Replace mock context values with mock prop values in test fixtures
4. Add new test cases for prop drilling validation
5. Add test cases for missing required props
6. Add test cases for render props pattern functionality

---

## Task 9: Example Application Migration [PENDING]

**Files Affected**: 
- `examples/react/src/App.tsx`
- `examples/next/src/app/[[...route]]/page.tsx` (if exists)
- `examples/next/src/pages/[[...route]].tsx` (if exists)
- Any other React example usage files

**Description**: Update all React example applications to use the new prop drilling patterns and validate RSC compatibility.

**Subtasks**:
1. Update React CSR example to use render props pattern for page access
2. Replace BrPageContext.Consumer usage with render props in React example
3. Update Next.js example to demonstrate RSC compatibility if applicable
4. Ensure all BrComponent usages include required page and mapping props
5. Update component mapping examples to work with new prop requirements
6. Test React CSR and Next.js example applications
7. Update example README files with new usage patterns

---

## Task 10: Integration Validation and Documentation [PENDING]

**Files Affected**: 
- `packages/react-sdk/README.md`
- Root level documentation files
- Any migration guide documentation

**Description**: Final validation of the complete migration with comprehensive testing, performance validation, and documentation updates.

**Subtasks**:
1. Run complete build process for entire monorepo with `pnpm build`
2. Run complete test suite for entire monorepo with `pnpm test`
3. Run complete linting for entire monorepo with `pnpm lint`
4. Validate bundle size reduction from context code removal
5. Test RSC compatibility with Next.js App Router integration
6. Update React SDK README.md with new prop drilling usage patterns
7. Add migration guide documentation for breaking changes
8. Document render props pattern usage examples
9. Update API documentation to reflect new required props
10. Create final validation checklist for QA testing

---

## Implementation Summary

**Total Tasks**: 10  
**Total Files Modified**: 41  

**Implementation Approach**: Complete migration in a single comprehensive change with subtasks for progress tracking. This approach eliminates backwards compatibility constraints and allows for more efficient development.

**Key Benefits of Single Implementation**:
- No need to maintain backwards compatibility during migration
- Reduced complexity in intermediate states
- More straightforward testing and validation
- Cleaner git history with focused commit

**Testing Strategy**: Comprehensive testing updates ensure functionality is preserved while moving from context to prop drilling.