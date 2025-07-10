'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionRecorder } from '@/components/counselor/SessionRecorder';
import { SessionSummary } from '@/components/counselor/SessionSummary';
import { Button } from '@/components/ui/button';
import { Mic, FileText, MessageSquare, User } from 'lucide-react';

type Session = {
  id: string;
  date: Date;
  transcript: string;
  summary: {
    focusArea: string;
    keyPoints: string[];
    actionPlan: string[];
  };
};

export default function CounselorPage() {
  const [activeTab, setActiveTab] = useState('record');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleTranscript = (transcript: string) => {
    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date(),
      transcript,
      summary: {
        focusArea: "Session Focus Area",
        keyPoints: [
          "Key point 1 from the session",
          "Key point 2 from the session"
        ],
        actionPlan: [
          "Action item 1",
          "Action item 2"
        ]
      }
    };
    
    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
  };

  const handleCompleteSession = () => {
    // Save session to database or perform other actions
    console.log('Session completed:', currentSession);
  };

  const handleScheduleFollowUp = () => {
    // Open scheduling dialog or perform other actions
    console.log('Schedule follow-up');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r transition-all duration-300`}>
        <div className="p-4 border-b">
          <h1 className={`text-xl font-bold ${!isSidebarOpen && 'hidden'}`}>MindBloom</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
        </div>
        <nav className="p-2">
          <Button variant="ghost" className={`w-full justify-start ${activeTab === 'record' ? 'bg-accent' : ''}`} onClick={() => setActiveTab('record')}>
            <Mic className="w-4 h-4 mr-2" />
            {isSidebarOpen && 'Record Session'}
          </Button>
          <Button variant="ghost" className={`w-full justify-start mt-1 ${activeTab === 'sessions' ? 'bg-accent' : ''}`} onClick={() => setActiveTab('sessions')}>
            <FileText className="w-4 h-4 mr-2" />
            {isSidebarOpen && 'Past Sessions'}
          </Button>
          <Button variant="ghost" className={`w-full justify-start mt-1 ${activeTab === 'clients' ? 'bg-accent' : ''}`} onClick={() => setActiveTab('clients')}>
            <User className="w-4 h-4 mr-2" />
            {isSidebarOpen && 'Clients'}
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {activeTab === 'record' && 'Record Session'}
            {activeTab === 'sessions' && 'Session History'}
            {activeTab === 'clients' && 'Client Management'}
          </h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'record' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium mb-4">Record a New Session</h3>
                <SessionRecorder onTranscript={handleTranscript} />
              </div>
              
              {currentSession && (
                <div className="mt-6">
                  <SessionSummary
                    summary={currentSession.summary}
                    onComplete={handleCompleteSession}
                    onScheduleFollowUp={handleScheduleFollowUp}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium mb-4">Past Sessions</h3>
                {sessions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No sessions recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setCurrentSession(session)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">
                              {session.date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {session.summary.focusArea}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium mb-4">Client Management</h3>
                <p className="text-muted-foreground">Client management features coming soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
