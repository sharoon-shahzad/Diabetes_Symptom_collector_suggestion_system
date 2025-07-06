import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
} from '@mui/material';

export default function SignUpForm() {
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
                Sign up
            </Typography>

            <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    },
                }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <TextField
                label="Email"
                fullWidth
                margin="normal"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    },
                }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    },
                }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
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
            >
                Sign Up
            </Button>

            <Typography textAlign="center" mt={2}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/signin" sx={{ color: '#60A5FA' }}>
                    Sign in
                </Link>
            </Typography>
        </Paper>
    );
}
