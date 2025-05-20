import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Tooltip
} from '@mui/material';

/**
 * Warehouse Outcome Map Component
 * Visualizes warehouse performance outcomes based on questionnaire responses
 */
const WarehouseOutcomeMap = ({ assessmentData }) => {
  // Define the outcome map structure
  const outcomeMapStructure = {
    inbound: {
      title: 'INBOUND',
      outcomes: [
        { id: 'supplier_delivery_time', text: 'Reduced average time to process a supplier delivery' },
        { id: 'supplier_accuracy', text: 'Supplier on time in full delivery accuracy %' },
        { id: 'intercompany_delivery', text: 'Reduced time to process an intercompany delivery' }
      ]
    },
    putAway: {
      title: 'PUT AWAY',
      outcomes: [
        { id: 'storage_time', text: 'Reduced average time to put away into the correct storage' },
        { id: 'cross_dock', text: 'Faster cross dock of goods to shipping and/or production' },
      ]
    },
    pick: {
      title: 'PICK',
      outcomes: [
        { id: 'pick_errors', text: 'Reduced pick errors' },
        { id: 'pick_rate', text: 'Increased average picks per pick team member' },
        { id: 'spec_adherence', text: 'Increased adherence to customer specifications' },
        { id: 'value_add', text: 'Increased number of value-add orders managed' }
      ]
    },
    outbound: {
      title: 'OUTBOUND',
      outcomes: [
        { id: 'delivery_time', text: 'Reduced average time to process outbound deliveries' },
        { id: 'team_productivity', text: 'Increased shipment team productivity' },
        { id: 'documentation', text: 'Reduced outbound documentation errors' },
        { id: 'automated_bookings', text: 'Increased % of automated transport bookings / orders' }
      ]
    },
    quality: {
      title: 'QUALITY',
      outcomes: [
        { id: 'returns_time', text: 'Reduced time to process supplier / customer returns' },
        { id: 'quarantine_time', text: 'Reduced time inventory is held in quarantine' }
      ]
    },
    inventoryControls: {
      title: 'INVENTORY CONTROLS',
      outcomes: [
        { id: 'sku_accuracy', text: 'Increased stock accuracy % Quantity by SKU' },
        { id: 'location_accuracy', text: 'Increased stock accuracy % SKU by location' },
        { id: 'batch_accuracy', text: 'Increased stock accuracy % SKU by serial / batch' },
        { id: 'resolution_time', text: 'Reduced time resolving stock errors' },
        { id: 'space_utilization', text: 'Increased space utilisation' },
        { id: 'travel_paths', text: 'Optimised travel paths' }
      ]
    },
    manufacturing: {
      title: 'MANUFACTURING',
      outcomes: [
        { id: 'material_responsiveness', text: 'Faster responsiveness to manufacturing material requests' },
        { id: 'production_side_stock', text: 'Reduced production line side stock levels' },
        { id: 'wip_visibility', text: 'Increased WIP stock visibility & accuracy' }
      ]
    },
    logistics: {
      title: 'LOGISTICS',
      outcomes: [
        { id: 'credit_shipments', text: 'Reduced shipments to customers on credit hold' },
        { id: 'transport_rates', text: 'Increased adherence to contracted transport rates' },
        { id: 'expedited_deliveries', text: 'Reduced expedited deliveries' },
        { id: 'pod_disputes', text: 'Reduced customers disputes through POD availability' }
      ]
    },
    technology: {
      title: 'TECHNOLOGY',
      outcomes: [
        { id: 'inventory_speed', text: 'Increased speed of inventory booking time' },
        { id: 'movements_processed', text: 'Increased % of movements processed automatically' },
        { id: 'fte_productivity', text: 'Faster time to full FTE productivity' },
        { id: 'paperwork', text: 'Reduced paperwork' },
        { id: 'interface_errors', text: 'Reduced interface errors' }
      ]
    }
  };

  // Define assessment criteria and colors
  const assessmentCriteria = [
    { id: 'top_priority', label: 'Top priority to improve', color: '#FF9999' },
    { id: 'next_priority', label: 'Next in priority', color: '#FFCC99' },
    { id: 'current_strength', label: 'Current strength', color: '#CCFF99' },
    { id: 'not_applicable', label: 'Not applicable', color: '#E0E0E0' }
  ];

  // Function to determine cell color based on score
  const getCellColor = (outcomeId) => {
    if (!assessmentData || !assessmentData[outcomeId]) {
      return '#E0E0E0'; // Default gray for no data
    }
    
    const score = assessmentData[outcomeId];
    if (score < 2) return '#FF9999'; // Red - Top priority
    if (score < 3) return '#FFCC99'; // Orange - Next priority
    return '#CCFF99'; // Green - Current strength
  };

  // Function to get tooltip content
  const getTooltipContent = (outcomeId, outcomeText) => {
    if (!assessmentData || !assessmentData[outcomeId]) {
      return 'No assessment data available';
    }
    
    const score = assessmentData[outcomeId];
    let status = 'Not assessed';
    
    if (score < 2) status = 'Top priority to improve';
    else if (score < 3) status = 'Next in priority';
    else status = 'Current strength';
    
    return `${outcomeText}\nStatus: ${status}\nScore: ${score}/4`;
  };

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      {/* Assessment criteria legend */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="subtitle2" sx={{ mr: 2 }}>Assessment criteria</Typography>
        {assessmentCriteria.map((criteria) => (
          <Box 
            key={criteria.id} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mr: 2 
            }}
          >
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: criteria.color,
                mr: 0.5
              }} 
            />
            <Typography variant="caption">{criteria.label}</Typography>
          </Box>
        ))}
      </Box>
      
      {/* Warehouse outcome map title */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Warehouse outcome map
      </Typography>
      
      {/* Outcome map grid */}
      <Grid container spacing={1}>
        {Object.values(outcomeMapStructure).map((section) => (
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
              
              {/* Section outcomes */}
              <Box sx={{ p: 1, flexGrow: 1 }}>
                {section.outcomes.map((outcome) => (
                  <Tooltip 
                    key={outcome.id}
                    title={getTooltipContent(outcome.id, outcome.text)}
                    arrow
                  >
                    <Paper 
                      elevation={0}
                      sx={{ 
                        bgcolor: getCellColor(outcome.id),
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
                        {outcome.text}
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

export default WarehouseOutcomeMap;
