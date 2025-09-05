/**
 * Utility functions for detecting and converting URLs and emails to links
 */

export const detectLinks = (text) => {
  if (typeof text !== 'string') return text;
  
  // URL regex pattern (with http/https)
  const urlPattern = /(https?:\/\/[^\s"'>]+)/g;
  // Email regex pattern
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  // Domain pattern (without http/https)
  const domainPattern = /\b([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
  
  // 1) Sanitize broken/embedded HTML so we don't display raw attributes like style="..." or stray ">"
  let sanitized = text
    // Remove full HTML tags (we will re-linkify clean text)
    .replace(/<[^>]*>/g, '')
    // Unwrap common attribute fragments by keeping only the value
    .replace(/\b(href|style|class|target|rel)\s*=\s*"([^"]*)"/gi, '$2')
    // Remove orphaned '" >' or "'>" sequences left from stripped tags
    .replace(/["']\s*>/g, '')
    // Collapse extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  let result = sanitized;
  
  // Replace URLs with clickable links
  result = result.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  
  // Replace emails with mailto links
  result = result.replace(emailPattern, (email) => {
    return `<a href="mailto:${email}">${email}</a>`;
  });
  
  // Replace plain domains with clickable links
  result = result.replace(domainPattern, (domain) => {
    // Skip if it's already been processed as a URL or email
    if (domain.includes('://') || domain.includes('@')) {
      return domain;
    }
    return `<a href="https://${domain}" target="_blank" rel="noopener noreferrer">${domain}</a>`;
  });
  
  return result;
};

export const renderCellWithLinks = (value) => {
  if (typeof value !== 'string') return value;
  
  const processedText = detectLinks(value);
  
  if (processedText === value) {
    return value; // No links detected or HTML present, return as plain text
  }
  
  // Return as HTML string that will be rendered
  return { __html: processedText };
}; 