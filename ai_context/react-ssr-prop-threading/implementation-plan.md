# Implementation Plan: React SDK Context to Prop Drilling Migration for RSC Support

## Executive Summary

This implementation plan provides a complete migration of the Bloomreach React SDK from React Context-based state management to prop drilling, enabling React Server Components (RSC) support. The implementation will be done in one complete change with subtasks for progress tracking.

**Scope**: 41 files requiring modification across the React SDK
**Approach**: Breaking change implementation with direct context removal
**Validation**: Comprehensive testing, RSC compatibility validation, and example application updates

---

## Implementation Overview

The migration will be implemented as a single comprehensive change rather than atomic changes to avoid backwards compatibility constraints. This is a **MAJOR BREAKING CHANGE** requiring a major version bump. Progress will be tracked through subtasks organized by functional areas.

## Task 1: TypeScript Interface Foundation [COMPLETED]

**Files Affected**: `packages/react-sdk/src/component/BrProps.tsx`

**Description**: Complete rewrite of core TypeScript interfaces to support required prop drilling architecture, establishing the foundation for all subsequent changes. This is a **BREAKING CHANGE**.

**Current Interface**:
```typescript
export interface BrProps<T extends Component = Component> {
  component?: T;
  page?: Page;
}
```

**New Interface Architecture**:
```typescript
// Base interface for core SDK functionality
export interface BrCoreProps {
  /** The current brXM Page instance - REQUIRED */
  page: Page;
  /** Component mapping for dynamic resolution - REQUIRED */
  mapping: BrMapping;
}

// Extended interface for components with component data
export interface BrComponentProps extends BrCoreProps {
  /** The current brXM Component instance */
  component?: Component;
}

// Complete rewrite requiring page and mapping
export interface BrProps<T extends Component = Component> {
  /** The mapped component instance */
  component?: T;
  /** The current brXM Page instance - REQUIRED */
  page: Page;
  /** Component mapping for dynamic resolution - REQUIRED */
  mapping: BrMapping;
}

// Render props interface for BrPage children function
export interface BrPageRenderProps {
  page?: Page;
  component?: Component;  
  mapping: BrMapping;
}
```

**Subtasks**:
1. **BREAKING**: Rewrite `BrProps` interface to make `page` and `mapping` required properties
2. Create new `BrCoreProps` interface as base for all component props
3. Create new `BrComponentProps` interface extending `BrCoreProps`
4. Create `BrPageRenderProps` interface for render props pattern support
5. Add comprehensive JSDoc documentation explaining breaking changes
6. Add TypeScript compilation validation for required props

---

## Task 2: Core Component Migration (BrPage) [COMPLETED]

**Files Affected**: `packages/react-sdk/src/page/BrPage.tsx`, `packages/react-sdk/src/page/BrPage.spec.tsx`

**Description**: **BREAKING**: Complete rewrite of BrPage component from context providers to prop drilling with render props support.

**New BrPage Interface**:
```typescript
interface BrPageProps {
  configuration: Configuration;
  mapping: BrMapping;
  page?: Page | PageModel;
  children?: React.ReactNode | ((props: BrPageRenderProps) => React.ReactNode);
}
```

**Implementation Pattern**:
```typescript
export function BrPage({
  configuration,
  mapping,
  page: initialPage,
  children,
}: BrPageProps): React.ReactElement | null {
  // State management with proper initialization
  // Always wrap children with BrNode - support both render props and regular children
  return (
    <BrNode 
      page={page!} 
      mapping={mapping} 
      component={component}
    >
      {typeof children === 'function' 
        ? children({ page, component, mapping })
        : children
      }
    </BrNode>
  );
}
```

**Subtasks**:
1. **BREAKING**: Remove `BrPageContext.Provider` and `BrMappingContext.Provider` usage entirely
2. **BREAKING**: Update BrPageProps interface to match technical design specification
3. Implement render props support with `BrPageRenderProps` type
4. Add state management logic for page initialization matching technical design
5. Implement prop drilling by always wrapping children with BrNode component
6. Add useEffect hooks for page synchronization as specified in technical design
7. **BREAKING**: Update BrPage.spec.tsx to test prop drilling instead of context provision
8. Add comprehensive tests for render props pattern functionality
9. Add tests for both function children and regular children patterns
10. Add RSC compatibility validation tests

---

## Task 3: Core Component Migration (BrNode) [COMPLETED]

**Files Affected**: `packages/react-sdk/src/component/BrNode.tsx`, `packages/react-sdk/src/component/BrNode.spec.tsx`

**Description**: **BREAKING**: Complete rewrite of BrNode component from context consumption/provision to pure prop threading following technical design specification.

**New BrNode Interface**:
```typescript
interface BrNodeProps extends BrComponentProps {
  // Inherits page, mapping, component? from BrComponentProps
}
```

