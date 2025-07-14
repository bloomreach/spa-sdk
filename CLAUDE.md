# Bloomreach SPA SDK Monorepo

## Project Overview

This is a monorepo containing the Bloomreach SPA SDKs for integrating Single Page Applications with Bloomreach Experience Manager. The repository provides framework-specific SDKs (React, Vue, Angular) built on top of a core framework-agnostic SPA SDK.

### Core Purpose
- **SPA SDK**: Framework-independent core library for Page Model API integration and preview mode support
- **Framework SDKs**: React, Vue, and Angular-specific components and utilities
- **Examples**: Reference implementations for React (CSR/Next.js), Vue (CSR/Nuxt), and Angular (CSR/Universal)

## Repository Structure

### Packages (`packages/`)
- **`spa-sdk/`**: Core framework-agnostic SDK with Page Model API client, preview integration, and URL generation
- **`react-sdk/`**: React components and hooks for brXM integration
- **`vue-sdk/`**: Vue 3 components and composables for brXM integration  
- **`ng-sdk/`**: Angular directives, components, and services for brXM integration

### Examples (`examples/`)
- **`react/`**: Client-side rendered React app
- **`next/`**: Next.js SSR/SSG implementation
- **`vue/`**: Vue 3 client-side rendered app
- **`nuxt/`**: Nuxt SSR/SSG implementation
- **`angular/`**: Angular Universal SSR/CSR implementation

### Documentation (`docs/`)
- Astro-based documentation site deployed to GitHub Pages

### Package Documentation & Usage
Each package contains detailed README files with specific usage instructions:

**SDK Packages:**
- [`packages/spa-sdk/README.md`](./packages/spa-sdk/README.md) - Core SDK initialization and configuration
- [`packages/react-sdk/README.md`](./packages/react-sdk/README.md) - React component usage and patterns
- [`packages/vue-sdk/README.md`](./packages/vue-sdk/README.md) - Vue composables and component setup
- [`packages/ng-sdk/README.md`](./packages/ng-sdk/README.md) - Angular directives and service integration

**Example Applications:**
- [`examples/react/README.md`](./examples/react/README.md) - React CSR implementation guide
- [`examples/next/README.md`](./examples/next/README.md) - Next.js SSR/SSG patterns
- [`examples/vue/README.md`](./examples/vue/README.md) - Vue 3 CSR setup and routing
- [`examples/nuxt/README.md`](./examples/nuxt/README.md) - Nuxt SSR/SSG configuration
- [`examples/angular/README.md`](./examples/angular/README.md) - Angular Universal setup

## Package Management & Build System

### PNPM Workspace Configuration
This is a **pnpm workspace** monorepo defined in `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'     # SDK packages (spa-sdk, react-sdk, vue-sdk, ng-sdk)
  - 'examples/*'     # Example applications
  - 'docs'          # Documentation site
```

**Project Dependencies & Linking:**
- Framework SDKs depend on `@bloomreach/spa-sdk` as a workspace dependency
- Example apps consume their respective framework SDKs from the workspace
- `pnpm install` automatically links workspace dependencies for local development
- Topological dependency resolution ensures proper build order

**Conceptual Project Architecture:**
```
@bloomreach/spa-sdk (core)
├── @bloomreach/react-sdk → @bloomreach/example-react
│                         └── @bloomreach/example-next
├── @bloomreach/vue-sdk   → @bloomreach/example-vue  
│                         └── @bloomreach/example-nuxt
└── @bloomreach/ng-sdk    → @bloomreach/example-angular
```

**Dependency Flow:**
1. **Core SDK** (`spa-sdk`) provides framework-agnostic Page Model API integration
2. **Framework SDKs** wrap core functionality with framework-specific components/directives
3. **Example Apps** demonstrate real-world usage patterns and serve as integration tests
4. **Documentation** (`docs/`) aggregates usage guides and API references

### Build Tools by Package
- **SPA SDK**: Rollup with TypeScript, Babel, and Terser (UMD + ES modules)
- **React SDK**: Rollup with TypeScript, Babel, and Terser (UMD + ES modules)
- **Vue SDK**: Vite with TypeScript and Vue SFC support
- **Angular SDK**: Angular CLI with ng-packagr

