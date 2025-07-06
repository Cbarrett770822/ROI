import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
// FileDownloadIcon import removed
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

// Sample data generator for the template download
import { generateSampleData } from '../../utils/sampleDataGenerator';

const Header = ({ isDataLoaded, onResetData }) => {
  const downloadSampleTemplate = () => {
    try {
      console.log('Generating sample data...');
      const sampleData = generateSampleData();
      console.log('Sample data generated:', Object.keys(sampleData));
      
      // Create workbook
      const wb = utils.book_new();
      
      // Add worksheets for each category
      Object.keys(sampleData).forEach(category => {
        console.log(`Processing category: ${category} with ${sampleData[category].length} rows`);
        const ws = utils.json_to_sheet(sampleData[category]);
        utils.book_append_sheet(wb, ws, category);
      });
      
      // Generate Excel file
      console.log('Writing workbook to array...');
      const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create Blob and save file
      console.log('Creating blob and triggering download...');
      const blob = new Blob([wbout], { type: 'application/vnd.ms-excel' });
      
      // Force download using a direct approach as a backup
      try {
        // First try the saveAs from file-saver
        saveAs(blob, 'supply_chain_metrics_template.xlsx');
        console.log('Download initiated with saveAs');
      } catch (saveError) {
        console.error('saveAs failed, trying alternative download method:', saveError);
        
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
        console.log('Fallback download method completed');
      }
      
      console.log('Download template function completed');
    } catch (err) {
      console.error('Error generating template:', err);
      alert('Error generating template. Please check console for details.');
    }
  };

  // Export Data function removed

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#0d47a1',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ height: 80, px: 3 }}>
        <Box 
          component="img" 
          src="/logo.png" 
          alt="WMS Dashboard" 
          sx={{ 
            height: 32, 
            mr: 2,
            display: { xs: 'none', sm: 'block' }
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <Box sx={{ flexGrow: 1, my: 1 }}>
          <Typography 
            variant="subtitle2" 
            component="div" 
            sx={{ 
              fontWeight: 500,
              letterSpacing: '0.0075em',
              color: '#ffffff',
              mb: 0.5
            }}
          >
            WMS Dashboard
          </Typography>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: '0.0075em',
              color: '#ffffff',
              mb: 0.5
            }}
          >
            Supply Chain Metrics Dashboard
          </Typography>
          <Typography 
            variant="caption" 
            component="div" 
            sx={{ 
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            Demo System and Demo data by CB
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained"
            color="secondary" 
            startIcon={<CloudUploadIcon />}
            onClick={downloadSampleTemplate}
            size="small"
            sx={{ 
              borderRadius: '4px',
              textTransform: 'none',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: '#33bfcd',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            Download Template
          </Button>
          
          {isDataLoaded && (
            <Button 
              variant="outlined"
              sx={{ 
                color: '#ffffff', 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '4px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
              startIcon={<RestartAltIcon />}
              onClick={onResetData}
              size="small"
            >
              Reset Data
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
