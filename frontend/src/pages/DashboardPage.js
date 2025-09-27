import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, getLeaves, getLeaveBalance } from '../api';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    AppBar, 
    Toolbar, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper 
} from '@mui/material';

function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                const leavesData = await getLeaves();
                setLeaves(leavesData);
                const balanceData = await getLeaveBalance();
                setBalance(balanceData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                handleLogout();
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (!user || !balance) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        휴가 시스템
                    </Typography>
                    <Typography sx={{ mr: 2 }}>환영합니다, {user.name}님!</Typography>
                    <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', mb: 2 }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        연차 현황
                    </Typography>
                    <Typography component="p">
                        총 연차: {balance.total} | 사용: {balance.used} | 잔여: {balance.remaining}
                    </Typography>
                </Paper>

                <Box sx={{ mb: 2 }}>
                    <Button component={Link} to="/request-leave" variant="contained">휴가 신청</Button>
                    {(user.position === '파트장' || user.position === '팀장') && (
                        <Button component={Link} to="/approvals" variant="outlined" sx={{ ml: 1 }}>결재</Button>
                    )}
                    {user.is_admin && (
                        <Button component={Link} to="/admin" variant="outlined" sx={{ ml: 1 }}>관리</Button>
                    )}
                </Box>

                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    내 휴가 내역
                </Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>종류</TableCell>
                                <TableCell>시작일</TableCell>
                                <TableCell>종료일</TableCell>
                                <TableCell>상태</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaves.length > 0 ? (
                                leaves.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>{leave.leave_type}</TableCell>
                                        <TableCell>{leave.start_date}</TableCell>
                                        <TableCell>{leave.end_date}</TableCell>
                                        <TableCell>{leave.status}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">휴가 내역이 없습니다.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}

export default DashboardPage;
