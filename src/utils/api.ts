const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Handle validation errors
            errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || 'Request failed';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/me');
  }

  async getDoctors() {
    return this.request('/doctors');
  }

  async createAppointment(appointmentData: {
    doctor_name: string;
    appointment_date: string;
    appointment_time: string;
    health_concern?: string;
  }) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointments() {
    return this.request('/appointments');
  }

  async getPendingAppointments() {
    return this.request('/appointments/pending');
  }
}

export const apiService = new ApiService();