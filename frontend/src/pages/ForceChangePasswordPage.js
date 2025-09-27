import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';

function ForceChangePasswordPage() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (newPassword.length < 6) { // Example validation
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }
        setError('');
        try {
            await changePassword(newPassword);
            alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('token');
            navigate('/');
        } catch (err) {
            setError('비밀번호 변경에 실패했습니다.');
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
                    비밀번호 변경
                </Typography>
                <Typography component="p" sx={{ mt: 1 }}>
                    비밀번호가 초기화되었습니다. 계속하려면 새 비밀번호를 설정해야 합니다.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="newPassword"
                        label="새 비밀번호"
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="새 비밀번호 확인"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        새 비밀번호 설정
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ForceChangePasswordPage;
