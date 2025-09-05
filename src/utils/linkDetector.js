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
  // Detect if the text appears to contain HTML/attribute fragments or stray quote+angle remnants
  const containsHtmlIndicators = /<[^>]*>|\bhref\s*=|\btarget\s*=|\brel\s*=|\bstyle\s*=|\bclass\s*=|["']\s*>|["']>/i.test(text);
  
  // 1) Sanitize broken/embedded HTML so we don't display raw attributes or stray characters
  let sanitized = text
    .replace(/<[^>]*>/g, '')
    // If HTML indicators are present, drop attribute pairs entirely
    .replace(containsHtmlIndicators ? /\b(href|style|class|target|rel|id|name|title|onclick|on\w+)\s*=\s*(".*?"|'[^']*'|[^\s>]+)/gi : /$^/, '')
    // Remove any token immediately followed by quote+angle e.g., domain.com"> or path/"> remnants
    .replace(/[^\s"'>]+["']\s*>/g, '')
    .replace(/[^\s"'>]+["']>/g, '')
    // Remove orphaned quote+greater-than remnants (with or without space)
    .replace(/["']\s*>/g, '')
    .replace(/["']>/g, '')
    // If HTML indicators were present, also remove standalone quotes
    .replace(containsHtmlIndicators ? /["']/g : /$^/, '')
    // Remove common detached attribute tokens
    .replace(/\b(noopener|noreferrer|_blank)\b/gi, '')
    // Remove any remaining '>' characters
    .replace(/>/g, '')
    // Collapse extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 2) Collapse duplicate domain + full URL sequences (e.g., "www.example.com https://www.example.com")
  const isHttpUrl = (value) => /^https?:\/\//i.test(value);
  const isBareDomainOrPath = (value) => /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[\w\-./?%&=]*)?$/i.test(value);
  const canonicalize = (value) => value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');

  if (sanitized.includes('http') || sanitized.includes('www.')) {
    const tokens = sanitized.split(/\s+/);
    const deduplicatedTokens = [];
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      const nextToken = tokens[index + 1];
      const tokenLooksLikeDomain = isBareDomainOrPath(token) && !isHttpUrl(token);
      const nextLooksLikeHttpUrl = typeof nextToken === 'string' && isHttpUrl(nextToken);
      if (tokenLooksLikeDomain && nextLooksLikeHttpUrl) {
        const tokenCanonical = canonicalize(token);
        const nextCanonical = canonicalize(nextToken);
        if (tokenCanonical === nextCanonical) {
          // Skip the bare domain, keep the canonical HTTP(S) URL
          continue;
        }
      }
      deduplicatedTokens.push(token);
    }
    sanitized = deduplicatedTokens.join(' ');
  }
  
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