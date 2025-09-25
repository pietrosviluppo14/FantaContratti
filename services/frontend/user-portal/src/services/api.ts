/**
 * API Service - Frontend API communication
 * Handles all HTTP requests to the backend API Gateway
 */
import axios from 'axios'

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  username: string
}

export interface User {
  id: number
  email: string
  username: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response
  },

  register: async (userData: RegisterData) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData)
    return response
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response
  },

  refreshToken: async () => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh')
    return response
  },
}

// Users API
export const usersApi = {
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile')
    return response
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', userData)
    return response
  },

  getAllUsers: async () => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users')
    return response
  },

  getUserById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response
  },

  deleteUser: async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`)
    return response
  },
}

export default apiClient