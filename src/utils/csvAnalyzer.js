/**
 * Analyzes CSV data to understand its structure and detect JSON content
 */

export const analyzeCSVData = (data) => {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      columns: [],
      jsonColumns: [],
      dataTypes: {},
      sampleData: {}
    };
  }

  const columns = Object.keys(data[0]);
  const totalRows = data.length;
  const totalColumns = columns.length;
  
  // Analyze each column for data types and JSON content
  const dataTypes = {};
  const jsonColumns = [];
  const sampleData = {};

  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
    const nonEmptyValues = values.filter(val => val !== '');
    
    if (nonEmptyValues.length === 0) {
      dataTypes[column] = 'empty';
      sampleData[column] = null;
      return;
    }

    // Check if column contains JSON
    const jsonCount = nonEmptyValues.filter(val => {
      if (typeof val !== 'string') return false;
      const trimmed = val.trim();
      return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
             (trimmed.startsWith('[') && trimmed.endsWith(']'));
    }).length;

    const jsonPercentage = (jsonCount / nonEmptyValues.length) * 100;
    
    if (jsonPercentage > 50) {
      jsonColumns.push(column);
      dataTypes[column] = 'json';
    } else if (jsonPercentage > 0) {
      dataTypes[column] = 'mixed';
    } else {
      // Determine other data types
      const allNumbers = nonEmptyValues.every(val => !isNaN(val) && val !== '');
      const allDates = nonEmptyValues.every(val => !isNaN(Date.parse(val)));
      const allBooleans = nonEmptyValues.every(val => 
        val.toLowerCase() === 'true' || val.toLowerCase() === 'false'
      );

      if (allNumbers) {
        dataTypes[column] = 'number';
      } else if (allDates) {
        dataTypes[column] = 'date';
      } else if (allBooleans) {
        dataTypes[column] = 'boolean';
      } else {
        dataTypes[column] = 'string';
      }
    }

    // Store sample data (first non-empty value)
    sampleData[column] = nonEmptyValues[0] || null;
  });

  return {
    totalRows,
    totalColumns,
    columns,
    jsonColumns,
    dataTypes,
    sampleData
  };
};

/**
 * Safely parses JSON strings
 */
export const safeJsonParse = (str) => {
  if (typeof str !== 'string') return str;
  
  try {
    return JSON.parse(str);
  } catch (error) {
    return str; // Return original string if parsing fails
  }
};

/**
 * Formats JSON for display
 */
export const formatJson = (json) => {
  if (typeof json === 'string') {
    const parsed = safeJsonParse(json);
    if (parsed !== json) {
      return JSON.stringify(parsed, null, 2);
    }
  }
  
  if (typeof json === 'object' && json !== null) {
    return JSON.stringify(json, null, 2);
  }
  
  return String(json);
};

/**
 * Truncates text for table display
 */
export const truncateText = (text, maxLength = 100) => {
  if (typeof text !== 'string') return String(text);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}; 