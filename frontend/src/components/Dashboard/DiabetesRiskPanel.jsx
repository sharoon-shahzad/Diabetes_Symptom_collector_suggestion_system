import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Divider, Grid, Chip, LinearProgress, Stack, Paper, Button } from '@mui/material';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const riskStyles = {
  low: { bg: '#d4edda', color: '#155724', bar: '#28a745', icon: '✅' },
  moderate: { bg: '#fff3cd', color: '#856404', bar: '#ffc107', icon: '⚠️' },
  high: { bg: '#f8d7da', color: '#721c24', bar: '#fd7e14', icon: '🚨' },
  critical: { bg: '#f5c6cb', color: '#721c24', bar: '#dc3545', icon: '🆘' },
};

function toPairs(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj);
}

export default function DiabetesRiskPanel({ data }) {
  const result = data?.result || {};
  const features = data?.features || {};
  const risk = result.risk_level || 'low';
  const probPct = Math.round((result.diabetes_probability || 0) * 1000) / 10;
  const confPct = Math.round((result.confidence || 0) * 1000) / 10;
  const style = riskStyles[risk] || riskStyles.low;

  const featureImportance = useMemo(() => {
    const list = [];
    const fi = result.feature_importance || {};
    for (const [name, val] of Object.entries(fi)) {
      if (val && typeof val === 'object' && typeof val.importance === 'number') {
        list.push({ name, importance: val.importance, value: val.value });
      }
    }
    return list.sort((a, b) => b.importance - a.importance).slice(0, 12);
  }, [result]);

  const symptomPresence = useMemo(() => {
    const entries = Object.entries(features || {});
    const symptomKeys = entries.filter(([k]) => !['Age', 'Gender', 'Obesity'].includes(k));
    let present = 0; let absent = 0;
    symptomKeys.forEach(([, v]) => { if (Number(v) === 1) present++; else absent++; });
    return [
      { name: 'Present', value: present, color: '#42a5f5' },
      { name: 'Absent', value: absent, color: '#90caf9' },
    ];
  }, [features]);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diabetes_assessment_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Risk Summary */}
      <Card elevation={6} sx={{ mb: 3, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
        <Box sx={{ bgcolor: style.bg, color: style.color, p: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            {style.icon} Risk Level: {String(risk).toUpperCase()}
          </Typography>
          <Typography variant="body1"><b>Diabetes Probability:</b> {probPct.toFixed(1)}%</Typography>
          <Typography variant="body1"><b>Confidence:</b> {confPct.toFixed(1)}%</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{result.prediction}</Typography>
        </Box>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Probability Gauge
              </Typography>
              <Box sx={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0} data={[{ name: 'Risk', value: probPct, fill: style.bar }]}> 
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Confidence
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress variant="determinate" value={confPct} sx={{ height: 12, borderRadius: 6, '& .MuiLinearProgress-bar': { backgroundColor: style.bar } }} />
                </Box>
                <Chip label={`${confPct.toFixed(1)}%`} color="primary" variant="outlined" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Summary & Timeline */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Quick Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Typography>Risk Level: <b>{String(risk).toUpperCase()}</b></Typography>
                <Typography>Probability: <b>{probPct.toFixed(1)}%</b></Typography>
                <Typography>Confidence: <b>{confPct.toFixed(1)}%</b></Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Recommended Timeline</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography color="info.main">{result?.recommendations?.timeline}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Symptom Presence Donut */}
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Symptom Presence</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={symptomPresence} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
                  {symptomPresence.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Personalized Recommendations</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>General:</Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {(result?.recommendations?.general_recommendations || []).map((rec, i) => (
              <Typography key={i}>• {rec}</Typography>
            ))}
          </Stack>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Next Steps:</Typography>
          <Stack spacing={1}>
            {(result?.recommendations?.next_steps || []).map((step, i) => (
              <Typography key={i}>• {step}</Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Symptom-Specific Guidance */}
      {(result?.recommendations?.symptom_specific || []).length > 0 && (
        <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Symptom-Specific Guidance</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {result.recommendations.symptom_specific.map((item, idx) => (
                <Paper key={idx} elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: '#e7f3ff' }}>
                  <Typography variant="subtitle1" fontWeight={700}>🔍 {item.symptom}</Typography>
                  <Typography><b>Recommendation:</b> {item.recommendation}</Typography>
                  <Typography color="text.secondary"><b>Explanation:</b> {item.explanation}</Typography>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Educational Content */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>About Diabetes</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography color="text.secondary">{result?.educational_content?.about_diabetes}</Typography>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>Prevention Tips</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {(result?.educational_content?.prevention_tips || []).map((tip, i) => (
                  <Typography key={i}>• {tip}</Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>When to Seek Help</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography color="warning.main">{result?.educational_content?.when_to_seek_help}</Typography>
              {toPairs(result?.educational_content?.symptom_explanations).length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>Your Symptoms Explained</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {toPairs(result.educational_content.symptom_explanations).map(([symptom, text]) => (
                      features[symptom] === 1 ? (
                        <Typography key={symptom}><b>{symptom}:</b> {text}</Typography>
                      ) : null
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Feature Importance */}
      {featureImportance.length > 0 && (
        <Card elevation={4} sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Symptom Analysis</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ width: '100%', height: Math.max(260, featureImportance.length * 28) }}>
              <ResponsiveContainer>
                <BarChart data={featureImportance.slice().reverse()} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} />
                  <ReTooltip formatter={(v) => Number(v).toFixed(2)} />
                  <Bar dataKey="importance" fill="#ef5350" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Assessment Summary & Download */}
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Assessment Summary</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{result.assessment_summary}</Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleDownload} sx={{ borderRadius: 2, fontWeight: 700 }}>
              Download Assessment JSON
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}


