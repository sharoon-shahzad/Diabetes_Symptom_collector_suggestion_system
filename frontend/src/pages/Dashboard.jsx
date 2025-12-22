import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, CssBaseline, Paper, Card, CardContent, CardActions, CircularProgress, Alert, Grid, Divider, Chip, Modal, IconButton, Tooltip, Skeleton, TextField, ToggleButtonGroup, ToggleButton, SpeedDial, SpeedDialAction, SpeedDialIcon, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem, Fade, Zoom
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealingIcon from '@mui/icons-material/Healing';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ScienceIcon from '@mui/icons-material/Science';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Person as PersonIcon, Restaurant as RestaurantIcon, FitnessCenter as FitnessCenterIcon, Lightbulb as LightbulbIcon, EmojiEvents as EmojiEventsIcon, Chat as ChatIcon, SelfImprovement as SelfImprovementIcon, NightlightRound as NightlightRoundIcon, LocalDrink as LocalDrinkIcon, DirectionsWalk as DirectionsWalkIcon, LocalHospital as LocalHospitalIcon, Info as InfoIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { fetchMyDiseaseData, updateUserProfile, assessDiabetesRisk } from '../utils/api';
import { toast } from 'react-toastify';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import EditDiseaseData from '../components/Dashboard/EditDiseaseData';
import ProgressDonut from '../components/DashboardNew/ProgressDonut';
import StatWidget from '../components/DashboardNew/StatWidget';
import ActivityTimeline from '../components/DashboardNew/ActivityTimeline';
import RiskCard from '../components/DashboardNew/RiskCard';
import QuickActions from '../components/DashboardNew/QuickActions';
import AccountProfileCard from '../components/DashboardNew/AccountProfileCard';
import PreferencesCard from '../components/DashboardNew/PreferencesCard';
import PasswordOptionCard from '../components/DashboardNew/PasswordOptionCard';
import ThemeToggle from '../components/Common/ThemeToggle';
import DiabetesDiagnosisPopup from '../components/Common/DiabetesDiagnosisPopup';
import AssessmentInsightPopup from '../components/Common/AssessmentInsightPopup';
import axiosInstance from '../utils/axiosInstance';
import UserFeedbackHistory from '../components/Feedback/UserFeedbackHistory';
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ComposedChart, Bar, Legend } from 'recharts';
import * as DynamicInsights from '../components/Dashboard/DynamicInsightsComponents';

const drawerWidth = 220;

const undiagnosedSections = [
  { label: 'Insights', icon: <InsightsIcon /> },
  { label: 'My Account', icon: <AccountCircleIcon /> },
  { label: 'My Disease Data', icon: <HealingIcon /> },
  { label: 'Check My Risk', icon: <AutoAwesomeIcon /> },
  { label: 'My Feedback', icon: <RateReviewIcon /> },
];

