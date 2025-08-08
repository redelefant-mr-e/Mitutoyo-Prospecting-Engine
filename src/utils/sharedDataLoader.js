/**
 * Shared data loader for CSV files stored in the repository
 */

// Get the base URL for the current environment
const getBaseUrl = () => {
  // Check if we're on GitHub Pages
  if (window.location.hostname === 'redelefant-mr-e.github.io') {
    return '/Mitutoyo-Prospecting-Engine/data';
  }
  // Local development - use the public directory
  return '/data';
};

// Function to discover CSV files dynamically
const discoverCSVFiles = async () => {
  const baseUrl = getBaseUrl();
  const discoveredFiles = [];
  
  try {
    // Load the simple files list
    const filesUrl = `${baseUrl}/files.json`;
    console.log(`📋 Loading files list from: ${filesUrl}`);
    
    const filesResponse = await fetch(filesUrl);
    if (filesResponse.ok) {
      const filesList = await filesResponse.json();
      console.log(`✅ Loaded files list with ${filesList.files.length} files`);
      
      // Load each file that exists
      for (const fileName of filesList.files) {
        const encodedFileName = encodeURIComponent(fileName);
        const url = `${baseUrl}/${encodedFileName}`;
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            discoveredFiles.push({
              name: fileName,
              displayName: fileName.replace('.csv', ''),
              url: url
            });
            console.log(`✅ Found: ${fileName}`);
          } else {
            console.warn(`⚠️ File listed but not found: ${fileName}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to check file ${fileName}:`, error);
        }
      }
    } else {
      console.log('📁 No files list found. Please ensure files.json exists in the data directory.');
      console.log('💡 Run "node update-file-index.js" to generate the files list.');
    }
  } catch (error) {
    console.warn('❌ Failed to discover files:', error);
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