**Implementation Pattern**:
```typescript
export function BrNode({ 
  children, 
  component, 
  page, 
  mapping
}: React.PropsWithChildren<BrNodeProps>): React.ReactElement {
  function renderNode(): React.ReactElement | React.ReactNode {
    if (React.Children.count(children)) {
      return <BrMeta meta={component?.getMeta()}>{children}</BrMeta>;
    }

    // Pass down all props to child components
    const childrenList = component?.getChildren().map((child, index) => (
      <BrNode 
        key={index} 
        component={child}
        page={page}
        mapping={mapping}
      />
    ));

    const nodeProps: BrProps = { component, page, mapping };

    if (isContainer(component)) {
      return <BrNodeContainer {...nodeProps}>{childrenList}</BrNodeContainer>;
    }
    if (isContainerItem(component)) {
      return <BrNodeContainerItem {...nodeProps}>{childrenList}</BrNodeContainerItem>;
    }
    return <BrNodeComponent {...nodeProps}>{childrenList}</BrNodeComponent>;
  }

  return <>{renderNode()}</>;
}
```

**Subtasks**:
1. **BREAKING**: Remove `BrComponentContext.Provider` usage entirely
2. **BREAKING**: Remove `BrPageContext` consumption via useContext
3. **BREAKING**: Update BrNodeProps interface to extend `BrComponentProps`
4. Implement exact `renderNode()` logic from technical design specification
5. Implement prop threading to `BrNodeContainer`, `BrNodeComponent`, and `BrNodeContainerItem`
6. Update children rendering logic to pass props to child BrNode instances
7. **BREAKING**: Update BrNode.spec.tsx to provide required props instead of context
8. Add tests for component type resolution (container, containerItem, component)
9. Add tests for prop threading to child components
10. Add tests for BrMeta rendering with component metadata

---

## Task 4: Core Component Migration (BrComponent) [COMPLETED]

**Files Affected**: `packages/react-sdk/src/component/BrComponent.tsx`, `packages/react-sdk/src/component/BrComponent.spec.tsx`

**Description**: **BREAKING**: Migrate BrComponent from context consumption to prop-based component resolution following technical design.

**New BrComponent Interface**:
```typescript
interface BrComponentProps extends BrComponentProps {
  path?: string;
}
```

**Implementation Pattern**:
```typescript
export function BrComponent({ 
  path, 
  children, 
  component, 
  page, 
  mapping
}: React.PropsWithChildren<BrComponentProps>): React.ReactElement {
  function getComponents(): Component[] {
    if (!component || Object.keys(component).length === 0) {
      return [];
    }
    if (!path) {
      return component.getChildren();
    }
    const targetComponent = component.getComponent(...path.split('/'));
    return targetComponent ? [targetComponent] : [];
  }

  function renderComponents(): React.ReactElement[] {
    return getComponents().map((comp, index) => (
      <BrNode 
        key={index} 
        component={comp}
        page={page}
        mapping={mapping}
      >
        {children}
      </BrNode>
    ));
  }

  return <>{renderComponents()}</>;
}
```

**Subtasks**:
1. **BREAKING**: Remove `useContext(BrComponentContext)` and use `props.component` instead
2. **BREAKING**: Update BrComponentProps interface to extend `BrComponentProps` 
3. Implement exact `getComponents()` logic from technical design
4. Implement exact `renderComponents()` logic threading props to child BrNode components
5. Update component path resolution to use `props.component` directly
6. **BREAKING**: Update BrComponent.spec.tsx to provide required props
7. Add tests for path-based component resolution with props
8. Add tests for component children rendering without path
9. Add tests for empty component handling
10. Add tests for nested component path resolution

---

## Task 5: Node Component Migration [COMPLETED]

**Files Affected**: 
- `packages/react-sdk/src/component/BrNodeComponent.tsx`
- `packages/react-sdk/src/component/BrNodeContainer.tsx` 
- `packages/react-sdk/src/component/BrNodeContainerItem.tsx`
- `packages/react-sdk/src/component/BrNodeComponent.spec.tsx`
- `packages/react-sdk/src/component/BrNodeContainer.spec.tsx`
- `packages/react-sdk/src/component/BrNodeContainerItem.spec.tsx`

**Description**: **BREAKING**: Migrate all node-level components from context consumption to prop-based data access following technical design specifications.

**BrNodeComponent Implementation**:
```typescript
export function BrNodeComponent<T extends Component>(
  props: React.PropsWithChildren<BrProps<T>>
): React.ReactElement {
  const { component, page, mapping, children } = props;

  const resolvedMapping = component && (mapping[component.getName()] as React.ComponentType<BrProps>);
  const meta = component?.getMeta();

  const componentProps: BrProps<T> = { component, page, mapping };
  const content = resolvedMapping ? React.createElement(resolvedMapping, componentProps) : children;

  return React.createElement(BrMeta, { meta }, content);
}
```

