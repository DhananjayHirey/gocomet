import { useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_URL } from '../constants/urls';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('login');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('rfq_user');
    const token = sessionStorage.getItem('rfq_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${AUTH_URL}/login`, { username, password });
      sessionStorage.setItem('rfq_token', res.data.token);
      sessionStorage.setItem('rfq_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setView('dashboard');
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (authData) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${AUTH_URL}/register`, authData);
      setView('login');
      setError('Account created! Please sign in.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('rfq_token');
    sessionStorage.removeItem('rfq_user');
    setUser(null);
    setView('login');
  };

  return { user, loading, error, setError, view, setView, login, register, logout };
};
