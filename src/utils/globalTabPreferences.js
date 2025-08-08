/**
 * Global tab preferences management for shared files
 * This allows all users to have consistent tab ordering and naming
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

const PREFERENCES_FILE = `${getBaseUrl()}/tab-preferences.json`;

// Load global tab preferences from the repository
export const loadGlobalTabPreferences = async () => {
  try {
    const response = await fetch(PREFERENCES_FILE);
    if (response.ok) {
      const preferences = await response.json();
      console.log('✅ Loaded global tab preferences:', preferences);
      return preferences;
    } else {
      console.log('📁 No global tab preferences found, using defaults');
      return {
        tabOrder: [],
        tabNames: {},
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('❌ Failed to load global tab preferences:', error);
    return {
      tabOrder: [],
      tabNames: {},
      lastUpdated: new Date().toISOString()
    };
  }
};

// Save global tab preferences (this would need to be done via GitHub API or manual file update)
export const saveGlobalTabPreferences = async (preferences) => {
  // Note: This would require GitHub API access to write to the repository
  // For now, we'll just log the preferences that should be saved
  console.log('💾 Global tab preferences to save:', preferences);
  
  // In a real implementation, this would use GitHub API to update the file
  // For now, we'll provide instructions for manual update
  const instructions = `
To save global tab preferences, manually update the file:
${PREFERENCES_FILE}

With the following content:
${JSON.stringify(preferences, null, 2)}
  `;
  
  console.log(instructions);
  return { success: false, message: 'Manual update required' };
};

// Apply global preferences to files
export const applyGlobalPreferences = (files, preferences) => {
  if (!preferences || !preferences.tabOrder || preferences.tabOrder.length === 0) {
    console.log('📝 No global preferences to apply, using default order');
    return files;
  }

  console.log('🔄 Applying global preferences to files...');

  // Create a map of file IDs to their desired order
  const orderMap = {};
  preferences.tabOrder.forEach((fileId, index) => {
    orderMap[fileId] = index;
  });

  // Sort files based on global order, keeping unknown files at the end
  const sortedFiles = [...files].sort((a, b) => {
    const aOrder = orderMap[a.id] ?? 9999;
    const bOrder = orderMap[b.id] ?? 9999;
    return aOrder - bOrder;
  });

  // Apply global tab names
  const filesWithNames = sortedFiles.map(file => {
    if (preferences.tabNames && preferences.tabNames[file.id]) {
      console.log(`📝 Applying custom name to ${file.id}: "${preferences.tabNames[file.id]}"`);
      return { ...file, displayName: preferences.tabNames[file.id] };
    }
    return file;
  });

  console.log(`✅ Applied global preferences to ${filesWithNames.length} files`);
  return filesWithNames;
};

// Generate preferences from current file state
export const generatePreferences = (files) => {
  const preferences = {
    tabOrder: files.map(file => file.id),
    tabNames: files.reduce((names, file) => {
      // Only save custom names (not the default filename)
      const defaultName = file.name.replace('.csv', '');
      if (file.displayName !== defaultName) {
        names[file.id] = file.displayName;
      }
      return names;
    }, {}),
    lastUpdated: new Date().toISOString()
  };

  console.log('📊 Generated preferences:', {
    tabOrder: preferences.tabOrder.length,
    customNames: Object.keys(preferences.tabNames).length,
    lastUpdated: preferences.lastUpdated
  });

  return preferences;
};