**Subtasks**:
1. **BREAKING**: Remove `useContext(BrMappingContext)` from BrNodeComponent and use `props.mapping`
2. **BREAKING**: Update BrNodeComponent to receive `page`, `mapping`, and `component` via props
3. Implement exact component mapping resolution logic from technical design
4. **BREAKING**: Update BrNodeContainer to accept and use `BrProps` interface
5. **BREAKING**: Update BrNodeContainerItem to accept and use `BrProps` interface
6. Implement component resolution using `props.mapping` directly
7. **BREAKING**: Update all test files to provide props instead of context
8. Add tests for component mapping resolution with props
9. Add tests for missing component mapping handling
10. Add tests for component metadata rendering via BrMeta

---

## Task 6: CMS Component Migration [COMPLETED]

**Files Affected**: 
- `packages/react-sdk/src/cms/BrManageContentButton.tsx`
- `packages/react-sdk/src/cms/BrManageMenuButton.tsx`
- All container component files (BrContainerBox, BrContainerInline, BrContainerNoMarkup, BrContainerOrderedList, BrContainerUnorderedList, BrContainerItemUndefined)
- All corresponding test files

**Description**: **BREAKING**: Migrate all CMS and container components from context consumption to required prop interfaces.

**Updated Interface Pattern**:
```typescript
interface BrManageContentButtonProps extends BrCoreProps {
  // ... existing props
}

export function BrManageContentButton(
  props: BrManageContentButtonProps
): React.ReactElement {
  const { page, mapping } = props;
  // Direct prop usage - no context fallback needed
}
```

**Subtasks**:
1. **BREAKING**: Update BrManageContentButton interface to extend `BrCoreProps` (require page and mapping)
2. **BREAKING**: Remove `useContext(BrPageContext)` from BrManageContentButton and use `props.page`
3. **BREAKING**: Update BrManageMenuButton interface to extend `BrCoreProps`
4. **BREAKING**: Remove `useContext(BrPageContext)` from BrManageMenuButton and use `props.page`
5. **BREAKING**: Update all container components to accept `BrProps` with required page and mapping
6. **BREAKING**: Update all CMS and container component test files to provide required props
7. Add tests for preview mode functionality using `props.page`
8. Add tests for missing page prop validation
9. Add tests for CMS component rendering in preview mode
10. Validate container component prop threading

---

## Task 7: Context Infrastructure Removal [COMPLETED]

**Files Affected**: 
- `packages/react-sdk/src/page/BrPageContext.ts`
- `packages/react-sdk/src/component/BrComponentContext.ts`
- `packages/react-sdk/src/component/BrMappingContext.ts`
- `packages/react-sdk/src/utils/withContextProvider.tsx`
- `packages/react-sdk/src/index.ts` (export removal)
- `packages/react-sdk/src/page/index.ts` (export removal)
- `packages/react-sdk/src/component/index.ts` (export removal)

**Description**: **BREAKING**: Remove all React Context infrastructure entirely since components now use prop drilling.

**Subtasks**:
1. **BREAKING**: Delete `BrPageContext.ts` file entirely
2. **BREAKING**: Delete `BrComponentContext.ts` file entirely  
3. **BREAKING**: Delete `BrMappingContext.ts` file entirely
4. **BREAKING**: Delete `withContextProvider.tsx` utility file entirely
5. **BREAKING**: Remove context-related exports from all index files
6. Search codebase for any remaining context imports or usage
7. Remove any context-related utility functions
8. Validate no context references remain in the codebase
9. Update TypeScript imports across all files
10. Verify build process with context code removed

---

## Task 8: Test Suite Comprehensive Update [COMPLETED]

**Files Affected**: All remaining test files not updated in previous tasks (approximately 15 additional test files)

**Description**: Update any remaining test files to use prop-based testing patterns instead of context utilities, ensuring complete test coverage for the new prop drilling architecture.

**Testing Pattern Changes**:
```typescript
// BEFORE: Context-based testing
const wrapper = mount(
  <BrPageContext.Provider value={mockPage}>
    <BrMappingContext.Provider value={mockMapping}>
      <BrNodeComponent />
    </BrMappingContext.Provider>
  </BrPageContext.Provider>
);

// AFTER: Prop-based testing
const wrapper = mount(
  <BrNodeComponent 
    page={mockPage} 
    mapping={mockMapping} 
    component={mockComponent} 
  />
);
```

