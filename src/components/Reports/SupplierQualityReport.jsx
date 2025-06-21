import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';

/**
 * Supplier Quality Metrics Report
 * Shows: Quality metrics for supplier performance.
 * 
 * Fields:
 * - Quality audit scores
 * - Defect rates
 * - Quality incidents
 * - Corrective actions
 */
const SupplierQualityReport = ({ data, supplier, month }) => {
  // In a real application, we would filter the data based on supplier and month
  // For now, we'll use sample data with proper array validation
  const sampleData = [
    {
      auditDate: '2025-06-03',
      auditType: 'Production Line',
      score: 92,
      maxScore: 100,
      defectRate: 0.8,
      incidents: 1,
      correctiveActions: 1,
      status: 'Completed'
    },
    {
      auditDate: '2025-06-08',
      auditType: 'Packaging',
      score: 88,
      maxScore: 100,
      defectRate: 1.2,
      incidents: 2,
      correctiveActions: 2,
      status: 'Completed'
    },
    {
      auditDate: '2025-06-12',
      auditType: 'Raw Materials',
      score: 95,
      maxScore: 100,
      defectRate: 0.5,
      incidents: 0,
      correctiveActions: 0,
      status: 'Completed'
    },
    {
      auditDate: '2025-06-17',
      auditType: 'Sanitation',
      score: 90,
      maxScore: 100,
      defectRate: 0.9,
      incidents: 1,
      correctiveActions: 1,
      status: 'In Progress'
    },
    {
      auditDate: '2025-06-22',
      auditType: 'Process Control',
      score: 85,
      maxScore: 100,
      defectRate: 1.5,
      incidents: 3,
      correctiveActions: 2,
      status: 'In Progress'
    }
  ];

  // Calculate overall metrics with proper validation
  const calculateOverallMetrics = () => {
    try {
      if (!Array.isArray(sampleData) || sampleData.length === 0) {
        return { 
          averageScore: 'N/A', 
          averageDefectRate: 'N/A', 
          totalIncidents: 0, 
          totalCorrectiveActions: 0,
          completedActions: 0
        };
      }
      
      const totalScore = sampleData.reduce((sum, item) => sum + item.score, 0);
      const averageScore = (totalScore / sampleData.length).toFixed(1);
      
      const totalDefectRate = sampleData.reduce((sum, item) => sum + item.defectRate, 0);
      const averageDefectRate = (totalDefectRate / sampleData.length).toFixed(2);
      
      const totalIncidents = sampleData.reduce((sum, item) => sum + item.incidents, 0);
      const totalCorrectiveActions = sampleData.reduce((sum, item) => sum + item.correctiveActions, 0);
      const completedActions = sampleData
        .filter(item => item.status === 'Completed')
        .reduce((sum, item) => sum + item.correctiveActions, 0);
      
      return { 
        averageScore, 
        averageDefectRate, 
        totalIncidents, 
        totalCorrectiveActions,
        completedActions
      };
    } catch (err) {
      console.error('Error calculating overall quality metrics:', err);
      return { 
        averageScore: 'N/A', 
        averageDefectRate: 'N/A', 
        totalIncidents: 0, 
        totalCorrectiveActions: 0,
        completedActions: 0
      };
    }
  };

  // Function to get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    return 'error';
  };

  // Function to get defect rate color
  const getDefectRateColor = (rate) => {
    if (rate <= 0.8) return 'success';
    if (rate <= 1.5) return 'warning';
    return 'error';
  };

  const metrics = calculateOverallMetrics();

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Quality Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" color={getScoreColor(metrics.averageScore)}>
                  {metrics.averageScore}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(metrics.averageScore)} 
                color={getScoreColor(metrics.averageScore)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Defect Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" color={getDefectRateColor(metrics.averageDefectRate)}>
                  {metrics.averageDefectRate}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(metrics.averageDefectRate) * 10} 
                color={getDefectRateColor(metrics.averageDefectRate)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Corrective Actions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4">
                  {metrics.completedActions}/{metrics.totalCorrectiveActions}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(metrics.completedActions / metrics.totalCorrectiveActions) * 100} 
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {((metrics.completedActions / metrics.totalCorrectiveActions) * 100).toFixed(0)}% Complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="supplier quality report">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell><Typography variant="subtitle2">Audit Date</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Audit Type</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Score</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Defect Rate</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Incidents</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Corrective Actions</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.auditDate}</TableCell>
                <TableCell>{row.auditType}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '60%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={row.score} 
                        color={getScoreColor(row.score)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {row.score}/{row.maxScore}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${row.defectRate}%`} 
                    color={getDefectRateColor(row.defectRate)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{row.incidents}</TableCell>
                <TableCell align="right">{row.correctiveActions}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={row.status === 'Completed' ? 'success' : 'warning'} 
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Showing 5 of 5 quality audits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Quality Incidents: {metrics.totalIncidents}
        </Typography>
      </Box>
    </Box>
  );
};

export default SupplierQualityReport;
