import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Smile, TrendingUp, Calendar } from "lucide-react";
import { auth, db } from "@/integrations/firebase";
import {
  addDoc, getDocs, collection, query, where, orderBy
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState("");
  const { filterProfanity } = useProfanityFilter();
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const moodOptions = [
    { score: 1, label: "Terrible", emoji: "😢", color: "bg-red-500" },
    { score: 2, label: "Bad", emoji: "😞", color: "bg-red-400" },
    { score: 3, label: "Poor", emoji: "😕", color: "bg-orange-400" },
    { score: 4, label: "Below Average", emoji: "😐", color: "bg-yellow-400" },
    { score: 5, label: "Neutral", emoji: "😑", color: "bg-gray-400" },
    { score: 6, label: "Okay", emoji: "🙂", color: "bg-blue-400" },
    { score: 7, label: "Good", emoji: "😊", color: "bg-green-400" },
    { score: 8, label: "Great", emoji: "😄", color: "bg-green-500" },
    { score: 9, label: "Excellent", emoji: "😁", color: "bg-green-600" },
    { score: 10, label: "Amazing", emoji: "🤩", color: "bg-purple-500" },
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "mood_entries"),
          where("user_id", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMoodHistory(data);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to track your mood",
          variant: "destructive"
        });
        return;
      }

      const moodData = moodOptions.find(m => m.score === selectedMood);

      await addDoc(collection(db, "mood_entries"), {
        user_id: user.uid,
        mood_score: selectedMood,
        mood_label: moodData?.label || "",
        notes: moodNotes,
        created_at: new Date().toISOString()
      });

      toast({
        title: "Mood tracked!",
        description: "Your mood has been recorded successfully"
      });

      setSelectedMood(null);
      setMoodNotes("");
      fetchMoodHistory();

    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: "Failed to save mood entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = moodHistory
    .slice(0, 14)
    .reverse()
    .map(entry => ({
      day: new Date(entry.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      }),
      mood: entry.mood_score,
      label: entry.mood_label
    }));

  const averageMood = moodHistory.length > 0
    ? (moodHistory.reduce((sum, entry) => sum + entry.mood_score, 0) / moodHistory.length).toFixed(1)
    : 0;

  const getTrendDirection = () => {
    if (moodHistory.length < 2) return "neutral";
    const recent = moodHistory.slice(0, 7);
    const earlier = moodHistory.slice(7, 14);

    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length;
    const earlierAvg = earlier.length > 0
      ? earlier.reduce((sum, entry) => sum + entry.mood_score, 0) / earlier.length
      : recentAvg;

    if (recentAvg > earlierAvg + 0.5) return "up";
    if (recentAvg < earlierAvg - 0.5) return "down";
    return "stable";
  };

  return (
    <div className="space-y-6">
      {/* Mood Tracking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-blue-500" />
            How are you feeling today?
          </CardTitle>
          <CardDescription>
            Track your daily mood to identify patterns and trends over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Select your mood (1-10):</h4>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.score}
                  onClick={() => setSelectedMood(mood.score)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedMood === mood.score
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs font-medium">{mood.score}</div>
                  <div className="text-xs text-gray-600">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <Textarea
              placeholder="What's influencing your mood today? Any specific thoughts or events?"
              value={moodNotes}
              onChange={(e) => {
                const filteredText = filterProfanity(e.target.value);
                setMoodNotes(filteredText);
              }}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={saveMoodEntry} 
            disabled={!selectedMood || loading}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Mood Entry"}
          </Button>
        </CardContent>
      </Card>

      {/* Mood Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Mood</p>
                <p className="text-2xl font-bold text-gray-900">{averageMood}/10</p>
              </div>
              <Smile className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entries</p>
                <p className="text-2xl font-bold text-gray-900">{moodHistory.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trend</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`h-4 w-4 ${
                    getTrendDirection() === 'up' ? 'text-green-500' :
                    getTrendDirection() === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <span className="text-sm font-medium capitalize">{getTrendDirection()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mood Trends (Last 14 Days)</CardTitle>
            <CardDescription>
              Visualize your mood patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}/10 - ${chartData.find(d => d.mood === value)?.label}`, 'Mood'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Entries</CardTitle>
          <CardDescription>Your latest mood check-ins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {moodHistory.length > 0 ? (
            moodHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">
                  {moodOptions.find(m => m.score === entry.mood_score)?.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{entry.mood_score}/10 - {entry.mood_label}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              No mood entries yet. Start tracking your mood today!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;