### Output Formats
- **SPA/React SDKs**: UMD (`dist/index.umd.js`) and ES modules (`dist/index.js`) with TypeScript declarations
- **Vue SDK**: ES modules (`dist/index.js`) and UMD (`dist/index.umd.cjs`) with TypeScript declarations
- **Angular SDK**: Angular Package Format with FESM2022 bundles

## Development Commands

### Root Level Commands
```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages in topological order
pnpm dev              # Watch all SDK packages for changes
pnpm test             # Run tests across all packages
pnpm lint             # Run linting across all packages
```

### Optimized Package-Specific Commands
The `--filter` flag allows efficient, targeted operations:

**Build Commands:**
```bash
# Build specific package and its dependencies
pnpm --filter @bloomreach/spa-sdk run build
pnpm --filter @bloomreach/react-sdk run build    # Automatically builds spa-sdk first

# Build example with all dependencies  
pnpm --filter @bloomreach/example-react run build

# Build all SDK packages only (excludes examples)
pnpm --filter "./packages/*" run build
```

**Test Commands:**
```bash
# Test specific package only
pnpm --filter @bloomreach/spa-sdk run test
pnpm --filter @bloomreach/react-sdk run test

# Test with controlled concurrency
pnpm test --filter @bloomreach/spa-sdk --workspace-concurrency=1

# Test all packages sequentially (useful for CI)
pnpm -r --workspace-concurrency=1 test
```

**Development Workflow:**
```bash
# Watch all SDKs for changes (most common for development)
pnpm dev

# Watch specific SDK only (token-efficient)
pnpm --filter @bloomreach/react-sdk run dev

# Run example with hot reloading
cd examples/react && pnpm dev                  
```

**Lint Commands:**
```bash
# Lint specific package
pnpm --filter @bloomreach/react-sdk run lint

# Lint all with controlled concurrency
pnpm -r --workspace-concurrency=1 lint
```

## Architecture Patterns

### Core SDK Architecture
- **Dependency Injection**: Uses Inversify container for service management
- **Module System**: Separate modules for CMS integration, page management, URL handling
- **Page Model API**: Supports both v0.9 (deprecated) and v1.0 APIs
- **Preview Integration**: Automatic detection and PostMessage communication with brXM Experience Manager

### Framework SDK Patterns

All framework SDKs provide an identical set of core components with framework-specific implementations:

#### Standardized Components Across All Frameworks
- **Primary Components**: `BrPage`, `BrComponent`, `BrManageContentButton`, `BrManageMenuButton`
- **Container Components**: `BrContainerBox`, `BrContainerInline`, `BrContainerNoMarkup`, `BrContainerOrderedList`, `BrContainerUnorderedList`, `BrContainerItemUndefined`
- **Internal Components**: `BrNodeComponent`, `BrNodeContainer`, `BrNodeContainerItem`, `BrMeta`

**Note**: Components render HTML comments for Bloomreach Experience Manager preview integration rather than visible HTML elements (except container components). These comments contain metadata like `HST-Type`, `uuid`, and configuration data that enables CMS editing capabilities. Example comment formats:
- **Component markers**: `<!--{"HST-Type":"CONTAINER_ITEM_COMPONENT","uuid":"...", "HST-Label":"..."}-->`
- **Page metadata**: `<!--{"HST-Type":"PAGE-META-DATA","HST-Page-Id":"...","HST-Channel-Id":"..."}-->`
- **Content links**: `<!--{"HST-Type":"MANAGE_CONTENT_LINK","uuid":"..."}-->`

#### React SDK
- **State Management**: React Context API (`BrPageContext`, `BrComponentContext`, `BrMappingContext`)
- **Component Architecture**: Class components (being converted to functional) with hooks
- **Component Mapping**: `Record<keyof any, React.ComponentType<BrProps>>`
- **Pattern**: Provider/Consumer with Context API for dependency injection

