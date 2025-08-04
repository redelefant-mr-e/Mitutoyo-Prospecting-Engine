/**
 * Utility functions for detecting and converting URLs and emails to links
 */

export const detectLinks = (text) => {
  if (typeof text !== 'string') return text;
  
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  // Email regex pattern
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  let result = text;
  
  // Replace URLs with clickable links
  result = result.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">${url}</a>`;
  });
  
  // Replace emails with mailto links
  result = result.replace(emailPattern, (email) => {
    return `<a href="mailto:${email}" style="color: #667eea; text-decoration: underline;">${email}</a>`;
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