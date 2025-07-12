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
  TableRow
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
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const RetailDashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [timeRange, setTimeRange] = useState('12');
  
  // KPI values
  const [salesPerSqFt, setSalesPerSqFt] = useState('N/A');
  const [inventoryTurnover, setInventoryTurnover] = useState('N/A');
  const [customerConversion, setCustomerConversion] = useState('N/A');
  const [averageTransactionValue, setAverageTransactionValue] = useState('N/A');
  const [stockoutRate, setStockoutRate] = useState('N/A');

  // Extract unique stores and filter data when component mounts or data changes
  useEffect(() => {
    if (data && data.length > 0) {
      // Extract unique stores
      const uniqueStores = ['All Stores', ...new Set(data.map(item => item.Store))];
      setStores(uniqueStores);
      
      // Filter data based on selected store and time range
      filterData(selectedStore, timeRange);
    }
  }, [data]);

  // Filter data when store or time range selection changes
  useEffect(() => {
    filterData(selectedStore, timeRange);
  }, [selectedStore, timeRange, data]);

  // Calculate KPIs based on filtered data
  useEffect(() => {
    if (filteredData.length > 0) {
      // Sales per Square Foot
      const salesPerSqFtValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Sales per Square Foot ($)']) || 0), 0) / filteredData.length
        : 'N/A';
      setSalesPerSqFt(salesPerSqFtValue !== 'N/A' ? salesPerSqFtValue.toFixed(2) : 'N/A');
      
      // Inventory Turnover
      const inventoryTurnoverValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Inventory Turnover (turns)']) || 0), 0) / filteredData.length
        : 'N/A';
      setInventoryTurnover(inventoryTurnoverValue !== 'N/A' ? inventoryTurnoverValue.toFixed(2) : 'N/A');
      
      // Customer Conversion Rate
      const customerConversionValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Customer Conversion Rate (%)']) || 0), 0) / filteredData.length
        : 'N/A';
      setCustomerConversion(customerConversionValue !== 'N/A' ? customerConversionValue.toFixed(2) : 'N/A');
      
      // Average Transaction Value
      const avgTransactionValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Average Transaction Value ($)']) || 0), 0) / filteredData.length
        : 'N/A';
      setAverageTransactionValue(avgTransactionValue !== 'N/A' ? avgTransactionValue.toFixed(2) : 'N/A');
      
      // Stockout Rate
      const stockoutRateValue = filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Stockout Rate (%)']) || 0), 0) / filteredData.length
        : 'N/A';
      setStockoutRate(stockoutRateValue !== 'N/A' ? stockoutRateValue.toFixed(2) : 'N/A');
    }
  }, [filteredData]);

  // Filter data based on store and time range
  const filterData = (store, months) => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    let filtered = [...data];
    
    // Filter by store if not "All Stores"
    if (store !== 'All Stores') {
      filtered = filtered.filter(item => item.Store === store);
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
      
      // Add data for this store
      if (item.Store) {
        if (!acc[monthYear][item.Store]) {
          acc[monthYear][item.Store] = 0;
          acc[monthYear][`${item.Store}-count`] = 0;
        }
        
        // Sum the values and count for averaging later
        const value = parseFloat(item[metric]) || 0;
        acc[monthYear][item.Store] += value;
        acc[monthYear][`${item.Store}-count`] += 1;
      }
      
      return acc;
    }, {});
    
    console.log('Grouped by month data:', groupedByMonth);
    
    // Convert to array and calculate averages
    const chartData = Object.values(groupedByMonth).map(monthData => {
      const result = { date: monthData.date };
      
      // Calculate average for each store
      stores.forEach(store => {
        if (store !== 'All Stores' && monthData[store] !== undefined && monthData[`${store}-count`] > 0) {
          result[store] = monthData[store] / monthData[`${store}-count`];
          // Round to 1 decimal place
          result[store] = parseFloat(result[store].toFixed(1));
        }
      });
      
      return result;
    });
    
    console.log('Final chart data:', chartData);
    return chartData;
  };

  // Format data for radar chart
  const formatRadarData = () => {
    if (!data || data.length === 0 || stores.length <= 1) {
      return [];
    }
    
    const metrics = [
      { name: 'Sales/SqFt', key: 'Sales per Square Foot ($)', max: 1000 },
      { name: 'Inventory Turnover', key: 'Inventory Turnover (turns)', max: 15 },
      { name: 'Conversion Rate', key: 'Customer Conversion Rate (%)', max: 100 },
      { name: 'Avg Transaction', key: 'Average Transaction Value ($)', max: 200 },
      { name: 'Stockout Rate', key: 'Stockout Rate (%)', max: 10 }
    ];
    
    return stores
      .filter(store => store !== 'All Stores')
      .map(store => {
        const storeData = data.filter(item => item.Store === store);
        const result = { Store: store };
        
        metrics.forEach(metric => {
          const values = storeData.map(item => parseFloat(item[metric.key]) || 0);
          const avg = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          // Normalize value between 0-100 for radar chart
          result[metric.name] = Math.min(100, (avg / metric.max) * 100);
        });
        
        return result;
      });
  };

  // Create table data
  const createTableData = () => {
    if (!data || data.length === 0 || stores.length <= 1) {
      return [];
    }
    
    return stores
      .filter(store => store !== 'All Stores')
      .map(store => {
        const storeData = data.filter(item => item.Store === store);
        
        const salesPerSqFt = storeData.length > 0 
          ? storeData.reduce((sum, item) => sum + (parseFloat(item['Sales per Square Foot ($)']) || 0), 0) / storeData.length
          : 0;
          
        const inventoryTurnover = storeData.length > 0 
          ? storeData.reduce((sum, item) => sum + (parseFloat(item['Inventory Turnover (turns)']) || 0), 0) / storeData.length
          : 0;
          
        const customerConversion = storeData.length > 0 
          ? storeData.reduce((sum, item) => sum + (parseFloat(item['Customer Conversion Rate (%)']) || 0), 0) / storeData.length
          : 0;
          
        const avgTransaction = storeData.length > 0 
          ? storeData.reduce((sum, item) => sum + (parseFloat(item['Average Transaction Value ($)']) || 0), 0) / storeData.length
          : 0;
          
        const stockoutRate = storeData.length > 0 
          ? storeData.reduce((sum, item) => sum + (parseFloat(item['Stockout Rate (%)']) || 0), 0) / storeData.length
          : 0;
        
        return {
          store,
          salesPerSqFt: salesPerSqFt.toFixed(2),
          inventoryTurnover: inventoryTurnover.toFixed(2),
          customerConversion: customerConversion.toFixed(2),
          avgTransaction: avgTransaction.toFixed(2),
          stockoutRate: stockoutRate.toFixed(2)
        };
      });
  };

  // KPI info text
  const kpiInfo = {
    salesPerSqFt: "Sales per Square Foot measures the average revenue generated for every square foot of retail space. Higher values indicate more efficient use of retail space.",
    inventoryTurnover: "Inventory Turnover measures how many times inventory is sold and replaced over a period. Higher turnover indicates efficient inventory management.",
    customerConversion: "Customer Conversion Rate is the percentage of store visitors who make a purchase. Higher rates indicate effective merchandising and sales strategies.",
    averageTransactionValue: "Average Transaction Value is the average amount spent per transaction. Higher values indicate successful upselling and cross-selling.",
    stockoutRate: "Stockout Rate is the percentage of time items are out of stock. Lower rates indicate better inventory management and availability."
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: '#1976d2' }}>
        Retail Performance Dashboard
      </Typography>
      
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Store</InputLabel>
            <Select
              value={selectedStore}
              label="Store"
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {stores.map((store) => (
                <MenuItem key={store} value={store}>{store}</MenuItem>
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
        {/* Sales per Square Foot */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', position: 'relative' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Sales per Square Foot
              <Tooltip title={kpiInfo.salesPerSqFt} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              ${salesPerSqFt}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Inventory Turnover */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Inventory Turnover
              <Tooltip title={kpiInfo.inventoryTurnover} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {inventoryTurnover} turns
            </Typography>
          </Paper>
        </Grid>
        
        {/* Customer Conversion Rate */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Customer Conversion
              <Tooltip title={kpiInfo.customerConversion} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {customerConversion}%
            </Typography>
          </Paper>
        </Grid>
        
        {/* Average Transaction Value */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Avg Transaction Value
              <Tooltip title={kpiInfo.averageTransactionValue} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              ${averageTransactionValue}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Stockout Rate */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Stockout Rate
              <Tooltip title={kpiInfo.stockoutRate} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
              {stockoutRate}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales per Square Foot Trend */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales per Square Foot Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatChartData('Sales per Square Foot ($)')}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {stores
                  .filter(store => store !== 'All Stores')
                  .map((store, index) => (
                    <Line 
                      key={store}
                      type="monotone"
                      dataKey={store}
                      stroke={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      activeDot={{ r: 8 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Customer Conversion Rate Trend */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Conversion Rate Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatChartData('Customer Conversion Rate (%)')}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {stores
                  .filter(store => store !== 'All Stores')
                  .map((store, index) => (
                    <Line 
                      key={store}
                      type="monotone"
                      dataKey={store}
                      stroke={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                      activeDot={{ r: 8 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Store Performance Comparison */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Store Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={formatRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {stores
                  .filter(store => store !== 'All Stores')
                  .map((store, index) => (
                    <Radar 
                      key={store}
                      name={store}
                      dataKey={store}
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
        
        {/* Average Transaction Value by Store */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Transaction Value by Store
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={formatChartData('Average Transaction Value ($)')}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {stores
                  .filter(store => store !== 'All Stores')
                  .map((store, index) => (
                    <Bar 
                      key={store}
                      dataKey={store}
                      fill={['#1976d2', '#00acc1', '#ff9800', '#f44336', '#4caf50'][index % 5]}
                    />
                  ))
                }
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Store Performance Table */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Store Performance Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Store</TableCell>
                    <TableCell align="right">Sales/SqFt ($)</TableCell>
                    <TableCell align="right">Inventory Turnover</TableCell>
                    <TableCell align="right">Conversion Rate (%)</TableCell>
                    <TableCell align="right">Avg Transaction ($)</TableCell>
                    <TableCell align="right">Stockout Rate (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {createTableData().map((row) => (
                    <TableRow key={row.store}>
                      <TableCell component="th" scope="row">
                        {row.store}
                      </TableCell>
                      <TableCell align="right">{row.salesPerSqFt}</TableCell>
                      <TableCell align="right">{row.inventoryTurnover}</TableCell>
                      <TableCell align="right">{row.customerConversion}</TableCell>
                      <TableCell align="right">{row.avgTransaction}</TableCell>
                      <TableCell align="right">{row.stockoutRate}</TableCell>
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

export default RetailDashboard;
