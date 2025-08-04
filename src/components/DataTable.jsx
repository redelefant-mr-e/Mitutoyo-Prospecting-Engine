import React, { useState, useRef, useEffect } from 'react';
import { truncateText, safeJsonParse } from '../utils/csvAnalyzer';
import { renderCellWithLinks } from '../utils/linkDetector';
import { generateRandomId } from '../utils/sessionManager';
import JsonModal from './JsonModal';
import JsonFieldDisplay from './JsonFieldDisplay';
import JsonPreview from './JsonPreview';
import { Edit2, Check, X } from 'lucide-react';

const DataTable = ({ data, analysis, hiddenColumns = [], columnWidths = {}, onColumnWidthChange, onColumnRename }) => {
  
  const [selectedJson, setSelectedJson] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [editingHeader, setEditingHeader] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickColumn, setLastClickColumn] = useState(null);
  const tableRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#666' }}>No data to display</p>
      </div>
    );
  }

  const { columns, jsonColumns } = analysis || { columns: Object.keys(data[0]), jsonColumns: [] };
  const visibleColumns = columns.filter(col => !hiddenColumns.includes(col));



  const handleJsonClick = (jsonData, columnName) => {
    setSelectedJson(jsonData);
    setSelectedColumn(columnName);
  };

  const renderCell = (value, columnName) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>;
    }

    // Check if this is a JSON column
    if (jsonColumns.includes(columnName)) {
      const parsed = safeJsonParse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <JsonPreview 
            jsonData={value} 
            columnName={columnName}
            onViewDetails={handleJsonClick}
          />
        );
      }
    }

    // Regular text display with link detection
    const processedValue = renderCellWithLinks(String(value));
    if (typeof processedValue === 'object' && processedValue.__html) {
      return <span style={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={processedValue} />;
    }
    
    return <span style={{ fontSize: '0.875rem' }}>{truncateText(String(value), 100)}</span>;
  };

  const handleMouseDown = (e, columnIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    const columnName = visibleColumns[columnIndex];
    
    // Check for double-click (within 300ms and same column)
    if (now - lastClickTime < 300 && lastClickColumn === columnIndex) {
      console.log('=== DOUBLE CLICK DETECTED ===');
      handleResizeHandleDoubleClick(e, columnIndex);
      setLastClickTime(0);
      setLastClickColumn(null);
      return;
    }
    
    // Single click - start resizing
    setLastClickTime(now);
    setLastClickColumn(columnIndex);
    
    const currentWidth = columnWidths[columnName] || 150;
    setResizing({ columnIndex, columnName, startX: e.clientX, startWidth: currentWidth });
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;
    
    const deltaX = e.clientX - resizing.startX;
    const newWidth = Math.max(60, resizing.startWidth + deltaX);
    
    onColumnWidthChange(resizing.columnName, newWidth);
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  const handleResizeHandleDoubleClick = (e, columnIndex) => {
    console.log('=== DOUBLE CLICK DETECTED ===');
    e.preventDefault();
    e.stopPropagation();
    
    const columnName = visibleColumns[columnIndex];
    console.log('columnName:', columnName);
    console.log('columnIndex:', columnIndex);
    
    const headerElement = e.target.closest('th');
    console.log('headerElement:', headerElement);
    
    const headerText = headerElement.querySelector('span')?.textContent || columnName;
    console.log('headerText:', headerText);
    
    // Create a temporary element to measure text width
    const tempElement = document.createElement('span');
    tempElement.style.font = window.getComputedStyle(headerElement).font;
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.textContent = headerText;
    
    document.body.appendChild(tempElement);
    const textWidth = tempElement.offsetWidth;
    document.body.removeChild(tempElement);
    
    console.log('textWidth:', textWidth);
    
    // Add some padding for better appearance
    const newWidth = Math.max(80, textWidth + 20);
    console.log('newWidth:', newWidth);
    
    onColumnWidthChange(columnName, newWidth);
    console.log('=== DOUBLE CLICK COMPLETE ===');
  };

  const handleHeaderDoubleClick = (columnName) => {
    console.log('Starting edit for column:', columnName);
    setEditingHeader(columnName);
    setEditingValue(columnName);
  };

  const handleHeaderEditSave = () => {
    if (editingValue.trim() && editingValue !== editingHeader) {
      console.log('Renaming column from:', editingHeader, 'to:', editingValue.trim());
      onColumnRename(editingHeader, editingValue.trim());
    }
    setEditingHeader(null);
    setEditingValue('');
  };

  const handleHeaderEditCancel = () => {
    setEditingHeader(null);
    setEditingValue('');
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing]);

  return (
    <>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {visibleColumns.map((column, index) => (
                <th 
                  key={generateRandomId()}
                  style={{ 
                    width: columnWidths[column] || 'auto',
                    minWidth: '100px',
                    position: 'relative',
                    cursor: resizing ? 'col-resize' : 'default',
                    userSelect: resizing ? 'none' : 'auto'
                  }}
                  onDoubleClick={() => handleHeaderDoubleClick(column)}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    paddingRight: '1rem'
                  }}>
                    {editingHeader === column ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleHeaderEditSave();
                            if (e.key === 'Escape') handleHeaderEditCancel();
                          }}
                          style={{
                            border: '1px solid var(--mitutoyo-blue)',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.875rem',
                            flex: 1,
                            outline: 'none'
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleHeaderEditSave}
                          style={{
                            background: 'var(--mitutoyo-blue)',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Check size={12} color="white" />
                        </button>
                        <button
                          onClick={handleHeaderEditCancel}
                          style={{
                            background: '#e5e5e5',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} color="#666" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ flex: 1 }}>{column}</span>
                        <Edit2 
                          size={12} 
                          color="#999" 
                          style={{ cursor: 'pointer', opacity: 0.5 }}
                          onMouseEnter={(e) => e.target.style.opacity = '1'}
                          onMouseLeave={(e) => e.target.style.opacity = '0.5'}
                          onClick={() => handleHeaderDoubleClick(column)}
                        />
                      </>
                    )}
                    {jsonColumns.includes(column) && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        background: 'var(--mitutoyo-blue)', 
                        padding: '0.125rem 0.375rem', 
                        borderRadius: '0.25rem',
                        color: 'white'
                      }}>
                        JSON
                      </span>
                    )}
                  </div>
                  <div 
                    className="resize-handle"
                    title="Drag to resize, double-click to auto-fit"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '8px',
                      cursor: 'col-resize',
                      background: resizing ? 'var(--mitutoyo-blue)' : 'rgba(0, 123, 255, 0.1)',
                      opacity: resizing ? 1 : 0.6,
                      zIndex: 10,
                      borderLeft: '1px solid rgba(0, 123, 255, 0.2)',
                      transition: resizing ? 'none' : 'background-color 0.2s ease'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                    onMouseEnter={(e) => {
                      if (!resizing) {
                        e.target.style.background = 'var(--mitutoyo-blue)';
                        e.target.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!resizing) {
                        e.target.style.background = 'rgba(0, 123, 255, 0.1)';
                        e.target.style.opacity = '0.6';
                      }
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={generateRandomId()}>
                {visibleColumns.map((column, colIndex) => (
                  <td key={generateRandomId()}>
                    {renderCell(row[column], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <JsonModal
        isOpen={selectedJson !== null}
        onClose={() => {
          setSelectedJson(null);
          setSelectedColumn(null);
        }}
        jsonData={selectedJson}
        columnName={selectedColumn}
      />
    </>
  );
};

export default DataTable; 