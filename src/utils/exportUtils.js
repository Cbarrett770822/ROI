import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exports report data to Excel
 * 
 * @param {Object} reportData - The data to export
 * @param {String} reportName - The name of the report
 * @param {Array} columns - The columns to include in the export
 * @returns {void}
 */
export const exportToExcel = (reportData, reportName, columns = null) => {
  try {
    if (!Array.isArray(reportData) || reportData.length === 0) {
      console.error('No data to export');
      return false;
    }

    // Create a new workbook
    const wb = utils.book_new();
    
    // If columns are specified, filter the data to only include those columns
    let dataToExport = reportData;
    if (columns && Array.isArray(columns) && columns.length > 0) {
      dataToExport = reportData.map(item => {
        const filteredItem = {};
        columns.forEach(column => {
          if (column.field && item[column.field] !== undefined) {
            filteredItem[column.headerName || column.field] = item[column.field];
          }
        });
        return filteredItem;
      });
    }
    
    // Convert data to worksheet
    const ws = utils.json_to_sheet(dataToExport);
    
    // Add worksheet to workbook
    utils.book_append_sheet(wb, ws, reportName);
    
    // Generate Excel file
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create Blob and save file
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${reportName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Prepares report data for printing
 * Opens a new window with a printable version of the report
 * 
 * @param {Object} reportData - The data to print
 * @param {String} reportName - The name of the report
 * @param {Array} columns - The columns to include in the print
 * @returns {void}
 */
export const printReport = (reportData, reportName, columns = null) => {
  try {
    if (!Array.isArray(reportData) || reportData.length === 0) {
      console.error('No data to print');
      return false;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1976d2; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .print-header { display: flex; justify-content: space-between; align-items: center; }
          .print-date { font-size: 12px; color: #666; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${reportName}</h1>
          <div class="print-date">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>
        <button onclick="window.print()">Print Report</button>
        <table>
          <thead>
            <tr>
    `;
    
    // If columns are specified, use them for headers
    const headers = columns && Array.isArray(columns) && columns.length > 0
      ? columns.map(col => col.headerName || col.field)
      : Object.keys(reportData[0]);
    
    // Add headers to HTML
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    
    htmlContent += `
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add data rows to HTML
    reportData.forEach(row => {
      htmlContent += '<tr>';
      
      if (columns && Array.isArray(columns) && columns.length > 0) {
        columns.forEach(column => {
          const value = row[column.field];
          htmlContent += `<td>${value !== undefined ? value : ''}</td>`;
        });
      } else {
        Object.values(row).forEach(value => {
          htmlContent += `<td>${value !== undefined ? value : ''}</td>`;
        });
      }
      
      htmlContent += '</tr>';
    });
    
    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Write HTML to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    return true;
  } catch (error) {
    console.error('Error preparing report for printing:', error);
    return false;
  }
};
