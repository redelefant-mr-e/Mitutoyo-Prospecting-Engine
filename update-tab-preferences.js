#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PREFERENCES_FILE = './public/data/tab-preferences.json';

function updateTabPreferences() {
  console.log('🔄 Updating tab preferences...');
  
  try {
    // Read current preferences
    let preferences = {
      tabOrder: [
        "shared-All Companies Denmark-All Companies Denmark.csv",
        "shared-All Companies-All Companies.csv",
        "shared-Enrich Contact Data - Medium, High, or Perfect Match.csv",
        "shared-Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv",
        "shared-Find (all) People.csv"
      ],
      tabNames: {
        "shared-All Companies Denmark-All Companies Denmark.csv": "Denmark Companies",
        "shared-All Companies-All Companies.csv": "All Companies",
        "shared-Enrich Contact Data - Medium, High, or Perfect Match.csv": "Enriched Contacts",
        "shared-Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv": "Denmark Enriched",
        "shared-Find (all) People.csv": "All People"
      },
      lastUpdated: new Date().toISOString()
    };

    // Write the preferences file
    fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
    
    console.log(`✅ Updated tab preferences with ${preferences.tabOrder.length} files:`);
    preferences.tabOrder.forEach((fileId, index) => {
      const customName = preferences.tabNames[fileId] || fileId;
      console.log(`   ${index + 1}. ${customName}`);
    });
    
    console.log(`\n📋 Preferences saved to: ${PREFERENCES_FILE}`);
    console.log('🚀 You can now commit and push to update the app!');
    
  } catch (error) {
    console.error('❌ Error updating tab preferences:', error);
    process.exit(1);
  }
}

// Run the update
updateTabPreferences();
