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
 * Order Fulfillment Report (WMS View)
 * Shows: How well the supplier fulfilled Vita Coco's outbound orders.
 * 
 * Fields:
 * - PO / Sales Order #
 * - SKU
 * - Quantity Ordered vs. Shipped
 * - Date shipped
 * - Short picks or substitutions
 */
const OrderFulfillmentReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      orderNumber: 'PO-12345',
      sku: 'SKU-001',
      quantityOrdered: 200,
      quantityShipped: 200,
      dateShipped: '2025-06-10',
      fulfillmentRate: 100,
      shortPicks: 0,
      substitutions: 0
    },
    {
      orderNumber: 'PO-12346',
      sku: 'SKU-002',
      quantityOrdered: 150,
      quantityShipped: 135,
      dateShipped: '2025-06-12',
      fulfillmentRate: 90,
      shortPicks: 15,
      substitutions: 0
    },
    {
      orderNumber: 'PO-12347',
      sku: 'SKU-003',
      quantityOrdered: 300,
      quantityShipped: 300,
      dateShipped: '2025-06-15',
      fulfillmentRate: 100,
      shortPicks: 0,
      substitutions: 0
    },
    {
      orderNumber: 'PO-12348',
      sku: 'SKU-001',
      quantityOrdered: 250,
      quantityShipped: 200,
      dateShipped: '2025-06-17',
      fulfillmentRate: 80,
      shortPicks: 50,
      substitutions: 0
    },
    {
      orderNumber: 'PO-12349',
      sku: 'SKU-004',
      quantityOrdered: 175,
      quantityShipped: 175,
      dateShipped: '2025-06-18',
      fulfillmentRate: 100,
      shortPicks: 0,
      substitutions: 0
    }
  ];

  // Calculate overall fulfillment rate with proper validation
  const calculateOverallFulfillment = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) return 'N/A';
      
      const totalOrdered = sampleData.reduce((sum, item) => sum + item.quantityOrdered, 0);
      const totalShipped = sampleData.reduce((sum, item) => sum + item.quantityShipped, 0);
      
      if (totalOrdered === 0) return 'N/A';
      return (totalShipped / totalOrdered * 100).toFixed(1);
    } catch (err) {
      console.error('Error calculating overall fulfillment rate:', err);
      return 'N/A';
    }
  };

  // Function to get fulfillment color
  const getFulfillmentColor = (percentage) => {
    if (percentage >= 95) return 'success';
    if (percentage >= 80) return 'warning';
    return 'error';
  };

  const overallFulfillment = calculateOverallFulfillment();
  const totalShortPicks = sampleData.reduce((sum, item) => sum + item.shortPicks, 0);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Overall Order Fulfillment Rate: {overallFulfillment}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={parseFloat(overallFulfillment)} 
          color={getFulfillmentColor(overallFulfillment)}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Total Short Picks: {totalShortPicks} units
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="order fulfillment report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">Order #</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">SKU</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Ordered</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Shipped</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Date Shipped</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Fulfillment Rate</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Short Picks</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.orderNumber}</TableCell>
                <TableCell>{row.sku}</TableCell>
                <TableCell align="right">{row.quantityOrdered}</TableCell>
                <TableCell align="right">{row.quantityShipped}</TableCell>
                <TableCell>{row.dateShipped}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '60%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={row.fulfillmentRate} 
                        color={getFulfillmentColor(row.fulfillmentRate)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {row.fulfillmentRate}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {row.shortPicks > 0 ? (
                    <Chip 
                      label={row.shortPicks} 
                      color="error" 
                      size="small" 
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2">0</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Showing 5 of 5 orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: 1,075 units ordered, 1,010 units shipped
        </Typography>
      </Box>
    </Box>
  );
};

export default OrderFulfillmentReport;
