import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';

function LoginPage() {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(employeeId, password);
            localStorage.setItem('token', data.access_token);
            if (data.password_reset_required) {
                navigate('/force-change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('로그인에 실패했습니다. 사번과 비밀번호를 확인해주세요.');
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    로그인
                </Typography>
                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="employeeId"
                        label="사번"
                        name="employeeId"
                        autoComplete="username"
                        autoFocus
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="비밀번호"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        로그인
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;
