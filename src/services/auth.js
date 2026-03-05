import API from './api';

export const register = async (username, email, password, skills) => {
  const { data } = await API.post('/auth/register', { username, email, password, skills });
  localStorage.setItem('bod_token', data.token);
  localStorage.setItem('bod_user', JSON.stringify(data));
  return data;
};

export const login = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  localStorage.setItem('bod_token', data.token);
  localStorage.setItem('bod_user', JSON.stringify(data));
  return data;
};

export const logout = () => {
  localStorage.removeItem('bod_token');
  localStorage.removeItem('bod_user');
  window.location.href = '/auth';
};

export const getMe = async () => {
  const { data } = await API.get('/auth/me');
  return data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('bod_user');
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => !!localStorage.getItem('bod_token');