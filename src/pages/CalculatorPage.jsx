import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Snackbar
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';

// Import selectors
import { selectActiveCompany } from '../redux/slices/companiesSlice';
import { selectAnswers, selectQuestions, selectQuestionnaireStatus } from '../redux/slices/questionnaireSlice';
import { setLoading } from '../redux/slices/uiSlice';

// Import utilities
import { generatePDFReport } from '../utils/pdfReportGenerator';

const CalculatorPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeCompany = useSelector(selectActiveCompany);
  const answers = useSelector(selectAnswers);
  const questions = useSelector(selectQuestions);
  const status = useSelector(selectQuestionnaireStatus);
  const loading = status === 'loading';
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [showDetails, setShowDetails] = useState({});
  
  // Local state for calculated results
  const [results, setResults] = useState({
    summary: {
      costSavings: 0,
      timeReduction: 0,
      qualityImprovement: 0,
      roi: 0,
      paybackPeriodMonths: 0
    },
    categoryScores: {},
    improvementAreas: [],
    projections: {
      year1: { costs: 0, savings: 0, netBenefit: 0 },
      year2: { costs: 0, savings: 0, netBenefit: 0 },
      year3: { costs: 0, savings: 0, netBenefit: 0 },
      year4: { costs: 0, savings: 0, netBenefit: 0 },
      year5: { costs: 0, savings: 0, netBenefit: 0 }
    }
  });
  
  // Group questions by category
  const categorizedQuestions = useMemo(() => {
    if (!questions.length) return {};
    
    const grouped = {};
    questions.forEach(question => {
      if (!grouped[question.category]) {
        grouped[question.category] = [];
      }
      grouped[question.category].push(question);
    });
    return grouped;
  }, [questions]);
  
  // Get unique categories in order
  const categories = useMemo(() => {
    return Object.keys(categorizedQuestions);
  }, [categorizedQuestions]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Navigate back to questionnaire
  const handleBackToQuestionnaire = () => {
    dispatch(setLoading(true));
    navigate(`/questionnaire/${companyId}`);
  };
  
  // State for notification
  const [notification, setNotification] = useState({ open: false, message: '' });

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle report download
  const handleDownloadReport = () => {
    try {
      console.log('Active company:', activeCompany);
      console.log('Results:', results);
      
      // Prepare data for the PDF report
      const reportData = {
        company: activeCompany,
        results: results
      };
      
      console.log('Report data prepared:', reportData);
      
      // Generate the PDF report
      const pdfDoc = generatePDFReport(reportData);
      
      console.log('PDF document generated successfully');
      
      // Save the PDF file
      const fileName = `${activeCompany.name.replace(/\s+/g, '_')}_Supply_Chain_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfDoc.save(fileName);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Report downloaded successfully!'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Show error notification
      setNotification({
        open: true,
        message: 'Error generating report. Please try again.'
      });
    }
  };

  // Calculate ROI based on questionnaire answers
  useEffect(() => {
    if (Object.keys(answers).length > 0 && categories.length > 0) {
      const calculateResults = () => {
        // Convert string values to numbers for calculation
        const numericAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
          acc[key] = parseFloat(value) || 0;
          return acc;
        }, {});
        
        // Extract financial & operational metrics
        const financialMetrics = {
          annualRevenue: numericAnswers['metrics_1'] || 0,
          operatingMargin: numericAnswers['metrics_2'] || 0,
          totalFTEs: numericAnswers['metrics_3'] || 0,
          costPerFTE: numericAnswers['metrics_4'] || 0,
          annualWasteValue: numericAnswers['metrics_5'] || 0,
          transportationCost: numericAnswers['metrics_6'] || 0,
          warehouseCount: numericAnswers['metrics_7'] || 0,
          warehouseSize: numericAnswers['metrics_8'] || 0,
          inboundVolume: numericAnswers['metrics_9'] || 0,
          outboundVolume: numericAnswers['metrics_10'] || 0,
          licenseCost: numericAnswers['implementation_1'] || 0,
          implementationCost: numericAnswers['implementation_2'] || 0
        };
        
        // Calculate total labor cost
        const totalLaborCost = financialMetrics.totalFTEs * financialMetrics.costPerFTE;
        
        // Calculate category scores
        const categoryScores = {};
        let totalPossibleScore = 0;
        let totalActualScore = 0;
        
        // Calculate scores for each category (excluding Financial & Operational Metrics)
        Object.entries(categorizedQuestions).forEach(([category, categoryQuestions]) => {
          if (category === 'Financial & Operational Metrics') return;
          
          const possibleScore = categoryQuestions.length * 4; // Max score is 4 per question
          let actualScore = 0;
          
          categoryQuestions.forEach(question => {
            actualScore += numericAnswers[question.id] || 0;
          });
          
          const percentScore = Math.round((actualScore / possibleScore) * 100);
          categoryScores[category] = {
            possibleScore,
            actualScore,
            percentScore
          };
          
          totalPossibleScore += possibleScore;
          totalActualScore += actualScore;
        });
        
        // Calculate overall score percentage
        const overallScorePercent = Math.round((totalActualScore / totalPossibleScore) * 100);
        
        // Use user-provided license and implementation costs
        const licenseCost = financialMetrics.licenseCost || 0;
        const directImplementationCost = financialMetrics.implementationCost || 0;
        
        // Total implementation cost is the sum of license and implementation costs
        const implementationCost = licenseCost + directImplementationCost;
        
        // Calculate potential savings based on actual metrics
        const savings = {};
        
        // Labor efficiency savings
        const laborEfficiencyImprovement = categoryScores['Workforce Management']?.percentScore / 100 || 0.1;
        savings.labor = totalLaborCost * laborEfficiencyImprovement * 0.2; // 20% of potential improvement
        
        // Inventory reduction savings
        const inventoryReductionRate = categoryScores['Inventory Management']?.percentScore / 100 || 0.1;
        const estimatedInventoryValue = financialMetrics.annualRevenue * 0.2; // Estimate inventory as 20% of revenue
        const inventoryCarryingCost = estimatedInventoryValue * 0.25; // 25% carrying cost
        savings.inventory = inventoryCarryingCost * inventoryReductionRate * 0.3; // 30% of potential improvement
        
        // Waste reduction savings
        const wasteReductionRate = categoryScores['Warehouse Operations']?.percentScore / 100 || 0.1;
        savings.waste = financialMetrics.annualWasteValue * wasteReductionRate * 0.4; // 40% of potential improvement
        
        // Space utilization savings
        const spaceUtilizationImprovement = categoryScores['Warehouse Infrastructure']?.percentScore / 100 || 0.1;
        const warehouseCostPerSqFt = 15; // Average cost per square foot
        const potentialSpaceSavings = financialMetrics.warehouseSize * spaceUtilizationImprovement * 0.25; // 25% of potential improvement
        savings.space = potentialSpaceSavings * warehouseCostPerSqFt;
        
        // Transportation optimization savings
        const transportationImprovement = categoryScores['Supply Chain Integration']?.percentScore / 100 || 0.1;
        savings.transportation = financialMetrics.transportationCost * transportationImprovement * 0.15; // 15% of potential improvement
        
        // Productivity improvement
        const productivityImprovement = categoryScores['Technology & Automation']?.percentScore / 100 || 0.1;
        const transactionVolume = financialMetrics.inboundVolume + financialMetrics.outboundVolume;
        const costPerTransaction = (totalLaborCost * 0.7) / (transactionVolume || 1); // 70% of labor cost attributed to transactions
        savings.productivity = transactionVolume * costPerTransaction * productivityImprovement * 0.3; // 30% of potential improvement
        
        // Quality improvement savings
        const qualityImprovement = categoryScores['Performance Measurement']?.percentScore / 100 || 0.1;
        const estimatedQualityCost = financialMetrics.annualRevenue * 0.02; // 2% of revenue
        savings.quality = estimatedQualityCost * qualityImprovement * 0.35; // 35% of potential improvement
        
        // Compliance savings
        const complianceImprovement = categoryScores['Sustainability & Compliance']?.percentScore / 100 || 0.1;
        const estimatedComplianceCost = financialMetrics.annualRevenue * 0.01; // 1% of revenue
        savings.compliance = estimatedComplianceCost * complianceImprovement * 0.25; // 25% of potential improvement
        
        // Calculate total annual savings
        const annualSavings = Object.values(savings).reduce((sum, value) => sum + value, 0);
        
        // Calculate ROI metrics
        const costSavings = annualSavings;
        const timeReduction = Math.round(overallScorePercent / 3); // Process time improvement
        const qualityImprovementPercent = Math.round(overallScorePercent / 2.5); // Quality metrics improvement
        const roi = Math.round((annualSavings * 5 - implementationCost) / implementationCost * 100); // 5-year ROI
        const paybackPeriodMonths = Math.round((implementationCost / annualSavings) * 12);
        
        // Calculate 5-year projections
        const projections = {
          year1: { 
            costs: implementationCost * 0.7, // 70% of costs in year 1
            savings: annualSavings * 0.5, // 50% of full savings in year 1
            netBenefit: (annualSavings * 0.5) - (implementationCost * 0.7)
          },
          year2: { 
            costs: implementationCost * 0.3, // 30% of costs in year 2
            savings: annualSavings * 0.8, // 80% of full savings in year 2
            netBenefit: (annualSavings * 0.8) - (implementationCost * 0.3)
          },
          year3: { 
            costs: implementationCost * 0.1, // Maintenance costs
            savings: annualSavings * 1.0, // Full savings
            netBenefit: annualSavings - (implementationCost * 0.1)
          },
          year4: { 
            costs: implementationCost * 0.1, // Maintenance costs
            savings: annualSavings * 1.1, // Increased savings due to optimization
            netBenefit: (annualSavings * 1.1) - (implementationCost * 0.1)
          },
          year5: { 
            costs: implementationCost * 0.1, // Maintenance costs
            savings: annualSavings * 1.2, // Further increased savings
            netBenefit: (annualSavings * 1.2) - (implementationCost * 0.1)
          }
        };
        
        // Calculate detailed savings breakdown
        const savingsBreakdown = Object.entries(savings).map(([category, amount]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount,
          percentage: Math.round((amount / annualSavings) * 100)
        })).sort((a, b) => b.amount - a.amount);
        
        // Identify top improvement areas
        const improvementAreas = Object.entries(categoryScores)
          .map(([category, score]) => {
            // Calculate potential additional savings based on gap to perfect score
            const gap = score.possibleScore - score.actualScore;
            const potentialFactor = gap / score.possibleScore;
            let potentialSavings = 0;
            
            switch(category) {
              case 'Workforce Management':
                potentialSavings = totalLaborCost * 0.2 * potentialFactor;
                break;
              case 'Inventory Management':
                potentialSavings = inventoryCarryingCost * 0.3 * potentialFactor;
                break;
              case 'Warehouse Operations':
                potentialSavings = financialMetrics.annualWasteValue * 0.4 * potentialFactor;
                break;
              case 'Warehouse Infrastructure':
                potentialSavings = financialMetrics.warehouseSize * warehouseCostPerSqFt * 0.25 * potentialFactor;
                break;
              case 'Supply Chain Integration':
                potentialSavings = financialMetrics.transportationCost * 0.15 * potentialFactor;
                break;
              case 'Technology & Automation':
                potentialSavings = transactionVolume * costPerTransaction * 0.3 * potentialFactor;
                break;
              case 'Performance Measurement':
                potentialSavings = estimatedQualityCost * 0.35 * potentialFactor;
                break;
              case 'Sustainability & Compliance':
                potentialSavings = estimatedComplianceCost * 0.25 * potentialFactor;
                break;
              default:
                potentialSavings = annualSavings * 0.05 * potentialFactor;
            }
            
            return {
              category,
              percentScore: score.percentScore,
              potentialSavings
            };
          })
          .sort((a, b) => b.potentialSavings - a.potentialSavings)
          .slice(0, 3);
        
        setResults({
          summary: {
            costSavings,
            timeReduction,
            qualityImprovement: qualityImprovementPercent,
            roi,
            paybackPeriodMonths,
            implementationCost,
            licenseCost: financialMetrics.licenseCost,
            directImplementationCost: financialMetrics.implementationCost,
            annualSavings,
            overallScorePercent
          },
          categoryScores,
          improvementAreas,
          savingsBreakdown,
          financialMetrics,
          projections
        });
      };
      
      calculateResults();
    }
  }, [answers, categorizedQuestions, categories]);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage values
  const formatPercent = (value) => {
    return `${value}%`;
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Warehouse Infrastructure':
        return <WarehouseIcon />;
      case 'Inventory Management':
        return <InventoryIcon />;
      case 'Workforce Management':
        return <PeopleIcon />;
      case 'Technology & Automation':
        return <SettingsIcon />;
      case 'Performance Measurement':
        return <AssessmentIcon />;
      case 'Supply Chain Integration':
        return <TimelineIcon />;
      case 'Sustainability & Compliance':
        return <StorageIcon />;
      default:
        return <SpeedIcon />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activeCompany) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        Company not found. Please select a company first.
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              ROI Calculator Results
            </Typography>
            
            <Typography variant="h6" color="primary" gutterBottom>
              Company: {activeCompany.name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToQuestionnaire}
            >
              Back to Questionnaire
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Summary Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Based on your responses to the supply chain assessment questionnaire, 
            we've calculated the following potential benefits:
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Annual Cost Savings
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(results.summary.costSavings)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated annual cost reduction
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ROI
                  </Typography>
                  <Typography variant="h4">
                    {formatPercent(results.summary.roi)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    5-year return on investment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Payback Period
                  </Typography>
                  <Typography variant="h4">
                    {results.summary.paybackPeriodMonths} months
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time to recover implementation costs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Implementation Cost
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(results.summary.implementationCost)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated total implementation cost
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Tabbed Interface */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="ROI calculator tabs" variant="scrollable" scrollButtons="auto">
              <Tab label="Savings Breakdown" icon={<AssessmentIcon />} iconPosition="start" />
              <Tab label="5-Year Projection" icon={<TimelineIcon />} iconPosition="start" />
              <Tab label="Improvement Areas" icon={<SpeedIcon />} iconPosition="start" />
              <Tab label="Category Analysis" icon={<WarehouseIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Savings Breakdown Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Savings Breakdown</Typography>
              <Typography variant="body2" paragraph>
                Based on your assessment responses and operational metrics, we've identified the following annual savings opportunities:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Annual Savings</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.savingsBreakdown?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                            <TableCell align="right">{formatPercent(item.percentage)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '2px solid rgba(224, 224, 224, 1)' } }}>
                          <TableCell>Total Annual Savings</TableCell>
                          <TableCell align="right">{formatCurrency(results.summary.annualSavings)}</TableCell>
                          <TableCell align="right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Additional Benefits</Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Process Time Reduction</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={results.summary.timeReduction} sx={{ height: 10, borderRadius: 5 }} />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{formatPercent(results.summary.timeReduction)}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Quality Improvement</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={results.summary.qualityImprovement} sx={{ height: 10, borderRadius: 5 }} />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{formatPercent(results.summary.qualityImprovement)}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          These non-financial benefits contribute to overall operational excellence and customer satisfaction, which may lead to additional revenue opportunities not quantified in this analysis.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* 5-Year Projection Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>5-Year Financial Projection</Typography>
              <Typography variant="body2" paragraph>
                This projection shows the estimated costs, savings, and net benefits over a 5-year period:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Implementation Costs</TableCell>
                      <TableCell align="right">Annual Savings</TableCell>
                      <TableCell align="right">Net Benefit</TableCell>
                      <TableCell align="right">Cumulative Benefit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(results.projections || {}).map(([year, data], index) => {
                      const cumulativeBenefit = Object.entries(results.projections || {})
                        .filter((_, i) => i <= index)
                        .reduce((sum, [_, yearData]) => sum + yearData.netBenefit, 0);
                      
                      return (
                        <TableRow key={year}>
                          <TableCell>Year {index + 1}</TableCell>
                          <TableCell align="right">{formatCurrency(data.costs)}</TableCell>
                          <TableCell align="right">{formatCurrency(data.savings)}</TableCell>
                          <TableCell align="right">{formatCurrency(data.netBenefit)}</TableCell>
                          <TableCell align="right">{formatCurrency(cumulativeBenefit)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Note: Year 1 shows partial benefits as implementation is completed. Maintenance costs in years 3-5 represent ongoing support and updates.
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Improvement Areas Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top Improvement Opportunities</Typography>
              <Typography variant="body2" paragraph>
                Based on your assessment, we've identified these key areas where improvements would yield the highest returns:
              </Typography>
              
              <Grid container spacing={3}>
                {results.improvementAreas?.map((area, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ mr: 1 }}>
                            {getCategoryIcon(area.category)}
                          </Box>
                          <Typography variant="h6">{area.category}</Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Current Score</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={area.percentScore} 
                                sx={{ height: 10, borderRadius: 5 }} 
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">{formatPercent(area.percentScore)}</Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom>Potential Additional Savings</Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          {formatCurrency(area.potentialSavings)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          Improving this area could yield significant additional savings beyond the current baseline.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Category Analysis Tab */}
          {activeTab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Category Performance Analysis</Typography>
              <Typography variant="body2" paragraph>
                This analysis shows your performance across all assessment categories:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell align="right">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(results.categoryScores || {}).map(([category, score]) => (
                      <TableRow key={category}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1 }}>
                              {getCategoryIcon(category)}
                            </Box>
                            <Typography>{category}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={score.percentScore} 
                                sx={{ 
                                  height: 10, 
                                  borderRadius: 5,
                                  bgcolor: 'background.paper',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: score.percentScore < 50 ? 'error.main' : 
                                            score.percentScore < 70 ? 'warning.main' : 
                                            score.percentScore < 90 ? 'info.main' : 'success.main',
                                  },
                                }} 
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2">{formatPercent(score.percentScore)}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={
                              score.percentScore < 50 ? 'Needs Improvement' : 
                              score.percentScore < 70 ? 'Average' : 
                              score.percentScore < 90 ? 'Good' : 'Excellent'
                            }
                            color={
                              score.percentScore < 50 ? 'error' : 
                              score.percentScore < 70 ? 'warning' : 
                              score.percentScore < 90 ? 'info' : 'success'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Note: These scores are based on your assessment responses and provide a relative measure of maturity in each category.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            How ROI is Calculated
          </Typography>
          
          <Typography variant="body2" paragraph>
            The Return on Investment (ROI) calculation in this assessment follows a comprehensive methodology that combines your questionnaire responses with industry benchmarks to provide realistic estimates of potential benefits from supply chain optimization.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Score Computation
          </Typography>
          
          <Typography variant="body2" paragraph>
            Each category score is calculated based on your responses to the assessment questions:
            <br />• Each question has a maximum score of 4 points (representing the most advanced level)
            <br />• The actual score for each category is the sum of all your answers in that category
            <br />• The percentage score is calculated as: (Actual Score ÷ Maximum Possible Score) × 100
            <br />• The overall score is the weighted average of all category scores (excluding Financial & Operational Metrics)
            <br />• Performance levels are determined as: Below 50% = Needs Improvement, 50-69% = Average, 70-89% = Good, 90%+ = Excellent
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Implementation Cost Calculation
          </Typography>
          
          <Typography variant="body2" paragraph>
            The total implementation cost is calculated as the sum of two components provided in the Implementation Costs section of the questionnaire:
            <br />• License Cost: The direct cost of purchasing supply chain management software licenses
            <br />• Implementation Cost: The cost of configuring, deploying, and integrating the solution
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Annual Savings Calculation
          </Typography>
          
          <Typography variant="body2" paragraph>
            Potential annual savings are calculated across multiple categories based on your assessment scores:
            <br />• Labor Efficiency: 20% of potential labor cost improvement based on Workforce Management score
            <br />• Inventory Reduction: 30% of potential inventory carrying cost reduction based on Inventory Management score
            <br />• Waste Reduction: 40% of potential waste reduction based on Warehouse Operations score
            <br />• Space Utilization: 25% of potential space savings based on Warehouse Infrastructure score
            <br />• Transportation Optimization: 15% of potential transportation cost reduction based on Supply Chain Integration score
            <br />• Productivity Improvement: 30% of potential transaction cost reduction based on Technology & Automation score
            <br />• Quality Improvement: 35% of potential quality cost reduction based on Performance Measurement score
            <br />• Compliance Savings: 25% of potential compliance cost reduction based on Sustainability & Compliance score
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            ROI Formula
          </Typography>
          
          <Typography variant="body2" paragraph>
            The 5-year ROI percentage is calculated using the following formula:
            <br /><b>ROI = ((Annual Savings × 5 - Implementation Cost) ÷ Implementation Cost) × 100</b>
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Payback Period Calculation
          </Typography>
          
          <Typography variant="body2" paragraph>
            The payback period in months is calculated as:
            <br /><b>Payback Period (months) = (Implementation Cost ÷ Annual Savings) × 12</b>
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Five-Year Projection Model
          </Typography>
          
          <Typography variant="body2" paragraph>
            The 5-year projection uses a realistic adoption model:
            <br />• Year 1: 70% of implementation costs, 50% of full annual savings
            <br />• Year 2: 30% of implementation costs, 80% of full annual savings
            <br />• Year 3: 10% maintenance costs, 100% of full annual savings
            <br />• Year 4: 10% maintenance costs, 110% of full annual savings (10% increase due to optimization)
            <br />• Year 5: 10% maintenance costs, 120% of full annual savings (20% increase)
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Note: These calculations are estimates based on industry benchmarks and your specific responses.
            Actual results may vary based on implementation details and other factors.
          </Typography>
        </Box>
      </Paper>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        message={notification.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default CalculatorPage;
