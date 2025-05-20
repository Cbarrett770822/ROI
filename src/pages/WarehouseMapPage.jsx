import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';

// Import components
import WarehouseOutcomeMap from '../components/visualization/WarehouseOutcomeMap';
import WarehouseBenefitMap from '../components/visualization/WarehouseBenefitMap';

// Import selectors
import { selectActiveCompany } from '../redux/slices/companiesSlice';
import { selectAnswers, selectQuestions, selectQuestionnaireStatus } from '../redux/slices/questionnaireSlice';
import { setLoading } from '../redux/slices/uiSlice';

// Import utilities
import { mapAnswersToOutcomes, mapAnswersToBenefits, calculateAreaMaturity, identifyTopOpportunities } from '../utils/warehouseMapUtils';
import { generatePDFReport } from '../utils/pdfReportGenerator';

/**
 * Warehouse Map Page Component
 * Displays warehouse outcome and benefit maps based on questionnaire answers
 */
const WarehouseMapPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const activeCompany = useSelector(selectActiveCompany);
  const questions = useSelector(selectQuestions);
  const answers = useSelector(selectAnswers);
  const questionnaireStatus = useSelector(selectQuestionnaireStatus);
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [outcomeData, setOutcomeData] = useState({});
  const [benefitData, setBenefitData] = useState({});
  const [areaMaturity, setAreaMaturity] = useState({});
  const [topOpportunities, setTopOpportunities] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '' });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate(`/calculator/${companyId}`);
  };
  
  // Process questionnaire data to generate maps
  useEffect(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      // Map answers to outcome and benefit data
      const mappedOutcomeData = mapAnswersToOutcomes(questions, answers);
      setOutcomeData(mappedOutcomeData);
      
      // Calculate area maturity levels
      const maturityLevels = calculateAreaMaturity(mappedOutcomeData);
      setAreaMaturity(maturityLevels);
      
      // Identify top improvement opportunities
      const opportunities = identifyTopOpportunities(mappedOutcomeData);
      setTopOpportunities(opportunities);
      
      // Map answers to benefit data
      // Note: In a real implementation, you would pass the ROI results here
      const mappedBenefitData = mapAnswersToBenefits(questions, answers, {});
      setBenefitData(mappedBenefitData);
    }
  }, [questions, answers]);
  
  // Handle download report
  const handleDownloadReport = () => {
    try {
      // Prepare data for the PDF report
      const reportData = {
        company: activeCompany,
        results: {
          outcomeData,
          benefitData,
          areaMaturity,
          topOpportunities
        }
      };
      
      // Generate the PDF report
      const pdfDoc = generatePDFReport(reportData);
      
      // Save the PDF file
      const fileName = `${activeCompany.name.replace(/\\s+/g, '_')}_Warehouse_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfDoc.save(fileName);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Report downloaded successfully!'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      
      // Show error notification
      setNotification({
        open: true,
        message: 'Error generating report. Please try again.'
      });
    }
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Check if we have enough data to display maps
  const hasEnoughData = Object.keys(answers).length > 10;
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Calculator
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReport}
          disabled={!hasEnoughData}
        >
          Download Report
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Warehouse Assessment Maps for {activeCompany?.name || 'Company'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          These maps visualize your warehouse performance based on the questionnaire responses.
          The Outcome Map shows specific operational improvements, while the Benefit Map highlights
          business benefits that can be achieved through these improvements.
        </Typography>
        
        {!hasEnoughData && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Complete more of the questionnaire to get a more accurate assessment.
            Some areas may show as "Not applicable" due to insufficient data.
          </Alert>
        )}
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="warehouse map tabs">
            <Tab label="Outcome Map" id="tab-0" />
            <Tab label="Benefit Map" id="tab-1" />
          </Tabs>
        </Box>
        
        {/* Tab content */}
        <div role="tabpanel" hidden={activeTab !== 0}>
          {activeTab === 0 && <WarehouseOutcomeMap assessmentData={outcomeData} />}
        </div>
        <div role="tabpanel" hidden={activeTab !== 1}>
          {activeTab === 1 && <WarehouseBenefitMap benefitData={benefitData} />}
        </div>
      </Paper>
      
      {/* Maturity Analysis */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Warehouse Maturity Analysis
        </Typography>
        
        <Typography variant="body1" paragraph>
          Based on your questionnaire responses, we've analyzed the maturity level of each area
          of your warehouse operations. This analysis helps identify which areas need the most
          attention for improvement.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {Object.entries(areaMaturity).length > 0 ? (
            <Box>
              {Object.entries(areaMaturity).map(([area, score]) => (
                <Box key={area} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {area.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {score.toFixed(1)}/4
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#eee', borderRadius: 1, height: 10 }}>
                    <Box
                      sx={{
                        width: `${(score / 4) * 100}%`,
                        bgcolor: score < 2 ? '#FF9999' : score < 3 ? '#FFCC99' : '#CCFF99',
                        height: '100%',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Complete the questionnaire to see your warehouse maturity analysis.
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Top Improvement Opportunities */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Top Improvement Opportunities
        </Typography>
        
        <Typography variant="body1" paragraph>
          Based on your assessment, we've identified the following top opportunities for improvement:
        </Typography>
        
        {topOpportunities.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {topOpportunities.map((opportunity) => (
              <Box component="li" key={opportunity.id} sx={{ mb: 1 }}>
                <Typography variant="body1">
                  {opportunity.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {' - '}
                  <Typography component="span" color="error" fontWeight="bold">
                    Score: {opportunity.score.toFixed(1)}/4
                  </Typography>
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Complete the questionnaire to see your top improvement opportunities.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default WarehouseMapPage;
