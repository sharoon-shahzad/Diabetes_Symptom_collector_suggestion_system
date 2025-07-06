import React from 'react';
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

export default function SignInForm() {
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
                <Link href="#" underline="hover" sx={{ color: '#60A5FA' }}>
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
            >
                Sign In
            </Button>

            <Typography textAlign="center" mt={2}>
                Don’t have an account?{' '}
                <Link component={RouterLink} to="/signup" sx={{ color: '#60A5FA' }}>
                    Sign up
                </Link>
            </Typography>
        </Paper>
    );
}
