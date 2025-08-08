/**
 * Shared data loader for CSV files stored in the repository
 */

// Get the base URL for the current environment
const getBaseUrl = () => {
  // Check if we're on GitHub Pages
  if (window.location.hostname === 'redelefant-mr-e.github.io') {
    return '/Mitutoyo-Prospecting-Engine';
  }
  // Local development
  return '';
};

// List of known CSV files (fallback if dynamic discovery fails)
const KNOWN_FILES = [
  'All Companies Denmark.csv',
  'All Companies.csv',
  'Companies - Medium, High, or Perfect Match.csv',
  'Enrich Contact Data - Medium, High, or Perfect Match.csv',
  'Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv'
];

// Function to discover CSV files dynamically
const discoverCSVFiles = async () => {
  const baseUrl = getBaseUrl();
  const discoveredFiles = [];
  
  try {
    // First, try to load the file index (if it exists)
    const indexUrl = `${baseUrl}/data/file-index.json`;
    console.log(`📋 Attempting to load file index from: ${indexUrl}`);
    
    const indexResponse = await fetch(indexUrl);
    if (indexResponse.ok) {
      const fileIndex = await indexResponse.json();
      console.log(`✅ Loaded file index with ${fileIndex.files.length} files`);
      
      // Use the file index to discover files
      for (const fileInfo of fileIndex.files) {
        const url = `${baseUrl}/data/${fileInfo.name}`;
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            discoveredFiles.push({
              name: fileInfo.name,
              displayName: fileInfo.displayName || fileInfo.name.replace('.csv', ''),
              description: fileInfo.description,
              url: url
            });
          } else {
            console.warn(`⚠️ File listed in index but not found: ${fileInfo.name}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to check file ${fileInfo.name}:`, error);
        }
      }
    } else {
      console.log('📁 No file index found, using automatic discovery...');
      
      // Automatic discovery - try common file patterns
      const commonFileNames = [
        // Current known files
        ...KNOWN_FILES,
        // Common CSV patterns
        'data.csv', 'export.csv', 'companies.csv', 'contacts.csv', 'leads.csv',
        'customers.csv', 'prospects.csv', 'sales.csv', 'marketing.csv',
        'users.csv', 'products.csv', 'orders.csv', 'inventory.csv',
        // Add more patterns as needed
      ];
      
      console.log(`🔍 Testing ${commonFileNames.length} potential file patterns...`);
      
      // Test each potential file
      for (const fileName of commonFileNames) {
        const url = `${baseUrl}/data/${fileName}`;
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            discoveredFiles.push({
              name: fileName,
              displayName: fileName.replace('.csv', ''),
              url: url
            });
            console.log(`✅ Discovered: ${fileName}`);
          }
        } catch (error) {
          // Silently skip files that don't exist
        }
      }
      
      if (discoveredFiles.length > 0) {
        console.log(`🎯 Auto-discovered ${discoveredFiles.length} CSV files`);
        console.log('💡 Tip: Run "node update-file-index.js" to create a file index for faster loading');
      } else {
        console.log('⚠️ No CSV files found in data directory');
      }
    }
  } catch (error) {
    console.warn('❌ Failed to discover files dynamically, using fallback:', error);
    // Final fallback to known files
    for (const fileName of KNOWN_FILES) {
      discoveredFiles.push({
        name: fileName,
        displayName: fileName.replace('.csv', ''),
        url: `${baseUrl}/data/${fileName}`
      });
    }
  }
  
  return discoveredFiles;
};

export const loadSharedFiles = async () => {
  console.log('🔄 Loading shared files...');
  const files = [];
  
  // Discover available CSV files
  const discoveredFiles = await discoverCSVFiles();
  console.log(`📁 Discovered ${discoveredFiles.length} CSV files`);
  
  for (const sharedFile of discoveredFiles) {
    try {
      console.log(`📁 Attempting to load: ${sharedFile.url}`);
      const response = await fetch(sharedFile.url);
      console.log(`📊 Response status for ${sharedFile.name}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`✅ Successfully loaded ${sharedFile.name} (${text.length} characters)`);
        
        // Parse CSV data
        const Papa = await import('papaparse');
        const results = Papa.parse(text, {
          header: true,
          skipEmptyLines: true
        });
        
        console.log(`📈 Parsed ${results.data.length} rows from ${sharedFile.name}`);
        
        if (results.data.length > 0) {
          // Import the analysis function
          const { analyzeCSVData } = await import('./csvAnalyzer');
          const dataAnalysis = analyzeCSVData(results.data);
          
          files.push({
            id: `shared-${sharedFile.name}`,
            name: sharedFile.name,
            displayName: sharedFile.displayName,
            data: results.data,
            analysis: dataAnalysis,
            isShared: true // Flag to identify shared files
          });
          
          console.log(`✅ Added ${sharedFile.name} to files list`);
        }
      } else {
        console.error(`❌ Failed to load ${sharedFile.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error loading shared file ${sharedFile.name}:`, error);
    }
  }
  
  console.log(`🎯 Loaded ${files.length} shared files total`);
  return files;
};

export const getSharedFilesList = () => {
  return SHARED_FILES.map(file => ({
    name: file.name,
    displayName: file.displayName,
    url: file.url
  }));
}; 