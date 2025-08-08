import React, { useState, useRef, useEffect } from 'react';
import { truncateText, safeJsonParse } from '../utils/csvAnalyzer';
import { renderCellWithLinks } from '../utils/linkDetector';
import { generateRandomId } from '../utils/sessionManager';
import JsonModal from './JsonModal';
import JsonFieldDisplay from './JsonFieldDisplay';
import JsonPreview from './JsonPreview';
import { Edit2, Check, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

const DataTable = ({ data, analysis, hiddenColumns = [], columnWidths = {}, onColumnWidthChange, onColumnRename }) => {
  
  const [selectedJson, setSelectedJson] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [editingHeader, setEditingHeader] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickColumn, setLastClickColumn] = useState(null);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [expandedTexts, setExpandedTexts] = useState({});
  const tableRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#666' }}>No data to display</p>
      </div>
    );
  }

  const { columns, jsonColumns = [] } = analysis || { columns: Object.keys(data[0]), jsonColumns: [] };
  const visibleColumns = columns.filter(col => !hiddenColumns.includes(col));

  // Sort data based on current sort configuration
  const sortedData = React.useMemo(() => {
    if (!sortConfig.column) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Handle numbers
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortConfig.direction === 'asc' 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      // Handle strings
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortConfig]);

  const handleSort = (columnName) => {
    setSortConfig(prev => {
      if (prev.column === columnName) {
        return {
          column: columnName,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        return {
          column: columnName,
          direction: 'asc'
        };
      }
    });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.column !== columnName) {
      return <ArrowUpDown size={14} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} /> 
      : <ArrowDown size={14} />;
  };

  const handleJsonClick = (jsonData, columnName) => {
    setSelectedJson(jsonData);
    setSelectedColumn(columnName);
  };

  const toggleTextExpansion = (rowIndex, columnName) => {
    const key = `${rowIndex}-${columnName}`;
    setExpandedTexts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderCell = (value, columnName, rowIndex) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>;
    }

    // Check if this is a JSON column
    if (jsonColumns && jsonColumns.includes(columnName)) {
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
      return <span style={{ fontSize: '0.8125rem' }} dangerouslySetInnerHTML={processedValue} />;
    }
    
    const textValue = String(value);
    const key = `${rowIndex}-${columnName}`;
    const isExpanded = expandedTexts[key];
    
    // For long text, show expandable dropdown
    if (textValue.length > 60) {
      return (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            marginBottom: '0.25rem'
          }}>
            {truncateText(textValue, 60)}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            fontSize: '0.75rem', 
            color: '#666',
            fontStyle: 'italic'
          }}>
            <span>{textValue.length} characters</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTextExpansion(rowIndex, columnName);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.125rem',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
              title={isExpanded ? "Collapse text" : "Expand text"}
            >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          {isExpanded && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {textValue}
            </div>
          )}
        </div>
      );
    }
    
    return <span style={{ fontSize: '0.8125rem' }}>{textValue}</span>;
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
    const newWidth = Math.max(80, resizing.startWidth + deltaX);
    
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
    
    // Find the header text (now it's in a div with span)
    const headerTextElement = headerElement.querySelector('div span');
    const headerText = headerTextElement?.textContent || columnName;
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
    
    // Calculate optimal width based on header text
    const headerWidth = textWidth + 40; // Header text + padding
    
    // Check if this column has mostly short content
    const columnValues = data.map(row => String(row[columnName] || '')).filter(val => val.length > 0);
    const avgLength = columnValues.length > 0 ? columnValues.reduce((sum, val) => sum + val.length, 0) / columnValues.length : 0;
    const maxLength = columnValues.length > 0 ? Math.max(...columnValues.map(val => val.length)) : 0;
    
    let optimalWidth;
    if (avgLength < 50 && maxLength < 100) {
      // For short content, use header width or minimum 120px
      optimalWidth = Math.max(120, headerWidth);
    } else if (avgLength < 100 && maxLength < 200) {
      // For medium content, use header width or minimum 150px
      optimalWidth = Math.max(150, headerWidth);
    } else {
      // For long content, use default 200px or header width if larger
      optimalWidth = Math.max(200, headerWidth);
    }
    
    console.log('optimalWidth:', optimalWidth);
    
    onColumnWidthChange(columnName, optimalWidth);
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
              {/* Row number column header */}
              <th 
                style={{ 
                  width: '60px',
                  minWidth: '60px',
                  position: 'relative',
                  cursor: 'default',
                  userSelect: 'none'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  paddingRight: '1rem'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>#</span>
                </div>
              </th>
              {visibleColumns.map((column, index) => (
                <th 
                  key={generateRandomId()}
                  style={{ 
                    width: columnWidths[column] || '200px',
                    minWidth: '120px',
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
                        <div 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            flex: 1,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleSort(column)}
                          title="Click to sort"
                        >
                          <span>{column}</span>
                          {getSortIcon(column)}
                        </div>
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
                    {jsonColumns && jsonColumns.includes(column) && (
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
            {sortedData.map((row, rowIndex) => (
              <tr key={generateRandomId()}>
                {/* Row number cell */}
                <td 
                  style={{ 
                    width: '60px',
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#666',
                    fontWeight: 'bold'
                  }}
                >
                  {rowIndex + 1}
                </td>
                {visibleColumns.map((column, colIndex) => (
                  <td 
                    key={generateRandomId()}
                    style={{ 
                      width: columnWidths[column] || '200px',
                      minWidth: '120px',
                      maxWidth: columnWidths[column] || '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {renderCell(row[column], column, rowIndex)}
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