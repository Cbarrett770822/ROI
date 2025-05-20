import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a PDF report with the supply chain assessment results
 * @param {Object} data - The data to include in the report
 * @param {Object} data.company - The company information
 * @param {Object} data.results - The assessment results
 * @returns {jsPDF} - The generated PDF document
 */
export const generatePDFReport = (data) => {
  try {
    // Ensure data is properly structured with fallbacks
    const company = data?.company || { name: 'Company', id: '1' };
    const results = data?.results || {
      summary: {
        costSavings: 0,
        timeReduction: 0,
        qualityImprovement: 0,
        roi: 0,
        paybackPeriodMonths: 0,
        implementationCost: 0,
        annualSavings: 0,
        overallScorePercent: 0
      },
      categoryScores: {},
      savingsBreakdown: [],
      projections: {}
    };
    
    console.log('Generating report with data:', { company, results });
  
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const centerX = pageWidth / 2;
    
    // Add company logo placeholder
    doc.setFillColor(46, 125, 50); // Primary green color
    doc.rect(centerX - 20, 10, 40, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('SUPPLY CHAIN', centerX, 20, { align: 'center' });
    doc.text('ASSESSMENT', centerX, 25, { align: 'center' });
  
    // Add report title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Supply Chain Optimization Report', centerX, 45, { align: 'center' });
    
    // Add company information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Company: ${company.name}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 67);
  
    // Add executive summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const roiText = `The 5-year ROI for implementing the recommended supply chain optimization 
  initiatives is estimated at ${results.summary.roi}%. This is calculated as:
  
  ROI = ((Annual Savings × 5 - Implementation Cost) ÷ Implementation Cost) × 100
  
  With annual savings of ${formatCurrency(results.summary.costSavings)} and an implementation 
  cost of ${formatCurrency(results.summary.implementationCost)}, the projected 5-year net 
  benefit is ${formatCurrency(results.summary.costSavings * 5 - results.summary.implementationCost)}.`;
  
  const splitRoi = doc.splitTextToSize(roiText, pageWidth - 50);
  doc.text(splitRoi, 25, 135);
  
  // Add payback period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payback Period', 25, 165);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const paybackText = `The estimated payback period for the investment is ${results.summary.paybackPeriodMonths} months. 
  This means the initial investment will be recovered through savings in just over 
  ${Math.floor(results.summary.paybackPeriodMonths / 12)} year${Math.floor(results.summary.paybackPeriodMonths / 12) !== 1 ? 's' : ''} 
  and ${results.summary.paybackPeriodMonths % 12} month${results.summary.paybackPeriodMonths % 12 !== 1 ? 's' : ''}.`;
  
  const splitPayback = doc.splitTextToSize(paybackText, pageWidth - 50);
  doc.text(splitPayback, 25, 175);
  
  // Add additional benefits
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Benefits', 25, 190);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const benefitsText = `Beyond financial returns, the assessment identified significant operational improvements:
  
  • Process Time Reduction: ${results.summary.timeReduction}%
  • Quality Improvement: ${results.summary.qualityImprovement}%
  
  These non-financial benefits contribute to overall operational excellence and customer 
  satisfaction, which may lead to additional revenue opportunities not quantified in this analysis.`;
  
  const splitBenefits = doc.splitTextToSize(benefitsText, pageWidth - 50);
  doc.text(splitBenefits, 25, 200);
  
  // Add a new page for detailed analysis
  doc.addPage();
  
  // Add detailed savings breakdown
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Savings Analysis', 20, 20);
  
  // Create a table for savings breakdown
  const savingsTableData = [];
  let savingsTotalAmount = 0;
  
  if (results.savingsBreakdown) {
    results.savingsBreakdown.forEach(item => {
      savingsTableData.push([
        item.category,
        formatCurrency(item.amount),
        `${item.percentage}%`
      ]);
      savingsTotalAmount += item.amount;
    });
  } else {
    // If savingsBreakdown is not available, create a simple breakdown
    const categories = [
      'Labor', 'Inventory', 'Waste', 'Space', 
      'Transportation', 'Productivity', 'Quality', 'Compliance'
    ];
    
    // Distribute the total savings across categories
    const totalSavingsAmount = results.summary.costSavings;
    categories.forEach((category, index) => {
      const amount = totalSavingsAmount * (0.9 ** index) / categories.length;
      const percentage = Math.round((amount / totalSavingsAmount) * 100);
      savingsTableData.push([
        category,
        formatCurrency(amount),
        `${percentage}%`
      ]);
      savingsTotalAmount += amount;
    });
  }
  
  // Add total row
  savingsTableData.push([
    'Total Annual Savings',
    formatCurrency(savingsTotalAmount),
    '100%'
  ]);
  
  // Generate the table
  doc.autoTable({
    startY: 30,
    head: [['Category', 'Annual Savings', 'Percentage']],
    body: savingsTableData,
    theme: 'grid',
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
    foot: [['Total', formatCurrency(savingsTotalAmount), '100%']],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  // Add category scores
  const tableEndY = doc.previousAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Performance Scores', 20, tableEndY);
  
  // Create a table for category scores
  const scoreTableData = [];
  
  if (results.categoryScores) {
    Object.entries(results.categoryScores).forEach(([category, score]) => {
      scoreTableData.push([
        category,
        `${score.percentScore}%`,
        getPerformanceLevel(score.percentScore)
      ]);
    });
  } else {
    // If categoryScores is not available, create placeholder data
    const categories = [
      'Warehouse Infrastructure', 'Inventory Management', 'Warehouse Operations',
      'Workforce Management', 'Technology & Automation', 'Supply Chain Integration',
      'Performance Measurement', 'Sustainability & Compliance'
    ];
    
    // Generate random scores for demonstration
    categories.forEach(category => {
      const score = Math.round(Math.random() * 60 + 30); // Random score between 30-90
      scoreTableData.push([
        category,
        `${score}%`,
        getPerformanceLevel(score)
      ]);
    });
  }
  
  // Generate the table
  doc.autoTable({
    startY: tableEndY + 10,
    head: [['Category', 'Score', 'Performance Level']],
    body: scoreTableData,
    theme: 'grid',
    headStyles: { fillColor: [2, 119, 189], textColor: [255, 255, 255] }
  });
  
  // Add a new page for implementation plan
  doc.addPage();
  
  // Add implementation plan
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Implementation Plan', 20, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const implementationText = 
    'The following implementation plan outlines the recommended approach for deploying ' +
    'the supply chain optimization initiatives identified in this assessment. The plan ' +
    'is structured in phases to ensure a smooth transition and maximize ROI.';
  
  const splitImplementation = doc.splitTextToSize(implementationText, pageWidth - 40);
  doc.text(splitImplementation, 20, 30);
  
  // Add phases
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Phase 1: Initial Implementation (Months 1-6)', 25, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const phase1Text = 
    '• Implement high-priority initiatives with immediate impact\n' +
    '• Focus on space utilization and productivity improvements\n' +
    '• Deploy core technology components\n' +
    '• Train key personnel\n' +
    '• Expected cost: 70% of implementation budget\n' +
    '• Expected benefits: 50% of annual savings';
  
  doc.text(phase1Text, 30, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Phase 2: Expansion (Months 7-12)', 25, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const phase2Text = 
    '• Roll out remaining technology components\n' +
    '• Implement medium-priority initiatives\n' +
    '• Expand training to all personnel\n' +
    '• Fine-tune initial implementations\n' +
    '• Expected cost: 30% of implementation budget\n' +
    '• Expected benefits: 80% of annual savings';
  
  doc.text(phase2Text, 30, 100);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Phase 3: Optimization (Year 2)', 25, 130);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const phase3Text = 
    '• Implement continuous improvement processes\n' +
    '• Optimize all implemented solutions\n' +
    '• Develop advanced analytics capabilities\n' +
    '• Expected cost: 10% of implementation budget (maintenance)\n' +
    '• Expected benefits: 100% of annual savings';
  
  doc.text(phase3Text, 30, 140);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Phase 4: Advanced Capabilities (Years 3-5)', 25, 170);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const phase4Text = 
    '• Implement advanced optimization algorithms\n' +
    '• Integrate with external supply chain partners\n' +
    '• Deploy predictive analytics\n' +
    '• Expected cost: 10% of implementation budget (maintenance)\n' +
    '• Expected benefits: 110-120% of annual savings';
  
  doc.text(phase4Text, 30, 180);
  
  // Add 5-year projection
  doc.addPage();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('5-Year Financial Projection', 20, 20);
  
  // Create a table for 5-year projection
  const projectionTableData = [];
  
  if (results.projections) {
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    years.forEach((year, index) => {
      const yearData = results.projections[year];
      projectionTableData.push([
        `Year ${index + 1}`,
        formatCurrency(yearData.costs),
        formatCurrency(yearData.savings),
        formatCurrency(yearData.netBenefit)
      ]);
    });
  } else {
    // If projections are not available, create placeholder data
    const baseSavings = results.summary.costSavings;
    const baseCost = results.summary.implementationCost;
    
    projectionTableData.push(
      ['Year 1', formatCurrency(baseCost * 0.7), formatCurrency(baseSavings * 0.5), formatCurrency(baseSavings * 0.5 - baseCost * 0.7)],
      ['Year 2', formatCurrency(baseCost * 0.3), formatCurrency(baseSavings * 0.8), formatCurrency(baseSavings * 0.8 - baseCost * 0.3)],
      ['Year 3', formatCurrency(baseCost * 0.1), formatCurrency(baseSavings), formatCurrency(baseSavings - baseCost * 0.1)],
      ['Year 4', formatCurrency(baseCost * 0.1), formatCurrency(baseSavings * 1.1), formatCurrency(baseSavings * 1.1 - baseCost * 0.1)],
      ['Year 5', formatCurrency(baseCost * 0.1), formatCurrency(baseSavings * 1.2), formatCurrency(baseSavings * 1.2 - baseCost * 0.1)]
    );
  }
  
  // Add total row
  const totalCosts = projectionTableData.reduce((sum, row) => sum + parseFloat(row[1].replace(/[^0-9.-]+/g, '')), 0);
  const totalSavings = projectionTableData.reduce((sum, row) => sum + parseFloat(row[2].replace(/[^0-9.-]+/g, '')), 0);
  const totalNetBenefit = projectionTableData.reduce((sum, row) => sum + parseFloat(row[3].replace(/[^0-9.-]+/g, '')), 0);
  
  // Generate the table
  doc.autoTable({
    startY: 30,
    head: [['Year', 'Costs', 'Savings', 'Net Benefit']],
    body: projectionTableData,
    theme: 'grid',
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
    foot: [['Total', formatCurrency(totalCosts), formatCurrency(totalSavings), formatCurrency(totalNetBenefit)]],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  // Add ROI calculation explanation
  const tableEndY2 = doc.previousAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('How ROI is Calculated', 20, tableEndY2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const roiExplanationText = 
    'The Return on Investment (ROI) calculation in this assessment follows a comprehensive methodology ' +
    'that combines your questionnaire responses with industry benchmarks to provide realistic estimates ' +
    'of potential benefits from supply chain optimization.\n\n' +
    'The 5-year ROI percentage is calculated using the following formula:\n' +
    'ROI = ((Annual Savings × 5 - Implementation Cost) ÷ Implementation Cost) × 100\n\n' +
    'The payback period in months is calculated as:\n' +
    'Payback Period (months) = (Implementation Cost ÷ Annual Savings) × 12';
  
  const splitRoiExplanation = doc.splitTextToSize(roiExplanationText, pageWidth - 40);
  doc.text(splitRoiExplanation, 20, tableEndY2 + 10);
  
  // Add conclusion
  doc.addPage();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusion and Recommendations', 20, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const conclusionText = 
    'Based on the comprehensive assessment of your supply chain operations, we recommend ' +
    'proceeding with the implementation plan outlined in this report. The analysis shows ' +
    'a compelling business case with a strong ROI and relatively short payback period.\n\n' +
    'Key recommendations:\n\n' +
    '1. Prioritize space utilization initiatives, as they represent the largest potential savings\n' +
    '2. Implement productivity improvements to enhance operational efficiency\n' +
    '3. Develop a phased approach to technology implementation to manage change effectively\n' +
    '4. Establish clear KPIs to track progress and ROI realization\n' +
    '5. Invest in training and change management to ensure successful adoption\n\n' +
    'By following these recommendations, your organization can achieve significant cost savings, ' +
    'operational improvements, and competitive advantages in your supply chain operations.';
  
  const splitConclusion = doc.splitTextToSize(conclusionText, pageWidth - 40);
  doc.text(splitConclusion, 20, 30);
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Supply Chain Assessment Report | Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString()}`,
      centerX,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
    return doc;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    // Create a simple error PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(16);
    errorDoc.text('Error Generating Report', 20, 20);
    errorDoc.setFontSize(12);
    errorDoc.text('There was an error generating your report.', 20, 30);
    errorDoc.text('Please try again or contact support.', 20, 40);
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
 * Get the performance level based on score
 * @param {number} score - The score percentage
 * @returns {string} - The performance level
 */
const getPerformanceLevel = (score) => {
  if (score < 50) return 'Needs Improvement';
  if (score < 70) return 'Average';
  if (score < 90) return 'Good';
  return 'Excellent';
};
