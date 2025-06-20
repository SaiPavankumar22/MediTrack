import React, { useState } from 'react';
import { Stethoscope, Heart, Shield, Clock } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MediTrack Lite
                </h1>
                <p className="text-gray-600 text-sm">Real-Time Clinic Management</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Modern Healthcare Management
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Streamline appointments, enhance patient care, and optimize clinic operations with our intuitive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Real-Time Scheduling</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Book and manage appointments instantly with our real-time scheduling system.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Secure & Private</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Your health data is protected with enterprise-grade security measures.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Patient-Centered</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Designed with both patients and healthcare providers in mind.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Role-Based Access</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Tailored experiences for patients and medical professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex items-center justify-center">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};