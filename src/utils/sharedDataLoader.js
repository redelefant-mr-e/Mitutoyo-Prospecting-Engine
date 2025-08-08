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

const SHARED_FILES = [
  {
    name: 'All Companies Denmark.csv',
    displayName: 'All Companies Denmark',
    url: `${getBaseUrl()}/data/All Companies Denmark.csv`
  },
  {
    name: 'All Companies.csv',
    displayName: 'All Companies',
    url: `${getBaseUrl()}/data/All Companies.csv`
  },
  {
    name: 'Companies - Medium, High, or Perfect Match.csv',
    displayName: 'Companies - Medium, High, or Perfect Match',
    url: `${getBaseUrl()}/data/Companies - Medium, High, or Perfect Match.csv`
  },
  {
    name: 'Enrich Contact Data - Medium, High, or Perfect Match.csv',
    displayName: 'Enrich Contact Data - Medium, High, or Perfect Match',
    url: `${getBaseUrl()}/data/Enrich Contact Data - Medium, High, or Perfect Match.csv`
  },
  {
    name: 'Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv',
    displayName: 'Enrich Contact Data Denmark - Medium, High, or Perfect Match',
    url: `${getBaseUrl()}/data/Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv`
  }
];

export const loadSharedFiles = async () => {
  console.log('🔄 Loading shared files...');
  const files = [];
  
  for (const sharedFile of SHARED_FILES) {
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