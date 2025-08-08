import React, { useState } from 'react';
import { X, Edit2, Check, X as XIcon, GripVertical } from 'lucide-react';

const FileTabs = ({ files, activeFileId, onTabChange, onTabClose, onTabRename, onTabReorder }) => {
  const [editingTab, setEditingTab] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [draggedTab, setDraggedTab] = useState(null);
  const [dragOverTab, setDragOverTab] = useState(null);

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

  const handleDragStart = (e, fileId) => {
    setDraggedTab(fileId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', fileId);
  };

  const handleDragOver = (e, fileId) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== fileId) {
      setDragOverTab(fileId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTab(null);
  };

  const handleDrop = (e, targetFileId) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== targetFileId && onTabReorder) {
      onTabReorder(draggedTab, targetFileId);
    }
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
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
        const isDragging = draggedTab === file.id;
        const isDragOver = dragOverTab === file.id;

        return (
          <div
            key={file.id}
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, file.id)}
            onDragOver={(e) => handleDragOver(e, file.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, file.id)}
            onDragEnd={handleDragEnd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-4) var(--space-4)',
              borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
              background: isActive ? 'var(--primary-50)' : isDragging ? 'var(--primary-100)' : isDragOver ? 'var(--gray-100)' : 'transparent',
              cursor: isEditing ? 'default' : 'pointer',
              minWidth: 'fit-content',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              borderRight: '1px solid var(--gray-100)',
              opacity: isDragging ? 0.5 : 1,
              transform: isDragging ? 'rotate(2deg)' : 'none',
              zIndex: isDragging ? 1000 : 'auto'
            }}
            onClick={() => !isEditing && onTabChange(file.id)}
            onMouseEnter={(e) => {
              if (!isActive && !isEditing && !isDragging) {
                e.target.style.background = 'var(--gray-50)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isEditing && !isDragging) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {/* Drag handle */}
            {!isEditing && (
              <div
                style={{
                  cursor: 'grab',
                  opacity: 0.4,
                  transition: 'opacity 0.2s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = 0.8;
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = 0.4;
                }}
              >
                <GripVertical size={12} color="var(--gray-500)" />
              </div>
            )}

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