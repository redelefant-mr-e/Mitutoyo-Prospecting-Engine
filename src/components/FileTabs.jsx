import React, { useState } from 'react';
import { X, Edit2, Check, X as XIcon } from 'lucide-react';

const FileTabs = ({ files, activeFileId, onTabChange, onTabClose, onTabRename }) => {
  const [editingTab, setEditingTab] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleRename = (fileId, currentName) => {
    setEditingTab(fileId);
    setEditValue(currentName);
  };

  const handleSaveRename = (fileId) => {
    if (editValue.trim()) {
      onTabRename(fileId, editValue.trim());
    }
    setEditingTab(null);
    setEditValue('');
  };

  const handleCancelRename = () => {
    setEditingTab(null);
    setEditValue('');
  };

  const handleKeyPress = (e, fileId) => {
    if (e.key === 'Enter') {
      handleSaveRename(fileId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid var(--gray-200)',
      background: 'white',
      overflowX: 'auto',
      marginBottom: 'var(--space-6)',
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {files.map((file) => {
        const isActive = file.id === activeFileId;
        const isEditing = editingTab === file.id;

        return (
          <div
            key={file.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-4) var(--space-4)',
              borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
              background: isActive ? 'var(--primary-50)' : 'transparent',
              cursor: 'pointer',
              minWidth: 'fit-content',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              borderRight: '1px solid var(--gray-100)'
            }}
            onClick={() => !isEditing && onTabChange(file.id)}
            onMouseEnter={(e) => {
              if (!isActive && !isEditing) {
                e.target.style.background = 'var(--gray-50)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isEditing) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, file.id)}
                onBlur={() => handleSaveRename(file.id)}
                style={{
                  border: '1px solid var(--primary-500)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-1) var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  background: 'white',
                  minWidth: '120px',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--gray-900)'
                }}
                autoFocus
              />
            ) : (
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
                color: isActive ? 'var(--gray-900)' : 'var(--gray-600)',
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2
              }}>
                {file.displayName}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              {!isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(file.id, file.displayName);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-1)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6,
                    transition: 'all 0.2s ease',
                    color: 'var(--gray-500)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = 1;
                    e.target.style.background = 'var(--gray-100)';
                    e.target.style.color = 'var(--gray-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = 0.6;
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--gray-500)';
                  }}
                >
                  <Edit2 size={14} />
                </button>
              )}

              {isEditing ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveRename(file.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 'var(--space-1)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--success-600)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--success-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelRename();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 'var(--space-1)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--error-600)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--error-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <XIcon size={14} />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(file.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-1)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6,
                    transition: 'all 0.2s ease',
                    color: 'var(--gray-500)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = 1;
                    e.target.style.background = 'var(--error-50)';
                    e.target.style.color = 'var(--error-600)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = 0.6;
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--gray-500)';
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileTabs; 