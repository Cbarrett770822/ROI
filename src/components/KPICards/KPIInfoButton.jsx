import React, { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RecommendIcon from '@mui/icons-material/Recommend';
import CompareIcon from '@mui/icons-material/Compare';

import kpiStories from '../../utils/kpiStories';

/**
 * KPIInfoButton Component
 * 
 * Displays an info button that opens a dialog with detailed information about a KPI
 * including its story, business impact, recommendations, and benchmarks.
 */
const KPIInfoButton = ({ kpiName, color = '#1976d2' }) => {
  const [open, setOpen] = useState(false);
  
  // Get the KPI story data
  const kpiData = kpiStories[kpiName] || {
    title: kpiName,
    story: "No detailed information available for this KPI.",
    impact: "",
    recommendations: [],
    benchmarks: ""
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton 
        size="small" 
        onClick={handleOpen}
        sx={{ 
          position: 'absolute',
          bottom: 8,
          right: 8,
          opacity: 0.6,
          '&:hover': {
            opacity: 1,
            color: color
          }
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ borderLeft: `4px solid ${color}`, pl: 1 }}>
              {kpiData.title} - The Story Behind the Numbers
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              What This Metric Tells Us
            </Typography>
            <Typography variant="body1" paragraph>
              {kpiData.story}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1, color: color }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Business Impact
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {kpiData.impact}
            </Typography>

            {kpiData.recommendations && kpiData.recommendations.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
                  <RecommendIcon sx={{ mr: 1, color: color }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Recommendations
                  </Typography>
                </Box>
                <List dense>
                  {kpiData.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AssessmentIcon fontSize="small" sx={{ color: color }} />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {kpiData.benchmarks && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
                  <CompareIcon sx={{ mr: 1, color: color }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Benchmarks
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {kpiData.benchmarks}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KPIInfoButton;
