const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any[]
  warnings?: string[]
  certifications_preserved?: boolean
  cv_id?: string | null
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { isFormData?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const { isFormData, ...fetchOptions } = options

    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string> || {}),
    }

    if (!isFormData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber?: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async sendEmailOTP(email: string) {
    return this.request('/auth/send-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async sendSMSOTP(phoneNumber: string) {
    return this.request('/auth/send-sms-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    })
  }

  async verifyOTP(otpCode: string, verificationType: 'email' | 'sms', email?: string, phoneNumber?: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        otpCode,
        verificationType,
        email,
        phoneNumber,
      }),
    })
  }

  async getProfile() {
    return this.request('/auth/me')
  }

  async updateProfile(userData: any) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${this.baseURL}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload avatar' }))
      throw new Error(error.message || 'Failed to upload avatar')
    }

    return response.json()
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // Google OAuth
  getGoogleAuthUrl() {
    return `${this.baseURL}/auth/google`
  }

  async linkGoogleAccount(googleId: string, googleEmail: string, avatarUrl?: string) {
    return this.request('/auth/link-google', {
      method: 'POST',
      body: JSON.stringify({ googleId, googleEmail, avatarUrl }),
    })
  }

  async unlinkGoogleAccount() {
    return this.request('/auth/unlink-google', {
      method: 'POST',
    })
  }

  // CV AI endpoints
  async enhanceCV(cvData: any) {
    return this.request('/ai/cv/enhance', {
      method: 'POST',
      body: JSON.stringify(cvData),
    })
  }

  async getCVSuggestions(type: string, currentData: any) {
    return this.request('/ai/cv/suggest', {
      method: 'POST',
      body: JSON.stringify({ type, currentData }),
    })
  }

  async generateInterviewQuestion(payload: {
    collectedData: Record<string, unknown>
    conversationHistory: Array<{ role: 'ai' | 'user'; content: string }>
    currentStep: string
    interviewType: 'comprehensive' | 'quick'
  }) {
    return this.request('/ai/interview/question', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async calculateSkillConfidence(skills: any[]) {
    return this.request('/ai/cv/confidence', {
      method: 'POST',
      body: JSON.stringify({ skills }),
    })
  }

  async saveCV(cvData: any, cvId?: string) {
    return this.request('/ai/cv/save', {
      method: 'POST',
      body: JSON.stringify({ id: cvId, cvData }),
    })
  }

  async listCVs() {
    return this.request('/ai/cv/list')
  }

  async getCV(cvId: string) {
    return this.request(`/ai/cv/${cvId}`)
  }
}

export const apiClient = new ApiClient()
export default apiClient
