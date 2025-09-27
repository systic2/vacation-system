import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingApprovals, approveLeave, rejectLeave } from '../api';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    Alert, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper 
} from '@mui/material';

function ApprovalPage() {
    const [approvals, setApprovals] = useState([]);
    const [error, setError] = useState('');

    const fetchApprovals = async () => {
        try {
            const data = await getPendingApprovals();
            setApprovals(data);
        } catch (err) {
            setError('결재 대기 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleApprove = async (leaveId) => {
        try {
            await approveLeave(leaveId);
            fetchApprovals();
        } catch (err) {
            setError('휴가 신청 승인에 실패했습니다.');
            console.error(err);
        }
    };

    const handleReject = async (leaveId) => {
        try {
            await rejectLeave(leaveId);
            fetchApprovals();
        } catch (err) {
            setError('휴가 신청 반려에 실패했습니다.');
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    결재 대기 목록
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>신청자 ID</TableCell>
                                <TableCell>종류</TableCell>
                                <TableCell>시작일</TableCell>
                                <TableCell>종료일</TableCell>
                                <TableCell>사유</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {approvals.length > 0 ? (
                                approvals.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>{leave.user_id}</TableCell>
                                        <TableCell>{leave.leave_type}</TableCell>
                                        <TableCell>{leave.start_date}</TableCell>
                                        <TableCell>{leave.end_date}</TableCell>
                                        <TableCell>{leave.reason}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="success" size="small" onClick={() => handleApprove(leave.id)}>승인</Button>
                                            <Button variant="contained" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleReject(leave.id)}>반려</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">결재 대기중인 휴가가 없습니다.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2 }}>
                    <Button component={Link} to="/dashboard" variant="outlined">대시보드로 돌아가기</Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ApprovalPage;
