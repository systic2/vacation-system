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
            setError(err.response?.data?.detail || 'Failed to create user.');
            console.error(err);
        }
    };

    return (
        <Dialog open onClose={onCancel}>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please fill in the details for the new user.
                </DialogContentText>
                {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
                <TextField autoFocus margin="dense" id="employeeId" label="Employee ID" type="text" fullWidth variant="standard" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
                <TextField margin="dense" id="name" label="Name" type="text" fullWidth variant="standard" value={name} onChange={e => setName(e.target.value)} required />
                <TextField margin="dense" id="password" label="Password" type="password" fullWidth variant="standard" value={password} onChange={e => setPassword(e.target.value)} required />
                <TextField margin="dense" id="hireDate" label="Hire Date" type="date" fullWidth variant="standard" InputLabelProps={{ shrink: true }} value={hireDate} onChange={e => setHireDate(e.target.value)} required />
                <TextField margin="dense" id="position" label="Position" type="text" fullWidth variant="standard" value={position} onChange={e => setPosition(e.target.value)} required />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save User</Button>
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
            setError('Failed to load users.');
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
            setError(`Failed to change status for user ${user.id}`);
            console.error(err);
        }
    }

    const handleResetPassword = async (userId) => {
        if (window.confirm(`Are you sure you want to reset the password for user ${userId}?`)) {
            try {
                await resetPassword(userId);
                alert(`Password for user ${userId} has been reset.`);
            } catch (err) {
                setError(`Failed to reset password for user ${userId}`);
                console.error(err);
            }
        }
    }

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Admin - User Management
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" onClick={() => setShowAddForm(true)}>Add New User</Button>
                    <Button component={Link} to="/dashboard" variant="outlined">Back to Dashboard</Button>
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
                                <TableCell>Employee ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Admin?</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.employee_id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.position}</TableCell>
                                    <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{user.is_active ? 'Active' : 'Inactive'}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => handleToggleActive(user)}>
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button size="small" sx={{ ml: 1 }} onClick={() => handleResetPassword(user.id)}>Reset Password</Button>
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