**Subtasks**:
1. Identify all test files that still use `withContextProvider` utilities
2. **BREAKING**: Update test files to directly provide props instead of wrapping with context providers
3. Replace mock context values with mock prop values in test fixtures
4. Add new test cases for prop drilling validation
5. Add test cases for missing required props (should fail TypeScript compilation)
6. Add test cases for render props pattern functionality
7. Add RSC compatibility tests for server-side rendering
8. Add performance tests for prop drilling vs context (bundle size)
9. Add integration tests for complete prop flow
10. Validate test coverage maintains 100% for modified components

---

## Task 9: Example Application Migration [PENDING]

**Files Affected**: 
- `examples/react/src/App.tsx`
- `examples/next/src/app/[[...route]]/page.tsx` (if exists)
- `examples/next/src/pages/[[...route]].tsx` (if exists)
- Any other React example usage files

**Description**: **BREAKING**: Update all React example applications to use the new prop drilling patterns and validate RSC compatibility.

**Migration Pattern**:
```typescript
// BEFORE: Context Consumer Pattern
<BrPageContext.Consumer>
  {(page) => page && <div>{page.getTitle()}</div>}
</BrPageContext.Consumer>

// AFTER: Render Props Pattern  
<BrPage configuration={config} mapping={mapping}>
  {({ page }) => page && <div>{page.getTitle()}</div>}
</BrPage>
```

**Subtasks**:
1. **BREAKING**: Update React CSR example to use render props pattern for page access
2. **BREAKING**: Replace `BrPageContext.Consumer` usage with render props in React example
3. Update Next.js example to demonstrate RSC compatibility if applicable
4. **BREAKING**: Ensure all `BrComponent` usages include required `page` and `mapping` props
5. **BREAKING**: Update component mapping examples to work with new prop requirements
6. Test React CSR and Next.js example applications end-to-end
7. **BREAKING**: Update example README files with new usage patterns
8. Add RSC-specific example implementation if Next.js App Router available
9. Validate example applications build and run successfully
10. Create migration guide examples for breaking changes

---

## Task 10: Integration Validation and Documentation [PENDING]

**Files Affected**: 
- `packages/react-sdk/README.md`
- Root level documentation files
- Migration guide documentation

**Description**: Final validation of the complete migration with comprehensive testing and documentation updates.

**Component Example**:
```typescript
// Updated component pattern
export function MyBrComponent({ component, page, mapping }: BrProps) {
  const content = component?.getContent();
  
  return (
    <div>
      <h1>{content?.title}</h1>
      <p>{content?.description}</p>
    </div>
  );
}
```

**Subtasks**:
1. Run complete build process for entire monorepo with `pnpm build`
2. Run complete test suite for entire monorepo with `pnpm test`
3. Run complete linting for entire monorepo with `pnpm lint`
4. **BREAKING**: Update React SDK README.md with new prop drilling usage patterns
5. **BREAKING**: Create comprehensive migration guide documentation for breaking changes
6. Document render props pattern usage examples and migration patterns
7. **BREAKING**: Update API documentation to reflect new required props
8. Create final validation checklist for QA testing
9. Validate TypeScript compilation with strict mode for all changes

---

## Breaking Changes Summary

### Major Breaking Changes (Requires Major Version Bump)
- ❌ **Complete React Context removal**: All context providers, consumers, and utilities deleted
- ❌ **Required props**: `page` and `mapping` now required for all components
- ❌ **BrProps interface rewrite**: Complete interface change requiring page and mapping
- ❌ **Component signatures**: All components receive additional required props
- ❌ **BrPage API change**: No longer provides context, supports render props pattern
- ❌ **Utility function removal**: `withContextProvider` and related utilities deleted

### Migration Patterns
```typescript
// BEFORE: Context Consumer Pattern
<BrPageContext.Consumer>
  {(page) => page && <div>{page.getTitle()}</div>}
</BrPageContext.Consumer>

// AFTER: Render Props Pattern  
<BrPage configuration={config} mapping={mapping}>
  {({ page }) => page && <div>{page.getTitle()}</div>}
</BrPage>

// BEFORE: useContext Hook
const page = useContext(BrPageContext);

// AFTER: Direct prop usage
function MyComponent({ page, mapping }: BrProps) {
  // Use page and mapping directly from props
}
```

---

## Implementation Summary

**Total Tasks**: 10  
**Total Files Modified**: 41  
**Breaking Changes**: Yes - Major version bump required

**Implementation Approach**: Complete migration in a single comprehensive change with subtasks for progress tracking. This approach eliminates backwards compatibility constraints and enables full RSC support.

**Key Benefits**:
- **Full RSC compatibility** enabling server-side rendering and Next.js App Router support
- **Simplified architecture** with explicit prop flow
- **Future-proofing** for React ecosystem developments

**Testing Strategy**: Comprehensive testing updates ensure functionality is preserved while moving from context to prop drilling.