import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DataSourcesDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Define data source categories
  const categories = [
    { id: 'executive', name: 'Executive Dashboard' },
    { id: 'oem', name: 'OEM Manufacturing' },
    { id: 'inbound', name: 'Inbound Logistics' },
    { id: 'responsiveness', name: 'Supply Chain Responsiveness' },
    { id: 'traceability', name: 'Traceability & Compliance' },
    { id: 'supplier', name: 'Supplier Performance' },
    { id: 'reports', name: 'Reports' }
  ];

  // Define data sources for each category
  const dataSources = {
    executive: [
      {
        kpi: 'On-Time Delivery',
        dataPoints: [
          { name: 'Delivery timestamps', source: 'SHIPMENT_HEADER table with ACTUAL_DELIVERY_DATE vs. SCHEDULED_DELIVERY_DATE' }
        ]
      },
      {
        kpi: 'Order Accuracy',
        dataPoints: [
          { name: 'Order details', source: 'ORDER_DETAIL table joined with SHIPMENT_DETAIL' },
          { name: 'Discrepancies', source: 'DISCREPANCY_LOG table with reason codes' }
        ]
      },
      {
        kpi: 'Inventory Accuracy',
        dataPoints: [
          { name: 'Physical vs. system counts', source: 'INVENTORY_SNAPSHOT vs. CYCLE_COUNT_DETAIL tables' },
          { name: 'Adjustments', source: 'INVENTORY_ADJUSTMENT table with adjustment reasons' }
        ]
      },
      {
        kpi: 'Warehouse Utilization',
        dataPoints: [
          { name: 'Space usage', source: 'LOCATION_MASTER table with LOCATION_CAPACITY and LOCATION_UTILIZATION fields' }
        ]
      },
      {
        kpi: 'Labor Efficiency',
        dataPoints: [
          { name: 'Productivity metrics', source: 'LABOR_ACTIVITY table with STANDARD_TIME vs. ACTUAL_TIME' }
        ]
      },
      {
        kpi: 'Cost per Order',
        dataPoints: [
          { name: 'Cost data', source: 'ORDER_COST_DETAIL table with cost categories' }
        ]
      }
    ],
    oem: [
      {
        kpi: 'Production Efficiency',
        dataPoints: [
          { name: 'Production rates', source: 'PRODUCTION_ORDER table with PLANNED_PRODUCTION_RATE vs. ACTUAL_PRODUCTION_RATE' }
        ]
      },
      {
        kpi: 'Equipment Uptime',
        dataPoints: [
          { name: 'Downtime records', source: 'EQUIPMENT_STATUS_LOG table with DOWNTIME_REASON_CODE' }
        ]
      },
      {
        kpi: 'First Pass Yield',
        dataPoints: [
          { name: 'Quality metrics', source: 'QUALITY_INSPECTION table with PASS_FAIL_FLAG and DEFECT_CODES' }
        ]
      },
      {
        kpi: 'Production Plan Adherence',
        dataPoints: [
          { name: 'Planned vs. actual', source: 'PRODUCTION_PLAN table joined with PRODUCTION_ACTUAL' }
        ]
      },
      {
        kpi: 'Changeover Time',
        dataPoints: [
          { name: 'Setup times', source: 'PRODUCTION_DOWNTIME table with SETUP_START_TIME and SETUP_END_TIME' }
        ]
      }
    ],
    inbound: [
      {
        kpi: 'Receiving Accuracy',
        dataPoints: [
          { name: 'Receipt vs. PO', source: 'RECEIPT_DETAIL table compared with PO_DETAIL table' }
        ]
      },
      {
        kpi: 'Dock-to-Stock Time',
        dataPoints: [
          { name: 'Timestamps', source: 'RECEIPT_HEADER.RECEIPT_DATE and PUTAWAY_TRANSACTION.COMPLETION_DATE' }
        ]
      },
      {
        kpi: 'Supplier On-Time Delivery',
        dataPoints: [
          { name: 'Delivery performance', source: 'ASN_HEADER.EXPECTED_ARRIVAL_DATE vs. RECEIPT_HEADER.RECEIPT_DATE' }
        ]
      },
      {
        kpi: 'Receiving Productivity',
        dataPoints: [
          { name: 'Processing rates', source: 'LABOR_ACTIVITY table filtered by ACTIVITY_CODE = "RECEIVING"' }
        ]
      },
      {
        kpi: 'Inbound Quality Rate',
        dataPoints: [
          { name: 'Inspection results', source: 'RECEIPT_QUALITY_CHECK table with QUALITY_STATUS' }
        ]
      }
    ],
    responsiveness: [
      {
        kpi: 'Order Cycle Time',
        dataPoints: [
          { name: 'Order processing times', source: 'ORDER_HEADER.ORDER_DATE to SHIPMENT_HEADER.SHIP_DATE' }
        ]
      },
      {
        kpi: 'Backorder Rate',
        dataPoints: [
          { name: 'Unfulfilled orders', source: 'ORDER_DETAIL table with STATUS_CODE = "BACKORDERED"' }
        ]
      },
      {
        kpi: 'Fill Rate',
        dataPoints: [
          { name: 'Order completion', source: 'ORDER_DETAIL.ORDERED_QTY vs. SHIPMENT_DETAIL.SHIPPED_QTY' }
        ]
      },
      {
        kpi: 'Perfect Order Rate',
        dataPoints: [
          { name: 'Order perfection metrics', source: 'ORDER_METRICS view combining on-time, accurate, and damage-free metrics' }
        ]
      },
      {
        kpi: 'Lead Time Variance',
        dataPoints: [
          { name: 'Lead time consistency', source: 'Statistical calculation from ORDER_FULFILLMENT_TIME table' }
        ]
      }
    ],
    traceability: [
      {
        kpi: 'Lot Traceability',
        dataPoints: [
          { name: 'Lot tracking', source: 'LOT_MASTER and LOT_TRANSACTION tables with full movement history' }
        ]
      },
      {
        kpi: 'Compliance Rate',
        dataPoints: [
          { name: 'Regulatory adherence', source: 'COMPLIANCE_AUDIT table with audit results and compliance scores' }
        ]
      },
      {
        kpi: 'Documentation Accuracy',
        dataPoints: [
          { name: 'Document completeness', source: 'DOCUMENT_VERIFICATION table with verification status' }
        ]
      },
      {
        kpi: 'Hold & Release Efficiency',
        dataPoints: [
          { name: 'Hold management', source: 'INVENTORY_HOLD table with HOLD_REASON and RELEASE_DATE' }
        ]
      },
      {
        kpi: 'Recall Readiness',
        dataPoints: [
          { name: 'Trace capabilities', source: 'MOCK_RECALL_TEST table with trace completion metrics' }
        ]
      }
    ],
    supplier: [
      {
        kpi: 'On-Time Delivery',
        dataPoints: [
          { name: 'Delivery performance', source: 'RECEIPT_HEADER table with EXPECTED_DATE vs. ACTUAL_DATE by SUPPLIER_ID' }
        ]
      },
      {
        kpi: 'Quality Compliance',
        dataPoints: [
          { name: 'Quality metrics', source: 'SUPPLIER_QUALITY_INSPECTION table with defect rates' }
        ]
      },
      {
        kpi: 'Order Accuracy',
        dataPoints: [
          { name: 'Order correctness', source: 'PO_RECEIPT_RECONCILIATION view comparing ordered vs. received' }
        ]
      },
      {
        kpi: 'Lead Time',
        dataPoints: [
          { name: 'Order processing time', source: 'PO_HEADER.ORDER_DATE to RECEIPT_HEADER.RECEIPT_DATE' }
        ]
      },
      {
        kpi: 'Cost Adherence',
        dataPoints: [
          { name: 'Price compliance', source: 'PO_DETAIL.UNIT_PRICE vs. INVOICE_DETAIL.UNIT_PRICE' }
        ]
      }
    ],
    reports: [
      {
        kpi: 'Inventory Snapshot Report',
        dataPoints: [
          { name: 'SKU', source: 'ITEM_MASTER table' },
          { name: 'Lot/Batch #', source: 'LOT_MASTER table' },
          { name: 'Expiry Date', source: 'LOT_MASTER.EXPIRATION_DATE' },
          { name: 'Quantity', source: 'INVENTORY_DETAIL table with current quantities' },
          { name: 'Aging', source: 'Calculated from RECEIPT_DATE to current date' },
          { name: 'Status', source: 'INVENTORY_STATUS table with status codes' }
        ]
      },
      {
        kpi: 'Dock-to-Stock Report',
        dataPoints: [
          { name: 'Receipt timestamp', source: 'RECEIPT_HEADER.RECEIPT_DATE' },
          { name: 'Putaway timestamp', source: 'PUTAWAY_TRANSACTION.COMPLETION_DATE' },
          { name: 'SKU', source: 'ITEM_MASTER joined with RECEIPT_DETAIL' },
          { name: 'Quantity', source: 'RECEIPT_DETAIL.QUANTITY' },
          { name: 'Shift', source: 'LABOR_SHIFT table joined with RECEIPT_HEADER' },
          { name: 'Dock-to-Stock time', source: 'Calculated field (putaway timestamp - receipt timestamp)' }
        ]
      },
      {
        kpi: 'FEFO Compliance Report',
        dataPoints: [
          { name: 'SKU', source: 'ITEM_MASTER table' },
          { name: 'FEFO compliance percentage', source: 'Calculated from PICK_DETAIL vs. LOT_MASTER.EXPIRATION_DATE' },
          { name: 'Exception counts', source: 'FEFO_EXCEPTION table with exception reasons' },
          { name: 'Expiry dates', source: 'LOT_MASTER.EXPIRATION_DATE' }
        ]
      },
      {
        kpi: 'Non-Conformance Report',
        dataPoints: [
          { name: 'Returned/blocked goods', source: 'QUALITY_HOLD table with hold reasons' },
          { name: 'Reason codes', source: 'QUALITY_ISSUE_CODE table with descriptions' },
          { name: 'Actions taken', source: 'QUALITY_RESOLUTION table with resolution codes' },
          { name: 'Quantities', source: 'QUALITY_HOLD.QUANTITY' }
        ]
      },
      {
        kpi: 'Order Fulfillment Report',
        dataPoints: [
          { name: 'Order numbers', source: 'ORDER_HEADER table' },
          { name: 'SKUs', source: 'ORDER_DETAIL.ITEM_ID' },
          { name: 'Quantities ordered vs. shipped', source: 'ORDER_DETAIL.ORDERED_QTY vs. SHIPMENT_DETAIL.SHIPPED_QTY' },
          { name: 'Fulfillment rates', source: 'Calculated field (shipped/ordered)' },
          { name: 'Short picks', source: 'ORDER_DETAIL where ORDERED_QTY > SHIPPED_QTY' },
          { name: 'Substitutions', source: 'ITEM_SUBSTITUTION table with substitution reasons' }
        ]
      },
      {
        kpi: 'Batch Traceability Report',
        dataPoints: [
          { name: 'Raw material batch', source: 'MATERIAL_LOT_GENEALOGY table' },
          { name: 'Finished batch', source: 'PRODUCTION_LOT table' },
          { name: 'Putaway location', source: 'INVENTORY_DETAIL.LOCATION_ID' },
          { name: 'Timestamps', source: 'LOT_TRANSACTION.TRANSACTION_DATE for each movement' },
          { name: 'Storage duration', source: 'Calculated from movement timestamps' }
        ]
      },
      {
        kpi: 'Production Planning Report',
        dataPoints: [
          { name: 'Planned production dates', source: 'PRODUCTION_PLAN.PLANNED_DATE' },
          { name: 'Actual production dates', source: 'PRODUCTION_ACTUAL.COMPLETION_DATE' },
          { name: 'Planned vs. actual quantities', source: 'PRODUCTION_PLAN.PLANNED_QTY vs. PRODUCTION_ACTUAL.ACTUAL_QTY' },
          { name: 'Variance', source: 'Calculated field (actual - planned)' },
          { name: 'On-time production percentages', source: 'Calculated from plan adherence' }
        ]
      },
      {
        kpi: 'Supplier Quality Report',
        dataPoints: [
          { name: 'Quality audit scores', source: 'SUPPLIER_QUALITY_AUDIT table with audit scores' },
          { name: 'Defect rates', source: 'RECEIPT_QUALITY_INSPECTION with defect counts by supplier' },
          { name: 'Incidents', source: 'QUALITY_INCIDENT table filtered by supplier' },
          { name: 'Corrective actions', source: 'CAPA_RECORD table with action items' },
          { name: 'Status', source: 'CAPA_RECORD.STATUS_CODE' }
        ]
      },
      {
        kpi: 'Hold & Quarantine Report',
        dataPoints: [
          { name: 'SKU', source: 'ITEM_MASTER joined with INVENTORY_HOLD' },
          { name: 'Lot/Batch #', source: 'LOT_MASTER joined with INVENTORY_HOLD' },
          { name: 'Quantity on hold', source: 'INVENTORY_HOLD.QUANTITY' },
          { name: 'Reason for hold', source: 'HOLD_REASON_CODE table with descriptions' },
          { name: 'Date placed on hold', source: 'INVENTORY_HOLD.HOLD_DATE' },
          { name: 'Expected resolution date', source: 'INVENTORY_HOLD.EXPECTED_RESOLUTION_DATE' },
          { name: 'Status', source: 'INVENTORY_HOLD.STATUS_CODE' }
        ]
      }
    ]
  };

  // Render the data sources for the selected category
  const renderDataSources = () => {
    const selectedCategory = categories[selectedTab].id;
    const categoryDataSources = dataSources[selectedCategory];

    return (
      <Box sx={{ mt: 3 }}>
        {categoryDataSources.map((item, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6">{item.kpi}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell><Typography variant="subtitle2">Data Point</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2">WMS Source</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {item.dataPoints.map((dataPoint, dpIndex) => (
                      <TableRow key={dpIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{dataPoint.name}</TableCell>
                        <TableCell>{dataPoint.source}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Sources
      </Typography>
      <Typography variant="body1" paragraph>
        This section provides information about where each KPI and report data point is sourced from in the WMS system.
        Use this as a reference for understanding data lineage and for troubleshooting data issues.
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="data sources tabs"
        >
          {categories.map((category) => (
            <Tab key={category.id} label={category.name} />
          ))}
        </Tabs>
      </Paper>

      {renderDataSources()}
    </Box>
  );
};

export default DataSourcesDashboard;
