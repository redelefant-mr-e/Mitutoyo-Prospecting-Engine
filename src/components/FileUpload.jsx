import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileSelect, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError('');

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));

    if (csvFile) {
      onFileSelect(csvFile);
    } else {
      setError('Please select a valid CSV file');
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setError('');
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div>
      <div
        style={{
          border: `2px dashed ${isDragOver ? 'var(--primary-600)' : 'var(--gray-300)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-12) var(--space-8)',
          textAlign: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          background: isDragOver ? 'var(--primary-50)' : 'white',
          cursor: 'pointer',
          boxShadow: isDragOver ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          transform: isDragOver ? 'scale(1.02)' : 'scale(1)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <Upload 
          size={64} 
          style={{ 
            marginBottom: 'var(--space-6)', 
            opacity: 0.7,
            color: isDragOver ? 'var(--primary-600)' : 'var(--gray-500)',
            transition: 'all 0.2s ease'
          }} 
        />
        
        <h3 style={{ 
          marginBottom: 'var(--space-3)', 
          fontSize: 'var(--text-2xl)', 
          fontWeight: 'var(--font-bold)',
          color: 'var(--gray-900)',
          lineHeight: 1.2
        }}>
          Upload Clay CSV File
        </h3>
        
        <p style={{ 
          marginBottom: 'var(--space-6)', 
          color: 'var(--gray-600)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          lineHeight: 1.5
        }}>
          Drag and drop your CSV file here, or click to browse
        </p>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 'var(--space-2)', 
          color: 'var(--gray-500)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)'
        }}>
          <FileText size={16} />
          <span>Supports .csv files with JSON content</span>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="error" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading" style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid var(--gray-200)',
              borderTop: '2px solid var(--primary-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-medium)',
              color: 'var(--gray-600)'
            }}>
              Processing CSV file...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 