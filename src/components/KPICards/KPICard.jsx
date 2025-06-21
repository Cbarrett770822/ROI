import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

const KPICard = ({ 
  title, 
  value, 
  unit = '', 
  trend = null, 
  trendDirection = null, 
  chart = null, 
  description = '',
  color = '#1976d2'
}) => {
  const [expanded, setExpanded] = useState(false);

  // Format the value for display
  const formattedValue = typeof value === 'number' ? 
    value % 1 === 0 ? value.toLocaleString() : value.toFixed(1).toLocaleString() : 
    value;

  // Determine trend color
  const getTrendColor = () => {
    if (!trendDirection) return 'text.secondary';
    return trendDirection === 'up' ? 'success.main' : 'error.main';
  };

  // Determine trend icon
  const getTrendIcon = () => {
    if (!trendDirection) return null;
    return trendDirection === 'up' ? '↑' : '↓';
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          },
          position: 'relative'
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ 
            borderLeft: `4px solid ${color}`, 
            pl: 1, 
            mb: 1.5 
          }}>
            <Typography variant="h6" component="div" noWrap>
              {title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {formattedValue}
            </Typography>
            {unit && (
              <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {unit}
              </Typography>
            )}
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color={getTrendColor()}>
                {getTrendIcon()} {trend}
              </Typography>
            </Box>
          )}
          
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
        </CardContent>
        
        {chart && (
          <Box sx={{ px: 2, pb: 2, flexGrow: 1, minHeight: 100 }}>
            {chart}
          </Box>
        )}
        
        <IconButton 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            opacity: 0.6,
            '&:hover': {
              opacity: 1
            }
          }}
          onClick={() => setExpanded(true)}
          size="small"
        >
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Card>
      
      {/* Expanded view dialog */}
      <Dialog 
        open={expanded} 
        onClose={() => setExpanded(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ borderLeft: `4px solid ${color}`, pl: 1 }}>
              {title}
            </Typography>
            <IconButton onClick={() => setExpanded(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {formattedValue}
              </Typography>
              {unit && (
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                  {unit}
                </Typography>
              )}
            </Box>
            
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color={getTrendColor()}>
                  {getTrendIcon()} {trend}
                </Typography>
              </Box>
            )}
            
            {description && (
              <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                {description}
              </Typography>
            )}
          </Box>
          
          {chart && (
            <Box sx={{ height: 400 }}>
              {chart}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpanded(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KPICard;
