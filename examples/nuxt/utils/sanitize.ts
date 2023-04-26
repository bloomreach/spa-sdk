import sanitizeHTML from 'sanitize-html';

export function sanitize(content: string): string {
  return sanitizeHTML(content, { allowedAttributes: { a: ['href', 'name', 'target', 'title', 'data-type', 'rel'] } });
}
