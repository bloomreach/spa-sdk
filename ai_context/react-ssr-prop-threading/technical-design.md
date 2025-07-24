# Technical Design: React SDK Context to Prop Drilling Migration for RSC Support

## Executive Summary

This document outlines the technical design for migrating the Bloomreach React SDK from React Context-based state management to prop drilling, enabling React Server Components (RSC) support and server-side rendering compatibility.

## Problem Statement

The current React SDK relies heavily on React Context for state management:
- `BrPageContext`: Holds the current brXM Page instance
- `BrComponentContext`: Holds the current brXM Component instance  
- `BrMappingContext`: Holds the component mapping (component name → React component)

React Server Components cannot use React Context since they render on the server before the client runtime initializes. This prevents the SDK from being used in RSC-enabled applications like Next.js App Router.

**Decision**: Remove React Context entirely and replace with prop drilling for RSC compatibility.

## Current Architecture Analysis

### Context Dependencies
```
BrPage (Provider)
├── BrPageContext.Provider (Page instance)
├── BrMappingContext.Provider (Component mapping)
└── BrNode (Consumer + Provider)
    ├── BrComponentContext.Provider (Component instance)
    └── BrNodeComponent/BrNodeContainer/BrNodeContainerItem
        ├── useContext(BrMappingContext) → Component resolution
        └── useContext(BrPageContext) → Page access
```

### Key Context Usage Points
1. **BrPage.tsx:89-96**: Provides `BrPageContext` and `BrMappingContext`
2. **BrNode.tsx:31,43,51,58**: Consumes `BrPageContext`, provides `BrComponentContext`
3. **BrComponent.tsx:37**: Consumes `BrComponentContext`
4. **BrNodeComponent.tsx:24**: Consumes `BrMappingContext`

## Solution Architecture

### 1. Prop Drilling Interface Design

#### Core Props Interface
```typescript
interface BrCoreProps {
  /** The current brXM Page instance - required for all components */
  page: Page;
  /** Component mapping for dynamic component resolution - required for all components */
  mapping: BrMapping;
}

interface BrComponentProps extends BrCoreProps {
  /** The current brXM Component instance */
  component?: Component;
}
```

#### Enhanced BrProps Interface
```typescript
// Complete rewrite of BrProps to include all required context data
export interface BrProps<T extends Component = Component> extends BrCoreProps {
  /** The mapped component instance */
  component?: T;
}
```

### 2. Component Architecture Redesign

#### BrPage Component
```typescript
interface BrPageRenderProps {
  page?: Page;
  component?: Component;  
  mapping: BrMapping;
}

interface BrPageProps {
  configuration: Configuration;
  mapping: BrMapping;
  page?: Page | PageModel;
  children?: React.ReactNode | ((props: BrPageRenderProps) => React.ReactNode);
}

export function BrPage({
  configuration,
  mapping,
  page: initialPage,
  children,
}: BrPageProps): React.ReactElement | null {
  const [page, setPage] = useState<Page | undefined>(() => {
    return initialPage ? initialize(configuration, initialPage) : undefined;
  });

  useEffect(() => {
    let isMounted = true;

    const initializePage = async (): Promise<void> => {
      const newPage = initialPage ? initialize(configuration, initialPage) : await initialize(configuration);

      if (isMounted) {
        setPage(newPage);
      }
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, [configuration, initialPage]);

  useEffect(() => {
    page?.sync();
  }, [page]);

  if (!page && !configuration.NBRMode) {
    return null;
  }

  const component = page?.getComponent();

  // Support both render props and regular children
  if (typeof children === 'function') {
    return (
      <>
        {children({ page, component, mapping })}
        <BrNode 
          page={page!} 
          mapping={mapping} 
          component={component}
        />
      </>
    );
  }

  // Pure prop drilling - no context providers
  return (
    <BrNode 
      page={page!} 
      mapping={mapping} 
      component={component}
    >
      {children}
    </BrNode>
  );
}
```

#### BrNode Component
```typescript
interface BrNodeProps extends BrComponentProps {
  // No additional props needed
}

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

    const nodeProps: BrProps = {
      component,
      page,
      mapping
    };

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

#### BrNodeComponent Component
```typescript
export function BrNodeComponent<T extends Component>(
  props: React.PropsWithChildren<BrProps<T>>
): React.ReactElement {
  const { component, page, mapping, children } = props;

  const resolvedMapping = component && (mapping[component.getName()] as React.ComponentType<BrProps>);
  const meta = component?.getMeta();

  const componentProps: BrProps<T> = {
    component,
    page,
    mapping
  };

  const content = resolvedMapping ? React.createElement(resolvedMapping, componentProps) : children;

  return React.createElement(BrMeta, { meta }, content);
}
```

#### BrComponent Component
```typescript
interface BrComponentProps extends BrComponentProps {
  path?: string;
}

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

### 3. Container Components Updates

All container components (`BrNodeContainer`, `BrNodeContainerItem`) need to be updated to receive the required props:

