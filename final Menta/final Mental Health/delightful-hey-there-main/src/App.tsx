
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Resources from "./pages/Resources";
import WellnessDashboard from "./pages/WellnessDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProgressTracking from "./pages/ProgressTracking";
import MyAssessments from "./pages/MyAssessments";
import ProfileSettings from "./pages/ProfileSettings";
import BuddySafe from "./pages/BuddySafe";
import { AcademicPressureSafety, CyberbullyingSafety, SubstanceAbuseViolenceAwareness, SexualHarassmentAwareness } from "./pages/safety";
import CognitiveTasks from "./pages/CognitiveTasks";
import AlertsPage from "./pages/alerts";
import ReportsPage from "./pages/ReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SchoolSettings from "./pages/SchoolSettings";
import ChatPage from "./pages/ChatPage";

// Components
import { ProfanityFilterProvider } from "@/components/profanity-filter-provider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FloatingActionButton from "@/components/FloatingActionButton";
import { AppLayout } from "@/components/AppLayout";
import usePageTitle from "@/hooks/usePageTitle";

const queryClient = new QueryClient();

// Component to handle page title updates
const PageTitleHandler = () => {
  usePageTitle(); // This will use the current route to set the title
  return null;
};

const App = () => {
  const AppContent = () => (
    <>
      <PageTitleHandler />
      <Routes>
        {/* Auth route - no layout */}
        <Route path="/auth" element={<Auth />} />
        
        {/* All routes with layout */}
        <Route element={<AppLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/resources/*" element={<Resources />} />
          
          {/* Safety pages */}
          <Route path="/safety/cyberbullying" element={<CyberbullyingSafety />} />
          <Route path="/safety/substance-abuse-violence" element={<SubstanceAbuseViolenceAwareness />} />
          <Route path="/safety/academic-pressure" element={<AcademicPressureSafety />} />
          <Route path="/safety/sexual-harassment" element={<SexualHarassmentAwareness />} />
          
          {/* Protected student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/wellness-dashboard" element={<WellnessDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/progress-tracking" element={<ProgressTracking />} />
            <Route path="/my-assessments" element={<MyAssessments />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/cognitive-tasks" element={<CognitiveTasks />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          
          {/* Shared routes for both student and management */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'management']} />}>
            <Route path="/buddysafe" element={<BuddySafe />} />
          </Route>
          
          {/* Protected management routes */}
          <Route element={<ProtectedRoute allowedRoles={['management']} />}>
            <Route path="/school-dashboard" element={<SchoolDashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/:category" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/school-settings" element={<SchoolSettings />} />
          </Route>
          
          {/* Fallback routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <ProfanityFilterProvider>
        <BrowserRouter>
          <AppContent />
          <FloatingActionButton />
        </BrowserRouter>
      </ProfanityFilterProvider>
    </QueryClientProvider>
  );
};

export default App;
