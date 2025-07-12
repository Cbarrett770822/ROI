/**
 * Generate sample data for the Supply Chain Metrics Dashboard
 * This creates realistic sample data for each dashboard category
 */

// Generate retail warehouse sample data
const generateRetailWarehouseSampleData = () => {
  const currentDate = new Date();
  const dates = [];
  
  // Generate dates for the last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    dates.unshift(date.toISOString().split('T')[0]);
  }
  
  return dates.flatMap((date) => {
    // Create multiple entries per date for different warehouses
    return ['Retail DC North', 'Retail DC South', 'Retail DC East', 'Retail DC West'].map(warehouse => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Warehouse: warehouse,
        'Inventory Accuracy (%)': Math.round((94 + (Math.random() * 6) * randomFactor) * 10) / 10,
        'Order Fulfillment Rate (%)': Math.round((92 + (Math.random() * 8) * randomFactor) * 10) / 10,
        'Picking Accuracy (%)': Math.round((96 + (Math.random() * 4) * randomFactor) * 10) / 10,
        'Return Processing Time (hours)': Math.round((4 + (Math.random() * 8) * randomFactor) * 10) / 10,
        'Cross Docking Time (hours)': Math.round((2 + (Math.random() * 6) * randomFactor) * 10) / 10
      };
    });
  });
};

export const generateSampleData = () => {
  console.log('Starting sample data generation');
  const currentDate = new Date();
  const dates = [];
  
  // Generate dates for the last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    dates.unshift(date.toISOString().split('T')[0]);
  }
  
  console.log(`Generated ${dates.length} date points for sample data`);
  
  return {
    // Retail Warehouse Dashboard Metrics
    RetailWarehouse: generateRetailWarehouseSampleData(),
    
    // Retail Dashboard Metrics
    Retail: dates.map((date, index) => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Store: index % 4 === 0 ? 'Downtown Store' : index % 4 === 1 ? 'Mall Location' : 
               index % 4 === 2 ? 'Suburban Store' : 'Outlet Store',
        'Sales per Square Foot ($)': Math.round((350 + (Math.random() * 250) * randomFactor) * 10) / 10,
        'Inventory Turnover (turns)': Math.round((6 + (Math.random() * 8) * randomFactor) * 10) / 10,
        'Customer Conversion Rate (%)': Math.round((15 + (Math.random() * 25) * randomFactor) * 10) / 10,
        'Average Transaction Value ($)': Math.round((45 + (Math.random() * 75) * randomFactor) * 10) / 10,
        'Stockout Rate (%)': Math.round((1 + (Math.random() * 5) * randomFactor) * 10) / 10
      };
    }),
    
    // Third Party Logistics Metrics
    ThirdPartyLogistics: dates.map((date, index) => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Warehouse: index % 4 === 0 ? '3PL Facility A' : index % 4 === 1 ? '3PL Facility B' : 
                  index % 4 === 2 ? '3PL Facility C' : '3PL Facility D',
        'Warehouse Utilization (%)': Math.round(70 + (Math.random() * 20) * randomFactor),
        'Order Accuracy (%)': Math.round(95 + (Math.random() * 5) * randomFactor),
        'Picking Productivity (units/hour)': Math.round(60 + (Math.random() * 40) * randomFactor),
        'Inventory Turnover (turns)': Math.round((8 + (Math.random() * 7) * randomFactor) * 10) / 10,
        'Dock to Stock Time (hours)': Math.round((2 + (Math.random() * 8) * randomFactor) * 10) / 10
      };
    }),
    
    // OEM Manufacturing & Supply Metrics
    OEMManufacturing: dates.map((date, index) => {
      // Generate some variation in the data
      const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
      
      return {
        Date: date,
        OEM: index % 3 === 0 ? 'OEM Alpha' : index % 3 === 1 ? 'OEM Beta' : 'OEM Gamma',
        'Supplier OTIF (%)': Math.round(85 + (Math.random() * 15) * randomFactor),
        'Production Throughput (units/hour)': Math.round(120 + (Math.random() * 30) * randomFactor),
        'Yield Loss (%)': Math.round((2 + (Math.random() * 3) * randomFactor) * 10) / 10,
        'Manufacturing Cycle Time (hours)': Math.round((24 + (Math.random() * 12) * randomFactor) * 10) / 10,
        'Changeover Time (minutes)': Math.round(45 + (Math.random() * 30) * randomFactor)
      };
    }),
    
    // Inbound Logistics & Inventory Visibility
    InboundLogistics: dates.map((date, index) => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Location: index % 4 === 0 ? 'Warehouse A' : index % 4 === 1 ? 'Warehouse B' : 
                  index % 4 === 2 ? 'Warehouse C' : 'Warehouse D',
        'ASN Accuracy (%)': Math.round(90 + (Math.random() * 10) * randomFactor),
        'In-Transit Inventory (units)': Math.round(5000 + (Math.random() * 2000) * randomFactor),
        'Shelf Life on Arrival (days)': Math.round(60 + (Math.random() * 30) * randomFactor),
        'Inventory Ageing (days)': Math.round(15 + (Math.random() * 10) * randomFactor),
        'FEFO Compliance (%)': Math.round(88 + (Math.random() * 12) * randomFactor)
      };
    }),
    
    // Supply Chain Responsiveness & Planning
    SupplyChainResponsiveness: dates.map((date, index) => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Region: index % 3 === 0 ? 'North' : index % 3 === 1 ? 'South' : 'Central',
        'Cycle Count Accuracy (%)': Math.round(92 + (Math.random() * 8) * randomFactor),
        'Replenishment Lead Time (days)': Math.round(5 + (Math.random() * 3) * randomFactor),
        'Forecast Accuracy (%)': Math.round(80 + (Math.random() * 15) * randomFactor),
        'Order Fulfillment Lead Time (days)': Math.round(3 + (Math.random() * 2) * randomFactor)
      };
    }),
    
    // Traceability & Compliance
    Traceability: dates.map((date, index) => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Product: index % 4 === 0 ? 'Product A' : index % 4 === 1 ? 'Product B' : 
                 index % 4 === 2 ? 'Product C' : 'Product D',
        'Batch Traceability Score': Math.round(8 + (Math.random() * 2) * randomFactor),
        'Regulatory Hold Time (hours)': Math.round(12 + (Math.random() * 12) * randomFactor),
        'Recall Readiness (hours)': Math.round(4 + (Math.random() * 4) * randomFactor),
        'Non-Conformance Reports': Math.round(2 + (Math.random() * 5) * randomFactor)
      };
    }),
    

    
    // Supplier Performance Scorecard
    SupplierPerformance: dates.map((date, index) => {
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      return {
        Date: date,
        Supplier: index % 5 === 0 ? 'Supplier A' : index % 5 === 1 ? 'Supplier B' : 
                  index % 5 === 2 ? 'Supplier C' : index % 5 === 3 ? 'Supplier D' : 'Supplier E',
        'Order Accuracy (%)': Math.round(90 + (Math.random() * 10) * randomFactor),
        'Damage Rate (%)': Math.round((0.5 + (Math.random() * 2) * randomFactor) * 10) / 10,
        'Response Time (hours)': Math.round(4 + (Math.random() * 8) * randomFactor),
        'Inventory Turns': Math.round((12 + (Math.random() * 6) * randomFactor) * 10) / 10
      };
    })
  };
};
