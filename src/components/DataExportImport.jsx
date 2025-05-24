import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import TableChartIcon from '@mui/icons-material/TableChart';
import { 
  exportAllData, 
  importAllData, 
  deleteAllData,
  exportQuestionnaireToExcel,
  selectCompaniesStatus 
} from '../redux/slices/companiesSlice';
import { useSelector as useReduxSelector } from 'react-redux';

/**
 * Component for exporting and importing data
 */
const DataExportImport = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectCompaniesStatus);
  const fileInputRef = useRef(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState({ success: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Get questionnaire questions from the store
  const questions = useReduxSelector(state => state.questionnaire.questions);

  // Handle export button click
  const handleExport = async () => {
    setIsLoading(true);
    try {
      await dispatch(exportAllData()).unwrap();
      setIsLoading(false);
    } catch (error) {
      console.error('Export failed:', error);
      setIsLoading(false);
    }
  };
  
  // Handle Excel export button click
  const handleExcelExport = async () => {
    setIsLoading(true);
    try {
      console.log('Exporting questionnaire to Excel with questions:', questions);
      
      // Use comprehensive mock questions covering all categories
      const completeQuestions = [
        // Financial & Operational Metrics
        {
          id: 'metrics_1',
          category: 'Financial & Operational Metrics',
          text: 'What is your company\'s annual revenue? (in millions)',
          type: 'number',
          prefix: '$',
          suffix: ' million'
        },
        {
          id: 'metrics_2',
          category: 'Financial & Operational Metrics',
          text: 'What is your company\'s operating margin percentage?',
          type: 'number',
          prefix: '',
          suffix: '%'
        },
        {
          id: 'metrics_3',
          category: 'Financial & Operational Metrics',
          text: 'What is the total number of full-time employees (FTEs) in your warehouse operations?',
          type: 'number',
          prefix: '',
          suffix: 'FTEs'
        },
        {
          id: 'metrics_4',
          category: 'Financial & Operational Metrics',
          text: 'What is the average annual cost per FTE (including benefits)? (in thousands)',
          type: 'number',
          prefix: '$',
          suffix: 'K'
        },
        {
          id: 'metrics_5',
          category: 'Financial & Operational Metrics',
          text: 'What is the annual value of waste/damaged/obsolete inventory? (in millions)',
          type: 'number',
          prefix: '$',
          suffix: ' million'
        },
        {
          id: 'metrics_6',
          category: 'Financial & Operational Metrics',
          text: 'What is your annual transportation cost? (in millions)',
          type: 'number',
          prefix: '$',
          suffix: ' million'
        },
        {
          id: 'metrics_7',
          category: 'Financial & Operational Metrics',
          text: 'How many warehouses does your company operate?',
          type: 'number'
        },
        {
          id: 'metrics_8',
          category: 'Financial & Operational Metrics',
          text: 'What is the total size of your warehouses?',
          type: 'number',
          suffix: 'sq ft'
        },
        {
          id: 'metrics_9',
          category: 'Financial & Operational Metrics',
          text: 'What is your annual inbound transaction volume (number of receipts)?',
          type: 'number'
        },
        {
          id: 'metrics_10',
          category: 'Financial & Operational Metrics',
          text: 'What is your annual outbound transaction volume (number of shipments)?',
          type: 'number'
        },
        
        // Warehouse Infrastructure
        {
          id: 'warehouse_1',
          category: 'Warehouse Infrastructure',
          text: 'How would you rate the overall layout efficiency of your warehouse?',
          type: 'select',
          options: ['Poor - Inefficient layout with significant travel distances', 'Fair - Some layout optimization but room for improvement', 'Good - Well-designed layout with minimal travel distances', 'Excellent - Optimized layout with strategic product placement']
        },
        {
          id: 'warehouse_2',
          category: 'Warehouse Infrastructure',
          text: 'What storage systems are currently in use at your facility?',
          type: 'select',
          options: ['Basic - Primarily floor storage and simple shelving', 'Standard - Mix of shelving and some racking systems', 'Advanced - Various racking systems optimized for different products', 'Sophisticated - Automated storage and retrieval systems (AS/RS)']
        },
        {
          id: 'warehouse_3',
          category: 'Warehouse Infrastructure',
          text: 'How would you rate your warehouse space utilization?',
          type: 'select',
          options: ['Poor - Significant wasted space or overcrowding', 'Fair - Some optimization but inconsistent utilization', 'Good - Efficient use of most available space', 'Excellent - Maximized cubic utilization with flexibility for growth']
        },
        {
          id: 'warehouse_4',
          category: 'Warehouse Infrastructure',
          text: 'What level of dock and staging area efficiency exists in your facility?',
          type: 'select',
          options: ['Low - Frequent bottlenecks and congestion', 'Moderate - Occasional congestion during peak periods', 'High - Well-organized with minimal congestion', 'Very High - Optimized flow with scheduled appointments and load planning']
        },
        
        // Inventory Management
        {
          id: 'inventory_1',
          category: 'Inventory Management',
          text: 'How effectively do you manage inventory levels?',
          type: 'select',
          options: ['Ineffective - Frequent stockouts or excess inventory', 'Somewhat effective - Occasional issues with inventory levels', 'Effective - Rare inventory issues', 'Highly effective - Optimal inventory levels consistently maintained']
        },
        {
          id: 'inventory_2',
          category: 'Inventory Management',
          text: 'What is your current inventory accuracy level?',
          type: 'select',
          options: ['Below 90% - Frequent discrepancies', '90-95% - Regular cycle counts needed', '95-98% - Good accuracy with occasional adjustments', '98%+ - Excellent accuracy with minimal adjustments']
        },
        {
          id: 'inventory_3',
          category: 'Inventory Management',
          text: 'How do you manage inventory replenishment?',
          type: 'select',
          options: ['Reactive - Ordering when stockouts occur or are imminent', 'Basic - Simple min/max or reorder point systems', 'Advanced - Forecasting-based with safety stock calculations', 'Sophisticated - Automated with demand sensing and dynamic adjustments']
        },
        {
          id: 'inventory_4',
          category: 'Inventory Management',
          text: 'What inventory classification method do you use?',
          type: 'select',
          options: ['None - No formal classification system', 'Basic - Simple ABC analysis', 'Advanced - Multi-criteria classification (value, velocity, criticality)', 'Sophisticated - Dynamic classification with automated adjustments']
        },
        {
          id: 'inventory_5',
          category: 'Inventory Management',
          text: 'How do you handle slow-moving or obsolete inventory?',
          type: 'select',
          options: ['Reactive - Address only when space is needed', 'Basic - Periodic review and manual identification', 'Proactive - Regular analysis and planned disposition', 'Strategic - Automated identification with optimized disposition channels']
        },
        
        // Warehouse Operations
        {
          id: 'operations_1',
          category: 'Warehouse Operations',
          text: 'How would you rate your receiving process efficiency?',
          type: 'select',
          options: ['Low - Manual processes with frequent delays', 'Moderate - Semi-automated with occasional bottlenecks', 'High - Streamlined processes with minimal delays', 'Very High - Fully optimized with advanced scheduling and cross-docking']
        },
        {
          id: 'operations_2',
          category: 'Warehouse Operations',
          text: 'What is your current order picking methodology?',
          type: 'select',
          options: ['Basic - Single order picking', 'Standard - Batch picking for some orders', 'Advanced - Zone picking with consolidation', 'Sophisticated - Wave/cluster picking with automation support']
        },
        {
          id: 'operations_3',
          category: 'Warehouse Operations',
          text: 'How do you manage your packing and shipping processes?',
          type: 'select',
          options: ['Manual - Paper-based with minimal technology', 'Basic - Some automation but primarily manual', 'Advanced - Automated systems with integrated shipping', 'Sophisticated - Fully automated with cartonization and load optimization']
        },
        {
          id: 'operations_4',
          category: 'Warehouse Operations',
          text: 'What quality control measures are in place for warehouse operations?',
          type: 'select',
          options: ['Minimal - Reactive approach to quality issues', 'Basic - Some quality checks at key points', 'Comprehensive - Systematic quality controls throughout processes', 'Advanced - Predictive quality management with continuous improvement']
        },
        {
          id: 'operations_5',
          category: 'Warehouse Operations',
          text: 'How do you handle returns processing?',
          type: 'select',
          options: ['Ad-hoc - No formal process', 'Basic - Defined process but largely manual', 'Efficient - Streamlined process with quick disposition', 'Optimized - Automated returns processing with value recovery focus']
        },
        
        // Workforce Management
        {
          id: 'workforce_1',
          category: 'Workforce Management',
          text: 'How do you manage warehouse staffing levels?',
          type: 'select',
          options: ['Reactive - Adjusting only when problems arise', 'Basic - Simple scheduling based on historical patterns', 'Advanced - Data-driven scheduling based on forecasted workload', 'Sophisticated - Dynamic labor management with real-time adjustments']
        },
        {
          id: 'workforce_2',
          category: 'Workforce Management',
          text: 'What training programs exist for warehouse personnel?',
          type: 'select',
          options: ['Minimal - Basic onboarding only', 'Standard - Role-specific training', 'Comprehensive - Continuous skill development and cross-training', 'Advanced - Personalized development paths with certification programs']
        },
        {
          id: 'workforce_3',
          category: 'Workforce Management',
          text: 'How do you measure and manage workforce productivity?',
          type: 'select',
          options: ['Limited - Few or no productivity metrics', 'Basic - Simple productivity tracking', 'Advanced - Comprehensive KPIs with regular feedback', 'Sophisticated - Real-time productivity monitoring with incentive programs']
        },
        {
          id: 'workforce_4',
          category: 'Workforce Management',
          text: 'What is your approach to safety management in the warehouse?',
          type: 'select',
          options: ['Reactive - Addressing issues after incidents', 'Basic - Standard safety protocols and training', 'Proactive - Comprehensive safety program with preventative measures', 'Strategic - Safety-first culture with continuous improvement']
        },
        
        // Technology & Automation
        {
          id: 'technology_1',
          category: 'Technology & Automation',
          text: 'What level of warehouse management system (WMS) do you currently use?',
          type: 'select',
          options: ['Basic - Spreadsheets or simple inventory tracking', 'Standard - Basic WMS with core functionality', 'Advanced - Comprehensive WMS with multiple modules', 'Sophisticated - Fully integrated WMS with advanced analytics']
        },
        {
          id: 'technology_2',
          category: 'Technology & Automation',
          text: 'What level of automation exists in your warehouse operations?',
          type: 'select',
          options: ['Minimal - Primarily manual processes', 'Basic - Some automation of routine tasks', 'Advanced - Significant automation with some manual oversight', 'Comprehensive - Highly automated with minimal manual intervention']
        },
        {
          id: 'technology_3',
          category: 'Technology & Automation',
          text: 'How do you utilize data and analytics in warehouse decision-making?',
          type: 'select',
          options: ['Limited - Minimal use of data for decisions', 'Basic - Regular reporting of key metrics', 'Advanced - Analytics-driven decisions with dashboards', 'Sophisticated - Predictive analytics and AI-assisted decision making']
        },
        {
          id: 'technology_4',
          category: 'Technology & Automation',
          text: 'What material handling equipment and technology do you employ?',
          type: 'select',
          options: ['Basic - Manual equipment (hand trucks, manual pallet jacks)', 'Standard - Powered equipment (forklifts, powered pallet jacks)', 'Advanced - Specialized equipment for different operations', 'Sophisticated - Automated guided vehicles (AGVs) or robotics']
        },
        
        // Supply Chain Integration
        {
          id: 'integration_1',
          category: 'Supply Chain Integration',
          text: 'How would you rate your current supply chain visibility?',
          type: 'select',
          options: ['Poor - Limited visibility across the supply chain', 'Fair - Some visibility but significant gaps exist', 'Good - Visibility across most of the supply chain', 'Excellent - Complete end-to-end visibility']
        },
        {
          id: 'integration_2',
          category: 'Supply Chain Integration',
          text: 'What level of integration exists between your warehouse and other supply chain systems?',
          type: 'select',
          options: ['Minimal - Largely disconnected systems', 'Basic - Some integration with manual interventions', 'Advanced - Automated integration with key systems', 'Comprehensive - Fully integrated supply chain ecosystem']
        },
        {
          id: 'integration_3',
          category: 'Supply Chain Integration',
          text: 'How would you describe your supplier relationship management?',
          type: 'select',
          options: ['Transactional - Limited communication with suppliers', 'Developing - Regular communication but limited collaboration', 'Collaborative - Active partnership with key suppliers', 'Strategic - Deep integration and shared objectives with suppliers']
        }
      ];
      
      console.log('Using complete questions for Excel export:', completeQuestions);
      
      const result = await dispatch(exportQuestionnaireToExcel({ 
        questions: completeQuestions,
        companyId: null
      })).unwrap();
      
      console.log('Excel export result:', result);
      setIsLoading(false);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert(`Excel export failed: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  // Handle import button click
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setImportDialogOpen(true);
    
    try {
      await dispatch(importAllData(file)).unwrap();
      setImportResult({
        success: true,
        message: 'Data imported successfully! The application will reload to apply changes.'
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: `Import failed: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setImportDialogOpen(false);
    if (importResult.success) {
      // Reload the application to apply imported data
      window.location.reload();
    }
  };

  // Handle delete all data button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setDeleteConfirmation('');
  };

  // Handle delete dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmation('');
  };

  // Handle delete confirmation
  const handleDeleteConfirmationChange = (e) => {
    setDeleteConfirmation(e.target.value);
  };

  // Handle delete all data
  const handleDeleteAllData = async () => {
    setIsLoading(true);
    try {
      await dispatch(deleteAllData()).unwrap();
      setIsLoading(false);
      setDeleteDialogOpen(false);
      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={isLoading}
        >
          Export Data
        </Button>
        <Button
          variant="outlined"
          startIcon={<TableChartIcon />}
          onClick={handleExcelExport}
          disabled={isLoading}
          title="Export questionnaire in Excel format with each category in a different tab"
        >
          Export Questionnaire (Excel)
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handleImportClick}
          disabled={isLoading}
        >
          Import Data
        </Button>
        <Tooltip title="Delete all companies and questionnaire data">
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleDeleteClick}
            disabled={isLoading}
          >
            Delete All Data
          </Button>
        </Tooltip>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>

      {/* Import Result Dialog */}
      <Dialog open={importDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {isLoading ? 'Importing Data...' : 'Import Result'}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Alert severity={importResult.success ? 'success' : 'error'}>
              {importResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            {importResult.success ? 'Reload App' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          {isLoading ? 'Deleting Data...' : 'Confirm Delete All Data'}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action will permanently delete all companies and questionnaire data. This cannot be undone.
              </Alert>
              <Typography variant="body2" gutterBottom>
                Type <b>DELETE</b> to confirm:
              </Typography>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={handleDeleteConfirmationChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAllData} 
            disabled={isLoading || deleteConfirmation !== 'DELETE'}
            color="error"
          >
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataExportImport;