```typescript
interface BrNodeContainerProps extends BrProps {}

export function BrNodeContainer({
  component,
  page,
  mapping,
  children
}: React.PropsWithChildren<BrNodeContainerProps>): React.ReactElement {
  // ... existing container logic
  // All container components now receive page and mapping via props
}
```

### 4. CMS Components Integration

Components like `BrManageContentButton` and `BrManageMenuButton` need to be updated to require page prop:

```typescript
interface BrManageContentButtonProps extends BrCoreProps {
  // ... existing props
}

export function BrManageContentButton(
  props: BrManageContentButtonProps
): React.ReactElement {
  const { page, mapping } = props;

  // Direct prop usage - no context fallback needed
  // ... rest of component logic using page and mapping props
}
```

## Migration Strategy

### Single Phase: Direct Context Removal (Breaking Change)
This will be a breaking change requiring a major version bump.

#### Implementation Steps:
1. **Remove all React Context usage**:
   - Delete `BrPageContext.ts`, `BrComponentContext.ts`, `BrMappingContext.ts`
   - Remove all `useContext` calls and context providers
   - Delete `withContextProvider.tsx` utility functions

2. **Update all component interfaces**:
   - Make `page` and `mapping` required props throughout the component tree
   - Update `BrProps` interface to include required context data
   - Add proper TypeScript enforcement for required props

3. **Implement prop drilling**:
   - Update `BrPage` to pass props to child components
   - Update `BrNode` to forward props to all child components
   - Update all container and CMS components to accept required props

4. **Update all example applications**:
   - Ensure all examples work with the new prop drilling approach
   - Update documentation and README files
   - Test RSC compatibility with Next.js App Router

#### Breaking Changes:
- **BrPage**: No longer provides context, supports render props pattern for page access
- **BrComponent**: Now requires `page` and `mapping` props when used standalone
- **BrManageContentButton/BrManageMenuButton**: Now require `page` prop
- **All container components**: Now require `page` and `mapping` props
- **Custom mapped components**: Now receive `page` and `mapping` via `BrProps`

#### Migration Patterns:
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

// AFTER: Render Props with Custom Hook
function useBrPage() {
  // Custom hook can be created to encapsulate render props logic
  const [pageData, setPageData] = useState(null);
  
  const PageProvider = ({ children, ...props }) => (
    <BrPage {...props}>
      {(renderProps) => {
        useEffect(() => setPageData(renderProps), [renderProps]);
        return children;
      }}
    </BrPage>
  );
  
  return { pageData, PageProvider };
}
```

## Implementation Details

### 1. TypeScript Interface Evolution

#### Current Interface
```typescript
// packages/react-sdk/src/component/BrProps.tsx
export interface BrProps<T extends Component = Component> {
  component?: T;
  page?: Page;
}
```

#### New Interface (Breaking Change)
```typescript
// Complete rewrite requiring page and mapping
export interface BrProps<T extends Component = Component> {
  /** The mapped component instance */
  component?: T;
  /** The current brXM Page instance - REQUIRED */
  page: Page;
  /** Component mapping for dynamic resolution - REQUIRED */
  mapping: BrMapping;
}

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
```

### 2. Component Resolution Logic

```typescript
// Simplified prop drilling pattern - no context resolution needed
function resolveComponentMapping(
  componentName: string,
  mapping: BrMapping
): React.ComponentType<BrProps> | undefined {
  return mapping[componentName] as React.ComponentType<BrProps>;
}

// Example usage in BrNodeComponent
export function BrNodeComponent<T extends Component>({
  component,
  page,
  mapping,
  children
}: React.PropsWithChildren<BrProps<T>>): React.ReactElement {
  const resolvedMapping = component && resolveComponentMapping(component.getName(), mapping);
  const meta = component?.getMeta();

  const componentProps: BrProps<T> = { component, page, mapping };
  const content = resolvedMapping ? React.createElement(resolvedMapping, componentProps) : children;

  return React.createElement(BrMeta, { meta }, content);
}
```

### 3. Render Props Pattern for Page Access

```typescript
// Current context pattern (to be replaced)
<BrPage configuration={configuration} mapping={mapping}>
  <BrPageContext.Consumer>
    {(page) => page && (
      <Link to={page.getUrl('/')} className="navbar-brand">
        {page.getTitle() || 'brXM + React = ♥️'}
      </Link>
    )}
  </BrPageContext.Consumer>
  <BrComponent path="main" />
</BrPage>

// New render props pattern
<BrPage configuration={configuration} mapping={mapping}>
  {({ page, component, mapping }) => (
    <>
      <header>
        <nav className="navbar navbar-expand-sm navbar-dark sticky-top bg-dark">
          <div className="container">
            {page && (
              <Link to={page.getUrl('/')} className="navbar-brand">
                {page.getTitle() || 'brXM + React = ♥️'}
              </Link>
            )}
            <div className="collapse navbar-collapse">
              <BrComponent path="menu" page={page} mapping={mapping}>
                <Menu />
              </BrComponent>
            </div>
          </div>
        </nav>
      </header>
      <section className="container flex-fill pt-3">
        <BrComponent path="main" page={page} mapping={mapping} />
      </section>
    </>
  )}
