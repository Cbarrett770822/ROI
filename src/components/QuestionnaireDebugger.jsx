import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { selectToken } from '../redux/slices/authSlice';
import { api } from '../api/apiClient';
import ErrorBoundary from './common/ErrorBoundary';

const QuestionnaireDebugger = () => {
  const { companyId } = useParams();
  const token = useSelector(selectToken);
  const [customCompanyId, setCustomCompanyId] = useState(companyId || '');
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testAnswers, setTestAnswers] = useState(JSON.stringify({
    'q1': '3',
    'q2': '4',
    'q3': '2'
  }, null, 2));
  const [testResult, setTestResult] = useState(null);

  const fetchDebugInfo = async () => {
    if (!customCompanyId) {
      setError('Please enter a company ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching debug info for company ID:', customCompanyId);
      
      // First try without company ID to test basic connectivity
      if (!debugInfo) {
        try {
          console.log('Testing basic endpoint connectivity...');
          const basicResponse = await api.get('debug-questionnaire');
          console.log('Basic endpoint test succeeded:', basicResponse.status);
        } catch (basicErr) {
          console.error('Basic endpoint test failed:', basicErr);
        }
      }
      
      const response = await api.get(`debug-questionnaire/${customCompanyId}`);
      console.log('Debug info response:', response);
      setDebugInfo(response.data);
    } catch (err) {
      console.error('Error fetching debug info:', err);
      let errorMessage = 'Failed to fetch debug info';
      
      if (err.response) {
        errorMessage = `Server error (${err.response.status}): ${JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        errorMessage = 'No response received from server. Check network connection and server status.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testGetQuestionnaire = async () => {
    if (!customCompanyId) {
      setError('Please enter a company ID');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await api.get(`questionnaire/${customCompanyId}`);
      setTestResult({
        operation: 'GET',
        status: response.status,
        data: response.data
      });
    } catch (err) {
      console.error('Error testing GET questionnaire:', err);
      setTestResult({
        operation: 'GET',
        status: err.response?.status || 'Error',
        error: err.response?.data?.message || err.message || 'Failed to get questionnaire'
      });
    } finally {
      setLoading(false);
    }
  };

  const testSaveQuestionnaire = async () => {
    if (!customCompanyId) {
      setError('Please enter a company ID');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Parse the test answers
      const answers = JSON.parse(testAnswers);
      
      const response = await api.post(
        `questionnaire/${customCompanyId}`,
        { answers }
      );
      
      setTestResult({
        operation: 'POST',
        status: response.status,
        data: response.data
      });
      
      // Refresh debug info
      fetchDebugInfo();
    } catch (err) {
      console.error('Error testing POST questionnaire:', err);
      setTestResult({
        operation: 'POST',
        status: err.response?.status || 'Error',
        error: err.response?.data?.message || err.message || 'Failed to save questionnaire'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize with debug info if company ID is provided
  useEffect(() => {
    if (companyId) {
      fetchDebugInfo();
    }
  }, [companyId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Questionnaire API Debugger
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Configuration
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Company ID"
              value={customCompanyId}
              onChange={(e) => setCustomCompanyId(e.target.value)}
              sx={{ flexGrow: 1, mr: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={fetchDebugInfo}
              disabled={loading || !customCompanyId}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Debug Info'}
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Test Questionnaire API
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={testGetQuestionnaire}
              disabled={loading || !customCompanyId}
            >
              Test GET
            </Button>
            <Button 
              variant="outlined" 
              onClick={testSaveQuestionnaire}
              disabled={loading || !customCompanyId}
            >
              Test POST
            </Button>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Test Answers (JSON):
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={testAnswers}
            onChange={(e) => setTestAnswers(e.target.value)}
            sx={{ mb: 2, fontFamily: 'monospace' }}
          />
        </CardContent>
      </Card>
      
      {testResult && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Result: {testResult.operation}
            </Typography>
            <Typography variant="subtitle1">
              Status: {testResult.status}
            </Typography>
            
            {testResult.error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {testResult.error}
              </Alert>
            ) : (
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  bgcolor: '#f5f5f5', 
                  maxHeight: 300, 
                  overflow: 'auto',
                  fontFamily: 'monospace'
                }}
              >
                <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}
      
      {debugInfo && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Debug Information
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              MongoDB Status: {debugInfo.mongodbStatus === 1 ? 'Connected' : 'Disconnected'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Companies ({debugInfo.companies.length}):
            </Typography>
            
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                maxHeight: 300, 
                overflow: 'auto',
                fontFamily: 'monospace'
              }}
            >
              <pre>{JSON.stringify(debugInfo.companies, null, 2)}</pre>
            </Paper>
            
            {debugInfo.specificCompany && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Selected Company Details:
                </Typography>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    maxHeight: 300, 
                    overflow: 'auto',
                    fontFamily: 'monospace'
                  }}
                >
                  <pre>{JSON.stringify(debugInfo.specificCompany, null, 2)}</pre>
                </Paper>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Wrap the component with ErrorBoundary for better error handling
const QuestionnaireDebuggerWithErrorBoundary = () => (
  <ErrorBoundary showDetails={true} onReset={() => window.location.reload()}>
    <QuestionnaireDebugger />
  </ErrorBoundary>
);

export default QuestionnaireDebuggerWithErrorBoundary;
