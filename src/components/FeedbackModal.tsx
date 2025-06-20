import React from 'react';
import { X, Star, Calendar, Clock, User, FileText } from 'lucide-react';
import { Appointment, Feedback } from '../types';

interface FeedbackModalProps {
  appointment: Appointment;
  feedback?: Feedback;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  appointment,
  feedback,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Appointment Feedback
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
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Appointment Details
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span><strong>Patient:</strong> {appointment.patient_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span><strong>Date:</strong> {appointment.appointment_date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span><strong>Time:</strong> {appointment.appointment_time}</span>
              </div>
              {appointment.health_concern && (
                <p><strong>Health Concern:</strong> {appointment.health_concern}</p>
              )}
              {appointment.prescription && (
                <p><strong>Prescription:</strong> {appointment.prescription}</p>
              )}
            </div>
          </div>

          {/* Feedback Details */}
          {feedback ? (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
              <h3 className="font-medium text-primary-900 dark:text-primary-300 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Patient Feedback
              </h3>
              
              {/* Rating Display */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-primary-800 dark:text-primary-300">Rating:</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < feedback.rating
                          ? 'text-warning-500 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                  {feedback.rating}/5
                </span>
              </div>

              {/* Comment */}
              {feedback.comment && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-primary-800 dark:text-primary-300 block mb-1">
                    Comment:
                  </span>
                  <p className="text-sm text-primary-700 dark:text-primary-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-primary-200 dark:border-primary-700">
                    "{feedback.comment}"
                  </p>
                </div>
              )}

              {/* Feedback Date */}
              <p className="text-xs text-primary-600 dark:text-primary-400">
                Submitted on: {new Date(feedback.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No feedback submitted for this appointment yet.</p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};