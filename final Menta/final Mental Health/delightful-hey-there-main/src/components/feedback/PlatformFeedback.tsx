import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp, Lightbulb, Bug, Heart, BookOpen } from "lucide-react";
import { db, auth } from "@/integrations/firebase";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";

import { useToast } from "@/hooks/use-toast";

// --- Type Definitions ---
interface FeedbackItem {
  id: string;
  category: string;
  rating: number | null;
  message: string;
  created_at: string;
}

interface NewFeedback {
  category: string;
  rating: number | null;
  message: string;
}

const feedbackCategories = [
  { value: "general", label: "General Feedback", icon: MessageSquare },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb },
  { value: "bug_report", label: "Bug Report", icon: Bug },
  { value: "user_experience", label: "User Experience", icon: Heart },
  { value: "content", label: "Content & Resources", icon: BookOpen },
  { value: "support", label: "Support & Help", icon: ThumbsUp }
];

const quickFeedbackOptions = [
  { title: "Assessment Experience", desc: "How was taking the mental health assessments?" },
  { title: "Resource Quality", desc: "Are the articles and resources helpful?" },
  { title: "Navigation & Design", desc: "Is the platform easy to use and navigate?" },
  { title: "Mood Tracking", desc: "How do you find the mood tracking feature?" },
];



const PlatformFeedback = () => {
  useEffect(() => {
    document.title = "Feedback | Novo Wellness";
  }, []);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [newFeedback, setNewFeedback] = useState<NewFeedback>({
    category: "",
    rating: null,
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, "platform_feedback"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedback(data as FeedbackItem[]);
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
  }
};

  const submitFeedback = async () => {
    if (!newFeedback.category || !newFeedback.message.trim()) {
      toast({
        title: "Please fill in all required fields",
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
          description: "You need to be logged in to submit feedback",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "platform_feedback"), {
        user_id: user.uid,
        category: newFeedback.category,
        rating: newFeedback.rating,
        message: newFeedback.message,
        created_at: new Date().toISOString()
      });

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input.",
      });

      setNewFeedback({ category: "", rating: null, message: "" });
      fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission failed",
        description: (error as any).message || "Could not submit your feedback. Please try again later.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number | null, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`p-1 transition-colors ${
              rating && star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            Platform Feedback
          </CardTitle>
          <CardDescription className="text-purple-800">
            Help us improve Novo Wellness by sharing your thoughts, suggestions, and experiences
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
          <CardDescription>
            We value your input! Please share your thoughts, suggestions, or issues below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Category <span className="text-red-500">*</span></label>
              <Select
                value={newFeedback.category}
                onValueChange={value => setNewFeedback(f => ({ ...f, category: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Your feedback <span className="text-red-500">*</span></label>
              <Textarea
                value={newFeedback.message}
                onChange={e => setNewFeedback(f => ({ ...f, message: e.target.value }))}
                placeholder="Type your feedback here..."
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Rating (optional)</label>
              <StarRating rating={newFeedback.rating} onRatingChange={(rating) => setNewFeedback(f => ({ ...f, rating }))} />
            </div>
            <Button
              onClick={submitFeedback}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Feedback */}
      {feedback.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Your Previous Feedback</h2>
          <div className="space-y-4">
            {feedback.map(item => {
              const cat = feedbackCategories.find(c => c.value === item.category);
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-start gap-4 py-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {cat && <cat.icon className="w-4 h-4" />}
                      {cat ? cat.label : item.category}
                    </Badge>
                    <div className="flex-1">
                      <div className="text-gray-700">{item.message}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {item.rating && (
                          <span className="flex items-center gap-1">
                            {[...Array(item.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400" fill="#facc15" />
                            ))}
                          </span>
                        )}
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Feedback Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Feedback</CardTitle>
          <CardDescription>
            Common areas where we'd love to hear from you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Assessment Experience", desc: "How was taking the mental health assessments?" },
              { title: "Resource Quality", desc: "Are the articles and resources helpful?" },
              { title: "Navigation & Design", desc: "Is the platform easy to use and navigate?" },
              { title: "Mood Tracking", desc: "How do you find the mood tracking feature?" }
            ].map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex-col gap-2 text-left"
                onClick={() => {
                  setNewFeedback({
                    category: "user_experience",
                    rating: null,
                    message: `Feedback about ${item.title}: `
                  });
                }}
              >
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformFeedback;
