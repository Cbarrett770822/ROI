/**
 * Utilities for exporting and importing data to/from files
 */

/**
 * Export companies and questionnaire data to a JSON file
 * @param {Object} data - The data to export
 * @param {Array} data.companies - List of company objects
 * @param {Object} data.answers - Map of company IDs to questionnaire answers
 * @returns {void}
 */
export const exportDataToFile = (data) => {
  try {
    // Ensure companies is an array
    const companies = Array.isArray(data.companies) ? data.companies : [data.companies].filter(Boolean);
    
    // Format the data for export
    const exportData = {
      companies: companies,
      answers: data.answers || {},
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    console.log('Formatted export data:', exportData);
    console.log('Number of companies being exported:', exportData.companies.length);

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob with the data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `supply-chain-assessment-data-${new Date().toISOString().split('T')[0]}.json`;
    
    // Append to the body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke the URL to free up memory
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

/**
 * Import data from a JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<Object>} - The imported data
 */
export const importDataFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate the data structure
        if (!data.companies || !data.answers) {
          throw new Error('Invalid data format');
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};
