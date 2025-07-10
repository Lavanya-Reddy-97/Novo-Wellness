
import React from "react";
import Footer from "@/components/Footer";
import DashboardStats from "@/components/DashboardStats";
import PersonalizedDashboard from "@/components/personalized/PersonalizedDashboard";
import { useAuth } from "@/hooks/useAuth";

const StudentDashboard = () => {
  const { user } = useAuth();

  const getUserName = () => {
    return user?.demographics?.name || user?.email?.split("@")[0] || "Student";
  };

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {getUserName()}!
            </h1>
            <p className="text-lg text-gray-600">
              Track your mental health journey and access personalized resources.
            </p>
          </div>
          {/* Notification Banner for High Risk or Alerts */}
          {/* Replace these checks with real props/state as available */}
          {(window.localStorage.getItem('studentRiskLevel') === 'high' || Number(window.localStorage.getItem('unreadAlerts') || 0) > 0) && (
            <div className="flex items-center gap-3 bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 shadow-md" role="alert" aria-live="polite">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
              </svg>
              <span>
                <span className="font-bold">Important:</span> {window.localStorage.getItem('studentRiskLevel') === 'high' ? 'You are currently flagged as high risk. Please reach out to a counselor or trusted adult.' : ''}
                {Number(window.localStorage.getItem('unreadAlerts') || 0) > 0 ? `You have ${window.localStorage.getItem('unreadAlerts')} unread alert(s) or interventions. Please review them.` : ''}
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DashboardStats />
            </div>
            <div>
              <PersonalizedDashboard />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
