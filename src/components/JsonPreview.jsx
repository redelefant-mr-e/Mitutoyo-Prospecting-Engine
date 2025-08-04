import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ExternalLink, FileText, Link, Hash, Globe, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { safeJsonParse } from '../utils/csvAnalyzer';

const JsonPreview = ({ jsonData, columnName, onViewDetails }) => {
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
      return <Link size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('title') || keyLower.includes('name')) {
      return <FileText size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('description') || keyLower.includes('desc') || keyLower.includes('body')) {
      return <MessageSquare size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('keyword') || keyLower.includes('tag')) {
      return <Hash size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('date') || keyLower.includes('time')) {
      return <Calendar size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('user') || keyLower.includes('author')) {
      return <User size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    if (keyLower.includes('domain') || keyLower.includes('site')) {
      return <Globe size={12} style={{ color: 'var(--primary-600)' }} />;
    }
    return <Tag size={12} style={{ color: 'var(--primary-600)' }} />;
  };

  // Helper function to format field name
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get preview text for a value
  const getPreviewText = (value, key) => {
    if (typeof value === 'string') {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return value.substring(0, 25) + '...';
      }
      return value.length > 35 ? value.substring(0, 35) + '...' : value;
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return `${value.length} items`;
    }
    if (typeof value === 'object') {
      return `${Object.keys(value).length} fields`;
    }
    return String(value);
  };

  const getPreviewContent = () => {
    const entries = Object.entries(parsedData);
    
    // Special case for pure links array
    if (entries.length === 1 && entries[0][0] === 'links' && Array.isArray(entries[0][1])) {
      return {
        icon: <Link size={14} style={{ color: 'var(--primary-600)' }} />,
        text: `Show all information (${entries[0][1].length} links)`,
        type: 'links'
      };
    }
    
    // For any other JSON structure, show comprehensive preview
    return {
      icon: <FileText size={14} style={{ color: 'var(--primary-600)' }} />,
      text: `Show all information (${entries.length} fields)`,
      type: 'comprehensive'
    };
  };

  const preview = getPreviewContent();

  return (
    <div style={{ maxWidth: '280px', minWidth: '250px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--orange-light)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          width: '100%',
          boxSizing: 'border-box'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--orange-lighter)';
          e.target.style.borderColor = 'var(--gray-300)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--orange-light)';
          e.target.style.borderColor = 'var(--gray-200)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {isExpanded ? (
          <ChevronDown size={14} style={{ color: 'var(--primary-600)' }} />
        ) : (
          <ChevronRight size={14} style={{ color: 'var(--primary-600)' }} />
        )}
        {preview.icon}
        <span style={{ 
          flex: 1, 
          color: 'var(--gray-900)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{preview.text}</span>
      </div>

      {isExpanded && (
        <div style={{
          marginTop: 'var(--space-2)',
          padding: 'var(--space-3)',
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          boxShadow: 'var(--shadow-sm)',
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '280px'
        }}>
          {preview.type === 'links' && (
            <div>
              <div style={{ 
                marginBottom: 'var(--space-2)', 
                fontWeight: 'var(--font-semibold)', 
                color: 'var(--gray-900)',
                fontSize: 'var(--text-sm)'
              }}>
                Sample Links:
              </div>
              {parsedData.links.slice(0, 3).map((link, index) => (
                <div key={index} style={{ 
                  marginBottom: 'var(--space-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}>
                  <ExternalLink size={12} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                  <span style={{ 
                    color: 'var(--gray-600)', 
                    fontSize: 'var(--text-xs)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {link.text || link.href.substring(0, 25) + '...'}
                  </span>
                </div>
              ))}
              {parsedData.links.length > 3 && (
                <div style={{ 
                  color: 'var(--gray-500)', 
                  fontSize: 'var(--text-xs)',
                  fontStyle: 'italic'
                }}>
                  +{parsedData.links.length - 3} more links
                </div>
              )}
            </div>
          )}

          {preview.type === 'comprehensive' && (
            <div>
              <div style={{ 
                marginBottom: 'var(--space-2)', 
                fontWeight: 'var(--font-semibold)', 
                color: 'var(--gray-900)',
                fontSize: 'var(--text-sm)'
              }}>
                Data Preview:
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: 'var(--text-xs)' }}>
                {Object.entries(parsedData).slice(0, 5).map(([key, value]) => (
                  <div key={key} style={{ 
                    marginBottom: 'var(--space-1)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-1)',
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
                        fontWeight: 'var(--font-medium)',
                        display: 'inline-block',
                        marginRight: 'var(--space-1)'
                      }}>
                        {formatFieldName(key)}:
                      </span>
                      <span style={{ 
                        color: 'var(--gray-500)',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {getPreviewText(value, key)}
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(parsedData).length > 5 && (
                  <div style={{ 
                    color: 'var(--gray-500)', 
                    fontSize: 'var(--text-xs)',
                    fontStyle: 'italic',
                    marginTop: 'var(--space-1)'
                  }}>
                    +{Object.keys(parsedData).length - 5} more fields
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{
            marginTop: 'var(--space-3)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--gray-200)',
            textAlign: 'center'
          }}>
            <button
              onClick={() => onViewDetails(jsonData, columnName)}
              style={{
                background: 'var(--primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary-700)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--primary-600)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonPreview; 