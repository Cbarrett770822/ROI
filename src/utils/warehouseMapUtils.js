/**
 * Utility functions for mapping questionnaire answers to warehouse outcome and benefit maps
 */

/**
 * Maps questionnaire answers to warehouse outcome map data
 * @param {Object} questions - The questionnaire questions
 * @param {Object} answers - The user's answers to the questionnaire
 * @returns {Object} - Mapped data for the warehouse outcome map
 */
export const mapAnswersToOutcomes = (questions, answers) => {
  if (!questions || !answers) {
    return {};
  }

  // Define mappings from question IDs to outcome IDs
  const questionToOutcomeMap = {
    // Inbound
    'operations_1': 'supplier_delivery_time',
    'metrics_9': 'supplier_accuracy',
    'operations_intercompany': 'intercompany_delivery', // New question
    
    // Put Away
    'warehouse_2': 'storage_time',
    'operations_putaway': 'storage_time', // New question
    'warehouse_3': 'cross_dock',
    'operations_cross_dock': 'cross_dock', // New question
    
    // Pick
    'operations_2': 'pick_errors',
    'operations_pick_errors': 'pick_errors', // New question
    'workforce_3': 'pick_rate',
    'technology_3': 'spec_adherence',
    'operations_customer_specs': 'spec_adherence', // New question
    'operations_5': 'value_add',
    
    // Outbound
    'operations_3': 'delivery_time',
    'operations_outbound_time': 'delivery_time', // New question
    'workforce_1': 'team_productivity',
    'operations_3': 'documentation',
    'operations_documentation': 'documentation', // New question
    'technology_2': 'automated_bookings',
    'operations_transport_bookings': 'automated_bookings', // New question
    
    // Quality
    'operations_5': 'returns_time',
    'quality_returns_time': 'returns_time', // New question
    'inventory_3': 'quarantine_time',
    'quality_quarantine': 'quarantine_time', // New question
    
    // Inventory Controls
    'inventory_1': 'sku_accuracy',
    'inventory_sku_accuracy': 'sku_accuracy', // New question
    'inventory_2': 'location_accuracy',
    'inventory_location_accuracy': 'location_accuracy', // New question
    'inventory_2': 'batch_accuracy',
    'inventory_batch_accuracy': 'batch_accuracy', // New question
    'inventory_3': 'resolution_time',
    'warehouse_3': 'space_utilization',
    'warehouse_1': 'travel_paths',
    'warehouse_travel_paths': 'travel_paths', // New question
    
    // Manufacturing
    'operations_2': 'material_responsiveness',
    'inventory_2': 'production_side_stock',
    'inventory_1': 'wip_visibility',
    
    // Logistics
    'operations_3': 'credit_shipments',
    'logistics_credit_shipments': 'credit_shipments', // New question
    'metrics_6': 'transport_rates',
    'operations_3': 'expedited_deliveries',
    'logistics_expedited': 'expedited_deliveries', // New question
    'operations_3': 'pod_disputes',
    
    // Technology
    'technology_1': 'inventory_speed',
    'technology_inventory_speed': 'inventory_speed', // New question
    'technology_2': 'movements_processed',
    'workforce_2': 'fte_productivity',
    'technology_1': 'paperwork',
    'technology_paperwork': 'paperwork', // New question
    'technology_3': 'interface_errors'
  };

  // Initialize outcome data
  const outcomeData = {};
  
  // Map answers to outcomes
  Object.entries(questionToOutcomeMap).forEach(([questionId, outcomeId]) => {
    if (answers[questionId]) {
      // Convert string answers to numbers if needed
      const answerValue = typeof answers[questionId] === 'string' 
        ? parseInt(answers[questionId], 10) 
        : answers[questionId];
      
      // Only use valid numeric answers
      if (!isNaN(answerValue)) {
        // If multiple questions map to the same outcome, use the average
        if (outcomeData[outcomeId]) {
          outcomeData[outcomeId] = (outcomeData[outcomeId] + answerValue) / 2;
        } else {
          outcomeData[outcomeId] = answerValue;
        }
      }
    }
  });
  
  return outcomeData;
};

/**
 * Maps questionnaire answers to warehouse benefit map data
 * @param {Object} questions - The questionnaire questions
 * @param {Object} answers - The user's answers to the questionnaire
 * @param {Object} results - The calculated ROI results
 * @returns {Object} - Mapped data for the warehouse benefit map
 */
