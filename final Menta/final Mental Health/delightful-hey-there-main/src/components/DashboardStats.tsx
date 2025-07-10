
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Heart, Target, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DashboardStats = () => {
  const navigate = useNavigate();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m here to help you find mental health resources. How can I assist you today?' }
  ]);

  const handleTakeAssessment = () => {
    navigate('/assessment');
  };

  const handleContactCounselor = () => {
    navigate('/wellness#counselor-section');
  };

  const handleBrowseResources = () => {
    setIsChatbotOpen(true);
    // You can add logic here to fetch AI resources based on user's mental health state
  };

  const handleSendMessage = (message: string) => {
    // This is a simplified version - you'll need to integrate with an actual AI service
    const newMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages);
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Based on your current state, I recommend checking out our guided meditation resources and connecting with a counselor for personalized support.'
      }]);
    }, 1000);
  };
  // Real-time stats state
  const { user } = useAuth();
  const [overallWellbeing, setOverallWellbeing] = useState<string>("-");
  const [wellbeingProgress, setWellbeingProgress] = useState<number>(0);
  const [weeklySessions, setWeeklySessions] = useState<number>(0);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(5);
  const [weeklyProgress, setWeeklyProgress] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [nextAssessmentDays, setNextAssessmentDays] = useState<number | null>(null);
  const [nextAssessmentProgress, setNextAssessmentProgress] = useState<number>(0);
  // Icon/color mapping for UI
  const statIcons = { wellbeing: Heart, sessions: Target, streak: TrendingUp, assessment: Calendar };
  const statColors = { wellbeing: "text-green-600", sessions: "text-blue-600", streak: "text-purple-600", assessment: "text-orange-600" };

  // --- Real-time Firestore listeners ---
  useEffect(() => {
    if (!user) return;

    // 1. Listen to assessment_responses
    const assessmentsQ = query(
      collection(db, "assessment_responses"),
      where("user_id", "==", user.uid),
      orderBy("completed_at", "desc")
    );
    const unsubAssessments = onSnapshot(assessmentsQ, (snapshot) => {
      const assessments = snapshot.docs.map(doc => doc.data());
      console.log('[DashboardStats] Firestore returned:', assessments);
      if (assessments.length > 0) {
        // Latest assessment
        const latest = assessments[0];
        // Use 'score' if present, else average results fields
        let score = latest.score;
        if (score === undefined && latest.results) {
          const vals = ['depression', 'stress', 'anxiety', 'wellbeing'].map(k => Number(latest.results?.[k])).filter(v => !isNaN(v));
          score = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
        }
        if (score === undefined) score = 0;
        setWellbeingProgress(Math.round(score));
        // Map score to label
        let label = "N/A";
        if (score >= 75) label = "Good";
        else if (score >= 50) label = "Average";
        else if (score > 0) label = "Poor";
        setOverallWellbeing(label);
        // Next assessment: monthly from last completed_at
        const lastDate = latest.completed_at ? new Date(latest.completed_at) : new Date();
        const now = new Date();
        const next = new Date(lastDate);
        next.setMonth(next.getMonth() + 1);
        const days = Math.max(0, Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        setNextAssessmentDays(days);
        // Progress toward next assessment
        const daysSince = Math.max(0, Math.ceil((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
        setNextAssessmentProgress(Math.min(100, Math.round((daysSince / 30) * 100)));
      } else {
        setWellbeingProgress(0);
        setOverallWellbeing("N/A");
        setNextAssessmentDays(null);
        setNextAssessmentProgress(0);
      }
    });

    // 2. Listen to mindfulness_sessions for this week
    const startOfWeek = (() => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
      return new Date(now.setDate(diff));
    })();
    const sessionsQ = query(
      collection(db, "mindfulness_sessions"),
      where("user_id", "==", user.uid),
      where("completed_at", ">=", startOfWeek.toISOString())
    );
    const unsubSessions = onSnapshot(sessionsQ, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data());
      setWeeklySessions(sessions.length);
      setWeeklyProgress(Math.min(100, Math.round((sessions.length / weeklyGoal) * 100)));
    });

    // 3. Listen to check_ins for streak calculation
    const checkinsQ = query(
      collection(db, "check_ins"),
      where("user_id", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsubCheckins = onSnapshot(checkinsQ, (snapshot) => {
      const checkins = snapshot.docs.map(doc => doc.data());
      // Calculate streak: number of consecutive days with a check-in
      let currentStreak = 0;
      let prev = new Date();
      for (const entry of checkins) {
        const entryDate = new Date(entry.date);
        if (
          currentStreak === 0 ||
          (prev.getDate() - entryDate.getDate() === 1 && prev.getMonth() === entryDate.getMonth() && prev.getFullYear() === entryDate.getFullYear())
        ) {
          currentStreak++;
          prev = entryDate;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    });

    return () => {
      unsubAssessments();
      unsubSessions();
      unsubCheckins();
    };
  }, [user, weeklyGoal]);


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Dashboard</h2>
        <p className="text-gray-600">Here's how you're doing with your mental health journey</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Wellbeing */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Wellbeing</CardTitle>
            <Heart className={`h-4 w-4 ${statColors.wellbeing}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overallWellbeing}</div>
            <p className="text-xs text-muted-foreground mb-3">Based on your recent assessments</p>
            <Progress value={wellbeingProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{wellbeingProgress}% complete</p>
          </CardContent>
        </Card>
        {/* Weekly Progress */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Target className={`h-4 w-4 ${statColors.sessions}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{weeklySessions}/{weeklyGoal}</div>
            <p className="text-xs text-muted-foreground mb-3">Mindfulness sessions completed</p>
            <Progress value={weeklyProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{weeklyProgress}% complete</p>
          </CardContent>
        </Card>
        {/* Streak */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <TrendingUp className={`h-4 w-4 ${statColors.streak}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{streak} days</div>
            <p className="text-xs text-muted-foreground mb-3">Consistent daily check-ins</p>
            <Progress value={Math.min(100, streak * 10)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{streak} day streak</p>
          </CardContent>
        </Card>
        {/* Next Assessment */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Assessment</CardTitle>
            <Calendar className={`h-4 w-4 ${statColors.assessment}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{nextAssessmentDays !== null ? `${nextAssessmentDays} days` : '-'}</div>
            <p className="text-xs text-muted-foreground mb-3">Monthly wellbeing check</p>
            <Progress value={nextAssessmentProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{nextAssessmentProgress}% to next assessment</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-800">Quick Actions</CardTitle>
          <CardDescription className="text-teal-600">
            Take care of your mental health today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleTakeAssessment}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Take Assessment
            </Button>
            <Button 
              onClick={handleBrowseResources}
              variant="outline" 
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              Browse Resources
            </Button>
            <Button 
              onClick={handleContactCounselor}
              variant="outline" 
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              Contact Counselor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chatbot Modal */}
      <Dialog open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              Mental Health Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-teal-100 text-teal-900' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleSendMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (input?.value.trim()) {
                handleSendMessage(input.value);
                input.value = '';
              }
            }}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardStats;