#### Vue SDK  
- **State Management**: Composition API with injection keys (`page$`, `component$`, `mapping$`)
- **Component Architecture**: Vue 3 Single File Components with setup syntax
- **Component Mapping**: `Record<keyof any, Component | string>`
- **Pattern**: Reactive refs with provide/inject for dependency injection

#### Angular SDK
- **State Management**: Service-based with `BrPageService` using RxJS `BehaviorSubject`
- **Component Architecture**: Directive-based system with template projection
- **Component Mapping**: `Record<keyof any, Type<BrProps>>`
- **Pattern**: Angular services with dependency injection and structural directives

### Common Patterns Across SDKs
- **Container Management**: Unified container types (box, inline, lists, etc.)
- **Component Mapping**: Dynamic component resolution based on brXM component types
- **Meta Tag Injection**: SEO and page metadata management
- **Event Handling**: Component update notifications and preview mode events

## Testing Framework

### Test Configuration
- **SPA SDK**: Jest with ts-jest, jsdom environment, coverage reporting
- **React SDK**: Jest with @testing-library/react, snapshot testing
- **Vue SDK**: Vitest with @vue/test-utils
- **Angular SDK**: Jest with jest-preset-angular

### Testing Patterns
- **Unit Tests**: Component behavior, utility functions, service logic
- **Integration Tests**: SDK initialization, page model parsing
- **Snapshot Tests**: Component rendering output
- **Coverage**: Configured for all packages with CI reporting

## TypeScript Configuration

### Compiler Options
- **Target**: ES6 for SDKs, ES2020 for modern builds
- **Module System**: ES2020 with Node resolution
- **Strict Mode**: Enabled across all packages
- **Decorators**: Experimental decorators for dependency injection

### Package-Specific Settings
- **SPA SDK**: Includes DOM typings, reflects-metadata support
- **React SDK**: JSX support, React typings
- **Vue SDK**: Vue SFC support with separate configs for app/tests
- **Angular SDK**: Angular-specific TypeScript configuration

## Release & Deployment

### Versioning Strategy
- **Synchronized Versions**: All packages maintain same version (24.1.2)
- **Changesets**: Uses @changesets/cli for version management
- **Tagging**: Annotated tags with `spa-sdk-` prefix

### Release Process
1. Run `pnpm bump` to update versions
2. Create annotated tag: `git tag -a spa-sdk-[version]`
3. Push with tags: `git push --follow-tags`
4. Merge to main branch triggers release pipeline
5. Heroku deployment for example apps

### CI/CD Pipeline
- **Build Validation**: All packages must build successfully
- **Test Suite**: Complete test coverage across SDKs
- **Documentation**: TypeDoc generation and GitHub Pages deployment
- **Example Deployment**: Heroku apps for live demonstrations

## Branch Strategy

- **`main`**: Production-ready, released code only
- **`development`**: Integration branch for all development work
- **Feature Branches**: Branch from `development`, merge back via MR

## Development Guidelines

### Code Quality
- **ESLint**: Bloomreach-specific configurations for each framework
- **TypeScript**: Strict typing with framework-specific configurations
- **Testing**: Comprehensive test coverage required for all changes

### Performance Considerations
- **Bundle Size**: Terser optimization for production builds
- **Tree Shaking**: ES modules support for optimal bundling
- **Source Maps**: Available for debugging while excluding sources in production

### Framework Compatibility
- **React**: Supports v16.14+ through v19.0 (peer dependency)
- **Vue**: Requires Vue 3.2.45+ (peer dependency)
- **Angular**: Supports Angular 20+ (peer dependency)
- **Node.js**: Requires v20.0.0+ for development

## Key Integration Points

### Bloomreach APIs
- **Page Model API**: v0.9 (deprecated) and v1.0 support
- **Preview API**: Experience Manager integration for in-context editing
- **Relevance API**: Campaign and segmentation support
- **Content Delivery**: Document and asset retrieval

### CMS Features
- **Component Mapping**: Dynamic component resolution
- **Container Management**: Flexible layout system
- **Meta Management**: SEO and page metadata
- **Preview Mode**: Live editing capabilities
- **URL Generation**: SEO-friendly URL building
