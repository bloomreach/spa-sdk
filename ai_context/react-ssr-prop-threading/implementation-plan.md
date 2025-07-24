# Implementation Plan: React SDK Context to Prop Drilling Migration for RSC Support

## Executive Summary

This implementation plan provides step-by-step atomic changes to migrate the Bloomreach React SDK from React Context-based state management to prop drilling, enabling React Server Components (RSC) support. Each atomic change maintains working, tested, and linted code.

**Scope**: 41 files requiring modification across the React SDK
**Approach**: Breaking change implementation with direct context removal
**Validation**: Comprehensive testing and example application updates

---

## Atomic Change: AC-001 - TypeScript Interface Foundation

**Group ID**: AC-001  
**Files Affected**: `packages/react-sdk/src/component/BrProps.tsx`

**Description**: Update core TypeScript interfaces to support required prop drilling architecture, establishing the foundation for all subsequent changes.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Create new `BrCoreProps` interface with required `page` and `mapping` properties
2. [PENDING] Task: Update existing `BrProps` interface to extend `BrCoreProps` and make `page` and `mapping` required
3. [PENDING] Task: Add new `BrComponentProps` interface for components that include component data
4. [PENDING] Task: Add comprehensive JSDoc documentation for all new interfaces
5. [PENDING] Task: Create `BrPageRenderProps` interface for render props pattern support
6. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
7. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`  
8. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`

**Atomic Change Acceptance Criteria**:
- All interfaces compile without TypeScript errors
- Interfaces follow existing code patterns and naming conventions
- JSDoc documentation is comprehensive and accurate
- No linting violations introduced
- Interfaces support both regular usage and render props pattern
- All dependent code still compiles (interfaces are extended, not breaking yet)

**Dependencies**: None - Foundation change  
**Release Readiness Checklist**:
□ TypeScript compilation passes  
□ Linting passes with no violations  
□ Interface documentation complete  
□ Code review completed  

**Estimated Complexity**: Low

---

## Atomic Change: AC-002 - Core Component Migration (BrPage)

**Group ID**: AC-002  
**Files Affected**: `packages/react-sdk/src/page/BrPage.tsx`, `packages/react-sdk/src/page/BrPage.spec.tsx`

**Description**: Migrate BrPage component from context providers to prop drilling with render props support, maintaining backward compatibility during transition.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Update BrPage component interface to support both children and render props patterns
2. [PENDING] Task: Implement prop drilling by passing `page`, `mapping`, and `component` to child components
3. [PENDING] Task: Remove BrPageContext.Provider and BrMappingContext.Provider usage
4. [PENDING] Task: Add render props support for `children` function parameter
5. [PENDING] Task: Maintain backward compatibility for regular children elements
6. [PENDING] Task: Update BrPage.spec.tsx to test prop drilling instead of context provision
7. [PENDING] Task: Add tests for render props pattern functionality
8. [PENDING] Task: Add tests for mixed children and render props usage
9. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
10. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`
11. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`

**Atomic Change Acceptance Criteria**:
- BrPage component passes page, mapping, and component data via props
- Render props pattern works correctly for page access
- Regular children still render properly 
- All existing BrPage tests pass with prop-based assertions
- New tests validate render props functionality
- Component maintains initialization and sync behavior
- TypeScript compilation succeeds
- No linting violations

**Dependencies**: Requires AC-001 (interface foundation)  
**Release Readiness Checklist**:
□ All BrPage tests passing  
□ TypeScript compilation clean  
□ Linting clean  
□ Render props pattern validated  
□ Code review completed  

**Estimated Complexity**: Medium

---

## Atomic Change: AC-003 - Core Component Migration (BrNode)

**Group ID**: AC-003  
**Files Affected**: `packages/react-sdk/src/component/BrNode.tsx`, `packages/react-sdk/src/component/BrNode.spec.tsx`

