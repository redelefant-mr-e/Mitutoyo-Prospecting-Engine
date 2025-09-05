import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight, Link, FileText, Hash, Globe, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { safeJsonParse } from '../utils/csvAnalyzer';
import { renderCellWithLinks } from '../utils/linkDetector';

const JsonFieldDisplay = ({ jsonData, columnName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const parsedData = safeJsonParse(jsonData);
  
  if (typeof parsedData !== 'object' || parsedData === null) {
    return <span style={{ fontSize: 'var(--text-sm)' }}>{String(jsonData)}</span>;
  }

  // Helper function to get appropriate icon for a field
  const getFieldIcon = (key, value) => {
    const keyLower = key.toLowerCase();
    const valueStr = String(value).toLowerCase();
    
    if (keyLower.includes('link') || keyLower.includes('url') || valueStr.startsWith('http')) {
      return <Link size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('title') || keyLower.includes('name')) {
      return <FileText size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('description') || keyLower.includes('desc') || keyLower.includes('body')) {
      return <MessageSquare size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('keyword') || keyLower.includes('tag')) {
      return <Hash size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('date') || keyLower.includes('time')) {
      return <Calendar size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('user') || keyLower.includes('author')) {
      return <User size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('domain') || keyLower.includes('site')) {
      return <Globe size={14} style={{ color: 'var(--primary-600)' }} />;
    }
    return <Tag size={14} style={{ color: 'var(--primary-600)' }} />;
  };

  // Helper function to format field name
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderValue = (value, key) => {
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ExternalLink size={12} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--primary-600)', 
                textDecoration: 'underline',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                transition: 'color 0.2s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-700)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--primary-600)'}
            >
              {value.length > 40 ? value.substring(0, 40) + '...' : value}
            </a>
          </div>
        );
      }
      // For other strings, use the same link rendering used in table cells (handles emails/domains)
      const processed = renderCellWithLinks(value);
      if (typeof processed === 'object' && processed.__html) {
        return (
          <span
            style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-word', overflowWrap: 'break-word' }}
            dangerouslySetInnerHTML={processed}
          />
        );
      }
      return <span style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{processed}</span>;
    }
    
    if (typeof value === 'number') {
      return <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>{value.toLocaleString()}</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span style={{ 
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          background: value ? 'var(--orange-light)' : 'var(--orange-light)',
          color: value ? 'var(--primary-600)' : 'var(--primary-600)',
          fontWeight: 'var(--font-semibold)',
          border: `1px solid ${value ? 'var(--orange-subtle)' : 'var(--orange-subtle)'}`
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div style={{ fontSize: 'var(--text-sm)' }}>
          <span style={{ color: 'var(--gray-600)', fontWeight: 'var(--font-medium)' }}>{value.length} items</span>
          {isExpanded && (
            <div style={{ marginTop: 'var(--space-2)', marginLeft: 'var(--space-4)' }}>
              {value.map((item, index) => (
                <div key={index} style={{ marginBottom: 'var(--space-1)' }}>
                  {typeof item === 'object' ? renderObject(item) : String(item)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return renderObject(value);
    }
    
    return <span style={{ fontSize: 'var(--text-sm)' }}>{String(value)}</span>;
  };

  const renderObject = (obj) => {
    const entries = Object.entries(obj);
    
    return (
      <div style={{ 
        background: 'var(--orange-light)', 
        border: '1px solid var(--gray-200)', 
        borderRadius: 'var(--radius-md)', 
        padding: 'var(--space-3)',
        fontSize: 'var(--text-sm)',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ marginBottom: 'var(--space-2)' }}>
            <div style={{ 
              fontWeight: 'var(--font-semibold)', 
              color: 'var(--gray-900)', 
              marginBottom: 'var(--space-1)',
              textTransform: 'capitalize',
              fontSize: 'var(--text-sm)'
            }}>
              {formatFieldName(key)}:
            </div>
            <div style={{ color: 'var(--gray-700)' }}>
              {renderValue(value, key)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Enhanced render function for any JSON structure
  const renderJsonData = (data) => {
    const entries = Object.entries(data);
    
    return (
      <div style={{ 
        background: 'var(--orange-light)', 
        border: '1px solid var(--gray-200)', 
        borderRadius: 'var(--radius-lg)', 
        padding: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)', 
          marginBottom: 'var(--space-3)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <FileText size={16} style={{ color: 'var(--primary-600)' }} />
          <span style={{ 
            fontWeight: 'var(--font-semibold)', 
            color: 'var(--gray-900)',
            fontSize: 'var(--text-base)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            Data Information ({entries.length} fields)
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: 'var(--primary-600)',
              marginLeft: 'auto',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--orange-lighter)';
              e.target.style.color = 'var(--primary-700)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--primary-600)';
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        
        <div style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)', 
          borderRadius: 'var(--radius-md)', 
          padding: 'var(--space-3)',
          maxHeight: isExpanded ? 'none' : '300px',
          overflow: isExpanded ? 'visible' : 'auto',
          maxWidth: '100%'
        }}>
          {entries.map(([key, value]) => (
            <div key={key} style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-1)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <div style={{ flexShrink: 0, marginTop: '1px' }}>
                  {getFieldIcon(key, value)}
                </div>
                <div style={{ 
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  <span style={{ 
                    fontWeight: 'var(--font-semibold)', 
                    color: 'var(--gray-900)',
                    fontSize: 'var(--text-sm)',
                    display: 'inline-block',
                    marginRight: 'var(--space-1)'
                  }}>
                    {formatFieldName(key)}:
                  </span>
                </div>
              </div>
              <div style={{ 
                color: 'var(--gray-700)', 
                marginLeft: 'var(--space-6)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {renderValue(value, key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Special handling for arrays of links (backward compatibility)
  if (parsedData.links && Array.isArray(parsedData.links) && Object.keys(parsedData).length === 1) {
    return (
      <div style={{ 
        background: 'var(--orange-light)', 
        border: '1px solid var(--gray-200)', 
        borderRadius: 'var(--radius-lg)', 
        padding: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)', 
          marginBottom: 'var(--space-3)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <Link size={16} style={{ color: 'var(--primary-600)' }} />
          <span style={{ 
            fontWeight: 'var(--font-semibold)', 
            color: 'var(--gray-900)',
            fontSize: 'var(--text-base)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            Links Collection ({parsedData.links.length} links)
          </span>
        </div>
        <div style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)', 
          borderRadius: 'var(--radius-md)', 
          padding: 'var(--space-3)',
          maxHeight: '200px',
          overflow: 'auto',
          maxWidth: '100%'
        }}>
          {parsedData.links.map((link, index) => (
            <div key={index} style={{ 
              marginBottom: 'var(--space-2)',
              paddingBottom: 'var(--space-2)',
              borderBottom: index < parsedData.links.length - 1 ? '1px solid var(--gray-100)' : 'none'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-1)'
              }}>
                <Link size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <span style={{ 
                  fontWeight: 'var(--font-semibold)', 
                  color: 'var(--gray-900)',
                  fontSize: 'var(--text-sm)'
                }}>
                  Link {index + 1}
                </span>
              </div>
              {link.text && (
                <div style={{ 
                  color: 'var(--gray-700)', 
                  marginBottom: 'var(--space-1)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {link.text}
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-1)'
              }}>
                <ExternalLink size={12} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <a 
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--primary-600)', 
                    textDecoration: 'underline',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    transition: 'color 0.2s ease',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary-700)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--primary-600)'}
                >
                  {link.href}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use the enhanced render function for all other cases
  return renderJsonData(parsedData);
};

export default JsonFieldDisplay; 