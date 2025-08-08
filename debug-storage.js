// Debug script to test localStorage behavior
console.log('=== localStorage Debug Test ===');

// Simulate the storage keys used by the app
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

// Create mock CSV data
const createMockCSVData = (rows = 100, columns = 10) => {
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = {};
    for (let j = 0; j < columns; j++) {
      row[`Column${j}`] = `Data${i}_${j}`;
    }
    data.push(row);
  }
  return data;
};

// Create mock file objects
const createMockFile = (id, name, data) => ({
  id: id.toString(),
  name: name,
  displayName: name.replace('.csv', ''),
  data: data,
  analysis: {
    columns: Object.keys(data[0] || {}),
    dataTypes: {},
    rowCount: data.length,
    columnCount: Object.keys(data[0] || {}).length
  }
});

// Test function
function testStorageBehavior() {
  console.log('Current localStorage size:', getLocalStorageSize(), 'bytes');
  
  const files = [];
  const hiddenColumns = {};
  const columnWidths = {};
  
  // Simulate adding files one by one
  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- Adding file ${i} ---`);
    
    const mockData = createMockCSVData(100, 10); // 100 rows, 10 columns
    const mockFile = createMockFile(i, `test${i}.csv`, mockData);
    
    files.push(mockFile);
    hiddenColumns[mockFile.id] = [];
    columnWidths[mockFile.id] = {};
    
    try {
      const filesData = JSON.stringify(files);
      const hiddenColumnsData = JSON.stringify(hiddenColumns);
      const columnWidthsData = JSON.stringify(columnWidths);
      
      console.log(`File ${i} data size:`, filesData.length, 'bytes');
      console.log(`Hidden columns size:`, hiddenColumnsData.length, 'bytes');
      console.log(`Column widths size:`, columnWidthsData.length, 'bytes');
      console.log(`Total size:`, filesData.length + hiddenColumnsData.length + columnWidthsData.length, 'bytes');
      
      localStorage.setItem(STORAGE_KEYS.FILES, filesData);
      localStorage.setItem(STORAGE_KEYS.HIDDEN_COLUMNS, hiddenColumnsData);
      localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, columnWidthsData);
      
      console.log(`✅ Successfully saved ${i} files`);
      console.log('Current localStorage size:', getLocalStorageSize(), 'bytes');
      
    } catch (error) {
      console.error(`❌ Failed to save file ${i}:`, error);
      console.error('Error details:', error.name, error.message, error.code);
      break;
    }
  }
  
  // Test loading the data back
  console.log('\n--- Testing data loading ---');
  try {
    const loadedFiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES) || '[]');
    console.log(`Loaded ${loadedFiles.length} files`);
    
    if (loadedFiles.length !== files.length) {
      console.warn(`⚠️  Data loss detected! Expected ${files.length} files, got ${loadedFiles.length}`);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// Run the test
testStorageBehavior(); 