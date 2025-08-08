#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = './public/data';
const FILES_JSON = './public/data/files.json';

function updateFilesList() {
  console.log('🔄 Updating files list...');
  
  try {
    // Scan for CSV files
    const csvFiles = [];
    const files = fs.readdirSync(DATA_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.csv')) {
        csvFiles.push(file);
      }
    });
    
    // Create simple files list
    const filesList = {
      files: csvFiles,
      lastUpdated: new Date().toISOString()
    };
    
    // Write the files.json
    fs.writeFileSync(FILES_JSON, JSON.stringify(filesList, null, 2));
    
    console.log(`✅ Updated files list with ${csvFiles.length} CSV files:`);
    csvFiles.forEach(file => {
      console.log(`   📄 ${file}`);
    });
    
    console.log(`\n📋 Files list saved to: ${FILES_JSON}`);
    console.log('🚀 You can now commit and push to update the app!');
    
  } catch (error) {
    console.error('❌ Error updating file index:', error);
    process.exit(1);
  }
}

// Run the update
updateFilesList();
