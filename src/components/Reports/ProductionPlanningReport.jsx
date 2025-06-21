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
 * Production Planning & Scheduling Report
 * Shows: Production planning vs. actual execution.
 * 
 * Fields:
 * - Planned production date
 * - Actual production date
 * - SKU and Quantity
 * - Variance (planned vs. actual)
 */
const ProductionPlanningReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      sku: 'SKU-001',
      plannedDate: '2025-06-05',
      actualDate: '2025-06-05',
      plannedQuantity: 1000,
      actualQuantity: 950,
      variance: -50,
      variancePercent: -5
    },
    {
      sku: 'SKU-002',
      plannedDate: '2025-06-07',
      actualDate: '2025-06-08',
      plannedQuantity: 800,
      actualQuantity: 800,
      variance: 0,
      variancePercent: 0
    },
    {
      sku: 'SKU-003',
      plannedDate: '2025-06-10',
      actualDate: '2025-06-12',
      plannedQuantity: 1200,
      actualQuantity: 1100,
      variance: -100,
      variancePercent: -8.33
    },
    {
      sku: 'SKU-001',
      plannedDate: '2025-06-15',
      actualDate: '2025-06-15',
      plannedQuantity: 950,
      actualQuantity: 975,
      variance: 25,
      variancePercent: 2.63
    },
    {
      sku: 'SKU-004',
      plannedDate: '2025-06-18',
      actualDate: '2025-06-19',
      plannedQuantity: 750,
      actualQuantity: 700,
      variance: -50,
      variancePercent: -6.67
    }
  ];

  // Calculate overall production accuracy with proper validation
  const calculateOverallAccuracy = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) return 'N/A';
      
      const totalPlanned = sampleData.reduce((sum, item) => sum + item.plannedQuantity, 0);
      const totalActual = sampleData.reduce((sum, item) => sum + item.actualQuantity, 0);
      
      if (totalPlanned === 0) return 'N/A';
      
      const accuracy = (totalActual / totalPlanned * 100).toFixed(1);
      return accuracy;
    } catch (err) {
      console.error('Error calculating overall production accuracy:', err);
      return 'N/A';
    }
  };

  // Calculate on-time percentage with proper validation
  const calculateOnTimePercentage = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) return 'N/A';
      
      const onTimeCount = sampleData.filter(item => item.plannedDate === item.actualDate).length;
      const onTimePercentage = (onTimeCount / sampleData.length * 100).toFixed(1);
      
      return onTimePercentage;
    } catch (err) {
      console.error('Error calculating on-time percentage:', err);
      return 'N/A';
    }
  };

  // Function to get variance color
  const getVarianceColor = (variance) => {
    if (variance >= 0) return 'success';
    if (variance >= -5) return 'warning';
    return 'error';
  };

  // Function to get date variance color
  const getDateVarianceColor = (planned, actual) => {
    if (planned === actual) return 'success';
    return 'warning';
  };

  const overallAccuracy = calculateOverallAccuracy();
  const onTimePercentage = calculateOnTimePercentage();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: '48%' }}>
          <Typography variant="h6" gutterBottom>
            Production Quantity Accuracy: {overallAccuracy}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={parseFloat(overallAccuracy)} 
            color={getVarianceColor(parseFloat(overallAccuracy) - 100)}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Box sx={{ width: '48%' }}>
          <Typography variant="h6" gutterBottom>
            On-Time Production: {onTimePercentage}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={parseFloat(onTimePercentage)} 
            color={parseFloat(onTimePercentage) >= 80 ? 'success' : 'warning'}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="production planning report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Planned Date</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Actual Date</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Planned Qty</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Actual Qty</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Variance</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Variance %</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.sku}</TableCell>
                <TableCell>{row.plannedDate}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">{row.actualDate}</Typography>
                    {row.plannedDate !== row.actualDate && (
                      <Chip 
                        label="Late" 
                        color="warning" 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">{row.plannedQuantity}</TableCell>
                <TableCell align="right">{row.actualQuantity}</TableCell>
                <TableCell align="right">
                  <Chip 
                    label={row.variance > 0 ? `+${row.variance}` : row.variance} 
                    color={getVarianceColor(row.variance)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '60%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={100 + row.variancePercent} 
                        color={getVarianceColor(row.variancePercent)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {row.variancePercent > 0 ? `+${row.variancePercent.toFixed(1)}` : row.variancePercent.toFixed(1)}%
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
          Showing 5 of 5 production runs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: 4,700 units planned, 4,525 units produced
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductionPlanningReport;
