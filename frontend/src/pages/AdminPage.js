import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, activateUser, deactivateUser, createUser, resetPassword } from '../api';
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
    Paper, 
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';

// AddUserForm component
const AddUserForm = ({ onUserAdded, onCancel }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [team, setTeam] = useState('철강형강시스템팀');
    const [part, setPart] = useState('생산지원');
    const [rank, setRank] = useState('매니저');
    const [position, setPosition] = useState('파트원');
    const [hireDate, setHireDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createUser({
                employee_id: employeeId,
                name,
                password,
                team,
                part,
                rank,
                position,
                hire_date: hireDate
            });
            onUserAdded();
        } catch (err) {
            setError(err.response?.data?.detail || '사용자 생성에 실패했습니다.');
            console.error(err);
        }
    };

    return (
        <Dialog open onClose={onCancel}>
            <DialogTitle>신규 사용자 추가</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    새로운 사용자의 정보를 입력해주세요.
                </DialogContentText>
                {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
                <TextField autoFocus margin="dense" id="employeeId" label="사번" type="text" fullWidth variant="standard" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
                <TextField margin="dense" id="name" label="이름" type="text" fullWidth variant="standard" value={name} onChange={e => setName(e.target.value)} required />
                <TextField margin="dense" id="password" label="비밀번호" type="password" fullWidth variant="standard" value={password} onChange={e => setPassword(e.target.value)} required />
                <TextField margin="dense" id="hireDate" label="입사일" type="date" fullWidth variant="standard" InputLabelProps={{ shrink: true }} value={hireDate} onChange={e => setHireDate(e.target.value)} required />
                <TextField margin="dense" id="position" label="직책" type="text" fullWidth variant="standard" value={position} onChange={e => setPosition(e.target.value)} required />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>취소</Button>
                <Button onClick={handleSubmit}>사용자 저장</Button>
            </DialogActions>
        </Dialog>
    );
};

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('사용자 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleActive = async (user) => {
        try {
            if (user.is_active) {
                await deactivateUser(user.id);
            } else {
                await activateUser(user.id);
            }
            fetchUsers();
        } catch (err) {
            setError(`사용자 ${user.id}의 상태 변경에 실패했습니다.`);
            console.error(err);
        }
    }

    const handleResetPassword = async (userId) => {
        if (window.confirm(`정말로 사용자 ${userId}의 비밀번호를 초기화하시겠습니까?`)) {
            try {
                await resetPassword(userId);
                alert(`사용자 ${userId}의 비밀번호가 초기화되었습니다.`);
            } catch (err) {
                setError(`사용자 ${userId}의 비밀번호 초기화에 실패했습니다.`);
                console.error(err);
            }
        }
    }

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    관리자 - 사용자 관리
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" onClick={() => setShowAddForm(true)}>신규 사용자 추가</Button>
                    <Button component={Link} to="/dashboard" variant="outlined">대시보드로 돌아가기</Button>
                </Box>

                {showAddForm && (
                    <AddUserForm 
                        onUserAdded={() => {
                            setShowAddForm(false);
                            fetchUsers();
                        }}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>사번</TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>직책</TableCell>
                                <TableCell>관리자?</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.employee_id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.position}</TableCell>
                                    <TableCell>{user.is_admin ? '예' : '아니오'}</TableCell>
                                    <TableCell>{user.is_active ? '활성' : '비활성'}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => handleToggleActive(user)}>
                                            {user.is_active ? '비활성화' : '활성화'}
                                        </Button>
                                        <Button size="small" sx={{ ml: 1 }} onClick={() => handleResetPassword(user.id)}>비밀번호 초기화</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
}

export default AdminPage;
