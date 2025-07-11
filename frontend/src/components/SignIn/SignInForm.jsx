import React, { useState } from 'react';
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
} from '@mui/material';
// import axios from 'axios'; // Uncomment when integrating API

export default function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async () => {
        const formErrors = {};
        if (!email.trim()) formErrors.email = 'Email is required';
        if (!password.trim()) formErrors.password = 'Password is required';

        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;

        const data = { email, password };

        // ✅ Send data to backend here
        // try {
        //     const response = await axios.post('/api/login', data);
        //     // Handle success
        // } catch (error) {
        //     // Handle error
        // }
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

            <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{ style: { color: '#fff' }, sx: { borderRadius: 2 } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{ style: { color: '#fff' }, sx: { borderRadius: 2 } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                    control={<Checkbox sx={{ color: '#fff' }} />}
                    label="Remember me"
                />
                <Link
                    component={RouterLink}
                    to="/ForgotPassword"
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
                onClick={handleSubmit}
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
            >
                Sign In
            </Button>

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
