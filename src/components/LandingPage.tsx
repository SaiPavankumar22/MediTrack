import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  Star,
  ArrowRight,
  Activity,
  FileText,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl shadow-medical-lg">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                MediTrack Lite
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">Real-Time Clinic Management</p>
            </div>
          </div>
          
          <h2 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Modern Healthcare
            <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline appointments, enhance patient care, and optimize clinic operations with our 
            intuitive platform designed for both patients and healthcare professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 shadow-medical-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Modern Healthcare
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive tools designed to enhance patient experience and streamline clinical workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Clock className="h-8 w-8" />}
            title="Real-Time Scheduling"
            description="Book and manage appointments instantly with our intelligent scheduling system that prevents conflicts and optimizes availability."
            gradient="from-primary-500 to-primary-600"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Secure & Private"
            description="Enterprise-grade security with encrypted data storage and HIPAA-compliant privacy protection for all patient information."
            gradient="from-secondary-500 to-secondary-600"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Role-Based Access"
            description="Tailored experiences for patients and healthcare providers with appropriate permissions and specialized dashboards."
            gradient="from-accent-500 to-accent-600"
          />
          <FeatureCard
            icon={<Activity className="h-8 w-8" />}
            title="Live Updates"
            description="Real-time notifications and status updates keep everyone informed about appointment changes and confirmations."
            gradient="from-warning-500 to-warning-600"
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Digital Records"
            description="Comprehensive digital health records with easy access to appointment history and medical notes."
            gradient="from-medical-teal-500 to-medical-teal-600"
          />
          <FeatureCard
            icon={<Award className="h-8 w-8" />}
            title="Quality Feedback"
            description="Patient feedback system with ratings and reviews to maintain high standards of care and continuous improvement."
            gradient="from-success-500 to-success-600"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm border border-gray-200 dark:border-slate-700">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Healthcare Professionals
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of satisfied users who have transformed their practice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatCard number="10,000+" label="Active Users" icon={<Users className="h-8 w-8" />} />
          <StatCard number="50,000+" label="Appointments Booked" icon={<Calendar className="h-8 w-8" />} />
          <StatCard number="99.9%" label="Uptime Guarantee" icon={<TrendingUp className="h-8 w-8" />} />
          <StatCard number="4.9/5" label="Average Rating" icon={<Star className="h-8 w-8" />} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How MediTrack Works
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Simple steps to get started with modern healthcare management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            step="1"
            title="Create Your Account"
            description="Sign up as a patient or healthcare provider with secure authentication and role-based access."
            icon={<Users className="h-12 w-12" />}
          />
          <StepCard
            step="2"
            title="Schedule & Manage"
            description="Book appointments, track status updates, and manage your healthcare journey with real-time notifications."
            icon={<Calendar className="h-12 w-12" />}
          />
          <StepCard
            step="3"
            title="Complete & Review"
            description="Attend appointments, receive prescriptions, and provide feedback to maintain quality care standards."
            icon={<CheckCircle className="h-12 w-12" />}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl text-white">
        <div className="max-w-4xl mx-auto px-8">
          <Heart className="h-16 w-16 mx-auto mb-8 opacity-90 animate-bounce-gentle" />
          <h3 className="text-4xl font-bold mb-6">
            Ready to Transform Your Healthcare Experience?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join MediTrack Lite today and experience the future of clinic management. 
            Start with our comprehensive platform designed for modern healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl bg-white text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-white text-white hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-slate-700 hover:shadow-medical-lg transition-all duration-300 transform hover:-translate-y-2 group">
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

interface StatCardProps {
  number: string;
  label: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, icon }) => {
  return (
    <div className="text-center group">
      <div className="inline-flex p-3 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{number}</div>
      <div className="text-gray-600 dark:text-gray-300 font-medium">{label}</div>
    </div>
  );
};

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, icon }) => {
  return (
    <div className="text-center group">
      <div className="relative mb-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {step}
        </div>
      </div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};