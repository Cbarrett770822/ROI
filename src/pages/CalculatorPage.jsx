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
import MapIcon from '@mui/icons-material/Map';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
  
  // Navigate to warehouse maps
  const handleViewWarehouseMaps = () => {
    dispatch(setLoading(true));
    navigate(`/warehouse-maps/${companyId}`);
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
        
        // Extract financial & operational metrics and convert to correct units
        const financialMetrics = {
          // Convert from millions to actual dollars
          annualRevenue: (numericAnswers['metrics_1'] || 0) * 1000000, // Revenue in millions
          operatingMargin: numericAnswers['metrics_2'] || 0,
          totalFTEs: numericAnswers['metrics_3'] || 0,
          // Convert from thousands to actual dollars
          costPerFTE: (numericAnswers['metrics_4'] || 0) * 1000, // Cost per FTE in thousands
          // Convert from millions to actual dollars
          annualWasteValue: (numericAnswers['metrics_5'] || 0) * 1000000, // Waste value in millions
          // Convert from millions to actual dollars
          transportationCost: (numericAnswers['metrics_6'] || 0) * 1000000, // Transportation cost in millions
          warehouseCount: numericAnswers['metrics_7'] || 0,
          warehouseSize: numericAnswers['metrics_8'] || 0,
          inboundVolume: numericAnswers['metrics_9'] || 0,
          outboundVolume: numericAnswers['metrics_10'] || 0,
          // Convert from millions to actual dollars
          licenseCost: (numericAnswers['implementation_1'] || 0) * 1000000, // License cost in millions
          // Convert from millions to actual dollars
          implementationCost: (numericAnswers['implementation_2'] || 0) * 1000000 // Implementation cost in millions
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
          // Calculate improvement potential - lower scores mean higher improvement potential
          const improvementPotential = 100 - percentScore;
          
          categoryScores[category] = {
            possibleScore,
            actualScore,
            percentScore,
            improvementPotential
          };
          
          totalPossibleScore += possibleScore;
          totalActualScore += actualScore;
        });
        
        // Calculate overall score percentage and improvement potential
        const overallScorePercent = Math.round((totalActualScore / totalPossibleScore) * 100);
        const overallImprovementPotential = 100 - overallScorePercent;
        
        // Use user-provided license and implementation costs
        const licenseCost = financialMetrics.licenseCost || 0;
        const implementationCost = financialMetrics.implementationCost || 0;
        
        // Total cost is the sum of license and implementation costs
        const totalCost = licenseCost + implementationCost;
        
        // Calculate potential savings based on actual metrics
        const savings = {};
        
        // Labor efficiency savings - using improvement potential instead of score
        const laborEfficiencyImprovement = categoryScores['Workforce Management']?.improvementPotential / 100 || 0.9;
        savings.labor = totalLaborCost * laborEfficiencyImprovement * 0.2; // 20% of potential improvement
        
        // Inventory reduction savings - using improvement potential instead of score
        const inventoryReductionRate = categoryScores['Inventory Management']?.improvementPotential / 100 || 0.9;
        const estimatedInventoryValue = financialMetrics.annualRevenue * 0.2; // Estimate inventory as 20% of revenue
        const inventoryCarryingCost = estimatedInventoryValue * 0.25; // 25% carrying cost
        savings.inventory = inventoryCarryingCost * inventoryReductionRate * 0.3; // 30% of potential improvement
        
        // Waste reduction savings - using improvement potential instead of score
        const wasteReductionRate = categoryScores['Warehouse Operations']?.improvementPotential / 100 || 0.9;
        savings.waste = financialMetrics.annualWasteValue * wasteReductionRate * 0.4; // 40% of potential improvement
        
        // Space utilization savings - using improvement potential instead of score
        const spaceUtilizationImprovement = categoryScores['Warehouse Infrastructure']?.improvementPotential / 100 || 0.9;
        const warehouseCostPerSqFt = 15; // Average cost per square foot
        const potentialSpaceSavings = financialMetrics.warehouseSize * spaceUtilizationImprovement * 0.25; // 25% of potential improvement
        savings.space = potentialSpaceSavings * warehouseCostPerSqFt;
        
        // Transportation optimization savings - using improvement potential instead of score
        const transportationImprovement = categoryScores['Supply Chain Integration']?.improvementPotential / 100 || 0.9;
        savings.transportation = financialMetrics.transportationCost * transportationImprovement * 0.15; // 15% of potential improvement
        
        // Productivity improvement - simplified direct calculation based on labor costs
        const productivityImprovement = categoryScores['Technology & Automation']?.improvementPotential / 100 || 0.9;
        
        // Calculate base productivity savings as a percentage of labor costs
        // This is more intuitive and aligned with industry standards for WMS implementations
        const baseProductivityRate = 0.15; // Base rate: WMS can improve productivity by up to 15% of labor costs
        const baseProductivitySavings = totalLaborCost * baseProductivityRate * productivityImprovement;
        
        // Apply scaling factors based on company characteristics
        const companySize = financialMetrics.totalFTEs;
        const transactionComplexity = (financialMetrics.inboundVolume + financialMetrics.outboundVolume) / (companySize || 1);
        
        // Size factor: larger companies (>100 FTEs) can achieve greater economies of scale
        const sizeFactor = Math.min(1.5, Math.max(1.0, companySize / 100));
        
        // Complexity factor: higher transaction volume per employee indicates greater complexity
        // and thus greater potential for improvement
        const complexityFactor = Math.min(1.3, Math.max(1.0, transactionComplexity / 1000));
        
        // Calculate final productivity savings with scaling factors
        savings.productivity = baseProductivitySavings * sizeFactor * complexityFactor;
        
        // Ensure minimum productivity savings of 2% of total labor cost
        const minProductivitySavings = totalLaborCost * 0.02;
        savings.productivity = Math.max(savings.productivity, minProductivitySavings);
        
        // Add debug logging
        console.log('Productivity savings calculation:', {
          totalLaborCost,
          productivityImprovement,
          baseProductivityRate,
          baseProductivitySavings,
          companySize,
          sizeFactor,
          transactionComplexity,
          complexityFactor,
          finalSavings: savings.productivity,
          minProductivitySavings
        });
        
        // Quality improvement savings - using improvement potential instead of score
        const qualityImprovement = categoryScores['Performance Measurement']?.improvementPotential / 100 || 0.9;
        const estimatedQualityCost = financialMetrics.annualRevenue * 0.01; // Reduced from 2% to 1% of revenue
        let qualitySavings = estimatedQualityCost * qualityImprovement * 0.25; // Reduced from 35% to 25% of potential improvement
        // Cap quality savings at a reasonable level based on company size
        const maxQualitySavings = financialMetrics.annualRevenue * 0.005; // Cap at 0.5% of revenue
        savings.quality = Math.min(qualitySavings, maxQualitySavings);
        
        // Compliance savings - using improvement potential instead of score
        const complianceImprovement = categoryScores['Sustainability & Compliance']?.improvementPotential / 100 || 0.9;
        const estimatedComplianceCost = financialMetrics.annualRevenue * 0.005; // Reduced from 1% to 0.5% of revenue
        let complianceSavings = estimatedComplianceCost * complianceImprovement * 0.2; // Reduced from 25% to 20% of potential improvement
        // Cap compliance savings
        const maxComplianceSavings = financialMetrics.annualRevenue * 0.002; // Cap at 0.2% of revenue
        savings.compliance = Math.min(complianceSavings, maxComplianceSavings);
        
        // Calculate total annual savings
        const annualSavings = Object.values(savings).reduce((sum, value) => sum + value, 0);
        
        // Calculate ROI metrics
        const costSavings = annualSavings;
        // Cap time reduction and quality improvement at 100%
        // Using improvement potential instead of score percentage
        const timeReduction = Math.min(100, Math.round(overallImprovementPotential / 3)); // Process time improvement
        const qualityImprovementPercent = Math.min(100, Math.round(overallImprovementPotential / 2.5)); // Quality metrics improvement
        const roi = Math.round((annualSavings * 3 - totalCost) / totalCost * 100); // 3-year ROI
        const paybackPeriodMonths = Math.round((totalCost / annualSavings) * 12);
        
        // Calculate 3-year projections with the specified cost structure
        const projections = {
          year1: { 
            costs: totalCost, // First year: license cost + implementation cost
            savings: annualSavings, // 100% of full savings in year 1
            netBenefit: annualSavings - totalCost
          },
          year2: { 
            costs: licenseCost, // Second year: just license cost
            savings: annualSavings, // 100% of full savings in year 2
            netBenefit: annualSavings - licenseCost
          },
          year3: { 
            costs: licenseCost, // Third year: just license cost
            savings: annualSavings, // 100% of full savings in year 3
            netBenefit: annualSavings - licenseCost
          }
        };
        
        // Calculate detailed savings breakdown using exact percentages
        const savingsBreakdown = Object.entries(savings)
          .map(([category, amount]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            amount,
            // Calculate exact percentage with full precision
            percentage: (amount / annualSavings) * 100
          }))
          .sort((a, b) => b.amount - a.amount);
        
        // Identify top improvement areas
        const improvementAreas = Object.entries(categoryScores)
          .map(([category, score]) => {
            // Use the improvement potential directly instead of recalculating the gap
            // This ensures consistency with our savings calculations
            const potentialFactor = score.improvementPotential / 100;
            let potentialSavings = 0;
            
            switch(category) {
              case 'Workforce Management':
                potentialSavings = totalLaborCost * 0.2 * potentialFactor;
                break;
              case 'Inventory Management':
                // Calculate potential savings based on the gap to perfect score
                // Use the same formula as in the annual savings calculation
                potentialSavings = inventoryCarryingCost * 0.3 * potentialFactor;
                // Add debug logging to help troubleshoot the calculation
                console.log('Inventory Management potential savings calculation:', {
                  annualRevenue: financialMetrics.annualRevenue,
                  estimatedInventoryValue: estimatedInventoryValue,
                  inventoryCarryingCost: inventoryCarryingCost,
                  potentialFactor: potentialFactor,
                  potentialSavings: potentialSavings
                });
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
                // Use the same approach as in the annual savings calculation
                const techBaseProductivityRate = 0.15; // Base rate: 15% of labor costs
                const techBaseProductivitySavings = totalLaborCost * techBaseProductivityRate * potentialFactor;
                
                // Apply the same scaling factors
                const techCompanySize = financialMetrics.totalFTEs;
                const techTransactionComplexity = (financialMetrics.inboundVolume + financialMetrics.outboundVolume) / (techCompanySize || 1);
                
                // Size factor: larger companies (>100 FTEs) can achieve greater economies of scale
                const techSizeFactor = Math.min(1.5, Math.max(1.0, techCompanySize / 100));
                
                // Complexity factor: higher transaction volume per employee indicates greater complexity
                const techComplexityFactor = Math.min(1.3, Math.max(1.0, techTransactionComplexity / 1000));
                
                // Calculate final potential productivity savings
                potentialSavings = techBaseProductivitySavings * techSizeFactor * techComplexityFactor;
                
                // Add debug logging
                console.log('Technology & Automation potential savings calculation:', {
                  totalLaborCost,
                  techBaseProductivityRate,
                  potentialFactor,
                  techBaseProductivitySavings,
                  techCompanySize,
                  techSizeFactor,
                  techTransactionComplexity,
                  techComplexityFactor,
                  potentialSavings
                });
                break;
              case 'Performance Measurement':
                // Use the updated factor of 0.25 instead of 0.35 to match the annual savings calculation
                potentialSavings = estimatedQualityCost * 0.25 * potentialFactor;
                // Add debug logging
                console.log('Performance Measurement potential savings calculation:', {
                  annualRevenue: financialMetrics.annualRevenue,
                  estimatedQualityCost: estimatedQualityCost,
                  potentialFactor: potentialFactor,
                  potentialSavings: potentialSavings
                });
                break;
              case 'Sustainability & Compliance':
                // Use the updated factor of 0.2 instead of 0.25 to match the annual savings calculation
                potentialSavings = estimatedComplianceCost * 0.2 * potentialFactor;
                // Add debug logging
                console.log('Sustainability & Compliance potential savings calculation:', {
                  annualRevenue: financialMetrics.annualRevenue,
                  estimatedComplianceCost: estimatedComplianceCost,
                  potentialFactor: potentialFactor,
                  potentialSavings: potentialSavings
                });
                break;
              default:
                potentialSavings = annualSavings * 0.05 * potentialFactor;
            }
            
            // Add the base values and factors used in the calculation to make them available in the UI
            let calculationDetails = {};
            
            switch(category) {
              case 'Inventory Management':
                calculationDetails = {
                  baseCost: inventoryCarryingCost,
                  baseLabel: 'Inventory carrying cost',
                  realizationFactor: 0.3
                };
                break;
              case 'Workforce Management':
                calculationDetails = {
                  baseCost: totalLaborCost,
                  baseLabel: 'Total labor cost',
                  realizationFactor: 0.2
                };
                break;
              case 'Warehouse Operations':
                calculationDetails = {
                  baseCost: financialMetrics.annualWasteValue,
                  baseLabel: 'Annual waste value',
                  realizationFactor: 0.4
                };
                break;
              case 'Warehouse Infrastructure':
                calculationDetails = {
                  baseCost: financialMetrics.warehouseSize * warehouseCostPerSqFt,
                  baseLabel: 'Warehouse space cost',
                  realizationFactor: 0.25
                };
                break;
              case 'Supply Chain Integration':
                calculationDetails = {
                  baseCost: financialMetrics.transportationCost,
                  baseLabel: 'Transportation cost',
                  realizationFactor: 0.15
                };
                break;
              case 'Technology & Automation':
                // Use the same base cost approach as in the productivity savings calculation
                const techBaseRate = 0.15; // Base rate: 15% of labor costs
                const techCompanySize = financialMetrics.totalFTEs;
                const techTransactionComplexity = (financialMetrics.inboundVolume + financialMetrics.outboundVolume) / (techCompanySize || 1);
                const techSizeFactor = Math.min(1.5, Math.max(1.0, techCompanySize / 100));
                const techComplexityFactor = Math.min(1.3, Math.max(1.0, techTransactionComplexity / 1000));
                
                calculationDetails = {
                  baseCost: totalLaborCost,
                  baseLabel: 'Labor costs',
                  realizationFactor: techBaseRate * techSizeFactor * techComplexityFactor
                };
                break;
              case 'Performance Measurement':
                calculationDetails = {
                  baseCost: estimatedQualityCost,
                  baseLabel: 'Quality costs',
                  realizationFactor: 0.25
                };
                break;
              case 'Sustainability & Compliance':
                calculationDetails = {
                  baseCost: estimatedComplianceCost,
                  baseLabel: 'Compliance costs',
                  realizationFactor: 0.2
                };
                break;
              default:
                calculationDetails = {
                  baseCost: 0,
                  baseLabel: 'Base cost',
                  realizationFactor: 0.05
                };
            }
            
            return {
              category,
              percentScore: score.percentScore,
              improvementPotential: score.improvementPotential,
              potentialSavings,
              calculationDetails
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
            totalCost,
            licenseCost,
            implementationCost,
            annualSavings,
            overallScorePercent,
            overallImprovementPotential
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
  
  // Format percentage values with one decimal place for accuracy
  const formatPercent = (value) => {
    // For very small values (less than 0.1%), show as 0.1% instead of 0%
    if (value > 0 && value < 0.1) {
      return '0.1%';
    }
    // For normal values, show with one decimal place
    return `${value.toFixed(1)}%`;
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
              variant="contained"
              color="secondary"
              startIcon={<MapIcon />}
              onClick={handleViewWarehouseMaps}
            >
              Warehouse Maps
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
            <Grid grid={{ xs: 12, sm: 6, md: 3 }}>
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
            
            <Grid grid={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ROI
                  </Typography>
                  <Typography variant="h4">
                    {formatPercent(results.summary.roi)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    3-year return on investment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid grid={{ xs: 12, sm: 6, md: 3 }}>
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
            
            <Grid grid={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total Cost
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(results.summary.totalCost)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    License cost + Implementation cost
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
              <Tab label="3-Year Projection" icon={<TimelineIcon />} iconPosition="start" />
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
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed rgba(0, 0, 0, 0.12)' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Calculation Methodology
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Our ROI model calculates savings based on your improvement potential. Lower assessment scores indicate higher potential for improvement, which translates to greater savings when implementing a WMS:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Inventory:</strong> Based on inventory carrying costs (25% of inventory value) and your Inventory Management improvement potential (30% realization factor).
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Productivity:</strong> Calculated directly from labor costs and your Technology & Automation improvement potential, with adjustments for company size and transaction complexity. Base rate is 15% of labor costs, scaled by company-specific factors, with a minimum of 2% of total labor costs.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Quality:</strong> Based on 1% of annual revenue and your Performance Measurement improvement potential (25% realization factor), capped at 0.5% of annual revenue.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Compliance:</strong> Based on 0.5% of annual revenue and your Sustainability & Compliance improvement potential (20% realization factor), capped at 0.2% of annual revenue.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Labor, Waste, Space & Transportation:</strong> Each calculated using their respective improvement potentials and industry-standard realization factors.
                    </Typography>
                  </li>
                </ul>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Glossary of Terms
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Inventory Carrying Cost:</strong> The cost of holding inventory, calculated as 25% of inventory value. Inventory value is estimated as 20% of annual revenue. For example, with $150M annual revenue, inventory value is $30M, and carrying cost is $7.5M annually. This includes capital costs (10-15%), storage costs (2-5%), risk costs (6-8%), and service costs (2-4%). This approach is validated by industry authorities including <a href="https://www.apqc.org/what-we-do/benchmarking/open-standards-benchmarking/measures/inventory-carrying-cost-percentage" target="_blank" rel="noopener noreferrer">APQC's Open Standards Benchmarking</a> and research from <a href="https://www.gartner.com/en/supply-chain/trends/supply-chain-management-cost-savings-checklist" target="_blank" rel="noopener noreferrer">Gartner's Supply Chain Management Cost Savings</a> analysis, which confirms WMS implementations can reduce these costs by up to 27%.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Improvement Potential:</strong> Calculated as (100 - Score)%. Lower assessment scores indicate higher improvement potential. For example, a score of 25% means a 75% improvement potential.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Realization Factor:</strong> The percentage of theoretical improvement that can realistically be achieved through a WMS implementation. Varies by category: Inventory (30%), Productivity (45%), Quality (25%), Compliance (20%), Labor (20%), Waste (40%), Space (25%), and Transportation (15%). These factors are supported by <a href="https://www.sciencedirect.com/science/article/abs/pii/S0925527313003733" target="_blank" rel="noopener noreferrer">Journal of Supply Chain Management Research</a> showing WMS implementations typically achieve 15-35% labor cost reductions and <a href="https://www.prnewswire.com/news-releases/cscmp-2022-state-of-logistics-report-indicates-that-supply-chains-are-seeking-to-get-back-in-sync-amidst-rising-costs-301570940.html" target="_blank" rel="noopener noreferrer">CSCMP's State of Logistics Report</a> data on supply chain efficiency improvements.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Total Labor Cost:</strong> Calculated as the number of FTEs multiplied by the cost per FTE. For example, 100 FTEs at $50,000 each equals $5M in total labor cost.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Quality Costs:</strong> Estimated as 1% of annual revenue, representing the cost of quality issues, rework, returns, and customer complaints.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Compliance Costs:</strong> Estimated as 0.5% of annual revenue, representing the cost of regulatory compliance, audits, and potential penalties.
                    </Typography>
                  </li>
                </ul>
              </Box>
              
              <Grid container spacing={3}>
                <Grid grid={{ xs: 12, md: 7 }}>
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
                
                <Grid grid={{ xs: 12, md: 5 }}>
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
          
          {/* 3-Year Projection Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Calculation Methodology</Typography>
              <Typography variant="body1" paragraph>
                Our ROI calculator uses your questionnaire responses to identify potential savings across key areas. Lower scores indicate higher potential for improvement, which translates to greater savings when implementing a WMS. The calculation works as follows:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Total Costs</TableCell>
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
                  Note: Year 1 includes both license and implementation costs. Years 2-3 include only license costs.
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Improvement Areas Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top Improvement Opportunities</Typography>
              <Typography variant="body2" paragraph>
                Based on your assessment, we've identified these key areas where you have the highest improvement potential. Lower scores indicate greater room for improvement, which translates to higher potential savings when implementing a WMS:
              </Typography>
              
              <Grid container spacing={3}>
                {results.improvementAreas?.map((area, index) => (
                  <Grid grid={{ xs: 12, md: 4 }} key={index}>
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
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Improvement Potential</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={area.improvementPotential} 
                                sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }} 
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="success.main">{formatPercent(area.improvementPotential)}</Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom>Potential Additional Savings</Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          {formatCurrency(area.potentialSavings)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          This area has a {formatPercent(area.improvementPotential)} improvement potential. Implementing a WMS would help realize these additional savings beyond the current baseline.
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom color="primary.main" sx={{ mt: 1, fontSize: '0.75rem' }}>
                          How this value is calculated:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {`${area.calculationDetails.baseLabel} (${formatCurrency(area.calculationDetails.baseCost)}) × ${area.calculationDetails.realizationFactor * 100}% realization factor × ${formatPercent(area.improvementPotential)} improvement potential`}
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
                    {Object.entries(results.categoryScores || {}).filter(([category]) => category !== 'Implementation Costs').map(([category, score]) => (
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
            <br />• The improvement potential is calculated as: 100 - Percentage Score
            <br />• The overall score is the weighted average of all category scores (excluding Financial & Operational Metrics)
            <br />• The overall improvement potential is calculated as: 100 - Overall Score
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
            Potential annual savings are calculated across multiple categories based on your improvement potential (lower scores = higher potential for improvement):
            <br />• Labor Efficiency: 20% realization factor applied to your Workforce Management improvement potential × total labor cost
            <br />• Inventory Reduction: 30% realization factor applied to your Inventory Management improvement potential × inventory carrying cost (25% of inventory value)
            <br />• Waste Reduction: 40% realization factor applied to your Warehouse Operations improvement potential × annual waste value
            <br />• Space Utilization: 25% realization factor applied to your Warehouse Infrastructure improvement potential × warehouse space cost
            <br />• Transportation Optimization: 15% realization factor applied to your Supply Chain Integration improvement potential × transportation cost
            <br />• Productivity Improvement: 45% realization factor applied to your Technology & Automation improvement potential × transaction costs, with a minimum of 2% of total labor costs
            <br />• Quality Improvement: 25% realization factor applied to your Performance Measurement improvement potential × quality costs (1% of revenue), capped at 0.5% of annual revenue
            <br />• Compliance Savings: 20% realization factor applied to your Sustainability & Compliance improvement potential × compliance costs (0.5% of revenue), capped at 0.2% of annual revenue
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            ROI Formula
          </Typography>
          
          <Typography variant="body2" paragraph>
            The 3-year ROI percentage is calculated using the following formula:
            <br /><b>ROI = ((Annual Savings × 3 - (License Cost × 3 + Implementation Cost)) ÷ (License Cost × 3 + Implementation Cost)) × 100</b>
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Payback Period Calculation
          </Typography>
          
          <Typography variant="body2" paragraph>
            The payback period in months is calculated as:
            <br /><b>Payback Period (months) = ((License Cost × 3 + Implementation Cost) ÷ Annual Savings) × 12</b>
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
            Three-Year Projection Model
          </Typography>
          
          <Typography variant="body2" paragraph>
            The 3-year projection uses the following model:
            <br />• Year 1: License cost + Implementation cost, 100% of full annual savings
            <br />• Year 2: License cost only, 100% of full annual savings
            <br />• Year 3: License cost only, 100% of full annual savings
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
