import React from 'react';
import { X, Code } from 'lucide-react';
import { formatJson } from '../utils/csvAnalyzer';
import JsonFieldDisplay from './JsonFieldDisplay';

const JsonModal = ({ isOpen, onClose, jsonData, columnName }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formattedJson = formatJson(jsonData);

  return (
    <div className="json-modal" onClick={handleBackdropClick}>
      <div className="json-modal-content" style={{ maxWidth: '90vw', width: '800px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-bold)',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-1)',
              lineHeight: 1.2
            }}>
              {columnName}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: 'var(--text-sm)', 
              color: 'var(--gray-600)',
              fontWeight: 'var(--font-medium)'
            }}>
              Structured data view
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              color: 'var(--gray-500)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--gray-100)';
              e.target.style.color = 'var(--gray-700)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--gray-500)';
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <JsonFieldDisplay jsonData={jsonData} columnName={columnName} />
        </div>

        <div style={{
          borderTop: '1px solid var(--gray-200)',
          paddingTop: 'var(--space-4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
            color: 'var(--gray-600)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)'
          }}>
            <Code size={16} />
            Raw JSON Data
          </div>
          <div className="json-formatted" style={{ maxHeight: '300px' }}>
            {formattedJson}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonModal; 