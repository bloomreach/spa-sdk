type NavigationListener = (path: string) => void;

const listeners = new Set<NavigationListener>();

export function getPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function navigate(url: string, options?: { replace?: boolean }): void {
  const resolved = new URL(url, window.location.origin);
  const path = `${resolved.pathname}${resolved.search}`;

  if (path === getPath()) {
    return;
  }

  if (options?.replace) {
    history.replaceState(null, '', path);
  } else {
    history.pushState(null, '', path);
  }

  notify(path);
}

function notify(path: string): void {
  listeners.forEach((listener) => listener(path));
}

export function subscribe(listener: NavigationListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isExternalUrl(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.origin);
    return resolved.origin !== window.location.origin;
  } catch {
    return true;
  }
}

export function handleInternalLinkClick(event: Event): void {
  const anchor = event.currentTarget;

  if (!(anchor instanceof HTMLAnchorElement)) {
    return;
  }

  if (
    event.defaultPrevented
    || event instanceof MouseEvent && (
      event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    )
  ) {
    return;
  }

  if (anchor.target === '_blank' || isExternalUrl(anchor.href)) {
    return;
  }

  event.preventDefault();
  navigate(anchor.href);
}

export function handleInternalContentLinkClick(event: Event): void {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const anchor = target.closest('a[data-type="internal"]');

  if (!(anchor instanceof HTMLAnchorElement)) {
    return;
  }

  handleInternalLinkClick({ ...event, currentTarget: anchor });
}

window.addEventListener('popstate', () => {
  notify(getPath());
});
