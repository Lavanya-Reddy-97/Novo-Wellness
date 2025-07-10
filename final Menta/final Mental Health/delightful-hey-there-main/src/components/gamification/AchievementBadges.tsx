
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Trophy, Heart, Target, BookOpen, Users, Calendar } from "lucide-react";

import { db, auth } from "@/integrations/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const AchievementBadges = () => {
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setUserAchievements([]);
          setLoading(false);
          return;
        }
        const q = query(
          collection(db, "user_achievements"),
          where("user_id", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserAchievements(achievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setUserAchievements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const availableBadges = [
    {
      id: "first_assessment",
      name: "First Steps",
      description: "Completed your first mental health assessment",
      icon: "🌟",
      category: "Assessment",
      requirement: "Complete 1 assessment"
    },
    {
      id: "assessment_streak_7",
      name: "Consistent Checker",
      description: "Completed assessments for 7 consecutive days",
      icon: "📊",
      category: "Assessment",
      requirement: "7-day assessment streak"
    },
    {
      id: "mood_tracker_week",
      name: "Mood Master",
      description: "Tracked your mood for 7 consecutive days",
      icon: "😊",
      category: "Mood",
      requirement: "Track mood for 7 days"
    },
    {
      id: "journal_writer",
      name: "Thoughtful Writer",
      description: "Written 10 journal entries",
      icon: "📝",
      category: "Journal",
      requirement: "Write 10 journal entries"
    },
    {
      id: "goal_achiever",
      name: "Goal Getter",
      description: "Completed your first wellness goal",
      icon: "🎯",
      category: "Goals",
      requirement: "Complete 1 wellness goal"
    },
    {
      id: "wellness_warrior",
      name: "Wellness Warrior",
      description: "Used the platform for 30 consecutive days",
      icon: "🏆",
      category: "Engagement",
      requirement: "30-day platform streak"
    },
    {
      id: "resource_explorer",
      name: "Resource Explorer",
      description: "Explored all available resources",
      icon: "🗺️",
      category: "Learning",
      requirement: "Visit all resource sections"
    }
  ];

  useEffect(() => {
    fetchAchievements();
    fetchUserStats();
  }, []);

  const fetchAchievements = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, 'user_achievements'),
        where('user_id', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      setUserAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
  }
};

  const fetchUserStats = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const [assessmentsSnap, moodsSnap, journalsSnap, goalsSnap] = await Promise.all([
        getDocs(query(collection(db, 'assessment_responses'), where('user_id', '==', user.uid))),
        getDocs(query(collection(db, 'mood_entries'), where('user_id', '==', user.uid))),
        getDocs(query(collection(db, 'journal_entries'), where('user_id', '==', user.uid))),
        getDocs(query(collection(db, 'wellness_goals'), where('user_id', '==', user.uid)))
      ]);
      setUserStats({
        assessments: assessmentsSnap.size,
        moods: moodsSnap.size,
        journals: journalsSnap.size,
        goals: goalsSnap.size
      });
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
  } finally {
    setLoading(false);
  }
};

  const checkAndAwardBadges = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const earnedBadgeIds = userAchievements.map(a => a.achievement_type);
  const newBadges = [];

  // Check each badge requirement
  if (!earnedBadgeIds.includes("first_assessment") && userStats.assessments >= 1) {
    newBadges.push({
      user_id: user.uid,
      achievement_type: "first_assessment",
      achievement_name: "First Steps",
      description: "Completed your first mental health assessment"
    });
  }

  if (!earnedBadgeIds.includes("mood_tracker_week") && userStats.moods >= 7) {
    newBadges.push({
      user_id: user.uid,
      achievement_type: "mood_tracker_week",
      achievement_name: "Mood Master",
      description: "Tracked your mood for 7 consecutive days"
    });
  }

  if (!earnedBadgeIds.includes("journal_writer") && userStats.journals >= 10) {
    newBadges.push({
      user_id: user.uid,
      achievement_type: "journal_writer",
      achievement_name: "Thoughtful Writer",
      description: "Written 10 journal entries"
    });
  }

  // Award new badges
  if (newBadges.length > 0) {
    await Promise.all(newBadges.map(badge => addDoc(collection(db, 'user_achievements'), badge)));
    fetchAchievements(); // Refresh achievements
  }
};

  useEffect(() => {
    if (userStats && Object.keys(userStats).length > 0) {
      checkAndAwardBadges();
    }
  }, [userStats]);

  const getProgressForBadge = (badge: any) => {
    switch (badge.id) {
      case "first_assessment":
        return Math.min((userStats.assessments / 1) * 100, 100);
      case "mood_tracker_week":
        return Math.min((userStats.moods / 7) * 100, 100);
      case "journal_writer":
        return Math.min((userStats.journals / 10) * 100, 100);
  
      default:
        return 0;
    }
  };

  const isBadgeEarned = (badgeId: string) => {
    return userAchievements.some(a => a.achievement_type === badgeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Achievement Dashboard
          </CardTitle>
          <CardDescription className="text-yellow-800">
            Track your wellness journey milestones and earn badges for your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">{userAchievements.length}</div>
              <div className="text-sm text-yellow-600">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">{userStats.assessments}</div>
              <div className="text-sm text-yellow-600">Assessments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">{userStats.moods}</div>
              <div className="text-sm text-yellow-600">Mood Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">{userStats.journals}</div>
              <div className="text-sm text-yellow-600">Journal Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-500" />
            Your Earned Badges
          </CardTitle>
          <CardDescription>
            Congratulations on your achievements!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements.map((achievement) => {
                const badge = availableBadges.find(b => b.id === achievement.achievement_type);
                return (
                  <div key={achievement.id} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{badge?.icon || "🏆"}</div>
                      <h3 className="font-semibold text-green-900">{achievement.achievement_name}</h3>
                      <p className="text-sm text-green-700 mt-1">{achievement.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No badges earned yet.</p>
              <p className="text-sm text-gray-400">Keep engaging with the platform to earn your first badge!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-500" />
            Available Badges
          </CardTitle>
          <CardDescription>
            Work towards these achievements to unlock more badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBadges.map((badge) => {
              const earned = isBadgeEarned(badge.id);
              const progress = getProgressForBadge(badge);
              
              return (
                <div 
                  key={badge.id} 
                  className={`p-4 rounded-lg border ${
                    earned 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl ${earned ? '' : 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${earned ? 'text-green-900' : 'text-gray-700'}`}>
                          {badge.name}
                        </h3>
                        {earned && <Badge variant="secondary">Earned</Badge>}
                      </div>
                      <p className={`text-sm ${earned ? 'text-green-700' : 'text-gray-600'} mb-2`}>
                        {badge.description}
                      </p>
                      <Badge variant="outline" className="text-xs mb-3">
                        {badge.category}
                      </Badge>
                      {!earned && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{badge.requirement}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Categories</CardTitle>
          <CardDescription>
            Different ways to earn recognition for your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Heart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Mood & Wellness</h4>
              <p className="text-sm text-blue-700">Track emotions and wellbeing</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">Learning & Growth</h4>
              <p className="text-sm text-purple-700">Engage with resources</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Goals & Progress</h4>
              <p className="text-sm text-green-700">Achieve wellness goals</p>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementBadges;
