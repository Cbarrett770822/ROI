// Mock data and API functions to simulate backend interactions
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockCompanies = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'Globex Industries' },
  { id: '3', name: 'Stark Enterprises' }
];

const mockQuestions = [
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

// Mock company answers (initially empty)
const mockAnswers = {
  '1': {},
  '2': {},
  '3': {}
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const api = {
  // Companies
  getCompanies: async () => {
    await delay(800);
    return [...mockCompanies];
  },
  
  createCompany: async (name) => {
    await delay(1000);
    const newCompany = {
      id: uuidv4(),
      name
    };
    mockCompanies.push(newCompany);
    mockAnswers[newCompany.id] = {};
    return newCompany;
  },
  
  // Questionnaire
  getQuestionnaire: async (companyId) => {
    await delay(800);
    return {
      questions: mockQuestions,
      answers: mockAnswers[companyId] || {}
    };
  },
  
  saveQuestionnaireAnswers: async (companyId, answers) => {
    await delay(1000);
    mockAnswers[companyId] = { ...answers };
    return { success: true };
  }
};

// Let's use a simpler approach with direct data instead of complex interceptors
export const setupAxiosMock = (axios) => {
  // Override axios methods with mock implementations
  const originalGet = axios.get;
  const originalPost = axios.post;

  // Mock GET requests
  axios.get = async (url) => {
    // GET /api/companies
    if (url === '/api/companies') {
      await delay(500); // Simulate network delay
      return { data: mockCompanies, status: 200 };
    }
    
    // GET /api/questionnaire/:companyId
    if (url.match(/\/api\/questionnaire\/\w+/)) {
      const companyId = url.split('/').pop();
      await delay(500);
      return {
        data: {
          questions: mockQuestions,
          answers: mockAnswers[companyId] || {}
        },
        status: 200
      };
    }
    
    // For any unhandled URLs, call the original method
    return originalGet(url);
  };

  // Mock POST requests
  axios.post = async (url, data) => {
    // POST /api/companies
    if (url === '/api/companies') {
      await delay(500);
      const newCompany = {
        id: uuidv4(),
        name: data.name
      };
      mockCompanies.push(newCompany);
      mockAnswers[newCompany.id] = {};
      return { data: newCompany, status: 201 };
    }
    
    // POST /api/questionnaire/:companyId
    if (url.match(/\/api\/questionnaire\/\w+/)) {
      const companyId = url.split('/').pop();
      await delay(500);
      mockAnswers[companyId] = { ...data.answers };
      return { data: { success: true }, status: 200 };
    }
    
    // For any unhandled URLs, call the original method
    return originalPost(url, data);
  };
};