const diagnosedSections = [
  { label: 'Insights', icon: <InsightsIcon /> },
  { label: 'My Account', icon: <AccountCircleIcon /> },
  { label: 'Personalized Suggestions', icon: <AutoAwesomeIcon /> },
  { label: 'Chat Assistant', icon: <ChatIcon /> },
  { label: 'My Feedback', icon: <RateReviewIcon /> },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDiagnosisPopup, setShowDiagnosisPopup] = useState(false);
  const [showAssessmentPopup, setShowAssessmentPopup] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [personalInfoCompletion, setPersonalInfoCompletion] = useState(0);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [dietHistory, setDietHistory] = useState(null);
  const [exerciseHistory, setExerciseHistory] = useState(null);
  const [lifestyleHistory, setLifestyleHistory] = useState(null);
  const [assessmentSummary, setAssessmentSummary] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  // Enhanced dynamic features state
  const [chartTimeRange, setChartTimeRange] = useState(() => {
    return parseInt(localStorage.getItem('chartTimeRange') || '14');
  });
  const [nutritionTimeRange, setNutritionTimeRange] = useState('weekly'); // daily, weekly, monthly
  const [exerciseTimeRange, setExerciseTimeRange] = useState('weekly'); // daily, weekly, monthly
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('expandedSections');
    return saved ? JSON.parse(saved) : ['diagnosis', 'labs', 'analytics', 'plans', 'assessment'];
  });
  const [healthGoals, setHealthGoals] = useState(() => {
    const saved = localStorage.getItem('healthGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', current: 0, unit: '' });
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});

  // Refs for scroll navigation
  const diagnosisRef = useRef(null);
  const labsRef = useRef(null);
  const analyticsRef = useRef(null);
  const plansRef = useRef(null);
  const assessmentRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const sections = useMemo(() => {
    if (user?.diabetes_diagnosed === 'yes') return diagnosedSections;
    return undiagnosedSections;
  }, [user?.diabetes_diagnosed]);

  const currentSection = sections[selectedIndex]?.label;

  useEffect(() => {
    if (selectedIndex >= sections.length) {
      setSelectedIndex(0);
    }
  }, [sections.length, selectedIndex]);

  const completionPct = useMemo(() => {
    if (!diseaseData || !diseaseData.totalQuestions) return 0;
    const pct = (diseaseData.answeredQuestions / diseaseData.totalQuestions) * 100;
    return Math.round(pct);
  }, [diseaseData]);

  const activityItems = useMemo(() => {
    const items = [];
    if (user?.last_assessment_at && user?.last_assessment_risk_level) {
      items.push({
        type: 'Assessment',
        color: (user.last_assessment_risk_level || '').toLowerCase() === 'low'
          ? 'success'
          : (user.last_assessment_risk_level || '').toLowerCase() === 'medium'
            ? 'warning'
            : 'error',
        title: 'Risk assessment completed',
        description: `Result: ${(user.last_assessment_risk_level || '').charAt(0).toUpperCase()}${(user.last_assessment_risk_level || '').slice(1)} risk`,
        time: user.last_assessment_at,
      });
    }

    if (diseaseData?.lastUpdated) {
      items.push({
        type: 'Details',
        color: 'primary',
        title: 'Details updated',
        description: `${diseaseData.answeredQuestions || 0} answers saved`,
        time: diseaseData.lastUpdated,
      });
    }
    if (diseaseData?.disease) {
      items.push({
        type: 'Disease',
        color: 'secondary',
        title: 'Tracking condition',
        description: diseaseData.disease,
        time: new Date().toISOString(),
      });
    }
    return items;
  }, [diseaseData, user]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function fetchUser() {
      try {
        if (retryCount === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const userData = await getCurrentUser();

        if (!mounted) return;

        setUser(userData);

        if (userData.diabetes_diagnosed === null || userData.diabetes_diagnosed === undefined) {
          setShowDiagnosisPopup(true);
        }

        const hasAssessment = !!userData.last_assessment_at;
        const isDiagnosed = userData.diabetes_diagnosed === 'yes';
        if (hasAssessment && !isDiagnosed) {
          setShowAssessmentPopup(true);
        }
      } catch (error) {
        if (!mounted) return;

        if (retryCount < maxRetries && localStorage.getItem('accessToken')) {
          retryCount += 1;
          setTimeout(() => fetchUser(), 500);
        } else if (!localStorage.getItem('accessToken')) {
          navigate('/signin');
        }
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Check if user came from feedback page to show feedback form
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showFeedback') === 'true') {
      setSelectedIndex(4);
      setShowFeedbackForm(true);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (currentSection === 'Insights' || currentSection === 'My Disease Data') {
      setLoading(true);
      setError(null);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  }, [currentSection]);

  // Fetch latest assessment summary for Insights
  useEffect(() => {
    if (!user) return;
    if (currentSection !== 'Insights') return;

    const fetchSummary = async () => {
      try {
        setAssessmentLoading(true);
        const response = await assessDiabetesRisk();
        const result = response?.result || {};
        const features = response?.features || {};

        const symptoms_present = Object.entries(features)
          .filter(([k, v]) => !['Age', 'Gender', 'Obesity'].includes(k) && Number(v) === 1)
          .map(([k]) => k);

        const feature_importance = {};
        if (result.feature_importance && typeof result.feature_importance === 'object') {
          Object.entries(result.feature_importance).forEach(([k, v]) => {
            if (v && typeof v === 'object' && typeof v.importance === 'number') {
              feature_importance[k] = v.importance;
            }
          });
        }

        const normalized = {
          risk_level: (result.risk_level || 'low').charAt(0).toUpperCase() + (result.risk_level || 'low').slice(1),
          probability: Number(result.diabetes_probability || 0),
          confidence: Number(result.confidence || 0),
          symptoms_present,
          feature_importance,
        };

        setAssessmentSummary(normalized);
      } catch (err) {
        console.error('Failed to fetch assessment summary for dashboard:', err);
        setAssessmentSummary(null);
      } finally {
        setAssessmentLoading(false);
      }
    };

    fetchSummary();
  }, [currentSection, user]);

  // Ensure assessment popup is shown whenever user opens Insights after an assessment
  useEffect(() => {
    if (!user) return;
    if (currentSection !== 'Insights') return;

    const hasAssessment = !!user.last_assessment_at;
    const isDiagnosed = user.diabetes_diagnosed === 'yes';

    if (hasAssessment && !isDiagnosed) {
      setShowAssessmentPopup(true);
    }
  }, [currentSection, user]);

  // Fetch personal/medical info and completion for diagnosed dashboard
  useEffect(() => {
    if (!user || user.diabetes_diagnosed !== 'yes') return;
    if (currentSection !== 'Personalized Suggestions' && currentSection !== 'Insights') return;

    const fetchCompletion = async () => {
      try {
        const [personalRes, medicalRes, dietRes, exerciseRes, lifestyleRes] = await Promise.all([
          axiosInstance.get('/personalized-system/personal-info'),
          axiosInstance.get('/personalized-system/medical-info'),
          axiosInstance.get('/diet-plan/history?limit=30'),
          axiosInstance.get('/exercise-plan/history?limit=30'),
          axiosInstance.get('/lifestyle-tips/history?limit=30'),
        ]);
        const personalFields = ['fullName', 'date_of_birth', 'gender', 'phone_number'];
        const medicalFields = ['diabetes_type', 'diagnosis_date'];
        const personalData = personalRes.data?.data || {};
        const medicalData = medicalRes.data?.data || {};
        const total = personalFields.length + medicalFields.length;
        const completed = [...personalFields, ...medicalFields].reduce((count, field) => {
          const source = personalFields.includes(field) ? personalData : medicalData;
          return source[field] ? count + 1 : count;
        }, 0);
        setPersonalInfoCompletion(total ? Math.round((completed / total) * 100) : 0);
        setPersonalInfo(personalData);
        setMedicalInfo(medicalData);
        setDietHistory(dietRes.data?.plans || []);
        setExerciseHistory(exerciseRes.data?.plans || []);
        setLifestyleHistory(lifestyleRes.data?.history || []);
      } catch (e) {
        setPersonalInfoCompletion(0);
        setPersonalInfo(null);
        setMedicalInfo(null);
        setDietHistory(null);
        setExerciseHistory(null);
        setLifestyleHistory(null);
      }
    };

    fetchCompletion();
  }, [currentSection, user]);

  // Check if user came from feedback page to show feedback form
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showFeedback') === 'true') {
      // Switch to My Feedback section (index 4)
      setSelectedIndex(4);
      setShowFeedbackForm(true);
      // Remove query param from URL
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Fetch disease data on Insights and My Disease Data sections
    if (currentSection === 'Insights' || currentSection === 'My Disease Data') {
      setLoading(true);
      setError(null);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  }, [currentSection]);

  // Fetch latest assessment summary for Insights
  useEffect(() => {
    if (!user) return;
    if (currentSection !== 'Insights') return;

    const fetchSummary = async () => {
      try {
        setAssessmentLoading(true);
        const response = await assessDiabetesRisk();
        const result = response?.result || {};
        const features = response?.features || {};

        const symptoms_present = Object.entries(features)
          .filter(([k, v]) => !['Age', 'Gender', 'Obesity'].includes(k) && Number(v) === 1)
          .map(([k]) => k);

        const feature_importance = {};
        if (result.feature_importance && typeof result.feature_importance === 'object') {
          Object.entries(result.feature_importance).forEach(([k, v]) => {
            if (v && typeof v === 'object' && typeof v.importance === 'number') {
              feature_importance[k] = v.importance;
            }
          });
        }

        const normalized = {
          risk_level: (result.risk_level || 'low').charAt(0).toUpperCase() + (result.risk_level || 'low').slice(1),
          probability: Number(result.diabetes_probability || 0),
          confidence: Number(result.confidence || 0),
          symptoms_present,
          feature_importance,
        };

        setAssessmentSummary(normalized);
      } catch (err) {
        console.error('Failed to fetch assessment summary for dashboard:', err);
        setAssessmentSummary(null);
      } finally {
        setAssessmentLoading(false);
      }
    };

    fetchSummary();
  }, [currentSection, user]);

  // Ensure assessment popup is shown whenever user opens Insights after an assessment
  useEffect(() => {
    if (!user) return;
    if (currentSection !== 'Insights') return;

    const hasAssessment = !!user.last_assessment_at;
    const isDiagnosed = user.diabetes_diagnosed === 'yes';

    if (hasAssessment && !isDiagnosed) {
      setShowAssessmentPopup(true);
    }
  }, [currentSection, user]);

  // Fetch personal/medical info and completion for diagnosed dashboard
  useEffect(() => {
    if (!user || user.diabetes_diagnosed !== 'yes') return;
    if (currentSection !== 'Personalized Suggestions' && currentSection !== 'Insights') return;

    const fetchCompletion = async () => {
      try {
        const [personalRes, medicalRes, dietRes, exerciseRes, lifestyleRes] = await Promise.all([
          axiosInstance.get('/personalized-system/personal-info'),
          axiosInstance.get('/personalized-system/medical-info'),
          axiosInstance.get('/diet-plan/history?limit=30'),
          axiosInstance.get('/exercise-plan/history?limit=30'),
          axiosInstance.get('/lifestyle-tips/history?limit=30'),
        ]);
        const personalFields = ['fullName', 'date_of_birth', 'gender', 'phone_number'];
        const medicalFields = ['diabetes_type', 'diagnosis_date'];
        const personalData = personalRes.data?.data || {};
        const medicalData = medicalRes.data?.data || {};
        const total = personalFields.length + medicalFields.length;
        const completed = [...personalFields, ...medicalFields].reduce((count, field) => {
          const source = personalFields.includes(field) ? personalData : medicalData;
          return source[field] ? count + 1 : count;
        }, 0);
        setPersonalInfoCompletion(total ? Math.round((completed / total) * 100) : 0);
        setPersonalInfo(personalData);
        setMedicalInfo(medicalData);
        setDietHistory(dietRes.data?.plans || []);
        setExerciseHistory(exerciseRes.data?.plans || []);
        setLifestyleHistory(lifestyleRes.data?.history || []);
      } catch (e) {
        setPersonalInfoCompletion(0);
        setPersonalInfo(null);
        setMedicalInfo(null);
        setDietHistory(null);
        setExerciseHistory(null);
        setLifestyleHistory(null);
      }
    };

    fetchCompletion();
  }, [currentSection, user]);

  // Derived analytics: BMI and simple lab risk bands
  const bmiAnalytics = useMemo(() => {
    if (!personalInfo?.height || !personalInfo?.weight) return null;
    const heightM = Number(personalInfo.height) / 100;
    const weightKg = Number(personalInfo.weight);
    if (!heightM || !weightKg) return null;
    const bmi = weightKg / (heightM * heightM);
    let label = 'Normal range';
    let severity = 'success';
    if (bmi < 18.5) {
      label = 'Underweight';
      severity = 'warning';
    } else if (bmi >= 25 && bmi < 30) {
      label = 'Overweight';
      severity = 'warning';
    } else if (bmi >= 30) {
      label = 'Obese range';
      severity = 'error';
    }
    // Normalize bar to 15-35 range
    const clamped = Math.min(35, Math.max(15, bmi));
    const pct = Math.round(((clamped - 15) / (35 - 15)) * 100);
    return { value: bmi.toFixed(1), label, severity, pct };
  }, [personalInfo]);

  const labsAnalytics = useMemo(() => {
    if (!medicalInfo) return {};
    const labs = {};

    const hba1cVal = medicalInfo?.recent_lab_results?.hba1c?.value;
    if (hba1cVal != null) {
      let status = 'On target';
      let severity = 'success';
      if (hba1cVal >= 7 && hba1cVal < 8) {
        status = 'Slightly above target';
        severity = 'warning';
      } else if (hba1cVal >= 8) {
        status = 'High  needs attention';
        severity = 'error';
      }
      const pct = Math.min(140, Math.round((hba1cVal / 7) * 100));
      labs.hba1c = { value: hba1cVal, status, severity, pct };
    }

    const fgVal = medicalInfo?.recent_lab_results?.fasting_glucose?.value;
    if (fgVal != null) {
      let status = 'In target range';
      let severity = 'success';
      if (fgVal >= 100 && fgVal < 126) {
        status = 'Prediabetes range';
        severity = 'warning';
      } else if (fgVal >= 126) {
        status = 'Diabetes range';
        severity = 'error';
      }
      const pct = Math.min(150, Math.round((fgVal / 126) * 100));
      labs.fasting_glucose = { value: fgVal, status, severity, pct };
    }

    const sys = medicalInfo?.blood_pressure?.systolic;
    const dia = medicalInfo?.blood_pressure?.diastolic;
    if (sys && dia) {
      let status = 'Controlled';
      let severity = 'success';
      if (sys >= 130 || dia >= 80) {
        status = 'Elevated blood pressure';
        severity = 'warning';
      }
      if (sys >= 140 || dia >= 90) {
        status = 'Hypertension  see doctor';
        severity = 'error';
      }
      const pct = Math.min(150, Math.round((sys / 140) * 100));
      labs.blood_pressure = { value: `${sys}/${dia}`, status, severity, pct };
    }

    return labs;
  }, [medicalInfo]);

  const planUsageAnalytics = useMemo(() => {
    if (!dietHistory && !exerciseHistory && !lifestyleHistory) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatKey = (d) => {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return null;
      return dt.toISOString().slice(0, 10);
    };

    const dietMap = new Map();
    (dietHistory || []).forEach((p) => {
      const k = formatKey(p.target_date || p.targetDate);
      if (!k) return;
      if (!dietMap.has(k)) dietMap.set(k, p);
    });

    const exerciseMap = new Map();
    (exerciseHistory || []).forEach((p) => {
      const k = formatKey(p.target_date || p.targetDate);
      if (!k) return;
      if (!exerciseMap.has(k)) exerciseMap.set(k, p);
    });

    const lifestyleMap = new Map();
    (lifestyleHistory || []).forEach((p) => {
      const k = formatKey(p.target_date || p.targetDate);
      if (!k) return;
      if (!lifestyleMap.has(k)) lifestyleMap.set(k, p);
    });

    const timeline = [];
    // Use dynamic time range instead of fixed 14 days
    const daysToShow = chartTimeRange - 1;
    for (let offset = daysToShow; offset >= 0; offset -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      const key = formatKey(d);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      timeline.push({
        key,
        label,
        diet: !!dietMap.get(key),
        exercise: !!exerciseMap.get(key),
        lifestyle: !!lifestyleMap.get(key),
      });
    }

    const calcStats = (field) => {
      const totalDays = timeline.length;
      const daysWithPlan = timeline.filter((d) => d[field]).length;
      let currentStreak = 0;
      for (let i = timeline.length - 1; i >= 0; i -= 1) {
        if (timeline[i][field]) currentStreak += 1;
        else break;
      }
      return { totalDays, daysWithPlan, currentStreak };
    };

    const dailySeries = timeline.map((day) => {
      const dietPlan = dietMap.get(day.key) || null;
      const exercisePlan = exerciseMap.get(day.key) || null;

      const dietCalories = dietPlan
        ? Number(dietPlan?.nutritional_totals?.calories ?? dietPlan?.total_calories ?? 0) || 0
        : null;
      const dietCarbs = dietPlan
        ? Number(dietPlan?.nutritional_totals?.carbs ?? 0) || 0
        : null;
      const exerciseMinutes = exercisePlan
        ? Number(exercisePlan?.totals?.duration_total_min ?? 0) || 0
        : null;
      const exerciseCalories = exercisePlan
        ? Number(exercisePlan?.totals?.calories_total ?? 0) || 0
        : null;

      return {
        key: day.key,
        label: day.label,
        dietCalories,
        dietCarbs,
        exerciseMinutes,
        exerciseCalories,
        dietPlan,
        exercisePlan,
      };
    });

    // Aggregate averages from available history (not limited to 14 days)
    let dietCaloriesSum = 0;
    let dietCarbsSum = 0;
    let dietCount = 0;
    (dietHistory || []).forEach((p) => {
      const calories = p.nutritional_totals?.calories ?? p.total_calories;
      const carbs = p.nutritional_totals?.carbs ?? 0;
      if (calories != null) {
        dietCaloriesSum += Number(calories) || 0;
        dietCarbsSum += Number(carbs) || 0;
        dietCount += 1;
      }
    });

    let exMinutesSum = 0;
    let exCaloriesSum = 0;
    let exCount = 0;
    (exerciseHistory || []).forEach((p) => {
      const mins = p.totals?.duration_total_min ?? 0;
      const cals = p.totals?.calories_total ?? 0;
      if (mins || cals) {
        exMinutesSum += Number(mins) || 0;
        exCaloriesSum += Number(cals) || 0;
        exCount += 1;
      }
    });

    return {
      timeline,
      dietStats: calcStats('diet'),
      exerciseStats: calcStats('exercise'),
      lifestyleStats: calcStats('lifestyle'),
      dailySeries,
      avgDietCalories: dietCount ? Math.round(dietCaloriesSum / dietCount) : null,
      avgDietCarbs: dietCount ? Math.round(dietCarbsSum / dietCount) : null,
      avgExerciseMinutes: exCount ? Math.round(exMinutesSum / exCount) : null,
      avgExerciseCalories: exCount ? Math.round(exCaloriesSum / exCount) : null,
    };
  }, [dietHistory, exerciseHistory, lifestyleHistory, chartTimeRange]);

  // Consistency score calculation
  const consistencyScore = useMemo(() => {
    if (!planUsageAnalytics) return 0;
    const { dietStats, exerciseStats, lifestyleStats } = planUsageAnalytics;
    const totalPossible = dietStats.totalDays + exerciseStats.totalDays + lifestyleStats.totalDays;
    const totalAchieved = dietStats.daysWithPlan + exerciseStats.daysWithPlan + lifestyleStats.daysWithPlan;
    return totalPossible ? Math.round((totalAchieved / totalPossible) * 100) : 0;
  }, [planUsageAnalytics]);

  const consistencyBadge = useMemo(() => {
    if (consistencyScore >= 80) return { label: 'Diamond', color: '#60a5fa', icon: '💎' };
    if (consistencyScore >= 60) return { label: 'Gold', color: '#fbbf24', icon: '🏆' };
    if (consistencyScore >= 40) return { label: 'Silver', color: '#94a3b8', icon: '🥈' };
    return { label: 'Bronze', color: '#d97706', icon: '🥉' };
  }, [consistencyScore]);

  // Adaptive next action recommendation
  const adaptiveNextAction = useMemo(() => {
    if (!user) return null;

    // Check profile completion
    if (personalInfoCompletion < 100) {
      return {
        title: 'Complete Your Profile',
        description: `${100 - personalInfoCompletion}% remaining to unlock all features`,
        action: () => navigate('/personalized-suggestions/personal-medical'),
        icon: <PersonIcon />,
        priority: 'high',
        color: 'error'
      };
    }

    // Check last HbA1c update
    if (medicalInfo?.recent_lab_results?.hba1c?.date) {
      const lastUpdate = new Date(medicalInfo.recent_lab_results.hba1c.date);
      const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 90) {
        return {
          title: 'Update HbA1c Results',
          description: `It's been ${daysSince} days since your last update`,
          action: () => navigate('/personalized-suggestions/personal-medical'),
          icon: <ScienceIcon />,
          priority: 'medium',
          color: 'warning'
        };
      }
    }

    // Check exercise streak
    if (planUsageAnalytics?.exerciseStats?.currentStreak >= 5) {
      return {
        title: 'Maintain Your Streak!',
        description: `${planUsageAnalytics.exerciseStats.currentStreak} day exercise streak - keep it up!`,
        action: () => navigate('/personalized-suggestions/exercise-plan'),
        icon: <LocalFireDepartmentIcon />,
        priority: 'positive',
        color: 'success'
      };
    }

    // Check if no recent plans
    if (planUsageAnalytics) {
      const recentDietDays = planUsageAnalytics.dietStats.daysWithPlan;
      if (recentDietDays === 0) {
        return {
          title: 'Generate Your Diet Plan',
          description: 'No diet plans this period - let\'s get started!',
          action: () => navigate('/personalized-suggestions/diet-plan'),
          icon: <RestaurantIcon />,
          priority: 'medium',
          color: 'info'
        };
      }
    }

    // Default
    return {
      title: 'All Set!',
      description: 'Keep up the great work managing your health',
      action: () => navigate('/personalized-suggestions/chat-assistant'),
      icon: <CheckCircleIcon />,
      priority: 'low',
      color: 'success'
    };
  }, [user, personalInfoCompletion, medicalInfo, planUsageAnalytics, navigate]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('chartTimeRange', chartTimeRange.toString());
  }, [chartTimeRange]);

  useEffect(() => {
    localStorage.setItem('expandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    localStorage.setItem('healthGoals', JSON.stringify(healthGoals));
  }, [healthGoals]);

  // Animate progress bars on load
  useEffect(() => {
    if (currentSection === 'Insights' && bmiAnalytics) {
      setTimeout(() => {
        setAnimatedValues(prev => ({ ...prev, bmi: bmiAnalytics.pct }));
      }, 100);
    }
  }, [currentSection, bmiAnalytics]);

  // Keyboard shortcuts
  useEffect(() => {
    if (currentSection !== 'Insights') return;

    const handleKeyPress = (e) => {
      // Show shortcuts with '?'
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Refresh data with 'r'
      if (e.key === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        window.location.reload();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentSection]);

  // Helper functions
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const scrollToSection = useCallback((ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAddGoal = useCallback(() => {
    if (!newGoal.title || !newGoal.target) return;
    const goal = {
      id: Date.now(),
      ...newGoal,
      target: parseFloat(newGoal.target),
      createdAt: new Date().toISOString()
    };
    setHealthGoals(prev => [...prev, goal]);
    setNewGoal({ title: '', target: '', current: 0, unit: '' });
    setShowGoalDialog(false);
    toast.success('Goal added successfully!');
  }, [newGoal]);

  const handleDeleteGoal = useCallback((id) => {
    setHealthGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal removed');
  }, []);

  const handleUpdateGoalProgress = useCallback((id, progress) => {
    setHealthGoals(prev => prev.map(g => 
      g.id === id ? { ...g, current: parseFloat(progress) } : g
    ));
  }, []);

  const handleChartPointClick = useCallback((data) => {
    if (!data) return;
    setSelectedDayData(data);
    setShowDayDetailsModal(true);
  }, []);

  const handleExportPDF = useCallback(() => {
    toast.info('PDF export feature - Install html2canvas and jsPDF for full implementation');
    setExportMenuAnchor(null);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!planUsageAnalytics?.dailySeries) return;
    
    const headers = ['Date', 'Diet Calories', 'Carbs (g)', 'Exercise Minutes', 'Exercise Calories'];
    const rows = planUsageAnalytics.dailySeries.map(day => [
      day.label,
      day.dietCalories || 0,
      day.dietCarbs || 0,
      day.exerciseMinutes || 0,
      day.exerciseCalories || 0
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diabetes-insights-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
    setExportMenuAnchor(null);
  }, [planUsageAnalytics]);

  const getTrendIcon = (current, previous) => {
    if (!previous || current === previous) return <TrendingFlatIcon fontSize="small" />;
    if (current > previous) return <TrendingUpIcon fontSize="small" color="success" />;
    return <TrendingDownIcon fontSize="small" color="error" />;
  };

  const calculateTrend = (dataKey, index) => {
    if (!planUsageAnalytics?.dailySeries || index === 0) return null;
    const current = planUsageAnalytics.dailySeries[index]?.[dataKey];
    const previous = planUsageAnalytics.dailySeries[index - 1]?.[dataKey];
    if (current == null || previous == null) return null;
    const diff = current - previous;
    const icon = getTrendIcon(current, previous);
    return { diff, icon, current, previous };
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleDiagnosisAnswer = async (answer) => {
    try {
      const response = await axiosInstance.post('/personalized-system/diabetes-diagnosis', {
        diabetes_diagnosed: answer,
      });
      
      // Update user state
      const updatedUser = {
        ...user,
        diabetes_diagnosed: answer,
      };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setShowDiagnosisPopup(false);
      
      // If user answered "yes", show the diagnosed dashboard and focus on personalized suggestions
      if (answer === 'yes') {
        const idx = diagnosedSections.findIndex((s) => s.label === 'Personalized Suggestions');
        setSelectedIndex(idx >= 0 ? idx : 0);
        return;
      }

      // If user answered "no", check if onboarding is completed
      if (!user?.onboardingCompleted) {
        navigate('/onboarding');
      }
    } catch (err) {
      console.error('Error updating diabetes diagnosis:', err);
      alert('Failed to save your response. Please try again.');
    }
  };

  const handleAssessmentPopupAnswer = async (answerKey) => {
    try {
      // Map popup answers to existing diagnosis endpoint where appropriate
      if (answerKey === 'diagnosed_diabetic' || answerKey === 'diagnosed_not_diabetic') {
        const diagnosisValue = answerKey === 'diagnosed_diabetic' ? 'yes' : 'no';
        await handleDiagnosisAnswer(diagnosisValue);
      }

      // In all cases, hide popup after answer
      setShowAssessmentPopup(false);
    } catch (err) {
      console.error('Error handling assessment popup answer:', err);
      setShowAssessmentPopup(false);
    }
  };

  const handleEditDiseaseData = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleDataUpdated = () => {
    if (selectedIndex === 1) {
      setLoading(true);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  };

  // Account: state for update
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    setSavingProfile(true);
    setProfileError(null);
    try {
      const payload = { fullName: user.fullName };
      await updateUserProfile(user._id, payload);
    } catch (err) {
      const msg = err?.response?.data?.message || 'You may not have permission to update your profile.';
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Password: we only provide a navigation option to the existing flow

  // No-op: assessments navigated inline via onClick handlers

  const renderMetricChart = (title, dataKey, color, unit, emptyMessage, description) => {
    const hasData = planUsageAnalytics?.dailySeries?.some((d) => d[dataKey] != null && d[dataKey] !== 0);

    // Enhanced tooltip with trends
    const CustomTooltip = ({ active, payload, label }) => {
      if (!active || !payload || !payload.length) return null;
      
      const value = payload[0].value;
      const dataIndex = planUsageAnalytics.dailySeries.findIndex(d => d.label === label);
      const trend = calculateTrend(dataKey, dataIndex);

      return (
        <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider' }} elevation={3}>
          <Typography variant="caption" display="block" fontWeight={600}>
            {label}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {value} {unit}
            </Typography>
            {trend && trend.diff !== 0 && (
              <Chip 
                size="small" 
                label={`${trend.diff > 0 ? '+' : ''}${Math.round(trend.diff)}`}
                color={trend.diff > 0 ? 'success' : 'error'}
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
            )}
          </Box>
          {trend && trend.previous && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Previous: {Math.round(trend.previous)} {unit}
            </Typography>
          )}
        </Paper>
      );
    };

    return (
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          {title}
        </Typography>
        {hasData ? (
          <>
            <Box sx={{ mt: 1, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={planUsageAnalytics.dailySeries}
                  margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ReTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4, cursor: 'pointer' }}
                    activeDot={{ 
                      r: 7, 
                      cursor: 'pointer',
                      onClick: (e, payload) => handleChartPointClick(payload.payload)
                    }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            {description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.75, display: 'block' }}
              >
                {description}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {emptyMessage}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      // Use a clean, flat surface to avoid heavy radial/oval backgrounds
      background: (t) => t.palette.background.default
    }}>
      <CssBaseline />
      {/* Sidebar - Enhanced Professional Design */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: (t) => t.palette.mode === 'dark' 
              ? 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)' 
              : 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            boxShadow: (t) => t.palette.mode === 'dark'
              ? '2px 0 12px rgba(0,0,0,0.5)'
              : '2px 0 12px rgba(0,0,0,0.04)',
            // Hide scrollbar in sidebar but keep it scrollable
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            '-ms-overflow-style': 'none', // IE/Edge legacy
            '&::-webkit-scrollbar': { display: 'none' }, // WebKit
          },
        }}
      >
        <Box>
          {/* User Profile Header - Premium Design */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 2,
              py: 2.5,
              mb: 3,
              borderRadius: 2,
              background: (t) => t.palette.mode === 'dark'
                ? alpha(t.palette.primary.main, 0.08)
                : alpha(t.palette.primary.main, 0.04),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: (t) => alpha(t.palette.primary.main, 0.12),
                borderColor: (t) => alpha(t.palette.primary.main, 0.25),
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 44,
                height: 44,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                fontWeight: 700,
                fontSize: '1.2rem',
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.3)}`,
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight={700}
                sx={{ 
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.25,
                  fontSize: '0.9rem',
                }}
              >
                {user?.fullName || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Dashboard
              </Typography>
            </Box>
          </Box>
          
          {/* Navigation Menu - Premium Design */}
          <List sx={{ px: 0 }}>
            {sections.map((sec, index) => (
              <ListItem 
                button 
                key={sec.label} 
                selected={selectedIndex === index} 
                onClick={() => {
                  setSelectedIndex(index);
                  // Reset feedback form flag when switching sections
                  if (index !== 4) {
                    setShowFeedbackForm(false);
                  }
                }} 
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1.5,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: (t) => `linear-gradient(180deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&.Mui-selected': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? alpha(t.palette.primary.main, 0.12)
                      : alpha(t.palette.primary.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                    '&::before': {
                      opacity: 1,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                      transform: 'scale(1.1)',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 700,
                    },
                  },
                  '&:hover': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? alpha(t.palette.primary.main, 0.08)
                      : alpha(t.palette.primary.main, 0.04),
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {sec.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={sec.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Bottom Section - Minimal */}
        <Box sx={{ px: 0.5 }}>
          {/* Theme Toggle - Integrated */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              py: 2,
              mb: 1,
            }}
          >
            <ThemeToggle size="medium" />
          </Box>
          
          {/* Logout Button - Premium */}
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 700,
              py: 1.5,
              px: 2,
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderColor: (t) => alpha(t.palette.error.main, 0.3),
              color: 'error.main',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                borderColor: 'error.main',
                transform: 'translateY(-2px)',
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.error.main, 0.25)}`,
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, ml: 0, mt: 0, minHeight: '100vh', background: 'transparent' }}>
        {/* Content container */}
        <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 3, md: 5 }, pb: 6, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: selectedIndex === 2 
              ? 'clamp(1400px, 95vw, 1920px)' 
              : 'clamp(1200px, 90vw, 1440px)'
          }}>
            {currentSection === 'Insights' && (
              <Box>
                {user?.diabetes_diagnosed === 'yes' ? (
                  <Box>
                    {/* Main grid - Comprehensive Health Analytics Dashboard */}
                    <Grid container spacing={3}>
                      {/* Page Header with Key Metrics */}
                      <Grid item xs={12}>
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: 'text.primary', letterSpacing: -0.5 }}>
                            Health Analytics Dashboard
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                            Comprehensive insights from your personalized diet, exercise, and lifestyle data
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* === SECTION 1: NUTRITION ANALYTICS === */}
                    <Box sx={{ mt: 4, mb: 3 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: (t) => `2px solid ${alpha(t.palette.primary.main, 0.1)}` }}>
                        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary', letterSpacing: -0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.1) }}>
                            <RestaurantIcon color="primary" sx={{ fontSize: 24 }} />
                          </Box>
                          Nutrition Analytics
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>

                      {/* Daily Calorie Tracking */}
                      <Grid item xs={12} lg={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.primary.main, 0.08)}`, borderColor: (t) => alpha(t.palette.primary.main, 0.2) } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem' }}>Calorie Distribution</Typography>
                            <ToggleButtonGroup
                              value={nutritionTimeRange}
                              exclusive
                              onChange={(e, newValue) => newValue && setNutritionTimeRange(newValue)}
                              size="small"
                              sx={{ height: 32 }}
                            >
                              <ToggleButton value="daily" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>Daily</ToggleButton>
                              <ToggleButton value="weekly" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>Weekly</ToggleButton>
                              <ToggleButton value="monthly" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>Monthly</ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                          <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={Array.isArray(planUsageAnalytics?.dailySeries) ? planUsageAnalytics.dailySeries.slice(
                              nutritionTimeRange === 'daily' ? -7 : nutritionTimeRange === 'weekly' ? -14 : -30
                            ) : []}>
                              <defs>
                                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                              <Area type="monotone" dataKey="dietCalories" stroke="#10b981" fill="url(#colorCalories)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon fontSize="small" color="success" />
                            <Typography variant="caption" color="text.secondary">
                              Avg: {planUsageAnalytics?.dailySeries?.length > 0 ? Math.round(planUsageAnalytics.dailySeries.slice(
                                nutritionTimeRange === 'daily' ? -7 : nutritionTimeRange === 'weekly' ? -14 : -30
                              ).reduce((sum, d) => sum + (d.dietCalories || 0), 0) / planUsageAnalytics.dailySeries.slice(
                                nutritionTimeRange === 'daily' ? -7 : nutritionTimeRange === 'weekly' ? -14 : -30
                              ).length) : 0} kcal/day
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Carbohydrate Tracking */}
                      <Grid item xs={12} lg={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.warning.main, 0.08)}`, borderColor: (t) => alpha(t.palette.warning.main, 0.2) } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem' }}>Carbohydrate Trends</Typography>
                            <ToggleButtonGroup
                              value={nutritionTimeRange}
                              exclusive
                              onChange={(e, newValue) => newValue && setNutritionTimeRange(newValue)}
                              size="small"
                              sx={{ height: 32 }}
                            >
                              <ToggleButton value="daily" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>Daily</ToggleButton>
                              <ToggleButton value="weekly" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>Weekly</ToggleButton>
                              <ToggleButton value="monthly" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>Monthly</ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                          <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={Array.isArray(planUsageAnalytics?.dailySeries) ? planUsageAnalytics.dailySeries.slice(
                              nutritionTimeRange === 'daily' ? -7 : nutritionTimeRange === 'weekly' ? -14 : -30
                            ) : []}>
                              <defs>
                                <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                              <Area type="monotone" dataKey="dietCarbs" stroke="#f97316" fill="url(#colorCarbs)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon fontSize="small" color="warning" />
                            <Typography variant="caption" color="text.secondary">
                              Avg: {planUsageAnalytics?.dailySeries?.length > 0 ? Math.round(planUsageAnalytics.dailySeries.slice(
                                nutritionTimeRange === 'daily' ? -7 : nutritionTimeRange === 'weekly' ? -14 : -30
                              ).reduce((sum, d) => sum + (d.dietCarbs || 0), 0) / planUsageAnalytics.dailySeries.slice(
                                nutritionTimeRange === 'daily' ? -7 : nutritionTimeRange === 'weekly' ? -14 : -30
                              ).length) : 0}g/day
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Macronutrient Distribution Pie Chart */}
                      <Grid item xs={12} md={6} lg={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.primary.main, 0.08)}`, borderColor: (t) => alpha(t.palette.primary.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Macronutrient Balance</Typography>
                          <Box sx={{ display: 'grid', gap: 1.5 }}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Carbohydrates</Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem' }}>45%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={45} sx={{ height: 10, borderRadius: 2, bgcolor: alpha('#f97316', 0.12), '& .MuiLinearProgress-bar': { bgcolor: '#f97316', borderRadius: 2, transition: 'transform 0.4s ease' } }} />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Proteins</Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem' }}>30%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={30} sx={{ height: 10, borderRadius: 2, bgcolor: alpha('#3b82f6', 0.12), '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 2, transition: 'transform 0.4s ease' } }} />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Fats</Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem' }}>20%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={20} sx={{ height: 10, borderRadius: 2, bgcolor: alpha('#eab308', 0.12), '& .MuiLinearProgress-bar': { bgcolor: '#eab308', borderRadius: 2, transition: 'transform 0.4s ease' } }} />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Fiber</Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem' }}>5%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={5} sx={{ height: 10, borderRadius: 2, bgcolor: alpha('#10b981', 0.12), '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2, transition: 'transform 0.4s ease' } }} />
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Meal-Wise Calorie Distribution */}
                      <Grid item xs={12} md={6} lg={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.primary.main, 0.08)}`, borderColor: (t) => alpha(t.palette.primary.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Meal-Wise Distribution (Today)</Typography>
                          <ResponsiveContainer width="100%" height={220}>
                            <ComposedChart data={[
                              { meal: 'Breakfast', calories: 420, protein: 18 },
                              { meal: 'Lunch', calories: 650, protein: 32 },
                              { meal: 'Snack', calories: 200, protein: 8 },
                              { meal: 'Dinner', calories: 580, protein: 28 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Bar yAxisId="left" dataKey="calories" fill="#10b981" radius={[8, 8, 0, 0]} />
                              <Line yAxisId="right" type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* === SECTION 2: EXERCISE ANALYTICS === */}
                    <Box sx={{ mt: 5, mb: 3 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: (t) => `2px solid ${alpha(t.palette.info.main, 0.1)}` }}>
                        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary', letterSpacing: -0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: (t) => alpha(t.palette.info.main, 0.1) }}>
                            <FitnessCenterIcon color="info" sx={{ fontSize: 24 }} />
                          </Box>
                          Exercise & Activity Analytics
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>

                      {/* Exercise Duration Tracking */}
                      <Grid item xs={12} lg={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.info.main, 0.08)}`, borderColor: (t) => alpha(t.palette.info.main, 0.2) } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem' }}>Exercise Duration</Typography>
                            <ToggleButtonGroup
                              value={exerciseTimeRange}
                              exclusive
                              onChange={(e, newValue) => {
                                if (newValue !== null) {
                                  setExerciseTimeRange(newValue);
                                }
                              }}
                              size="small"
                              sx={{ height: 32 }}
                            >
                              <ToggleButton value="daily" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>Daily</ToggleButton>
                              <ToggleButton value="weekly" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>Weekly</ToggleButton>
                              <ToggleButton value="monthly" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>Monthly</ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                          <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={Array.isArray(planUsageAnalytics?.dailySeries) ? planUsageAnalytics.dailySeries.slice(exerciseTimeRange === 'daily' ? -7 : exerciseTimeRange === 'weekly' ? -14 : -30) : []}>
                              <defs>
                                <linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                              <Area type="monotone" dataKey="exerciseMinutes" stroke="#3b82f6" fill="url(#colorExercise)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon fontSize="small" color="info" />
                            <Typography variant="caption" color="text.secondary">
                              Avg: {planUsageAnalytics?.dailySeries?.length > 0 ? Math.round(planUsageAnalytics.dailySeries.slice(exerciseTimeRange === 'daily' ? -7 : exerciseTimeRange === 'weekly' ? -14 : -30).reduce((sum, d) => sum + (d.exerciseMinutes || 0), 0) / planUsageAnalytics.dailySeries.slice(exerciseTimeRange === 'daily' ? -7 : exerciseTimeRange === 'weekly' ? -14 : -30).length) : 0} min/day
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Exercise Type Distribution */}
                      <Grid item xs={12} lg={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.success.main, 0.08)}`, borderColor: (t) => alpha(t.palette.success.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Exercise Type Distribution</Typography>
                          <Box sx={{ display: 'grid', gap: 1.5, mb: 1 }}>
                            {[
                              { type: 'Walking', percentage: 40, color: '#10b981' },
                              { type: 'Cardio', percentage: 30, color: '#3b82f6' },
                              { type: 'Strength', percentage: 20, color: '#f97316' },
                              { type: 'Flexibility', percentage: 10, color: '#eab308' }
                            ].map((item) => (
                              <Box key={item.type}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">{item.type}</Typography>
                                  <Typography variant="caption" fontWeight={600}>{item.percentage}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={item.percentage} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 1, 
                                    bgcolor: alpha(item.color, 0.1), 
                                    '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 1 } 
                                  }} 
                                />
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* === SECTION 3: PERSONAL & MEDICAL PROFILE === */}
                    <Box sx={{ mt: 5, mb: 3 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: (t) => `2px solid ${alpha(t.palette.success.main, 0.1)}` }}>
                        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary', letterSpacing: -0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: (t) => alpha(t.palette.success.main, 0.1) }}>
                            <PersonIcon color="success" sx={{ fontSize: 24 }} />
                          </Box>
                          Personal & Medical Profile
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>

                      {/* BMI & Weight Analytics */}
                      <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.success.main, 0.08)}`, borderColor: (t) => alpha(t.palette.success.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Body Mass Index</Typography>
                          {bmiAnalytics ? (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                                <Typography variant="h3" fontWeight={700}>{bmiAnalytics.value}</Typography>
                                <Chip 
                                  label={bmiAnalytics.label} 
                                  size="small" 
                                  color={bmiAnalytics.severity === 'success' ? 'success' : bmiAnalytics.severity === 'warning' ? 'warning' : 'error'}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </Box>
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">BMI Progress</Typography>
                                  <Typography variant="caption" fontWeight={600}>{bmiAnalytics.pct}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={bmiAnalytics.pct} 
                                  sx={{ 
                                    height: 10, 
                                    borderRadius: 1, 
                                    bgcolor: alpha(bmiAnalytics.severity === 'success' ? '#10b981' : bmiAnalytics.severity === 'warning' ? '#eab308' : '#ef4444', 0.1),
                                    '& .MuiLinearProgress-bar': { 
                                      bgcolor: bmiAnalytics.severity === 'success' ? '#10b981' : bmiAnalytics.severity === 'warning' ? '#eab308' : '#ef4444',
                                      borderRadius: 1 
                                    } 
                                  }} 
                                />
                              </Box>
                              <Divider sx={{ my: 1.5 }} />
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Height</Typography>
                                  <Typography variant="body2" fontWeight={600}>{personalInfo?.height || 'N/A'} cm</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                                  <Typography variant="body2" fontWeight={600}>{personalInfo?.weight || 'N/A'} kg</Typography>
                                </Box>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No BMI data available</Typography>
                          )}
                        </Paper>
                      </Grid>

                      {/* Profile Completion Gauge */}
                      <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.primary.main, 0.08)}`, borderColor: (t) => alpha(t.palette.primary.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Profile Completion</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                              <CircularProgress
                                variant="determinate"
                                value={personalInfoCompletion}
                                size={100}
                                thickness={6}
                                sx={{
                                  color: personalInfoCompletion === 100 ? '#10b981' : '#3b82f6',
                                  '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round',
                                  },
                                }}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="h5" fontWeight={700} color="text.primary">
                                  {personalInfoCompletion}%
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary" align="center">
                              {personalInfoCompletion === 100 ? 'Profile Complete' : `${100 - personalInfoCompletion}% remaining`}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1.5 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                              <Typography variant="caption">Personal Info</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                              <Typography variant="caption">Medical History</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* HbA1c & Blood Glucose */}
                      <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.error.main, 0.08)}`, borderColor: (t) => alpha(t.palette.error.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Glycemic Control</Typography>
                          {labsAnalytics ? (
                            <Box>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">HbA1c</Typography>
                                  <Typography variant="caption" fontWeight={600}>{labsAnalytics.hba1c?.value || 'N/A'}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={labsAnalytics.hba1c?.pct || 0} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 1, 
                                    bgcolor: alpha(labsAnalytics.hba1c?.severity === 'success' ? '#10b981' : '#ef4444', 0.1),
                                    '& .MuiLinearProgress-bar': { 
                                      bgcolor: labsAnalytics.hba1c?.severity === 'success' ? '#10b981' : '#ef4444',
                                      borderRadius: 1 
                                    } 
                                  }} 
                                />
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Fasting Glucose</Typography>
                                  <Typography variant="caption" fontWeight={600}>{labsAnalytics.glucose?.value || 'N/A'} mg/dL</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={labsAnalytics.glucose?.pct || 0} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 1, 
                                    bgcolor: alpha(labsAnalytics.glucose?.severity === 'success' ? '#10b981' : '#ef4444', 0.1),
                                    '& .MuiLinearProgress-bar': { 
                                      bgcolor: labsAnalytics.glucose?.severity === 'success' ? '#10b981' : '#ef4444',
                                      borderRadius: 1 
                                    } 
                                  }} 
                                />
                              </Box>
                              <Chip 
                                label={labsAnalytics.hba1c?.label || 'No Data'}
                                size="small"
                                color={labsAnalytics.hba1c?.severity === 'success' ? 'success' : 'error'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No lab data available</Typography>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* === SECTION 4: LIFESTYLE HABITS === */}
                    <Box sx={{ mt: 5, mb: 3 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: (t) => `2px solid ${alpha(t.palette.secondary.main, 0.1)}` }}>
                        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary', letterSpacing: -0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) }}>
                            <SelfImprovementIcon color="secondary" sx={{ fontSize: 24 }} />
                          </Box>
                          Lifestyle Habits & Patterns
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>

                      {/* Sleep & Stress */}
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha('#8b5cf6', 0.08)}`, borderColor: (t) => alpha('#8b5cf6', 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Sleep & Stress Management</Typography>
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <NightlightRoundIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Sleep Quality</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  {[1, 2, 3, 4].map((star) => (
                                    <Box key={star} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: star <= 3 ? '#8b5cf6' : alpha('#8b5cf6', 0.2) }} />
                                  ))}
                                </Box>
                              </Box>
                              <Typography variant="h6" fontWeight={700}>7.2h</Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <SelfImprovementIcon sx={{ color: '#10b981', fontSize: 32 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Stress Level</Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={40} 
                                  sx={{ 
                                    mt: 0.5,
                                    height: 8, 
                                    borderRadius: 1, 
                                    bgcolor: alpha('#10b981', 0.1),
                                    '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 1 } 
                                  }} 
                                />
                              </Box>
                              <Chip label="Low" size="small" color="success" sx={{ fontSize: '0.7rem' }} />
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Hydration & Activity */}
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.info.main, 0.08)}`, borderColor: (t) => alpha(t.palette.info.main, 0.2) } }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: '1rem' }}>Daily Tracking</Typography>
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <LocalDrinkIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Water Intake</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                                    <Box key={glass} sx={{ width: 10, height: 16, borderRadius: 0.5, bgcolor: glass <= 6 ? '#3b82f6' : alpha('#3b82f6', 0.2) }} />
                                  ))}
                                </Box>
                              </Box>
                              <Typography variant="h6" fontWeight={700}>6/8</Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <DirectionsWalkIcon sx={{ color: '#f97316', fontSize: 32 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Daily Steps</Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={72} 
                                  sx={{ 
                                    mt: 0.5,
                                    height: 8, 
                                    borderRadius: 1, 
                                    bgcolor: alpha('#f97316', 0.1),
                                    '& .MuiLinearProgress-bar': { bgcolor: '#f97316', borderRadius: 1 } 
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2" fontWeight={600}>7,200</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* === SECTION 5: SMART INSIGHTS === */}
                    <Box sx={{ mt: 5, mb: 3 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: (t) => `2px solid ${alpha(t.palette.warning.main, 0.1)}` }}>
                        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary', letterSpacing: -0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: (t) => alpha(t.palette.warning.main, 0.1) }}>
                            <LightbulbIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                          </Box>
                          Smart Insights
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>

                      {/* Key Insights Cards */}
                      <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha('#10b981', 0.3)}`, bgcolor: alpha('#10b981', 0.04), height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha('#10b981', 0.15)}`, borderColor: (t) => alpha('#10b981', 0.4), bgcolor: alpha('#10b981', 0.08) } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#10b981' }}>Positive Trend</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                            Your calorie intake has been consistently within target for the past 5 days. Keep up the great work!
                          </Typography>
                          <ResponsiveContainer width="100%" height={60}>
                            <AreaChart data={Array.isArray(planUsageAnalytics?.dailySeries) ? planUsageAnalytics.dailySeries.slice(-5) : []}>
                              <defs>
                                <linearGradient id="miniColorCalories" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="dietCalories" stroke="#10b981" fill="url(#miniColorCalories)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha('#3b82f6', 0.3)}`, bgcolor: alpha('#3b82f6', 0.04), height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha('#3b82f6', 0.15)}`, borderColor: (t) => alpha('#3b82f6', 0.4), bgcolor: alpha('#3b82f6', 0.08) } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <FitnessCenterIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#3b82f6' }}>Activity Boost</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                            Exercise duration increased by 25% this week. Your consistency is paying off!
                          </Typography>
                          <ResponsiveContainer width="100%" height={60}>
                            <AreaChart data={Array.isArray(planUsageAnalytics?.dailySeries) ? planUsageAnalytics.dailySeries.slice(-7) : []}>
                              <defs>
                                <linearGradient id="miniColorExercise" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="exerciseMinutes" stroke="#3b82f6" fill="url(#miniColorExercise)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha('#eab308', 0.3)}`, bgcolor: alpha('#eab308', 0.04), height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha('#eab308', 0.15)}`, borderColor: (t) => alpha('#eab308', 0.4), bgcolor: alpha('#eab308', 0.08) } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <InfoIcon sx={{ color: '#eab308', fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#eab308' }}>Attention Needed</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                            Carb intake slightly elevated this week. Consider balanced meal planning.
                          </Typography>
                          <ResponsiveContainer width="100%" height={60}>
                            <AreaChart data={Array.isArray(planUsageAnalytics?.dailySeries) ? planUsageAnalytics.dailySeries.slice(-7) : []}>
                              <defs>
                                <linearGradient id="miniColorCarbs" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="dietCarbs" stroke="#eab308" fill="url(#miniColorCarbs)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* === SECTION 6: MEDICAL OVERVIEW === */}
                    <Box sx={{ mt: 5, mb: 3 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: (t) => `2px solid ${alpha(t.palette.error.main, 0.1)}` }}>
                        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary', letterSpacing: -0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: (t) => alpha(t.palette.error.main, 0.1) }}>
                            <LocalHospitalIcon color="error" sx={{ fontSize: 24 }} />
                          </Box>
                          Medical Overview
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>

                      {/* Diagnosis Snapshot */}
                      <Grid item xs={12} md={7}>
                        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`, height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => `0 12px 24px ${alpha(t.palette.primary.main, 0.08)}`, borderColor: (t) => alpha(t.palette.primary.main, 0.2) } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontSize: '0.75rem',
                                }}
                              >
                                Diagnosis Snapshot
                              </Typography>
                              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                                {medicalInfo?.diabetes_type || 'Add your diabetes type'}
                              </Typography>
                            </Box>
                            <Chip
                              label={user?.diabetes_diagnosed === 'yes' ? 'Confirmed' : 'Not confirmed'}
                              color="success"
                              size="small"
                              sx={{
                                fontWeight: 600,
                                borderRadius: 1.5,
                                height: 24,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>

                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary', 
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontSize: '0.7rem'
                                }}
                              >
                                Diagnosis Date
                              </Typography>
                              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                {medicalInfo?.diagnosis_date
                                  ? new Date(medicalInfo.diagnosis_date).toLocaleDateString()
                                  : 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                Time Since Diagnosis
                              </Typography>
                              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                {medicalInfo?.diagnosis_date
                                  ? (() => {
                                      const d = new Date(medicalInfo.diagnosis_date);
                                      const diffYears = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                                      if (diffYears < 1) {
                                        const months = Math.max(1, Math.round(diffYears * 12));
                                        return `${months} month${months === 1 ? '' : 's'}`;
                                      }
                                      return `${diffYears.toFixed(1)} years`;
                                    })()
                                  : 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                Last Medical Check-up
                              </Typography>
                              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                {medicalInfo?.last_medical_checkup
                                  ? new Date(medicalInfo.last_medical_checkup).toLocaleDateString()
                                  : 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                Profile Completeness
                              </Typography>
                              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                {personalInfoCompletion}% complete
                              </Typography>
                            </Grid>
                          </Grid>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3, pt: 2.5, borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}` }}>
                            <Button
                              variant="contained"
                              onClick={() => navigate('/personalized-suggestions/personal-medical')}
                              sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2.5,
                                py: 1,
                                fontSize: '0.875rem',
                                boxShadow: 1,
                                '&:hover': {
                                  boxShadow: 2
                                }
                              }}
                            >
                              Update Medical Info
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => navigate('/personalized-suggestions/diet-plan')}
                              sx={{ 
                                borderRadius: 1, 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                px: 2.5, 
                                py: 1,
                                fontSize: '0.875rem'
                              }}
                              disabled={personalInfoCompletion < 100}
                            >
                              View Plans
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* IoT Real-Time Health Monitoring */}
                      <Grid item xs={12} md={5}>
                        <Paper
                          ref={labsRef}
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            background: (t) => t.palette.background.paper,
                            border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              borderColor: (t) => alpha(t.palette.divider, 0.2)
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'error.main',
                                    animation: 'pulse 2s ease-in-out infinite',
                                    '@keyframes pulse': {
                                      '0%, 100%': { opacity: 1 },
                                      '50%': { opacity: 0.3 }
                                    }
                                  }}
                                />
                                <Typography
                                  variant="subtitle2"
                                  sx={{ 
                                    color: 'error.main',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1
                                  }}
                                >
                                  Device Offline
                                </Typography>
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  color: 'text.primary'
                                }}
                              >
                                IoT Health Tracker
                              </Typography>
                            </Box>
                            <Chip
                              label="Not Connected"
                              size="small"
                              icon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                              sx={{
                                bgcolor: 'error.main',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 24,
                                '& .MuiChip-icon': { color: 'white' }
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5, fontSize: '0.75rem' }}>
                            Connect your glucose monitor or health tracker to view real-time data
                          </Typography>

                          {medicalInfo ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: (t) => alpha(t.palette.success.main, 0.08),
                                  border: (t) => `1px solid ${alpha(t.palette.success.main, 0.2)}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: (t) => alpha(t.palette.success.main, 0.12),
                                    borderColor: (t) => alpha(t.palette.success.main, 0.3)
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5
                                    }}
                                  >
                                    Glucose Level
                                  </Typography>
                                  <Chip label="Latest" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                                </Box>
                                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'success.dark' }}>
                                  {medicalInfo?.recent_lab_results?.fasting_glucose?.value != null
                                    ? `${medicalInfo.recent_lab_results.fasting_glucose.value} ${medicalInfo.recent_lab_results.fasting_glucose.unit || 'mg/dL'}`
                                    : 'No data'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  Fasting blood glucose
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: (t) => alpha(t.palette.info.main, 0.08),
                                  border: (t) => `1px solid ${alpha(t.palette.info.main, 0.2)}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: (t) => alpha(t.palette.info.main, 0.12),
                                    borderColor: (t) => alpha(t.palette.info.main, 0.3)
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    HbA1c Level
                                  </Typography>
                                  <Chip label="3 months" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                                </Box>
                                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'info.dark' }}>
                                  {medicalInfo?.recent_lab_results?.hba1c?.value != null
                                    ? `${medicalInfo.recent_lab_results.hba1c.value}${medicalInfo.recent_lab_results.hba1c.unit || '%'}`
                                    : 'No data'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  Average blood sugar indicator
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: (t) => alpha(t.palette.warning.main, 0.08),
                                  border: (t) => `1px solid ${alpha(t.palette.warning.main, 0.2)}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
                                    borderColor: (t) => alpha(t.palette.warning.main, 0.3)
                                  }
                                }}
                              >
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Blood Pressure
                                </Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'warning.dark' }}>
                                  {medicalInfo?.blood_pressure?.systolic && medicalInfo?.blood_pressure?.diastolic
                                    ? `${medicalInfo.blood_pressure.systolic}/${medicalInfo.blood_pressure.diastolic}`
                                    : 'No data'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  mmHg (Systolic/Diastolic)
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Box 
                              sx={{ 
                                mt: 2,
                                p: 3,
                                borderRadius: 2,
                                border: (t) => `2px dashed ${alpha(t.palette.divider, 0.3)}`,
                                textAlign: 'center',
                                bgcolor: (t) => alpha(t.palette.action.hover, 0.02)
                              }}
                            >
                              <Box sx={{ mb: 2 }}>
                                <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                              </Box>
                              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                Connect Health Device
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 300, mx: 'auto' }}>
                                Link your glucose monitor or health tracker to receive real-time health metrics
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 3,
                                  boxShadow: 1
                                }}
                              >
                                Connect Device
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      </Grid>

                      {/* Analytics: BMI & key metrics */}


                    </Grid>
                  </Box>
                ) : (
                  <Box>
                    {/* Stats Row - Matches width of 2-column grid below */}
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatWidget
                          title="Condition"
                          value={diseaseData?.disease || 'Not Set'}
                          caption={diseaseData?.lastUpdated ? `Updated ${new Date(diseaseData.lastUpdated).toLocaleDateString()}` : 'Start onboarding'}
                          color="primary"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatWidget
                          title="Questions"
                          value={`${diseaseData?.answeredQuestions ?? 0}/${diseaseData?.totalQuestions ?? 0}`}
                          caption="Answers saved"
                          color="info"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatWidget
                          title="Progress"
                          value={`${completionPct}%`}
                          caption={completionPct === 100 ? 'All done!' : 'Keep going'}
                          color="success"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          onClick={() => completionPct === 100 ? navigate('/assessment') : navigate('/onboarding')}
                          sx={{ 
                            height: '100%', 
                            cursor: 'pointer',
                            p: 2.5,
                            borderRadius: 3,
                            background: (t) => t.palette.background.paper,
                            border: (t) => `1px solid ${t.palette.divider}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.12)}`,
                            }
                          }}
                        >
                          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.7rem' }}>
                            Next Action
                          </Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ mt: 0.75 }}>
                            Assessment
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                            {completionPct === 100 ? 'Ready to assess' : 'Finish onboarding'}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Main Content: 2-column responsive grid - spacing matches stats row */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: { xs: 2, sm: 3, md: 4 },
                      alignItems: 'stretch'
                    }}>
                      {/* Onboarding Progress Card */}
                      <Box sx={{ minWidth: 0 }}>
                        <Paper
                          elevation={0}
                          sx={{ 
                            p: 4,
                            borderRadius: 3,
                            height: '100%',
                            background: (t) => t.palette.background.paper,
                            border: (t) => `1px solid ${t.palette.divider}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: 380,
                          }}
                        >
                          <Typography 
                            variant="overline" 
                            sx={{ 
                              color: 'text.secondary', 
                              fontWeight: 800, 
                              letterSpacing: 1.2,
                              fontSize: '0.75rem',
                              mb: 2,
                            }}
                          >
                            ONBOARDING PROGRESS
                          </Typography>
                          <Box sx={{ mb: 4 }}>
                            <ProgressDonut value={completionPct} label="Complete" size={120} />
                          </Box>
                          <Typography 
                            variant="h5" 
                            fontWeight={800}
                            sx={{ mb: 1 }}
                          >
                            {completionPct}% Complete
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            {diseaseData?.answeredQuestions || 0} of {diseaseData?.totalQuestions || 0} questions answered
                          </Typography>
                          {user?.last_assessment_at && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Latest risk insight: {((user.last_assessment_risk_level || 'low').charAt(0).toUpperCase() + (user.last_assessment_risk_level || 'low').slice(1))} risk
                              {user.last_assessment_probability != null &&
                                ` (${Math.round(Number(user.last_assessment_probability) * 100)}%)`}
                            </Typography>
                          )}
                          {completionPct < 100 ? (
                            <Button 
                              variant="contained" 
                              size="large"
                              onClick={() => navigate('/onboarding')}
                              sx={{ borderRadius: 2, fontWeight: 800, px: 4, py: 1.5, textTransform: 'none' }}
                            >
                              Continue Onboarding
                            </Button>
                          ) : (
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Onboarding Complete" 
                              color="success" 
                              sx={{ 
                                fontWeight: 800,
                                px: 2,
                                py: 2,
                                fontSize: '0.95rem',
                                '& .MuiChip-icon': { fontSize: '1.2rem' }
                              }} 
                            />
                          )}
                        </Paper>
                      </Box>

                      {/* Recent Activity */}
                      <Box sx={{ minWidth: 0 }}>
                        <Paper
                          elevation={0}
                          sx={{ 
                            p: 4,
                            borderRadius: 3,
                            height: '100%',
                            background: (t) => t.palette.background.paper,
                            border: (t) => `1px solid ${t.palette.divider}`,
                            minHeight: 360,
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={800}>
                              Recent Activity
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <ActivityTimeline items={activityItems} />
                        </Paper>
                      </Box>

                      {/* Risk Assessment CTA - Full Width (kept below as requested) */}
                      {/* Latest Assessment Summary */}
                      {assessmentSummary && (
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 1,
                              mb: 2,
                              p: 3,
                              borderRadius: 3,
                              background: (t) => t.palette.background.paper,
                              border: (t) => `1px solid ${t.palette.divider}`,
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                              <Box>
                                <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.2, color: 'text.secondary' }}>
                                  LATEST ASSESSMENT SNAPSHOT
                                </Typography>
                                <Typography variant="h6" fontWeight={900}>
                                  {assessmentSummary.risk_level} risk
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Estimated probability: {Math.round(assessmentSummary.probability * 100)}%
                                </Typography>
                              </Box>
                              <Box textAlign="right">
                                <Typography variant="body2" color="text.secondary">
                                  Symptoms present: {assessmentSummary.symptoms_present.length}
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                              <Typography variant="caption" color="text.secondary">
                                Based on your most recent symptom answers.
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => navigate('/assessment')}
                                sx={{ fontWeight: 700, textTransform: 'none' }}
                              >
                                View full report
                              </Button>
                            </Box>
                          </Paper>
                        </Box>
                      )}

                      {/* Risk Assessment CTA - Full Width (kept below as requested) */}
                      <Box sx={{ gridColumn: '1 / -1' }}>
                        <RiskCard 
                          onAssess={() => navigate('/assessment')} 
                          lastAssessedAt={user?.last_assessment_at || null} 
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {currentSection === 'My Account' && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  borderRadius: 3,
                  background: (t) => t.palette.background.paper,
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  mb: 5,
                  animation: 'slideIn 0.7s ease-out',
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateX(-20px)' },
                    to: { opacity: 1, transform: 'translateX(0)' }
                  }
                }}>
                  <Box display="flex" alignItems="center" gap={3} mb={2}>
                    <Avatar 
                      sx={{ 
                        width: 72, 
                        height: 72,
                        bgcolor: 'primary.main',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'primary.contrastText',
                      }}
                    >
                      {user?.fullName?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography 
                        variant="h5" 
                        fontWeight={800}
                        sx={{ mb: 0.5 }}
                      >
                        {user?.fullName || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {user?.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(user?.roles || []).map((r) => (
                          <Chip 
                            key={r} 
                            label={r} 
                            size="small" 
                            sx={{ 
                              fontWeight: 600,
                              background: (t) => alpha(t.palette.primary.main, 0.08),
                              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Profile Info Section */}
                <Box sx={{ 
                  mb: 5,
                  animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
                }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 3.5 }}>Personal Information</Typography>
                  
                  {profileError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        animation: 'shake 0.5s ease',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '25%': { transform: 'translateX(-8px)' },
                          '75%': { transform: 'translateX(8px)' }
                        }
                      }}
                    >
                      {profileError}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSaveProfile}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          }
                        }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                            Full Name
                          </Typography>
                          <TextField 
                            fullWidth 
                            name="fullName"
                            defaultValue={user?.fullName || ''}
                            onChange={(e) => {
                              setUser((u) => ({ ...u, fullName: e.target.value }));
                            }}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            🔒 Email Address
                          </Typography>
                          <Box sx={{ 
                            p: 1.8, 
                            borderRadius: 2.5,
                            bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                            border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                            filter: 'blur(0.4px)',
                            opacity: 0.65,
                            transition: 'all 0.3s ease',
                            fontSize: '1.05rem',
                            '&:hover': {
                              opacity: 0.8,
                              filter: 'blur(0.3px)',
                            }
                          }}>
                            <Typography variant="body1" fontWeight={500}>{user?.email}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            🔒 Gender
                          </Typography>
                          <Box sx={{ 
                            p: 1.8, 
                            borderRadius: 2.5,
                            bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                            border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                            filter: 'blur(0.4px)',
                            opacity: 0.65,
                            transition: 'all 0.3s ease',
                            fontSize: '1.05rem',
                            '&:hover': {
                              opacity: 0.8,
                              filter: 'blur(0.3px)',
                            }
                          }}>
                            <Typography variant="body1" fontWeight={500}>{user?.gender || 'Not set'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            🔒 Date of Birth
                          </Typography>
                          <Box sx={{ 
                            p: 1.8, 
                            borderRadius: 2.5,
                            bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                            border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                            filter: 'blur(0.4px)',
                            opacity: 0.65,
                            transition: 'all 0.3s ease',
                            fontSize: '1.05rem',
                            '&:hover': {
                              opacity: 0.8,
                              filter: 'blur(0.3px)',
                            }
                          }}>
                            <Typography variant="body1" fontWeight={500}>
                              {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={savingProfile}
                        size="large"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 4, py: 1.5 }}
                      >
                        {savingProfile ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} color="inherit" />
                            Saving...
                          </Box>
                        ) : 'Save Changes'}
                      </Button>
                    </Box>
                    <Box sx={{ 
                      mt: 2.5, 
                      p: 2, 
                      borderRadius: 2.5,
                      background: (t) => alpha(t.palette.info.main, 0.05),
                      border: (t) => `1px solid ${alpha(t.palette.info.main, 0.15)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: (t) => alpha(t.palette.info.main, 0.08),
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>ℹ️</Box>
                        Only your name can be updated. Other details are protected—contact support to request changes.
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Security & Preferences Section */}
                <Box sx={{
                  animation: 'fadeInUp 0.8s ease-out 0.4s backwards',
                }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={900} 
                    sx={{ 
                      mb: 3.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover .accent-bar': {
                        width: '6px',
                        background: (t) => `linear-gradient(180deg, ${t.palette.secondary.main}, ${t.palette.info.main})`,
                      }
                    }}
                  >
                    <Box 
                      className="accent-bar"
                      sx={{ 
                        width: 4, 
                        height: 28, 
                        borderRadius: 2,
                        background: (t) => `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.info.main})`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} 
                    />
                    Security & Preferences
                  </Typography>
                  
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                  }}>
                    {/* Password */}
                    <Box sx={{ 
                      p: 3.5, 
                      borderRadius: 3,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      background: (t) => t.palette.background.paper,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box sx={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: '50%', 
                          bgcolor: (t) => alpha(t.palette.warning.main, 0.12), 
                          display:'flex', 
                          alignItems:'center', 
                          justifyContent:'center',
                        }}>
                          <LockIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Password</Typography>
                          <Typography variant="caption" color="text.secondary">Secure your account</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                          Keep your account secure by updating your password regularly.
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        color="warning"
                        onClick={() => window.dispatchEvent(new Event('openChangePassword'))}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, py: 1.2 }}
                      >
                        Change Password
                      </Button>
                    </Box>

                    {/* Preferences */}
                    <Box sx={{ 
                      p: 3.5, 
                      borderRadius: 3,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      background: (t) => t.palette.background.paper,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box sx={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: '50%', 
                          bgcolor: (t) => alpha(t.palette.info.main, 0.12), 
                          display:'flex', 
                          alignItems:'center', 
                          justifyContent:'center',
                        }}>
                          <Box component="span" sx={{ fontSize: 22 }}>🎨</Box>
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Preferences</Typography>
                          <Typography variant="caption" color="text.secondary">Customize your experience</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                          Personalize your dashboard with your preferred display theme.
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        p: 2,
                        borderRadius: 2.5,
                        background: (t) => alpha(t.palette.background.paper, 0.4),
                        border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
                        '&:hover': {
                          background: (t) => alpha(t.palette.background.paper, 0.6),
                          borderColor: (t) => alpha(t.palette.info.main, 0.3),
                        }
                      }}>
                        <Box>
                          <Typography variant="body1" fontWeight={700}>Theme</Typography>
                          <Typography variant="caption" color="text.secondary">Choose your display mode</Typography>
                        </Box>
                        <Box sx={{ 
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}>
                          <ThemeToggle size="medium" />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}

            {currentSection === 'My Disease Data' && (
              <Box>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress size={48} />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ borderRadius: 4 }}>{error}</Alert>
                ) : (!diseaseData || !diseaseData.disease) ? (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 5, 
                      borderRadius: 3,
                      textAlign: 'center',
                      background: (t) => t.palette.background.paper,
                      border: (t) => `1px dashed ${t.palette.divider}`,
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Box 
                        sx={{ 
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: (t) => alpha(t.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          fontSize: '4rem',
                        }}
                      >
                        📋
                      </Box>
                      <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
                        No Disease Data Yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                        You haven't filled your health details yet. Start your onboarding journey to get personalized insights and track your health.
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => navigate('/onboarding')} 
                        sx={{ 
                          borderRadius: 2, 
                          fontWeight: 800,
                          px: 4,
                          py: 1.4,
                        }}
                      >
                        Start Onboarding
                      </Button>
                    </Box>
                  </Paper>
                ) : (
                  <Box>
                    {/* Main Content */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        borderRadius: 3,
                        background: (t) => t.palette.background.paper,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        mb: 3,
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Typography variant="h6" fontWeight={800}>
                          Health Profile
                        </Typography>
                        {diseaseData?.disease && (
                          <Button 
                            variant="contained" 
                            startIcon={<EditIcon />} 
                            onClick={handleEditDiseaseData} 
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 800,
                            }}
                          >
                            Edit Data
                          </Button>
                        )}
                      </Box>
                      
                      {/* Progress Bar */}
                      {typeof diseaseData.totalQuestions === 'number' && diseaseData.totalQuestions > 0 && (
                        <Box 
                          sx={{ 
                            mb: 4, 
                            p: 3, 
                            borderRadius: 3,
                            background: (t) => alpha(t.palette.primary.main, 0.04),
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              Onboarding Progress
                            </Typography>
                            <Chip 
                              label={completionPct === 100 ? 'Complete' : 'In Progress'} 
                              color={completionPct === 100 ? 'success' : 'primary'}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={completionPct}
                                sx={{ 
                                  height: 12, 
                                  borderRadius: 6,
                                  background: (t) => alpha(t.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 6,
                                    background: (t) => t.palette.primary.main,
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="h6" fontWeight={900} color="primary.main">
                              {completionPct}%
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Divider sx={{ mb: 3 }} />

                      {/* Symptoms Section - Clean List Layout */}
                      {diseaseData.symptoms?.length ? (
                        <Box>
                          <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>
                            Symptom Details
                          </Typography>
                          {diseaseData.symptoms.map((symptom, idx) => (
                            <Box 
                              key={symptom.name || idx}
                              sx={{ 
                                mb: 3,
                                p: 3,
                                borderRadius: 3,
                                background: (t) => t.palette.background.paper,
                                border: (t) => `1px solid ${t.palette.divider}`,
                              }}
                            >
                              {/* Symptom Header */}
                              <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                                <Box 
                                  sx={{ 
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: (t) => alpha(t.palette.text.primary, 0.08),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.primary',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {idx + 1}
                                </Box>
                                <Typography variant="subtitle1" fontWeight={800}>
                                  {symptom.name}
                                </Typography>
                                <Chip 
                                  label={`${symptom.questions?.length || 0} Questions`}
                                  size="small"
                                  sx={{ 
                                    ml: 'auto',
                                    fontWeight: 600,
                                    background: (t) => alpha(t.palette.text.primary, 0.06),
                                  }}
                                />
                              </Box>
                              
                              {/* Questions List */}
                              {symptom.questions?.length ? (
                                <Box sx={{ 
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.5,
                                }}>
                                  {symptom.questions.map((q, qIdx) => (
                                    <Box 
                                      key={q.question + qIdx}
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: (t) => t.palette.background.paper,
                                        border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
                                      }}
                                    >
                                      <Box 
                                        sx={{ 
                                          minWidth: 28,
                                          height: 28,
                                          borderRadius: '50%',
                                          background: (t) => alpha(t.palette.text.primary, 0.06),
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          color: 'text.secondary',
                                        }}
                                      >
                                        Q{qIdx + 1}
                                      </Box>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          flex: 1,
                                          fontWeight: 500,
                                        }}
                                      >
                                        {q.question}
                                      </Typography>
                                      <Chip label={q.answer} variant="outlined" size="small" sx={{ fontWeight: 600, minWidth: 80 }} />
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ minWidth: 90, textAlign: 'right' }}
                                      >
                                        {q.date ? new Date(q.date).toLocaleDateString() : ''}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 2 }}>
                                  No questions answered for this symptom.
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                          No symptoms or answers found for this disease.
                        </Alert>
                      )}
                    </Paper>

                    {/* Assessment CTA */}
                    <RiskCard onAssess={() => navigate('/assessment')} lastAssessedAt={null} />
                  </Box>
                )}
              </Box>
            )}

            {currentSection === 'Check My Risk' && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  background: (t) => t.palette.background.paper,
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 48,
                      height: 48,
                      borderRadius: '16px',
                      background: (t) => alpha(t.palette.primary.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                    }}
                  >
                    ✅
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>View Assessment / Check My Risk</Typography>
                    <Typography variant="body1" color="text.secondary">
                      Run the guided assessment to understand your diabetes risk and track past assessments.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/assessment')}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      flex: 1,
                    }}
                  >
                    Check my risk now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/onboarding')}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      flex: 1,
                    }}
                  >
                    Update my info first
                  </Button>
                </Box>
              </Paper>
            )}

            {currentSection === 'Personalized Suggestions' && (
              <Box>
                {/* Title and Description */}
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ✨ Personalized Wellness Hub
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                    Your complete health companion with AI-powered recommendations across diet, exercise, and lifestyle management
                  </Typography>
                </Box>

                {/* Six Cards Grid */}
                <Box 
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 4,
                    mb: 5,
                  }}
                >
                  {/* Personal & Medical Information Card */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '24px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '2px solid transparent',
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
                      '&:hover': { 
                        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.35)',
                        transform: 'translateY(-8px) scale(1.02)',
                        border: '2px solid transparent',
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    onClick={() => navigate('/personalized-suggestions/personal-medical')}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '180px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                        }
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 70, color: '#fff', zIndex: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
                      {user?.full_name && (
                        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '0.95rem', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                          {user.full_name}
                        </Typography>
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3.5, pb: 2, px: 3 }}>
                      <Typography variant="h6" fontWeight={900} gutterBottom sx={{ fontSize: '1.2rem', color: '#1f2937', mb: 1.5 }}>
                        Personal & Medical Information
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Your health profile and medical history
                      </Typography>
                      {personalInfoCompletion > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completion</Typography>
                            <Typography variant="caption" fontWeight={900} sx={{ color: '#667eea', fontSize: '1rem' }}>{personalInfoCompletion}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={personalInfoCompletion} 
                            sx={{ 
                              height: 10, 
                              borderRadius: '12px', 
                              bgcolor: '#f3f4f6', 
                              '& .MuiLinearProgress-bar': { 
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', 
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                              } 
                            }} 
                          />
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 3.5, px: 3, width: '100%' }}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                          color: '#fff', 
                          textTransform: 'none', 
                          fontWeight: 900, 
                          py: 1.8, 
                          borderRadius: '14px', 
                          fontSize: '1rem',
                          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3e8f 100%)',
                            boxShadow: '0 6px 24px rgba(102, 126, 234, 0.5)',
                          }
                        }}
                      >
                        Continue
                      </Button>
                    </CardActions>
                  </Card>

                  {/* Diet Plan Card */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '24px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: personalInfoCompletion >= 100 ? '2px solid transparent' : '2px solid #e5e7eb',
                      background: personalInfoCompletion >= 100 ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #10b981, #059669) border-box' : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      cursor: personalInfoCompletion >= 100 ? 'pointer' : 'not-allowed',
                      overflow: 'hidden',
                      boxShadow: personalInfoCompletion >= 100 ? '0 10px 40px rgba(16, 185, 129, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                      '&:hover': personalInfoCompletion >= 100 ? { 
                        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.35)',
                        transform: 'translateY(-8px) scale(1.02)',
                      } : {},
                      opacity: personalInfoCompletion >= 100 ? 1 : 0.7,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (personalInfoCompletion < 100) {
                        toast.info('Complete your Personal & Medical Information to unlock this section.');
                        return;
                      }
                      navigate('/personalized-suggestions/diet-plan');
                    }}
                  >
                    {personalInfoCompletion < 100 && (
                      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                        <Chip 
                          label="🔒 Locked" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)', 
                            color: '#fff', 
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                          }} 
                        />
                      </Box>
                    )}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '180px', 
                        background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': personalInfoCompletion >= 100 ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                        } : {},
                      }}
                    >
                      <RestaurantIcon sx={{ fontSize: 70, color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af', filter: personalInfoCompletion >= 100 ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3.5, pb: 2, px: 3 }}>
                      <Typography variant="h6" fontWeight={900} gutterBottom sx={{ fontSize: '1.2rem', color: '#1f2937', mb: 1.5 }}>
                        Diet Plan
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        AI-powered meal plans based on regional guidelines
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 3.5, px: 3, width: '100%' }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        disabled={personalInfoCompletion < 100}
                        sx={{
                          background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e5e7eb',
                          color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                          textTransform: 'none',
                          fontWeight: 900,
                          py: 1.8,
                          borderRadius: '14px',
                          fontSize: '1rem',
                          boxShadow: personalInfoCompletion >= 100 ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none',
                          '&:hover': personalInfoCompletion >= 100 ? {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            boxShadow: '0 6px 24px rgba(16, 185, 129, 0.5)',
                          } : {},
                        }}
                      >
                        Continue
                      </Button>
                    </CardActions>
                  </Card>

                  {/* Exercise Plan Card */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '24px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: personalInfoCompletion >= 100 ? '2px solid transparent' : '2px solid #e5e7eb',
                      background: personalInfoCompletion >= 100 ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #f59e0b, #d97706) border-box' : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      cursor: personalInfoCompletion >= 100 ? 'pointer' : 'not-allowed',
                      overflow: 'hidden',
                      boxShadow: personalInfoCompletion >= 100 ? '0 10px 40px rgba(245, 158, 11, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                      '&:hover': personalInfoCompletion >= 100 ? { 
                        boxShadow: '0 20px 60px rgba(245, 158, 11, 0.35)',
                        transform: 'translateY(-8px) scale(1.02)',
                      } : {},
                      opacity: personalInfoCompletion >= 100 ? 1 : 0.7,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (personalInfoCompletion < 100) {
                        toast.info('Complete your Personal & Medical Information to unlock this section.');
                        return;
                      }
                      navigate('/personalized-suggestions/exercise-plan');
                    }}
                  >
                    {personalInfoCompletion < 100 && (
                      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                        <Chip 
                          label="🔒 Locked" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)', 
                            color: '#fff', 
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                          }} 
                        />
                      </Box>
                    )}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '180px', 
                        background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': personalInfoCompletion >= 100 ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                        } : {},
                      }}
                    >
                      <FitnessCenterIcon sx={{ fontSize: 70, color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af', filter: personalInfoCompletion >= 100 ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3.5, pb: 2, px: 3 }}>
                      <Typography variant="h6" fontWeight={900} gutterBottom sx={{ fontSize: '1.2rem', color: '#1f2937', mb: 1.5 }}>
                        Exercise Plan
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Customized fitness routines and workouts
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 3.5, px: 3, width: '100%' }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        disabled={personalInfoCompletion < 100}
                        sx={{
                          background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#e5e7eb',
                          color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                          textTransform: 'none',
                          fontWeight: 900,
                          py: 1.8,
                          borderRadius: '14px',
                          fontSize: '1rem',
                          boxShadow: personalInfoCompletion >= 100 ? '0 4px 16px rgba(245, 158, 11, 0.4)' : 'none',
                          '&:hover': personalInfoCompletion >= 100 ? {
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            boxShadow: '0 6px 24px rgba(245, 158, 11, 0.5)',
                          } : {},
                        }}
                      >
                        Continue
                      </Button>
                    </CardActions>
                  </Card>

                  {/* Lifestyle Tips Card */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '24px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: personalInfoCompletion >= 100 ? '2px solid transparent' : '2px solid #e5e7eb',
                      background: personalInfoCompletion >= 100 ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #8b5cf6, #7c3aed) border-box' : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      cursor: personalInfoCompletion >= 100 ? 'pointer' : 'not-allowed',
                      overflow: 'hidden',
                      boxShadow: personalInfoCompletion >= 100 ? '0 10px 40px rgba(139, 92, 246, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                      '&:hover': personalInfoCompletion >= 100 ? { 
                        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.35)',
                        transform: 'translateY(-8px) scale(1.02)',
                      } : {},
                      opacity: personalInfoCompletion >= 100 ? 1 : 0.7,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (personalInfoCompletion < 100) {
                        toast.info('Complete your Personal & Medical Information to unlock this section.');
                        return;
                      }
                      navigate('/personalized-suggestions/lifestyle-tips');
                    }}
                  >
                    {personalInfoCompletion < 100 && (
                      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                        <Chip 
                          label="🔒 Locked" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)', 
                            color: '#fff', 
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                          }} 
                        />
                      </Box>
                    )}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '180px', 
                        background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': personalInfoCompletion >= 100 ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                        } : {},
                      }}
                    >
                      <LightbulbIcon sx={{ fontSize: 70, color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af', filter: personalInfoCompletion >= 100 ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3.5, pb: 2, px: 3 }}>
                      <Typography variant="h6" fontWeight={900} gutterBottom sx={{ fontSize: '1.2rem', color: '#1f2937', mb: 1.5 }}>
                        Lifestyle Tips
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Daily habits and wellness recommendations
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 3.5, px: 3, width: '100%' }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        disabled={personalInfoCompletion < 100}
                        sx={{
                          background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#e5e7eb',
                          color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                          textTransform: 'none',
                          fontWeight: 900,
                          py: 1.8,
                          borderRadius: '14px',
                          fontSize: '1rem',
                          boxShadow: personalInfoCompletion >= 100 ? '0 4px 16px rgba(139, 92, 246, 0.4)' : 'none',
                          '&:hover': personalInfoCompletion >= 100 ? {
                            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                            boxShadow: '0 6px 24px rgba(139, 92, 246, 0.5)',
                          } : {},
                        }}
                      >
                        Continue
                      </Button>
                    </CardActions>
                  </Card>

                  {/* Pro Tips Card (Coming Soon) */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '24px',
                      border: '2px solid #e5e7eb',
                      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      cursor: 'default',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      opacity: 0.7,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                      <Chip 
                        label="⏳ Coming Soon" 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
                          color: '#fff', 
                          fontWeight: 900,
                          fontSize: '0.85rem',
                          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                        }} 
                      />
                    </Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '180px', 
                        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        color: '#9ca3af',
                        position: 'relative',
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 70, color: '#9ca3af' }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3.5, pb: 2, px: 3 }}>
                      <Typography variant="h6" fontWeight={900} gutterBottom sx={{ fontSize: '1.2rem', color: '#1f2937', mb: 1.5 }}>
                        Pro Tips
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Expert advice and best practices
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 3.5, px: 3, width: '100%' }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        disabled
                        sx={{
                          background: '#e5e7eb',
                          color: '#9ca3af',
                          textTransform: 'none',
                          fontWeight: 900,
                          py: 1.8,
                          borderRadius: '14px',
                          fontSize: '1rem',
                        }}
                      >
                        Coming Soon
                      </Button>
                    </CardActions>
                  </Card>

                  {/* Chat Assistant Card */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '24px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: personalInfoCompletion >= 100 ? '2px solid transparent' : '2px solid #e5e7eb',
                      background: personalInfoCompletion >= 100 ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #06b6d4, #0891b2) border-box' : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      cursor: personalInfoCompletion >= 100 ? 'pointer' : 'not-allowed',
                      overflow: 'hidden',
                      boxShadow: personalInfoCompletion >= 100 ? '0 10px 40px rgba(6, 182, 212, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                      '&:hover': personalInfoCompletion >= 100 ? { 
                        boxShadow: '0 20px 60px rgba(6, 182, 212, 0.35)',
                        transform: 'translateY(-8px) scale(1.02)',
                      } : {},
                      opacity: personalInfoCompletion >= 100 ? 1 : 0.7,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (personalInfoCompletion < 100) {
                        toast.info('Complete your Personal & Medical Information to unlock this section.');
                        return;
                      }
                      navigate('/personalized-suggestions/chat-assistant');
                    }}
                  >
                    {personalInfoCompletion < 100 && (
                      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                        <Chip 
                          label="🔒 Locked" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)', 
                            color: '#fff', 
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                          }} 
                        />
                      </Box>
                    )}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '180px', 
                        background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': personalInfoCompletion >= 100 ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                        } : {},
                      }}
                    >
                      <ChatIcon sx={{ fontSize: 70, color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af', filter: personalInfoCompletion >= 100 ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3.5, pb: 2, px: 3 }}>
                      <Typography variant="h6" fontWeight={900} gutterBottom sx={{ fontSize: '1.2rem', color: '#1f2937', mb: 1.5 }}>
                        Chat Assistant
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Get instant answers from AI assistant
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 3.5, px: 3, width: '100%' }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        disabled={personalInfoCompletion < 100}
                        sx={{
                          background: personalInfoCompletion >= 100 ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : '#e5e7eb',
                          color: personalInfoCompletion >= 100 ? '#fff' : '#9ca3af',
                          textTransform: 'none',
                          fontWeight: 900,
                          py: 1.8,
                          borderRadius: '14px',
                          fontSize: '1rem',
                          boxShadow: personalInfoCompletion >= 100 ? '0 4px 16px rgba(6, 182, 212, 0.4)' : 'none',
                          '&:hover': personalInfoCompletion >= 100 ? {
                            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                            boxShadow: '0 6px 24px rgba(6, 182, 212, 0.5)',
                          } : {},
                        }}
                      >
                        Continue
                      </Button>
                    </CardActions>
                  </Card>
                </Box>

                {/* Info Completion Banner */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    bgcolor: '#f0f9ff',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '2px solid #bfdbfe',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 700, fontSize: '1rem' }}>
                    💡 Complete your Personal & Medical Information to unlock diet, exercise, lifestyle tips, and chat.
                  </Typography>
                </Paper>
              </Box>
            )}

            {currentSection === 'Chat Assistant' && (
              <Box>
                {personalInfoCompletion >= 100 ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      minHeight: '60vh',
                      textAlign: 'center',
                      p: 4
                    }}
                  >
                    <ChatIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                      AI Chat Assistant
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                      Get instant answers to your health questions, diet advice, and personalized recommendations through our intelligent chat assistant.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ChatIcon />}
                      onClick={() => navigate('/personalized-suggestions/chat-assistant')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        boxShadow: 2
                      }}
                    >
                      Open Chat Assistant
                    </Button>
                  </Box>
                ) : (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4, 
                      borderRadius: 3,
                      background: (t) => t.palette.background.paper,
                      border: (t) => `2px dashed ${alpha(t.palette.divider, 0.3)}`,
                      textAlign: 'center'
                    }}
                  >
                    <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                      Chat Assistant Locked
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Complete your Personal & Medical Information to unlock the AI Chat Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Profile Completion: {personalInfoCompletion}%
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => {
                        const idx = diagnosedSections.findIndex((s) => s.label === 'Personalized Suggestions');
                        setSelectedIndex(idx >= 0 ? idx : 0);
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Complete Your Profile
                    </Button>
                  </Paper>
                )}
              </Box>
            )}

            {currentSection === 'My Feedback' && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  borderRadius: 3,
                  background: (t) => t.palette.background.paper,
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <UserFeedbackHistory showFormOnMount={showFeedbackForm} />
              </Paper>
            )}
          </Box>
        </Box>
      </Box>

      {/* Assessment insight popup for high-risk users */}
      <AssessmentInsightPopup
        open={showAssessmentPopup}
        riskLevel={user?.last_assessment_risk_level}
        probability={user?.last_assessment_probability}
        assessedAt={user?.last_assessment_at}
        onSelectAnswer={handleAssessmentPopupAnswer}
      />

      {/* Diabetes Diagnosis Popup */}
      <DiabetesDiagnosisPopup
        open={showDiagnosisPopup}
        onAnswer={handleDiagnosisAnswer}
      />

      {/* Edit Disease Data Modal */}
      <Modal
        open={showEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-disease-data-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            maxHeight: '90vh',
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 24,
            overflow: 'auto',
            p: 3,
            position: 'relative',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography id="edit-disease-data-modal" variant="h6" fontWeight={700} color="#23272f">
              Edit Disease Data
            </Typography>
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <EditDiseaseData
            onClose={handleCloseEditModal}
            onDataUpdated={handleDataUpdated}
          />
        </Box>
      </Modal>

      {/* Dynamic Insights Components */}
      {currentSection === 'Insights' && user?.diabetes_diagnosed === 'yes' && (
        <>
          {/* Add Goal Dialog */}
          <DynamicInsights.AddGoalDialog 
            showGoalDialog={showAddGoalDialog}
            setShowGoalDialog={setShowAddGoalDialog}
            newGoal={newGoal}
            setNewGoal={setNewGoal}
            handleAddGoal={handleAddGoal}
          />

          {/* Day Details Modal */}
          <DynamicInsights.DayDetailsModal 
            showDayDetailsModal={showDayDetailsModal}
            setShowDayDetailsModal={setShowDayDetailsModal}
            selectedDayData={selectedDayData}
          />

          {/* Keyboard Shortcuts Dialog */}
          <DynamicInsights.KeyboardShortcutsDialog 
            showKeyboardShortcuts={showShortcutsDialog}
            setShowKeyboardShortcuts={setShowShortcutsDialog}
          />
        </>
      )}
    </Box>
  );
}



