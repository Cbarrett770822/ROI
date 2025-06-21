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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import KPICard from '../KPICards/KPICard';

const SupplyChainResponsivenessDashboard = ({ data = [] }) => {
  const [filters, setFilters] = useState({
    region: 'all',
    timeRange: 'all'
  });
  
  const [filteredData, setFilteredData] = useState([]);
  const [kpiValues, setKpiValues] = useState({
    cycleCountAccuracy: 'N/A',
    replenishmentLeadTime: 'N/A',
    forecastAccuracy: 'N/A',
    orderFulfillmentLeadTime: 'N/A'
  });
  
  // Get unique regions from data
  const regions = [...new Set(data.map(item => item.Region))];
  
  // Apply filters to data
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    // Apply region filter
    if (filters.region !== 'all') {
      filtered = filtered.filter(item => item.Region === filters.region);
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
        cycleCountAccuracy: 'N/A',
        replenishmentLeadTime: 'N/A',
        forecastAccuracy: 'N/A',
        orderFulfillmentLeadTime: 'N/A'
      });
      return;
    }
    
    try {
      // Calculate average values
      const cycleCountAccuracy = filteredData.reduce((sum, item) => sum + item['Cycle Count Accuracy (%)'], 0) / filteredData.length;
      const replenishmentLeadTime = filteredData.reduce((sum, item) => sum + item['Replenishment Lead Time (days)'], 0) / filteredData.length;
      const forecastAccuracy = filteredData.reduce((sum, item) => sum + item['Forecast Accuracy (%)'], 0) / filteredData.length;
      const orderFulfillmentLeadTime = filteredData.reduce((sum, item) => sum + item['Order Fulfillment Lead Time (days)'], 0) / filteredData.length;
      
      // Calculate trends (compare last month to previous month)
      const sortedData = [...filteredData].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      let forecastTrend = null;
      let forecastTrendDirection = null;
      
      if (sortedData.length >= 2) {
        const latestMonth = sortedData[0];
        const previousMonth = sortedData[1];
        
        const forecastChange = latestMonth['Forecast Accuracy (%)'] - previousMonth['Forecast Accuracy (%)'];
        forecastTrend = `${Math.abs(forecastChange).toFixed(1)}% vs previous`;
        forecastTrendDirection = forecastChange >= 0 ? 'up' : 'down';
      }
      
      setKpiValues({
        cycleCountAccuracy,
        replenishmentLeadTime,
        forecastAccuracy,
        orderFulfillmentLeadTime,
        forecastTrend,
        forecastTrendDirection
      });
    } catch (error) {
      console.error('Error calculating KPI values:', error);
    }
  }, [filteredData]);
  
  // Format data for charts
  const formatChartData = (dataKey) => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Group by date and region
    const groupedData = filteredData.reduce((acc, item) => {
      const date = item.Date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.Region] = item[dataKey];
      return acc;
    }, {});
    
    // Convert to array format for Recharts
    return Object.keys(groupedData).map(date => {
      const entry = { date };
      regions.forEach(region => {
        entry[region] = groupedData[date][region] || 0;
      });
      return entry;
    });
  };
  
  // Format data for radar chart
  const formatRadarData = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Get the most recent data point for each region
    const latestDataByRegion = {};
    
    filteredData.forEach(item => {
      const region = item.Region;
      const date = new Date(item.Date);
      
      if (!latestDataByRegion[region] || date > new Date(latestDataByRegion[region].Date)) {
        latestDataByRegion[region] = item;
      }
    });
    
    // Convert to array format for Recharts
    return [
      { subject: 'Cycle Count Accuracy', A: 0, fullMark: 100 },
      { subject: 'Replenishment Lead Time', A: 0, fullMark: 10 },
      { subject: 'Forecast Accuracy', A: 0, fullMark: 100 },
      { subject: 'Order Fulfillment', A: 0, fullMark: 10 }
    ].map(item => {
      const result = { ...item };
      
      Object.entries(latestDataByRegion).forEach(([region, data], index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, etc.
        
        switch (item.subject) {
          case 'Cycle Count Accuracy':
            result[letter] = data['Cycle Count Accuracy (%)'];
            break;
          case 'Replenishment Lead Time':
            // Invert the value since lower is better
            result[letter] = 10 - Math.min(data['Replenishment Lead Time (days)'], 10);
            break;
          case 'Forecast Accuracy':
            result[letter] = data['Forecast Accuracy (%)'];
            break;
          case 'Order Fulfillment':
            // Invert the value since lower is better
            result[letter] = 10 - Math.min(data['Order Fulfillment Lead Time (days)'], 10);
            break;
          default:
            result[letter] = 0;
        }
      });
      
      return result;
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
          Supply Chain Responsiveness & Planning
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Key performance indicators for supply chain responsiveness and planning efficiency.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                name="region"
                value={filters.region}
                label="Region"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Regions</MenuItem>
                {regions.map(region => (
                  <MenuItem key={region} value={region}>{region}</MenuItem>
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
        <Grid item xs={12} sm={6} md={6}>
          <KPICard
            title="Cycle Count Accuracy"
            value={kpiValues.cycleCountAccuracy === 'N/A' ? 'N/A' : kpiValues.cycleCountAccuracy}
            unit="%"
            description="Real-time inventory accuracy at supplier facilities"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Cycle Count Accuracy (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  {regions.map((region, index) => (
                    <Line 
                      key={region}
                      type="monotone" 
                      dataKey={region} 
                      stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
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
            title="Replenishment Lead Time"
            value={kpiValues.replenishmentLeadTime === 'N/A' ? 'N/A' : kpiValues.replenishmentLeadTime}
            unit="days"
            description="Days from replenishment trigger to OEM shipment"
            color="#2e7d32"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Replenishment Lead Time (days)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {regions.map((region, index) => (
                    <Bar 
                      key={region}
                      dataKey={region} 
                      fill={`hsl(${120 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <KPICard
            title="Forecast Accuracy Feedback Loop"
            value={kpiValues.forecastAccuracy === 'N/A' ? 'N/A' : kpiValues.forecastAccuracy}
            unit="%"
            trend={kpiValues.forecastTrend}
            trendDirection={kpiValues.forecastTrendDirection}
            description="Compare demand forecasts vs. actual OEM shipments"
            color="#ed6c02"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Forecast Accuracy (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Legend />
                  {regions.map((region, index) => (
                    <Line 
                      key={region}
                      type="monotone" 
                      dataKey={region} 
                      stroke={`hsl(${30 + index * 30}, 70%, 50%)`} 
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
            title="Order Fulfillment Lead Time"
            value={kpiValues.orderFulfillmentLeadTime === 'N/A' ? 'N/A' : kpiValues.orderFulfillmentLeadTime}
            unit="days"
            description="Time from PO release to confirmed shipment by OEM"
            color="#9c27b0"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Order Fulfillment Lead Time (days)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {regions.map((region, index) => (
                    <Bar 
                      key={region}
                      dataKey={region} 
                      fill={`hsl(${280 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Supply Chain Responsiveness Radar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Comparison of key responsiveness metrics across regions (higher is better)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart outerRadius={150} data={formatRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {regions.map((region, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, etc.
                  return (
                    <Radar 
                      key={region}
                      name={region} 
                      dataKey={letter} 
                      stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      fillOpacity={0.6} 
                    />
                  );
                })}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplyChainResponsivenessDashboard;
