import sanitizeHTML from 'sanitize-html';

export function sanitize(content: string): string {
  return sanitizeHTML(content, {
    allowedAttributes: {
      a: ['href', 'name', 'target', 'title', 'data-type', 'rel'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedTags: sanitizeHTML.defaults.allowedTags.concat(['img']),
  });
}
