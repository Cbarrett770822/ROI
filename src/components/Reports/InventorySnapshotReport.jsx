import React, { forwardRef, useImperativeHandle } from 'react';
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
 * Inventory Snapshot by Batch & Age Report
 * Shows: Real-time or daily snapshot of inventory levels.
 * 
 * Fields:
 * - SKU
 * - Lot / Batch #
 * - Expiry Date
 * - Quantity (cases/pallets)
 * - Aging (days in storage)
 * - Status (available, on hold, damaged)
 */
const InventorySnapshotReport = forwardRef(({ data, supplier, month }, ref) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data
  const sampleData = [
    {
      sku: 'SKU-001',
      lotNumber: 'LOT-A12345',
      expiryDate: '2025-12-15',
      quantityCases: 80,
      quantityPallets: 3,
      daysInStorage: 11,
      status: 'Available'
    },
    {
      sku: 'SKU-002',
      lotNumber: 'LOT-B67890',
      expiryDate: '2025-11-20',
      quantityCases: 65,
      quantityPallets: 2,
      daysInStorage: 9,
      status: 'Available'
    },
    {
      sku: 'SKU-003',
      lotNumber: 'LOT-C24680',
      expiryDate: '2025-10-30',
      quantityCases: 120,
      quantityPallets: 5,
      daysInStorage: 5,
      status: 'Available'
    },
    {
      sku: 'SKU-001',
      lotNumber: 'LOT-A12346',
      expiryDate: '2025-12-10',
      quantityCases: 40,
      quantityPallets: 2,
      daysInStorage: 4,
      status: 'On Hold'
    },
    {
      sku: 'SKU-004',
      lotNumber: 'LOT-D13579',
      expiryDate: '2025-09-25',
      quantityCases: 15,
      quantityPallets: 1,
      daysInStorage: 3,
      status: 'Damaged'
    }
  ];

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'Damaged':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to get aging color based on days in storage
  const getAgingColor = (days) => {
    if (days <= 5) return 'success';
    if (days <= 10) return 'warning';
    return 'error';
  };
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    // Return the data for export
    getReportData: () => {
      return sampleData;
    },
    // Return the columns for export
    getReportColumns: () => {
      return [
        { field: 'sku', headerName: 'SKU' },
        { field: 'lotNumber', headerName: 'Lot / Batch #' },
        { field: 'expiryDate', headerName: 'Expiry Date' },
        { field: 'quantityCases', headerName: 'Cases' },
        { field: 'quantityPallets', headerName: 'Pallets' },
        { field: 'daysInStorage', headerName: 'Aging (Days)' },
        { field: 'status', headerName: 'Status' }
      ];
    }
  }));

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="inventory snapshot report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Lot / Batch #</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Expiry Date</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Cases</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Pallets</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Aging (Days)</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.sku}</TableCell>
                <TableCell>{row.lotNumber}</TableCell>
                <TableCell>{row.expiryDate}</TableCell>
                <TableCell align="right">{row.quantityCases}</TableCell>
                <TableCell align="right">{row.quantityPallets}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.daysInStorage} 
                    color={getAgingColor(row.daysInStorage)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status)} 
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
          Showing 5 of 5 inventory items
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: 320 Cases, 13 Pallets
        </Typography>
      </Box>
    </Box>
  );
});

export default InventorySnapshotReport;
