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
            setError('Failed to load pending approvals.');
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
            setError('Failed to approve leave request.');
            console.error(err);
        }
    };

    const handleReject = async (leaveId) => {
        try {
            await rejectLeave(leaveId);
            fetchApprovals();
        } catch (err) {
            setError('Failed to reject leave request.');
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Pending Approvals
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Requester ID</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Actions</TableCell>
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
                                            <Button variant="contained" color="success" size="small" onClick={() => handleApprove(leave.id)}>Approve</Button>
                                            <Button variant="contained" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleReject(leave.id)}>Reject</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No pending approvals.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2 }}>
                    <Button component={Link} to="/dashboard" variant="outlined">Back to Dashboard</Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ApprovalPage;
