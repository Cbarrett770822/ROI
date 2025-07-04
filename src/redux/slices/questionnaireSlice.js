import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api as apiClient } from '../../api/apiClient';

// API URL for questionnaire endpoints
const API_URL = ''; // Empty string because apiClient already includes the base URL

// Mock questions data for development - organized by categories
const mockQuestions = [
  // Financial & Operational Metrics
  {
    id: 'metrics_1',
    category: 'Financial & Operational Metrics',
    text: 'What is your company\'s annual revenue? (in millions)',
    type: 'number',
    prefix: '$',
    suffix: ' million',
    placeholder: 'Enter revenue in millions',
    defaultValue: 0,
    unit: 'millions', // Add unit information
    helpText: 'Enter the value in millions (e.g., for $10 million, enter 10)'
  },
  {
    id: 'metrics_2',
    category: 'Financial & Operational Metrics',
    text: 'What is your company\'s operating margin percentage?',
    type: 'number',
    prefix: '',
    suffix: '%',
    placeholder: 'Enter operating margin',
    defaultValue: 0
  },
  {
    id: 'metrics_3',
    category: 'Financial & Operational Metrics',
    text: 'What is the total number of full-time employees (FTEs) in your warehouse operations?',
    type: 'number',
    prefix: '',
    suffix: 'FTEs',
    placeholder: 'Enter number of FTEs',
    defaultValue: 0
  },
  {
    id: 'metrics_4',
    category: 'Financial & Operational Metrics',
    text: 'What is the average annual cost per FTE (including benefits)? (in thousands)',
    type: 'number',
    prefix: '$',
    suffix: 'K',
    placeholder: 'Enter cost in thousands',
    defaultValue: 0,
    unit: 'thousands', // Add unit information
    helpText: 'Enter the value in thousands (e.g., for $50,000, enter 50)'
  },
  {
    id: 'metrics_5',
    category: 'Financial & Operational Metrics',
    text: 'What is the annual value of waste/damaged/obsolete inventory? (in millions)',
    type: 'number',
    prefix: '$',
    suffix: ' million',
    placeholder: 'Enter value in millions',
    defaultValue: 0,
    unit: 'millions', // Add unit information
    helpText: 'Enter the value in millions (e.g., for $2 million, enter 2)'
  },
  {
    id: 'metrics_6',
    category: 'Financial & Operational Metrics',
    text: 'What is your annual transportation cost? (in millions)',
    type: 'number',
    prefix: '$',
    suffix: ' million',
    placeholder: 'Enter cost in millions',
    defaultValue: 0,
    unit: 'millions', // Add unit information
    helpText: 'Enter the value in millions (e.g., for $5 million, enter 5)'
  },
  {
    id: 'metrics_7',
    category: 'Financial & Operational Metrics',
    text: 'How many warehouses does your company operate?',
    type: 'number',
    prefix: '',
    suffix: '',
    placeholder: 'Enter number of warehouses',
    defaultValue: 0
  },
  {
    id: 'metrics_8',
    category: 'Financial & Operational Metrics',
    text: 'What is the total size of your warehouses?',
    type: 'number',
    prefix: '',
    suffix: 'sq ft',
    placeholder: 'Enter total warehouse space',
    defaultValue: 0
  },
  {
    id: 'metrics_9',
    category: 'Financial & Operational Metrics',
    text: 'What is your annual inbound transaction volume (number of receipts)?',
    type: 'number',
    prefix: '',
    suffix: '',
    placeholder: 'Enter inbound volume',
    defaultValue: 0
  },
  {
    id: 'metrics_10',
    category: 'Financial & Operational Metrics',
    text: 'What is your annual outbound transaction volume (number of shipments)?',
    type: 'number',
    prefix: '',
    suffix: '',
    placeholder: 'Enter outbound volume',
    defaultValue: 0
  },
  
  // Warehouse Infrastructure & Layout
  {
    id: 'warehouse_1',
    category: 'Warehouse Infrastructure',
    text: 'How would you rate the overall layout efficiency of your warehouse?',
    options: [
      { value: '1', label: 'Poor - Inefficient layout with significant travel distances' },
      { value: '2', label: 'Fair - Some layout optimization but room for improvement' },
      { value: '3', label: 'Good - Well-designed layout with minimal travel distances' },
      { value: '4', label: 'Excellent - Optimized layout with strategic product placement' }
    ]
  },
  {
    id: 'warehouse_2',
    category: 'Warehouse Infrastructure',
    text: 'What storage systems are currently in use at your facility?',
    options: [
      { value: '1', label: 'Basic - Primarily floor storage and simple shelving' },
      { value: '2', label: 'Standard - Mix of shelving and some racking systems' },
      { value: '3', label: 'Advanced - Various racking systems optimized for different products' },
      { value: '4', label: 'Sophisticated - Automated storage and retrieval systems (AS/RS)' }
    ]
  },
  {
    id: 'warehouse_3',
    category: 'Warehouse Infrastructure',
    text: 'How would you rate your warehouse space utilization?',
    options: [
      { value: '1', label: 'Poor - Significant wasted space or overcrowding' },
      { value: '2', label: 'Fair - Some optimization but inconsistent utilization' },
      { value: '3', label: 'Good - Efficient use of most available space' },
      { value: '4', label: 'Excellent - Maximized cubic utilization with flexibility for growth' }
    ]
  },
  {
    id: 'warehouse_4',
    category: 'Warehouse Infrastructure',
    text: 'What level of dock and staging area efficiency exists in your facility?',
    options: [
      { value: '1', label: 'Low - Frequent bottlenecks and congestion' },
      { value: '2', label: 'Moderate - Occasional congestion during peak periods' },
      { value: '3', label: 'High - Well-organized with minimal congestion' },
      { value: '4', label: 'Very High - Optimized flow with scheduled appointments and load planning' }
    ]
  },
  
  // Inventory Management
  {
    id: 'inventory_1',
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
    id: 'inventory_2',
    category: 'Inventory Management',
    text: 'What is your current inventory accuracy level?',
    options: [
      { value: '1', label: 'Below 90% - Frequent discrepancies' },
      { value: '2', label: '90-95% - Regular cycle counts needed' },
      { value: '3', label: '95-98% - Good accuracy with occasional adjustments' },
      { value: '4', label: '98%+ - Excellent accuracy with minimal adjustments' }
    ]
  },
  {
    id: 'inventory_3',
    category: 'Inventory Management',
    text: 'How do you manage inventory replenishment?',
    options: [
      { value: '1', label: 'Reactive - Ordering when stockouts occur or are imminent' },
      { value: '2', label: 'Basic - Simple min/max or reorder point systems' },
      { value: '3', label: 'Advanced - Forecasting-based with safety stock calculations' },
      { value: '4', label: 'Sophisticated - Automated with demand sensing and dynamic adjustments' }
    ]
  },
  {
    id: 'inventory_4',
    category: 'Inventory Management',
    text: 'What inventory classification method do you use?',
    options: [
      { value: '1', label: 'None - No formal classification system' },
      { value: '2', label: 'Basic - Simple ABC analysis' },
      { value: '3', label: 'Advanced - Multi-criteria classification (value, velocity, criticality)' },
      { value: '4', label: 'Sophisticated - Dynamic classification with automated adjustments' }
    ]
  },
  {
    id: 'inventory_5',
    category: 'Inventory Management',
    text: 'How do you handle slow-moving or obsolete inventory?',
    options: [
      { value: '1', label: 'Reactive - Address only when space is needed' },
      { value: '2', label: 'Basic - Periodic review and manual identification' },
      { value: '3', label: 'Proactive - Regular analysis and planned disposition' },
      { value: '4', label: 'Strategic - Automated identification with optimized disposition channels' }
    ]
  },
  
  // Warehouse Operations
  {
    id: 'operations_1',
    category: 'Warehouse Operations',
    text: 'How would you rate your receiving process efficiency?',
    options: [
      { value: '1', label: 'Low - Manual processes with frequent delays' },
      { value: '2', label: 'Moderate - Semi-automated with occasional bottlenecks' },
      { value: '3', label: 'High - Streamlined processes with minimal delays' },
      { value: '4', label: 'Very High - Fully optimized with advanced scheduling and cross-docking' }
    ]
  },
  {
    id: 'operations_2',
    category: 'Warehouse Operations',
    text: 'What is your current order picking methodology?',
    options: [
      { value: '1', label: 'Basic - Single order picking' },
      { value: '2', label: 'Standard - Batch picking for some orders' },
      { value: '3', label: 'Advanced - Zone picking with consolidation' },
      { value: '4', label: 'Sophisticated - Wave/cluster picking with automation support' }
    ]
  },
  {
    id: 'operations_3',
    category: 'Warehouse Operations',
    text: 'How do you manage your packing and shipping processes?',
    options: [
      { value: '1', label: 'Manual - Paper-based with minimal technology' },
      { value: '2', label: 'Basic - Some automation but primarily manual' },
      { value: '3', label: 'Advanced - Automated systems with integrated shipping' },
      { value: '4', label: 'Sophisticated - Fully automated with cartonization and load optimization' }
    ]
  },
  {
    id: 'operations_4',
    category: 'Warehouse Operations',
    text: 'What quality control measures are in place for warehouse operations?',
    options: [
      { value: '1', label: 'Minimal - Reactive approach to quality issues' },
      { value: '2', label: 'Basic - Some quality checks at key points' },
      { value: '3', label: 'Comprehensive - Systematic quality controls throughout processes' },
      { value: '4', label: 'Advanced - Predictive quality management with continuous improvement' }
    ]
  },
  {
    id: 'operations_5',
    category: 'Warehouse Operations',
    text: 'How do you handle returns processing?',
    options: [
      { value: '1', label: 'Ad-hoc - No formal process' },
      { value: '2', label: 'Basic - Defined process but largely manual' },
      { value: '3', label: 'Efficient - Streamlined process with quick disposition' },
      { value: '4', label: 'Optimized - Automated returns processing with value recovery focus' }
    ]
  },
  
  // Workforce Management
  {
    id: 'workforce_1',
    category: 'Workforce Management',
    text: 'How do you manage warehouse staffing levels?',
    options: [
      { value: '1', label: 'Reactive - Adjusting only when problems arise' },
      { value: '2', label: 'Basic - Simple scheduling based on historical patterns' },
      { value: '3', label: 'Advanced - Data-driven scheduling based on forecasted workload' },
      { value: '4', label: 'Sophisticated - Dynamic labor management with real-time adjustments' }
    ]
  },
  {
    id: 'workforce_2',
    category: 'Workforce Management',
    text: 'What training programs exist for warehouse personnel?',
    options: [
      { value: '1', label: 'Minimal - Basic onboarding only' },
      { value: '2', label: 'Standard - Role-specific training' },
      { value: '3', label: 'Comprehensive - Continuous skill development and cross-training' },
      { value: '4', label: 'Advanced - Personalized development paths with certification programs' }
    ]
  },
  {
    id: 'workforce_3',
    category: 'Workforce Management',
    text: 'How do you measure and manage workforce productivity?',
    options: [
      { value: '1', label: 'Limited - Few or no productivity metrics' },
      { value: '2', label: 'Basic - Simple productivity tracking' },
      { value: '3', label: 'Advanced - Comprehensive KPIs with regular feedback' },
      { value: '4', label: 'Sophisticated - Real-time productivity monitoring with incentive programs' }
    ]
  },
  {
    id: 'workforce_4',
    category: 'Workforce Management',
    text: 'What is your approach to safety management in the warehouse?',
    options: [
      { value: '1', label: 'Reactive - Addressing issues after incidents' },
      { value: '2', label: 'Basic - Standard safety protocols and training' },
      { value: '3', label: 'Proactive - Comprehensive safety program with preventative measures' },
      { value: '4', label: 'Strategic - Safety-first culture with continuous improvement' }
    ]
  },
  
  // Technology & Automation
  {
    id: 'technology_1',
    category: 'Technology & Automation',
    text: 'What level of warehouse management system (WMS) do you currently use?',
    options: [
      { value: '1', label: 'Basic - Spreadsheets or simple inventory tracking' },
      { value: '2', label: 'Standard - Basic WMS with core functionality' },
      { value: '3', label: 'Advanced - Comprehensive WMS with multiple modules' },
      { value: '4', label: 'Sophisticated - Fully integrated WMS with advanced analytics' }
    ]
  },
  {
    id: 'technology_2',
    category: 'Technology & Automation',
    text: 'What level of automation exists in your warehouse operations?',
    options: [
      { value: '1', label: 'Minimal - Primarily manual processes' },
      { value: '2', label: 'Basic - Some automation of routine tasks' },
      { value: '3', label: 'Advanced - Significant automation with some manual oversight' },
      { value: '4', label: 'Comprehensive - Highly automated with minimal manual intervention' }
    ]
  },
  {
    id: 'technology_3',
    category: 'Technology & Automation',
    text: 'How do you utilize data and analytics in warehouse decision-making?',
    options: [
      { value: '1', label: 'Limited - Minimal use of data for decisions' },
      { value: '2', label: 'Basic - Regular reporting of key metrics' },
      { value: '3', label: 'Advanced - Analytics-driven decisions with dashboards' },
      { value: '4', label: 'Sophisticated - Predictive analytics and AI-assisted decision making' }
    ]
  },
  {
    id: 'technology_4',
    category: 'Technology & Automation',
    text: 'What material handling equipment and technology do you employ?',
    options: [
      { value: '1', label: 'Basic - Manual equipment (hand trucks, manual pallet jacks)' },
      { value: '2', label: 'Standard - Powered equipment (forklifts, powered pallet jacks)' },
      { value: '3', label: 'Advanced - Specialized equipment for different operations' },
      { value: '4', label: 'Sophisticated - Automated guided vehicles (AGVs) or robotics' }
    ]
  },
  
  // Supply Chain Integration
  {
    id: 'integration_1',
    category: 'Supply Chain Integration',
    text: 'How would you rate your current supply chain visibility?',
    options: [
      { value: '1', label: 'Poor - Limited visibility across the supply chain' },
      { value: '2', label: 'Fair - Some visibility but significant gaps exist' },
      { value: '3', label: 'Good - Visibility across most of the supply chain' },
      { value: '4', label: 'Excellent - Complete end-to-end visibility' }
    ]
  },
  {
    id: 'integration_2',
    category: 'Supply Chain Integration',
    text: 'What level of integration exists between your warehouse and other supply chain systems?',
    options: [
      { value: '1', label: 'Minimal - Largely disconnected systems' },
      { value: '2', label: 'Basic - Some integration with manual interventions' },
      { value: '3', label: 'Advanced - Automated integration with key systems' },
      { value: '4', label: 'Comprehensive - Fully integrated supply chain ecosystem' }
    ]
  },
  {
    id: 'integration_3',
    category: 'Supply Chain Integration',
    text: 'How would you describe your supplier relationship management?',
    options: [
      { value: '1', label: 'Transactional - Limited communication with suppliers' },
      { value: '2', label: 'Developing - Regular communication but limited collaboration' },
      { value: '3', label: 'Collaborative - Active partnership with key suppliers' },
      { value: '4', label: 'Strategic - Deep integration and shared objectives with suppliers' }
    ]
  },
  {
    id: 'integration_4',
    category: 'Supply Chain Integration',
    text: 'How resilient is your supply chain to disruptions?',
    options: [
      { value: '1', label: 'Vulnerable - Major disruptions cause significant issues' },
      { value: '2', label: 'Somewhat resilient - Can handle minor disruptions' },
      { value: '3', label: 'Resilient - Well-prepared for most disruptions' },
      { value: '4', label: 'Highly resilient - Robust contingency plans for all scenarios' }
    ]
  },
  
  // Sustainability & Compliance
  {
    id: 'sustainability_1',
    category: 'Sustainability & Compliance',
    text: 'What sustainability initiatives are implemented in your warehouse operations?',
    options: [
      { value: '1', label: 'Minimal - Few or no sustainability initiatives' },
      { value: '2', label: 'Basic - Some energy efficiency and waste reduction measures' },
      { value: '3', label: 'Advanced - Comprehensive sustainability program' },
      { value: '4', label: 'Leading - Fully integrated sustainability strategy with measurable targets' }
    ]
  },
  {
    id: 'sustainability_2',
    category: 'Sustainability & Compliance',
    text: 'How do you manage regulatory compliance in warehouse operations?',
    options: [
      { value: '1', label: 'Reactive - Addressing compliance issues as they arise' },
      { value: '2', label: 'Basic - Standard compliance procedures' },
      { value: '3', label: 'Proactive - Comprehensive compliance program with regular audits' },
      { value: '4', label: 'Strategic - Integrated compliance management with continuous monitoring' }
    ]
  },
  
  // Performance Measurement
  {
    id: 'performance_1',
    category: 'Performance Measurement',
    text: 'How comprehensive is your warehouse KPI tracking system?',
    options: [
      { value: '1', label: 'Limited - Few or inconsistently tracked metrics' },
      { value: '2', label: 'Basic - Standard KPIs tracked regularly' },
      { value: '3', label: 'Comprehensive - Extensive KPIs with regular review' },
      { value: '4', label: 'Advanced - Real-time KPI dashboard with predictive capabilities' }
    ]
  },
  {
    id: 'performance_2',
    category: 'Performance Measurement',
    text: 'How do you measure and improve customer satisfaction?',
    options: [
      { value: '1', label: 'Reactive - Address issues when customers complain' },
      { value: '2', label: 'Basic - Standard service level metrics' },
      { value: '3', label: 'Proactive - Comprehensive customer satisfaction program' },
      { value: '4', label: 'Strategic - Customer-centric operations with continuous feedback loop' }
    ]
  },
  {
    id: 'performance_3',
    category: 'Performance Measurement',
    text: 'What continuous improvement methodologies are used in your warehouse?',
    options: [
      { value: '1', label: 'Ad-hoc - No formal improvement methodology' },
      { value: '2', label: 'Basic - Simple improvement initiatives' },
      { value: '3', label: 'Structured - Formal methodologies (Lean, Six Sigma, etc.)' },
      { value: '4', label: 'Advanced - Integrated continuous improvement culture' }
    ]
  },
  
  // Implementation Costs
  {
    id: 'implementation_1',
    category: 'Implementation Costs',
    text: 'What is the estimated license cost for the supply chain management solution? (in millions)',
    type: 'number',
    prefix: '$',
    suffix: ' million',
    placeholder: 'Enter cost in millions',
    defaultValue: 0,
    unit: 'millions',
    helpText: 'Enter the value in millions (e.g., for $1 million, enter 1)'
  },
  {
    id: 'implementation_2',
    category: 'Implementation Costs',
    text: 'What is the estimated implementation cost for the supply chain management solution? (in millions)',
    type: 'number',
    prefix: '$',
    suffix: ' million',
    placeholder: 'Enter cost in millions',
    defaultValue: 0,
    unit: 'millions', // Add unit information
    helpText: 'Enter the value in millions (e.g., for $2 million, enter 2)'
  },

  // Additional Warehouse Operations Questions
  {
    id: 'operations_intercompany',
    category: 'Warehouse Operations',
    text: 'How efficiently do you process intercompany deliveries?',
    options: [
      { value: '1', label: 'Inefficient - Long processing times with frequent delays' },
      { value: '2', label: 'Moderate - Standard processing with occasional bottlenecks' },
      { value: '3', label: 'Efficient - Streamlined processing with minimal delays' },
      { value: '4', label: 'Highly Efficient - Optimized processing with priority handling' }
    ]
  },
  {
    id: 'operations_putaway',
    category: 'Warehouse Operations',
    text: 'How efficient is your put-away process?',
    options: [
      { value: '1', label: 'Inefficient - Manual put-away with frequent errors and delays' },
      { value: '2', label: 'Basic - Semi-automated put-away with moderate efficiency' },
      { value: '3', label: 'Efficient - Well-organized put-away with location optimization' },
      { value: '4', label: 'Highly Efficient - Automated put-away with real-time optimization' }
    ]
  },
  {
    id: 'operations_cross_dock',
    category: 'Warehouse Operations',
    text: 'How effectively do you utilize cross-docking in your operations?',
    options: [
      { value: '1', label: 'Not utilized - No cross-docking capabilities' },
      { value: '2', label: 'Limited - Occasional cross-docking for select products' },
      { value: '3', label: 'Moderate - Regular cross-docking with dedicated area' },
      { value: '4', label: 'Advanced - Systematic cross-docking with optimization algorithms' }
    ]
  },
  {
    id: 'operations_pick_errors',
    category: 'Warehouse Operations',
    text: 'How effectively do you manage and reduce pick errors?',
    options: [
      { value: '1', label: 'Poor - Frequent errors with minimal tracking' },
      { value: '2', label: 'Basic - Manual error tracking with some improvement efforts' },
      { value: '3', label: 'Good - Systematic error reduction with regular monitoring' },
      { value: '4', label: 'Excellent - Advanced error prevention systems with near-zero error rates' }
    ]
  },
  {
    id: 'operations_customer_specs',
    category: 'Warehouse Operations',
    text: 'How well do your picking processes adhere to customer specifications?',
    options: [
      { value: '1', label: 'Poor - Frequent non-compliance with customer requirements' },
      { value: '2', label: 'Basic - Manual checking of basic customer requirements' },
      { value: '3', label: 'Good - Systematic processes to ensure compliance with specifications' },
      { value: '4', label: 'Excellent - Automated systems ensuring perfect adherence to all specifications' }
    ]
  },
  {
    id: 'operations_outbound_time',
    category: 'Warehouse Operations',
    text: 'How efficiently do you process outbound deliveries?',
    options: [
      { value: '1', label: 'Slow - Long processing times with frequent delays' },
      { value: '2', label: 'Moderate - Average processing times with occasional delays' },
      { value: '3', label: 'Fast - Quick processing with rare delays' },
      { value: '4', label: 'Very Fast - Optimized processing with minimal time' }
    ]
  },
  {
    id: 'operations_documentation',
    category: 'Warehouse Operations',
    text: 'How do you manage outbound documentation errors?',
    options: [
      { value: '1', label: 'Poor - Frequent documentation errors with minimal tracking' },
      { value: '2', label: 'Basic - Manual error checking with some tracking' },
      { value: '3', label: 'Good - Systematic processes to reduce documentation errors' },
      { value: '4', label: 'Excellent - Automated systems with near-zero documentation errors' }
    ]
  },
  {
    id: 'operations_transport_bookings',
    category: 'Warehouse Operations',
    text: 'What percentage of your transport bookings are automated?',
    options: [
      { value: '1', label: 'Low - Less than 25% automated bookings' },
      { value: '2', label: 'Moderate - 25-50% automated bookings' },
      { value: '3', label: 'High - 50-75% automated bookings' },
      { value: '4', label: 'Very High - More than 75% automated bookings' }
    ]
  },

  // Quality Control Questions
  {
    id: 'quality_returns_time',
    category: 'Warehouse Operations',
    text: 'How quickly do you process supplier and customer returns?',
    options: [
      { value: '1', label: 'Slow - Long processing times with frequent backlogs' },
      { value: '2', label: 'Moderate - Average processing times with occasional delays' },
      { value: '3', label: 'Fast - Quick processing with dedicated returns area' },
      { value: '4', label: 'Very Fast - Optimized returns processing with immediate disposition' }
    ]
  },
  {
    id: 'quality_quarantine',
    category: 'Warehouse Operations',
    text: 'How efficiently do you manage quarantined inventory?',
    options: [
      { value: '1', label: 'Poor - Long quarantine times with minimal tracking' },
      { value: '2', label: 'Basic - Standard quarantine processes with manual tracking' },
      { value: '3', label: 'Good - Efficient quarantine management with clear processes' },
      { value: '4', label: 'Excellent - Optimized quarantine handling with minimal hold times' }
    ]
  },

  // Inventory Accuracy Questions
  {
    id: 'inventory_sku_accuracy',
    category: 'Inventory Management',
    text: 'What is your current stock accuracy percentage by SKU quantity?',
    options: [
      { value: '1', label: 'Low - Less than 90% accuracy' },
      { value: '2', label: 'Moderate - 90-95% accuracy' },
      { value: '3', label: 'High - 95-98% accuracy' },
      { value: '4', label: 'Very High - Greater than 98% accuracy' }
    ]
  },
  {
    id: 'inventory_location_accuracy',
    category: 'Inventory Management',
    text: 'What is your current stock accuracy percentage by SKU location?',
    options: [
      { value: '1', label: 'Low - Less than 85% accuracy' },
      { value: '2', label: 'Moderate - 85-92% accuracy' },
      { value: '3', label: 'High - 92-97% accuracy' },
      { value: '4', label: 'Very High - Greater than 97% accuracy' }
    ]
  },
  {
    id: 'inventory_batch_accuracy',
    category: 'Inventory Management',
    text: 'What is your current stock accuracy percentage by serial/batch number?',
    options: [
      { value: '1', label: 'Low - Less than 85% accuracy' },
      { value: '2', label: 'Moderate - 85-92% accuracy' },
      { value: '3', label: 'High - 92-97% accuracy' },
      { value: '4', label: 'Very High - Greater than 97% accuracy' }
    ]
  },

  // Warehouse Infrastructure Questions
  {
    id: 'warehouse_travel_paths',
    category: 'Warehouse Infrastructure',
    text: 'How optimized are the travel paths in your warehouse?',
    options: [
      { value: '1', label: 'Poor - Long, inefficient travel paths with frequent congestion' },
      { value: '2', label: 'Basic - Some optimization but still significant travel distances' },
      { value: '3', label: 'Good - Well-designed paths with minimal congestion' },
      { value: '4', label: 'Excellent - Highly optimized paths with data-driven layout adjustments' }
    ]
  },

  // Logistics Questions
  {
    id: 'logistics_credit_shipments',
    category: 'Logistics & Transportation',
    text: 'How do you manage shipments to customers on credit hold?',
    options: [
      { value: '1', label: 'Poor - Frequent shipments to customers on credit hold' },
      { value: '2', label: 'Basic - Manual credit checks with occasional errors' },
      { value: '3', label: 'Good - Systematic credit verification before shipping' },
      { value: '4', label: 'Excellent - Automated system preventing all shipments to customers on credit hold' }
    ]
  },
  {
    id: 'logistics_expedited',
    category: 'Logistics & Transportation',
    text: 'How effectively do you manage and reduce expedited deliveries?',
    options: [
      { value: '1', label: 'Poor - Frequent use of expedited shipping with minimal planning' },
      { value: '2', label: 'Basic - Some efforts to reduce expedited shipments' },
      { value: '3', label: 'Good - Proactive planning to minimize expedited deliveries' },
      { value: '4', label: 'Excellent - Rare use of expedited shipping with robust planning systems' }
    ]
  },

  // Technology Questions
  {
    id: 'technology_inventory_speed',
    category: 'Technology & Automation',
    text: 'How would you rate the speed of your inventory booking processes?',
    options: [
      { value: '1', label: 'Slow - Manual entry with significant delays' },
      { value: '2', label: 'Moderate - Semi-automated with occasional bottlenecks' },
      { value: '3', label: 'Fast - Automated with real-time updates' },
      { value: '4', label: 'Very Fast - Fully automated with instant processing' }
    ]
  },
  {
    id: 'technology_paperwork',
    category: 'Technology & Automation',
    text: 'To what extent have you reduced paperwork in your warehouse operations?',
    options: [
      { value: '1', label: 'Minimal - Primarily paper-based processes' },
      { value: '2', label: 'Partial - Mix of paper and digital documentation' },
      { value: '3', label: 'Significant - Mostly digital with limited paper use' },
      { value: '4', label: 'Complete - Fully paperless operation' }
    ]
  }
];

