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
import { 
  exportAllData, 
  importAllData, 
  deleteAllData,
  selectCompaniesStatus 
} from '../redux/slices/companiesSlice';

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
