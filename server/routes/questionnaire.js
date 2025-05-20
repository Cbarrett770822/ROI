const express = require('express');
const router = express.Router();
const Questionnaire = require('../models/Questionnaire');
const Question = require('../models/Question');
const mongoose = require('mongoose');

// Predefined questions (will be seeded to the database)
const predefinedQuestions = [
  {
    id: 'q1',
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
    text: 'How resilient is your supply chain to disruptions?',
    options: [
      { value: '1', label: 'Vulnerable - Major disruptions cause significant issues' },
      { value: '2', label: 'Somewhat resilient - Can handle minor disruptions' },
      { value: '3', label: 'Resilient - Well-prepared for most disruptions' },
      { value: '4', label: 'Highly resilient - Robust contingency plans for all scenarios' }
    ]
  }
];

// Seed questions to the database if they don't exist
const seedQuestions = async () => {
  try {
    const existingQuestions = await Question.find();
    
    if (existingQuestions.length === 0) {
      await Question.insertMany(predefinedQuestions);
      console.log('Questions seeded to database');
    }
  } catch (err) {
    console.error('Error seeding questions:', err);
  }
};

// Call the seed function when the module is loaded
seedQuestions();

// GET questionnaire for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Validate companyId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    
    // Get all questions
    const questions = await Question.find().sort({ id: 1 });
    
    // Get existing answers for this company
    let questionnaire = await Questionnaire.findOne({ companyId });
    
    // If no questionnaire exists for this company, create an empty one
    if (!questionnaire) {
      questionnaire = {
        companyId,
        answers: {}
      };
    }
    
    // Return questions and answers
    res.json({
      questions,
      answers: questionnaire.answers || {}
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
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    
    // Validate answers
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers format' });
    }
    
    // Find existing questionnaire or create a new one
    let questionnaire = await Questionnaire.findOne({ companyId });
    
    if (questionnaire) {
      // Update existing questionnaire
      questionnaire.answers = answers;
      questionnaire.updatedAt = Date.now();
      await questionnaire.save();
    } else {
      // Create new questionnaire
      questionnaire = new Questionnaire({
        companyId,
        answers
      });
      await questionnaire.save();
    }
    
    res.json({ success: true, message: 'Answers saved successfully' });
  } catch (err) {
    console.error('Error saving questionnaire answers:', err);
    res.status(500).json({ error: 'Failed to save answers' });
  }
});

module.exports = router;
