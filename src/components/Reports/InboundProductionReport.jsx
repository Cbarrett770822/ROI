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
  Paper
} from '@mui/material';

/**
 * Inbound Production Completion Report
 * Shows: What was received into the WMS from production lines, per SKU, lot, and date.
 * 
 * Fields:
 * - SKU
 * - Batch ID / Lot #
 * - Date/Time received into WMS
 * - Quantity produced (cases, pallets)
 */
const InboundProductionReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data
  const sampleData = [
    {
      sku: 'SKU-001',
      batchId: 'LOT-A12345',
      receivedDate: '2025-06-15T08:30:00',
      quantityCases: 120,
      quantityPallets: 5
    },
    {
      sku: 'SKU-002',
      batchId: 'LOT-B67890',
      receivedDate: '2025-06-15T10:15:00',
      quantityCases: 85,
      quantityPallets: 3
    },
    {
      sku: 'SKU-003',
      batchId: 'LOT-C24680',
      receivedDate: '2025-06-16T09:45:00',
      quantityCases: 200,
      quantityPallets: 8
    },
    {
      sku: 'SKU-001',
      batchId: 'LOT-A12346',
      receivedDate: '2025-06-17T14:20:00',
      quantityCases: 150,
      quantityPallets: 6
    },
    {
      sku: 'SKU-004',
      batchId: 'LOT-D13579',
      receivedDate: '2025-06-18T11:10:00',
      quantityCases: 95,
      quantityPallets: 4
    }
  ];

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="inbound production report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Batch ID / Lot #</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Date/Time Received</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Cases</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Pallets</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.sku}</TableCell>
                <TableCell>{row.batchId}</TableCell>
                <TableCell>
                  {new Date(row.receivedDate).toLocaleString()}
                </TableCell>
                <TableCell align="right">{row.quantityCases}</TableCell>
                <TableCell align="right">{row.quantityPallets}</TableCell>
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
          Total: 650 Cases, 26 Pallets
        </Typography>
      </Box>
    </Box>
  );
};

export default InboundProductionReport;
