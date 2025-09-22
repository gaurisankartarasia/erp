
import apiClient from '../api/axiosConfig';

// --- Leave Type Services ---

export const getLeaveTypes = async () => {
    const { data } = await apiClient.get('/rules/leave-types');
    return data;
};

export const getLeaveTypeById = async (id) => {
    const { data } = await apiClient.get(`/rules/leave-types/${id}`);
    return data;
};

export const createLeaveType = async (leaveTypeData) => {
    const { data } = await apiClient.post('/rules/leave-types', leaveTypeData);
    return data;
};

export const updateLeaveType = async (id, leaveTypeData) => {
    const { data } = await apiClient.put(`/rules/leave-types/${id}`, leaveTypeData);
    return data;
};

export const deleteLeaveType = async (id) => {
    const { data } = await apiClient.delete(`/rules/leave-types/${id}`);
    return data;
};

// --- Company Rule Services ---

export const getCompanyRules = async () => {
    const { data } = await apiClient.get('/rules/company-rules');
    return data;
};

export const updateCompanyRules = async (rulesData) => {
    const { data } = await apiClient.put('/rules/company-rules', rulesData);
    return data;
};