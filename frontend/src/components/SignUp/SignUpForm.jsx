import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    IconButton,
    InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function SignUpForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        if (!fullName || !email || !password) {
            setError('All fields are required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format.');
            return false;
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters and include at least 1 letter, 1 number, and 1 symbol.');
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
            const res = await axios.post('/api/v1/auth/register', {
                fullName,
                email,
                password,
            });
            setSuccess(res.data.message || 'Check your email to activate your account.');
            setFullName('');
            setEmail('');
            setPassword('');
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/signin'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
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
                Sign up
            </Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Full Name"
                    fullWidth
                    margin="normal"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((show) => !show)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
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
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </form>
            <Typography textAlign="center" mt={2}>
                Already have an account?{' '}
                <Link
                    component={RouterLink}
                    to="/signin"
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
                    Sign in
                </Link>
            </Typography>
        </Paper>
    );
}
