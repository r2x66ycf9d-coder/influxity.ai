import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content while preserving safe formatting tags
 * Use for rendering user-generated content or AI responses with formatting
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Strip all HTML tags and return plain text
 * Use for displaying content in contexts where HTML is not allowed
 */
export const sanitizeText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize HTML for use in dangerouslySetInnerHTML
 * Example: <div dangerouslySetInnerHTML={{ __html: sanitizeForReact(content) }} />
 */
export const sanitizeForReact = (dirty: string): string => {
  return sanitizeHTML(dirty);
};
