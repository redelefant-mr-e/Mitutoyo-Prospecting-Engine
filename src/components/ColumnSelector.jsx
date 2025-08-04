import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

const ColumnSelector = ({ columns, hiddenColumns, onToggleColumn, analysis }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColumn = (column) => {
    onToggleColumn(column);
  };

  const visibleColumns = columns.filter(col => !hiddenColumns.includes(col));
  const hiddenCount = hiddenColumns.length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          minWidth: '200px',
          justifyContent: 'space-between',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)'
        }}
      >
        <span>Columns ({visibleColumns.length}/{columns.length})</span>
        <ChevronDown size={16} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          maxHeight: '300px',
          overflow: 'auto',
          marginTop: 'var(--space-1)'
        }}>
          <div style={{ 
            padding: 'var(--space-4)', 
            borderBottom: '1px solid var(--gray-100)',
            background: 'var(--gray-50)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2)'
            }}>
              <span style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-semibold)',
                color: 'var(--gray-900)'
              }}>
                Column Visibility
              </span>
              <button
                onClick={() => columns.forEach(col => onToggleColumn(col))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 'var(--font-medium)',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary-700)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--primary-600)'}
              >
                {hiddenCount === 0 ? 'Hide All' : 'Show All'}
              </button>
            </div>
          </div>

          <div style={{ padding: 'var(--space-2)' }}>
            {columns.map((column) => {
              const isHidden = hiddenColumns.includes(column);
              const isJson = analysis?.jsonColumns?.includes(column);
              
              return (
                <div
                  key={column}
                  onClick={() => toggleColumn(column)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isHidden ? 0.6 : 1,
                    color: isHidden ? 'var(--gray-500)' : 'var(--gray-700)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--gray-50)';
                    e.target.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  {isHidden ? (
                    <EyeOff size={16} style={{ color: 'var(--gray-400)' }} />
                  ) : (
                    <Eye size={16} style={{ color: 'var(--primary-600)' }} />
                  )}
                  <span style={{ 
                    flex: 1, 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    {column}
                  </span>
                  {isJson && (
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 'var(--font-medium)',
                      border: '1px solid var(--primary-200)'
                    }}>
                      JSON
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ColumnSelector; 