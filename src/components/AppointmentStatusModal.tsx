import React, { useState } from 'react';
import { X, Clock, FileText, Pill } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentStatusModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: (appointmentId: number, status: string, prescription?: string) => void;
}

export const AppointmentStatusModal: React.FC<AppointmentStatusModalProps> = ({
  appointment,
  onClose,
  onUpdate,
}) => {
  const [newStatus, setNewStatus] = useState(appointment.status);
  const [prescription, setPrescription] = useState(appointment.prescription || '');
  const [isLoading, setIsLoading] = useState(false);

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Confirmed':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      default:
        return currentStatus;
    }
  };

  const canUpdateStatus = (status: string) => {
    return status === 'Confirmed' || status === 'In Progress';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const nextStatus = getNextStatus(appointment.status);
      await onUpdate(
        appointment.id,
        nextStatus,
        nextStatus === 'Completed' ? prescription : undefined
      );
    } catch (error) {
      console.error('Failed to update appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStatus = getNextStatus(appointment.status);
  const showPrescriptionField = appointment.status === 'In Progress';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Update Appointment Status
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Appointment Details */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Appointment Details</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p><strong>Patient:</strong> {appointment.patient_name}</p>
              <p><strong>Date:</strong> {appointment.appointment_date}</p>
              <p><strong>Time:</strong> {appointment.appointment_time}</p>
              <p><strong>Current Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'Confirmed' 
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300'
                }`}>
                  {appointment.status}
                </span>
              </p>
              {appointment.health_concern && (
                <p><strong>Health Concern:</strong> {appointment.health_concern}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Next Status
              </label>
              <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-primary-800 dark:text-primary-300 font-medium">
                  {appointment.status} → {nextStatus}
                </span>
              </div>
            </div>

            {/* Prescription Field (only for In Progress → Completed) */}
            {showPrescriptionField && (
              <div>
                <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prescription Details
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="prescription"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    rows={4}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter prescription details including:&#10;• Medicine name(s)&#10;• Dosage instructions&#10;• Frequency of administration"
                    required={nextStatus === 'Completed'}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Required when marking appointment as completed
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !canUpdateStatus(appointment.status)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 disabled:opacity-50 font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  `Update to ${nextStatus}`
                )}
              </button>
            </div>
          </form>

          {/* Status Flow Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Status Flow
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• <strong>Confirmed</strong> → <strong>In Progress</strong>: Start the appointment</p>
              <p>• <strong>In Progress</strong> → <strong>Completed</strong>: Finish and add prescription</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};