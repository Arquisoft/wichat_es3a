import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Container, Typography, TextField, Button, Link, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({ username: '', password: '', general: '' });
    const [loading, setLoading] = useState(false);
    const newSessionId = uuidv4();

    const navigate = useNavigate();

    const validateFields = () => {
        let valid = true;
        const newErrors = { username: '', password: '', general: '' };

        if (!username.trim()) {
            newErrors.username = 'Username is required.';
            valid = false;
        }
        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
            valid = false;
        }

        setError(newErrors);
        return valid;
    };

    const addUser = async () => {
        if (!validateFields()) return;

        setLoading(true);
        setError({ username: '', password: '', general: '' });

        try {
            localStorage.setItem('sessionId', newSessionId);
            localStorage.setItem('username', username);
            navigate('/main');  // Redirigir a la página principal tras registro exitoso
							  
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            setError((prev) => ({
                ...prev,
                general: axiosError.response?.data?.error || 'An unknown error occurred.',
            }));
													  
        } finally {
            setLoading(false);
        }
    };

									 
						   
	

    return (
        <Container component="main" maxWidth="xs" sx={{ marginTop: 6, textAlign: 'center' }}>
            <Typography component="h1" variant="h5" gutterBottom>
                Create an account
            </Typography>
            <Box sx={{ mt: 2 }}>
											  
				
				   
                <TextField
                    name="username"
                    margin="normal"
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={!!error.username}
                    helperText={error.username}
                />
                <TextField
                    name="password"
                    margin="normal"
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!error.password}
                    helperText={error.password}
                />
                {error.general && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        {error.general}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={addUser} 
                        disabled={loading} 
                        sx={{ width: '100%', transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'scale(1.05)' },
                            '&:active': { transform: 'scale(0.95)' } }}>
                        {loading ? 'Adding...' : 'Add User'}
                    </Button>
                </Box>
            </Box>
            <Link component="button" variant="body2" onClick={() => navigate('/login')} sx={{ mt: 2, display: 'block' }}>
                Already have an account? Login here.
            </Link>
        </Container>
    );
};

export default AddUser;