</BrPage>

// Alternative: Mixed usage with regular children
<BrPage configuration={configuration} mapping={mapping}>
  {({ page }) => (
    <header>
      {page && (
        <Link to={page.getUrl('/')} className="navbar-brand">
          {page.getTitle() || 'brXM + React = ♥️'}
        </Link>
      )}
    </header>
  )}
  {/* Regular children are rendered after render props */}
  <BrComponent path="main" />
</BrPage>
```

### 4. Server Component Compatibility

```typescript
// RSC-compatible component example
export function MyBrComponent({ component, page, mapping }: BrProps) {
  // This component can now run on the server - no context dependencies
  const content = component?.getContent();
  
  return (
    <div>
      <h1>{content?.title}</h1>
      <p>{content?.description}</p>
    </div>
  );
}

// Usage in Next.js App Router (RSC) - Server Component
export default async function Page() {
  // Fetch page model on server
  const pageModel = await fetchPageModel();
  
  return (
    <BrPage 
      configuration={config}
      mapping={mapping}
      page={pageModel} // Pre-fetched page model
    >
      {({ page }) => (
        <head>
          <title>{page?.getTitle() || 'Default Title'}</title>
        </head>
      )}
    </BrPage>
  );
}
```

### 5. Performance Optimizations

#### Bundle Size Reduction
- **Context code removal** reduces bundle size by eliminating context providers and utilities
- **Simplified component tree** with no context provider wrapping
- **Direct prop access** eliminates context lookup overhead

#### Runtime Performance
- **Prop drilling** provides direct prop access without context traversal
- **Predictable re-renders** since props flow explicitly down the tree
- **Better tree shaking** opportunities without context dependencies

## Testing Strategy

### 1. Component Prop Testing
```typescript
describe('BrPage Prop Drilling', () => {
  test('should pass page and mapping props to child components', () => {
    const page = mockPage();
    const mapping = mockMapping();
    
    render(
      <BrPage configuration={config} mapping={mapping} page={page}>
        <BrComponent path="main/content" />
      </BrPage>
    );
    
    // Verify props are passed correctly through component tree
    expect(screen.getByTestId('br-component')).toHaveAttribute('data-page', page.getId());
  });
});
```

### 2. Component Interface Testing  
```typescript
describe('BrProps Interface', () => {
  test('should require page and mapping props', () => {
    // TypeScript compilation test
    const validProps: BrProps = {
      page: mockPage(),
      mapping: mockMapping(),
      component: mockComponent()
    };
    
    // This should compile without errors
    const component = <BrNodeComponent {...validProps} />;
    expect(component).toBeDefined();
  });
});
```

### 3. RSC Compatibility Testing
```typescript
describe('React Server Components', () => {
  test('should render on server without context dependencies', async () => {
    const pageModel = mockPageModel();
    
    // Server-side rendering test
    const html = await renderToString(
      <BrPage 
        configuration={config} 
        mapping={mapping} 
        page={pageModel}
      />
    );
    expect(html).toContain('expected content');
    expect(html).not.toContain('useContext'); // No context dependencies
  });
});
```

### 4. Integration Testing
- **Next.js App Router integration** with actual RSC environment
- **Performance benchmarks** comparing before/after prop drilling
- **Bundle size analysis** after context removal
- **Example application validation** across all framework targets

## Breaking Changes Assessment

### Breaking Changes (Major Version - Required)
- ❌ **Removing React Context entirely** - Context providers, consumers, and utilities deleted
- ❌ **Making page and mapping required props** - All components now require these props
- ❌ **Changing component interfaces** - BrProps now requires page and mapping
- ❌ **Removing withContextProvider utilities** - No longer needed with prop drilling
- ❌ **Updating component signatures** - All components receive additional required props

## Conclusion

This technical design provides a direct path to RSC compatibility through complete React Context removal and prop drilling implementation. While this constitutes a major breaking change, it positions the Bloomreach React SDK for modern React development patterns.

**Key Benefits:**
- **Full RSC compatibility** enabling server-side rendering and Next.js App Router support
- **Bundle size reduction** through context provider elimination
- **Performance improvements** via direct prop access
- **Simplified architecture** with explicit prop flow
- **Render props pattern** maintains page access flexibility without context
- **Future-proofing** for React ecosystem developments

**Migration Impact:**
- **Major version bump required** due to breaking interface changes
- **All existing applications** must update component usage patterns
- **Comprehensive migration guide** will ease transition process
- **Long-term benefits** outweigh short-term migration effort

The prop drilling architecture enables cutting-edge React features while maintaining the core brXM SDK functionality developers expect.
