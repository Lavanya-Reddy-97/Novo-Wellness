import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, Loader2, ListChecks } from "lucide-react";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import AssessmentForm from "@/components/AssessmentForm";
import AssessmentResults from "@/components/AssessmentResults";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Define types for assessment results
interface AssessmentResult {
  [key: string]: number;
}

interface AssessmentResponse {
  [key: string]: any;
}

const assessmentQuestions = {
  overall: [
    { question: "I often feel lonely or sad" },
    { question: "I feel like no one understands me" },
    { question: "I have felt hopeless or helpless recently" },
    // Add more questions as needed
  ]
};

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState<"auth" | "instructions" | "assessment" | "results">("auth");
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number> | null>(null);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Store responses as they come in from the AssessmentForm
  const [responses, setResponses] = useState<Record<number, any>>({});
  
  // Handler for response changes from AssessmentForm
  const handleResponseChange = (newResponses: Record<number, any>) => {
    setResponses(newResponses);
  };



  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'management') {
          navigate('/school-dashboard');
          toast({
            title: 'Access Restricted',
            description: 'School management users cannot take assessments.',
            variant: 'destructive',
          });
        } else {
          setCurrentStep("instructions");
        }
      } else {
        setCurrentStep("auth");
      }
    }
  }, [user, loading, navigate, toast]);

  const handleAuthComplete = () => {
    setCurrentStep("instructions");
  };

  const startAssessment = () => {
    setCurrentStep("assessment");
    toast({
      title: "Assessment Started!",
      description: "Take your time and answer honestly.",
    });
  };

  const handleAssessmentComplete = (results: Record<string, number>) => {
    setIsProcessing(true);
    setTimeout(() => {
      // Format results to include _score suffix for each category
      const formattedResults: Record<string, number> = {};
      Object.entries(results).forEach(([category, score]) => {
        formattedResults[`${category}_score`] = score;
      });
      
      setAssessmentResults(formattedResults);
      
      // Store the responses in the format expected by AssessmentResults
      // We need to convert the responses to an array format that AssessmentResults expects
      const formattedResponses: any[] = [];
      Object.entries(responses).forEach(([index, answer]) => {
        formattedResponses[parseInt(index)] = answer;
      });
      
      setAssessmentResponses(formattedResponses);
      setCurrentStep("results");
      setIsProcessing(false);
      toast({
        title: "Assessment Complete!",
        description: "Your results are ready. Review them below.",
      });
    }, 1500);
  };

  // Calculate the current question number and questions remaining
  const currentQuestionNumber = Object.keys(responses).filter(key => responses[parseInt(key)] !== undefined).length + 1;
  const questionsRemaining = totalQuestions > 0 ? Math.max(0, totalQuestions - currentQuestionNumber + 1) : 0;

  const handleTakeAnotherAssessment = () => {
    setAssessmentResults(null);
    setCurrentStep("instructions");
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto p-4">
        {currentStep === "auth" && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Mental Health Assessment</h1>
              <p className="text-gray-600">Sign in to begin your personalized assessment</p>
            </div>
            <AuthForm onAuthComplete={handleAuthComplete} />
          </div>
        )}

        {currentStep === "instructions" && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6 border-blue-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Assessment Instructions</CardTitle>
                <CardDescription className="text-center">Please read the following instructions carefully before starting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Questions</p>
                        <p className="text-lg font-semibold text-gray-900">67</p>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-gray-200 hidden sm:block"></div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Approx Time</p>
                        <p className="text-lg font-semibold text-gray-900">20-30 min</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">About the Assessment:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>This is a comprehensive mental health assessment covering various aspects of well-being.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Answer all questions honestly based on your recent experiences.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>There are no right or wrong answers - your honest responses will provide the most accurate results.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" /> Important Note
                  </h3>
                  <p className="text-sm text-yellow-700">
                    This assessment is not a substitute for professional medical advice, diagnosis, or treatment. 
                    If you're in crisis or experiencing severe distress, please contact emergency services or a mental health professional immediately.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg"
                  onClick={startAssessment}
                >
                  Start Assessment
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {currentStep === "assessment" && (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <Card className="flex-1 flex flex-col border-0 shadow-sm">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="text-sm font-medium text-gray-600">
                  Question {currentQuestionNumber} of {totalQuestions}
                </div>
                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {questionsRemaining} {questionsRemaining === 1 ? 'question' : 'questions'} left
                </div>
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full">
                  <AssessmentForm 
                    selectedCategories={['overall']}
                    onComplete={handleAssessmentComplete}
                    initialResponses={responses}
                    onResponseChange={(newResponses) => {
                      handleResponseChange(newResponses);
                    }}
                    onQuestionsLoaded={(count: number) => setTotalQuestions(count)}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === "results" && assessmentResults && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Assessment Results</h1>
                <p className="text-gray-600">Review your assessment outcomes and recommendations</p>
              </div>
              
            </div>
            
            <Card className="mb-6">
              <AssessmentResults 
                userResponses={assessmentResponses}
                categories={['overall']}
                results={assessmentResults}
                onTakeAnother={handleTakeAnotherAssessment}
                userRole={user?.role}
              />
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('instructions')}
                className="w-full sm:w-auto"
              >
                Back to Instructions
              </Button>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                
                <Button 
                  onClick={() => navigate('/wellness-dashboard')}
                  className="w-full sm:w-auto"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;
