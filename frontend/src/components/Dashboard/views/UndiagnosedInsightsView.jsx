import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  alpha
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

// Import components
import StatWidget from '../../DashboardNew/StatWidget';
import ProgressDonut from '../../DashboardNew/ProgressDonut';
import ActivityTimeline from '../../DashboardNew/ActivityTimeline';
import RiskCard from '../../DashboardNew/RiskCard';

function UndiagnosedInsightsView({
  diseaseData,
  completionPct,
  activityItems,
  assessmentSummary,
  user
}) {
  const navigate = useNavigate();

  return (
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

        {/* Risk Assessment CTA - Full Width */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <RiskCard 
            onAssess={() => navigate('/assessment')} 
            lastAssessedAt={user?.last_assessment_at || null} 
          />
        </Box>
      </Box>
    </Box>
  );
}

export default UndiagnosedInsightsView;
