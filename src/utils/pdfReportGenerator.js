import { jsPDF } from 'jspdf';

/**
 * Generate a basic PDF report with the supply chain assessment results
 * @param {Object} data - The data to include in the report
 * @returns {jsPDF} - The generated PDF document
 */
export const generatePDFReport = (data) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Supply Chain Assessment Report', 105, 15, { align: 'center' });
    
    // Add company information
    const company = data?.company || { name: 'Company' };
    doc.setFontSize(12);
    doc.text(`Company: ${company.name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 20, 55);
    
    // Create summary table manually
    const results = data?.results || { summary: {} };
    const summary = results.summary || {};
    
    let yPos = 65;
    const lineHeight = 8;
    
    // Draw summary data
    doc.setFontSize(10);
    doc.text('Overall Score:', 25, yPos); 
    doc.text(`${summary.overallScorePercent || 0}%`, 120, yPos);
    yPos += lineHeight;
    
    doc.text('Annual Savings:', 25, yPos);
    doc.text(formatCurrency(summary.annualSavings || 0), 120, yPos);
    yPos += lineHeight;
    
    doc.text('Implementation Cost:', 25, yPos);
    doc.text(formatCurrency(summary.implementationCost || 0), 120, yPos);
    yPos += lineHeight;
    
    doc.text('ROI:', 25, yPos);
    doc.text(`${summary.roi || 0}%`, 120, yPos);
    yPos += lineHeight;
    
    doc.text('Payback Period:', 25, yPos);
    doc.text(`${summary.paybackPeriodMonths || 0} months`, 120, yPos);
    yPos += lineHeight * 2;
    
    // Add ROI explanation
    doc.setFontSize(14);
    doc.text('ROI Calculation Explanation', 20, yPos);
    yPos += lineHeight * 1.5;
    
    doc.setFontSize(10);
    const explanation = [
      'The Return on Investment (ROI) is calculated based on the assessment results.',
      'It represents the expected return relative to the implementation cost.',
      '',
      'ROI = (Annual Savings / Implementation Cost) × 100%',
      '',
      'The payback period indicates how long it will take to recover the initial investment.',
      'Payback Period = (Implementation Cost / Annual Savings) × 12 months'
    ];
    
    explanation.forEach(line => {
      doc.text(line, 25, yPos);
      yPos += lineHeight;
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Supply Chain Assessment Report', 105, 280, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    
    // Create a simple error PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(16);
    errorDoc.text('Error Generating Report', 20, 20);
    errorDoc.setFontSize(12);
    errorDoc.text('There was an error generating your report.', 20, 30);
    errorDoc.text('Please try again or contact support.', 20, 40);
    errorDoc.text(`Error: ${error.message || 'Unknown error'}`, 20, 50);
    
    return errorDoc;
  }
};

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @returns {string} - The formatted currency string
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
