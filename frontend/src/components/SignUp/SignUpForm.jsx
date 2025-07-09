// 1️. At the top :
// import axios 

// 2️. Inside the component, define form states

// 3️. Inside handleSubmit function:
//  Prepare data to send to your backend
//  Send POST request to your signup endpoint  
//  Handle success
//  Handle error


// 4. On the Sign Up button:
// Add onClick={handleSubmit} to trigger the API logic when clicked


import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

//import axios

export default function SignUpForm() {
    const [dob, setDob] = useState(null);
    const [gender, setGender] = useState('');


//create input states 

// handle input changes


//connection of api here
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <TextField
                label="Email"
                fullWidth
                margin="normal"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
            />

            <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
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
                sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
            >
                <InputLabel sx={{ color: '#aaa' }}>Gender</InputLabel>
                <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="Gender"
                    sx={{ color: '#fff' }}
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
                //trigger endpoint logic here
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
