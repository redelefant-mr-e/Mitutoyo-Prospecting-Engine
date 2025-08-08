import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { analyzeCSVData } from './utils/csvAnalyzer';
import { saveSessionData, loadSessionData, clearSessionData, generateRandomId, saveAuthenticationState, loadAuthenticationState } from './utils/sessionManager';
import { loadSharedFiles } from './utils/sharedDataLoader';
import { loadGlobalTabPreferences, applyGlobalPreferences, generatePreferences } from './utils/globalTabPreferences';
import FileUpload from './components/FileUpload';
import DataStats from './components/DataStats';
import DataTable from './components/DataTable';
import FileTabs from './components/FileTabs';
import ColumnSelector from './components/ColumnSelector';
import LoginScreen from './components/LoginScreen';
import { Download, RefreshCw, Plus, LogOut } from 'lucide-react';
import MitutoyoLogo from '../images/mitutoyo-m.svg';

function App() {
  console.log('App component rendering...');
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // For development, you can set this to true to skip login
    const devMode = import.meta.env.DEV && import.meta.env.VITE_SKIP_LOGIN === 'true';
    if (devMode) {
      console.log('Development mode: skipping login');
      return true;
    }
    const auth = loadAuthenticationState();
    console.log('Initial authentication state:', auth);
    return auth;
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState({});
  const [columnWidths, setColumnWidths] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');

  // Load session data on mount if authenticated
  useEffect(() => {
    console.log('App useEffect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      const sessionData = loadSessionData();
      console.log('Loading session data:', sessionData);
      
      // Load shared files and global preferences
      console.log('🔄 App: Starting to load shared files...');
      Promise.all([loadSharedFiles(), loadGlobalTabPreferences()]).then(([sharedFiles, globalPreferences]) => {
        console.log(`✅ App: Loaded ${sharedFiles.length} shared files`);
        // Combine session files with shared files
        let allFiles = [...sessionData.files, ...sharedFiles];
        
        // Apply global preferences to shared files
        const sharedFilesWithPreferences = applyGlobalPreferences(sharedFiles, globalPreferences);
        allFiles = [...sessionData.files, ...sharedFilesWithPreferences];
        
        console.log(`📊 App: Total files (session + shared): ${allFiles.length}`);
        
        if (allFiles.length > 0) {
          setFiles(allFiles);
          setActiveFileId(sessionData.activeFileId);
          
          // Clean up hidden columns and column widths to only include existing files
          const fileIds = allFiles.map(f => f.id);
          const cleanedHiddenColumns = {};
          const cleanedColumnWidths = {};
          
          fileIds.forEach(fileId => {
            if (sessionData.hiddenColumns[fileId]) {
              cleanedHiddenColumns[fileId] = sessionData.hiddenColumns[fileId];
            }
            if (sessionData.columnWidths[fileId]) {
              cleanedColumnWidths[fileId] = sessionData.columnWidths[fileId];
            }
          });
          
          setHiddenColumns(cleanedHiddenColumns);
          setColumnWidths(cleanedColumnWidths);
        }
      }).catch(error => {
        console.error('❌ App: Failed to load shared files:', error);
        // Fallback to just session data
        if (sessionData.files.length > 0) {
          setFiles(sessionData.files);
          setActiveFileId(sessionData.activeFileId);
          
          // Clean up hidden columns and column widths to only include existing files
          const fileIds = sessionData.files.map(f => f.id);
          const cleanedHiddenColumns = {};
          const cleanedColumnWidths = {};
          
          fileIds.forEach(fileId => {
            if (sessionData.hiddenColumns[fileId]) {
              cleanedHiddenColumns[fileId] = sessionData.hiddenColumns[fileId];
            }
            if (sessionData.columnWidths[fileId]) {
              cleanedColumnWidths[fileId] = sessionData.columnWidths[fileId];
            }
          });
          
          setHiddenColumns(cleanedHiddenColumns);
          setColumnWidths(cleanedColumnWidths);
        }
      });
    }
    setIsInitializing(false);
  }, [isAuthenticated]);

  // Save session data when it changes
  useEffect(() => {
    if (isAuthenticated && files.length > 0) {
      // Only save user-uploaded files, not shared files
      const userFiles = files.filter(file => !file.isShared);
      
      if (userFiles.length > 0) {
        console.log('Saving session data:', { files: userFiles.length, activeFileId, hiddenColumns: Object.keys(hiddenColumns).length });
        const result = saveSessionData(userFiles, activeFileId, hiddenColumns, columnWidths);
        
        if (result && result.warning) {
          setStorageWarning(result.warning);
          // Clear warning after 10 seconds
          setTimeout(() => setStorageWarning(''), 10000);
        }
      }
    }
  }, [files, activeFileId, hiddenColumns, columnWidths, isAuthenticated]);

  // Save authentication state when it changes
  useEffect(() => {
    if (!isInitializing) {
      saveAuthenticationState(isAuthenticated);
    }
  }, [isAuthenticated, isInitializing]);

  const processCSVFile = useCallback(async (file) => {
    setIsLoading(true);
    setError('');

    try {
      const text = await file.text();
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          const data = results.data;
          if (data.length === 0) {
            setError('The CSV file appears to be empty or has no valid data');
            setIsLoading(false);
            return;
          }

          // Analyze the data structure
          const dataAnalysis = analyzeCSVData(data);
          
          // Create new file entry
          const newFile = {
            id: Date.now().toString(),
            name: file.name,
            displayName: file.name.replace('.csv', ''),
            data: data,
            analysis: dataAnalysis
          };

          setFiles(prev => [...prev, newFile]);
          setActiveFileId(newFile.id);
          setHiddenColumns(prev => ({ ...prev, [newFile.id]: [] }));
          setColumnWidths(prev => {
            // Ensure we start with completely clean column widths for the new file
            // This prevents any cross-contamination from other files
            const newWidths = { ...prev };
            newWidths[newFile.id] = {};
            return newWidths;
          });
          setIsLoading(false);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
          setIsLoading(false);
        }
      });
    } catch (error) {
      setError(`Error reading file: ${error.message}`);
      setIsLoading(false);
    }
  }, []);

  const handleTabChange = (fileId) => {
    setActiveFileId(fileId);
  };

  const handleTabClose = (fileId) => {
    const fileToClose = files.find(f => f.id === fileId);
    
    // Don't allow closing shared files
    if (fileToClose && fileToClose.isShared) {
      alert('Shared files cannot be closed. They are loaded from the repository.');
      return;
    }
    
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setHiddenColumns(prev => {
      const newHidden = { ...prev };
      delete newHidden[fileId];
      return newHidden;
    });
    setColumnWidths(prev => {
      const newWidths = { ...prev };
      delete newWidths[fileId];
      return newWidths;
    });
    
    if (activeFileId === fileId) {
      const remainingFiles = files.filter(file => file.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleTabRename = (fileId, newName) => {
    setFiles(prev => {
      const newFiles = prev.map(file => 
        file.id === fileId ? { ...file, displayName: newName } : file
      );
      
      // Save global preferences for shared files
      const sharedFiles = newFiles.filter(f => f.isShared);
      if (sharedFiles.length > 0) {
        const preferences = generatePreferences(sharedFiles);
        console.log('💾 Saving global preferences after rename:', preferences);
        // In a real implementation, this would save to the repository
      }
      
      return newFiles;
    });
  };

  const handleTabReorder = (draggedFileId, targetFileId) => {
    setFiles(prev => {
      const fileIds = prev.map(f => f.id);
      const draggedIndex = fileIds.indexOf(draggedFileId);
      const targetIndex = fileIds.indexOf(targetFileId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const newFiles = [...prev];
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(targetIndex, 0, draggedFile);
      
      // Save global preferences for shared files
      const sharedFiles = newFiles.filter(f => f.isShared);
      if (sharedFiles.length > 0) {
        const preferences = generatePreferences(sharedFiles);
        console.log('💾 Saving global preferences after reorder:', preferences);
        // In a real implementation, this would save to the repository
      }
      
      return newFiles;
    });
  };

  const handleToggleColumn = (column) => {
    if (!activeFileId) return;
    
    setHiddenColumns(prev => {
      const currentHidden = prev[activeFileId] || [];
      const newHidden = currentHidden.includes(column)
        ? currentHidden.filter(col => col !== column)
        : [...currentHidden, column];
      
      return { ...prev, [activeFileId]: newHidden };
    });
  };

  const exportToCSV = () => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;
    
    const csv = Papa.unparse(activeFile.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `processed_${activeFile.name}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Don't clear the files - they should persist across login/logout
    // Only clear UI state
    setActiveFileId(null);
    setHiddenColumns({});
    setColumnWidths({});
    setError('');
    setStorageWarning('');
    // Only clear authentication state, not the files
    localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED);
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setFiles([]);
      setActiveFileId(null);
      setHiddenColumns({});
      setColumnWidths({});
      setError('');
      setStorageWarning('');
      clearSessionData();
      alert('All data cleared!');
    }
  };

  const handleClearOldData = () => {
    if (confirm('Clear old localStorage data and keep only shared files?')) {
      // Clear all localStorage data
      localStorage.clear();
      // Force reload to start completely fresh
      window.location.reload();
    }
  };



  const clearStorageWarning = () => {
    setStorageWarning('');
  };

  const handleColumnWidthChange = (columnName, newWidth) => {
    if (!activeFileId) return;
    
    setColumnWidths(prev => {
      const newWidths = {
        ...prev,
        [activeFileId]: {
          ...prev[activeFileId],
          [columnName]: newWidth
        }
      };
      return newWidths;
    });
  };

  const handleColumnRename = (oldName, newName) => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;

    // Update the analysis columns
    const updatedAnalysis = {
      ...activeFile.analysis,
      columns: activeFile.analysis.columns.map(col => col === oldName ? newName : col),
      jsonColumns: activeFile.analysis.jsonColumns.map(col => col === oldName ? newName : col)
    };

    // Update the data with new column names
    const updatedData = activeFile.data.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        if (key === oldName) {
          newRow[newName] = row[key];
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });

    // Update the file
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, data: updatedData, analysis: updatedAnalysis }
        : file
    ));

    // Update column widths
    setColumnWidths(prev => {
      const newWidths = { ...prev };
      if (newWidths[activeFileId] && newWidths[activeFileId][oldName]) {
        newWidths[activeFileId] = {
          ...newWidths[activeFileId],
          [newName]: newWidths[activeFileId][oldName]
        };
        delete newWidths[activeFileId][oldName];
      }
      return newWidths;
    });

    // Update hidden columns
    setHiddenColumns(prev => {
      const newHidden = { ...prev };
      if (newHidden[activeFileId]) {
        newHidden[activeFileId] = newHidden[activeFileId].map(col => 
          col === oldName ? newName : col
        );
      }
      return newHidden;
    });
  };

  console.log('App render state:', { isInitializing, isAuthenticated, files: files.length });

  // Show loading state while initializing
  if (isInitializing) {
    console.log('Showing loading state');
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          color: 'var(--gray-600)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--gray-200)',
            borderTop: '2px solid var(--primary-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Showing login screen');
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  console.log('Showing main app interface');
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
        padding: 'var(--space-6) 0',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--gray-200)'
              }}>
                <img 
                  src={MitutoyoLogo} 
                  alt="Mitutoyo" 
                  style={{
                    width: '32px',
                    height: '26px'
                  }}
                />
              </div>
              <div>
                <h1 style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  margin: 0,
                  color: 'var(--gray-900)',
                  lineHeight: 1.2
                }}>
                  Mitutoyo Prospecting Engine
                </h1>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--gray-600)',
                  margin: 0,
                  fontWeight: 'var(--font-medium)'
                }}>
                  Advanced Data Analysis Platform
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
              <button
                onClick={handleClearAllData}
                className="btn btn-danger"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)'
                }}
              >
                Clear Data
              </button>
              <button
                onClick={handleClearOldData}
                className="btn btn-warning"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)'
                }}
              >
                Clear Old Data
              </button>

            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        {files.length === 0 ? (
          <div className="card animate-fade-in" style={{
            padding: 'var(--space-12)',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <FileUpload onFileSelect={processCSVFile} isLoading={isLoading} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <FileTabs
              files={files}
              activeFileId={activeFileId}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onTabRename={handleTabRename}
              onTabReorder={handleTabReorder}
            />

            {activeFileId && (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: 'var(--space-6)',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)'
                }}>
                  <div>
                    <h2 style={{ 
                      fontSize: 'var(--text-xl)', 
                      fontWeight: 'var(--font-bold)', 
                      marginBottom: 'var(--space-1)',
                      color: 'var(--gray-900)'
                    }}>
                      {files.find(f => f.id === activeFileId)?.displayName}
                    </h2>
                    <p style={{ 
                      color: 'var(--gray-600)', 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}>
                      {files.find(f => f.id === activeFileId)?.data.length} rows loaded
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <ColumnSelector
                      columns={files.find(f => f.id === activeFileId)?.analysis?.columns || []}
                      hiddenColumns={hiddenColumns[activeFileId] || []}
                      onToggleColumn={handleToggleColumn}
                      analysis={files.find(f => f.id === activeFileId)?.analysis}
                    />
                    <button className="btn btn-primary" onClick={exportToCSV}>
                      <Download size={16} />
                      Export CSV
                    </button>
                    <button className="btn" onClick={() => document.getElementById('file-input')?.click()}>
                      <Plus size={16} />
                      Add File
                    </button>
                    

                  </div>
                </div>

                {error && (
                  <div className="error">
                    {error}
                  </div>
                )}

                {storageWarning && (
                  <div className="warning" style={{
                    backgroundColor: 'var(--orange-50)',
                    border: '1px solid var(--orange-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
                    color: 'var(--orange-800)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: 'var(--orange-500)',
                          borderRadius: '50%',
                          flexShrink: 0
                        }} />
                        {storageWarning}
                      </div>
                      <button 
                        onClick={clearStorageWarning} 
                        style={{ 
                          background: 'none',
                          border: 'none',
                          color: 'var(--orange-600)',
                          cursor: 'pointer',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          marginLeft: 'var(--space-3)'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--orange-100)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <DataStats analysis={files.find(f => f.id === activeFileId)?.analysis} />
                
                <div className="card" style={{ 
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-6)'
                }}>
                  <DataTable 
                    data={files.find(f => f.id === activeFileId)?.data} 
                    analysis={files.find(f => f.id === activeFileId)?.analysis}
                    hiddenColumns={hiddenColumns[activeFileId] || []}
                    columnWidths={columnWidths[activeFileId] || {}}
                    onColumnWidthChange={handleColumnWidthChange}
                    onColumnRename={handleColumnRename}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Hidden file input for adding more files */}
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={(e) => {
            if (e.target.files[0]) {
              processCSVFile(e.target.files[0]);
              e.target.value = '';
            }
          }}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default App; 