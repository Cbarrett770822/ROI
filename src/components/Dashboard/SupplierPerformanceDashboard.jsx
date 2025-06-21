import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import KPICard from '../KPICards/KPICard';

const SupplierPerformanceDashboard = ({ data = [] }) => {
  const [filters, setFilters] = useState({
    supplier: 'all',
    timeRange: 'all'
  });
  
  const [filteredData, setFilteredData] = useState([]);
  const [kpiValues, setKpiValues] = useState({
    orderAccuracy: 'N/A',
    damageRate: 'N/A',
    responseTime: 'N/A',
    inventoryTurns: 'N/A'
  });
  
  // Get unique suppliers from data
  const suppliers = [...new Set(data.map(item => item.Supplier))];
  
  // Apply filters to data
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    // Apply supplier filter
    if (filters.supplier !== 'all') {
      filtered = filtered.filter(item => item.Supplier === filters.supplier);
    }
    
    // Apply time range filter
    if (filters.timeRange !== 'all') {
      const months = parseInt(filters.timeRange);
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.Date);
        return itemDate >= cutoffDate;
      });
    }
    
    // Sort by date
    filtered.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    
    setFilteredData(filtered);
  }, [data, filters]);
  
  // Calculate KPI values from filtered data
  useEffect(() => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      setKpiValues({
        orderAccuracy: 'N/A',
        damageRate: 'N/A',
        responseTime: 'N/A',
        inventoryTurns: 'N/A'
      });
      return;
    }
    
    try {
      // Calculate average values
      const orderAccuracy = filteredData.reduce((sum, item) => sum + item['Order Accuracy (%)'], 0) / filteredData.length;
      const damageRate = filteredData.reduce((sum, item) => sum + item['Damage Rate (%)'], 0) / filteredData.length;
      const responseTime = filteredData.reduce((sum, item) => sum + item['Response Time (hours)'], 0) / filteredData.length;
      const inventoryTurns = filteredData.reduce((sum, item) => sum + item['Inventory Turns'], 0) / filteredData.length;
      
      // Calculate trends (compare last month to previous month)
      const sortedData = [...filteredData].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      let accuracyTrend = null;
      let accuracyTrendDirection = null;
      
      if (sortedData.length >= 2) {
        const latestMonth = sortedData[0];
        const previousMonth = sortedData[1];
        
        const accuracyChange = latestMonth['Order Accuracy (%)'] - previousMonth['Order Accuracy (%)'];
        accuracyTrend = `${Math.abs(accuracyChange).toFixed(1)}% vs previous`;
        accuracyTrendDirection = accuracyChange >= 0 ? 'up' : 'down';
      }
      
      setKpiValues({
        orderAccuracy,
        damageRate,
        responseTime,
        inventoryTurns,
        accuracyTrend,
        accuracyTrendDirection
      });
    } catch (error) {
      console.error('Error calculating KPI values:', error);
    }
  }, [filteredData]);
  
  // Format data for charts
  const formatChartData = (dataKey) => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Group by date and supplier
    const groupedData = filteredData.reduce((acc, item) => {
      const date = item.Date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.Supplier] = item[dataKey];
      return acc;
    }, {});
    
    // Convert to array format for Recharts
    return Object.keys(groupedData).map(date => {
      const entry = { date };
      suppliers.forEach(supplier => {
        entry[supplier] = groupedData[date][supplier] || 0;
      });
      return entry;
    });
  };
  
  // Format data for supplier scorecard
  const formatSupplierScorecard = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Get the most recent data point for each supplier
    const latestDataBySupplier = {};
    
    filteredData.forEach(item => {
      const supplier = item.Supplier;
      const date = new Date(item.Date);
      
      if (!latestDataBySupplier[supplier] || date > new Date(latestDataBySupplier[supplier].Date)) {
        latestDataBySupplier[supplier] = item;
      }
    });
    
    // Convert to array and calculate overall score
    return Object.values(latestDataBySupplier).map(item => {
      // Calculate overall score (weighted average)
      const accuracyScore = item['Order Accuracy (%)'] / 100 * 5; // 0-5 scale
      const damageScore = (100 - item['Damage Rate (%)'] * 20) / 100 * 5; // 0-5 scale (lower is better)
      const responseScore = (24 - Math.min(item['Response Time (hours)'], 24)) / 24 * 5; // 0-5 scale (lower is better)
      const inventoryScore = Math.min(item['Inventory Turns'] / 20, 1) * 5; // 0-5 scale (higher is better)
      
      const overallScore = (accuracyScore + damageScore + responseScore + inventoryScore) / 4;
      
      return {
        ...item,
        overallScore
      };
    }).sort((a, b) => b.overallScore - a.overallScore); // Sort by overall score (highest first)
  };
  
  // Format data for composite chart
  const formatCompositeData = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Filter to only show data for the selected supplier
    let chartData = filteredData;
    
    if (filters.supplier !== 'all') {
      chartData = chartData.filter(item => item.Supplier === filters.supplier);
    } else if (suppliers.length > 0) {
      // If no supplier is selected, use the first one
      chartData = chartData.filter(item => item.Supplier === suppliers[0]);
    }
    
    // Sort by date
    chartData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    
    // Format for chart
    return chartData.map(item => ({
      date: item.Date,
      accuracy: item['Order Accuracy (%)'],
      damage: item['Damage Rate (%)'],
      response: item['Response Time (hours)'],
      inventory: item['Inventory Turns']
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Supplier Performance Scorecard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Key performance indicators for supplier evaluation and management.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                name="supplier"
                value={filters.supplier}
                label="Supplier"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Suppliers</MenuItem>
                {suppliers.map(supplier => (
                  <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                name="timeRange"
                value={filters.timeRange}
                label="Time Range"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="3">Last 3 Months</MenuItem>
                <MenuItem value="6">Last 6 Months</MenuItem>
                <MenuItem value="12">Last 12 Months</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Order Accuracy"
            value={kpiValues.orderAccuracy === 'N/A' ? 'N/A' : kpiValues.orderAccuracy}
            unit="%"
            trend={kpiValues.accuracyTrend}
            trendDirection={kpiValues.accuracyTrendDirection}
            description="Percentage of POs fulfilled without substitutions or errors"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Order Accuracy (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  {suppliers.map((supplier, index) => (
                    <Line 
                      key={supplier}
                      type="monotone" 
                      dataKey={supplier} 
                      stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Damage Rate on Inbound"
            value={kpiValues.damageRate === 'N/A' ? 'N/A' : kpiValues.damageRate}
            unit="%"
            description="Percentage of units arriving with packaging or product damage"
            color="#d32f2f"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Damage Rate (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {suppliers.map((supplier, index) => (
                    <Bar 
                      key={supplier}
                      dataKey={supplier} 
                      fill={`hsl(${0 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Communication Responsiveness"
            value={kpiValues.responseTime === 'N/A' ? 'N/A' : Math.round(kpiValues.responseTime * 10) / 10}
            unit="hours"
            description="Time taken to acknowledge/respond to order changes"
            color="#ed6c02"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Response Time (hours)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {suppliers.map((supplier, index) => (
                    <Line 
                      key={supplier}
                      type="monotone" 
                      dataKey={supplier} 
                      stroke={`hsl(${30 + index * 30}, 70%, 50%)`} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Inventory Carrying Efficiency"
            value={kpiValues.inventoryTurns === 'N/A' ? 'N/A' : Math.round(kpiValues.inventoryTurns * 10) / 10}
            unit="turns"
            description="Inventory turns and stockout risk by supplier"
            color="#2e7d32"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Inventory Turns')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {suppliers.map((supplier, index) => (
                    <Bar 
                      key={supplier}
                      dataKey={supplier} 
                      fill={`hsl(${120 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Supplier Performance Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {filters.supplier !== 'all' 
                ? `Performance metrics over time for ${filters.supplier}`
                : 'Select a supplier to view detailed performance trends'}
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={formatCompositeData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="accuracy" 
                  name="Order Accuracy (%)" 
                  fill="#8884d8" 
                  stroke="#8884d8"
                  fillOpacity={0.3}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="damage" 
                  name="Damage Rate (%)" 
                  fill="#d32f2f" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="response" 
                  name="Response Time (hours)" 
                  stroke="#ff7300" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="inventory" 
                  name="Inventory Turns" 
                  stroke="#2e7d32" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Supplier Scorecard Ranking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Overall performance rating of suppliers based on key metrics
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="center">Order Accuracy</TableCell>
                    <TableCell align="center">Damage Rate</TableCell>
                    <TableCell align="center">Response Time</TableCell>
                    <TableCell align="center">Overall Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formatSupplierScorecard().map((row, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        backgroundColor: filters.supplier === row.Supplier ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {row.Supplier}
                      </TableCell>
                      <TableCell align="center">{row['Order Accuracy (%)']}%</TableCell>
                      <TableCell align="center">{row['Damage Rate (%)']}%</TableCell>
                      <TableCell align="center">{row['Response Time (hours)']}h</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Rating 
                            value={row.overallScore} 
                            precision={0.5} 
                            readOnly 
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({row.overallScore.toFixed(1)})
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {formatSupplierScorecard().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No supplier data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierPerformanceDashboard;
