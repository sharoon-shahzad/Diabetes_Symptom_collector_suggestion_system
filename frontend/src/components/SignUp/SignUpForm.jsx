import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios'; // Uncomment when integrating API

export default function SignUpForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState(null);
    const [gender, setGender] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async () => {
        const formErrors = {};

        if (!fullName.trim()) formErrors.fullName = 'Full name is required';
        if (!email.trim()) formErrors.email = 'Email is required';
        if (!password.trim()) formErrors.password = 'Password is required';
        if (!dob) formErrors.dob = 'Date of birth is required';
        if (!gender) formErrors.gender = 'Please select gender';

        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;

        const data = { fullName, email, password, dob, gender };

        // ✅ Send data to backend here
        // try {
        //     const response = await axios.post('/api/signup', data);
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
                Sign up
            </Typography>

            <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!errors.fullName}
                helperText={errors.fullName}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Date of Birth"
                    value={dob}
                    onChange={(newValue) => setDob(newValue)}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: 'normal',
                            error: !!errors.dob,
                            helperText: errors.dob,
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
                error={!!errors.gender}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        color: '#fff',
                    },
                    '& .MuiInputLabel-root': {
                        color: '#aaa',
                    },
                    '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f44336', 
                    },
                }}
            >
                <InputLabel>Gender</InputLabel>
                <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="Gender"
                    sx={{
                        color: '#fff',
                        '.MuiOutlinedInput-notchedOutline': {
                            borderColor: !!errors.gender ? '#f44336' : '#aaa', 
                        },
                    }}
                >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>

                {errors.gender && (
                    <Typography variant="caption" color="error" sx={{mt:1,ml:1}}>
                        {errors.gender}
                    </Typography>
                )}
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
                onClick={handleSubmit}
            >
                Sign Up
            </Button>

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
