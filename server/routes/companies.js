const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const companyDataService = require('../services/companyDataService');

// GET all companies
router.get('/', async (req, res) => {
  try {
    const companies = await companyDataService.getCompanies();
    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET a single company by ID
router.get('/:id', async (req, res) => {
  try {
    const companies = await companyDataService.getCompanies();
    const company = companies.find(c => c.id === req.params.id);
    
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
    
    const newCompany = {
      id: uuidv4(),
      name: req.body.name.trim(),
      createdAt: new Date().toISOString()
    };
    
    const savedCompany = await companyDataService.createCompany(newCompany);
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
    
    const updatedCompany = await companyDataService.updateCompany(
      req.params.id,
      { name: req.body.name.trim() }
    );
    
    res.json(updatedCompany);
  } catch (err) {
    console.error('Error updating company:', err);
    
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// DELETE a company
router.delete('/:id', async (req, res) => {
  try {
    await companyDataService.deleteCompany(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Error deleting company:', err);
    
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// GET company data (questionnaire answers, etc.)
router.get('/:id/data', async (req, res) => {
  try {
    const data = await companyDataService.getCompanyData(req.params.id);
    res.json(data);
  } catch (err) {
    console.error(`Error fetching data for company ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch company data' });
  }
});

// SAVE company data
router.post('/:id/data', async (req, res) => {
  try {
    const success = await companyDataService.saveCompanyData(req.params.id, req.body);
    
    if (success) {
      res.json({ success: true, message: 'Company data saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save company data' });
    }
  } catch (err) {
    console.error(`Error saving data for company ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to save company data' });
  }
});

module.exports = router;
