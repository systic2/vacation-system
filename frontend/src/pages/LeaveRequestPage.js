import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createLeave } from '../api';
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

function LeaveRequestPage() {
    const navigate = useNavigate();
    const [leaveType, setLeaveType] = useState('연차');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [substituteId, setSubstituteId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!startDate || !endDate || !reason || !substituteId) {
            setError('All fields are required.');
            return;
        }

        try {
            await createLeave({ 
                leave_type: leaveType, 
                start_date: startDate, 
                end_date: endDate, 
                reason, 
                substitute_id: parseInt(substituteId) 
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit leave request.');
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Request Leave
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="leave-type-label">Leave Type</InputLabel>
                        <Select
                            labelId="leave-type-label"
                            id="leave-type"
                            value={leaveType}
                            label="Leave Type"
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
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="startDate"
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="endDate"
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="reason"
                        label="Reason"
                        multiline
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="substituteId"
                        label="Substitute User ID"
                        type="number"
                        value={substituteId}
                        onChange={(e) => setSubstituteId(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Submit
                    </Button>
                    <Button component={Link} to="/dashboard" fullWidth variant="outlined">
                        Back to Dashboard
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LeaveRequestPage;
