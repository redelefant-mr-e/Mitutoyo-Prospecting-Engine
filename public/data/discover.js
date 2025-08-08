// This file helps the app discover CSV files automatically
// It's a simple approach that tries to fetch common file patterns

const KNOWN_FILES = [
  'All Companies Denmark.csv',
  'All Companies.csv', 
  'Companies - Medium, High, or Perfect Match.csv',
  'Enrich Contact Data - Medium, High, or Perfect Match.csv',
  'Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv'
];

// Common CSV file patterns to try
const COMMON_PATTERNS = [
  ...KNOWN_FILES,
  'data.csv',
  'export.csv', 
  'companies.csv',
  'contacts.csv',
  'leads.csv',
  'customers.csv',
  'prospects.csv',
  'sales.csv',
  'marketing.csv',
  'users.csv',
  'products.csv',
  'orders.csv',
  'inventory.csv'
];

// Function to check if a file exists
async function checkFile(baseUrl, fileName) {
  try {
    const response = await fetch(`${baseUrl}/data/${fileName}`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Function to discover all available files
async function discoverFiles(baseUrl) {
  const discoveredFiles = [];
  
  for (const fileName of COMMON_PATTERNS) {
    const exists = await checkFile(baseUrl, fileName);
    if (exists) {
      discoveredFiles.push({
        name: fileName,
        displayName: fileName.replace('.csv', ''),
        description: `CSV data file: ${fileName}`
      });
    }
  }
  
  return discoveredFiles;
}

// Export for use in the main app
if (typeof window !== 'undefined') {
  window.discoverCSVFiles = discoverFiles;
}
