import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { generateSampleData } from '../../utils/sampleDataGenerator';
import { write, utils } from 'xlsx';
import { saveAs } from 'file-saver';

const Header = () => {
  // Download template function
  const downloadTemplate = () => {
    try {
      console.log('Generating sample data...');
      const sampleData = generateSampleData();
      console.log('Sample data generated:', Object.keys(sampleData));
      
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
      console.log('Writing workbook to array...');
      const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create Blob and save file
      console.log('Creating blob and triggering download...');
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'supply_chain_metrics_template.xlsx');
      
      console.log('Download template function completed');
    } catch (err) {
      console.error('Error generating template:', err);
      alert('Error generating template. Please check console for details.');
    }
  };
  
  // Reset data function
  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all dashboard data? This will clear any uploaded data.')) {
      // Clear all data from localStorage
      localStorage.removeItem('supplyChainData');
      
      // Generate fresh sample data
      const sampleData = generateSampleData();
      
      // Store the fresh sample data in localStorage
      localStorage.setItem('supplyChainData', JSON.stringify(sampleData));
      
      // Reload the page to show the fresh data
      window.location.reload();
    }
  };

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
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: '0.0075em',
              color: '#ffffff',
              mb: 0.5
            }}
          >
            WMS Demo Dashboard
          </Typography>

        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Download Excel Template">
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<FileDownloadIcon />}
              onClick={downloadTemplate}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
              }}
            >
              Template
            </Button>
          </Tooltip>
          
          <Tooltip title="Reset Dashboard Data">
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<RestartAltIcon />}
              onClick={resetData}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
              }}
            >
              Reset Data
            </Button>
          </Tooltip>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Header;
