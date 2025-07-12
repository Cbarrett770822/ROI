import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { read, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

// Sample data generator for the template download
import { generateSampleData } from '../../utils/sampleDataGenerator';

const DataUploader = ({ onDataLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Process the uploaded Excel file
  const processFile = (file) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = read(data, { type: 'array' });
        
        // Process each worksheet
        const processedData = {};
        
        workbook.SheetNames.forEach(sheetName => {
          // Convert sheet to JSON
          const sheet = workbook.Sheets[sheetName];
          const sheetData = utils.sheet_to_json(sheet);
          
          // Validate data structure
          if (!sheetData || sheetData.length === 0) {
            throw new Error(`Sheet "${sheetName}" is empty or has invalid data structure`);
          }
          
          // Store data by sheet name
          processedData[sheetName] = sheetData;
        });
        
        // Validate required sheets
        const requiredSheets = [
          'OEMManufacturing', 
          'InboundLogistics', 
          'SupplyChainResponsiveness', 
          'Traceability', 
          'SupplierPerformance',
          'ThirdPartyLogistics',
          'Retail',
          'RetailWarehouse'
        ];
        
        const missingSheets = requiredSheets.filter(sheet => !processedData[sheet]);
        
        if (missingSheets.length > 0) {
          throw new Error(`Missing required sheets: ${missingSheets.join(', ')}`);
        }
        
        // Data is valid, update state
        onDataLoaded(processedData);
        setSuccess(true);
        
      } catch (err) {
        console.error('Error processing file:', err);
        setError(err.message || 'Error processing file. Please make sure you are using the correct template.');
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Handle file drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    }
  });

  // Download template function
  const downloadSampleTemplate = () => {
    try {
      console.log('DataUploader: Generating sample data...');
      const sampleData = generateSampleData();
      console.log('DataUploader: Sample data generated:', Object.keys(sampleData));
      
      // Create workbook
      const wb = utils.book_new();
      
      // Add worksheets for each category
      Object.keys(sampleData).forEach(category => {
        try {
          console.log(`Processing category: ${category} with ${sampleData[category].length} rows`);
          const ws = utils.json_to_sheet(sampleData[category]);
          utils.book_append_sheet(wb, ws, category);
        } catch (sheetError) {
          console.error(`Error processing sheet ${category}:`, sheetError);
        }
      });
      
      // Generate Excel file
      console.log('DataUploader: Writing workbook to array...');
      const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create Blob and save file
      console.log('DataUploader: Creating blob and triggering download...');
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      
      // Force download using a direct approach as a backup
      try {
        // First try the saveAs from file-saver
        saveAs(blob, 'supply_chain_metrics_template.xlsx');
        console.log('DataUploader: Download initiated with saveAs');
      } catch (saveError) {
        console.error('DataUploader: saveAs failed, trying alternative download method:', saveError);
        
        // Fallback method using direct URL creation
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'supply_chain_metrics_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('DataUploader: Fallback download method completed');
      }
      
      console.log('DataUploader: Download template function completed');
    } catch (err) {
      console.error('DataUploader: Error generating template:', err);
      alert('Error generating template. Please check console for details.');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      p: 3 
    }}>
      <Typography variant="h4" gutterBottom>
        Supply Chain Metrics Dashboard
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', maxWidth: 600 }}>
        Upload your supply chain metrics data to visualize key performance indicators across your supply chain.
      </Typography>
      
      <Button 
        variant="contained" 
        startIcon={<FileDownloadIcon />}
        onClick={downloadSampleTemplate}
        sx={{ mb: 4 }}
      >
        Download Excel Template
      </Button>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          width: '100%', 
          maxWidth: 600,
          borderRadius: 2,
          backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : 'white',
          border: isDragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          transition: 'all 0.3s ease'
        }}
      >
        <Box 
          {...getRootProps()} 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            cursor: 'pointer'
          }}
        >
          <input {...getInputProps()} />
          
          <CloudUploadIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Typography variant="body1" textAlign="center">
              {isDragActive
                ? "Drop the Excel file here..."
                : "Drag & drop your Excel file here, or click to select file"}
            </Typography>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 3, width: '100%', maxWidth: 600 }}>
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          </Fade>
        )}
        
        {success && (
          <Fade in={success}>
            <Alert severity="success">Data loaded successfully!</Alert>
          </Fade>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your data is stored locally in your browser and is not sent to any server.
          To save your work permanently, use the "Export Data" button in the header.
        </Typography>
      </Box>
    </Box>
  );
};

export default DataUploader;