export const mapAnswersToBenefits = (questions, answers, results) => {
  if (!questions || !answers) {
    return {};
  }

  // Define mappings from question IDs to benefit IDs
  const questionToBenefitMap = {
    // Team Productivity
    'workforce_1': 'management_productivity',
    'technology_paperwork': 'management_productivity', // New question
    'workforce_3': 'shopfloor_productivity',
    'warehouse_travel_paths': 'shopfloor_productivity', // New question
    
    // Manufacturing
    'inventory_1': 'wip_inventory',
    'operations_2': 'downtime_materials',
    'operations_cross_dock': 'downtime_materials', // New question
    
    // Pick
    'operations_2': 'revenue_fill_rate',
    'operations_pick_errors': 'revenue_fill_rate', // New question
    'metrics_10': 'revenue_otif',
    'operations_customer_specs': 'revenue_otif', // New question
    'operations_3': 'bad_debts',
    'logistics_credit_shipments': 'bad_debts', // New question
    
    // Logistics
    'metrics_6': 'transport_costs',
    'operations_3': 'expedited_freight',
    'logistics_expedited': 'expedited_freight', // New question
    
    // Technology
    'technology_1': 'running_costs',
    'technology_inventory_speed': 'running_costs', // New question
    'workforce_2': 'training_costs',
    
    // Inventory Controls
    'warehouse_3': 'warehouse_space',
    'operations_putaway': 'warehouse_space', // New question
    'inventory_4': 'stock_writeoff',
    'inventory_1': 'inventory_levels',
    'inventory_sku_accuracy': 'inventory_levels', // New question
    'inventory_location_accuracy': 'inventory_levels', // New question
    'inventory_batch_accuracy': 'inventory_levels', // New question
    'quality_quarantine': 'inventory_levels' // New question
  };

  // Initialize benefit data with impact percentages
  const benefitData = {};
  
  // Map answers to benefits
  Object.entries(questionToBenefitMap).forEach(([questionId, benefitId]) => {
    if (answers[questionId]) {
      // Convert string answers to numbers if needed
      const answerValue = typeof answers[questionId] === 'string' 
        ? parseInt(answers[questionId], 10) 
        : answers[questionId];
      
      // Only use valid numeric answers
      if (!isNaN(answerValue)) {
        // Calculate impact percentage (higher answer = higher impact)
        // Scale from 1-4 to 0-100%
        const impactPercentage = ((answerValue - 1) / 3) * 100;
        
        // If multiple questions map to the same benefit, use the average
        if (benefitData[benefitId]) {
          benefitData[benefitId] = (benefitData[benefitId] + impactPercentage) / 2;
        } else {
          benefitData[benefitId] = impactPercentage;
        }
      }
    }
  });
  
  // Enhance benefit data with financial impact if available from results
  if (results && results.savingsBreakdown) {
    results.savingsBreakdown.forEach(item => {
      // Map category names to benefit IDs (simplified example)
      const categoryToBenefitMap = {
        'Inventory': ['inventory_levels', 'stock_writeoff'],
        'Labor': ['management_productivity', 'shopfloor_productivity'],
        'Transportation': ['transport_costs', 'expedited_freight'],
        'Technology': ['running_costs', 'training_costs']
      };
      
      // Add financial impact to relevant benefits
      if (categoryToBenefitMap[item.category]) {
        categoryToBenefitMap[item.category].forEach(benefitId => {
          if (benefitData[benefitId]) {
            benefitData[benefitId + '_value'] = item.amount;
          }
        });
      }
    });
  }
  
  return benefitData;
};

/**
 * Calculates the overall maturity level for each warehouse area
 * @param {Object} outcomeData - The mapped outcome data
 * @returns {Object} - Maturity levels by area
 */
export const calculateAreaMaturity = (outcomeData) => {
  if (!outcomeData) {
    return {};
  }
  
  // Define outcome IDs by area
  const areaOutcomes = {
    inbound: ['supplier_delivery_time', 'supplier_accuracy', 'intercompany_delivery'],
    putAway: ['storage_time', 'cross_dock'],
    pick: ['pick_errors', 'pick_rate', 'spec_adherence', 'value_add'],
    outbound: ['delivery_time', 'team_productivity', 'documentation', 'automated_bookings'],
    quality: ['returns_time', 'quarantine_time'],
    inventoryControls: ['sku_accuracy', 'location_accuracy', 'batch_accuracy', 'resolution_time', 'space_utilization', 'travel_paths'],
    manufacturing: ['material_responsiveness', 'production_side_stock', 'wip_visibility'],
    logistics: ['credit_shipments', 'transport_rates', 'expedited_deliveries', 'pod_disputes'],
    technology: ['inventory_speed', 'movements_processed', 'fte_productivity', 'paperwork', 'interface_errors']
  };
  
  // Calculate average score for each area
  const areaMaturity = {};
  
  Object.entries(areaOutcomes).forEach(([area, outcomes]) => {
    let totalScore = 0;
    let count = 0;
    
    outcomes.forEach(outcomeId => {
      if (outcomeData[outcomeId]) {
        totalScore += outcomeData[outcomeId];
        count++;
      }
    });
    
    // Calculate average if there are scores
    if (count > 0) {
      areaMaturity[area] = totalScore / count;
    } else {
      areaMaturity[area] = 0;
    }
  });
  
  return areaMaturity;
};

/**
 * Identifies top improvement opportunities based on outcome scores
 * @param {Object} outcomeData - The mapped outcome data
 * @param {number} limit - Maximum number of opportunities to return
 * @returns {Array} - Top improvement opportunities
 */
export const identifyTopOpportunities = (outcomeData, limit = 5) => {
  if (!outcomeData) {
    return [];
  }
  
  // Create array of [outcomeId, score] pairs
  const outcomeScores = Object.entries(outcomeData);
  
  // Sort by score (ascending - lower scores are higher priority)
  outcomeScores.sort((a, b) => a[1] - b[1]);
  
  // Take top N opportunities
  return outcomeScores.slice(0, limit).map(([outcomeId, score]) => ({
    id: outcomeId,
    score
  }));
};
