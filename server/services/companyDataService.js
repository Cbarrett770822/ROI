const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');
const DEFAULT_COMPANIES = [
  { id: '1', name: 'Acme Corporation' }
];

// Ensure data directory exists
async function initDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check if companies file exists, create with defaults if not
    try {
      await fs.access(COMPANIES_FILE);
    } catch (err) {
      await fs.writeFile(COMPANIES_FILE, JSON.stringify(DEFAULT_COMPANIES, null, 2));
      console.log('Created default companies file');
    }
  } catch (err) {
    console.error('Error initializing data directory:', err);
  }
}

// Get all companies
async function getCompanies() {
  try {
    const data = await fs.readFile(COMPANIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading companies file:', err);
    return DEFAULT_COMPANIES;
  }
}

// Create a new company
async function createCompany(companyData) {
  try {
    const companies = await getCompanies();
    const newCompany = {
      ...companyData,
      createdAt: new Date().toISOString()
    };
    
    companies.push(newCompany);
    await fs.writeFile(COMPANIES_FILE, JSON.stringify(companies, null, 2));
    
    return newCompany;
  } catch (err) {
    console.error('Error creating company:', err);
    throw err;
  }
}

// Update a company
async function updateCompany(companyId, companyData) {
  try {
    const companies = await getCompanies();
    const index = companies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error(`Company with ID ${companyId} not found`);
    }
    
    companies[index] = {
      ...companies[index],
      ...companyData,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(COMPANIES_FILE, JSON.stringify(companies, null, 2));
    return companies[index];
  } catch (err) {
    console.error(`Error updating company ${companyId}:`, err);
    throw err;
  }
}

// Delete a company
async function deleteCompany(companyId) {
  try {
    const companies = await getCompanies();
    const filteredCompanies = companies.filter(c => c.id !== companyId);
    
    if (companies.length === filteredCompanies.length) {
      throw new Error(`Company with ID ${companyId} not found`);
    }
    
    await fs.writeFile(COMPANIES_FILE, JSON.stringify(filteredCompanies, null, 2));
    
    // Also delete company data file if it exists
    try {
      const companyFile = path.join(DATA_DIR, `company_${companyId}.json`);
      await fs.unlink(companyFile);
    } catch (err) {
      // Ignore if file doesn't exist
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Error deleting company ${companyId}:`, err);
    throw err;
  }
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
