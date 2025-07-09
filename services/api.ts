import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://shiftryapi.manocore.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================== AUTH ==========================
export const loginUser = (data: { emailId: string; password: string }) =>API.post("/auth/login", data);
export const signupUser = (data: any) => API.post('/auth/signup', data);
export const forgotPassword = (data: any) => API.post('/auth/forgot-password', data);
export const resetPassword = ({ token, newPassword }: { token: string; newPassword: string }) =>
  API.put(`/auth/reset-password/${token}`, { newPassword });

export const sendPasswordResetEmailForUser = (userId: any) =>
  API.post(`/auth/send-reset-email/${userId}`);
export const resetUserLoginCredentials = (userId: any, newEmail: any, newPassword: any) =>
  API.put(`/auth/reset-credentials/${userId}`, { newEmail, newPassword });

// ========================== USERS ==========================
export const fetchAllUsers = () => API.get('/users/all');
export const addUser = (data: any) => API.post('/users/add', data);
export const updateUserStatus = (data: any) => API.put('/users/status', data);
export const inviteUser = (userData: any) => API.post('/users/generate-invite', userData);
export const acceptInvite = (data: any) => API.post('/users/accept-invite', data);
export const getUserByInviteToken = (token: any) => API.get(`/users/invite/${token}`);
export const updateUserById = (userId: any, formData: any) =>
  API.put(`/users/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ========================== PROFILE ==========================
export const fetchUserProfile = () => API.get('/profile/me');
export const updateUserProfile = (formData: any) =>
  API.put('/profile/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const fetchUserById = (userId: any) => API.get(`/users/${userId}`);

// ========================== SCHEDULE ==========================
export const createOrUpdateSchedule = (data: any) => API.post('/api/schedules/', data);
export const fetchSchedules = (startDate: string) => API.get(`/api/schedules/week/${startDate}`);
export const fetchSchedulesByWeek = (startDate: any) => API.get(`/api/schedules/week/${startDate}`);
export const updateSchedule = (id, data) => API.put(`/api/schedules/${id}`, data);
export const deleteSchedule = (id) => API.delete(`/api/schedules/${id}`);
export const fetchSchedulesInRange = (startDate: string | number | Date, endDate: string | number | Date) => {
  const from = new Date(startDate).toISOString().split('T')[0];
  const to = new Date(endDate).toISOString().split('T')[0];
  return API.get(`/api/schedules/range?startDate=${from}&endDate=${to}`);
};
export const createSchedulesBatch = (scheduleIds) =>
  API.post('/api/schedules/create-schedule', { scheduleIds });
export const publishSchedules = (scheduleIds) =>
  API.post('/api/schedules/publish', { scheduleIds });
export const fetchMyAssignedShifts = () => API.get('/api/schedules/my-assigned-shifts');

// ========================== LOCATIONS ==========================
export const fetchLocations = () => API.get('/api/locations');
export const addLocation = (data) => API.post('/api/locations', data);
export const updateLocation = (id, data) => API.put(`/api/locations/${id}`, data);

// ========================== NEWSFEED ==========================
export const createPost = (data) => API.post('/newsfeed/posts', data);
export const fetchAllPosts = () => API.get('/newsfeed/posts/all');
export const fetchImportantPosts = () => API.get('/newsfeed/posts/important');
export const fetchYourPosts = (userId) => API.get(`/newsfeed/posts/your/${userId}`);
export const toggleLikePost = (postId, userId) =>
  API.put(`/newsfeed/posts/like/${postId}`, { userId });
export const addCommentToPost = (postId, comment) =>
  API.post(`/newsfeed/posts/comment/${postId}`, comment);
export const deletePost = (postId) => API.delete(`/newsfeed/posts/${postId}`);

// ========================== NOTIFICATIONS ==========================
export const fetchNotifications = async (id: string) => {
  try {
    const { data } = await API.get('/api/notifications');
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
export const fetchUnreadNotificationCount = async (id: string) => {
  try {
    const { data } = await API.get('/api/notifications/unread');
    return data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};
export const createNotification = (data) => API.post('/api/notifications', data);
export const markNotificationAsRead = (id) => API.put(`/api/notifications/${id}/read`);
export const markAllNotificationsAsRead = (id: string) => API.put('/api/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/api/notifications/${id}`);
export const clearAllNotifications = (id: string) => API.delete('/api/notifications');

// ========================== LEAVE ==========================
export const submitLeaveApplication = (leaveData) => API.post('/api/leave', leaveData);
export const fetchMyLeaveApplications = () => API.get('/api/leave/my-applications');
export const fetchAllLeaveApplications = () => API.get('/api/leave/all');
export const updateLeaveApplicationStatus = (id, status) =>
  API.put(`/api/leave/${id}/status`, { status });
export const fetchUserLeaves = (userId) => API.get(`/api/leave/user/${userId}`);

// ========================== SUBSCRIPTION / CONTACT ==========================
export const subscribeToNewsletter = (email) => API.post('/api/subscribe', { email });
export const submitContactForm = (formData) => API.post('/api/contact', formData);
