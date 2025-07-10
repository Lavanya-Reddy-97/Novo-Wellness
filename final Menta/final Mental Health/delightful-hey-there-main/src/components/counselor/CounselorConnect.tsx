import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Phone, MessageCircle, Calendar, AlertTriangle, CheckCircle, Clock, Mic } from "lucide-react";
import { db, auth } from "@/integrations/firebase";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";

import { useToast } from "@/hooks/use-toast";


type SessionSummary = {
  focusArea: string;
  keyPoints: string[];
  actionPlan: string[];
};

const CounselorConnect = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const handleShowComingSoon = () => setShowComingSoon(true);
  const handleCloseComingSoon = () => setShowComingSoon(false);
  const handleShowScheduleModal = () => setShowScheduleModal(true);
  const handleCloseScheduleModal = () => setShowScheduleModal(false);

  const [requests, setRequests] = useState<any[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    subject: "",
    message: "",
    urgency_level: "low"
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("connect");
  const [transcript, setTranscript] = useState("");
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, "counselor_requests"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data as any[]);
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
  }
};

  const submitRequest = async () => {
  if (!newRequest.subject.trim() || !newRequest.message.trim()) {
    toast({
      title: "Please fill in all fields",
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
        description: "You need to be logged in to request counselor support",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    await addDoc(collection(db, "counselor_requests"), {
      user_id: user.uid,
      subject: newRequest.subject,
      message: newRequest.message,
      urgency_level: newRequest.urgency_level,
      created_at: new Date().toISOString()
    });

    toast({
      title: "Request submitted!",
      description: "A counselor will reach out to you soon based on the urgency level"
    });

    setNewRequest({ subject: "", message: "", urgency_level: "low" });
    setShowRequestForm(false);
    fetchRequests();
  } catch (error) {
    console.error('Error submitting request:', error);
    toast({
      title: "Error",
      description: "Failed to submit request",
      variant: "destructive"
    });
  }
  setLoading(false);
};

  const handleTranscript = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handleSummary = (summary: SessionSummary) => {
    setSessionSummary(summary);
  };

  const handleCompleteSession = () => {
    toast({
      title: "Session completed!",
      description: "Your session has been saved and marked as complete."
    });
  };

  const handleScheduleFollowUp = () => {
    toast({
      title: "Follow-up scheduled",
      description: "You'll receive a reminder for your next session."
    });
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assigned': return <UserCheck className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', description: 'Response within 2-3 days' },
    { value: 'medium', label: 'Medium Priority', description: 'Response within 24 hours' },
    { value: 'high', label: 'High Priority', description: 'Response within 4-6 hours' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === "connect" ? "default" : "ghost"}
          onClick={() => setActiveTab("connect")}
          className="flex-1"
        >
          Connect
        </Button>

      </div>

      {/* Connect Tab */}
      {activeTab === "connect" && (
        <>
          {showComingSoon && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-xs w-full relative">
                <button
                  aria-label="Close"
                  onClick={handleCloseComingSoon}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">Coming Soon</h2>
                <p className="text-gray-700 mb-2">AI Therapy will be available soon. Stay tuned!</p>
                <button
                  onClick={handleCloseComingSoon}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {showScheduleModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-xs w-full relative">
                <button
                  aria-label="Close"
                  onClick={handleCloseScheduleModal}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">Coming Soon</h2>
                <p className="text-gray-700 mb-2">Schedule Sessions will be available soon. Stay tuned!</p>
                <button
                  onClick={handleCloseScheduleModal}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-green-600" />
                Contact Support Team
              </CardTitle>
              <CardDescription className="text-green-800">
                Reach out to our support team for help and guidance. All communications are private and protected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="text-center p-4 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition" onClick={handleShowComingSoon}>
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-900">AI Therapy</h4>
                  <p className="text-sm text-green-700">Experience therapy powered by AI </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition" onClick={handleShowScheduleModal}>
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-900">Schedule Sessions</h4>
                  <p className="text-sm text-green-700">Book appointments when you need them</p>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Emergency Resources */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Emergency Resources
              </CardTitle>
              <CardDescription className="text-red-700">
                If you're experiencing a mental health emergency, please reach out immediately
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Crisis Hotline</h4>
                  <p className="text-2xl font-bold text-red-800 mb-1">988</p>
                  <p className="text-sm text-red-700">Suicide & Crisis Lifeline - Available 24/7</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Text Support</h4>
                  <p className="text-lg font-bold text-red-800 mb-1">Text HOME to 741741</p>
                  <p className="text-sm text-red-700">Crisis Text Line - Free, confidential support</p>
                </div>
              </div>
            </CardContent>
          </Card>


        </>
      )}


    </div>
  );
};

export default CounselorConnect;
