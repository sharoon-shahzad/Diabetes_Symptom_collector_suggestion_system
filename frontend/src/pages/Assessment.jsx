import React, { useEffect, useState, useMemo } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { assessDiabetesRisk } from '../utils/api';
import ReactApexChart from 'react-apexcharts';

export default function Assessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const result = data?.result || {};
  const features = data?.features || {};

  const gaugeSeries = useMemo(() => [Math.round((result.diabetes_probability || 0) * 100)], [result]);
  const gaugeOptions = useMemo(() => ({
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '65%' },
        track: { background: '#1f2833' },
        dataLabels: {
          name: { show: true, offsetY: 16, color: '#90caf9', fontSize: '12px', formatter: () => 'Risk' },
          value: { formatter: (val) => `${Math.round(val)}%`, color: '#e3f2fd', fontSize: '24px', offsetY: -10 }
        }
      }
    },
    colors: ['#42a5f5'],
    labels: ['Risk']
  }), []);

  const importanceData = useMemo(() => {
    const fi = result.feature_importance || {};
    const list = Object.entries(fi)
      .filter(([, v]) => v && typeof v === 'object' && typeof v.importance === 'number')
      .map(([k, v]) => ({ name: k, value: v.importance }));
    return list.sort((a, b) => b.value - a.value).slice(0, 12);
  }, [result]);

  const importanceSeries = useMemo(() => [{ data: importanceData.map(d => Number(d.value.toFixed(3))).reverse() }], [importanceData]);
  const importanceOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%' } },
    dataLabels: { enabled: true, formatter: (v) => v.toFixed(2), style: { colors: ['#263238'] } },
    xaxis: { categories: importanceData.map(d => d.name).reverse(), labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#cfd8dc' } } },
    grid: { strokeDashArray: 4 },
    colors: ['#ef5350']
  }), [importanceData]);

  const presenceData = useMemo(() => {
    const entries = Object.entries(features || {}).filter(([k]) => !['Age', 'Gender', 'Obesity'].includes(k));
    let present = 0; let absent = 0; entries.forEach(([, v]) => (Number(v) === 1 ? present++ : absent++));
    return [{ name: 'Present', value: present }, { name: 'Absent', value: absent }];
  }, [features]);

  const donutSeries = useMemo(() => presenceData.map(d => d.value), [presenceData]);
  const donutOptions = useMemo(() => ({
    chart: { type: 'donut' },
    labels: presenceData.map(d => d.name),
    dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%` },
    legend: { position: 'bottom', labels: { colors: '#cfd8dc' } },
    colors: ['#42a5f5', '#90caf9'],
    stroke: { width: 0 },
    plotOptions: { pie: { donut: { size: '70%' } } }
  }), [presenceData]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError('');
      const d = await assessDiabetesRisk();
      setData(d);
    } catch (e) {
      setError('Failed to load assessment. Complete onboarding and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: { xs: 3, md: 4 }, background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 40%, #42a5f5 100%)', color: '#fff' }}>
              <Typography variant="h4" fontWeight={900}>Diabetes Risk Assessment Report</Typography>
              <Typography sx={{ opacity: 0.9 }}>Professional, transparent, and trustworthy insights</Typography>
            </Box>
          </Paper>
        </motion.div>

        {error && (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Typography color="error.main">{error}</Typography>
            <Button onClick={fetchAssessment} variant="outlined" sx={{ mt: 1 }}>Retry</Button>
          </Paper>
        )}

        {data && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Risk Gauge</Typography>
                  <Box sx={{ px: 1 }}>
                    <ReactApexChart options={gaugeOptions} series={gaugeSeries} type="radialBar" height={320} />
                  </Box>
                  <Box textAlign="center">
                    <Chip label={`Risk: ${(result.diabetes_probability * 100).toFixed(1)}%`} color="primary" variant="outlined" />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Symptom Presence</Typography>
                  <Box sx={{ px: 1 }}>
                    <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={320} />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Symptom Importance</Typography>
                  <Box sx={{ px: 1 }}>
                    <ReactApexChart options={importanceOptions} series={importanceSeries} type="bar" height={Math.max(320, importanceData.length * 20)} />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Recommendations</Typography>
                  <Divider sx={{ mb: 1 }} />
                  {(result?.recommendations?.general_recommendations || []).map((rec, i) => (
                    <Typography key={i} sx={{ mb: 0.5 }}>• {rec}</Typography>
                  ))}
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Next Steps</Typography>
                  <Divider sx={{ mb: 1 }} />
                  {(result?.recommendations?.next_steps || []).map((step, i) => (
                    <Typography key={i} sx={{ mb: 0.5 }}>• {step}</Typography>
                  ))}
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Assessment Summary</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{result.assessment_summary}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {!data && !loading && !error && (
          <Box textAlign="center" mt={6}>
            <Button onClick={fetchAssessment} variant="contained">Load Assessment</Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}


