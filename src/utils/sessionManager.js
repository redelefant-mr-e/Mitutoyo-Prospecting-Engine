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

export const saveSessionData = (files, activeFileId, hiddenColumns, columnWidths) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, activeFileId || '');
    localStorage.setItem(STORAGE_KEYS.HIDDEN_COLUMNS, JSON.stringify(hiddenColumns));
    localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, JSON.stringify(columnWidths));
  } catch (error) {
    console.warn('Failed to save session data:', error);
  }
};

export const loadSessionData = () => {
  try {
    const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES) || '[]');
    const activeFileId = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE) || null;
    const hiddenColumns = JSON.parse(localStorage.getItem(STORAGE_KEYS.HIDDEN_COLUMNS) || '{}');
    const columnWidths = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLUMN_WIDTHS) || '{}');
    
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

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}; 