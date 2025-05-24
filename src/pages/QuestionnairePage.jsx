import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Paper,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// Import Redux actions and selectors
import {
  fetchQuestionnaire,
  saveQuestionnaireAnswers,
  setAnswer,
  selectQuestions,
  selectAnswers,
  selectQuestionnaireStatus,
  selectQuestionnaireError
} from '../redux/slices/questionnaireSlice';
import { selectActiveCompany } from '../redux/slices/companiesSlice';
import { setLoading } from '../redux/slices/uiSlice';

const QuestionnairePage = () => {
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux store
  const questions = useSelector(selectQuestions);
  const answers = useSelector(selectAnswers);
  const status = useSelector(selectQuestionnaireStatus);
  const error = useSelector(selectQuestionnaireError);
  const activeCompany = useSelector(selectActiveCompany);
  const loading = status === 'loading';
  
  // Local state for navigation and UI
  const [activeCategory, setActiveCategory] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [saveInProgress, setSaveInProgress] = useState(false);

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
  
  // Set initial active category when questions load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Calculate completion percentage
  const completionStats = useMemo(() => {
    if (!questions.length) return { percent: 0, completed: 0, total: 0 };
    
    const total = questions.length;
    const completed = Object.keys(answers).length;
    const percent = Math.round((completed / total) * 100);
    
    return { percent, completed, total };
  }, [questions, answers]);
  
  // Calculate category completion stats
  const categoryStats = useMemo(() => {
    const stats = {};
    
    Object.entries(categorizedQuestions).forEach(([category, categoryQuestions]) => {
      const total = categoryQuestions.length;
      const completed = categoryQuestions.filter(q => answers[q.id]).length;
      const percent = Math.round((completed / total) * 100);
      
      stats[category] = { total, completed, percent };
    });
    
    return stats;
  }, [categorizedQuestions, answers]);

  // Fetch questionnaire data on component mount
  useEffect(() => {
    if (companyId) {
      dispatch(fetchQuestionnaire(companyId));
    }
  }, [companyId, dispatch]);

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    dispatch(setAnswer({ questionId, value }));
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  // Handle navigation between categories
  const handleNext = () => {
    const currentIndex = categories.indexOf(activeCategory);
    if (currentIndex < categories.length - 1) {
      setActiveCategory(categories[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    const currentIndex = categories.indexOf(activeCategory);
    if (currentIndex > 0) {
      setActiveCategory(categories[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  // Handle save
  const handleSave = async () => {
    setSaveInProgress(true);
    
    try {
      await dispatch(saveQuestionnaireAnswers({ 
        companyId, 
        answers 
      }));
      
      setSaveInProgress(false);
    } catch (error) {
      console.error('Error saving answers:', error);
      setSaveInProgress(false);
    }
  };

  // Handle save and navigate to calculator
  const handleSaveAndCalculate = async () => {
    dispatch(setLoading(true));
    
    try {
      await dispatch(saveQuestionnaireAnswers({ 
        companyId, 
        answers 
      }));
      
      navigate(`/calculator/${companyId}`);
    } catch (error) {
      console.error('Error saving answers:', error);
      dispatch(setLoading(false));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Supply Chain Assessment Questionnaire
          </Typography>
          
          {activeCompany && (
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Company: {activeCompany.name}
            </Typography>
          )}
          
          {/* Progress indicator */}
          <Box sx={{ mt: 3, mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completionStats.completed} of {completionStats.total} questions answered ({completionStats.percent}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionStats.percent} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {questions.length === 0 ? (
          <Alert severity="info">
            No questions available. Please try again later.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Categories */}
            <Grid grid={{ xs: 12, md: 2 }}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Assessment Categories
                </Typography>
                <Box sx={{ maxHeight: { xs: 'auto', md: '60vh' }, overflow: { md: 'auto' }, pr: 1 }}>
                  {categories.map((category, index) => {
                    const stats = categoryStats[category];
                    return (
                      <Box 
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          backgroundColor: activeCategory === category ? 'primary.light' : 'background.paper',
                          color: activeCategory === category ? 'primary.contrastText' : 'text.primary',
                          border: '1px solid',
                          borderColor: activeCategory === category ? 'primary.main' : 'divider',
                          '&:hover': {
                            backgroundColor: activeCategory === category ? 'primary.light' : 'action.hover',
                          },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight={activeCategory === category ? 'bold' : 'normal'}>
                            {index + 1}. {category}
                          </Typography>
                          {stats.completed === stats.total ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <Typography variant="body2" color={activeCategory === category ? 'inherit' : 'text.secondary'}>
                              {stats.completed}/{stats.total}
                            </Typography>
                          )}
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={stats.percent} 
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
                
                {/* Save buttons */}
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saveInProgress}
                    fullWidth
                  >
                    Save Progress
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CalculateIcon />}
                    onClick={handleSaveAndCalculate}
                    disabled={saveInProgress || completionStats.completed === 0}
                    fullWidth
                  >
                    Calculate ROI
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            {/* Questions */}
            <Grid grid={{ xs: 12, md: 10 }}>
              {activeCategory && (
                <Card elevation={2} sx={{ mb: 4 }}>
                  <CardContent sx={{ px: { xs: 2, md: 4 } }}>
                    <Typography variant="h6" component="h2" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                      {activeCategory}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {categorizedQuestions[activeCategory].map((question, index) => (
                      <Box key={question.id} sx={{ mb: 4 }}>
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                          <FormLabel component="legend">
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                              {index + 1}. {question.text}
                            </Typography>
                          </FormLabel>
                          
                          {question.type === 'number' ? (
                            // Numeric input for metrics
                            <Box sx={{ mt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {question.prefix && (
                                  <Typography variant="body1" sx={{ mr: 1 }}>
                                    {question.prefix}
                                  </Typography>
                                )}
                                <TextField
                                  type="number"
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  placeholder={question.placeholder}
                                  fullWidth
                                  inputProps={{ min: 0 }}
                                  variant="outlined"
                                />
                                {question.suffix && (
                                  <Typography variant="body1" sx={{ ml: 1 }}>
                                    {question.suffix}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          ) : (
                            // Radio buttons for assessment questions
                            <RadioGroup
                              value={answers[question.id] || ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              sx={{ mt: 1 }}
                            >
                              {question.options && question.options.map((option) => (
                                <FormControlLabel
                                  key={option.value}
                                  value={option.value}
                                  control={<Radio color="primary" size="small" />}
                                  label={<Typography variant="body2">{option.label}</Typography>}
                                  sx={{ 
                                    '& .MuiFormControlLabel-label': { fontSize: '0.9rem' },
                                    mb: 0.5
                                  }}
                                />
                              ))}
                            </RadioGroup>
                          )}
                        </FormControl>
                      </Box>
                    ))}
                    
                    {/* Category navigation */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handlePrevious}
                        disabled={categories.indexOf(activeCategory) === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleNext}
                        disabled={categories.indexOf(activeCategory) === categories.length - 1}
                      >
                        Next
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default QuestionnairePage;
