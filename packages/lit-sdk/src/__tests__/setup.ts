/**
 * Vitest setup file.
 * Silences Lit dev mode warnings in test output and provides any global stubs.
 */

// Silence Lit dev-mode warnings that pollute test output
// Lit checks for window.litIssuedWarnings to avoid duplicate warnings
(globalThis as any).litIssuedWarnings ??= new Set();

// Custom element registry can't re-register the same tag name.
// We keep a global set of registered tags so tests don't fail when
// the same module is imported across multiple test files.
const originalDefine = customElements.define.bind(customElements);
customElements.define = (name: string, ctor: CustomElementConstructor, options?: ElementDefinitionOptions) => {
  if (!customElements.get(name)) {
    originalDefine(name, ctor, options);
  }
};
