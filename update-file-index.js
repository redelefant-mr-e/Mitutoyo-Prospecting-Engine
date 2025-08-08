#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = './public/data';
const INDEX_FILE = './public/data/file-index.json';

function updateFileIndex() {
  console.log('🔄 Updating file index...');
  
  try {
    // Read existing index if it exists
    let existingIndex = { files: [], lastUpdated: '', version: '1.0' };
    if (fs.existsSync(INDEX_FILE)) {
      existingIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    }
    
    // Scan for CSV files
    const csvFiles = [];
    const files = fs.readdirSync(DATA_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.csv')) {
        // Try to find existing metadata
        const existingFile = existingIndex.files.find(f => f.name === file);
        
        csvFiles.push({
          name: file,
          displayName: existingFile?.displayName || file.replace('.csv', ''),
          description: existingFile?.description || `CSV data file: ${file}`
        });
      }
    });
    
    // Create new index
    const newIndex = {
      files: csvFiles,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    // Write the index file
    fs.writeFileSync(INDEX_FILE, JSON.stringify(newIndex, null, 2));
    
    console.log(`✅ Updated file index with ${csvFiles.length} CSV files:`);
    csvFiles.forEach(file => {
      console.log(`   📄 ${file.name} -> ${file.displayName}`);
    });
    
    console.log(`\n📋 File index saved to: ${INDEX_FILE}`);
    console.log('🚀 You can now commit and push to update the app!');
    
  } catch (error) {
    console.error('❌ Error updating file index:', error);
    process.exit(1);
  }
}

// Run the update
updateFileIndex();
