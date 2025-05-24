const express = require('express');
const router = express.Router();
const companyDataService = require('../services/companyDataService');

// Predefined questions (will be used directly instead of from a database)
const predefinedQuestions = [
  {
    id: 'q1',
    category: 'Supply Chain Visibility',
    text: 'How would you rate your current supply chain visibility?',
    options: [
      { value: '1', label: 'Poor - Limited visibility across the supply chain' },
      { value: '2', label: 'Fair - Some visibility but significant gaps exist' },
      { value: '3', label: 'Good - Visibility across most of the supply chain' },
      { value: '4', label: 'Excellent - Complete end-to-end visibility' }
    ]
  },
  {
    id: 'q2',
    category: 'Procurement & Sourcing',
    text: 'What level of automation exists in your procurement processes?',
    options: [
      { value: '1', label: 'Minimal - Mostly manual processes' },
      { value: '2', label: 'Basic - Some automation of routine tasks' },
      { value: '3', label: 'Advanced - Significant automation with some manual oversight' },
      { value: '4', label: 'Comprehensive - Fully automated with minimal manual intervention' }
    ]
  },
  {
    id: 'q3',
    category: 'Inventory Management',
    text: 'How effectively do you manage inventory levels?',
    options: [
      { value: '1', label: 'Ineffective - Frequent stockouts or excess inventory' },
      { value: '2', label: 'Somewhat effective - Occasional issues with inventory levels' },
      { value: '3', label: 'Effective - Rare inventory issues' },
      { value: '4', label: 'Highly effective - Optimal inventory levels consistently maintained' }
    ]
  },
  {
    id: 'q4',
    category: 'Supplier Management',
    text: 'How would you describe your supplier relationship management?',
    options: [
      { value: '1', label: 'Transactional - Limited communication with suppliers' },
      { value: '2', label: 'Developing - Regular communication but limited collaboration' },
      { value: '3', label: 'Collaborative - Active partnership with key suppliers' },
      { value: '4', label: 'Strategic - Deep integration and shared objectives with suppliers' }
    ]
  },
  {
    id: 'q5',
    category: 'Risk Management',
    text: 'How resilient is your supply chain to disruptions?',
    options: [
      { value: '1', label: 'Vulnerable - Major disruptions cause significant issues' },
      { value: '2', label: 'Somewhat resilient - Can handle minor disruptions' },
      { value: '3', label: 'Resilient - Well-prepared for most disruptions' },
      { value: '4', label: 'Highly resilient - Robust contingency plans for all scenarios' }
    ]
  }
];

// No need to seed questions to a database, we'll use the predefined questions directly

// GET questionnaire for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Validate companyId
    if (!companyId || companyId.trim() === '') {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    
    // Get existing answers for this company
    let companyData;
    try {
      companyData = await companyDataService.getCompanyData(companyId);
    } catch (err) {
      // If there's an error or no data exists, create empty data
      companyData = { answers: {} };
    }
    
    // Return questions and answers
    res.json({
      questions: predefinedQuestions,
      answers: companyData.answers || {}
    });
  } catch (err) {
    console.error('Error fetching questionnaire:', err);
    res.status(500).json({ error: 'Failed to fetch questionnaire' });
  }
});

// SAVE questionnaire answers for a company
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { answers } = req.body;
    
    // Validate companyId
    if (!companyId || companyId.trim() === '') {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    
    // Validate answers
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers format' });
    }
    
    // Get existing company data or create new
    let companyData;
    try {
      companyData = await companyDataService.getCompanyData(companyId);
    } catch (err) {
      companyData = {};
    }
    
    // Update answers
    companyData.answers = answers;
    companyData.updatedAt = new Date().toISOString();
    
    // Save to file
    const success = await companyDataService.saveCompanyData(companyId, companyData);
    
    if (success) {
      res.json({ success: true, message: 'Answers saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save answers' });
    }
  } catch (err) {
    console.error('Error saving questionnaire answers:', err);
    res.status(500).json({ error: 'Failed to save answers' });
  }
});

module.exports = router;
