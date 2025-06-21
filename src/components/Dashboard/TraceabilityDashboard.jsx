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
  TableRow
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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import KPICard from '../KPICards/KPICard';

const TraceabilityDashboard = ({ data = [] }) => {
  const [filters, setFilters] = useState({
    product: 'all',
    timeRange: 'all'
  });
  
  const [filteredData, setFilteredData] = useState([]);
  const [kpiValues, setKpiValues] = useState({
    batchTraceability: 'N/A',
    regulatoryHoldTime: 'N/A',
    recallReadiness: 'N/A',
    nonConformanceReports: 'N/A'
  });
  
  // Get unique products from data
  const products = [...new Set(data.map(item => item.Product))];
  
  // Apply filters to data
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    // Apply product filter
    if (filters.product !== 'all') {
      filtered = filtered.filter(item => item.Product === filters.product);
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
        batchTraceability: 'N/A',
        regulatoryHoldTime: 'N/A',
        recallReadiness: 'N/A',
        nonConformanceReports: 'N/A'
      });
      return;
    }
    
    try {
      // Calculate average values
      const batchTraceability = filteredData.reduce((sum, item) => sum + item['Batch Traceability Score'], 0) / filteredData.length;
      const regulatoryHoldTime = filteredData.reduce((sum, item) => sum + item['Regulatory Hold Time (hours)'], 0) / filteredData.length;
      const recallReadiness = filteredData.reduce((sum, item) => sum + item['Recall Readiness (hours)'], 0) / filteredData.length;
      const nonConformanceReports = filteredData.reduce((sum, item) => sum + item['Non-Conformance Reports'], 0) / filteredData.length;
      
      // Calculate trends (compare last month to previous month)
      const sortedData = [...filteredData].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      let ncTrend = null;
      let ncTrendDirection = null;
      
      if (sortedData.length >= 2) {
        const latestMonth = sortedData[0];
        const previousMonth = sortedData[1];
        
        const ncChange = latestMonth['Non-Conformance Reports'] - previousMonth['Non-Conformance Reports'];
        ncTrend = `${Math.abs(ncChange).toFixed(1)} vs previous`;
        // For NCRs, down is good
        ncTrendDirection = ncChange < 0 ? 'up' : 'down';
      }
      
      setKpiValues({
        batchTraceability,
        regulatoryHoldTime,
        recallReadiness,
        nonConformanceReports,
        ncTrend,
        ncTrendDirection
      });
    } catch (error) {
      console.error('Error calculating KPI values:', error);
    }
  }, [filteredData]);
  
  // Format data for charts
  const formatChartData = (dataKey) => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Group by date and product
    const groupedData = filteredData.reduce((acc, item) => {
      const date = item.Date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.Product] = item[dataKey];
      return acc;
    }, {});
    
    // Convert to array format for Recharts
    return Object.keys(groupedData).map(date => {
      const entry = { date };
      products.forEach(product => {
        entry[product] = groupedData[date][product] || 0;
      });
      return entry;
    });
  };
  
  // Format data for scatter chart
  const formatScatterData = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Group by product
    return products.map(product => {
      const productData = filteredData.filter(item => item.Product === product);
      
      return {
        name: product,
        data: productData.map(item => ({
          x: item['Batch Traceability Score'],
          y: item['Recall Readiness (hours)'],
          z: item['Non-Conformance Reports'],
          date: item.Date
        }))
      };
    });
  };
  
  // Format data for recent NCR table
  const formatNCRData = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];
    
    // Sort by date (most recent first) and filter to only show items with NCRs
    return [...filteredData]
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
      .filter(item => item['Non-Conformance Reports'] > 0)
      .slice(0, 5); // Show only the 5 most recent
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
          Traceability & Compliance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Key performance indicators for product traceability and regulatory compliance.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                name="product"
                value={filters.product}
                label="Product"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Products</MenuItem>
                {products.map(product => (
                  <MenuItem key={product} value={product}>{product}</MenuItem>
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
            title="Batch & Lot Traceability"
            value={kpiValues.batchTraceability === 'N/A' ? 'N/A' : kpiValues.batchTraceability.toFixed(1)}
            unit="/10"
            description="End-to-end trace from farm → packer → warehouse → market"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Batch Traceability Score')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {products.map((product, index) => (
                    <Line 
                      key={product}
                      type="monotone" 
                      dataKey={product} 
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
            title="Regulatory Hold Time"
            value={kpiValues.regulatoryHoldTime === 'N/A' ? 'N/A' : Math.round(kpiValues.regulatoryHoldTime)}
            unit="hours"
            description="Time items spend in quality hold across the supply chain"
            color="#2e7d32"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Regulatory Hold Time (hours)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {products.map((product, index) => (
                    <Bar 
                      key={product}
                      dataKey={product} 
                      fill={`hsl(${120 + index * 30}, 70%, 50%)`} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Recall Readiness"
            value={kpiValues.recallReadiness === 'N/A' ? 'N/A' : Math.round(kpiValues.recallReadiness)}
            unit="hours"
            description="Time to trace and isolate affected lots globally"
            color="#ed6c02"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Recall Readiness (hours)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {products.map((product, index) => (
                    <Line 
                      key={product}
                      type="monotone" 
                      dataKey={product} 
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
            title="Non-Conformance Reports"
            value={kpiValues.nonConformanceReports === 'N/A' ? 'N/A' : Math.round(kpiValues.nonConformanceReports * 10) / 10}
            trend={kpiValues.ncTrend}
            trendDirection={kpiValues.ncTrendDirection}
            description="Number and type of product quality issues flagged at OEMs"
            color="#d32f2f"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData('Non-Conformance Reports')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {products.map((product, index) => (
                    <Bar 
                      key={product}
                      dataKey={product} 
                      fill={`hsl(${0 + index * 30}, 70%, 50%)`} 
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
              Traceability Performance Matrix
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Relationship between batch traceability score and recall readiness (bubble size = NCRs)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Batch Traceability" 
                  domain={[0, 10]} 
                  label={{ value: 'Batch Traceability Score', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Recall Readiness" 
                  label={{ value: 'Recall Readiness (hours)', angle: -90, position: 'left' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    if (name === 'x') return [`${value}/10`, 'Batch Traceability'];
                    if (name === 'y') return [`${value} hours`, 'Recall Readiness'];
                    if (name === 'z') return [`${value}`, 'NCRs'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                {formatScatterData().map((entry, index) => (
                  <Scatter 
                    key={entry.name} 
                    name={entry.name} 
                    data={entry.data} 
                    fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Non-Conformance Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Most recent quality issues flagged in the system
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">NCRs</TableCell>
                    <TableCell align="right">Traceability Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formatNCRData().map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.Date}</TableCell>
                      <TableCell>{row.Product}</TableCell>
                      <TableCell align="right">{row['Non-Conformance Reports']}</TableCell>
                      <TableCell align="right">{row['Batch Traceability Score']}/10</TableCell>
                    </TableRow>
                  ))}
                  {formatNCRData().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No recent NCRs found</TableCell>
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

export default TraceabilityDashboard;
