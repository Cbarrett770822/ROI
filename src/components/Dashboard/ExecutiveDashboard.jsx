import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import KPICard from '../KPICards/KPICard';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

const ExecutiveDashboard = ({ data = {} }) => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Combine all data for executive overview using useMemo to prevent infinite re-renders
  const allData = useMemo(() => ({
    oem: data.OEMManufacturing || [],
    inbound: data.InboundLogistics || [],
    responsiveness: data.SupplyChainResponsiveness || [],
    traceability: data.Traceability || [],
    supplier: data.SupplierPerformance || []
  }), [data.OEMManufacturing, data.InboundLogistics, data.SupplyChainResponsiveness, data.Traceability, data.SupplierPerformance]);
  
  // Calculate KPI values
  const [kpiValues, setKpiValues] = useState({
    supplierOTIF: 'N/A',
    productionThroughput: 'N/A',
    inventoryAge: 'N/A',
    ordersOnHold: 'N/A'
  });
  
  // Calculate KPIs from data
  useEffect(() => {
    // Skip calculation if no data is available yet
    if (!data || Object.keys(data).length === 0) return;
    if (!allData.oem.length && !allData.inbound.length && !allData.supplier.length) {
      // Set default sample values when no data is available
      setKpiValues({
        supplierOTIF: 92,
        productionThroughput: 2.4,
        inventoryAge: 28,
        ordersOnHold: 15
      });
      return;
    }
    
    try {
      // Calculate supplier OTIF
      let supplierOTIF = 92; // Default value
      if (Array.isArray(allData.supplier) && allData.supplier.length > 0) {
        const otifValues = allData.supplier
          .map(item => parseFloat(item['OTIF (%)']))
          .filter(val => !isNaN(val));
          
        if (otifValues.length > 0) {
          const avgOTIF = otifValues.reduce((sum, val) => sum + val, 0) / otifValues.length;
          supplierOTIF = Math.round(avgOTIF);
        }
      }
      
      // Calculate production throughput
      let productionThroughput = 2.4; // Default value
      if (Array.isArray(allData.oem) && allData.oem.length > 0) {
        const throughputValues = allData.oem
          .map(item => parseFloat(item['Production Throughput (units/hour)']))
          .filter(val => !isNaN(val));
          
        if (throughputValues.length > 0) {
          // Convert units/hour to millions/month (assuming 24/7 operation)
          const avgThroughput = throughputValues.reduce((sum, val) => sum + val, 0) / throughputValues.length;
          productionThroughput = ((avgThroughput * 24 * 30) / 1000000).toFixed(1);
        }
      }
      
      // Calculate inventory metrics
      let inventoryAge = 28; // Default value
      if (Array.isArray(allData.inbound) && allData.inbound.length > 0) {
        const ageValues = allData.inbound
          .map(item => parseFloat(item['Inventory Age (days)']))
          .filter(val => !isNaN(val));
          
        if (ageValues.length > 0) {
          inventoryAge = Math.round(ageValues.reduce((sum, val) => sum + val, 0) / ageValues.length);
        }
      }
      
      // Calculate orders on hold
      let ordersOnHold = 15; // Default value
      if (Array.isArray(allData.responsiveness) && allData.responsiveness.length > 0) {
        const holdValues = allData.responsiveness
          .map(item => parseFloat(item['Orders On Hold']))
          .filter(val => !isNaN(val));
          
        if (holdValues.length > 0) {
          ordersOnHold = Math.round(holdValues.reduce((sum, val) => sum + val, 0) / holdValues.length);
        }
      }
      
      setKpiValues({ supplierOTIF, productionThroughput, inventoryAge, ordersOnHold });
    } catch (error) {
      console.error('Error calculating KPI values:', error);
      // Fallback to default values
      setKpiValues({
        supplierOTIF: 92,
        productionThroughput: 2.4,
        inventoryAge: 28,
        ordersOnHold: 15
      });
    }
  }, [allData]);
  
  // Format data for supplier OTIF chart
  const formatSupplierOTIFData = () => {
    const sampleData = [
      { supplier: 'Supplier A', otif: 95 },
      { supplier: 'Supplier B', otif: 92 },
      { supplier: 'Supplier C', otif: 88 },
      { supplier: 'Supplier D', otif: 85 },
      { supplier: 'Supplier E', otif: 82 }
    ];
    
    if (!Array.isArray(allData.supplier) || allData.supplier.length === 0) {
      console.log('Using sample supplier OTIF data');
      return sampleData;
    }
    
    try {
      const supplierData = {};
      allData.supplier.forEach(item => {
        const supplierName = item['Supplier Name'] || 'Unknown';
        const otifValue = parseFloat(item['OTIF (%)']);
        if (isNaN(otifValue)) return;
        
        if (!supplierData[supplierName]) {
          supplierData[supplierName] = { count: 0, totalOTIF: 0 };
        }
        supplierData[supplierName].count++;
        supplierData[supplierName].totalOTIF += otifValue;
      });
      
      const result = Object.keys(supplierData).map(supplier => ({
        supplier,
        otif: supplierData[supplier].totalOTIF / supplierData[supplier].count
      }));
      
      result.sort((a, b) => b.otif - a.otif);
      const finalResult = result.slice(0, 5);
      
      // If no valid data was found, return sample data
      if (finalResult.length === 0) {
        console.log('No valid supplier data found, using sample data');
        return sampleData;
      }
      
      return finalResult;
    } catch (error) {
      console.error('Error formatting supplier OTIF data:', error);
      return sampleData;
    }
  };
  
  // Format data for production throughput chart
  const formatProductionData = () => {
    if (!Array.isArray(allData.oem) || allData.oem.length === 0) {
      return [
        { month: 'Jan', throughput: 2.1 },
        { month: 'Feb', throughput: 2.3 },
        { month: 'Mar', throughput: 2.0 },
        { month: 'Apr', throughput: 2.4 },
        { month: 'May', throughput: 2.6 },
        { month: 'Jun', throughput: 2.2 }
      ];
    }
    
    try {
      // Group by month and calculate average
      const monthData = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      allData.oem.forEach(item => {
        const date = new Date(item['Date']);
        if (isNaN(date.getTime())) return;
        
        const month = months[date.getMonth()];
        const throughput = parseFloat(item['Production Throughput (units/hour)']);
        if (isNaN(throughput)) return;
        
        if (!monthData[month]) {
          monthData[month] = { count: 0, total: 0 };
        }
        monthData[month].count++;
        monthData[month].total += throughput;
      });
      
      return Object.keys(monthData).map(month => ({
        month,
        throughput: ((monthData[month].total / monthData[month].count) * 24 * 30) / 1000000
      }));
    } catch (error) {
      console.error('Error formatting production data:', error);
      return [];
    }
  };
  
  // Format data for scatter plot
  const formatScatterData = () => {
    const sampleData = [
      { name: 'Location A', x: 25, y: 12, age: 25, orders: 12 },
      { name: 'Location B', x: 32, y: 18, age: 32, orders: 18 },
      { name: 'Location C', x: 20, y: 8, age: 20, orders: 8 },
      { name: 'Location D', x: 38, y: 24, age: 38, orders: 24 },
      { name: 'Location E', x: 15, y: 5, age: 15, orders: 5 }
    ];
    
    if ((!Array.isArray(allData.inbound) || allData.inbound.length === 0) && 
        (!Array.isArray(allData.responsiveness) || allData.responsiveness.length === 0)) {
      console.log('Using sample scatter plot data');
      return sampleData;
    }
    
    try {
      // Combine inventory age and orders on hold data by location
      const locationMap = new Map();
      
      // Process inventory age data
      if (Array.isArray(allData.inbound)) {
        allData.inbound.forEach(item => {
          const location = item['Location'] || 'Unknown';
          const age = parseFloat(item['Inventory Age (days)']);
          if (isNaN(age)) return;
          
          if (!locationMap.has(location)) {
            locationMap.set(location, { ageSum: 0, ageCount: 0, orderSum: 0, orderCount: 0 });
          }
          
          const locData = locationMap.get(location);
          locData.ageSum += age;
          locData.ageCount++;
        });
      }
      
      // Process orders on hold data
      if (Array.isArray(allData.responsiveness)) {
        allData.responsiveness.forEach(item => {
          const location = item['Location'] || 'Unknown';
          const orders = parseFloat(item['Orders On Hold']);
          if (isNaN(orders)) return;
          
          if (!locationMap.has(location)) {
            locationMap.set(location, { ageSum: 0, ageCount: 0, orderSum: 0, orderCount: 0 });
          }
          
          const locData = locationMap.get(location);
          locData.orderSum += orders;
          locData.orderCount++;
        });
      }
      
      // Calculate averages and create data points
      const result = [];
      locationMap.forEach((data, location) => {
        const avgAge = data.ageCount > 0 ? data.ageSum / data.ageCount : 0;
        const avgOrders = data.orderCount > 0 ? data.orderSum / data.orderCount : 0;
        
        if (avgAge > 0 || avgOrders > 0) {
          result.push({
            name: location,
            x: Math.round(avgAge),
            y: Math.round(avgOrders),
            age: Math.round(avgAge),
            orders: Math.round(avgOrders)
          });
        }
      });
      
      // If no valid data was found, return sample data
      if (result.length === 0) {
        console.log('No valid scatter data found, using sample data');
        return sampleData;
      }
      
      return result;
    } catch (error) {
      console.error('Error formatting scatter data:', error);
      return sampleData;
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Time Range Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="ytd">Year to Date</MenuItem>
            <MenuItem value="last6m">Last 6 Months</MenuItem>
            <MenuItem value="last3m">Last 3 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Supplier OTIF Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Supplier OTIF"
            value={`${kpiValues.supplierOTIF}%`}
            description="On-Time In-Full delivery performance"
            color="#1976d2"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {formatSupplierOTIFData().length > 0 ? (
                  <BarChart data={formatSupplierOTIFData().slice(0, 5)}>
                    <XAxis dataKey="supplier" tick={false} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'OTIF']} />
                    <Bar dataKey="otif" fill="#1976d2" />
                  </BarChart>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Loading...</span>
                  </div>
                )}
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        {/* Production Throughput Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Production Throughput"
            value={`${kpiValues.productionThroughput}M`}
            description="Monthly production in millions of units"
            color="#00acc1"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {formatProductionData().length > 0 ? (
                  <LineChart data={formatProductionData().slice(0, 5)}>
                    <XAxis dataKey="month" tick={false} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}M units`, 'Throughput']} />
                    <Line type="monotone" dataKey="throughput" stroke="#00acc1" dot={false} />
                  </LineChart>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Loading...</span>
                  </div>
                )}
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        {/* Inventory Age Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Inventory Age"
            value={`${kpiValues.inventoryAge} days`}
            description="Average age of inventory in days"
            color="#ffb300"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {formatScatterData().length > 0 ? (
                  <BarChart data={formatScatterData().slice(0, 5)}>
                    <XAxis dataKey="name" tick={false} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Age']} />
                    <Bar dataKey="age" fill="#ffb300" />
                  </BarChart>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Loading...</span>
                  </div>
                )}
              </ResponsiveContainer>
            }
          />
        </Grid>
        
        {/* Orders on Hold Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Orders on Hold"
            value={kpiValues.ordersOnHold}
            description="Number of orders currently on hold"
            color="#f44336"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {formatScatterData().length > 0 ? (
                  <BarChart data={formatScatterData().slice(0, 5)}>
                    <XAxis dataKey="name" tick={false} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} orders`, 'On Hold']} />
                    <Bar dataKey="orders" fill="#f44336" />
                  </BarChart>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Loading...</span>
                  </div>
                )}
              </ResponsiveContainer>
            }
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Production Throughput Chart */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Monthly Production Throughput
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            {formatProductionData().length > 0 ? (
              <LineChart data={formatProductionData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}M`} />
                <Tooltip formatter={(value) => [`${value}M units`, 'Throughput']} />
                <Line type="monotone" dataKey="throughput" stroke="#1976d2" />
              </LineChart>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>Loading chart data...</span>
              </div>
            )}
          </ResponsiveContainer>
        </Paper>
        
        {/* Supplier OTIF Chart */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Top Supplier OTIF Performance
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            {formatSupplierOTIFData().length > 0 ? (
              <BarChart data={formatSupplierOTIFData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="supplier" width={100} />
                <Tooltip formatter={(value) => [`${value}%`, 'OTIF']} />
                <Bar dataKey="otif" fill="#00acc1" barSize={20} />
              </BarChart>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>Loading chart data...</span>
              </div>
            )}
          </ResponsiveContainer>
        </Paper>
        
        {/* Inventory Age vs Orders Scatter Plot */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Inventory Age vs Orders On Hold
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            {formatScatterData().length > 0 ? (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Inventory Age" unit=" days" />
                <YAxis type="number" dataKey="y" name="Orders On Hold" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value, name) => {
                    if (name === 'x') return [`${value} days`, 'Inventory Age'];
                    if (name === 'y') return [`${value}`, 'Orders On Hold'];
                    return [value, name];
                  }}
                />
                <Scatter name="Locations" data={formatScatterData()} fill="#ffb300" shape="circle" />
              </ScatterChart>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>Loading chart data...</span>
              </div>
            )}
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default ExecutiveDashboard;
