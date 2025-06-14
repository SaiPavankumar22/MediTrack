export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
}

export interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  health_concern?: string;
  status: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}