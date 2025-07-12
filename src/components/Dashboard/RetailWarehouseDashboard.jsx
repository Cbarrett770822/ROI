import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const RetailWarehouseDashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouses');
  const [timeRange, setTimeRange] = useState('12');
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [currentInsights, setCurrentInsights] = useState([]);
  
  // KPI values
  const [inventoryAccuracy, setInventoryAccuracy] = useState('N/A');
  const [orderFulfillmentRate, setOrderFulfillmentRate] = useState('N/A');
  const [pickingAccuracy, setPickingAccuracy] = useState('N/A');
  const [returnProcessingTime, setReturnProcessingTime] = useState('N/A');
  const [crossDockingTime, setCrossDockingTime] = useState('N/A');

  // Extract unique warehouses and filter data when component mounts or data changes
  useEffect(() => {
    if (data && data.length > 0) {
      // Extract unique warehouses
      const uniqueWarehouses = ['All Warehouses', ...new Set(data.map(item => item.Warehouse))];
      setWarehouses(uniqueWarehouses);
      
      // Filter data based on selected warehouse and time range
      filterData(selectedWarehouse, timeRange);
    }
  }, [data]);

  // Filter data when warehouse or time range selection changes
  useEffect(() => {
    filterData(selectedWarehouse, timeRange);
  }, [selectedWarehouse, timeRange, data]);

  // Calculate KPIs based on filtered data
  useEffect(() => {
    if (filteredData.length > 0) {
      // Inventory Accuracy
      const inventoryAccuracyValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Inventory Accuracy (%)']) || 0), 0) / filteredData.length
        : 'N/A';
      setInventoryAccuracy(inventoryAccuracyValue !== 'N/A' ? inventoryAccuracyValue.toFixed(2) : 'N/A');
      
      // Order Fulfillment Rate
      const orderFulfillmentRateValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Order Fulfillment Rate (%)']) || 0), 0) / filteredData.length
        : 'N/A';
      setOrderFulfillmentRate(orderFulfillmentRateValue !== 'N/A' ? orderFulfillmentRateValue.toFixed(2) : 'N/A');
      
      // Picking Accuracy
      const pickingAccuracyValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Picking Accuracy (%)']) || 0), 0) / filteredData.length
        : 'N/A';
      setPickingAccuracy(pickingAccuracyValue !== 'N/A' ? pickingAccuracyValue.toFixed(2) : 'N/A');
      
      // Return Processing Time
      const returnProcessingTimeValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Return Processing Time (hours)']) || 0), 0) / filteredData.length
        : 'N/A';
      setReturnProcessingTime(returnProcessingTimeValue !== 'N/A' ? returnProcessingTimeValue.toFixed(2) : 'N/A');
      
      // Cross Docking Time
      const crossDockingTimeValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Cross Docking Time (hours)']) || 0), 0) / filteredData.length
        : 'N/A';
      setCrossDockingTime(crossDockingTimeValue !== 'N/A' ? crossDockingTimeValue.toFixed(2) : 'N/A');
    }
  }, [filteredData]);

  // Filter data based on warehouse and time range
  const filterData = (warehouse, months) => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    let filtered = [...data];
    
    // Filter by warehouse if not "All Warehouses"
    if (warehouse !== 'All Warehouses') {
      filtered = filtered.filter(item => item.Warehouse === warehouse);
    }
    
    // Filter by time range
    if (months !== 'all') {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(months));
      filtered = filtered.filter(item => new Date(item.Date) >= cutoffDate);
    }
    
    setFilteredData(filtered);
  };

  // Format chart data for different metrics
  const formatChartData = (metric) => {
    if (!data || data.length === 0) {
      return [];
    }

    console.log('Formatting chart data for metric:', metric);
    console.log('Sample data item:', data[0]);

    // Group data by month
    const groupedByMonth = data.reduce((acc, item) => {
      const date = new Date(item.Date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { date: monthYear };
      }
      
      // Add data for this warehouse
      if (item.Warehouse) {
        if (!acc[monthYear][item.Warehouse]) {
          acc[monthYear][item.Warehouse] = 0;
          acc[monthYear][`${item.Warehouse}-count`] = 0;
        }
        
        // Sum the values and count for averaging later
        const value = parseFloat(item[metric]) || 0;
        acc[monthYear][item.Warehouse] += value;
        acc[monthYear][`${item.Warehouse}-count`] += 1;
      }
      
      return acc;
    }, {});
    
    console.log('Grouped by month data:', groupedByMonth);
    
    // Convert to array and calculate averages
    const chartData = Object.values(groupedByMonth).map(monthData => {
      const result = { date: monthData.date };
      
      // Calculate average for each warehouse
      warehouses.forEach(warehouse => {
        if (warehouse !== 'All Warehouses' && monthData[warehouse] !== undefined && monthData[`${warehouse}-count`] > 0) {
          result[warehouse] = monthData[warehouse] / monthData[`${warehouse}-count`];
          // Round to 1 decimal place
          result[warehouse] = parseFloat(result[warehouse].toFixed(1));
        }
      });
      
      return result;
    });
    
    console.log('Final chart data:', chartData);
    return chartData;
  };

  // Format data for radar chart
  const formatRadarData = () => {
    if (!data || data.length === 0 || warehouses.length <= 1) {
      return [];
    }
    
    const metrics = [
      { name: 'Inventory Accuracy', key: 'Inventory Accuracy (%)', max: 100 },
      { name: 'Order Fulfillment', key: 'Order Fulfillment Rate (%)', max: 100 },
      { name: 'Picking Accuracy', key: 'Picking Accuracy (%)', max: 100 },
      { name: 'Return Processing', key: 'Return Processing Time (hours)', max: 24, inverse: true },
      { name: 'Cross Docking', key: 'Cross Docking Time (hours)', max: 12, inverse: true }
    ];
    
    return warehouses
      .filter(warehouse => warehouse !== 'All Warehouses')
      .map(warehouse => {
        const warehouseData = data.filter(item => item.Warehouse === warehouse);
        const result = { Warehouse: warehouse };
        
        metrics.forEach(metric => {
          const values = warehouseData.map(item => parseFloat(item[metric.key]) || 0);
          const avg = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          
          // For time metrics (where lower is better), invert the scale
          if (metric.inverse) {
            // Lower times are better, so invert the scale (100 = best/lowest time, 0 = worst/highest time)
            result[metric.name] = Math.max(0, 100 - ((avg / metric.max) * 100));
          } else {
            // Higher percentages are better
            result[metric.name] = Math.min(100, (avg / metric.max) * 100);
          }
        });
        
        return result;
      });
  };

  // Create table data
  const createTableData = () => {
    if (!data || data.length === 0 || warehouses.length <= 1) {
      return [];
    }
    
    return warehouses
      .filter(warehouse => warehouse !== 'All Warehouses')
      .map(warehouse => {
        const warehouseData = data.filter(item => item.Warehouse === warehouse);
        
        const inventoryAccuracy = warehouseData.length > 0 
          ? warehouseData.reduce((sum, item) => sum + (parseFloat(item['Inventory Accuracy (%)']) || 0), 0) / warehouseData.length
          : 0;
          
        const orderFulfillment = warehouseData.length > 0 
          ? warehouseData.reduce((sum, item) => sum + (parseFloat(item['Order Fulfillment Rate (%)']) || 0), 0) / warehouseData.length
          : 0;
          
        const pickingAccuracy = warehouseData.length > 0 
          ? warehouseData.reduce((sum, item) => sum + (parseFloat(item['Picking Accuracy (%)']) || 0), 0) / warehouseData.length
          : 0;
          
        const returnProcessing = warehouseData.length > 0 
          ? warehouseData.reduce((sum, item) => sum + (parseFloat(item['Return Processing Time (hours)']) || 0), 0) / warehouseData.length
          : 0;
          
        const crossDocking = warehouseData.length > 0 
          ? warehouseData.reduce((sum, item) => sum + (parseFloat(item['Cross Docking Time (hours)']) || 0), 0) / warehouseData.length
          : 0;
        
        return {
          warehouse,
          inventoryAccuracy: inventoryAccuracy.toFixed(2),
          orderFulfillment: orderFulfillment.toFixed(2),
          pickingAccuracy: pickingAccuracy.toFixed(2),
          returnProcessing: returnProcessing.toFixed(2),
          crossDocking: crossDocking.toFixed(2)
        };
      });
  };

  // Generate insights based on the data
  const generateInsights = () => {
    if (!data || data.length === 0) {
      return ['No data available to generate insights.'];
    }

    const insights = [];
    const tableData = createTableData();
    
    // Find best and worst performing warehouses for each KPI
    if (tableData.length > 1) {
      // Inventory Accuracy
      const bestInventoryAccuracy = tableData.reduce((prev, current) => 
        parseFloat(prev.inventoryAccuracy) > parseFloat(current.inventoryAccuracy) ? prev : current);
      const worstInventoryAccuracy = tableData.reduce((prev, current) => 
        parseFloat(prev.inventoryAccuracy) < parseFloat(current.inventoryAccuracy) ? prev : current);
      
      insights.push(`${bestInventoryAccuracy.warehouse} has the highest inventory accuracy at ${bestInventoryAccuracy.inventoryAccuracy}%, which is ${(parseFloat(bestInventoryAccuracy.inventoryAccuracy) - parseFloat(worstInventoryAccuracy.inventoryAccuracy)).toFixed(2)}% higher than ${worstInventoryAccuracy.warehouse}.`);
      
      // Order Fulfillment
      const bestOrderFulfillment = tableData.reduce((prev, current) => 
        parseFloat(prev.orderFulfillment) > parseFloat(current.orderFulfillment) ? prev : current);
      const worstOrderFulfillment = tableData.reduce((prev, current) => 
        parseFloat(prev.orderFulfillment) < parseFloat(current.orderFulfillment) ? prev : current);
      
      insights.push(`${bestOrderFulfillment.warehouse} leads in order fulfillment rate at ${bestOrderFulfillment.orderFulfillment}%, outperforming ${worstOrderFulfillment.warehouse} by ${(parseFloat(bestOrderFulfillment.orderFulfillment) - parseFloat(worstOrderFulfillment.orderFulfillment)).toFixed(2)}%.`);
      
      // Return Processing
      const bestReturnProcessing = tableData.reduce((prev, current) => 
        parseFloat(prev.returnProcessing) < parseFloat(current.returnProcessing) ? prev : current);
      const worstReturnProcessing = tableData.reduce((prev, current) => 
        parseFloat(prev.returnProcessing) > parseFloat(current.returnProcessing) ? prev : current);
      
      insights.push(`${bestReturnProcessing.warehouse} processes returns most efficiently at ${bestReturnProcessing.returnProcessing} hours, which is ${(parseFloat(worstReturnProcessing.returnProcessing) - parseFloat(bestReturnProcessing.returnProcessing)).toFixed(2)} hours faster than ${worstReturnProcessing.warehouse}.`);
    }
    
    // Time-based trends
    if (data.length > 0) {
      // Group data by month for trend analysis
      const monthlyData = {};
      data.forEach(item => {
        const date = new Date(item.Date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            count: 0,
            inventoryAccuracy: 0,
            orderFulfillment: 0,
            pickingAccuracy: 0,
            returnProcessing: 0,
            crossDocking: 0
          };
        }
        
        monthlyData[monthYear].count += 1;
        monthlyData[monthYear].inventoryAccuracy += parseFloat(item['Inventory Accuracy (%)'] || 0);
        monthlyData[monthYear].orderFulfillment += parseFloat(item['Order Fulfillment Rate (%)'] || 0);
        monthlyData[monthYear].pickingAccuracy += parseFloat(item['Picking Accuracy (%)'] || 0);
        monthlyData[monthYear].returnProcessing += parseFloat(item['Return Processing Time (hours)'] || 0);
        monthlyData[monthYear].crossDocking += parseFloat(item['Cross Docking Time (hours)'] || 0);
      });
      
      // Calculate averages and convert to array
      const monthlyAverages = Object.keys(monthlyData).map(month => {
        const monthData = monthlyData[month];
        return {
          month,
          inventoryAccuracy: monthData.inventoryAccuracy / monthData.count,
          orderFulfillment: monthData.orderFulfillment / monthData.count,
          pickingAccuracy: monthData.pickingAccuracy / monthData.count,
          returnProcessing: monthData.returnProcessing / monthData.count,
          crossDocking: monthData.crossDocking / monthData.count
        };
      });
      
      // Sort by month
      monthlyAverages.sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      });
      
      // Analyze trends if we have enough data points
      if (monthlyAverages.length > 2) {
        const firstMonth = monthlyAverages[0];
        const lastMonth = monthlyAverages[monthlyAverages.length - 1];
        
        // Inventory Accuracy trend
        const inventoryAccuracyChange = lastMonth.inventoryAccuracy - firstMonth.inventoryAccuracy;
        if (Math.abs(inventoryAccuracyChange) > 1) {
          insights.push(`Inventory accuracy has ${inventoryAccuracyChange > 0 ? 'improved' : 'declined'} by ${Math.abs(inventoryAccuracyChange).toFixed(2)}% from ${firstMonth.month} to ${lastMonth.month}.`);
        }
        
        // Order Fulfillment trend
        const orderFulfillmentChange = lastMonth.orderFulfillment - firstMonth.orderFulfillment;
        if (Math.abs(orderFulfillmentChange) > 1) {
          insights.push(`Order fulfillment rate has ${orderFulfillmentChange > 0 ? 'improved' : 'declined'} by ${Math.abs(orderFulfillmentChange).toFixed(2)}% over the analyzed period.`);
        }
        
        // Return Processing trend
        const returnProcessingChange = lastMonth.returnProcessing - firstMonth.returnProcessing;
        if (Math.abs(returnProcessingChange) > 0.5) {
          insights.push(`Return processing time has ${returnProcessingChange < 0 ? 'improved' : 'increased'} by ${Math.abs(returnProcessingChange).toFixed(2)} hours since ${firstMonth.month}.`);
        }
      }
    }
    
    // Add recommendations based on insights
    if (tableData.length > 0) {
      const avgInventoryAccuracy = tableData.reduce((sum, item) => sum + parseFloat(item.inventoryAccuracy), 0) / tableData.length;
      const avgOrderFulfillment = tableData.reduce((sum, item) => sum + parseFloat(item.orderFulfillment), 0) / tableData.length;
      const avgPickingAccuracy = tableData.reduce((sum, item) => sum + parseFloat(item.pickingAccuracy), 0) / tableData.length;
      
      if (avgInventoryAccuracy < 95) {
        insights.push('Recommendation: Consider implementing cycle counting programs to improve inventory accuracy across warehouses.');
      }
      
      if (avgOrderFulfillment < 93) {
        insights.push('Recommendation: Review order fulfillment processes and consider implementing pick-to-light systems to improve fulfillment rates.');
      }
      
      if (avgPickingAccuracy < 97) {
        insights.push('Recommendation: Enhance training programs for warehouse staff and implement barcode scanning to reduce picking errors.');
      }
    }
    
    return insights;
  };

  // KPI info text
  const kpiInfo = {
    inventoryAccuracy: "Inventory Accuracy measures the percentage of inventory records that match the actual physical inventory. Higher percentages indicate better inventory management and fewer discrepancies.",
    orderFulfillment: "Order Fulfillment Rate measures the percentage of customer orders that are fulfilled completely and on time. Higher percentages indicate better service levels and customer satisfaction.",
    pickingAccuracy: "Picking Accuracy measures the percentage of items picked correctly from inventory for orders. Higher percentages indicate fewer errors in the order fulfillment process.",
    returnProcessing: "Return Processing Time measures the average time (in hours) it takes to process returned items from receipt to disposition. Lower times indicate more efficient returns management.",
    crossDocking: "Cross Docking Time measures the average time (in hours) it takes to move products from receiving to shipping with minimal storage time. Lower times indicate more efficient product flow."
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {/* Insights Dialog */}
      <Dialog
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
          Warehouse Performance Insights
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {currentInsights.map((insight, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={insight} 
                    primaryTypographyProps={{ 
                      variant: insight.startsWith('Recommendation:') ? 'subtitle1' : 'body1',
                      color: insight.startsWith('Recommendation:') ? 'primary' : 'textPrimary',
                      fontWeight: insight.startsWith('Recommendation:') ? 500 : 400
                    }} 
                  />
                </ListItem>
                {index < currentInsights.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsightsOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: '#1976d2' }}>
        Retail Warehouse Performance Dashboard
      </Typography>
      
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Warehouse</InputLabel>
            <Select
              value={selectedWarehouse}
              label="Warehouse"
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse} value={warehouse}>{warehouse}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3">Last 3 Months</MenuItem>
              <MenuItem value="6">Last 6 Months</MenuItem>
              <MenuItem value="12">Last 12 Months</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Accuracy */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', position: 'relative' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Inventory Accuracy
              <Tooltip title={kpiInfo.inventoryAccuracy} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {inventoryAccuracy}%
            </Typography>
          </Paper>
        </Grid>
        
        {/* Order Fulfillment Rate */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Order Fulfillment Rate
              <Tooltip title={kpiInfo.orderFulfillment} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {orderFulfillmentRate}%
            </Typography>
          </Paper>
        </Grid>
        
        {/* Picking Accuracy */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Picking Accuracy
              <Tooltip title={kpiInfo.pickingAccuracy} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {pickingAccuracy}%
            </Typography>
          </Paper>
        </Grid>
        
        {/* Return Processing Time */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Return Processing Time
              <Tooltip title={kpiInfo.returnProcessing} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {returnProcessingTime} hrs
            </Typography>
          </Paper>
        </Grid>
        
        {/* Cross Docking Time */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Cross Docking Time
              <Tooltip title={kpiInfo.crossDocking} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {crossDockingTime} hrs
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Inventory Accuracy Trend */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Accuracy Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatChartData('Inventory Accuracy (%)')}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 100]} />
                <RechartsTooltip />
                <Legend />
                {warehouses
                  .filter(warehouse => warehouse !== 'All Warehouses')
                  .map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone"
                      dataKey={warehouse}
                      stroke={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      activeDot={{ r: 8 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Order Fulfillment Rate Trend */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Fulfillment Rate Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatChartData('Order Fulfillment Rate (%)')}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 100]} />
                <RechartsTooltip />
                <Legend />
                {warehouses
                  .filter(warehouse => warehouse !== 'All Warehouses')
                  .map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone"
                      dataKey={warehouse}
                      stroke={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      activeDot={{ r: 8 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Warehouse Performance Comparison */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={formatRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {warehouses
                  .filter(warehouse => warehouse !== 'All Warehouses')
                  .map((warehouse, index) => (
                    <Radar 
                      key={warehouse}
                      name={warehouse}
                      dataKey={warehouse}
                      stroke={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      fill={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      fillOpacity={0.6}
                    />
                  ))
                }
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Return Processing Time Trend */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Return Processing Time Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatChartData('Return Processing Time (hours)')}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {warehouses
                  .filter(warehouse => warehouse !== 'All Warehouses')
                  .map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone"
                      dataKey={warehouse}
                      stroke={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      activeDot={{ r: 8 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Warehouse Performance Table */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Warehouse Performance Summary
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<InfoIcon />}
                onClick={() => {
                  const insights = generateInsights();
                  setInsightsOpen(true);
                  setCurrentInsights(insights);
                }}
              >
                View Insights
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Warehouse</TableCell>
                    <TableCell align="right">Inventory Accuracy (%)</TableCell>
                    <TableCell align="right">Order Fulfillment (%)</TableCell>
                    <TableCell align="right">Picking Accuracy (%)</TableCell>
                    <TableCell align="right">Return Processing (hrs)</TableCell>
                    <TableCell align="right">Cross Docking (hrs)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {createTableData().map((row) => (
                    <TableRow key={row.warehouse}>
                      <TableCell component="th" scope="row">
                        {row.warehouse}
                      </TableCell>
                      <TableCell align="right">{row.inventoryAccuracy}</TableCell>
                      <TableCell align="right">{row.orderFulfillment}</TableCell>
                      <TableCell align="right">{row.pickingAccuracy}</TableCell>
                      <TableCell align="right">{row.returnProcessing}</TableCell>
                      <TableCell align="right">{row.crossDocking}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetailWarehouseDashboard;
