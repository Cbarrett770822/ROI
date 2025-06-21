import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
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
  ResponsiveContainer 
} from 'recharts';
import KPICard from '../KPICards/KPICard';

const OEMManufacturingDashboard = ({ data = [] }) => {
  const [filters, setFilters] = useState({
    oem: 'all',
    timeRange: 'all'
  });
  
  const [filteredData, setFilteredData] = useState([]);
  const [kpiValues, setKpiValues] = useState({
    supplierOTIF: 'N/A',
    productionThroughput: 'N/A',
    yieldLoss: 'N/A',
    cycleTime: 'N/A',
    changeoverTime: 'N/A'
  });
  
  // Get unique OEMs from data
  const oems = [...new Set(data.map(item => item.OEM))];
  
  // Apply filters to data
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    // Apply OEM filter
    if (filters.oem !== 'all') {
      filtered = filtered.filter(item => item.OEM === filters.oem);
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
        supplierOTIF: 'N/A',
        productionThroughput: 'N/A',
        yieldLoss: 'N/A',
        cycleTime: 'N/A',
        changeoverTime: 'N/A'
      });
      return;
    }
    
    try {
      // Calculate average values
      const supplierOTIF = filteredData.reduce((sum, item) => sum + item['Supplier OTIF (%)'], 0) / filteredData.length;
      const productionThroughput = filteredData.reduce((sum, item) => sum + item['Production Throughput (units/hour)'], 0) / filteredData.length;
      const yieldLoss = filteredData.reduce((sum, item) => sum + item['Yield Loss (%)'], 0) / filteredData.length;
      const cycleTime = filteredData.reduce((sum, item) => sum + item['Manufacturing Cycle Time (hours)'], 0) / filteredData.length;
      const changeoverTime = filteredData.reduce((sum, item) => sum + item['Changeover Time (minutes)'], 0) / filteredData.length;
      
      // Calculate trends (compare last month to previous month)
      const sortedData = [...filteredData].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      let otifTrend = null;
      let otifTrendDirection = null;
      
      if (sortedData.length >= 2) {
        const latestMonth = sortedData[0];
        const previousMonth = sortedData[1];
        
        const otifDiff = latestMonth['Supplier OTIF (%)'] - previousMonth['Supplier OTIF (%)'];
        otifTrend = `${Math.abs(otifDiff).toFixed(1)}% vs previous`;
        otifTrendDirection = otifDiff >= 0 ? 'up' : 'down';
      }
      
      setKpiValues({
        supplierOTIF,
        productionThroughput,
        yieldLoss,
        cycleTime,
        changeoverTime,
        otifTrend,
        otifTrendDirection
      });
    } catch (error) {
      console.error('Error calculating KPI values:', error);
    }
  }, [filteredData]);
  
  // Format data for charts
  const formatChartData = (dataKey) => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Group by date and OEM
    const groupedData = filteredData.reduce((acc, item) => {
      const date = item.Date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.OEM] = item[dataKey];
      return acc;
    }, {});
    
    // Convert to array format for Recharts
    return Object.keys(groupedData).map(date => {
      const entry = { date };
      oems.forEach(oem => {
        entry[oem] = groupedData[date][oem] || 0;
      });
      return entry;
    });
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
          OEM Manufacturing & Supply Metrics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Key performance indicators for OEM manufacturing operations and supply chain performance.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>OEM</InputLabel>
              <Select
                name="oem"
                value={filters.oem}
                label="OEM"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All OEMs</MenuItem>
                {oems.map(oem => (
                  <MenuItem key={oem} value={oem}>{oem}</MenuItem>
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
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Supplier OTIF"
            value={kpiValues.supplierOTIF === 'N/A' ? 'N/A' : kpiValues.supplierOTIF}
            unit="%"
            trend={kpiValues.otifTrend}
            trendDirection={kpiValues.otifTrendDirection}
            description="Percentage of shipments received on time and complete from each OEM"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Supplier OTIF (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {oems.map((oem, index) => (
                    <Line 
                      key={oem}
                      type="monotone" 
                      dataKey={oem} 
                      stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Production Throughput"
            value={kpiValues.productionThroughput === 'N/A' ? 'N/A' : kpiValues.productionThroughput}
            unit="units/hour"
            description="Bottling or packaging units/hour per OEM site"
            color="#2e7d32"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Production Throughput (units/hour)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {oems.map((oem, index) => (
                    <Bar 
                      key={oem}
                      dataKey={oem} 
                      fill={`hsl(${120 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Yield Loss"
            value={kpiValues.yieldLoss === 'N/A' ? 'N/A' : kpiValues.yieldLoss}
            unit="%"
            description="Scrap or loss in the OEM's processing line"
            color="#d32f2f"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Yield Loss (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {oems.map((oem, index) => (
                    <Line 
                      key={oem}
                      type="monotone" 
                      dataKey={oem} 
                      stroke={`hsl(${0 + index * 30}, 70%, 50%)`} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <KPICard
            title="Manufacturing Cycle Time"
            value={kpiValues.cycleTime === 'N/A' ? 'N/A' : kpiValues.cycleTime}
            unit="hours"
            description="Total time from order to finished goods ready"
            color="#ed6c02"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Manufacturing Cycle Time (hours)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {oems.map((oem, index) => (
                    <Line 
                      key={oem}
                      type="monotone" 
                      dataKey={oem} 
                      stroke={`hsl(${200 + index * 30}, 70%, 50%)`} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <KPICard
            title="Changeover Time"
            value={kpiValues.changeoverTime === 'N/A' ? 'N/A' : kpiValues.changeoverTime}
            unit="minutes"
            description="Time taken for line change between SKU batches"
            color="#9c27b0"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Changeover Time (minutes)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {oems.map((oem, index) => (
                    <Bar 
                      key={oem}
                      dataKey={oem} 
                      fill={`hsl(${280 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OEMManufacturingDashboard;