**Description**: Migrate BrNode component from context consumption/provision to pure prop threading for all child components.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Update BrNode props interface to accept required `page`, `mapping`, and optional `component`
2. [PENDING] Task: Remove BrComponentContext.Provider usage from BrNode
3. [PENDING] Task: Remove BrPageContext consumption from BrNode
4. [PENDING] Task: Thread props down to BrNodeContainer, BrNodeComponent, and BrNodeContainerItem
5. [PENDING] Task: Update children rendering logic to pass props to child BrNode instances
6. [PENDING] Task: Maintain existing component type detection logic (isContainer, isContainerItem)
7. [PENDING] Task: Update BrNode.spec.tsx to provide required props instead of context
8. [PENDING] Task: Add tests validating prop threading to child components
9. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
10. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`
11. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`

**Atomic Change Acceptance Criteria**:
- BrNode receives page, mapping, and component via props
- All props are correctly threaded to child components
- Component type detection continues to work properly
- BrMeta integration remains functional
- All existing BrNode tests pass with prop-based setup
- New tests validate complete prop threading
- TypeScript compilation succeeds
- No linting violations

**Dependencies**: Requires AC-001 (interfaces) and AC-002 (BrPage)  
**Release Readiness Checklist**:
□ All BrNode tests passing  
□ TypeScript compilation clean  
□ Linting clean  
□ Prop threading validated  
□ Code review completed  

**Estimated Complexity**: Medium

---

## Atomic Change: AC-004 - Core Component Migration (BrComponent)

**Group ID**: AC-004  
**Files Affected**: `packages/react-sdk/src/component/BrComponent.tsx`, `packages/react-sdk/src/component/BrComponent.spec.tsx`

**Description**: Migrate BrComponent from context consumption to prop-based component resolution and rendering.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Update BrComponent props interface to include required `page` and `mapping` props
2. [PENDING] Task: Remove useContext(BrComponentContext) and use props.component instead
3. [PENDING] Task: Update component path resolution to use props.component
4. [PENDING] Task: Thread props down to child BrNode components in getComponents logic
5. [PENDING] Task: Maintain existing path-based component filtering functionality
6. [PENDING] Task: Update BrComponent.spec.tsx to provide required props
7. [PENDING] Task: Add tests for path-based component resolution with props
8. [PENDING] Task: Add edge case tests for missing component and invalid paths
9. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
10. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`
11. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`

**Atomic Change Acceptance Criteria**:
- BrComponent uses props instead of context for all data access
- Path-based component resolution works correctly
- Child components receive proper props threading
- Edge cases (missing component, invalid paths) handled properly
- All existing BrComponent tests pass
- New tests validate prop-based component resolution
- TypeScript compilation succeeds
- No linting violations

**Dependencies**: Requires AC-001, AC-002, AC-003  
**Release Readiness Checklist**:
□ All BrComponent tests passing  
□ TypeScript compilation clean  
□ Linting clean  
□ Path resolution validated  
□ Code review completed  

**Estimated Complexity**: Medium

---

## Atomic Change: AC-005 - Node Component Migration

**Group ID**: AC-005  
**Files Affected**: 
- `packages/react-sdk/src/component/BrNodeComponent.tsx`
- `packages/react-sdk/src/component/BrNodeContainer.tsx` 
- `packages/react-sdk/src/component/BrNodeContainerItem.tsx`
- `packages/react-sdk/src/component/BrNodeComponent.spec.tsx`
- `packages/react-sdk/src/component/BrNodeContainer.spec.tsx`
- `packages/react-sdk/src/component/BrNodeContainerItem.spec.tsx`

