export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
}

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id?: number;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  health_concern?: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed';
  prescription?: string;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DoctorStats {
  total_appointments: number;
  completed_appointments: number;
  total_feedback: number;
  average_rating: number;
}