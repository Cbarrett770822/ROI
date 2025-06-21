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
 * Dock-to-Stock Time (Receiving Efficiency) Report
 * Shows: How quickly suppliers move finished goods into their own stock (internal visibility).
 * 
 * Fields:
 * - Receipt timestamp
 * - Putaway timestamp
 * - SKU and Quantity
 * - Average time by shift/date
 */
const DockToStockReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      receiptTimestamp: '2025-06-15T08:30:00',
      putawayTimestamp: '2025-06-15T09:45:00',
      sku: 'SKU-001',
      quantity: 120,
      shift: 'Morning',
      dockToStockTime: 75 // minutes
    },
    {
      receiptTimestamp: '2025-06-15T10:15:00',
      putawayTimestamp: '2025-06-15T11:00:00',
      sku: 'SKU-002',
      quantity: 85,
      shift: 'Morning',
      dockToStockTime: 45
    },
    {
      receiptTimestamp: '2025-06-16T09:45:00',
      putawayTimestamp: '2025-06-16T11:30:00',
      sku: 'SKU-003',
      quantity: 200,
      shift: 'Morning',
      dockToStockTime: 105
    },
    {
      receiptTimestamp: '2025-06-17T14:20:00',
      putawayTimestamp: '2025-06-17T15:15:00',
      sku: 'SKU-001',
      quantity: 150,
      shift: 'Afternoon',
      dockToStockTime: 55
    },
    {
      receiptTimestamp: '2025-06-18T11:10:00',
      putawayTimestamp: '2025-06-18T12:30:00',
      sku: 'SKU-004',
      quantity: 95,
      shift: 'Morning',
      dockToStockTime: 80
    }
  ];

  // Function to get efficiency color based on dock-to-stock time
  const getEfficiencyColor = (minutes) => {
    if (minutes <= 60) return 'success';
    if (minutes <= 90) return 'warning';
    return 'error';
  };

  // Calculate average dock-to-stock time
  const calculateAverage = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) return 'N/A';
      
      const total = sampleData.reduce((sum, item) => sum + item.dockToStockTime, 0);
      return Math.round(total / sampleData.length);
    } catch (err) {
      console.error('Error calculating average dock-to-stock time:', err);
      return 'N/A';
    }
  };

  const averageTime = calculateAverage();

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Average Dock-to-Stock Time: {averageTime} minutes
        </Typography>
        <Chip 
          label={`${averageTime} min`} 
          color={getEfficiencyColor(averageTime)} 
          size="medium"
        />
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="dock to stock report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">Receipt Time</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Putaway Time</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Quantity</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Shift</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Dock-to-Stock Time</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{new Date(row.receiptTimestamp).toLocaleString()}</TableCell>
                <TableCell>{new Date(row.putawayTimestamp).toLocaleString()}</TableCell>
                <TableCell>{row.sku}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell>{row.shift}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${row.dockToStockTime} min`} 
                    color={getEfficiencyColor(row.dockToStockTime)} 
                    size="small" 
                    variant="outlined"
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
          Total Items Processed: 650 units
        </Typography>
      </Box>
    </Box>
  );
};

export default DockToStockReport;
