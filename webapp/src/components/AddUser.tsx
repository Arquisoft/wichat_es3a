// src/components/AddUser.tsx
import React, { useState } from 'react';
import axios, {AxiosError} from 'axios';
import {Container, Typography, TextField, Button, Snackbar, Link} from '@mui/material';
import {ErrorResponse} from './ErrorInterface';
import { useNavigate } from 'react-router-dom';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

    const addUser = async () => {
        try {
            await axios.post(`${apiEndpoint}/adduser`, { username, password });
            setOpenSnackbar(true);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>; // Usa el tipo AxiosError con ErrorResponse
            if (axiosError.response && axiosError.response.data) {
                setError(axiosError.response.data.error); // Accede al mensaje de error
            } else {
                setError('An unknown error occurred');
            }
        }
    };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
        <Typography component="h1" variant="h5" align="center" sx={{ marginTop: 2 }}>
            Welcome to the 2025 edition of the Software Architecture course
        </Typography>
        <Typography component="div" align="center" sx={{ marginTop: 2 }}/>
      <Typography component="h1" variant="h5">
        Add User
      </Typography>
      <TextField
        name="username"
        margin="normal"
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        name="password"
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={addUser}>
        Add User
      </Button>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
        <Typography component="div" align="center" sx={{ marginTop: 2 }}/>
        <Link component="button" variant="body2" onClick={() => navigate('/login')}>
            Already have an account? Login here.
        </Link>
    </Container>
  );
};

export default AddUser;
