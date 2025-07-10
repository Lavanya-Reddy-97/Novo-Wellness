import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroGallery from "./HeroGallery";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Users, AlertTriangle, TrendingUp, Settings, FileText, Bell, Shield } from "lucide-react";
import { useTranslation } from 'react-i18next';
import WhatWeDoScroller from "./WhatWeDoScroller";

const Hero = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isManagement = user?.role === 'management';

  if (isManagement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Executive Header Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                School Mental Health <span className="text-blue-600">Management Portal</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive analytics and insights to support student mental health across your institution. 
                Monitor trends, track interventions, and make data-driven decisions with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard Preview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">2,847</div>
                <p className="text-green-600 text-sm font-medium">+12% from last term</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Assessments Completed</CardTitle>
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">1,945</div>
                <p className="text-green-600 text-sm font-medium">68% completion rate</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">High-Risk Students</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">127</div>
                <p className="text-red-600 text-sm font-medium">Requiring attention</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Intervention Success</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">84%</div>
                <p className="text-green-600 text-sm font-medium">Success rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8" />
                  <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-6">
                  Access comprehensive analytics, trend analysis, and detailed reports on student mental health metrics.
                </p>
                <Link to="/school-dashboard">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8" />
                  <CardTitle className="text-xl">Reports & Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-green-100 mb-6">
                  Generate detailed reports for stakeholders, track progress over time, and identify intervention opportunities.
                </p>
                <Link to="/reports">
                  <Button className="bg-white text-green-600 hover:bg-green-50 font-semibold">
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Bell className="h-8 w-8" />
                  <CardTitle className="text-xl">Alert Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100 mb-6">
                  Monitor high-risk students, set up automated alerts, and ensure timely interventions for student safety.
                </p>
                <Link to="/alerts">
                  <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold">
                    Manage Alerts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Professional Features Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comprehensive Mental Health Management
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform provides the tools and insights you need to create a supportive environment for student mental health.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Security & Privacy</h3>
                <p className="text-gray-600">
                  Enterprise-grade security with full FERPA compliance and anonymized reporting to protect student privacy.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Predictive Analytics</h3>
                <p className="text-gray-600">
                  Advanced AI algorithms help identify at-risk students early, enabling proactive intervention strategies.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Stakeholder Access</h3>
                <p className="text-gray-600">
                  Role-based access for administrators, counselors, and teachers with appropriate permission levels.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Monitoring</h3>
                <p className="text-gray-600">
                  Live dashboards with real-time updates on student assessments, risk levels, and intervention outcomes.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Crisis Prevention</h3>
                <p className="text-gray-600">
                  Automated alert system for high-risk situations with customizable notification workflows for staff.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Customizable Workflows</h3>
                <p className="text-gray-600">
                  Adapt the platform to your institution's specific protocols and intervention procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Your Mental Health <span className="text-blue-600">Matters</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                A safe space for students in grades 6-10 to understand, track, and improve their mental wellbeing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/assessment">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Take Assessment
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium"
                  >
                    View Resources
                  </Button>
                </Link>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>100% Private & Confidential - Your data is only shared with your school administrators to provide better support.</span>
              </div>
            </div>
            <div className="flex items-center justify-center h-full">
              <HeroGallery />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

function QuickActions() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Take Assessment</h3>
            <p className="text-gray-600 mb-4 text-center">Start your mental health journey with a quick, confidential assessment.</p>
            <Link to="/assessment">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">Take Assessment</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Browse Resources</h3>
            <p className="text-gray-600 mb-4 text-center">Access helpful resources and tools for mental wellbeing.</p>
            <Link to="/resources">
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">View Resources</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">View Progress</h3>
            <p className="text-gray-600 mb-4 text-center">Track your mental health journey and see your progress over time.</p>
            <Link to="/dashboard">
              <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HeroWithFeatures() {
  const { user } = useAuth();
  const isManagement = user?.role === 'management';

  return (
    <>
      <Hero />
      {!isManagement && (
        <div className="space-y-12">
          <WhatWeDoScroller />
          <QuickActions />
        </div>
      )}
    </>
  );
}
