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
 * Shipping to Vita Coco Report
 * Shows: What was shipped to Vita Coco (or their 3PLs/DCs).
 * 
 * Fields:
 * - ASN #
 * - Shipment date
 * - Ship-to location
 * - SKU / Quantity / Lot #
 * - Carrier info (optional)
 * - WMS shipment status
 */
const ShippingReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data
  const sampleData = [
    {
      asnNumber: 'ASN-78901',
      shipmentDate: '2025-06-10',
      shipToLocation: 'Vita Coco DC - New York',
      items: [
        { sku: 'SKU-001', quantity: 200, lotNumber: 'LOT-A12345' },
        { sku: 'SKU-002', quantity: 150, lotNumber: 'LOT-B67890' }
      ],
      carrier: 'Express Logistics',
      status: 'Delivered'
    },
    {
      asnNumber: 'ASN-78902',
      shipmentDate: '2025-06-12',
      shipToLocation: 'Vita Coco 3PL - Miami',
      items: [
        { sku: 'SKU-003', quantity: 300, lotNumber: 'LOT-C24680' }
      ],
      carrier: 'Southern Transport',
      status: 'In Transit'
    },
    {
      asnNumber: 'ASN-78903',
      shipmentDate: '2025-06-15',
      shipToLocation: 'Vita Coco DC - Los Angeles',
      items: [
        { sku: 'SKU-001', quantity: 250, lotNumber: 'LOT-A12346' },
        { sku: 'SKU-004', quantity: 175, lotNumber: 'LOT-D13579' }
      ],
      carrier: 'West Coast Shipping',
      status: 'Delivered'
    },
    {
      asnNumber: 'ASN-78904',
      shipmentDate: '2025-06-18',
      shipToLocation: 'Vita Coco 3PL - Chicago',
      items: [
        { sku: 'SKU-002', quantity: 225, lotNumber: 'LOT-B67891' },
        { sku: 'SKU-003', quantity: 180, lotNumber: 'LOT-C24681' }
      ],
      carrier: 'Midwest Logistics',
      status: 'Scheduled'
    }
  ];

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'In Transit':
        return 'primary';
      case 'Scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="shipping report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">ASN #</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Shipment Date</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Ship-to Location</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">SKU / Quantity / Lot #</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Carrier</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row) => (
              <TableRow key={row.asnNumber} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.asnNumber}</TableCell>
                <TableCell>{row.shipmentDate}</TableCell>
                <TableCell>{row.shipToLocation}</TableCell>
                <TableCell>
                  {row.items.map((item, idx) => (
                    <Box key={idx} sx={{ mb: idx !== row.items.length - 1 ? 1 : 0 }}>
                      <Typography variant="body2">
                        {item.sku} - {item.quantity} units - {item.lotNumber}
                      </Typography>
                    </Box>
                  ))}
                </TableCell>
                <TableCell>{row.carrier}</TableCell>
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
          Showing 4 of 4 shipments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: 1,480 units across 7 SKU/lot combinations
        </Typography>
      </Box>
    </Box>
  );
};

export default ShippingReport;
