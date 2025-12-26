import React, { useState } from 'react';
import { Stack, Typography, Box, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import SignUpForm from '../components/SignUp/SignUpForm';
import DiabetesImageSlider from '../components/Common/DiabetesImageSlider';
import AuthBackground from '../components/Common/AuthBackground';
import { useTheme } from '../contexts/useThemeContext';

export default function SignUpSide() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { isDarkMode, theme } = useTheme();

  return (
    <Stack
      direction="column"
      component="main"
      sx={{
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0b1220 0%, #1a1a2e 50%, #0a0a0a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      }}
    >
      <AuthBackground />
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 4, md: 8 },
            p: { xs: 2, sm: 4 },
            mx: 'auto',
            width: '100%',
            maxWidth: 1200,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SignUpForm setSuccess={setSuccess} setError={setError} />
          </motion.div>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' }
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <DiabetesImageSlider />
              </Box>
            </motion.div>
          </Box>
        </Stack>
      </Stack>
  );
}
