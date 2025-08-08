/**
 * Session management utilities for persisting data across login/logout
 */

const STORAGE_KEYS = {
  FILES: 'mitutoyo_prospecting_files',
  ACTIVE_FILE: 'mitutoyo_prospecting_active_file',
  HIDDEN_COLUMNS: 'mitutoyo_prospecting_hidden_columns',
  COLUMN_WIDTHS: 'mitutoyo_prospecting_column_widths',
  AUTHENTICATED: 'mitutoyo_prospecting_authenticated'
};

// Helper function to get localStorage size
const getLocalStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// Helper function to check if we're approaching localStorage quota
const checkStorageQuota = (dataSize) => {
  const currentSize = getLocalStorageSize();
  const estimatedNewSize = currentSize + dataSize;
  // Most browsers have 5-10MB limit, let's use 8MB for better capacity
  const quotaLimit = 8 * 1024 * 1024; // 8MB
  return {
    currentSize,
    estimatedNewSize,
    quotaLimit,
    isNearQuota: estimatedNewSize > quotaLimit * 0.8, // 80% of quota
    wouldExceedQuota: estimatedNewSize > quotaLimit
  };
};

// Helper function to compress data by removing unnecessary fields
const compressFileData = (files) => {
  return files.map(file => ({
    id: file.id,
    name: file.name,
    displayName: file.displayName,
    // Only keep essential data, remove analysis if it's large
    data: file.data,
    analysis: file.analysis ? {
      columns: file.analysis.columns,
      dataTypes: file.analysis.dataTypes,
      // Remove other analysis fields that might be large
      rowCount: file.analysis.rowCount,
      columnCount: file.analysis.columnCount
    } : null
  }));
};

// Helper function to save with reduced files (no recursion)
const saveWithReducedFiles = (files, activeFileId, hiddenColumns, columnWidths) => {
  try {
    const reducedFiles = files.slice(-2); // Keep only the 2 most recent files
    const compressedFiles = compressFileData(reducedFiles);
    
    const filesData = JSON.stringify(compressedFiles);
    const hiddenColumnsData = JSON.stringify(hiddenColumns);
    const columnWidthsData = JSON.stringify(columnWidths);
    
    localStorage.setItem(STORAGE_KEYS.FILES, filesData);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, activeFileId || '');
    localStorage.setItem(STORAGE_KEYS.HIDDEN_COLUMNS, hiddenColumnsData);
    localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, columnWidthsData);
    
    console.log('Successfully saved reduced session data. New localStorage size:', getLocalStorageSize());
    return {
      success: true,
      warning: `Storage limit exceeded. Only the 2 most recent files were saved.`,
      filesRemoved: files.length - 2
    };
  } catch (error) {
    console.error('Failed to save reduced session data:', error);
    return { success: false, error: error.message };
  }
};

export const saveSessionData = (files, activeFileId, hiddenColumns, columnWidths) => {
  try {
    // Compress files data to reduce storage size
    const compressedFiles = compressFileData(files);
    
    const filesData = JSON.stringify(compressedFiles);
    const hiddenColumnsData = JSON.stringify(hiddenColumns);
    const columnWidthsData = JSON.stringify(columnWidths);
    
    const quotaCheck = checkStorageQuota(filesData.length + hiddenColumnsData.length + columnWidthsData.length);
    
    console.log('Saving session data:', {
      filesCount: files.length,
      filesSize: filesData.length,
      hiddenColumnsSize: hiddenColumnsData.length,
      columnWidthsSize: columnWidthsData.length,
      totalSize: filesData.length + hiddenColumnsData.length + columnWidthsData.length,
      localStorageSize: quotaCheck.currentSize,
      isNearQuota: quotaCheck.isNearQuota,
      wouldExceedQuota: quotaCheck.wouldExceedQuota
    });
    
    // If we would exceed quota, try to remove oldest files
    if (quotaCheck.wouldExceedQuota && files.length > 1) {
      console.warn('Approaching localStorage quota. Removing oldest files to make space.');
      // Remove the oldest file (first in array) and try again
      const reducedFiles = files.slice(1);
      const reducedCompressedFiles = compressFileData(reducedFiles);
      const reducedFilesData = JSON.stringify(reducedCompressedFiles);
      
      localStorage.setItem(STORAGE_KEYS.FILES, reducedFilesData);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, activeFileId || '');
      localStorage.setItem(STORAGE_KEYS.HIDDEN_COLUMNS, hiddenColumnsData);
      localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, columnWidthsData);
      
      console.log('Successfully saved reduced session data. New localStorage size:', getLocalStorageSize());
      return {
        success: true,
        warning: `Storage limit reached. Oldest file was removed to make space. You can now add up to ${reducedFiles.length} files.`,
        filesRemoved: 1
      };
    }
    
    localStorage.setItem(STORAGE_KEYS.FILES, filesData);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, activeFileId || '');
    localStorage.setItem(STORAGE_KEYS.HIDDEN_COLUMNS, hiddenColumnsData);
    localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, columnWidthsData);
    
    console.log('Successfully saved session data. New localStorage size:', getLocalStorageSize());
    return { success: true };
  } catch (error) {
    console.error('Failed to save session data:', error);
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error('localStorage quota exceeded! This might be why files are being lost.');
      console.error('Current localStorage size:', getLocalStorageSize());
      console.error('Files data size:', JSON.stringify(files).length);
      
      // Try to save with fewer files using the separate function
      if (files.length > 1) {
        console.log('Attempting to save with fewer files...');
        return saveWithReducedFiles(files, activeFileId, hiddenColumns, columnWidths);
      }
    }
    return { success: false, error: error.message };
  }
};

export const loadSessionData = () => {
  try {
    const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES) || '[]');
    const activeFileId = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE) || null;
    const hiddenColumns = JSON.parse(localStorage.getItem(STORAGE_KEYS.HIDDEN_COLUMNS) || '{}');
    const columnWidths = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLUMN_WIDTHS) || '{}');
    
    console.log('Loading session data:', {
      filesCount: files.length,
      localStorageSize: getLocalStorageSize()
    });
    
    // Validate that we have actual data
    if (files.length > 0 && files[0].data) {
      return { files, activeFileId, hiddenColumns, columnWidths };
    }
    
    return { files: [], activeFileId: null, hiddenColumns: {}, columnWidths: {} };
  } catch (error) {
    console.warn('Failed to load session data:', error);
    return { files: [], activeFileId: null, hiddenColumns: {}, columnWidths: {} };
  }
};

export const saveAuthenticationState = (isAuthenticated) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, JSON.stringify(isAuthenticated));
  } catch (error) {
    console.warn('Failed to save authentication state:', error);
  }
};

export const loadAuthenticationState = () => {
  try {
    const authenticated = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTHENTICATED) || 'false');
    return authenticated;
  } catch (error) {
    console.warn('Failed to load authentication state:', error);
    return false;
  }
};

export const clearSessionData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear session data:', error);
  }
};

export const getStorageInfo = () => {
  const currentSize = getLocalStorageSize();
  const quotaLimit = 8 * 1024 * 1024; // 8MB
  const usagePercent = (currentSize / quotaLimit) * 100;
  
  return {
    currentSize,
    quotaLimit,
    usagePercent,
    isNearQuota: usagePercent > 80,
    remainingSpace: quotaLimit - currentSize
  };
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}; 