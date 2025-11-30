import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Para upload de archivos
export const createFormDataRequest = (endpoint, formData) => {
  return axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  }).post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const auth = {
  register: (data) => api.post('/students/auth/register/', data),
  login: (data) => api.post('/students/auth/login/', data),
  logout: () => api.post('/students/auth/logout/'),
  me: () => api.get('/students/auth/me/'),
};

export const students = {
  getProfile: () => api.get('/students/profiles/'),
  createProfile: (data) => api.post('/students/profiles/', data),
  updateProfile: (id, data) => api.patch(`/students/profiles/${id}/`, data),
  getMyProfile: () => api.get('/students/profiles/my_profile/'),
  updateMyProfile: (formData) => createFormDataRequest('/students/profiles/update_my_profile/', formData),
};

export const companies = {
  getAll: () => api.get('/companies/profiles/'),
  getProfile: () => api.get('/companies/profiles/'),
  createProfile: (data) => api.post('/companies/profiles/', data),
  updateProfile: (id, data) => api.patch(`/companies/profiles/${id}/`, data),
  getMyProfile: () => api.get('/companies/profiles/my_profile/'),
  updateMyProfile: (formData) => createFormDataRequest('/companies/profiles/update_my_profile/', formData),
};

export const jobs = {
  getAll: () => api.get('/jobs/postings/'),
  getById: (id) => api.get(`/jobs/postings/${id}/`),
  create: (data) => api.post('/jobs/postings/', data),
  update: (id, data) => api.patch(`/jobs/postings/${id}/`, data),
  delete: (id) => api.delete(`/jobs/postings/${id}/`),
  getApplications: (id) => api.get(`/jobs/postings/${id}/applications/`),
};

export const applications = {
  getAll: () => api.get('/jobs/applications/'),
  create: (data) => api.post('/jobs/applications/', data),
  updateStatus: (id, status) => api.patch(`/jobs/applications/${id}/update_status/`, { status }),
};

export default api;
