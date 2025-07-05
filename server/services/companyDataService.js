const Company = require('../models/Company');
const connectDB = require('../db');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Initialize DB connection (no-op for Mongo, but keep for compatibility)
async function initDataDirectory() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
    throw err;
  }
}

// Get all companies
async function getCompanies() {
  await connectDB();
  return Company.find({}).lean();
}

// Create a new company
async function createCompany(companyData) {
  await connectDB();
  const company = new Company({
    name: companyData.name,
    createdAt: new Date()
  });
  return company.save();
}

// Update a company
async function updateCompany(companyId, companyData) {
  await connectDB();
  const updated = await Company.findByIdAndUpdate(
    companyId,
    { ...companyData, updatedAt: new Date() },
    { new: true }
  ).lean();
  if (!updated) throw new Error(`Company with ID ${companyId} not found`);
  return updated;
}

// Delete a company
async function deleteCompany(companyId) {
  await connectDB();
  const deleted = await Company.findByIdAndDelete(companyId);
  if (!deleted) throw new Error(`Company with ID ${companyId} not found`);
  return { success: true };
}

// Save company data (questionnaire answers, etc.)
async function saveCompanyData(companyId, data) {
  const companyFile = path.join(DATA_DIR, `company_${companyId}.json`);
  try {
    await fs.writeFile(companyFile, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error saving data for company ${companyId}:`, err);
    return false;
  }
}

// Get company data
async function getCompanyData(companyId) {
  const companyFile = path.join(DATA_DIR, `company_${companyId}.json`);
  try {
    const data = await fs.readFile(companyFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist yet, which is fine for new companies
      return { answers: {} };
    }
    console.error(`Error reading data for company ${companyId}:`, err);
    throw err;
  }
}

module.exports = {
  initDataDirectory,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  saveCompanyData,
  getCompanyData
};
