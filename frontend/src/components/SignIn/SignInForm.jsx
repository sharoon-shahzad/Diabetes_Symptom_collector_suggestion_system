import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Link,
    Alert,
    IconButton,
    InputAdornment,
    alpha,
    Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';

export default function SignInForm({ setSuccess, setError, navigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const theme = useTheme();

    const validate = () => {
        if (!email || !password) {
            setErrorMessage('Email and password are required.');
            setError('Email and password are required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('Invalid email format.');
            setError('Invalid email format.');
            return false;
        }
        setErrorMessage('');
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setSuccess('');
        setError('');
        setErrorMessage('');
        try {
            const res = await axios.post('https://zeeshanasghar02-diavise-backend.hf.space/api/v1/auth/login', {
                email,
                password,
            }, { withCredentials: true });

            if (res.data.data && res.data.data.user && res.data.data.accessToken) {
                localStorage.setItem('accessToken', res.data.data.accessToken);
                const roles = res.data.data.user.roles || [];
                localStorage.setItem('roles', JSON.stringify(roles));
                if (roles.includes('admin') || roles.includes('super_admin')) {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                const errorMsg = res.data.message || 'Login failed.';
                setErrorMessage(errorMsg);
                setError(errorMsg);
                setSuccess('');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed.';
            setErrorMessage(errorMsg);
            setError(errorMsg);
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 4 },
                    width: { xs: '100%', sm: 420 },
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography 
                            variant="h4" 
                            fontWeight={700}
                            sx={{ 
                                mb: 1,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to manage your diabetes health journey
                        </Typography>
                    </Box>
                </motion.div>


                {/* Error Alert */}
                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <motion.div variants={itemVariants}>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon 
                                                sx={{ 
                                                    color: focusedField === 'email' 
                                                        ? theme.palette.primary.main 
                                                        : 'text.secondary',
                                                    transition: 'color 0.3s'
                                                }} 
                                            />
                                        </InputAdornment>
                                    ),
                                    sx: { 
                                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.8),
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                                        }
                                    }
                                }}
                                InputLabelProps={{
                                    sx: { 
                                        fontWeight: 500,
                                    }
                                }}
                            />
                        </Box>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div variants={itemVariants}>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon 
                                                sx={{ 
                                                    color: focusedField === 'password' 
                                                        ? theme.palette.primary.main 
                                                        : 'text.secondary',
                                                    transition: 'color 0.3s'
                                                }} 
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { 
                                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.8),
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                                        }
                                    }
                                }}
                                InputLabelProps={{
                                    sx: { fontWeight: 500 }
                                }}
                            />
                        </Box>
                    </motion.div>

                    {/* Remember Me & Forgot Password */}
                    <motion.div variants={itemVariants}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        sx={{ 
                                            '&.Mui-checked': {
                                                color: theme.palette.primary.main
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={500}>
                                        Remember me
                                    </Typography>
                                }
                            />
                            <Link
                                component={RouterLink}
                                to="/forgotpassword"
                                sx={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                        <Button
                            variant="contained"
                            fullWidth
                            type="submit"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s',
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </motion.div>
                </form>

                {/* Sign Up Link */}
                <motion.div variants={itemVariants}>
                    <Typography textAlign="center" variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
                        Don't have an account?{' '}
                        <Link
                            component={RouterLink}
                            to="/signup"
                            sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Sign up
                        </Link>
                    </Typography>
                </motion.div>
            </Paper>
        </motion.div>
    );
}
