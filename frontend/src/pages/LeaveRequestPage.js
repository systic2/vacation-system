import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createLeave, getSubstituteUsers } from '../api';
import { 
    Container, 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Alert, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

function LeaveRequestPage() {
    const navigate = useNavigate();
    const [leaveType, setLeaveType] = useState('연차');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reason, setReason] = useState('');
    const [substitutes, setSubstitutes] = useState([]);
    const [substituteId, setSubstituteId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubstitutes = async () => {
            try {
                const users = await getSubstituteUsers();
                setSubstitutes(users);
            } catch (err) {
                console.error("Failed to fetch substitutes", err);
                setError("대체 근무자 목록을 불러오는 데 실패했습니다.");
            }
        };
        fetchSubstitutes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!startDate || !endDate || !reason || !substituteId) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            await createLeave({ 
                leave_type: leaveType, 
                start_date: format(startDate, 'yyyy-MM-dd'), 
                end_date: format(endDate, 'yyyy-MM-dd'), 
                reason, 
                substitute_id: parseInt(substituteId) 
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || '휴가 신청에 실패했습니다.');
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    휴가 신청
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="leave-type-label">휴가 종류</InputLabel>
                        <Select
                            labelId="leave-type-label"
                            id="leave-type"
                            value={leaveType}
                            label="휴가 종류"
                            onChange={(e) => setLeaveType(e.target.value)}
                        >
                            <MenuItem value="연차">연차</MenuItem>
                            <MenuItem value="오전반차">오전반차</MenuItem>
                            <MenuItem value="오후반차">오후반차</MenuItem>
                            <MenuItem value="재택근무">재택근무</MenuItem>
                            <MenuItem value="경조휴가">경조휴가</MenuItem>
                            <MenuItem value="병가">병가</MenuItem>
                            <MenuItem value="교육">교육</MenuItem>
                            <MenuItem value="출장">출장</MenuItem>
                            <MenuItem value="대체휴가">대체휴가</MenuItem>
                            <MenuItem value="기타">기타</MenuItem>
                        </Select>
                    </FormControl>
                    <DatePicker
                        label="시작일"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        format="yyyy-MM-dd"
                        sx={{ width: '100%', mt: 2, mb: 1 }}
                    />
                    <DatePicker
                        label="종료일"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        format="yyyy-MM-dd"
                        sx={{ width: '100%', mt: 2, mb: 1 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="reason"
                        label="사유"
                        multiline
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="substitute-label">대체 근무자</InputLabel>
                        <Select
                            labelId="substitute-label"
                            id="substitute"
                            value={substituteId}
                            label="대체 근무자"
                            onChange={(e) => setSubstituteId(e.target.value)}
                            required
                        >
                            {substitutes.map((sub) => (
                                <MenuItem key={sub.id} value={sub.id}>
                                    {sub.name} ({sub.employee_id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        제출
                    </Button>
                    <Button component={Link} to="/dashboard" fullWidth variant="outlined">
                        대시보드로 돌아가기
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LeaveRequestPage;
