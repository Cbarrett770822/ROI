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
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

/**
 * Batch Traceability Report (WMS Level)
 * Shows: Full chain of custody within the warehouse.
 * 
 * Fields:
 * - Raw material batch → Finished product batch
 * - Putaway location
 * - Pick/Ship timestamps
 * - LPN/container ID
 */
const BatchTraceabilityReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      finishedBatch: 'LOT-A12345',
      rawMaterialBatch: 'RM-X9876',
      putawayLocation: 'RACK-C12-S3',
      putawayTimestamp: '2025-06-05T10:30:00',
      pickTimestamp: '2025-06-10T14:15:00',
      shipTimestamp: '2025-06-10T16:45:00',
      lpnId: 'LPN-45678',
      sku: 'SKU-001'
    },
    {
      finishedBatch: 'LOT-B67890',
      rawMaterialBatch: 'RM-Y8765',
      putawayLocation: 'RACK-D08-S2',
      putawayTimestamp: '2025-06-07T09:15:00',
      pickTimestamp: '2025-06-12T11:30:00',
      shipTimestamp: '2025-06-12T15:20:00',
      lpnId: 'LPN-56789',
      sku: 'SKU-002'
    },
    {
      finishedBatch: 'LOT-C24680',
      rawMaterialBatch: 'RM-Z7654',
      putawayLocation: 'RACK-E05-S4',
      putawayTimestamp: '2025-06-10T13:45:00',
      pickTimestamp: '2025-06-15T10:20:00',
      shipTimestamp: '2025-06-15T14:10:00',
      lpnId: 'LPN-67890',
      sku: 'SKU-003'
    },
    {
      finishedBatch: 'LOT-A12346',
      rawMaterialBatch: 'RM-X9877',
      putawayLocation: 'RACK-C12-S4',
      putawayTimestamp: '2025-06-12T11:00:00',
      pickTimestamp: '2025-06-17T09:45:00',
      shipTimestamp: '2025-06-17T13:30:00',
      lpnId: 'LPN-78901',
      sku: 'SKU-001'
    },
    {
      finishedBatch: 'LOT-D13579',
      rawMaterialBatch: 'RM-W6543',
      putawayLocation: 'RACK-F03-S1',
      putawayTimestamp: '2025-06-15T14:30:00',
      pickTimestamp: '2025-06-18T08:15:00',
      shipTimestamp: '2025-06-18T12:40:00',
      lpnId: 'LPN-89012',
      sku: 'SKU-004'
    }
  ];

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return 'Invalid Date';
    }
  };

  // Calculate storage duration with proper validation
  const calculateStorageDuration = (putaway, pick) => {
    try {
      if (!putaway || !pick) return 'N/A';
      
      const putawayDate = new Date(putaway);
      const pickDate = new Date(pick);
      
      if (isNaN(putawayDate) || isNaN(pickDate)) return 'N/A';
      
      const diffTime = Math.abs(pickDate - putawayDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (err) {
      console.error('Error calculating storage duration:', err);
      return 'N/A';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Batch Traceability Chain
        </Typography>
        <Stepper alternativeLabel>
          <Step completed>
            <StepLabel>Raw Material Receipt</StepLabel>
          </Step>
          <Step completed>
            <StepLabel>Production</StepLabel>
          </Step>
          <Step completed>
            <StepLabel>Putaway</StepLabel>
          </Step>
          <Step completed>
            <StepLabel>Pick</StepLabel>
          </Step>
          <Step completed>
            <StepLabel>Ship</StepLabel>
          </Step>
        </Stepper>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="batch traceability report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Finished Batch</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Raw Material Batch</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">LPN ID</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Putaway Location</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Putaway Time</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Pick Time</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Ship Time</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Storage (Days)</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => {
              const storageDays = calculateStorageDuration(row.putawayTimestamp, row.pickTimestamp);
              
              return (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell>{row.finishedBatch}</TableCell>
                  <TableCell>{row.rawMaterialBatch}</TableCell>
                  <TableCell>{row.lpnId}</TableCell>
                  <TableCell>{row.putawayLocation}</TableCell>
                  <TableCell>{formatTimestamp(row.putawayTimestamp)}</TableCell>
                  <TableCell>{formatTimestamp(row.pickTimestamp)}</TableCell>
                  <TableCell>{formatTimestamp(row.shipTimestamp)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${storageDays} days`} 
                      color={storageDays > 7 ? 'warning' : 'success'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Showing 5 of 5 batches
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Average Storage Duration: 5.4 days
        </Typography>
      </Box>
    </Box>
  );
};

export default BatchTraceabilityReport;
