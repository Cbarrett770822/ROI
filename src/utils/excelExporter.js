import * as XLSX from 'xlsx';
import axios from 'axios';

/**
 * Export questionnaire data to Excel format with each category in a separate tab
 * @param {Array} questions - The questionnaire questions
 * @param {Object} answers - The questionnaire answers
 * @param {String} companyName - The name of the company
 * @returns {Blob} - Excel file as a Blob
 */
export const exportQuestionnaireToExcel = async (questions, answers = {}, companyName = 'Company') => {
  // For debugging
  window.XLSX = XLSX;
  
  // Create a helper sheet with all dropdown options
  const createDropdownOptionsSheet = (workbook) => {
    // Collect all unique options from all questions
    const allOptions = new Set();
    questions.forEach(question => {
      if (question.options && Array.isArray(question.options)) {
        question.options.forEach(option => {
          if (typeof option === 'string') {
            allOptions.add(option);
          } else if (typeof option === 'object' && option.label) {
            allOptions.add(option.label);
          }
        });
      }
    });
    
    // Convert to array and sort
    const optionsArray = Array.from(allOptions).sort();
    
    // Create worksheet data with one option per row
    const optionsData = optionsArray.map(option => [option]);
    
    // Create the options worksheet
    const optionsWorksheet = XLSX.utils.aoa_to_sheet(optionsData);
    
    // Add to workbook
    XLSX.utils.book_append_sheet(workbook, optionsWorksheet, 'DropdownOptions');
    
    return optionsArray;
  };
  try {
    // Basic validation
    if (!questions) {
      throw new Error('No questions provided');
    }
    
    console.log('Excel export started with questions:', questions);
    
    // If questions is not provided or empty, fetch from API
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('No questions provided, fetching from API...');
      try {
        const response = await axios.get('http://localhost:3001/api/questionnaire');
        questions = response.data;
        console.log('Fetched questions from API:', questions);
      } catch (apiError) {
        console.error('Failed to fetch questions from API:', apiError);
        // Use mock questions if API fails
        questions = getMockQuestions();
        console.log('Using mock questions instead:', questions);
      }
    }
    
    // Group questions by category
    const categorizedQuestions = {};
    
    questions.forEach(question => {
      if (!question.category) {
        console.warn('Question missing category:', question);
        return; // Skip questions without category
      }
      
      if (!categorizedQuestions[question.category]) {
        categorizedQuestions[question.category] = [];
      }
      categorizedQuestions[question.category].push(question);
    });
    
    console.log('Categorized questions:', categorizedQuestions);
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create a worksheet for each category
    const categories = Object.keys(categorizedQuestions);
    console.log('Categories found:', categories);
    
    Object.entries(categorizedQuestions).forEach(([category, categoryQuestions]) => {
      // Create data for the worksheet with a more user-friendly format
      const worksheetData = [
        // Header row
        ['Question ID', 'Question', 'Your Answer (Enter Below)', 'Type', 'Available Options']
      ];
      
      // Add questions and answers
      categoryQuestions.forEach(question => {
        const answer = answers[question.id] || '';
        const formattedAnswer = formatAnswer(answer, question);
        
        // Format the options field
        let optionsText = '';
        if (question.options && Array.isArray(question.options)) {
          let options;
          if (typeof question.options[0] === 'string') {
            options = question.options;
          } else if (typeof question.options[0] === 'object' && question.options[0].label) {
            options = question.options.map(opt => opt.label);
          } else {
            options = question.options.map(opt => String(opt));
          }
          
          // Format options as numbered list with each option on a new line
          optionsText = options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');
          
          // Add extra line breaks to make it more readable
          optionsText = '\n' + optionsText + '\n';
        } else if (question.type === 'number') {
          optionsText = question.unit || 'Numeric value';
          if (question.prefix) optionsText = question.prefix + ' ' + optionsText;
          if (question.suffix) optionsText = optionsText + ' ' + question.suffix;
        }
        
        worksheetData.push([
          question.id,
          question.text,
          formattedAnswer,
          question.type || 'text',
          optionsText
        ]);
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Add cell formatting for better readability
      // This is a workaround since XLSX doesn't directly support cell formatting
      // We'll add special formatting hints that Excel might recognize
      
      // Format header row
      for (let i = 0; i < 5; i++) {
        const cellRef = XLSX.utils.encode_cell({r: 0, c: i});
        if (!worksheet[cellRef]) worksheet[cellRef] = {};
        worksheet[cellRef].s = { font: { bold: true }, alignment: { vertical: 'center', horizontal: 'center' } };
      }
      
      // Format options column for vertical text alignment
      for (let i = 1; i < worksheetData.length; i++) {
        const cellRef = XLSX.utils.encode_cell({r: i, c: 4}); // Options column
        if (!worksheet[cellRef]) worksheet[cellRef] = {};
        worksheet[cellRef].s = { alignment: { vertical: 'top', wrapText: true } };
      }
      
      // Set column widths
      const columnWidths = [
        { wch: 15 },  // Question ID
        { wch: 60 },  // Question
        { wch: 25 },  // Answer
        { wch: 10 },  // Type
        { wch: 60 }   // Available Options
      ];
      
      worksheet['!cols'] = columnWidths;
      
      // Set row heights to accommodate multi-line option text
      const rowHeights = {};
      for (let i = 1; i < worksheetData.length; i++) {
        const optionsText = worksheetData[i][4] || '';
        const lineCount = (optionsText.match(/\n/g) || []).length + 1;
        if (lineCount > 1) {
          // Make rows with options taller to better display the vertical list
          rowHeights[i] = 20 * lineCount; // 20 points per line for better spacing
        }
      }
      
      if (Object.keys(rowHeights).length > 0) {
        worksheet['!rows'] = [];
        const maxRow = Math.max(...Object.keys(rowHeights).map(Number));
        for (let i = 0; i <= maxRow; i++) {
          worksheet['!rows'][i] = { hpt: rowHeights[i] || 15 };
        }
      }
      
      // We've already added the options as a numbered list in the Available Options column
      // No need for additional processing here
      
      // Add the worksheet to the workbook
      // Ensure sheet name is valid (max 31 chars, no special chars)
      const safeSheetName = getSafeSheetName(category);
      console.log(`Adding worksheet for category: ${category} with safe name: ${safeSheetName}`);
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    });
    
    // Create a summary sheet
    const summaryData = [
      ['Supply Chain Assessment Questionnaire'],
      [`Company: ${companyName}`],
      [`Date: ${new Date().toLocaleDateString()}`],
      [],
      ['Category', 'Number of Questions', 'Questions Answered', 'Completion %']
    ];
    
    Object.entries(categorizedQuestions).forEach(([category, categoryQuestions]) => {
      const totalQuestions = categoryQuestions.length;
      const answeredQuestions = categoryQuestions.filter(q => answers[q.id]).length;
      const completionPercentage = totalQuestions > 0 
        ? Math.round((answeredQuestions / totalQuestions) * 100) 
        : 0;
      
      summaryData.push([
        category,
        totalQuestions,
        answeredQuestions,
        `${completionPercentage}%`
      ]);
    });
    
    // Add total row
    const totalQuestions = questions.length;
    const totalAnswered = Object.keys(answers).length;
    const totalCompletion = totalQuestions > 0 
      ? Math.round((totalAnswered / totalQuestions) * 100) 
      : 0;
    
    summaryData.push([
      'TOTAL',
      totalQuestions,
      totalAnswered,
      `${totalCompletion}%`
    ]);
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary
    const summaryColumnWidths = [
      { wch: 40 },  // Category
      { wch: 20 },  // Number of Questions
      { wch: 20 },  // Questions Answered
      { wch: 15 }   // Completion %
    ];
    
    summarySheet['!cols'] = summaryColumnWidths;
    
    // Add the summary sheet to the beginning of the workbook
    console.log('Adding summary sheet');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Generate Excel file
    console.log('Generating Excel file...', workbook);
    
    // For debugging - save workbook to window
    window.workbook = workbook;
    
    try {
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      console.log('Excel buffer created:', excelBuffer);
      
      // Convert to Blob
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      console.log('Excel file generated successfully as blob:', blob);
      return blob;
    } catch (writeError) {
      console.error('Error writing Excel file:', writeError);
      throw new Error(`Error writing Excel file: ${writeError.message}`);
    }
  } catch (error) {
    console.error('Error exporting questionnaire to Excel:', error);
    // Create a simple Excel file as fallback
    try {
      console.log('Attempting to create a simple fallback Excel file');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([['Error creating full Excel report'], [`Error: ${error.message}`]]);
      XLSX.utils.book_append_sheet(wb, ws, 'Error');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } catch (fallbackError) {
      console.error('Even fallback Excel creation failed:', fallbackError);
      throw new Error(`Excel export failed: ${error.message}. Fallback also failed: ${fallbackError.message}`);
    }
  }
};

/**
 * Format answer based on question type
 * @param {any} answer - The answer value
 * @param {Object} question - The question object
 * @returns {String} - Formatted answer
 */
const formatAnswer = (answer, question) => {
  if (answer === undefined || answer === null || answer === '') {
    return '';
  }
  
  // Format based on question type
  switch (question.type) {
    case 'number':
      const numValue = parseFloat(answer);
      if (isNaN(numValue)) return answer;
      
      let formatted = numValue.toString();
      
      // Add prefix/suffix if available
      if (question.prefix && question.suffix) {
        formatted = `${question.prefix}${formatted}${question.suffix}`;
      } else if (question.prefix) {
        formatted = `${question.prefix}${formatted}`;
      } else if (question.suffix) {
        formatted = `${formatted}${question.suffix}`;
      }
      
      return formatted;
      
    default:
      return answer.toString();
  }
};

/**
 * Get a safe sheet name (Excel has a 31 character limit and restrictions on special characters)
 * @param {String} name - Original sheet name
 * @returns {String} - Safe sheet name
 */
const getSafeSheetName = (name) => {
  // Replace invalid characters
  let safeName = name.replace(/[\\/*[\]?:]/g, '_');
  
  // Truncate to 31 characters
  if (safeName.length > 31) {
    safeName = safeName.substring(0, 31);
  }
  
  return safeName;
}

/**
 * Get mock questions for testing when API fails
 * @returns {Array} - Array of mock questions
 */
const getMockQuestions = () => {
  return [
    {
      id: 'metrics_1',
      category: 'Financial & Operational Metrics',
      text: 'What is your company\'s annual revenue? (in millions)',
      type: 'number',
      prefix: '$',
      suffix: ' million'
    },
    {
      id: 'metrics_2',
      category: 'Financial & Operational Metrics',
      text: 'What is your company\'s operating margin percentage?',
      type: 'number',
      prefix: '',
      suffix: '%'
    },
    {
      id: 'warehouse_1',
      category: 'Warehouse Operations',
      text: 'How many warehouses does your company operate?',
      type: 'number'
    },
    {
      id: 'warehouse_2',
      category: 'Warehouse Operations',
      text: 'What is the total size of your warehouses?',
      type: 'number',
      suffix: 'sq ft'
    },
    {
      id: 'technology_1',
      category: 'Technology & Systems',
      text: 'Do you use a Warehouse Management System (WMS)?',
      type: 'select',
      options: ['Yes', 'No', 'Partially']
    },
    {
      id: 'technology_2',
      category: 'Technology & Systems',
      text: 'What level of automation do you have in your warehouses?',
      type: 'select',
      options: ['None', 'Basic', 'Moderate', 'Advanced', 'Fully Automated']
    }
  ];
}
