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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Alert,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function SignUpForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState(null);
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        if (!fullName || !email || !password || !dob || !gender) {
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
        if (!['Male', 'Female', 'Prefer not to say'].includes(gender)) {
            setError('Invalid gender.');
            return false;
        }
        if (isNaN(Date.parse(dob))) {
            setError('Invalid date of birth.');
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
                gender,
                date_of_birth: dob,
            });
            setSuccess(res.data.message || 'Check your email to activate your account.');
            setFullName('');
            setEmail('');
            setPassword('');
            setDob(null);
            setGender('');
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/signin'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate max date for 11 years ago
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate());

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
                    InputProps={{ style: { color: '#fff' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{ style: { color: '#fff' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
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
                        style: { color: '#fff' },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((show) => !show)}
                                    edge="end"
                                    sx={{ color: '#fff' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Date of Birth"
                        value={dob}
                        onChange={setDob}
                        maxDate={maxDate}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: 'normal',
                                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                                InputProps: { style: { color: '#fff' } },
                                InputLabelProps: { style: { color: '#aaa' } },
                            },
                        }}
                    />
                </LocalizationProvider>
                <FormControl
                    fullWidth
                    margin="normal"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                    <InputLabel sx={{ color: '#aaa' }}>Gender</InputLabel>
                    <Select
                        value={['Male','Female','Prefer not to say'].includes(gender) ? gender : ''}
                        onChange={e => setGender(e.target.value)}
                        label="Gender"
                        sx={{ color: '#fff' }}
                        disabled={false}
                    >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                </FormControl>
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
