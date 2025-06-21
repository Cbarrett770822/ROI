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
  Grid,
  Card,
  CardContent
} from '@mui/material';

/**
 * Hold & Quarantine Report
 * Shows: Any inventory currently blocked due to quality, label, or process issues.
 * 
 * Fields:
 * - SKU
 * - Lot / Batch #
 * - Quantity on hold
 * - Reason for hold
 * - Date placed on hold
 * - Expected resolution date
 */
const HoldQuarantineReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      sku: 'SKU-001',
      lotNumber: 'LOT-A12345',
      quantityOnHold: 50,
      reasonForHold: 'Quality Test Pending',
      datePlacedOnHold: '2025-06-10',
      expectedResolutionDate: '2025-06-15',
      status: 'Pending'
    },
    {
      sku: 'SKU-002',
      lotNumber: 'LOT-B67890',
      quantityOnHold: 35,
      reasonForHold: 'Label Verification',
      datePlacedOnHold: '2025-06-12',
      expectedResolutionDate: '2025-06-14',
      status: 'Pending'
    },
    {
      sku: 'SKU-003',
      lotNumber: 'LOT-C24680',
      quantityOnHold: 120,
      reasonForHold: 'Foreign Material',
      datePlacedOnHold: '2025-06-08',
      expectedResolutionDate: '2025-06-20',
      status: 'Investigation'
    },
    {
      sku: 'SKU-001',
      lotNumber: 'LOT-A12346',
      quantityOnHold: 75,
      reasonForHold: 'Packaging Defect',
      datePlacedOnHold: '2025-06-05',
      expectedResolutionDate: '2025-06-18',
      status: 'Rework'
    },
    {
      sku: 'SKU-004',
      lotNumber: 'LOT-D13579',
      quantityOnHold: 90,
      reasonForHold: 'Temperature Excursion',
      datePlacedOnHold: '2025-06-11',
      expectedResolutionDate: '2025-06-25',
      status: 'Investigation'
    }
  ];

  // Calculate summary metrics with proper validation
  const calculateSummaryMetrics = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) {
        return { 
          totalOnHold: 0, 
          pendingCount: 0, 
          investigationCount: 0, 
          reworkCount: 0 
        };
      }
      
      const totalOnHold = sampleData.reduce((sum, item) => sum + item.quantityOnHold, 0);
      const pendingCount = sampleData.filter(item => item.status === 'Pending').length;
      const investigationCount = sampleData.filter(item => item.status === 'Investigation').length;
      const reworkCount = sampleData.filter(item => item.status === 'Rework').length;
      
      return { totalOnHold, pendingCount, investigationCount, reworkCount };
    } catch (err) {
      console.error('Error calculating hold & quarantine summary metrics:', err);
      return { totalOnHold: 0, pendingCount: 0, investigationCount: 0, reworkCount: 0 };
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'info';
      case 'Investigation':
        return 'warning';
      case 'Rework':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to get reason color
  const getReasonColor = (reason) => {
    if (reason.includes('Quality') || reason.includes('Test')) {
      return 'info';
    }
    if (reason.includes('Foreign') || reason.includes('Contamination')) {
      return 'error';
    }
    if (reason.includes('Label') || reason.includes('Packaging')) {
      return 'warning';
    }
    if (reason.includes('Temperature')) {
      return 'secondary';
    }
    return 'default';
  };

  const metrics = calculateSummaryMetrics();

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Units on Hold
              </Typography>
              <Typography variant="h4" color="error">
                {metrics.totalOnHold}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Resolution
              </Typography>
              <Typography variant="h4" color="info.main">
                {metrics.pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Under Investigation
              </Typography>
              <Typography variant="h4" color="warning.main">
                {metrics.investigationCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Awaiting Rework
              </Typography>
              <Typography variant="h4" color="error">
                {metrics.reworkCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="hold and quarantine report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Lot / Batch #</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Quantity</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Reason for Hold</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Date Placed on Hold</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Expected Resolution</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.sku}</TableCell>
                <TableCell>{row.lotNumber}</TableCell>
                <TableCell align="right">{row.quantityOnHold}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.reasonForHold} 
                    color={getReasonColor(row.reasonForHold)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{row.datePlacedOnHold}</TableCell>
                <TableCell>{row.expectedResolutionDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status)} 
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
          Showing 5 of 5 items on hold
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {metrics.totalOnHold} units on hold
        </Typography>
      </Box>
    </Box>
  );
};

export default HoldQuarantineReport;