// Helper functions for localStorage persistence
// Note: apiClient is already imported from '../../api/apiClient'

// API endpoints path is defined at the top of the file

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return error.response.data.error || 'Server error';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
    return error.message;
  }
};

// Default categories for questions that don't have them
const defaultCategories = {
  q1: 'Supply Chain Visibility',
  q2: 'Procurement & Sourcing',
  q3: 'Inventory Management',
  q4: 'Supplier Management',
  q5: 'Risk Management'
};

// Async thunks for data operations
export const fetchQuestionnaire = createAsyncThunk(
  'questionnaire/fetchQuestionnaire',
  async (companyId, { rejectWithValue }) => {
    try {
      if (!companyId) {
        return rejectWithValue('Company ID is required');
      }
      
      // Load questionnaire from API
      const response = await apiClient.get(`${API_URL}/questionnaire/${companyId}`);
      
      // Get answers from the API response
      const answers = response.data.answers || {};
      
      // Use the comprehensive mock questions instead of the limited server questions
      // This ensures we have all the assessment categories and questions needed for ROI calculation
      return {
        questions: mockQuestions,
        answers: answers
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to fetch questionnaire');
    }
  }
);

export const saveQuestionnaireAnswers = createAsyncThunk(
  'questionnaire/saveAnswers',
  async ({ companyId, answers }, { rejectWithValue }) => {
    try {
      if (!companyId) {
        return rejectWithValue('Company ID is required');
      }
      
      // Save answers to API
      const response = await apiClient.post(`${API_URL}/questionnaire/${companyId}`, { answers });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to save answers');
    }
  }
);

const initialState = {
  questions: [],
  answers: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setAnswer: (state, action) => {
      const { questionId, value } = action.payload;
      state.answers[questionId] = value;
    },
    clearAnswers: (state) => {
      state.answers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch questionnaire
      .addCase(fetchQuestionnaire.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestionnaire.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.questions = action.payload.questions;
        state.answers = action.payload.answers || {};
        state.error = null;
      })
      .addCase(fetchQuestionnaire.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Save answers
      .addCase(saveQuestionnaireAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveQuestionnaireAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(saveQuestionnaireAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setAnswer, clearAnswers } = questionnaireSlice.actions;

// Selectors
export const selectQuestions = (state) => state.questionnaire.questions;
export const selectAnswers = (state) => state.questionnaire.answers;
export const selectQuestionnaireStatus = (state) => state.questionnaire.status;
export const selectQuestionnaireError = (state) => state.questionnaire.error;

export default questionnaireSlice.reducer;
