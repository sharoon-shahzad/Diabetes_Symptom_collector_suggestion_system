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
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            }, { withCredentials: true });
            setSuccess(res.data.message || 'Login successful.');
            localStorage.setItem('accessToken', res.data.accessToken);
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
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
                backgroundColor: '#060c1a',
                borderRadius: 3,
                color: 'white',
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
                        style: { color: '#fff' },
                        sx: { borderRadius: 2 },
                    }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    InputProps={{
                        style: { color: '#fff' },
                        sx: { borderRadius: 2 },
                    }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                        control={<Checkbox sx={{ color: '#fff' }} />}
                        label="Remember me"
                    />
                    <Link
                        component={RouterLink}
                        to="/forgotpassword"
                        underline="hover"
                        sx={{
                            color: '#f2f3f5',
                            textDecoration: 'none',
                            borderBottom: '1px solid transparent',
                            transition: 'border-bottom 0.3s ease',
                            '&:hover': {
                                borderBottom: '1px solid transparent',
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
                        backgroundColor: '#ffffff',
                        color: '#1e2a3a',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        },
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
                        color: '#f2f3f5',
                        textDecoration: 'none',
                        borderBottom: '1px solid transparent',
                        transition: 'border-bottom 0.3s ease',
                        '&:hover': {
                            borderBottom: '1px solid transparent',
                        },
                    }}
                >
                    Sign up
                </Link>
            </Typography>
        </Paper>
    );
}
