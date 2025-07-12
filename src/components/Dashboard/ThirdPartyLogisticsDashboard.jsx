import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
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
import KPICard from '../KPICards/KPICard';
import { 
  ResponsiveContainer, 
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const ThirdPartyLogisticsDashboard = ({ data = [] }) => {
  // State for KPI values and filters
  const [kpiValues, setKpiValues] = useState({
    warehouseUtilization: 'N/A',
    orderAccuracy: 'N/A',
    pickingProductivity: 'N/A',
    inventoryTurnover: 'N/A',
    dockToStock: 'N/A'
  });
  
  const [filters, setFilters] = useState({
    warehouse: 'all',
    timeRange: '3'
  });

  // Extract unique warehouses from data
  const warehouses = [...new Set(data.map(item => item.Warehouse || 'Unknown'))].filter(Boolean).sort();
  
  // Calculate KPIs based on data and filters
  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    // Filter data based on selected filters
    let filteredData = [...data];
    
    if (filters.warehouse !== 'all') {
      filteredData = filteredData.filter(item => item.Warehouse === filters.warehouse);
    }
    
    if (filters.timeRange !== 'all') {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(filters.timeRange));
      filteredData = filteredData.filter(item => new Date(item.Date) >= cutoffDate);
    }

    // Calculate Warehouse Utilization (%)
    const warehouseUtilization = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Warehouse Utilization (%)']) || 0), 0) / filteredData.length
      : 'N/A';
    
    // Calculate Order Accuracy (%)
    const orderAccuracy = filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Order Accuracy (%)']) || 0), 0) / filteredData.length
      : 'N/A';
    
    // Calculate Picking Productivity (units/hour)
    const pickingProductivity = filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Picking Productivity (units/hour)']) || 0), 0) / filteredData.length
      : 'N/A';
    
    // Calculate Inventory Turnover (turns)
    const inventoryTurnover = filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Inventory Turnover (turns)']) || 0), 0) / filteredData.length
      : 'N/A';
    
    // Calculate Dock to Stock Time (hours)
    const dockToStock = filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + (parseFloat(item['Dock to Stock Time (hours)']) || 0), 0) / filteredData.length
      : 'N/A';

    // Update KPI values
    setKpiValues({
      warehouseUtilization: typeof warehouseUtilization === 'number' ? warehouseUtilization.toFixed(1) : warehouseUtilization,
      orderAccuracy: typeof orderAccuracy === 'number' ? orderAccuracy.toFixed(1) : orderAccuracy,
      pickingProductivity: typeof pickingProductivity === 'number' ? pickingProductivity.toFixed(1) : pickingProductivity,
      inventoryTurnover: typeof inventoryTurnover === 'number' ? inventoryTurnover.toFixed(1) : inventoryTurnover,
      dockToStock: typeof dockToStock === 'number' ? dockToStock.toFixed(1) : dockToStock
    });
  }, [data, filters]);

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
        if (monthData[warehouse] !== undefined && monthData[`${warehouse}-count`] > 0) {
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
    if (!data || data.length === 0 || warehouses.length === 0) {
      return [];
    }
    
    // Metrics to include in radar chart
    const metrics = [
      { name: 'Warehouse Utilization', key: 'Warehouse Utilization (%)' },
      { name: 'Order Accuracy', key: 'Order Accuracy (%)' },
      { name: 'Picking Productivity', key: 'Picking Productivity (units/hour)', max: 100 },
      { name: 'Inventory Turnover', key: 'Inventory Turnover (turns)', max: 15 },
      { name: 'Dock to Stock', key: 'Dock to Stock Time (hours)', max: 12, inverse: true }
    ];
    
    // Calculate average values for each warehouse and metric
    const warehouseMetrics = {};
    warehouses.forEach(warehouse => {
      const warehouseData = data.filter(item => item.Warehouse === warehouse);
      
      metrics.forEach(metric => {
        if (!warehouseMetrics[warehouse]) {
          warehouseMetrics[warehouse] = {};
        }
        
        let value = 0;
        
        if (warehouseData.length > 0) {
          // Calculate average
          const sum = warehouseData.reduce((acc, item) => {
            return acc + (parseFloat(item[metric.key]) || 0);
          }, 0);
          
          value = sum / warehouseData.length;
          
          // For inverse metrics (lower is better), invert the scale
          if (metric.inverse) {
            const max = metric.max || 12;
            value = Math.max(0, 100 - (value / max * 100));
          } else {
            // Normalize to 0-100 scale
            if (metric.max) {
              value = (value / metric.max) * 100;
            }
          }
          
          // Cap at 100
          value = Math.min(value, 100);
        }
        
        warehouseMetrics[warehouse][metric.name] = parseFloat(value.toFixed(1));
      });
    });
    
    // Format data for radar chart
    return metrics.map(metric => {
      const dataPoint = {
        subject: metric.name,
      };
      
      // Add data for each warehouse (using letters A, B, C, etc.)
      warehouses.forEach((warehouse, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, etc.
        dataPoint[letter] = warehouseMetrics[warehouse]?.[metric.name] || 0;
      });
      
      return dataPoint;
    });
  };

  // Format data for warehouse performance table
  const formatWarehousePerformance = () => {
    if (!data || data.length === 0) {
      return [];
    }
    
    return warehouses.map(warehouse => {
      const warehouseData = data.filter(item => item.Warehouse === warehouse);
      
      if (warehouseData.length === 0) {
        return {
          Warehouse: warehouse,
          Utilization: 'N/A',
          Accuracy: 'N/A',
          Productivity: 'N/A',
          DockToStock: 'N/A'
        };
      }
      
      // Calculate averages
      const utilization = warehouseData.reduce((sum, item) => 
        sum + (parseFloat(item['Warehouse Utilization (%)']) || 0), 0) / warehouseData.length;
        
      const accuracy = warehouseData.reduce((sum, item) => 
        sum + (parseFloat(item['Order Accuracy (%)']) || 0), 0) / warehouseData.length;
        
      const productivity = warehouseData.reduce((sum, item) => 
        sum + (parseFloat(item['Picking Productivity (units/hour)']) || 0), 0) / warehouseData.length;
        
      const dockToStock = warehouseData.reduce((sum, item) => 
        sum + (parseFloat(item['Dock to Stock Time (hours)']) || 0), 0) / warehouseData.length;
      
      return {
        Warehouse: warehouse,
        Utilization: `${utilization.toFixed(1)}%`,
        Accuracy: `${accuracy.toFixed(1)}%`,
        Productivity: `${productivity.toFixed(1)}`,
        DockToStock: `${dockToStock.toFixed(1)} hrs`
      };
    });
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          3PL Metrics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="warehouse-select-label">Warehouse</InputLabel>
            <Select
              labelId="warehouse-select-label"
              id="warehouse-select"
              name="warehouse"
              value={filters.warehouse}
              label="Warehouse"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Warehouses</MenuItem>
              {warehouses.map(warehouse => (
                <MenuItem key={warehouse} value={warehouse}>{warehouse}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              name="timeRange"
              value={filters.timeRange}
              label="Time Range"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="1">Last Month</MenuItem>
              <MenuItem value="3">Last 3 Months</MenuItem>
              <MenuItem value="6">Last 6 Months</MenuItem>
              <MenuItem value="12">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Warehouse Utilization"
            value={kpiValues.warehouseUtilization === 'N/A' ? 'N/A' : kpiValues.warehouseUtilization}
            unit="%"
            description="Percentage of available warehouse space being utilized"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Warehouse Utilization (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {warehouses.map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone" 
                      dataKey={warehouse} 
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
            title="Order Accuracy"
            value={kpiValues.orderAccuracy === 'N/A' ? 'N/A' : kpiValues.orderAccuracy}
            unit="%"
            description="Orders fulfilled without errors or returns"
            color="#2e7d32"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Order Accuracy (%)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip />
                  <Legend />
                  {warehouses.map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone" 
                      dataKey={warehouse} 
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
            title="Picking Productivity"
            value={kpiValues.pickingProductivity === 'N/A' ? 'N/A' : kpiValues.pickingProductivity}
            unit="units/hr"
            description="Average number of items picked per labor hour"
            color="#ed6c02"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Picking Productivity (units/hour)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {warehouses.map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone" 
                      dataKey={warehouse} 
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
            title="Inventory Turnover"
            value={kpiValues.inventoryTurnover === 'N/A' ? 'N/A' : kpiValues.inventoryTurnover}
            unit="turns"
            description="Number of times inventory is sold and replaced in a period"
            color="#9c27b0"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Inventory Turnover (turns)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {warehouses.map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone" 
                      dataKey={warehouse} 
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
            title="Dock to Stock Time"
            value={kpiValues.dockToStock === 'N/A' ? 'N/A' : kpiValues.dockToStock}
            unit="hours"
            description="Time from receipt to available for picking"
            color="#d32f2f"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData('Dock to Stock Time (hours)')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {warehouses.map((warehouse, index) => (
                    <Line 
                      key={warehouse}
                      type="monotone" 
                      dataKey={warehouse} 
                      stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Performance Radar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Comparison of key performance metrics across warehouses (higher is better)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart outerRadius={150} data={formatRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {warehouses.map((warehouse, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, etc.
                  return (
                    <Radar 
                      key={warehouse}
                      name={warehouse} 
                      dataKey={letter} 
                      stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`} 
                      fillOpacity={0.6} 
                    />
                  );
                })}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Performance Comparison
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Summary of key metrics by warehouse location
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Warehouse</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                    <TableCell align="right">Order Accuracy</TableCell>
                    <TableCell align="right">Picking Rate</TableCell>
                    <TableCell align="right">Dock to Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formatWarehousePerformance().map((row) => (
                    <TableRow key={row.Warehouse}>
                      <TableCell component="th" scope="row">
                        {row.Warehouse}
                      </TableCell>
                      <TableCell align="right">{row.Utilization}</TableCell>
                      <TableCell align="right">{row.Accuracy}</TableCell>
                      <TableCell align="right">{row.Productivity}</TableCell>
                      <TableCell align="right">{row.DockToStock}</TableCell>
                    </TableRow>
                  ))}
                  {formatWarehousePerformance().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No data available</TableCell>
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

export default ThirdPartyLogisticsDashboard;
