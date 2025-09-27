import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add the auth token header to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error)
    }
);

export const login = async (employeeId, password) => {
    const formData = new URLSearchParams();
    formData.append('username', employeeId);
    formData.append('password', password);

    const response = await apiClient.post('/api/auth/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
};

export const getLeaves = async () => {
    const response = await apiClient.get('/api/leaves');
    return response.data;
};

export const createLeave = async (leaveData) => {
    const response = await apiClient.post('/api/leaves', leaveData);
    return response.data;
};

export const getLeaveBalance = async () => {
    const response = await apiClient.get('/api/users/me/leave-balance');
    return response.data;
};

export const getPendingApprovals = async () => {
    const response = await apiClient.get('/api/approvals');
    return response.data;
};

export const approveLeave = async (leaveId) => {
    const response = await apiClient.put(`/api/approvals/${leaveId}/approve`);
    return response.data;
};

export const rejectLeave = async (leaveId) => {
    const response = await apiClient.put(`/api/approvals/${leaveId}/reject`);
    return response.data;
};

export const getUsers = async () => {
    const response = await apiClient.get('/api/admin/users');
    return response.data;
};

export const deactivateUser = async (userId) => {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
};

export const activateUser = async (userId) => {
    const response = await apiClient.put(`/api/admin/users/${userId}/activate`);
    return response.data;
};

export const createUser = async (userData) => {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data;
};

export const changePassword = async (newPassword) => {
    const response = await apiClient.post('/api/users/me/change-password', { new_password: newPassword });
    return response.data;
};

export const resetPassword = async (userId) => {
    const response = await apiClient.post(`/api/admin/users/${userId}/reset-password`);
    return response.data;
};

export const getSubstituteUsers = async () => {
    const response = await apiClient.get('/api/users/substitutes');
    return response.data;
};

export default apiClient;
