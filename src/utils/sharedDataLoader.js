/**
 * Shared data loader for CSV files stored in the repository
 */

const SHARED_FILES = [
  {
    name: 'All Companies Denmark.csv',
    displayName: 'All Companies Denmark',
    url: '/data/All Companies Denmark.csv'
  },
  {
    name: 'All Companies.csv',
    displayName: 'All Companies',
    url: '/data/All Companies.csv'
  },
  {
    name: 'Companies - Medium, High, or Perfect Match.csv',
    displayName: 'Companies - Medium, High, or Perfect Match',
    url: '/data/Companies - Medium, High, or Perfect Match.csv'
  },
  {
    name: 'Enrich Contact Data - Medium, High, or Perfect Match.csv',
    displayName: 'Enrich Contact Data - Medium, High, or Perfect Match',
    url: '/data/Enrich Contact Data - Medium, High, or Perfect Match.csv'
  },
  {
    name: 'Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv',
    displayName: 'Enrich Contact Data Denmark - Medium, High, or Perfect Match',
    url: '/data/Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv'
  }
];

export const loadSharedFiles = async () => {
  const files = [];
  
  for (const sharedFile of SHARED_FILES) {
    try {
      const response = await fetch(sharedFile.url);
      if (response.ok) {
        const text = await response.text();
        
        // Parse CSV data
        const Papa = await import('papaparse');
        const results = Papa.parse(text, {
          header: true,
          skipEmptyLines: true
        });
        
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
        }
      }
    } catch (error) {
      console.warn(`Failed to load shared file ${sharedFile.name}:`, error);
    }
  }
  
  return files;
};

export const getSharedFilesList = () => {
  return SHARED_FILES.map(file => ({
    name: file.name,
    displayName: file.displayName,
    url: file.url
  }));
}; 