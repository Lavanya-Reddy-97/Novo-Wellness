'use client';

import { useState } from 'react';
import { SessionRecorder } from '@/components/counselor/SessionRecorder';
import { SessionSummary } from '@/components/counselor/SessionSummary';
import { Button } from '@/components/ui/button';
import { Download, FileText, Mic, Upload } from 'lucide-react';

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

export default function CounselorSessionsPage() {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  const handleTranscript = (transcript: string) => {
    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date(),
      transcript,
      summary: {
        focusArea: "Academic stress",
        keyPoints: [
          "Discussed upcoming exams and workload",
          "Mentioned difficulty sleeping due to stress"
        ],
        actionPlan: [
          "Practice deep breathing exercises for 5 minutes daily",
          "Schedule study sessions in advance",
          "Follow up in 2 weeks"
        ]
      }
    };
    
    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
  };

  const handleCompleteSession = () => {
    // Handle session completion (e.g., save to database)
    console.log('Session completed:', currentSession);
  };

  const handleScheduleFollowUp = () => {
    // Handle scheduling a follow-up
    console.log('Schedule follow-up');
  };

  const handleDownloadTranscript = () => {
    if (!currentSession) return;
    
    const element = document.createElement('a');
    const file = new Blob([currentSession.transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `session-${currentSession.date.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Counseling Sessions</h1>
          <p className="text-muted-foreground">
            Record your sessions and track your mental health journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTranscript} disabled={!currentSession}>
            <Download className="w-4 h-4 mr-2" />
            Download Transcript
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('record')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'record'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Record Session
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Session History
                </div>
              </button>
            </nav>
          </div>

          <div className="mt-4">
            {activeTab === 'record' ? (
              <SessionRecorder
                onTranscript={handleTranscript}
                onSummary={(summary) => {
                  if (currentSession) {
                    setCurrentSession({
                      ...currentSession,
                      summary
                    });
                  }
                }}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Past Sessions</h3>
                {sessions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No past sessions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setCurrentSession(session)}
                      >
                        <div className="flex justify-between items-start">
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
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            {currentSession ? (
              <SessionSummary
                summary={currentSession.summary}
                onComplete={handleCompleteSession}
                onScheduleFollowUp={handleScheduleFollowUp}
              />
            ) : (
              <div className="border rounded-lg p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No active session</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new recording or select a past session to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
