import React, { useState, useEffect } from "react";

// Helper to format relative time (e.g., '2 days ago', 'in 3 days')
function formatRelativeTime(dateString: string, futureOk = false) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  if (diffMs < 0) {
    // Past
    if (Math.abs(diffDay) >= 1) return `${Math.abs(diffDay)} day${Math.abs(diffDay) > 1 ? 's' : ''} ago`;
    if (Math.abs(diffHour) >= 1) return `${Math.abs(diffHour)} hour${Math.abs(diffHour) > 1 ? 's' : ''} ago`;
    if (Math.abs(diffMin) >= 1) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) > 1 ? 's' : ''} ago`;
    return 'Just now';
  } else if (futureOk) {
    // Future
    if (diffDay >= 1) return `In ${diffDay} day${diffDay > 1 ? 's' : ''}`;
    if (diffHour >= 1) return `In ${diffHour} hour${diffHour > 1 ? 's' : ''}`;
    if (diffMin >= 1) return `In ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    return 'Soon';
  } else {
    return 'Just now';
  }
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  Heart,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Users,
} from "lucide-react";
import { auth, db } from "@/integrations/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

interface PersonalizedDashboardProps {
  onNavigateToGoals?: () => void;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ onNavigateToGoals }) => {
  const [openInfoBox, setOpenInfoBox] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Helper to get user's name
  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.demographics?.name) return user.demographics.name;
    if (user?.email) return user.email.split("@")[0];
    return "Friend";
  };

  useEffect(() => {
    // Collect unsubscribe functions for listeners
    const unsubscribes: (() => void)[] = [];
    fetchDashboardData(unsubscribes);
    const timeout = setTimeout(() => setTimedOut(true), 10000); // 10s timeout
    return () => {
      clearTimeout(timeout);
      // Cleanup all Firestore listeners
      if (Array.isArray(unsubscribes)) {
        unsubscribes.forEach(unsub => unsub());
      }
    };
  }, []);

  const fetchDashboardData = async (unsubscribes: (() => void)[]) => {
    setError(null);
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Fetch recent mood entries (limit 7)
      const moodsQ = query(
        collection(db, "mood_entries"),
        where("user_id", "==", currentUser.uid),
        orderBy("created_at", "desc"),
        limit(7)
      );
      const unsubscribeMoods = onSnapshot(moodsQ, (snapshot) => {
        setRecentMoods(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      unsubscribes.push(unsubscribeMoods);

      // Fetch active goals (limit 3, where is_completed == false)
      const goalsQ = query(
        collection(db, "wellness_goals"),
        where("user_id", "==", currentUser.uid),
        where("is_completed", "==", false),
        orderBy("created_at", "desc"),
        limit(3)
      );
      const unsubscribeGoals = onSnapshot(goalsQ, (snapshot) => {
        setActiveGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      unsubscribes.push(unsubscribeGoals);

      // Fetch recent achievements (limit 5)
      const achievementsQ = query(
        collection(db, "user_achievements"),
        where("user_id", "==", currentUser.uid),
        orderBy("earned_at", "desc"),
        limit(5)
      );
      const unsubscribeAchievements = onSnapshot(achievementsQ, (snapshot) => {
        setAchievements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      unsubscribes.push(unsubscribeAchievements);

      // Real-time listener for recent assessment completions (last 5)
      try {
        if (currentUser) {
          const assessmentsQ = query(
            collection(db, "assessment_responses"),
            where("user_id", "==", currentUser.uid),
            orderBy("completed_at", "desc"),
            limit(5)
          );
          const unsubscribeAssessments = onSnapshot(assessmentsQ, (snapshot) => {
            setRecentActivities(snapshot.docs.map(doc => ({
              id: doc.id,
              type: 'assessment',
              ...doc.data()
            })));
          });
          unsubscribes.push(unsubscribeAssessments);

          // Real-time listener for reminders/upcoming goals (due in next 7 days)
          const now = new Date();
          const weekAhead = new Date();
          weekAhead.setDate(now.getDate() + 7);
          const remindersQ = query(
            collection(db, "wellness_goals"),
            where("user_id", "==", currentUser.uid),
            where("due_date", ">=", now.toISOString()),
            where("due_date", "<=", weekAhead.toISOString()),
            orderBy("due_date", "asc"),
            limit(5)
          );
          const unsubscribeReminders = onSnapshot(remindersQ, (snapshot) => {
            setReminders(snapshot.docs.map(doc => ({
              id: doc.id,
              type: 'reminder',
              ...doc.data()
            })));
          });
          unsubscribes.push(unsubscribeReminders);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const averageMoodScore =
    recentMoods.length > 0
      ? recentMoods.reduce((sum, mood) => sum + mood.mood_score, 0) /
        recentMoods.length
      : 0;

  const personalizedContent = [
    {
      title: "Managing Stress Before Exams",
      description: "Learn effective techniques to reduce exam anxiety and improve focus.",
      type: "article",
      match: "Based on your recent stress assessment",
    },
    {
      title: "5-Minute Breathing Exercise",
      description: "Quick relaxation technique for busy students.",
      type: "exercise",
      match: "Recommended for mood improvement",
    },
    {
      title: "Building Healthy Sleep Habits",
      description: "Tips for better sleep quality and mental clarity.",
      type: "guide",
      match: "Popular among grade 8 students",
    },
  ];

  if (loading && !timedOut) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-2"></div>
        <span className="text-gray-500">Loading dashboard data...</span>
      </div>
    );
  }

  if (timedOut && loading) {
    return (
      <div className="text-center text-red-500 my-8">
        Loading is taking longer than expected. Please check your internet connection or
        try again later.
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 my-8">{error}</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 my-8">
        You must be logged in to view your wellness dashboard.
      </div>
    );
  }

  if (!recentMoods.length && !activeGoals.length && !achievements.length) {
    return (
      <div className="text-center text-gray-500 my-8">
        No wellness data found yet. Start by adding your first mood, goal, or achievement!
      </div>
    );
  
  // Main render
}

return (
  <div className="space-y-6">
    {/* Welcome Section */}
    <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
      <CardHeader>
        <CardTitle className="text-2xl text-teal-800">
          {`Welcome back, ${getUserName()}! 👋`}
        </CardTitle>
        <CardDescription className="text-teal-600">
          Here's your personalized wellness overview for today
        </CardDescription>
      </CardHeader>
    </Card>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900 average-mood-value" style={{fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', wordBreak: 'break-word', lineHeight: 1}}>
                {averageMoodScore.toFixed(1)}/10
              </p>
            </div>
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
        </CardContent>
      </Card>

      <Card
        onClick={onNavigateToGoals}
        tabIndex={0}
        role="button"
        aria-label="Go to Goals section"
        className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:outline-none hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200"
        style={{ userSelect: 'none' }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Active Goals</div>
              <div className="text-2xl font-bold text-gray-900" style={{lineHeight: 1}}>{activeGoals.length}</div>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{recentMoods.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* My Daily Dose of Positivity */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-500" />
          My Daily Dose of Positivity
        </CardTitle>
        <CardDescription>
          Personalized content just for you based on your progress and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {personalizedContent.map((content, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{content.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                <Badge variant="secondary" className="text-xs">
                  {content.match}
                </Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => setOpenInfoBox(index)}>
                Read More
              </Button>
            </div>
            {/* Info Box Modal */}
            {openInfoBox === index && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={() => setOpenInfoBox(null)}>
                <div
                  className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setOpenInfoBox(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h3 className="text-lg font-semibold mb-2 text-teal-800">{content.title}</h3>
                  <p className="text-gray-700 mb-2">{content.description}</p>
                  <Badge variant="secondary" className="text-xs mb-1">{content.match}</Badge>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Recent Achievements */}
    <Card>
      <CardHeader>
        <CardTitle>Recent Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <div key={index} className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{achievement.achievement_name}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No achievements yet. Keep engaging to earn your first badge!
          </p>
        )}
      </CardContent>
    </Card>
  </div>
);
}

export default PersonalizedDashboard;
