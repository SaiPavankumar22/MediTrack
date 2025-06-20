import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, Users, CheckCircle, Star, Award, TrendingUp, FileText, Eye, ThumbsUp } from 'lucide-react';
import { Appointment, Feedback, DoctorStats } from '../types';
import { apiService } from '../utils/api';
import { AppointmentStatusModal } from './AppointmentStatusModal';
import { FeedbackModal } from './FeedbackModal';

export const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allPendingAppointments, setAllPendingAppointments] = useState<Appointment[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'pending' | 'feedback'>('mine');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [myAppointments, pendingAppointments, doctorFeedback, doctorStats] = await Promise.all([
        apiService.getAppointments(),
        apiService.getPendingAppointments(),
        apiService.getDoctorFeedback(),
        apiService.getDoctorStats()
      ]);
      setAppointments(myAppointments);
      setAllPendingAppointments(pendingAppointments);
      setFeedback(doctorFeedback);
      setStats(doctorStats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId: number) => {
    try {
      await apiService.acceptAppointment(appointmentId);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to accept appointment:', error);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, status: string, prescription?: string) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, status, prescription);
      setShowStatusModal(false);
      setSelectedAppointment(null);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const myPendingCount = appointments.filter(apt => apt.status === 'Pending').length;
  const myConfirmedCount = appointments.filter(apt => apt.status === 'Confirmed').length;
  const myInProgressCount = appointments.filter(apt => apt.status === 'In Progress').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage patient appointments and track your performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          title="My Appointments"
          value={appointments.length.toString()}
          gradient="from-primary-500 to-primary-600"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          title="Completed"
          value={stats?.completed_appointments.toString() || '0'}
          gradient="from-secondary-500 to-secondary-600"
        />
        <StatCard
          icon={<Star className="h-6 w-6" />}
          title="Average Rating"
          value={stats?.average_rating ? `${stats.average_rating}/5` : 'N/A'}
          gradient="from-warning-500 to-warning-600"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Total Feedback"
          value={stats?.total_feedback.toString() || '0'}
          gradient="from-accent-500 to-accent-600"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatCard
          title="Confirmed Today"
          value={myConfirmedCount}
          icon={<ThumbsUp className="h-5 w-5" />}
          color="text-secondary-600"
          bgColor="bg-secondary-100 dark:bg-secondary-900"
        />
        <QuickStatCard
          title="In Progress"
          value={myInProgressCount}
          icon={<Clock className="h-5 w-5" />}
          color="text-warning-600"
          bgColor="bg-warning-100 dark:bg-warning-900"
        />
        <QuickStatCard
          title="Pending Requests"
          value={allPendingAppointments.length}
          icon={<AlertCircle className="h-5 w-5" />}
          color="text-error-600"
          bgColor="bg-error-100 dark:bg-error-900"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 shadow-medical">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex">
            <TabButton
              active={activeTab === 'mine'}
              onClick={() => setActiveTab('mine')}
              label="My Appointments"
              count={appointments.length}
            />
            <TabButton
              active={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
              label="Pending Requests"
              count={allPendingAppointments.length}
            />
            <TabButton
              active={activeTab === 'feedback'}
              onClick={() => setActiveTab('feedback')}
              label="Patient Feedback"
              count={feedback.length}
            />
          </nav>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'mine' && (
                <AppointmentsList 
                  appointments={appointments}
                  onUpdateStatus={(appointment) => {
                    setSelectedAppointment(appointment);
                    setShowStatusModal(true);
                  }}
                />
              )}
              {activeTab === 'pending' && (
                <PendingAppointmentsList 
                  appointments={allPendingAppointments}
                  onAccept={handleAcceptAppointment}
                />
              )}
              {activeTab === 'feedback' && (
                <FeedbackList 
                  feedback={feedback}
                  onViewDetails={(feedbackItem) => {
                    setSelectedAppointment(appointments.find(apt => apt.id === feedbackItem.appointment_id) || null);
                    setShowFeedbackModal(true);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && selectedAppointment && (
        <AppointmentStatusModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={handleUpdateStatus}
        />
      )}

      {showFeedbackModal && selectedAppointment && (
        <FeedbackModal
          appointment={selectedAppointment}
          feedback={feedback.find(f => f.appointment_id === selectedAppointment.id)}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

// Component definitions for better organization
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

interface QuickStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <div className={color}>{icon}</div>
      </div>
    </div>
  </div>
);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
      active
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
  >
    <span>{label}</span>
    <span className={`px-2 py-1 text-xs rounded-full ${
      active 
        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }`}>
      {count}
    </span>
  </button>
);

// Appointment Lists Components
interface AppointmentsListProps {
  appointments: Appointment[];
  onUpdateStatus: (appointment: Appointment) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, onUpdateStatus }) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No appointments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onUpdateStatus={() => onUpdateStatus(appointment)}
          showUpdateButton={appointment.status === 'Confirmed' || appointment.status === 'In Progress'}
        />
      ))}
    </div>
  );
};

interface PendingAppointmentsListProps {
  appointments: Appointment[];
  onAccept: (id: number) => void;
}

const PendingAppointmentsList: React.FC<PendingAppointmentsListProps> = ({ appointments, onAccept }) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No pending appointments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onAccept={() => onAccept(appointment.id)}
          showAcceptButton={true}
        />
      ))}
    </div>
  );
};

interface FeedbackListProps {
  feedback: Feedback[];
  onViewDetails: (feedback: Feedback) => void;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedback, onViewDetails }) => {
  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No feedback received yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((feedbackItem) => (
        <FeedbackCard
          key={feedbackItem.id}
          feedback={feedbackItem}
          onViewDetails={() => onViewDetails(feedbackItem)}
        />
      ))}
    </div>
  );
};

// Individual Card Components
interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: () => void;
  onAccept?: () => void;
  showUpdateButton?: boolean;
  showAcceptButton?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onUpdateStatus, 
  onAccept, 
  showUpdateButton = false, 
  showAcceptButton = false 
}) => (
  <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-700/50">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {showAcceptButton ? `Patient: ${appointment.patient_name}` : appointment.patient_name}
          </h3>
          <StatusBadge status={appointment.status} />
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
            <strong>Health Concern:</strong> {appointment.health_concern}
          </p>
        )}
        {appointment.prescription && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Prescription:</strong> {appointment.prescription}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Booked: {new Date(appointment.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex space-x-2">
        {showAcceptButton && (
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 text-sm font-medium"
          >
            Accept
          </button>
        )}
        {showUpdateButton && (
          <button
            onClick={onUpdateStatus}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 text-sm font-medium"
          >
            Update Status
          </button>
        )}
      </div>
    </div>
  </div>
);

interface FeedbackCardProps {
  feedback: Feedback;
  onViewDetails: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onViewDetails }) => (
  <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-700/50">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < feedback.rating
                    ? 'text-warning-500 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {feedback.rating}/5
          </span>
        </div>
        {feedback.comment && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            "{feedback.comment}"
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(feedback.created_at).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={onViewDetails}
        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1"
      >
        <Eye className="h-3 w-3" />
        <span>Details</span>
      </button>
    </div>
  </div>
);

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
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

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};