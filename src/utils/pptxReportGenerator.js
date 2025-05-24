import pptxgen from 'pptxgenjs';

/**
 * Generate a PowerPoint presentation with the supply chain assessment results
 * @param {Object} data - The data to include in the presentation
 * @returns {pptxgen} - The generated PowerPoint presentation
 */
export const generatePPTXReport = (data) => {
  try {
    // Create a new PowerPoint presentation
    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Supply Chain Assessment Tool';
    pptx.title = 'Supply Chain Assessment Report';
    
    // Get data
    const company = data?.company || { name: 'Company' };
    const results = data?.results || { summary: {} };
    const summary = results.summary || {};
    const savingsBreakdown = results.savingsBreakdown || [];
    const improvementAreas = results.improvementAreas || [];
    const projections = results.projections || {};
    
    // Define common slide options
    const slideOpts = {
      masterName: 'MASTER_SLIDE',
      sectionTitle: 'Supply Chain Assessment'
    };
    
    // Define common text styles
    const titleStyle = { 
      fontSize: 28, 
      color: '0, 51, 102', 
      fontFace: 'Arial', 
      bold: true 
    };
    
    const subtitleStyle = { 
      fontSize: 18, 
      color: '0, 51, 102', 
      fontFace: 'Arial', 
      bold: true 
    };
    
    const bodyStyle = { 
      fontSize: 14, 
      color: '0, 0, 0', 
      fontFace: 'Arial' 
    };
    
    const smallStyle = { 
      fontSize: 12, 
      color: '0, 0, 0', 
      fontFace: 'Arial' 
    };
    
    const highlightStyle = { 
      fontSize: 16, 
      color: '46, 125, 50', 
      fontFace: 'Arial', 
      bold: true 
    };
    
    // ===== SLIDE 1: Title Slide =====
    const slide1 = pptx.addSlide();
    
    // Add title
    slide1.addText('Supply Chain Assessment Report', {
      x: '10%',
      y: '35%',
      w: '80%',
      h: '10%',
      fontSize: 40,
      color: '0, 51, 102',
      fontFace: 'Arial',
      bold: true,
      align: 'center'
    });
    
    // Add company name
    slide1.addText(`${company.name}`, {
      x: '10%',
      y: '50%',
      w: '80%',
      h: '10%',
      fontSize: 28,
      color: '0, 51, 102',
      fontFace: 'Arial',
      align: 'center'
    });
    
    // Add date
    slide1.addText(`${new Date().toLocaleDateString()}`, {
      x: '10%',
      y: '60%',
      w: '80%',
      h: '5%',
      fontSize: 16,
      color: '0, 0, 0',
      fontFace: 'Arial',
      align: 'center'
    });
    
    // ===== SLIDE 2: Executive Summary =====
    const slide2 = pptx.addSlide();
    
    // Add title
    slide2.addText('Executive Summary', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: '10%',
      ...titleStyle
    });
    
    // Add summary table
    const summaryData = [
      ['Overall Score', `${summary.overallScorePercent || 0}%`],
      ['Annual Savings', formatCurrency(summary.annualSavings || 0)],
      ['Implementation Cost', formatCurrency(summary.implementationCost || 0)],
      ['ROI', `${summary.roi || 0}%`],
      ['Payback Period', `${summary.paybackPeriodMonths || 0} months`]
    ];
    
    slide2.addTable(summaryData, {
      x: '10%',
      y: '20%',
      w: '80%',
      h: '30%',
      fontSize: 16,
      fontFace: 'Arial',
      border: { pt: 1, color: 'CFCFCF' },
      colW: [3, 2],
      rowH: 0.5,
      color: '000000',
      valign: 'middle',
      align: 'left'
    });
    
    // Add key message
    slide2.addText([
      { text: 'Key Finding: ', options: { ...highlightStyle } },
      { 
        text: `Based on your assessment, implementing a WMS could yield ${formatCurrency(summary.annualSavings || 0)} in annual savings with a ${summary.roi || 0}% ROI over 3 years.`, 
        options: { ...bodyStyle } 
      }
    ], {
      x: '10%',
      y: '55%',
      w: '80%',
      h: '15%'
    });
    
    // ===== SLIDE 3: Savings Breakdown =====
    const slide3 = pptx.addSlide();
    
    // Add title
    slide3.addText('Savings Breakdown', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: '10%',
      ...titleStyle
    });
    
    if (savingsBreakdown.length > 0) {
      // Prepare data for chart
      const categories = savingsBreakdown.map(item => item.category);
      const values = savingsBreakdown.map(item => item.amount);
      const percentages = savingsBreakdown.map(item => item.percentage);
      
      // Add pie chart
      slide3.addChart(pptx.ChartType.pie, [
        {
          name: 'Savings',
          labels: categories,
          values: values
        }
      ], {
        x: '5%',
        y: '20%',
        w: '45%',
        h: '60%',
        chartColors: ['2E7D32', '4CAF50', '8BC34A', 'CDDC39', 'FFC107', 'FF9800', 'FF5722', 'F44336'],
        showLegend: true,
        legendPos: 'r',
        showTitle: false,
        dataLabelFormatCode: '$#,##0',
        showValue: false
      });
      
      // Add table with percentages
      const tableData = [
        ['Category', 'Amount', '% of Total']
      ];
      
      savingsBreakdown.forEach(item => {
        tableData.push([
          item.category,
          formatCurrency(item.amount),
          `${item.percentage.toFixed(1)}%`
        ]);
      });
      
      slide3.addTable(tableData, {
        x: '55%',
        y: '20%',
        w: '40%',
        h: '60%',
        fontSize: 12,
        fontFace: 'Arial',
        border: { pt: 1, color: 'CFCFCF' },
        rowH: 0.5,
        color: '000000',
        valign: 'middle',
        align: 'left'
      });
    } else {
      slide3.addText('No savings breakdown data available.', {
        x: '10%',
        y: '40%',
        w: '80%',
        h: '10%',
        ...bodyStyle
      });
    }
    
    // ===== SLIDE 4: 3-Year Financial Projection =====
    const slide4 = pptx.addSlide();
    
    // Add title
    slide4.addText('3-Year Financial Projection', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: '10%',
      ...titleStyle
    });
    
    if (Object.keys(projections).length > 0) {
      // Prepare data for chart
      const years = Object.keys(projections).map((key, index) => `Year ${index + 1}`);
      const costs = Object.values(projections).map(data => data.costs);
      const savings = Object.values(projections).map(data => data.savings);
      const netBenefits = Object.values(projections).map(data => data.netBenefit);
      
      // Add bar chart
      slide4.addChart(pptx.ChartType.bar, [
        {
          name: 'Costs',
          labels: years,
          values: costs,
          color: 'F44336'
        },
        {
          name: 'Savings',
          labels: years,
          values: savings,
          color: '4CAF50'
        },
        {
          name: 'Net Benefit',
          labels: years,
          values: netBenefits,
          color: '2196F3'
        }
      ], {
        x: '5%',
        y: '20%',
        w: '90%',
        h: '40%',
        showLegend: true,
        legendPos: 'b',
        showTitle: false,
        dataLabelFormatCode: '$#,##0',
        showValue: false,
        barDir: 'bar',
        barGrouping: 'clustered',
        chartColors: ['F44336', '4CAF50', '2196F3']
      });
      
      // Add table with data
      const tableData = [
        ['Year', 'Costs', 'Savings', 'Net Benefit', 'Cumulative']
      ];
      
      let cumulativeBenefit = 0;
      Object.entries(projections).forEach(([year, data], index) => {
        cumulativeBenefit += data.netBenefit;
        tableData.push([
          `Year ${index + 1}`,
          formatCurrency(data.costs),
          formatCurrency(data.savings),
          formatCurrency(data.netBenefit),
          formatCurrency(cumulativeBenefit)
        ]);
      });
      
      slide4.addTable(tableData, {
        x: '10%',
        y: '65%',
        w: '80%',
        h: '25%',
        fontSize: 12,
        fontFace: 'Arial',
        border: { pt: 1, color: 'CFCFCF' },
        rowH: 0.5,
        color: '000000',
        valign: 'middle',
        align: 'left'
      });
      
      // Add note about Year 1 costs
      slide4.addText('Note: Year 1 includes both license and implementation costs.', {
        x: '10%',
        y: '92%',
        w: '80%',
        h: '5%',
        ...smallStyle,
        italic: true
      });
    } else {
      slide4.addText('No projection data available.', {
        x: '10%',
        y: '40%',
        w: '80%',
        h: '10%',
        ...bodyStyle
      });
    }
    
    // ===== SLIDE 5: Top Improvement Opportunities =====
    const slide5 = pptx.addSlide();
    
    // Add title
    slide5.addText('Top Improvement Opportunities', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: '10%',
      ...titleStyle
    });
    
    if (improvementAreas.length > 0) {
      // Prepare data for chart
      const categories = improvementAreas.map(area => area.category);
      const potentialSavings = improvementAreas.map(area => area.potentialSavings);
      
      // Add bar chart
      slide5.addChart(pptx.ChartType.bar, [
        {
          name: 'Potential Savings',
          labels: categories,
          values: potentialSavings
        }
      ], {
        x: '5%',
        y: '20%',
        w: '90%',
        h: '30%',
        showLegend: false,
        showTitle: false,
        dataLabelFormatCode: '$#,##0',
        showValue: true,
        barDir: 'bar',
        barGrouping: 'standard',
        chartColors: ['2E7D32']
      });
      
      // Add table with data
      const tableData = [
        ['Category', 'Current Score', 'Improvement', 'Potential Savings']
      ];
      
      improvementAreas.forEach(area => {
        tableData.push([
          area.category,
          `${(area.percentScore || 0).toFixed(1)}%`,
          `${(area.improvementPotential || 0).toFixed(1)}%`,
          formatCurrency(area.potentialSavings)
        ]);
      });
      
      slide5.addTable(tableData, {
        x: '10%',
        y: '55%',
        w: '80%',
        h: '35%',
        fontSize: 12,
        fontFace: 'Arial',
        border: { pt: 1, color: 'CFCFCF' },
        rowH: 0.5,
        color: '000000',
        valign: 'middle',
        align: 'left'
      });
    } else {
      slide5.addText('No improvement areas data available.', {
        x: '10%',
        y: '40%',
        w: '80%',
        h: '10%',
        ...bodyStyle
      });
    }
    
    // ===== SLIDE 6: Calculation Methodology =====
    const slide6 = pptx.addSlide();
    
    // Add title
    slide6.addText('Calculation Methodology', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: '10%',
      ...titleStyle
    });
    
    // Add methodology explanation
    slide6.addText([
      { 
        text: 'Our ROI model calculates savings based on your improvement potential. Lower assessment scores indicate higher potential for improvement, which translates to greater savings when implementing a WMS.', 
        options: { ...bodyStyle } 
      }
    ], {
      x: '5%',
      y: '20%',
      w: '90%',
      h: '10%'
    });
    
    // Add methodology details
    const methodologies = [
      {
        title: 'Inventory',
        description: 'Based on inventory carrying costs (25% of inventory value) and your Inventory Management improvement potential (30% realization factor).'
      },
      {
        title: 'Productivity',
        description: 'Calculated directly from labor costs and your Technology & Automation improvement potential, with adjustments for company size and transaction complexity. Base rate is 15% of labor costs, scaled by company-specific factors, with a minimum of 2% of total labor costs.'
      },
      {
        title: 'Quality',
        description: 'Based on 1% of annual revenue and your Performance Measurement improvement potential (25% realization factor), capped at 0.5% of annual revenue.'
      },
      {
        title: 'Compliance',
        description: 'Based on 0.5% of annual revenue and your Sustainability & Compliance improvement potential (20% realization factor), capped at 0.2% of annual revenue.'
      },
      {
        title: 'Labor, Waste, Space & Transportation',
        description: 'Each calculated using their respective improvement potentials and industry-standard realization factors.'
      }
    ];
    
    // Create a table for methodologies
    const methodologyTable = [
      ['Category', 'Calculation Approach']
    ];
    
    methodologies.forEach(item => {
      methodologyTable.push([item.title, item.description]);
    });
    
    slide6.addTable(methodologyTable, {
      x: '5%',
      y: '35%',
      w: '90%',
      h: '50%',
      fontSize: 12,
      fontFace: 'Arial',
      border: { pt: 1, color: 'CFCFCF' },
      rowH: 0.8,
      color: '000000',
      valign: 'middle',
      align: 'left'
    });
    
    // Add ROI formula
    slide6.addText('ROI = (3-Year Savings - Total Cost) / Total Cost × 100%', {
      x: 0.05,
      y: 0.88,
      w: 0.90,
      h: 0.05,
      h: '5%',
      ...bodyStyle,
      bold: true,
      align: 'center'
    });
    
    return pptx;
  } catch (error) {
    console.error('Error generating PowerPoint report:', error);
    
    // Create a simple error presentation
    const errorPptx = new pptxgen();
    const errorSlide = errorPptx.addSlide();
    
    errorSlide.addText('Error Generating Report', {
      x: '10%',
      y: '30%',
      w: '80%',
      h: '10%',
      fontSize: 36,
      color: 'FF0000',
      fontFace: 'Arial',
      bold: true,
      align: 'center'
    });
    
    errorSlide.addText([
      { text: 'There was an error generating your report.\n', options: { fontSize: 18, color: '000000', fontFace: 'Arial' } },
      { text: 'Please try again or contact support.\n\n', options: { fontSize: 18, color: '000000', fontFace: 'Arial' } },
      { text: `Error: ${error.message || 'Unknown error'}`, options: { fontSize: 14, color: '000000', fontFace: 'Arial', italic: true } }
    ], {
      x: '10%',
      y: '45%',
      w: '80%',
      h: '30%',
      align: 'center'
    });
    
    return errorPptx;
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
