/**
 * Utility functions for detecting and converting URLs and emails to links
 */

export const detectLinks = (text) => {
  if (typeof text !== 'string') return text;
  
  // URL regex pattern (with http/https)
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  // Email regex pattern
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  // Domain pattern (without http/https)
  const domainPattern = /\b([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
  
  let result = text;
  
  // Replace URLs with clickable links
  result = result.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">${url}</a>`;
  });
  
  // Replace emails with mailto links
  result = result.replace(emailPattern, (email) => {
    return `<a href="mailto:${email}" style="color: #667eea; text-decoration: underline;">${email}</a>`;
  });
  
  // Replace plain domains with clickable links
  result = result.replace(domainPattern, (domain) => {
    // Skip if it's already been processed as a URL or email
    if (domain.includes('://') || domain.includes('@')) {
      return domain;
    }
    return `<a href="https://${domain}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">${domain}</a>`;
  });
  
  return result;
};

export const renderCellWithLinks = (value) => {
  if (typeof value !== 'string') return value;
  
  const processedText = detectLinks(value);
  
  if (processedText === value) {
    return value; // No links detected, return as plain text
  }
  
  // Return as HTML string that will be rendered
  return { __html: processedText };
}; 