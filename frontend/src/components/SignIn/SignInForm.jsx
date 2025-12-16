import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
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
} from '@mui/material';

export default function SignInForm({ setSuccess, setError, navigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email || !password) {
            setError('Email and password are required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setSuccess('');
        setError('');
        try {
                const res = await axiosInstance.post('/auth/login', {
                email,
                password,
            }, { withCredentials: true });

            console.log('Login response:', res.data);

            if (res.data.data && res.data.data.user && res.data.data.accessToken) {
                localStorage.setItem('accessToken', res.data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(res.data.data.user));
                const roles = res.data.data.user.roles || [];
                if (roles.includes('admin') || roles.includes('super_admin')) {
                    navigate('/admin-dashboard');
                } else {
                    // Regular users go to dashboard, popup will handle there
                    navigate('/dashboard');
                }
            } else {
                setError(res.data.message || 'Login failed.');
                setSuccess('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={4}
            sx={{
                p: 4,
                width: 360,
                backgroundColor: 'background.paper',
                borderRadius: 3,
                color: 'text.primary',
                border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
        >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Sign in
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    InputProps={{
                        sx: { borderRadius: 2 },
                    }}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    InputProps={{
                        sx: { borderRadius: 2 },
                    }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Remember me"
                    />
                    <Link
                        component={RouterLink}
                        to="/forgotpassword"
                        underline="hover"
                        sx={{
                            color: 'text.secondary',
                            textDecoration: 'none',
                            borderBottom: '1px solid transparent',
                            transition: 'border-bottom 0.3s ease',
                            '&:hover': {
                                borderBottom: '1px solid currentColor',
                            },
                        }}
                    >
                        Forgot password?
                    </Link>
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        mt: 2,
                        fontWeight: 'bold',
                        borderRadius: 2,
                    }}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
            <Typography textAlign="center" mt={2}>
                Don’t have an account?{' '}
                <Link
                    component={RouterLink}
                    to="/signup"
                    sx={{
                        color: 'text.secondary',
                        textDecoration: 'none',
                        borderBottom: '1px solid transparent',
                        transition: 'border-bottom 0.3s ease',
                        '&:hover': {
                            borderBottom: '1px solid currentColor',
                        },
                    }}
                >
                    Sign up
                </Link>
            </Typography>
        </Paper>
    );
}
