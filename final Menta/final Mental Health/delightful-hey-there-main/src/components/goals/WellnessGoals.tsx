import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Plus, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";

import { db, auth } from "@/integrations/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const WellnessGoals = () => {
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<{
    title: string;
    description: string;
    target_frequency: string;
    emoji: string;
  }>({ title: '', description: '', target_frequency: 'daily', emoji: '🎯' });

  // Handler to start editing a goal
  const handleEditGoal = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditGoal({
      title: goal.title,
      description: goal.description,
      target_frequency: goal.target_frequency,
      emoji: goal.emoji,
    });
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditGoal({ title: '', description: '', target_frequency: 'daily', emoji: '🎯' });
  };

  // Handler to save the edited goal
  const handleSaveEdit = async (goalId: string) => {
    try {
      await updateDoc(doc(db, "wellness_goals", goalId), {
        title: filterProfanity(editGoal.title.trim()),
        description: filterProfanity(editGoal.description.trim()),
        target_frequency: editGoal.target_frequency,
        emoji: editGoal.emoji,
      });
      setGoals(goals.map(goal => goal.id === goalId ? {
        ...goal,
        title: filterProfanity(editGoal.title.trim()),
        description: filterProfanity(editGoal.description.trim()),
        target_frequency: editGoal.target_frequency,
        emoji: editGoal.emoji,
      } : goal));
      setEditingGoalId(null);
      setEditGoal({ title: '', description: '', target_frequency: 'daily', emoji: '🎯' });
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  // Loading state for suggestions
  const [suggestionLoading, setSuggestionLoading] = useState<string | null>(null);

  // Handler to use a suggested goal
  const handleUseSuggestedGoal = async (suggested: { title: string; description: string; target_frequency: string; emoji: string }) => {
    setSuggestionLoading(suggested.title);
    const user = auth.currentUser;
    if (!user) return;
    try {
      const filteredTitle = filterProfanity(suggested.title.trim());
      const filteredDesc = filterProfanity(suggested.description.trim());
      const docRef = await addDoc(collection(db, "wellness_goals"), {
        user_id: user.uid,
        title: filteredTitle,
        description: filteredDesc,
        target_frequency: suggested.target_frequency,
        emoji: suggested.emoji,
        is_completed: false,
        created_at: serverTimestamp(),
        streak_count: 0,
        completed_count: 0,
      });
      await fetchGoals();
      toast({
        title: 'Goal Added',
        description: 'The suggested goal was added to your goals.',
        variant: 'default',
      });
    } catch (error) {
      console.error("Error adding suggested goal:", error);
    } finally {
      setSuggestionLoading(null);
    }
  };

  const [goals, setGoals] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const { filterProfanity } = useProfanityFilter();
  const [loading, setLoading] = useState(true);
  const [titleChars, setTitleChars] = useState(0);
  const [descChars, setDescChars] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const emojiOptions = ["🎯", "🧘", "😴", "💪", "📚", "🥗", "🏃", "😊", "🌱", "📝"];

  type NewGoal = {
    title: string;
    description: string;
    target_frequency: string;
    emoji: string;
  };

  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: "",
    description: "",
    target_frequency: "daily",
    emoji: "🎯"
  });

  const { toast } = useToast();

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setGoals([]);
        setLoading(false);
        return;
      }
      const q = query(collection(db, "wellness_goals"), where("user_id", "==", user.uid));
      const snapshot = await getDocs(q);
      const goalsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(goalsList);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const calculateFormProgress = () => {
    let filled = 0;
    if (newGoal.title.trim().length > 0) filled++;
    if (newGoal.description.trim().length > 0) filled++;
    if (newGoal.target_frequency) filled++;
    if (newGoal.emoji) filled++;
    return (filled / 4) * 100;
  };

  useEffect(() => {
    setFormProgress(calculateFormProgress());
  }, [newGoal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const filteredValue = name === 'title' || name === 'description' 
      ? filterProfanity(value) 
      : value;

    setNewGoal(prev => ({
      ...prev,
      [name]: filteredValue
    }));

    if (name === 'title') setTitleChars(filteredValue.length);
    if (name === 'description') setDescChars(filteredValue.length);

    setFormProgress(calculateFormProgress());
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, "wellness_goals", goalId));
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleAddGoal = async () => {
    const user = auth.currentUser;
    if (!user || !newGoal.title.trim()) return;
    try {
      const filteredTitle = filterProfanity(newGoal.title.trim());
      const filteredDesc = filterProfanity(newGoal.description.trim());
      await addDoc(collection(db, "wellness_goals"), {
        user_id: user.uid,
        title: filteredTitle,
        description: filteredDesc,
        target_frequency: newGoal.target_frequency,
        emoji: newGoal.emoji,
        is_completed: false,
        created_at: serverTimestamp(),
        streak_count: 0,
        completed_count: 0,
      });
      setNewGoal({ title: "", description: "", target_frequency: "daily", emoji: "🎯" });
      setShowAddForm(false);
      fetchGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };


  const handleToggleComplete = async (goalId: string, isCompleted: boolean) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      let updates: any = { is_completed: !isCompleted };
      let newStreak = goal.streak_count || 0;
      let newCompleted = goal.completed_count || 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      let lastCompletedAt = goal.last_completed_at ? new Date(goal.last_completed_at.seconds ? goal.last_completed_at.seconds * 1000 : goal.last_completed_at) : null;
      if (!isCompleted) {
        // Marking as complete
        newCompleted += 1;
        if (lastCompletedAt) {
          const diffDays = Math.floor((today.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        updates.completed_count = newCompleted;
        updates.streak_count = newStreak;
        updates.last_completed_at = new Date();
      } else {
        // Marking as incomplete: don't increment
      }
      await updateDoc(doc(db, "wellness_goals", goalId), updates);
      setGoals(goals.map(goal => goal.id === goalId ? { ...goal, ...updates } : goal));
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="text-green-500 w-5 h-5" />
              My Wellness Goals
            </CardTitle>
            <CardDescription>
              Set and track personal mental wellness goals to build healthy habits
            </CardDescription>
          </div>
          <Button variant="default" onClick={() => setShowAddForm(v => !v)}>
            <Plus className="w-4 h-4 mr-1" /> Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <Input
                  name="title"
                  placeholder="Goal title (e.g. Meditate for 10 minutes )"
                  value={newGoal.title}
                  onChange={handleInputChange}
                  maxLength={50}
                  className="flex-1"
                />
                <Select
                  value={newGoal.emoji}
                  onValueChange={emoji => setNewGoal(prev => ({ ...prev, emoji }))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue>{newGoal.emoji}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {emojiOptions.map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newGoal.target_frequency}
                  onValueChange={target_frequency => setNewGoal(prev => ({ ...prev, target_frequency }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>{newGoal.target_frequency}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                name="description"
                placeholder="Describe your goal..."
                value={newGoal.description}
                onChange={handleInputChange}
                maxLength={120}
                rows={2}
                className="mb-2"
              />
              <div className="flex items-center gap-2 mb-2">
                <Progress value={formProgress} className="w-32 h-2" />
                <span className="text-xs text-gray-400">{formProgress === 100 ? "Ready to add!" : "Complete all fields"}</span>
              </div>
              <div className="flex gap-2">
                <Button disabled={formProgress < 100} onClick={handleAddGoal}>
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No goals found. Add your first goal!</div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
  <Card key={goal.id} className={`border-2 ${goal.is_completed ? 'border-green-300 bg-green-50' : 'border-blue-200'}`}>
    <CardContent className="flex flex-col md:flex-row items-center justify-between gap-2 py-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{goal.emoji}</span>
        <div>
          <div className="font-semibold text-lg">{editingGoalId === goal.id ? (
            <>
              <div className="flex flex-col md:flex-row gap-2 md:gap-x-4 mb-2 items-center w-full px-2">
                <Select
                  value={editGoal.emoji}
                  onValueChange={emoji => setEditGoal(g => ({ ...g, emoji }))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue>{editGoal.emoji}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {emojiOptions.map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={editGoal.title}
                  onChange={e => setEditGoal(g => ({ ...g, title: e.target.value }))}
                  className="mb-1 w-full"
                  maxLength={50}
                  placeholder="Goal title (e.g. Meditate for 10 minutes)"
                />
                <Select
                  value={editGoal.target_frequency}
                  onValueChange={target_frequency => setEditGoal(g => ({ ...g, target_frequency }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue>{editGoal.target_frequency}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={editGoal.description}
                onChange={e => setEditGoal(g => ({ ...g, description: e.target.value }))}
                rows={2}
                maxLength={120}
                className="mb-2 w-full"
                placeholder="Describe your goal..."
              />
              <div className="flex items-center gap-2 mb-2">
                <Progress value={((editGoal.title.trim() ? 1 : 0) + (editGoal.description.trim() ? 1 : 0) + (editGoal.target_frequency ? 1 : 0) + (editGoal.emoji ? 1 : 0)) / 4 * 100} className="w-32 h-2" />
                <span className="text-xs text-gray-400">{((editGoal.title.trim() ? 1 : 0) + (editGoal.description.trim() ? 1 : 0) + (editGoal.target_frequency ? 1 : 0) + (editGoal.emoji ? 1 : 0)) === 4 ? "Ready to save!" : "Complete all fields"}</span>
              </div>
            </>
          ) : goal.title}</div>
          <div className="text-gray-500 text-sm">{editingGoalId === goal.id ? null : goal.description}</div>
          <div className="flex gap-2 mt-1">
            {editingGoalId === goal.id ? null : (
              <>
                <Badge variant="outline">{goal.target_frequency}</Badge>
                <Badge variant="secondary">{goal.streak_count || 0} day streak</Badge>
                <Badge variant="secondary">{goal.completed_count || 0} times completed</Badge>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Button size="sm" variant={goal.is_completed ? "outline" : "default"} onClick={() => handleToggleComplete(goal.id, goal.is_completed)}>
          {goal.is_completed ? "Mark Incomplete" : "Mark Complete"}
        </Button>
        {editingGoalId === goal.id ? (
          <>
            <Button size="sm" variant="default" onClick={() => handleSaveEdit(goal.id)}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => handleEditGoal(goal)}>Edit</Button>
        )}
        <Button size="icon" variant="ghost" onClick={() => handleDeleteGoal(goal.id)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </CardContent>
  </Card>
))}

            </div>
          )}
        </CardContent>
      </Card>
      {/* Goal Suggestions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Suggestions</CardTitle>
          <CardDescription>Popular wellness goals among students</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="text-xl">🧘</span>
              <div className="font-semibold">Practice Mindfulness</div>
              <div className="text-gray-500 text-sm">Spend 5-10 minutes daily on mindfulness or meditation</div>
              <Button size="sm" variant="secondary" onClick={() => handleUseSuggestedGoal({
                title: "Practice Mindfulness",
                description: "Spend 5-10 minutes daily on mindfulness or meditation",
                target_frequency: "daily",
                emoji: "🧘"
              })} disabled={suggestionLoading === "Practice Mindfulness"}>
                {suggestionLoading === "Practice Mindfulness" ? 'Saving...' : 'Use This Goal'}
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="text-xl">😴</span>
              <div className="font-semibold">Improve Sleep Quality</div>
              <div className="text-gray-500 text-sm">Get 7-9 hours of quality sleep each night</div>
              <Button size="sm" variant="secondary" onClick={() => handleUseSuggestedGoal({
                title: "Improve Sleep Quality",
                description: "Get 7-9 hours of quality sleep each night",
                target_frequency: "daily",
                emoji: "😴"
              })} disabled={suggestionLoading === "Improve Sleep Quality"}>
                {suggestionLoading === "Improve Sleep Quality" ? 'Saving...' : 'Use This Goal'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessGoals;