**Description**: Migrate all node-level components from context consumption to prop-based data access and component resolution.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Update BrNodeComponent to receive `page`, `mapping`, and `component` via props
2. [PENDING] Task: Remove useContext(BrMappingContext) from BrNodeComponent and use props.mapping
3. [PENDING] Task: Update component mapping resolution to use props.mapping directly
4. [PENDING] Task: Update BrNodeContainer to accept and use required props
5. [PENDING] Task: Update BrNodeContainerItem to accept and use required props
6. [PENDING] Task: Ensure all components pass props correctly to React.createElement calls
7. [PENDING] Task: Update BrNodeComponent.spec.tsx to provide props instead of context
8. [PENDING] Task: Update BrNodeContainer.spec.tsx with prop-based testing
9. [PENDING] Task: Update BrNodeContainerItem.spec.tsx with prop-based testing
10. [PENDING] Task: Add tests for component mapping resolution with props
11. [PENDING] Task: Add tests for edge cases (missing mapping, invalid component names)
12. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
13. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`
14. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`

**Atomic Change Acceptance Criteria**:
- All node components use props instead of context for data access
- Component mapping resolution works correctly with props.mapping
- BrMeta integration continues to function properly
- All container and item components receive and use props correctly
- All existing tests pass with prop-based setup
- New tests validate prop-based component resolution
- TypeScript compilation succeeds
- No linting violations

**Dependencies**: Requires AC-001, AC-002, AC-003, AC-004  
**Release Readiness Checklist**:
□ All node component tests passing  
□ TypeScript compilation clean  
□ Linting clean  
□ Component mapping validated  
□ Code review completed  

**Estimated Complexity**: High

---

## Atomic Change: AC-006 - CMS Component Migration

**Group ID**: AC-006  
**Files Affected**: 
- `packages/react-sdk/src/cms/BrManageContentButton.tsx`
- `packages/react-sdk/src/cms/BrManageMenuButton.tsx`
- All container component files (6 files: BrContainerBox, BrContainerInline, BrContainerNoMarkup, BrContainerOrderedList, BrContainerUnorderedList, BrContainerItemUndefined)
- All corresponding test files (8 test files)

**Description**: Migrate all CMS and container components from context consumption to required prop interfaces.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Update BrManageContentButton interface to extend BrCoreProps (require page and mapping)
2. [PENDING] Task: Remove useContext(BrPageContext) from BrManageContentButton and use props.page
3. [PENDING] Task: Update BrManageMenuButton interface to extend BrCoreProps
4. [PENDING] Task: Remove useContext(BrPageContext) from BrManageMenuButton and use props.page
5. [PENDING] Task: Update all 6 container components to accept BrProps with required page and mapping
6. [PENDING] Task: Ensure all container components use props instead of BrProps interface assumptions
7. [PENDING] Task: Update all CMS component test files to provide required props
8. [PENDING] Task: Update all container component test files with prop-based testing
9. [PENDING] Task: Add tests for preview mode functionality using props.page
10. [PENDING] Task: Add tests for container rendering with different prop combinations
11. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
12. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`
13. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`

**Atomic Change Acceptance Criteria**:
- All CMS components require and use page and mapping props
- Manage buttons work correctly with props.page for preview detection
- All container components accept and properly use required props
- Preview mode functionality continues to work correctly
- All existing CMS and container tests pass
- New tests validate prop-based preview mode detection
- TypeScript compilation succeeds
- No linting violations

**Dependencies**: Requires AC-001, AC-002, AC-003, AC-004, AC-005  
**Release Readiness Checklist**:
□ All CMS component tests passing  
□ TypeScript compilation clean  
□ Linting clean  
□ Preview mode functionality validated  
□ Code review completed  

**Estimated Complexity**: High

---

## Atomic Change: AC-007 - Context Infrastructure Removal

**Group ID**: AC-007  
**Files Affected**: 
- `packages/react-sdk/src/page/BrPageContext.ts`
- `packages/react-sdk/src/component/BrComponentContext.ts`
- `packages/react-sdk/src/component/BrMappingContext.ts`
- `packages/react-sdk/src/utils/withContextProvider.tsx`
- `packages/react-sdk/src/index.ts` (export removal)
- `packages/react-sdk/src/page/index.ts` (export removal)
- `packages/react-sdk/src/component/index.ts` (export removal)

