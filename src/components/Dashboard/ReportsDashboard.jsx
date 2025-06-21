import React, { useState, useMemo, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, subMonths } from 'date-fns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';

// Import export utilities
import { exportToExcel, printReport } from '../../utils/exportUtils';

// Report components
import InboundProductionReport from '../Reports/InboundProductionReport';
import ShippingReport from '../Reports/ShippingReport';
import DockToStockReport from '../Reports/DockToStockReport';
import InventorySnapshotReport from '../Reports/InventorySnapshotReport';
import FEFOComplianceReport from '../Reports/FEFOComplianceReport';
import NonConformanceReport from '../Reports/NonConformanceReport';
import OrderFulfillmentReport from '../Reports/OrderFulfillmentReport';
import BatchTraceabilityReport from '../Reports/BatchTraceabilityReport';
import HoldQuarantineReport from '../Reports/HoldQuarantineReport';
import ProductionPlanningReport from '../Reports/ProductionPlanningReport';
import SupplierQualityReport from '../Reports/SupplierQualityReport';

const ReportsDashboard = ({ data }) => {
  // State for filters
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedReport, setSelectedReport] = useState(0);

  // Sample suppliers - in a real app, these would come from the data
  const suppliers = useMemo(() => {
    const uniqueSuppliers = new Set();
    
    // Extract suppliers from data if available
    if (data && data.SupplierPerformance && Array.isArray(data.SupplierPerformance)) {
      data.SupplierPerformance.forEach(item => {
        if (item.Supplier) {
          uniqueSuppliers.add(item.Supplier);
        }
      });
    }
    
    // If no suppliers found in data, add some defaults
    if (uniqueSuppliers.size === 0) {
      ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E'].forEach(
        supplier => uniqueSuppliers.add(supplier)
      );
    }
    
    return Array.from(uniqueSuppliers);
  }, [data]);

  // Report definitions
  const reports = [
    { 
      id: 'inbound-production', 
      name: 'Inbound Production Completion', 
      description: 'What was received into the WMS from production lines, per SKU, lot, and date',
      component: InboundProductionReport
    },
    { 
      id: 'shipping', 
      name: 'Shipping to Vita Coco', 
      description: 'What was shipped to Vita Coco (or their 3PLs/DCs)',
      component: ShippingReport
    },
    { 
      id: 'dock-to-stock', 
      name: 'Dock-to-Stock Time', 
      description: 'How quickly suppliers move finished goods into their own stock',
      component: DockToStockReport
    },
    { 
      id: 'inventory-snapshot', 
      name: 'Inventory Snapshot by Batch & Age', 
      description: 'Real-time or daily snapshot of inventory levels',
      component: InventorySnapshotReport
    },
    { 
      id: 'fefo-compliance', 
      name: 'FEFO Compliance', 
      description: 'Whether products are being picked and shipped according to First Expire, First Out',
      component: FEFOComplianceReport
    },
    { 
      id: 'non-conformance', 
      name: 'Return-to-Supplier / Non-Conformance', 
      description: 'Goods that were returned, blocked, or failed receiving at the supplier site',
      component: NonConformanceReport
    },
    { 
      id: 'order-fulfillment', 
      name: 'Order Fulfillment', 
      description: 'How well the supplier fulfilled Vita Coco\'s outbound orders',
      component: OrderFulfillmentReport
    },
    { 
      id: 'batch-traceability', 
      name: 'Batch Traceability', 
      description: 'Full chain of custody within the warehouse',
      component: BatchTraceabilityReport
    },
    { 
      id: 'hold-quarantine', 
      name: 'Hold & Quarantine', 
      description: 'Any inventory currently blocked due to quality, label, or process issues',
      component: HoldQuarantineReport
    },
    { 
      id: 'production-planning', 
      name: 'Production Planning', 
      description: 'Production planning vs. actual execution',
      component: ProductionPlanningReport
    },
    { 
      id: 'supplier-quality', 
      name: 'Supplier Quality', 
      description: 'Quality metrics for supplier performance',
      component: SupplierQualityReport
    }
  ];

  // Handle tab change
  const handleReportChange = (event, newValue) => {
    setSelectedReport(newValue);
  };
  
  // Reference to the current report component
  const currentReportRef = useRef(null);
  
  // Handle export button click
  const handleExport = () => {
    const currentReport = reports[selectedReport];
    
    // Get the data from the current report component if available
    if (currentReportRef.current && currentReportRef.current.getReportData) {
      const reportData = currentReportRef.current.getReportData();
      const columns = currentReportRef.current.getReportColumns ? 
        currentReportRef.current.getReportColumns() : null;
      
      if (exportToExcel(reportData, currentReport.name, columns)) {
        alert(`${currentReport.name} exported successfully!`);
      } else {
        alert('Failed to export report. Please check console for errors.');
      }
    } else {
      // Fallback to sample data if the component doesn't implement getReportData
      let reportData = [];
      
      // Use appropriate data based on the selected report
      switch (currentReport.id) {
        case 'inventory-snapshot':
          reportData = data?.InventorySnapshot || [];
          break;
        case 'dock-to-stock':
          reportData = data?.DockToStock || [];
          break;
        case 'fefo-compliance':
          reportData = data?.FEFOCompliance || [];
          break;
        case 'non-conformance':
          reportData = data?.NonConformance || [];
          break;
        case 'order-fulfillment':
          reportData = data?.OrderFulfillment || [];
          break;
        case 'batch-traceability':
          reportData = data?.BatchTraceability || [];
          break;
        case 'hold-quarantine':
          reportData = data?.HoldQuarantine || [];
          break;
        case 'production-planning':
          reportData = data?.ProductionPlanning || [];
          break;
        case 'supplier-quality':
          reportData = data?.SupplierQuality || [];
          break;
        default:
          reportData = [];
      }
      
      if (exportToExcel(reportData, currentReport.name)) {
        alert(`${currentReport.name} exported successfully!`);
      } else {
        alert('No data available to export. Please upload data first.');
      }
    }
  };
  
  // Handle print button click
  const handlePrint = () => {
    const currentReport = reports[selectedReport];
    
    // Get the data from the current report component if available
    if (currentReportRef.current && currentReportRef.current.getReportData) {
      const reportData = currentReportRef.current.getReportData();
      const columns = currentReportRef.current.getReportColumns ? 
        currentReportRef.current.getReportColumns() : null;
      
      if (printReport(reportData, currentReport.name, columns)) {
        // Print window will be opened by the printReport function
      } else {
        alert('Failed to prepare report for printing. Please check console for errors.');
      }
    } else {
      // Fallback to sample data if the component doesn't implement getReportData
      let reportData = [];
      
      // Use appropriate data based on the selected report
      switch (currentReport.id) {
        case 'inventory-snapshot':
          reportData = data?.InventorySnapshot || [];
          break;
        case 'dock-to-stock':
          reportData = data?.DockToStock || [];
          break;
        case 'fefo-compliance':
          reportData = data?.FEFOCompliance || [];
          break;
        case 'non-conformance':
          reportData = data?.NonConformance || [];
          break;
        case 'order-fulfillment':
          reportData = data?.OrderFulfillment || [];
          break;
        case 'batch-traceability':
          reportData = data?.BatchTraceability || [];
          break;
        case 'hold-quarantine':
          reportData = data?.HoldQuarantine || [];
          break;
        case 'production-planning':
          reportData = data?.ProductionPlanning || [];
          break;
        case 'supplier-quality':
          reportData = data?.SupplierQuality || [];
          break;
        default:
          reportData = [];
      }
      
      if (printReport(reportData, currentReport.name)) {
        // Print window will be opened by the printReport function
      } else {
        alert('No data available to print. Please upload data first.');
      }
    }
  };

  // Format the selected month for display
  const formattedMonth = format(selectedMonth, 'MMMM yyyy');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Supply Chain Reports
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterListIcon color="primary" />
          <Typography variant="h6">Filters</Typography>
        </Stack>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="supplier-select-label">Supplier</InputLabel>
              <Select
                labelId="supplier-select-label"
                id="supplier-select"
                value={selectedSupplier}
                label="Supplier"
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <MenuItem value="all">All Suppliers</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Month"
                views={['year', 'month']}
                value={selectedMonth}
                onChange={(newValue) => setSelectedMonth(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Report Selection Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedReport} 
          onChange={handleReportChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="report tabs"
        >
          {reports.map((report, index) => (
            <Tab key={report.id} label={report.name} id={`report-tab-${index}`} />
          ))}
        </Tabs>
      </Box>
      
      {/* Report Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5">{reports[selectedReport].name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {reports[selectedReport].description}
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip 
              label={selectedSupplier === 'all' ? 'All Suppliers' : selectedSupplier} 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={formattedMonth} 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
          </Stack>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          {/* This is where the actual report component will render */}
          {/* For now, we'll just show a placeholder message */}
          <Typography variant="body1" sx={{ mb: 2 }}>
            Showing {reports[selectedReport].name} for {selectedSupplier === 'all' ? 'All Suppliers' : selectedSupplier} in {formattedMonth}
          </Typography>
          
          {/* Placeholder for actual report content */}
          {/* Render the actual report component */}
          {React.createElement(reports[selectedReport].component, {
            supplier: selectedSupplier,
            month: selectedMonth,
            data: data,
            ref: currentReportRef
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsDashboard;
