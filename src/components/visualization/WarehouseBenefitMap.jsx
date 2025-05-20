import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Tooltip
} from '@mui/material';

/**
 * Warehouse Benefit Map Component
 * Visualizes business benefits derived from warehouse improvements
 */
const WarehouseBenefitMap = ({ benefitData }) => {
  // Define the benefit map structure
  const benefitMapStructure = {
    teamProductivity: {
      title: 'TEAM PRODUCTIVITY',
      benefits: [
        { id: 'management_productivity', text: 'Increased management & admin team productivity' },
        { id: 'shopfloor_productivity', text: 'Increased shopfloor team productivity' }
      ]
    },
    manufacturing: {
      title: 'MANUFACTURING',
      benefits: [
        { id: 'wip_inventory', text: 'Reduced WIP inventory' },
        { id: 'downtime_materials', text: 'Reduced downtime due to lack of materials' }
      ]
    },
    pick: {
      title: 'PICK',
      benefits: [
        { id: 'revenue_fill_rate', text: 'Increased revenue from improved order fill rate' },
        { id: 'revenue_otif', text: 'Increased revenue from increased OTIF%' },
        { id: 'bad_debts', text: 'Reduced bad debts' }
      ]
    },
    logistics: {
      title: 'LOGISTICS',
      benefits: [
        { id: 'transport_costs', text: 'Reduced overall transport costs' },
        { id: 'expedited_freight', text: 'Reduced expedited freight cost' }
      ]
    },
    technology: {
      title: 'TECHNOLOGY',
      benefits: [
        { id: 'running_costs', text: 'Reduced total cost of running warehouse systems' },
        { id: 'training_costs', text: 'Reduced training costs' }
      ]
    },
    inventoryControls: {
      title: 'INVENTORY CONTROLS',
      benefits: [
        { id: 'warehouse_space', text: 'Reduced warehouse space needed' },
        { id: 'stock_writeoff', text: 'Reduced stock write-off & obsolescence' },
        { id: 'inventory_levels', text: 'Reduced overall inventory levels' }
      ]
    }
  };

  // Function to determine cell color based on impact
  const getCellColor = (benefitId) => {
    if (!benefitData || !benefitData[benefitId]) {
      return '#E0E0E0'; // Default gray for no data
    }
    
    const impact = benefitData[benefitId];
    if (impact > 75) return '#CCFF99'; // Green - High impact
    if (impact > 25) return '#FFCC99'; // Orange - Medium impact
    return '#FF9999'; // Red - Low impact
  };

  // Function to get tooltip content
  const getTooltipContent = (benefitId, benefitText) => {
    if (!benefitData || !benefitData[benefitId]) {
      return 'No benefit data available';
    }
    
    const impact = benefitData[benefitId];
    let impactLevel = 'Not assessed';
    
    if (impact > 75) impactLevel = 'High impact';
    else if (impact > 25) impactLevel = 'Medium impact';
    else impactLevel = 'Low impact';
    
    return `${benefitText}\nImpact Level: ${impactLevel}\nEstimated Impact: ${impact}%`;
  };

  // Function to format currency if available
  const formatCurrency = (value) => {
    if (!value) return 'Not calculated';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ width: '100%', overflow: 'auto', mt: 4 }}>
      {/* Warehouse benefit map title */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Warehouse benefit map
      </Typography>
      
      {/* Benefit map grid */}
      <Grid container spacing={1}>
        {Object.values(benefitMapStructure).map((section) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={section.title}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid #000',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Section header */}
              <Box 
                sx={{ 
                  bgcolor: '#000', 
                  color: '#fff',
                  p: 1,
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {section.title}
                </Typography>
              </Box>
              
              {/* Section benefits */}
              <Box sx={{ p: 1, flexGrow: 1 }}>
                {section.benefits.map((benefit) => (
                  <Tooltip 
                    key={benefit.id}
                    title={getTooltipContent(benefit.id, benefit.text)}
                    arrow
                  >
                    <Paper 
                      elevation={0}
                      sx={{ 
                        bgcolor: getCellColor(benefit.id),
                        p: 1,
                        mb: 1,
                        border: '1px solid #ddd',
                        minHeight: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2">
                        {benefit.text}
                      </Typography>
                    </Paper>
                  </Tooltip>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WarehouseBenefitMap;
