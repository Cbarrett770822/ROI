const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET a single company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// CREATE a new company
router.post('/', async (req, res) => {
  try {
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const newCompany = new Company({
      name: req.body.name.trim()
    });
    
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// UPDATE a company
router.put('/:id', async (req, res) => {
  try {
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name.trim() },
      { new: true }
    );
    
    if (!updatedCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(updatedCompany);
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// DELETE a company
router.delete('/:id', async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    
    if (!deletedCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;
