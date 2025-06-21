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
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import KPICard from '../KPICards/KPICard';

const InboundLogisticsDashboard = ({ data = [] }) => {
  const [filters, setFilters] = useState({
    location: 'all',
    timeRange: 'all'
  });
  
  const [filteredData, setFilteredData] = useState([]);
  const [kpiValues, setKpiValues] = useState({
    asnAccuracy: 'N/A',
    inTransitInventory: 'N/A',
    shelfLife: 'N/A',
    inventoryAgeing: 'N/A',
    fefoCompliance: 'N/A'
  });
  
  // Get unique locations from data
  const locations = [...new Set(data.map(item => item.Location))];
  
  // Apply filters to data
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    // Apply location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(item => item.Location === filters.location);
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
        asnAccuracy: 'N/A',
        inTransitInventory: 'N/A',
        shelfLife: 'N/A',
        inventoryAgeing: 'N/A',
        fefoCompliance: 'N/A'
      });
      return;
    }
    
    try {
      // Calculate average values
      const asnAccuracy = filteredData.reduce((sum, item) => sum + item['ASN Accuracy (%)'], 0) / filteredData.length;
      const inTransitInventory = filteredData.reduce((sum, item) => sum + item['In-Transit Inventory (units)'], 0) / filteredData.length;
      const shelfLife = filteredData.reduce((sum, item) => sum + item['Shelf Life on Arrival (days)'], 0) / filteredData.length;
      const inventoryAgeing = filteredData.reduce((sum, item) => sum + item['Inventory Ageing (days)'], 0) / filteredData.length;
      const fefoCompliance = filteredData.reduce((sum, item) => sum + item['FEFO Compliance (%)'], 0) / filteredData.length;
      
      // Calculate trends (compare last month to previous month)
      const sortedData = [...filteredData].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      let fefoTrend = null;
      let fefoTrendDirection = null;
      
      if (sortedData.length >= 2) {
        const latestMonth = sortedData[0];
        const previousMonth = sortedData[1];
        
        const fefoChange = latestMonth['FEFO Compliance (%)'] - previousMonth['FEFO Compliance (%)'];
        fefoTrend = `${Math.abs(fefoChange).toFixed(1)}% vs previous`;
        fefoTrendDirection = fefoChange >= 0 ? 'up' : 'down';
      }
      
      setKpiValues({
        asnAccuracy,
        inTransitInventory,
        shelfLife,
        inventoryAgeing,
        fefoCompliance,
        fefoTrend,
        fefoTrendDirection
      });
    } catch (error) {
      console.error('Error calculating KPI values:', error);
    }
  }, [filteredData]);
  
  // Format data for charts
  const formatChartData = (dataKey) => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Group by date and location
    const groupedData = filteredData.reduce((acc, item) => {
      const date = item.Date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.Location] = item[dataKey];
      return acc;
    }, {});
    
    // Convert to array format for Recharts
    return Object.keys(groupedData).map(date => {
      const entry = { date };
      locations.forEach(location => {
        entry[location] = groupedData[date][location] || 0;
      });
      return entry;
    });
  };
  
  // Format data for pie chart
  const formatPieData = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Get the most recent data point for each location
    const latestDataByLocation = {};
    
    filteredData.forEach(item => {
      const location = item.Location;
      const date = new Date(item.Date);
      
      if (!latestDataByLocation[location] || date > new Date(latestDataByLocation[location].Date)) {
        latestDataByLocation[location] = item;
      }
    });
    
    // Convert to array format for Recharts
    return Object.values(latestDataByLocation).map(item => ({
      name: item.Location,
      value: item['In-Transit Inventory (units)']
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Inbound Logistics & Inventory Visibility
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Key performance indicators for inbound logistics operations and inventory management.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={filters.location}
                label="Location"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Locations</MenuItem>
                {locations.map(location => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
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
            title="ASN Accuracy"
            value={kpiValues.asnAccuracy === 'N/A' ? 'N/A' : kpiValues.asnAccuracy}
            unit="%"
            description="Percentage of Advanced Shipping Notices that match actual receipts"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('ASN Accuracy (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  {locations.map((location, index) => (
                    <Line 
                      key={location}
                      type="monotone" 
                      dataKey={location} 
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
            title="In-Transit Inventory"
            value={kpiValues.inTransitInventory === 'N/A' ? 'N/A' : Math.round(kpiValues.inTransitInventory)}
            unit="units"
            description="Real-time stock in motion, by SKU, lot, and supplier"
            color="#2e7d32"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formatPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Shelf Life on Arrival"
            value={kpiValues.shelfLife === 'N/A' ? 'N/A' : Math.round(kpiValues.shelfLife)}
            unit="days"
            description="Average remaining shelf life of incoming products"
            color="#ed6c02"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Shelf Life on Arrival (days)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {locations.map((location, index) => (
                    <Bar 
                      key={location}
                      dataKey={location} 
                      fill={`hsl(${30 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <KPICard
            title="Inventory Ageing by Location"
            value={kpiValues.inventoryAgeing === 'N/A' ? 'N/A' : kpiValues.inventoryAgeing.toFixed(1)}
            unit="days"
            description="Days on hand per SKU, segmented by warehouse location"
            color="#9c27b0"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Inventory Ageing (days)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {locations.map((location, index) => (
                    <Line 
                      key={location}
                      type="monotone" 
                      dataKey={location} 
                      stroke={`hsl(${280 + index * 30}, 70%, 50%)`} 
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
            title="FEFO Compliance"
            value={kpiValues.fefoCompliance === 'N/A' ? 'N/A' : kpiValues.fefoCompliance}
            unit="%"
            trend={kpiValues.fefoTrend}
            trendDirection={kpiValues.fefoTrendDirection}
            description="Percentage of goods consumed in First-Expire, First-Out order"
            color="#d32f2f"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('FEFO Compliance (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Legend />
                  {locations.map((location, index) => (
                    <Bar 
                      key={location}
                      dataKey={location} 
                      fill={`hsl(${0 + index * 30}, 70%, 50%)`} 
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

export default InboundLogisticsDashboard;
