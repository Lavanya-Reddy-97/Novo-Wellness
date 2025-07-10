import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardList, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
// Supabase code removed. This file is deprecated and should be replaced with Firebase implementation.

const MyAssessments = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "assessment_responses"),
      where("user_id", "==", user.uid),
      orderBy("completed_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('[MyAssessments] Firestore returned:', data);
      setAssessments(data || []);
      setLoading(false);
    }, (error) => {
      console.error('Error loading assessments:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      depression: "bg-red-100 text-red-800",
      stress: "bg-orange-100 text-orange-800",
      anxiety: "bg-yellow-100 text-yellow-800",
      adhd: "bg-blue-100 text-blue-800",
      wellbeing: "bg-green-100 text-green-800",
      overall: "bg-purple-100 text-purple-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assessments</h1>
            <p className="text-lg text-gray-600">
              View your assessment history and track your mental health journey
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Completed assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assessments.filter(a => 
                    new Date(a.completed_at).getMonth() === new Date().getMonth()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recent assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assessments.length > 0 
                    ? new Date(assessments[0].completed_at).toLocaleDateString()
                    : "None"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                Detailed view of all your completed assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start your mental health journey by taking your first assessment.
                  </p>
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    Take Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment, index) => (
                    <div key={assessment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Assessment #{assessments.length - index}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(assessment.completed_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(assessment.completed_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Categories Assessed:</h4>
                        <div className="flex flex-wrap gap-2">
                          {assessment.categories.map((category: string) => (
                            <Badge 
                              key={category} 
                              variant="secondary"
                              className={getCategoryBadgeColor(category)}
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Questions Answered:</h4>
                        <p className="text-sm text-gray-600">
                          {Object.keys(assessment.responses || {}).length} questions completed
                        </p>
                      </div>

                      {assessment.results && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Scores:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(assessment.results).map(([category, score]) => (
                              <div key={category} className="text-center">
                                <div className="text-lg font-bold text-gray-900">{score as number}%</div>
                                <div className="text-xs text-gray-600 capitalize">{category}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-800">Ready for Your Next Assessment?</CardTitle>
              <CardDescription className="text-teal-600">
                Regular assessments help track your mental health progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-teal-500 hover:bg-teal-600">
                  Take New Assessment
                </Button>
                <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                  View Progress
                </Button>
                <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                  Browse Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyAssessments;
