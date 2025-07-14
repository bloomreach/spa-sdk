# Context Analysis: React SDK Class to Functional Component Conversion

## Executive Summary
- **Topic Overview**: Convert React SDK class components to functional components with hooks
- **Scope**: 8 class components in packages/react-sdk requiring modernization
- **Complexity Assessment**: Medium to High - involves state management, lifecycle methods, and event handling patterns

## Technical Context

### Current Architecture

The Bloomreach SPA SDK React package (`packages/react-sdk`) contains a mix of class and functional components:

**Class Components (8 total - requiring conversion):**
1. `BrPage` (`src/page/BrPage.tsx`) - Core page component with state and full lifecycle
2. `BrNodeComponent` (`src/component/BrNodeComponent.ts`) - Base class for other components  
3. `BrComponent` (`src/component/BrComponent.tsx`) - Component wrapper
4. `BrNode` (`src/component/BrNode.tsx`) - Node renderer
5. `BrNodeContainer` (`src/component/BrNodeContainer.tsx`) - Container component
6. `BrNodeContainerItem` (`src/component/BrNodeContainerItem.tsx`) - Container item with event handling
7. `BrManageContentButton` (`src/cms/BrManageContentButton.tsx`) - Content management button
8. `BrManageMenuButton` (`src/cms/BrManageMenuButton.tsx`) - Menu management button

**Functional Components (7 total - already modern):**
- `BrContainerBox`, `BrContainerInline`, `BrContainerNoMarkup`, `BrContainerOrderedList`, `BrContainerUnorderedList`, `BrContainerItemUndefined`, `BrMeta`

### State Management Patterns

**BrPage Component (Complex State):**
- Uses `this.state = { page?: Page }` for page instance management
- Async state updates with `this.setState()` in try/catch blocks
- State-dependent rendering logic

**Event Handling Pattern:**
- `BrNodeContainerItem` subscribes to component update events in lifecycle methods
- Manual event listener management: `component.on('update', this.onUpdate)` and `component.off('update', this.onUpdate)`

### Lifecycle Methods Usage

**BrPage (`src/page/BrPage.tsx`):**
- `componentDidMount()` - Initialize page if not provided, sync existing page
- `componentDidUpdate()` - Handle configuration/page prop changes, force updates
- `componentWillUnmount()` - Cleanup with destroy() call

**BrNodeContainerItem (`src/component/BrNodeContainerItem.tsx`):**
- `componentDidMount()` - Subscribe to component update events
- `componentDidUpdate()` - Re-subscribe when component prop changes  
- `componentWillUnmount()` - Unsubscribe from events

### Component Hierarchy & Dependencies

**Base Class Pattern:**
```
BrNodeComponent (base class)
├── BrNodeContainer (extends BrNodeComponent<Container>)
└── BrNodeContainerItem (extends BrNodeComponent<ContainerItem>)
```

**Context Dependencies:**
- `BrPageContext` - Provides page instance to child components
- `BrMappingContext` - Provides component mapping configuration
- `BrComponentContext` - Component-specific context

### Integration Requirements

**External Dependencies:**
- `@bloomreach/spa-sdk` - Core SDK with Page, Component, Container interfaces
- React Context API for state sharing
- Event emitter pattern for component updates

**Testing Framework:**
- Jest with ts-jest preset
- @testing-library/react v16.2.0
- jsdom test environment
- Current tests use class component lifecycle testing patterns

### Constraints

**Technical Constraints:**
- Must maintain backward compatibility with existing public API
- React peer dependency: `^16.14 || ^17.0 || ^18.0 || ^19.0`
- TypeScript 4.5.5 compatibility required
- No breaking changes to component props/interfaces

**Business Constraints:**
- Component mapping system must remain unchanged
- CMS integration patterns must be preserved
- Event handling for content management features critical

## Similar Implementations

**Existing Functional Components:**
- `BrMeta` (`src/meta/BrMeta.tsx`) - Uses `useEffect` and `useRef` hooks
- Container components use simple functional patterns without state

**Hooks Usage Patterns:**
- `useEffect` for DOM manipulation in BrMeta
- `useRef` for DOM element references
- No custom hooks currently implemented

## Dependencies

**Conversion Blockers:**
- Need to establish patterns for converting base class inheritance
- Event listener management patterns need useEffect equivalents  
- Force update patterns need modern alternatives

**Testing Updates Required:**
- Lifecycle method tests need conversion to hook testing patterns
- Mock patterns for functional components
- Async state update testing with act()

## Conversion Complexity Assessment

**High Complexity:**
1. `BrPage` - Complex async state management, multiple lifecycle methods
2. `BrNodeContainerItem` - Event handling with lifecycle coordination

**Medium Complexity:**
1. `BrNodeComponent` - Base class conversion affects inheritance hierarchy
2. `BrNodeContainer` - Depends on base class pattern

**Low Complexity:**
1. `BrComponent`, `BrNode` - Simple rendering logic
2. `BrManageContentButton`, `BrManageMenuButton` - Minimal logic

## Recommended Conversion Order

1. Start with simple components (`BrManageContentButton`, `BrManageMenuButton`)
2. Convert `BrComponent` and `BrNode` (no inheritance dependencies)
3. Address `BrNodeComponent` base class pattern (affects inheritance)
4. Convert `BrNodeContainer` and `BrNodeContainerItem`
5. Finally convert `BrPage` (most complex state management)