import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, AlertCircle, Star, MessageSquare, FileText, Pill } from 'lucide-react';
import { Appointment } from '../types';
import { apiService } from '../utils/api';
import { AppointmentBookingForm } from './AppointmentBookingForm';
import { FeedbackForm } from './FeedbackForm';

export const PatientDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentBooked = () => {
    setShowBookingForm(false);
    loadAppointments();
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    setSelectedAppointment(null);
    loadAppointments();
  };

  const openFeedbackForm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowFeedbackForm(true);
  };

  if (showBookingForm) {
    return (
      <AppointmentBookingForm
        onBack={() => setShowBookingForm(false)}
        onSuccess={handleAppointmentBooked}
      />
    );
  }

  const completedAppointments = appointments.filter(apt => apt.status === 'Completed');
  const pendingAppointments = appointments.filter(apt => apt.status === 'Pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'Confirmed');
  const inProgressAppointments = appointments.filter(apt => apt.status === 'In Progress');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your appointments and health records</p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 shadow-medical hover:shadow-medical-lg transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          title="Total Appointments"
          value={appointments.length.toString()}
          gradient="from-primary-500 to-primary-600"
        />
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          title="Pending"
          value={pendingAppointments.length.toString()}
          gradient="from-warning-500 to-warning-600"
        />
        <StatCard
          icon={<User className="h-6 w-6" />}
          title="Completed"
          value={completedAppointments.length.toString()}
          gradient="from-secondary-500 to-secondary-600"
        />
        <StatCard
          icon={<Star className="h-6 w-6" />}
          title="Unique Doctors"
          value={new Set(appointments.map(apt => apt.doctor_name)).size.toString()}
          gradient="from-accent-500 to-accent-600"
        />
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatusCard
          title="Confirmed Today"
          count={confirmedAppointments.length}
          color="text-primary-600"
          bgColor="bg-primary-100 dark:bg-primary-900"
          description="Ready for your visit"
        />
        <QuickStatusCard
          title="In Progress"
          count={inProgressAppointments.length}
          color="text-accent-600"
          bgColor="bg-accent-100 dark:bg-accent-900"
          description="Currently ongoing"
        />
        <QuickStatusCard
          title="Awaiting Feedback"
          count={completedAppointments.filter(apt => !apt.prescription).length}
          color="text-warning-600"
          bgColor="bg-warning-100 dark:bg-warning-900"
          description="Share your experience"
        />
      </div>

      {/* Appointments List */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 shadow-medical">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Appointments</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No appointments yet. Book your first appointment!</p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onSubmitFeedback={() => openFeedbackForm(appointment)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && selectedAppointment && (
        <FeedbackForm
          appointment={selectedAppointment}
          onClose={() => {
            setShowFeedbackForm(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

// Component definitions
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, gradient }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-medical">
    <div className="flex items-center">
      <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl text-white`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

interface QuickStatusCardProps {
  title: string;
  count: number;
  color: string;
  bgColor: string;
  description: string;
}

const QuickStatusCard: React.FC<QuickStatusCardProps> = ({ title, count, color, bgColor, description }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-slate-700">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
      <span className={`text-2xl font-bold ${color}`}>{count}</span>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);

interface AppointmentCardProps {
  appointment: Appointment;
  onSubmitFeedback: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onSubmitFeedback }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-300';
      case 'Confirmed':
        return 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300';
      case 'In Progress':
        return 'bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-300';
      case 'Completed':
        return 'bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const canSubmitFeedback = appointment.status === 'Completed';

  return (
    <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-700/50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {appointment.doctor_name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-4 mb-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {appointment.appointment_date}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {appointment.appointment_time}
            </div>
          </div>
          {appointment.health_concern && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Concern:</strong> {appointment.health_concern}
            </p>
          )}
          {appointment.prescription && (
            <div className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-3 mb-2">
              <div className="flex items-center mb-1">
                <Pill className="h-4 w-4 mr-2 text-secondary-600 dark:text-secondary-400" />
                <span className="text-sm font-medium text-secondary-800 dark:text-secondary-300">Prescription:</span>
              </div>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">{appointment.prescription}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Booked: {new Date(appointment.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          {canSubmitFeedback && (
            <button
              onClick={onSubmitFeedback}
              className="px-3 py-1 text-xs bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all duration-200 flex items-center space-x-1"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Feedback</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};