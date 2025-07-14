# Technical Design: React SDK Class to Functional Component Conversion

## Architecture Analysis & Pattern Selection

### Phase 1.1: Existing Pattern Assessment

**Current Functional Component Patterns:**
- **BrMeta**: Uses `useEffect` + `useRef` for DOM manipulation and lifecycle management
- **Container Components**: Simple functional components with conditional rendering based on `page?.isPreview()`
- **Context Consumption**: Uses `BrProps<T>` interface consistently across components

**Established Patterns to Leverage:**
- Strong TypeScript interfaces with generic component types
- Context-based state sharing (`BrPageContext`, `BrMappingContext`)
- Consistent props structure via `BrProps<T extends Component>`
- Meta rendering pattern with DOM element references

**Architectural Constraints:**
- Must maintain backward compatibility with existing public APIs
- Event emitter pattern integration with Bloomreach SDK
- Context type safety preservation
- Component mapping system preservation

### Phase 1.2: Technology Stack Validation

**Current Stack Assessment:**
- React ^16.14 || ^17.0 || ^18.0 || ^19.0 - ✅ Hook support confirmed
- TypeScript 4.5.5 - ✅ Compatible with functional component patterns
- @bloomreach/spa-sdk event system - ✅ Compatible with useEffect cleanup
- Jest + @testing-library/react v16.2.0 - ✅ Supports hook testing patterns

**No New Dependencies Required:**
- All required functionality available in current React versions
- Existing test framework supports functional component testing

## Solution Architecture Design

### Phase 2.1: Component Architecture Definition

**Component Conversion Strategy:**

```typescript
// Pattern 1: Simple Component (BrManageContentButton)
// Before: class extends React.Component
// After: function component with useContext

// Pattern 2: Context Consumer (BrNodeComponent base pattern)
// Before: static contextType + this.context
// After: useContext hook with same interface

// Pattern 3: Event Handler (BrNodeContainerItem)
// Before: componentDidMount/Update/Unmount with manual event management
// After: useEffect with event subscription/cleanup

// Pattern 4: Complex State + Lifecycle (BrPage)
// Before: setState + multiple lifecycle methods
// After: useState + useEffect with multiple dependencies
```

**State Management Approach:**

1. **Local State Migration:**
   - `BrPage.state.page` → `useState<Page | undefined>`
   - Async initialization → `useEffect` with dependency array
   - Error handling → Error boundaries or state-based error handling

2. **Context Consumption Migration:**
   - `static contextType` → `useContext(BrMappingContext)`
   - Type safety preserved via existing context type definitions

3. **Force Update Pattern Replacement:**
   - `this.forceUpdate()` → State-based re-renders via `useState` setter
   - `page?.sync()` calls → `useCallback` for stability

### Phase 2.2: Data Flow & State Management

**Hook Pattern Definitions:**

```typescript
// Custom Hook: Page Initialization
function usePage(configuration: Configuration, initialPage?: Page | PageModel): Page | undefined {
  const [page, setPage] = useState<Page | undefined>(() => 
    initialPage ? initialize(configuration, initialPage) : undefined
  );
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!initialPage) {
      initialize(configuration)
        .then(setPage)
        .catch(setError);
    }
  }, [configuration, initialPage]);

  useEffect(() => {
    return () => {
      if (page) {
        destroy(page);
      }
    };
  }, [page]);

  if (error) throw error;
  
  return page;
}

// Custom Hook: Event Subscription
function useComponentEvents<T extends Component>(
  component: T | undefined, 
  page: Page | undefined,
  onUpdate: () => void
): void {
  const stableOnUpdate = useCallback(() => {
    onUpdate();
    page?.sync();
  }, [onUpdate, page]);

  useEffect(() => {
    if (component) {
      component.on('update', stableOnUpdate);
      return () => component.off('update', stableOnUpdate);
    }
  }, [component, stableOnUpdate]);
}
```

**Data Flow Architecture:**
- Context providers remain unchanged (BrPageContext, BrMappingContext)
- Component prop interfaces preserved (`BrProps<T>`)
- Event flow maintained through custom hooks
- Error boundaries handle async initialization errors

### Phase 2.3: Integration Points Design

**Breaking Changes Assessment:**
- **API Compatibility**: No breaking changes to public component APIs
- **Context Structure**: Existing context types and providers unchanged
- **Event System**: SDK event integration preserved through hooks
- **Component Mapping**: Mapping system and component registration unchanged

**Migration Strategy:**
- Components can be converted incrementally
- No changes required to consumer applications
- Existing tests require updates to hook testing patterns only

## Technical Specifications

### Phase 3.1: Implementation Specifications

**TypeScript Interface Preservation:**

```typescript
// Existing interfaces maintained
interface BrProps<T extends Component = Component> {
  component?: T;
  page?: Page;
}

interface BrPageProps {
  configuration: Configuration;
  mapping: React.ContextType<typeof BrMappingContext>;
  page?: Page | PageModel;
}

// New hook-specific types
type UsePageResult = {
  page: Page | undefined;
  isLoading: boolean;
  error: Error | undefined;
};
```

**Component Conversion Patterns:**