**Description**: Remove all React Context infrastructure including context definitions, providers, and utility functions since components now use prop drilling.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Delete BrPageContext.ts file entirely
2. [PENDING] Task: Delete BrComponentContext.ts file entirely  
3. [PENDING] Task: Delete BrMappingContext.ts file entirely
4. [PENDING] Task: Delete withContextProvider.tsx utility file entirely
5. [PENDING] Task: Remove context-related exports from packages/react-sdk/src/index.ts
6. [PENDING] Task: Remove context-related exports from packages/react-sdk/src/page/index.ts
7. [PENDING] Task: Remove context-related exports from packages/react-sdk/src/component/index.ts
8. [PENDING] Task: Search for any remaining context imports or usage across all files
9. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build` to ensure no broken imports
10. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test` to ensure no test dependencies on deleted context files
11. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`
12. [PENDING] Task: Verify build process succeeds with `pnpm --filter @bloomreach/react-sdk run build`

**Atomic Change Acceptance Criteria**:
- All context files are completely removed
- No broken imports or references to deleted context files
- All exports are updated to exclude context-related items
- TypeScript compilation succeeds without errors
- Full test suite passes without context dependencies
- Build process completes successfully
- No linting violations
- Bundle size is reduced due to context code removal

**Dependencies**: Requires AC-001 through AC-006 (all components migrated)  
**Release Readiness Checklist**:
□ All context files deleted  
□ TypeScript compilation clean  
□ All tests passing  
□ Build process successful  
□ No broken imports detected  
□ Code review completed  

**Estimated Complexity**: Medium

---

## Atomic Change: AC-008 - Test Suite Comprehensive Update

**Group ID**: AC-008  
**Files Affected**: All remaining test files not updated in previous atomic changes (approximately 10 additional test files)

**Description**: Update any remaining test files to use prop-based testing patterns instead of context utilities, ensuring complete test coverage for the new prop drilling architecture.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Identify all test files that still use withContextProvider utilities
2. [PENDING] Task: Update test files to directly provide props instead of wrapping with context providers
3. [PENDING] Task: Replace mock context values with mock prop values in test fixtures
4. [PENDING] Task: Add new test cases for prop drilling validation
5. [PENDING] Task: Add test cases for missing required props (should fail gracefully)
6. [PENDING] Task: Add test cases for render props pattern functionality
7. [PENDING] Task: Update integration test scenarios to use prop-based component setup
8. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run test`
9. [PENDING] Task: Verify test coverage remains at acceptable levels
10. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run build`
11. [PENDING] Task: Run `pnpm --filter @bloomreach/react-sdk run lint`

**Atomic Change Acceptance Criteria**:
- All test files use prop-based testing instead of context utilities
- Test coverage remains comprehensive for all component functionality
- New tests validate prop drilling behavior properly
- Missing prop scenarios are tested and handled gracefully
- Render props functionality is thoroughly tested
- All tests pass consistently
- TypeScript compilation succeeds
- No linting violations

**Dependencies**: Requires AC-007 (context removal completed)  
**Release Readiness Checklist**:
□ All tests passing  
□ Test coverage maintained  
□ Prop drilling tests comprehensive  
□ TypeScript compilation clean  
□ Linting clean  
□ Code review completed  

**Estimated Complexity**: Medium

---

## Atomic Change: AC-009 - Example Application Migration

**Group ID**: AC-009  
**Files Affected**: 
- `examples/react/src/App.tsx`
- `examples/next/src/app/[[...route]]/page.tsx` (if exists)
- `examples/next/src/pages/[[...route]].tsx` (if exists)
- Any other React example usage files

**Description**: Update all React example applications to use the new prop drilling patterns and validate RSC compatibility.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Update React CSR example to use render props pattern for page access
2. [PENDING] Task: Replace BrPageContext.Consumer usage with render props in React example
3. [PENDING] Task: Update Next.js example to demonstrate RSC compatibility if applicable
4. [PENDING] Task: Ensure all BrComponent usages include required page and mapping props
5. [PENDING] Task: Update component mapping examples to work with new prop requirements
6. [PENDING] Task: Test React CSR example application runs without errors
7. [PENDING] Task: Test Next.js example application builds and runs successfully
8. [PENDING] Task: Add RSC compatibility demonstration if Next.js App Router is used
9. [PENDING] Task: Update example README files with new usage patterns
10. [PENDING] Task: Run build process for all React examples
11. [PENDING] Task: Run linting for all updated example files

**Atomic Change Acceptance Criteria**:
- All React examples work with new prop drilling architecture
- Render props pattern is properly demonstrated
- RSC compatibility is validated where applicable
- All example applications build and run successfully
- Documentation reflects new usage patterns
- No runtime errors in example applications
- Examples demonstrate best practices for new architecture

**Dependencies**: Requires AC-008 (all SDK changes completed)  
**Release Readiness Checklist**:
□ All examples building successfully  
□ All examples running without errors  
□ RSC compatibility validated  
□ Documentation updated  
□ Code review completed  

**Estimated Complexity**: Medium

---

## Atomic Change: AC-010 - Integration Validation and Documentation

**Group ID**: AC-010  
**Files Affected**: 
- `packages/react-sdk/README.md`
- Root level documentation files
- Any migration guide documentation

**Description**: Final validation of the complete migration with comprehensive testing, performance validation, and documentation updates.

**Tasks in This Atomic Change**:
1. [PENDING] Task: Run complete build process for entire monorepo with `pnpm build`
2. [PENDING] Task: Run complete test suite for entire monorepo with `pnpm test`
3. [PENDING] Task: Run complete linting for entire monorepo with `pnpm lint`
4. [PENDING] Task: Validate bundle size reduction from context code removal
5. [PENDING] Task: Test RSC compatibility with Next.js App Router integration
6. [PENDING] Task: Update React SDK README.md with new prop drilling usage patterns
7. [PENDING] Task: Add migration guide documentation for breaking changes
8. [PENDING] Task: Document render props pattern usage examples
9. [PENDING] Task: Update API documentation to reflect new required props
10. [PENDING] Task: Verify all example applications work end-to-end
11. [PENDING] Task: Run performance benchmarks comparing before/after if possible
12. [PENDING] Task: Create final validation checklist for QA testing

**Atomic Change Acceptance Criteria**:
- Entire monorepo builds successfully
- All tests pass across the entire repository
- Linting passes with no violations
- Bundle size shows measurable reduction
- RSC compatibility is confirmed with real Next.js integration
- Documentation is comprehensive and accurate
- Migration guide clearly explains breaking changes
- All examples demonstrate proper usage
- Performance metrics are acceptable

**Dependencies**: Requires AC-009 (all changes completed)  
**Release Readiness Checklist**:
□ Complete monorepo build successful  
□ All tests passing  
□ All linting clean  
□ Documentation complete and accurate  
□ RSC compatibility confirmed  
□ Migration guide ready  
□ Code review completed  
□ QA validation ready  

**Estimated Complexity**: Low

---

## Implementation Summary

**Total Atomic Changes**: 10  
**Total Files Modified**: 41  
**Estimated Timeline**: Based on complexity distribution:
- Low Complexity: 3 atomic changes  
- Medium Complexity: 5 atomic changes  
- High Complexity: 2 atomic changes  

**Key Integration Points**:
- **AC-001** establishes TypeScript foundation for all subsequent changes
- **AC-002-004** form the core component migration that must be completed together
- **AC-005-006** complete the component ecosystem migration
- **AC-007** removes legacy context infrastructure entirely
- **AC-008-010** provide validation and documentation closure

**Rollback Strategy**: Each atomic change can be independently reverted, but due to the breaking nature of this change, rollback would require restoring the previous context-based architecture.

**Testing Strategy**: Each atomic change includes comprehensive testing updates to ensure functionality is preserved while moving from context to prop drilling.