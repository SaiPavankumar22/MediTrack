import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { Appointment } from '../types';
import { apiService } from '../utils/api';

export const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allPendingAppointments, setAllPendingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('mine');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [myAppointments, pendingAppointments] = await Promise.all([
        apiService.getAppointments(),
        apiService.getPendingAppointments()
      ]);
      setAppointments(myAppointments);
      setAllPendingAppointments(pendingAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const myPendingCount = appointments.filter(apt => apt.status === 'Pending').length;
  const uniquePatients = new Set(appointments.map(apt => apt.patient_name)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage patient appointments and schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">My Appointments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{myPendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Unique Patients</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{uniquePatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">All Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{allPendingAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'mine'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              All Pending Appointments
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading appointments...</p>
            </div>
          ) : (
            <AppointmentsList 
              appointments={activeTab === 'mine' ? appointments : allPendingAppointments}
              showDoctor={activeTab === 'all'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface AppointmentsListProps {
  appointments: Appointment[];
  showDoctor?: boolean;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, showDoctor = false }) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No appointments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-700/50"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {showDoctor ? `Dr. ${appointment.doctor_name}` : appointment.patient_name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    appointment.status === 'Pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                      : appointment.status === 'Confirmed'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {appointment.appointment_date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {appointment.appointment_time}
                </div>
                {showDoctor && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Patient: {appointment.patient_name}
                  </div>
                )}
              </div>
              {appointment.health_concern && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Health Concern:</strong> {appointment.health_concern}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Booked on: {new Date(appointment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};