import React from 'react';
import { FileText, Database, Code, BarChart3, Hash, Calendar, CheckSquare } from 'lucide-react';

const DataStats = ({ analysis }) => {
  if (!analysis) return null;

  const { totalRows, totalColumns, jsonColumns, dataTypes } = analysis;
  
  const jsonColumnCount = jsonColumns.length;
  const stringColumns = Object.values(dataTypes).filter(type => type === 'string').length;
  const numberColumns = Object.values(dataTypes).filter(type => type === 'number').length;
  const dateColumns = Object.values(dataTypes).filter(type => type === 'date').length;
  const booleanColumns = Object.values(dataTypes).filter(type => type === 'boolean').length;

  return (
    <div className="stats">
      <div className="stat-card animate-fade-in">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          background: 'var(--primary-100)',
          borderRadius: 'var(--radius-lg)',
          margin: '0 auto var(--space-3)',
          color: 'var(--primary-600)'
        }}>
          <FileText size={20} />
        </div>
        <div className="stat-number">{totalRows.toLocaleString()}</div>
        <div className="stat-label">Total Rows</div>
      </div>
      
      <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          background: 'var(--success-100)',
          borderRadius: 'var(--radius-lg)',
          margin: '0 auto var(--space-3)',
          color: 'var(--success-600)'
        }}>
          <Database size={20} />
        </div>
        <div className="stat-number">{totalColumns}</div>
        <div className="stat-label">Total Columns</div>
      </div>
      
      <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          background: 'var(--warning-100)',
          borderRadius: 'var(--radius-lg)',
          margin: '0 auto var(--space-3)',
          color: 'var(--warning-600)'
        }}>
          <Code size={20} />
        </div>
        <div className="stat-number">{jsonColumnCount}</div>
        <div className="stat-label">JSON Columns</div>
      </div>
      
      <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          background: 'var(--primary-100)',
          borderRadius: 'var(--radius-lg)',
          margin: '0 auto var(--space-3)',
          color: 'var(--primary-600)'
        }}>
          <BarChart3 size={20} />
        </div>
        <div className="stat-number">{stringColumns}</div>
        <div className="stat-label">Text Columns</div>
      </div>
      
      {numberColumns > 0 && (
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--success-100)',
            borderRadius: 'var(--radius-lg)',
            margin: '0 auto var(--space-3)',
            color: 'var(--success-600)'
          }}>
            <Hash size={20} />
          </div>
          <div className="stat-number">{numberColumns}</div>
          <div className="stat-label">Number Columns</div>
        </div>
      )}
      
      {dateColumns > 0 && (
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--warning-100)',
            borderRadius: 'var(--radius-lg)',
            margin: '0 auto var(--space-3)',
            color: 'var(--warning-600)'
          }}>
            <Calendar size={20} />
          </div>
          <div className="stat-number">{dateColumns}</div>
          <div className="stat-label">Date Columns</div>
        </div>
      )}
      
      {booleanColumns > 0 && (
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--error-100)',
            borderRadius: 'var(--radius-lg)',
            margin: '0 auto var(--space-3)',
            color: 'var(--error-600)'
          }}>
            <CheckSquare size={20} />
          </div>
          <div className="stat-number">{booleanColumns}</div>
          <div className="stat-label">Boolean Columns</div>
        </div>
      )}
    </div>
  );
};

export default DataStats; 