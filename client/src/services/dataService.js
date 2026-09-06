import api from './api';

export const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  uploadResume: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/students/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post('/students/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  verify: (id, data) => api.patch(`/students/${id}/verify`, data),
  issueNoc: (id, data) => api.patch(`/students/${id}/noc`, data),
};

export const driveService = {
  getAll: (params) => api.get('/drives', { params }),
  getCounts: (params) => api.get('/drives/counts', { params }),
  getById: (id) => api.get(`/drives/${id}`),
  create: (data) => api.post('/drives', data),
  update: (id, data) => api.put(`/drives/${id}`, data),
  updateStatus: (id, status) => api.patch(`/drives/${id}/status`, { status }),
  delete: (id) => api.delete(`/drives/${id}`),
};

export const applicationService = {
  getAll: (params) => api.get('/applications', { params }),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  applyToDrive: (driveId) => api.post(`/applications/drives/${driveId}`),
  getDriveApplications: (driveId, params) => api.get(`/applications/drives/${driveId}`, { params }),
  getCompanyApplications: (params) => api.get('/applications/company', { params }),
  updateStatus: (id, status, rejectionReason = '') => api.patch(`/applications/${id}/status`, { status, rejectionReason }),
  updateNoc: (id, data) => api.patch(`/applications/${id}/noc`, data),
  getOfferLetter: (id) => api.get(`/applications/${id}/offer-letter`),
  withdraw: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'),
};

export const companyService = {
  getProfile: () => api.get('/companies/profile'),
  updateProfile: (data) => api.put('/companies/profile', data),
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/companies/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  verify: (id) => api.patch(`/companies/${id}/verify`),
};

export const interviewService = {
  schedule: (data) => api.post('/interviews', data),
  getMyInterviews: (params) => api.get('/interviews/my', { params }),
  getCompanyInterviews: (params) => api.get('/interviews/company', { params }),
  getDriveInterviews: (driveId) => api.get(`/interviews/drives/${driveId}`),
  update: (id, data) => api.patch(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