```typescript
// Pattern A: Simple Context Consumer
export function BrManageContentButton({ component, page }: BrProps<Component>): React.ReactElement | null {
  const mapping = useContext(BrMappingContext);
  // Component logic
}

// Pattern B: Event-Driven Component  
export function BrNodeContainerItem({ component, page, children }: React.PropsWithChildren<BrProps<ContainerItem>>): React.ReactElement {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  useComponentEvents(component, page, forceUpdate);
  
  // Component logic with same rendering behavior
}

// Pattern C: Complex State Management
export function BrPage({ configuration, mapping, page: initialPage, children }: React.PropsWithChildren<BrPageProps>): React.ReactElement | null {
  const page = usePage(configuration, initialPage);
  
  return (
    <BrPageContext.Provider value={page}>
      <BrMappingContext.Provider value={mapping}>
        {!page && !configuration.NBRMode && null}
        {(page || configuration.NBRMode) && <BrNode component={page?.getComponent()}>{children}</BrNode>}
      </BrMappingContext.Provider>
    </BrPageContext.Provider>
  );
}
```

**Base Class Pattern Replacement:**

```typescript
// Replace inheritance with composition
function useBrNodeComponent<T extends Component>({ component }: BrProps<T>) {
  const context = useContext(BrMappingContext);
  
  const getMapping = useCallback((): React.ComponentType<BrProps> | undefined => {
    return component && (context[component.getName()] as React.ComponentType<BrProps>);
  }, [component, context]);
  
  return { getMapping, meta: component?.getMeta() };
}
```

### Phase 3.2: Performance & Security Considerations

**Performance Optimizations:**
- `useCallback` for event handlers to prevent unnecessary re-subscriptions
- `useMemo` for expensive mapping lookups
- Dependency arrays optimized to prevent infinite re-renders
- Same bundle size - no additional dependencies

**Security Considerations:**
- No changes to existing security model
- Event handler cleanup prevents memory leaks
- Error boundaries handle async initialization failures

**Accessibility:**
- No impact on existing accessibility features
- Meta rendering behavior preserved

## Testing Strategy Definition

### Phase 4.1: Comprehensive Test Planning

**Unit Test Migration Patterns:**

```typescript
// Before: Class component lifecycle testing
wrapper.instance().componentDidMount();
expect(mockComponent.on).toHaveBeenCalledWith('update', expect.any(Function));

// After: Hook effect testing
render(<BrNodeContainerItem component={mockComponent} page={mockPage} />);
expect(mockComponent.on).toHaveBeenCalledWith('update', expect.any(Function));
```

**Test Requirements per Component:**

1. **BrPage Tests:**
   - Async page initialization with act()
   - Configuration change effects
   - Error handling and error boundaries
   - Context provider value updates

2. **BrNodeContainerItem Tests:**
   - Event subscription on mount
   - Event cleanup on unmount
   - Component prop change re-subscription
   - Force update triggering

3. **Simple Component Tests:**
   - Context consumption testing
   - Rendering behavior verification
   - Props passing verification

**Mock Requirements:**
- @bloomreach/spa-sdk mocks remain unchanged
- React Context mocking patterns
- Event emitter mocking for component events
- Async initialization mocking

**Testing Tools:**
- @testing-library/react-hooks for custom hook testing
- jest.spyOn for event handler verification
- act() wrapper for async operations
- renderHook utility for isolated hook testing

## Decision Framework

### Architecture Decision Record

**Decision: Custom Hooks for Complex Logic**
- **Rationale**: Promotes reusability and testability
- **Alternatives Considered**: Direct hook usage in components
- **Impact**: Better separation of concerns, easier testing

**Decision: Preserve Existing Error Handling**
- **Rationale**: Maintains backward compatibility
- **Alternatives Considered**: Error boundaries for all async operations
- **Impact**: No breaking changes to error handling behavior

**Decision: Incremental Conversion Strategy**
- **Rationale**: Reduces risk, allows gradual testing
- **Alternatives Considered**: Big bang conversion
- **Impact**: Safer migration path, easier rollback

### Technology Choice Validation

**Hook Selection Rationale:**
- `useState`: Direct replacement for component state
- `useEffect`: Lifecycle method replacement with cleanup
- `useContext`: Static contextType replacement
- `useCallback`: Event handler stability
- `useMemo`: Performance optimization for expensive operations
- Custom hooks: Complex logic encapsulation

## Implementation Phases

### Phase 1: Simple Components (Low Risk)
**Components**: BrManageContentButton, BrManageMenuButton
**Effort**: 1-2 days
**Pattern**: Context consumption only

### Phase 2: Medium Complexity Components
**Components**: BrComponent, BrNode
**Effort**: 2-3 days  
**Pattern**: Context + conditional rendering

### Phase 3: Base Class Conversion
**Components**: BrNodeComponent → useBrNodeComponent hook
**Effort**: 3-4 days
**Pattern**: Inheritance to composition

### Phase 4: Container Components
**Components**: BrNodeContainer, BrNodeContainerItem
**Effort**: 4-5 days
**Pattern**: Event handling + force updates

### Phase 5: Complex State Management
**Components**: BrPage
**Effort**: 5-6 days
**Pattern**: Async state + multiple effects + error handling

## Success Criteria

1. **Functional Parity**: All existing functionality preserved
2. **API Compatibility**: No breaking changes to public APIs
3. **Performance**: No performance degradation
4. **Test Coverage**: 100% test coverage maintained
5. **Type Safety**: Full TypeScript type safety preserved
6. **Documentation**: Internal documentation updated for new patterns

## Risk Mitigation

**Risk**: Event handling timing issues
**Mitigation**: Comprehensive integration testing with event simulation

**Risk**: Async initialization race conditions  
**Mitigation**: Proper useEffect dependency management and cleanup

**Risk**: Context re-rendering performance
**Mitigation**: Context value memoization and selective consumption

**Risk**: Testing complexity increase
**Mitigation**: Custom hook extraction for easier testing isolation