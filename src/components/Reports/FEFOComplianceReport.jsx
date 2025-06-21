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
  LinearProgress
} from '@mui/material';

/**
 * FEFO Compliance Report
 * Shows: Whether products are being picked and shipped according to First Expire, First Out.
 * 
 * Fields:
 * - Shipments with newer batches sent before older
 * - Exceptions flagged
 * - Compliance % by SKU
 */
const FEFOComplianceReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      sku: 'SKU-001',
      totalShipments: 45,
      fefoCompliant: 42,
      exceptions: 3,
      compliancePercentage: 93.3
    },
    {
      sku: 'SKU-002',
      totalShipments: 38,
      fefoCompliant: 35,
      exceptions: 3,
      compliancePercentage: 92.1
    },
    {
      sku: 'SKU-003',
      totalShipments: 52,
      fefoCompliant: 48,
      exceptions: 4,
      compliancePercentage: 92.3
    },
    {
      sku: 'SKU-004',
      totalShipments: 29,
      fefoCompliant: 29,
      exceptions: 0,
      compliancePercentage: 100
    },
    {
      sku: 'SKU-005',
      totalShipments: 33,
      fefoCompliant: 27,
      exceptions: 6,
      compliancePercentage: 81.8
    }
  ];

  // Calculate overall compliance percentage
  const calculateOverallCompliance = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) return 'N/A';
      
      const totalShipments = sampleData.reduce((sum, item) => sum + item.totalShipments, 0);
      const totalCompliant = sampleData.reduce((sum, item) => sum + item.fefoCompliant, 0);
      
      if (totalShipments === 0) return 'N/A';
      return (totalCompliant / totalShipments * 100).toFixed(1);
    } catch (err) {
      console.error('Error calculating overall FEFO compliance:', err);
      return 'N/A';
    }
  };

  // Function to get compliance color
  const getComplianceColor = (percentage) => {
    if (percentage >= 95) return 'success';
    if (percentage >= 85) return 'warning';
    return 'error';
  };

  const overallCompliance = calculateOverallCompliance();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Overall FEFO Compliance: {overallCompliance}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={parseFloat(overallCompliance)} 
          color={getComplianceColor(overallCompliance)}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="fefo compliance report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Total Shipments</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">FEFO Compliant</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Exceptions</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Compliance %</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.sku}</TableCell>
                <TableCell align="right">{row.totalShipments}</TableCell>
                <TableCell align="right">{row.fefoCompliant}</TableCell>
                <TableCell align="right">{row.exceptions}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '60%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={row.compliancePercentage} 
                        color={getComplianceColor(row.compliancePercentage)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {row.compliancePercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Showing 5 of 5 SKUs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Exceptions: 16 out of 197 shipments
        </Typography>
      </Box>
    </Box>
  );
};

export default FEFOComplianceReport;
