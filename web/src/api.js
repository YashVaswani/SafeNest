import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3009/api', // Point to existing Express backend
});

// Helper to set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
};

// Auto-load token on boot
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  setAuthToken(savedToken);
}

// ── Auth ─────────────────────────────
export const sendOtp = (phoneNumber) => api.post('/auth/send-otp', { phoneNumber });
export const verifyOtp = (phoneNumber, otp) => api.post('/auth/verify-otp', { phoneNumber, otp });

// ── Helpers / Staff ───────────────────
export const getHelpers = (search = '') => api.get(`/helpers${search ? `?search=${search}` : ''}`);
export const getHelperProfile = (id) => api.get(`/helpers/${id}`);

export default api;
