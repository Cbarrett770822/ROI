import { jsPDF } from 'jspdf';

/**
 * Generate a comprehensive PDF report with the supply chain assessment results
 * @param {Object} data - The data to include in the report
 * @returns {jsPDF} - The generated PDF document
 */
export const generatePDFReport = (data) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Supply Chain Assessment Report', 105, 15, { align: 'center' });
    
    // Draw a horizontal line under the title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, 20, 190, 20);
    
    // Add company information
    const company = data?.company || { name: 'Company' };
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Company: ${company.name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Executive Summary', 20, 55);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, 58, 190, 58);
    
    // Create summary table manually
    const results = data?.results || { summary: {} };
    const summary = results.summary || {};
    
    let yPos = 65;
    const lineHeight = 8;
    
    // Define column positions for better alignment
    const labelX = 25;
    const valueX = 120;
    
    // Draw a light gray background for the executive summary
    doc.setFillColor(245, 245, 245); // Light gray
    doc.rect(labelX - 5, yPos - 5, 170, lineHeight * 5 + 10, 'F');
    
    // Add a subtle border
    doc.setDrawColor(200, 200, 200); // Light gray border
    doc.setLineWidth(0.2);
    doc.rect(labelX - 5, yPos - 5, 170, lineHeight * 5 + 10, 'S');
    
    // Draw summary data with better formatting
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Overall Score:', labelX, yPos);
    doc.setFont(undefined, 'normal'); 
    doc.text(`${summary.overallScorePercent || 0}%`, valueX, yPos, { align: 'right' });
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Annual Savings:', labelX, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(formatCurrency(summary.annualSavings || 0), valueX, yPos, { align: 'right' });
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Implementation Cost:', labelX, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(formatCurrency(summary.implementationCost || 0), valueX, yPos, { align: 'right' });
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('ROI:', labelX, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${summary.roi || 0}%`, valueX, yPos, { align: 'right' });
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Payback Period:', labelX, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${summary.paybackPeriodMonths || 0} months`, valueX, yPos, { align: 'right' });
    yPos += lineHeight * 2;
    
    // Add savings breakdown section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Savings Breakdown', 20, yPos);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += lineHeight * 1.5;
    
    // Add savings breakdown table
    const savingsBreakdown = results.savingsBreakdown || [];
    
    if (savingsBreakdown.length > 0) {
      // Define column positions for better alignment
      const col1 = 25;  // Category
      const col2 = 110; // Annual Savings
      const col3 = 160; // % of Total
      
      // Draw table background
      doc.setFillColor(245, 245, 245); // Light gray
      doc.rect(col1 - 5, yPos - 5, 170, (savingsBreakdown.length + 1) * lineHeight + 10, 'F');
      
      // Draw table header background
      doc.setFillColor(230, 230, 230); // Slightly darker gray for header
      doc.rect(col1 - 5, yPos - 5, 170, lineHeight + 5, 'F');
      
      // Add a subtle border
      doc.setDrawColor(200, 200, 200); // Light gray border
      doc.setLineWidth(0.2);
      doc.rect(col1 - 5, yPos - 5, 170, (savingsBreakdown.length + 1) * lineHeight + 10, 'S');
      
      // Draw horizontal line after header
      doc.line(col1 - 5, yPos + lineHeight, col1 - 5 + 170, yPos + lineHeight);
      
      // Draw table header
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('Category', col1, yPos);
      doc.text('Annual Savings', col2, yPos, { align: 'right' });
      doc.text('% of Total', col3, yPos, { align: 'right' });
      yPos += lineHeight + 2;
      
      // Draw table rows
      doc.setFont(undefined, 'normal');
      savingsBreakdown.forEach(item => {
        doc.text(item.category, col1, yPos);
        doc.text(formatCurrency(item.amount), col2, yPos, { align: 'right' });
        doc.text(`${(item.percentage || 0).toFixed(1)}%`, col3, yPos, { align: 'right' });
        yPos += lineHeight;
      });
      
      yPos += lineHeight * 2;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('No savings breakdown data available.', 25, yPos);
      yPos += lineHeight * 2;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add 3-year projection section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('3-Year Financial Projection', 20, yPos);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += lineHeight * 1.5;
    
    // Add 3-year projection table
    const projections = results.projections || {};
    
    if (Object.keys(projections).length > 0) {
      // Define column positions for better alignment
      const col1 = 25;  // Year
      const col2 = 65;  // Costs
      const col3 = 105; // Savings
      const col4 = 145; // Net Benefit
      const col5 = 185; // Cumulative
      
      // Draw table background
      doc.setFillColor(245, 245, 245); // Light gray
      doc.rect(col1 - 5, yPos - 5, 170, (Object.keys(projections).length + 1) * lineHeight + 10, 'F');
      
      // Draw table header background
      doc.setFillColor(230, 230, 230); // Slightly darker gray for header
      doc.rect(col1 - 5, yPos - 5, 170, lineHeight + 5, 'F');
      
      // Add a subtle border
      doc.setDrawColor(200, 200, 200); // Light gray border
      doc.setLineWidth(0.2);
      doc.rect(col1 - 5, yPos - 5, 170, (Object.keys(projections).length + 1) * lineHeight + 10, 'S');
      
      // Draw horizontal line after header
      doc.line(col1 - 5, yPos + lineHeight, col1 - 5 + 170, yPos + lineHeight);
      
      // Draw table header
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('Year', col1, yPos);
      doc.text('Costs', col2, yPos, { align: 'right' });
      doc.text('Savings', col3, yPos, { align: 'right' });
      doc.text('Net Benefit', col4, yPos, { align: 'right' });
      doc.text('Cumulative', col5, yPos, { align: 'right' });
      yPos += lineHeight + 2;
      
      // Draw table rows
      doc.setFont(undefined, 'normal');
      let cumulativeBenefit = 0;
      
      Object.entries(projections).forEach(([year, data], index) => {
        cumulativeBenefit += data.netBenefit;
        doc.text(`Year ${index + 1}`, col1, yPos);
        doc.text(formatCurrency(data.costs), col2, yPos, { align: 'right' });
        doc.text(formatCurrency(data.savings), col3, yPos, { align: 'right' });
        doc.text(formatCurrency(data.netBenefit), col4, yPos, { align: 'right' });
        doc.text(formatCurrency(cumulativeBenefit), col5, yPos, { align: 'right' });
        yPos += lineHeight;
      });
      
      // Add note about Year 1 costs with a light yellow background to highlight it
      yPos += lineHeight;
      doc.setFillColor(255, 252, 220); // Very light yellow
      doc.rect(col1 - 5, yPos - 5, 170, lineHeight + 10, 'F');
      doc.setDrawColor(240, 230, 140); // Khaki border
      doc.rect(col1 - 5, yPos - 5, 170, lineHeight + 10, 'S');
      
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text('Note: Year 1 includes both license and implementation costs.', col1, yPos + 3);
      doc.setFont(undefined, 'normal');
      yPos += lineHeight * 2;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('No projection data available.', 25, yPos);
      yPos += lineHeight * 2;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add improvement areas section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Top Improvement Opportunities', 20, yPos);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += lineHeight * 1.5;
    
    // Add improvement areas table
    const improvementAreas = results.improvementAreas || [];
    
    if (improvementAreas.length > 0) {
      // Draw table header
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Category', 25, yPos);
      doc.text('Current Score', 90, yPos);
      doc.text('Improvement', 130, yPos);
      doc.text('Potential Savings', 170, yPos);
      yPos += lineHeight + 2;
      
      // Draw table rows
      doc.setFont(undefined, 'normal');
      improvementAreas.forEach(area => {
        doc.text(area.category, 25, yPos);
        doc.text(`${(area.percentScore || 0).toFixed(1)}%`, 90, yPos);
        doc.text(`${(area.improvementPotential || 0).toFixed(1)}%`, 130, yPos);
        doc.text(formatCurrency(area.potentialSavings), 170, yPos);
        yPos += lineHeight;
      });
      
      yPos += lineHeight * 2;
    } else {
      doc.setFontSize(10);
      doc.text('No improvement areas data available.', 25, yPos);
      yPos += lineHeight * 2;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add Calculation Methodology section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Calculation Methodology', 20, yPos);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += lineHeight * 1.5;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 40; // 20px margin on each side
    
    doc.text('Our ROI model calculates savings based on your improvement potential. Lower assessment scores', 25, yPos);
    yPos += lineHeight;
    doc.text('indicate higher potential for improvement, which translates to greater savings when implementing a WMS:', 25, yPos);
    yPos += lineHeight * 1.5;
    
    // Inventory
    doc.text('Inventory:', 25, yPos);
    doc.setFont(undefined, 'normal');
    const inventoryText1 = 'Based on inventory carrying costs (25% of inventory value) and your';
    doc.text(inventoryText1, 70, yPos);
    yPos += lineHeight;
    const inventoryText2 = 'Inventory Management improvement potential (30% realization factor).';
    doc.text(inventoryText2, 70, yPos);
    yPos += lineHeight * 1.5;
    
    // Productivity
    doc.text('Productivity:', 25, yPos);
    const productivityText1 = 'Calculated directly from labor costs and your Technology & Automation';
    doc.text(productivityText1, 70, yPos);
    yPos += lineHeight;
    const productivityText2 = 'improvement potential, with adjustments for company size and transaction';
    doc.text(productivityText2, 70, yPos);
    yPos += lineHeight;
    const productivityText3 = 'complexity. Base rate is 15% of labor costs, scaled by company-specific';
    doc.text(productivityText3, 70, yPos);
    yPos += lineHeight;
    const productivityText4 = 'factors, with a minimum of 2% of total labor costs.';
    doc.text(productivityText4, 70, yPos);
    yPos += lineHeight * 1.5;
    
    // Quality
    doc.text('Quality:', 25, yPos);
    const qualityText1 = 'Based on 1% of annual revenue and your Performance Measurement';
    doc.text(qualityText1, 70, yPos);
    yPos += lineHeight;
    const qualityText2 = 'improvement potential (25% realization factor), capped at 0.5% of annual revenue.';
    doc.text(qualityText2, 70, yPos);
    yPos += lineHeight * 1.5;
    
    // Compliance
    doc.text('Compliance:', 25, yPos);
    const complianceText1 = 'Based on 0.5% of annual revenue and your Sustainability & Compliance';
    doc.text(complianceText1, 70, yPos);
    yPos += lineHeight;
    const complianceText2 = 'improvement potential (20% realization factor), capped at 0.2% of annual revenue.';
    doc.text(complianceText2, 70, yPos);
    yPos += lineHeight * 1.5;
    
    // Other categories
    doc.text('Labor, Waste, Space', 25, yPos);
    const otherText1 = 'Each calculated using their respective improvement potentials and';
    doc.text(otherText1, 70, yPos);
    yPos += lineHeight;
    doc.text('& Transportation:', 25, yPos);
    const otherText2 = 'industry-standard realization factors.';
    doc.text(otherText2, 70, yPos);
    yPos += lineHeight * 2;
    
    // Force Glossary of Terms to start on a new page
    doc.addPage();
    yPos = 20;
    
    // Add Glossary of Terms section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Glossary of Terms', 20, yPos);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += lineHeight * 1.5;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    // Inventory Carrying Cost
    doc.setFont(undefined, 'bold');
    doc.text('Inventory Carrying Cost:', 25, yPos);
    doc.setFont(undefined, 'normal');
    yPos += lineHeight;
    doc.text('The cost of holding inventory, calculated as 25% of inventory value.', 25, yPos);
    yPos += lineHeight;
    doc.text('Inventory value is estimated as 20% of annual revenue. For example, with $150M annual', 25, yPos);
    yPos += lineHeight;
    doc.text('revenue, inventory value is $30M, and carrying cost is $7.5M annually. This includes', 25, yPos);
    yPos += lineHeight;
    doc.text('capital costs (10-15%), storage costs (2-5%), risk costs (6-8%), and service costs (2-4%).', 25, yPos);
    yPos += lineHeight;
    doc.text('This approach is validated by industry authorities including APQC\'s Open Standards', 25, yPos);
    yPos += lineHeight;
    doc.text('Benchmarking and research from Gartner\'s Supply Chain Management Cost Savings', 25, yPos);
    yPos += lineHeight;
    doc.text('analysis, which confirms WMS implementations can reduce these costs by up to 27%.', 25, yPos);
    yPos += lineHeight * 1.5;
    
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    // Improvement Potential
    doc.setFont(undefined, 'bold');
    doc.text('Improvement Potential:', 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Calculated as (100 - Score)%. Lower assessment scores indicate', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('higher improvement potential. For example, a score of 25% means a 75% improvement', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('potential.', 25, yPos + lineHeight);
    yPos += lineHeight;
    yPos += lineHeight * 1.5;
    
    // Realization Factor
    doc.setFont(undefined, 'bold');
    doc.text('Realization Factor:', 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('The percentage of theoretical improvement that can realistically be', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('achieved through a WMS implementation. Varies by category: Inventory (30%),', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('Productivity (45%), Quality (25%), Compliance (20%), Labor (20%), Waste (40%),', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('Space (25%), and Transportation (15%). These factors are supported by Journal', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('of Supply Chain Management Research showing WMS implementations typically', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('achieve 15-35% labor cost reductions and CSCMP\'s State of Logistics Report', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('data on supply chain efficiency improvements.', 25, yPos + lineHeight);
    yPos += lineHeight;
    yPos += lineHeight * 1.5;
    
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    // Total Labor Cost
    doc.setFont(undefined, 'bold');
    doc.text('Total Labor Cost:', 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Calculated as the number of FTEs multiplied by the cost per FTE.', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('For example, 100 FTEs at $50,000 each equals $5M in total labor cost.', 25, yPos + lineHeight);
    yPos += lineHeight * 2;
    
    // Quality Costs
    doc.setFont(undefined, 'bold');
    doc.text('Quality Costs:', 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Estimated as 1% of annual revenue, representing the cost of quality', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('issues, rework, returns, and customer complaints.', 25, yPos + lineHeight);
    yPos += lineHeight * 2;
    
    // Compliance Costs
    doc.setFont(undefined, 'bold');
    doc.text('Compliance Costs:', 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Estimated as 0.5% of annual revenue, representing the cost of', 25, yPos + lineHeight);
    yPos += lineHeight;
    doc.text('regulatory compliance, audits, and potential penalties.', 25, yPos + lineHeight);
    yPos += lineHeight;
    yPos += lineHeight * 1.5;
    
    // Force ROI Calculation Formula to start on page 4
    doc.addPage();
    yPos = 20;
    
    // Add ROI explanation
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('ROI Calculation Formula', 20, yPos);
    
    // Draw a horizontal line under the section title
    doc.setDrawColor(0, 51, 102); // Dark blue
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += lineHeight * 1.5;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    const explanation = [
      'The Return on Investment (ROI) is calculated based on a 3-year projection period:',
      '',
      '• ROI = (3-Year Savings - Total Cost) / Total Cost × 100%',
      '',
      'Where:',
      '• 3-Year Savings = Annual Savings × 3',
      '• Total Cost = License Cost + Implementation Cost + (License Cost × 2 years)',
      '',
      'The payback period indicates how long it will take to recover the initial investment:',
      '',
      '• Payback Period = (Implementation Cost + License Cost) / Annual Savings × 12 months'
    ];
    
    explanation.forEach(line => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 25, yPos);
      yPos += line ? 7 : 3.5;
    });
    
    // Add industry sources
    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(10);
    doc.setTextColor(0, 51, 102);
    doc.text('Industry Sources:', 25, yPos);
    yPos += 7;
    
    doc.setTextColor(0);
    doc.text('• APQC Open Standards Benchmarking for inventory carrying cost percentages', 25, yPos);
    yPos += 7;
    doc.text('• Journal of Supply Chain Management Research on WMS benefits (up to 27% reduction in carrying costs)', 25, yPos);
    yPos += 7;
    doc.text('• CSCMP State of Logistics Report data on supply chain efficiency improvements', 25, yPos);
    yPos += 7;
    doc.text('• Gartner Supply Chain Technology User Wants and Needs Survey', 25, yPos);
    
    // Add page numbers and footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
      doc.text(`${company.name} - Supply Chain Assessment Report`, 105, 280, { align: 'center' });
    }
    
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

/**
 * Format a number as a percentage
 * @param {number} value - The value to format (e.g., 0.25 for 25%)
 * @returns {string} - The formatted percentage string
 */
const formatPercentage = (value) => {
  // Ensure the value is a number
  const numValue = Number(value) || 0;
  
  // If the value is already in percentage form (e.g., 25 instead of 0.25)
  if (numValue > 1) {
    return `${Math.round(numValue)}%`;
  }
  
  // Otherwise, convert to percentage
  return `${Math.round(numValue * 100)}%`;
};
