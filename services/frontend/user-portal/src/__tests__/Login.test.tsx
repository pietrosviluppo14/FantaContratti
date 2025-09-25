/**
 * Login Component Tests - TDD Implementation
 * Testing authentication UI component with React Testing Library
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../components/Login'

// Mock API calls
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Mock router navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Wrapper component for router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Login Component - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering and UI Elements', () => {
    it('should render login form with all required fields', () => {
      renderWithRouter(<Login />)
      
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should have email and password inputs with correct types', () => {
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should render link to register page', () => {
      renderWithRouter(<Login />)
      
      const registerLink = screen.getByRole('link', { name: /create account/i })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('should show login button as enabled initially', () => {
      renderWithRouter(<Login />)
      
      const loginButton = screen.getByRole('button', { name: /sign in/i })
      expect(loginButton).toBeEnabled()
    })
  })

  describe('Form Validation', () => {
    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
    })

    it('should show validation error for empty password', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    })

    it('should show validation error for short password', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '12345')
      await user.click(submitButton)
      
      expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })

    it('should not show validation errors for valid inputs', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call login API with correct credentials on form submission', async () => {
      const { authApi } = await import('../services/api')
      const mockLogin = vi.mocked(authApi.login)
      mockLogin.mockResolvedValue({
        data: {
          success: true,
          data: {
            user: { id: 1, email: 'test@example.com' },
            token: 'mock-token'
          }
        }
      })

      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should show loading state during login', async () => {
      const { authApi } = await import('../services/api')
      const mockLogin = vi.mocked(authApi.login)
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should navigate to dashboard on successful login', async () => {
      const { authApi } = await import('../services/api')
      const mockLogin = vi.mocked(authApi.login)
      mockLogin.mockResolvedValue({
        data: {
          success: true,
          data: {
            user: { id: 1, email: 'test@example.com' },
            token: 'mock-token'
          }
        }
      })

      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should show error message on login failure', async () => {
      const { authApi } = await import('../services/api')
      const mockLogin = vi.mocked(authApi.login)
      mockLogin.mockRejectedValue({
        response: {
          data: {
            error: 'Invalid credentials',
            message: 'Email or password is incorrect'
          }
        }
      })

      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      expect(await screen.findByText(/email or password is incorrect/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      renderWithRouter(<Login />)
      
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-label', 'Login form')
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('aria-required', 'true')
      expect(passwordInput).toHaveAttribute('aria-required', 'true')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })
});