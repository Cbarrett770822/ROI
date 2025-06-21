import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

/**
 * Return-to-Supplier or Non-Conformance Report
 * Shows: Goods that were returned, blocked, or failed receiving at the supplier site.
 * 
 * Fields:
 * - SKU
 * - Lot ID
 * - Reason code (e.g., packaging defect, contamination)
 * - Action taken (quarantine, rework, disposal)
 */
const NonConformanceReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      sku: 'SKU-001',
      lotId: 'LOT-A12345',
      reasonCode: 'Packaging Defect',
      actionTaken: 'Rework',
      date: '2025-06-10',
      quantity: 24
    },
    {
      sku: 'SKU-002',
      lotId: 'LOT-B67890',
      reasonCode: 'Label Error',
      actionTaken: 'Rework',
      date: '2025-06-12',
      quantity: 18
    },
    {
      sku: 'SKU-003',
      lotId: 'LOT-C24680',
      reasonCode: 'Contamination',
      actionTaken: 'Disposal',
      date: '2025-06-15',
      quantity: 36
    },
    {
      sku: 'SKU-001',
      lotId: 'LOT-A12346',
      reasonCode: 'Damaged in Transit',
      actionTaken: 'Quarantine',
      date: '2025-06-17',
      quantity: 12
    },
    {
      sku: 'SKU-004',
      lotId: 'LOT-D13579',
      reasonCode: 'Quality Test Failure',
      actionTaken: 'Disposal',
      date: '2025-06-18',
      quantity: 30
    }
  ];

  // Function to get action color
  const getActionColor = (action) => {
    switch (action) {
      case 'Rework':
        return 'warning';
      case 'Disposal':
        return 'error';
      case 'Quarantine':
        return 'info';
      default:
        return 'default';
    }
  };

  // Function to get reason color
  const getReasonColor = (reason) => {
    if (reason.includes('Contamination') || reason.includes('Quality Test Failure')) {
      return 'error';
    }
    if (reason.includes('Damaged') || reason.includes('Defect')) {
      return 'warning';
    }
    return 'info';
  };

  // Calculate totals with proper validation
  const calculateTotals = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) {
        return { totalItems: 0, reworkItems: 0, disposalItems: 0, quarantineItems: 0 };
      }
      
      const totalItems = sampleData.reduce((sum, item) => sum + item.quantity, 0);
      const reworkItems = sampleData
        .filter(item => item.actionTaken === 'Rework')
        .reduce((sum, item) => sum + item.quantity, 0);
      const disposalItems = sampleData
        .filter(item => item.actionTaken === 'Disposal')
        .reduce((sum, item) => sum + item.quantity, 0);
      const quarantineItems = sampleData
        .filter(item => item.actionTaken === 'Quarantine')
        .reduce((sum, item) => sum + item.quantity, 0);
      
      return { totalItems, reworkItems, disposalItems, quarantineItems };
    } catch (err) {
      console.error('Error calculating non-conformance totals:', err);
      return { totalItems: 0, reworkItems: 0, disposalItems: 0, quarantineItems: 0 };
    }
  };

  const totals = calculateTotals();

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Total Non-Conforming Items: {totals.totalItems}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`Rework: ${totals.reworkItems}`} 
            color="warning" 
            variant="outlined"
          />
          <Chip 
            label={`Disposal: ${totals.disposalItems}`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`Quarantine: ${totals.quarantineItems}`} 
            color="info" 
            variant="outlined"
          />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="non-conformance report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Lot ID</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Reason Code</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Quantity</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Action Taken</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.sku}</TableCell>
                <TableCell>{row.lotId}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.reasonCode} 
                    color={getReasonColor(row.reasonCode)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.actionTaken} 
                    color={getActionColor(row.actionTaken)} 
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Showing 5 of 5 records
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Non-Conforming Items: {totals.totalItems}
        </Typography>
      </Box>
    </Box>
  );
};

export default NonConformanceReport;
