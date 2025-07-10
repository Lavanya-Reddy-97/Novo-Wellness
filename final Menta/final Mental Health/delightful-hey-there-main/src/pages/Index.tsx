
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import TopicsGrid from "@/components/TopicsGrid";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const isManagement = user?.role === 'management';

  useEffect(() => {
    document.title = "Home – Novo Wellness";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      {!isManagement && (
        <>
          <Features />
          {/* Onboarding / How to Use Section - Only for non-management users */}
          <section className="w-full flex justify-center py-10 px-2">
            <div className="max-w-3xl w-full bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 rounded-2xl shadow-lg p-8 flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">How to Use Novo Wellness</h2>
              <ol className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <span className="font-semibold text-blue-800">1. Explore Features:</span> Discover assessments, resources, support, and progress tracking tailored for you.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <span className="font-semibold text-blue-800">2. Take Assessments:</span> Start a mental health check-in or browse wellness tips to begin your journey.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <span className="font-semibold text-blue-800">3. Get Support:</span> Explore Buddy Safe for confidential reporting.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <span className="font-semibold text-blue-800">4. Track Progress:</span> Monitor your wellbeing with easy-to-read dashboards and celebrate your growth!
                  </div>
                </li>
              </ol>
            </div>
          </section>
          <Footer />
        </>
      )}
      {isManagement && <Footer />}
    </div>
  );
};

export default Index;
