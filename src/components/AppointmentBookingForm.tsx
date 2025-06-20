import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, FileText, Send, AlertCircle } from 'lucide-react';
import { apiService } from '../utils/api';

interface AppointmentBookingFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
}

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
  onBack,
  onSuccess,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctor_name: '',
    appointment_date: '',
    appointment_time: '',
    health_concern: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const doctorsList = await apiService.getDoctors();
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiService.createAppointment(formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Schedule your consultation with our medical professionals</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 p-8 shadow-medical">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Doctor *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="doctor_name"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.name}>
                    Dr. {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="appointment_date"
                  name="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={minDate}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="appointment_time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available slots: 9:00 AM - 5:00 PM</p>
            </div>
          </div>

          <div>
            <label htmlFor="health_concern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Health Concern Note
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                id="health_concern"
                name="health_concern"
                value={formData.health_concern}
                onChange={handleChange}
                rows={4}
                maxLength={200}
                className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Briefly describe your health concern or reason for visit (optional, max 200 characters)"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.health_concern.length}/200 characters
            </p>
          </div>

          {error && (
            <div className="text-error-600 dark:text-error-400 text-sm bg-error-50 dark:bg-error-900/20 p-3 rounded-xl border border-error-200 dark:border-error-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
            <h3 className="font-medium text-primary-900 dark:text-primary-300 mb-2">Important Notes:</h3>
            <ul className="text-sm text-primary-800 dark:text-primary-300 space-y-1">
              <li>• You can book a maximum of 2 appointments per day</li>
              <li>• Appointments are subject to doctor availability</li>
              <li>• You will receive confirmation once the doctor approves your request</li>
              <li>• Please arrive 15 minutes before your scheduled time</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 disabled:opacity-50 shadow-medical hover:shadow-medical-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};