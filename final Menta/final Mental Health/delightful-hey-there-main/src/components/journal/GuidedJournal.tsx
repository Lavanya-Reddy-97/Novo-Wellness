import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BookOpen, RefreshCw, Lock, Globe } from "lucide-react";
import { auth, db } from "@/integrations/firebase";
import { addDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";

const GuidedJournal = () => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const { filterProfanity } = useProfanityFilter();
  const [isPrivate, setIsPrivate] = useState(true);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const journalPrompts = [
    "What are three things you're grateful for today, and why?",
    "Describe a challenge you faced this week and how you overcame it.",
    "What does self-care mean to you, and how do you practice it?",
    "Write about a time when you felt really proud of yourself.",
    "What are your biggest worries right now, and what can you do about them?",
    "Describe your ideal day from start to finish.",
    "What's one thing you learned about yourself recently?",
    "How do you handle stress, and what techniques work best for you?",
    "Write about someone who has positively influenced your life.",
    "What are your goals for the next month, and how will you achieve them?",
    "Describe a moment when you felt completely at peace.",
    "What would you tell your younger self if you could go back in time?",
    "How has your perspective on mental health changed over time?",
    "What activities make you lose track of time because you enjoy them so much?",
    "Write about a fear you have and steps you could take to overcome it."
  ];

  useEffect(() => {
    generateRandomPrompt();
    fetchJournalEntries();
  }, []);

  const generateRandomPrompt = () => {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  const fetchJournalEntries = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "journal_entries"),
          where("user_id", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setJournalEntries(data);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const filteredText = filterProfanity(e.target.value);
    setJournalContent(filteredText);
  };

  const promptRef = useRef("");

  useEffect(() => {
    promptRef.current = currentPrompt;
  }, [currentPrompt]);

  const saveJournalEntry = async () => {
    if (!journalContent.trim()) {
      toast({
        title: "Please write something",
        description: "Your journal entry cannot be empty",
        variant: "destructive"
      });
      return;
    }
    if (!promptRef.current.trim()) {
      toast({
        title: "Prompt missing",
        description: "Prompt must be set before saving.",
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
          description: "You need to be logged in to save journal entries",
          variant: "destructive"
        });
        return;
      }

      await addDoc(collection(db, "journal_entries"), {
        user_id: user.uid,
        prompt: promptRef.current,
        content: journalContent,
        is_private: isPrivate,
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Journal entry saved!",
        description: "Your thoughts have been recorded successfully"
      });

      setJournalContent("");
      generateRandomPrompt();
      fetchJournalEntries();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Guided Journaling Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Daily Reflection
          </CardTitle>
          <CardDescription>
            Take a moment to reflect and express your thoughts through guided journaling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-medium text-purple-900">Today's Prompt:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateRandomPrompt}
                className="text-purple-600 hover:text-purple-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-purple-800 leading-relaxed">{currentPrompt}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your reflection:
            </label>
            <Textarea
              placeholder="Start writing your thoughts here... Take your time and be honest with yourself."
              value={journalContent}
              onChange={handleContentChange}
              className="min-h-[200px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="privacy"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <label
                  htmlFor="privacy"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1"
                >
                  {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {isPrivate ? "Private" : "Shareable"}
                </label>
              </div>
              <span className="text-xs text-gray-500">
                {isPrivate ? "Only you can see this entry" : "This entry may be shared anonymously"}
              </span>
            </div>

            <Button
              onClick={saveJournalEntry}
              disabled={!journalContent.trim() || loading}
            >
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Writing Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Journaling Tips</CardTitle>
          <CardDescription>Make the most of your reflection time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Be Honest</h4>
              <p className="text-sm text-blue-800">
                Write authentically about your thoughts and feelings. This is your safe space.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">No Judgment</h4>
              <p className="text-sm text-green-800">
                There's no right or wrong way to journal. Let your thoughts flow naturally.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Regular Practice</h4>
              <p className="text-sm text-yellow-800">
                Try to write regularly, even if it's just a few sentences each day.
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-medium text-pink-900 mb-2">Reflect & Grow</h4>
              <p className="text-sm text-pink-800">
                Review past entries to see patterns and track your personal growth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Journal Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Your Journal History</CardTitle>
          <CardDescription>Your recent reflections and thoughts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {journalEntries.length > 0 ? (
            journalEntries.map((entry) => {
              // Normalize Firestore Timestamp or ISO string
              let createdAt = entry.created_at;
              let dateObj = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
              return (
                <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {dateObj.toLocaleDateString()}
                      </Badge>
                      {entry.is_private ? (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Shareable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 p-3 bg-white rounded border-l-4 border-purple-200">
                    <p className="text-sm font-medium text-purple-800 mb-1">Prompt:</p>
                    <p className="text-sm text-purple-700">{entry.prompt || "(Prompt unavailable)"}</p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No journal entries yet.</p>
              <p className="text-sm text-gray-400">Start your first reflection above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuidedJournal;
