import axios from 'axios';
import {API_BASE_URL} from '../config/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Optional interceptor to normalize/log errors; keep minimal for now.
api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  },
);
