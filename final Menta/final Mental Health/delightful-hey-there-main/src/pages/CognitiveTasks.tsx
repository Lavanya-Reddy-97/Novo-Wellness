import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from "@/hooks/usePageTitle";
import Footer from "@/components/Footer";
import GameContainer from "@/components/games/GameContainer";
import GameResults from "@/components/games/GameResults";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Timer, Target, Award, Play, Lock, Lightbulb, BookOpen, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CognitiveTasks = () => {
  usePageTitle("Cognitive Tasks");
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("cognitive");
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<{score: number; gameType: string} | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [cognitiveMinutesToday, setCognitiveMinutesToday] = useState<number>(0);
  const [cognitiveLocked, setCognitiveLocked] = useState<boolean>(false);
  const { toast } = useToast();

  // Utility to get today's date string
  const getToday = () => new Date().toISOString().slice(0, 10);

  // Load cognitive sessions from localStorage and calculate today's total
  React.useEffect(() => {
    const sessionsRaw = localStorage.getItem('cognitiveGameSessions');
    let sessions = sessionsRaw ? JSON.parse(sessionsRaw) : {};
    const today = getToday();
    const todaySessions = sessions[today] || [];
    const totalMs = todaySessions.reduce((sum: number, sess: {start: number, end: number}) => sum + (sess.end - sess.start), 0);
    const totalMin = Math.floor(totalMs / 60000);
    setCognitiveMinutesToday(totalMin);
    setCognitiveLocked(totalMin >= 20);
  }, [gameResults]);

  const taskCategories = {
    cognitive: {
      title: "Memory & Processing Skills",
      icon: Brain,
      color: "from-blue-500 to-purple-600",
      description: "Boost your brain power with games that strengthen memory, attention, and thinking skills - essential for academic success!",
      tasks: [
        {
          id: "digit",
          title: "Number Memory Challenge",
          description: "Test how many numbers you can remember! This game helps improve your memory for homework, phone numbers, and studying.",
          duration: "4-6 min",
          difficulty: "Medium",
          points: 40,
          premium: false,
          benefits: "Improves short-term memory and concentration for better test performance"
        },
        {
          id: "pattern",
          title: "Pattern Detective",
          description: "Become a pattern master! Remember sequences of colored squares to strengthen visual memory needed for math and science.",
          duration: "5-8 min",
          difficulty: "Hard", 
          points: 60,
          premium: false,
          benefits: "Enhances visual-spatial skills crucial for geometry and problem-solving"
        },
        {
          id: "nback",
          title: "Brain Trainer Pro",
          description: "Advanced memory training! Track moving targets to build super-strong working memory for complex learning tasks.",
          duration: "6-10 min",
          difficulty: "Hard",
          points: 70,
          premium: false,
          benefits: "Develops working memory - the foundation for reading comprehension and math"
        }
      ]
    },
    attention: {
      title: "Focus & Attention Control",
      icon: Target,
      color: "from-green-500 to-teal-500",
      description: "Train your focus superpowers! These games help you concentrate better in class and ignore distractions.",
      tasks: [
        {
          id: "stroop",
          title: "Color Mind Trick",
          description: "Don't let your brain get confused! Say the color you see, not what you read. Perfect for building mental control.",
          duration: "3-5 min",
          difficulty: "Easy",
          points: 30,
          premium: false,
          benefits: "Strengthens attention control and reduces impulsiveness"
        },
        {
          id: "reaction",
          title: "Lightning Reflexes",
          description: "How fast can you react? Test your response speed and train your brain to stay alert and focused.",
          duration: "3-5 min",
          difficulty: "Easy",
          points: 25,
          premium: false,
          benefits: "Improves processing speed and sustained attention"
        },
        {
          id: "sustained-attention",
          title: "Focus Marathon",
          description: "Can you stay focused for the long haul? This endurance test builds the stamina needed for studying and exams.",
          duration: "8-10 min",
          difficulty: "Hard",
          points: 65,
          premium: false,
          benefits: "Builds sustained attention essential for long study sessions"
        }
      ]
    },
    emotional: {
      title: "Social & Emotional Skills",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      description: "Understand feelings better! Learn to recognize emotions and build stronger friendships through emotional intelligence.",
      tasks: [
        {
          id: "emotion",
          title: "Emotion Detective",
          description: "Become an expert at reading faces! Learn to understand how others feel to build better relationships with friends.",
          duration: "5-7 min",
          difficulty: "Easy",
          points: 35,
          premium: false,
          benefits: "Develops empathy and social awareness for better peer relationships"
        },
        {
          id: "breathing",
          title: "Calm Bubble Breathing",
          description: "Learn the superpower of calm! Use special breathing techniques to feel relaxed and confident before tests or presentations.",
          duration: "3-5 min",
          difficulty: "Easy",
          points: 20,
          premium: false,
          benefits: "Teaches stress management and emotional regulation skills"
        },
        {
          id: "mood-tracker",
          title: "Mood Diary Adventure",
          description: "Track your feelings like a scientist! Understanding your emotions helps you feel happier and more confident.",
          duration: "4-6 min",
          difficulty: "Easy", 
          points: 30,
          premium: false,
          benefits: "Builds emotional self-awareness and mood regulation"
        }
      ]
    },
    challenge: {
      title: "Advanced Brain Challenges",
      icon: Award,
      color: "from-orange-500 to-yellow-500",
      description: "Ready for the ultimate brain workout? These advanced challenges are for students who want to push their cognitive limits!",
      tasks: [
        {
          id: "dual-nback",
          title: "Multi-Task Master",
          description: "The ultimate brain challenge! Track both sounds and visuals at the same time to become a multitasking champion.",
          duration: "10-15 min",
          difficulty: "Expert",
          points: 100,
          premium: false,
          benefits: "Maximizes working memory and cognitive flexibility"
        },
        {
          id: "task-switching",
          title: "Mental Flexibility Gym",
          description: "Switch between different tasks like a mental ninja! This trains your brain to adapt quickly to new situations.",
          duration: "8-12 min",
          difficulty: "Hard",
          points: 80,
          premium: false,
          benefits: "Enhances cognitive flexibility and problem-solving skills"
        },
        {
          id: "planning-tower",
          title: "Strategy Planner",
          description: "Solve puzzles by planning ahead! This game builds the strategic thinking skills needed for complex projects.",
          duration: "6-10 min",
          difficulty: "Hard",
          points: 75,
          premium: false,
          benefits: "Develops planning and strategic thinking abilities"
        }
      ]
    }
  };

  const handleStartTask = (taskId: string) => {
    if (activeCategory === "cognitive" && cognitiveLocked) return;
    setGameStartTime(Date.now());
    setCurrentGame(taskId);
  };

  const handleGameComplete = (score: number) => {
    if (currentGame) {
      if (!completedTasks.includes(currentGame)) {
        setCompletedTasks(prev => [...prev, currentGame]);
      }
      // Only track time for cognitive games
      if (activeCategory === "cognitive" && gameStartTime) {
        const end = Date.now();
        const start = gameStartTime;
        const sessionsRaw = localStorage.getItem('cognitiveGameSessions');
        let sessions = sessionsRaw ? JSON.parse(sessionsRaw) : {};
        const today = getToday();
        if (!sessions[today]) sessions[today] = [];
        sessions[today].push({ start, end });
        localStorage.setItem('cognitiveGameSessions', JSON.stringify(sessions));
      }
      setGameResults({
        score,
        gameType: currentGame
      });
      setGameStartTime(null);
    }
  };

  const handleBackToTasks = () => {
    setCurrentGame(null);
    setGameResults(null);
  };

  const handlePlayAgain = () => {
    setGameResults(null);
  };

  const handleSelectAnotherGame = () => {
    setGameResults(null);
    setCurrentGame(null);
  };

  // If game results are available, show the results
  if (gameResults) {
    return (
      <div className="min-h-screen bg-gray-50">
                <GameResults 
          results={gameResults} 
          onBack={handleBackToTasks}
          onSelectAnother={handleSelectAnotherGame}
          showSelectAnother={true}
        />
        <Footer />
      </div>
    );
  }

  // If a game is active, show the game container
  if (currentGame) {
    return (
      <div className="min-h-screen bg-gray-50">
                <GameContainer gameType={currentGame} onComplete={handleGameComplete} onBack={handleBackToTasks} />
        <Footer />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-orange-100 text-orange-800";
      case "Expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalTasks = Object.values(taskCategories).reduce((acc, category) => acc + category.tasks.length, 0);
  const progressPercentage = (completedTasks.length / totalTasks) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Brain Training Games for Students
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
              Level up your brain power with fun, scientifically-designed games! 
              Improve your memory, focus, and emotional skills to excel in school and life.
            </p>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div className="flex items-center">
                <Brain className="w-6 h-6 mr-2" />
                <span>{totalTasks} Fun Games</span>
              </div>
              <div className="flex items-center">
                <Award className="w-6 h-6 mr-2" />
                <span>{completedTasks.length} Completed</span>
              </div>
              <div className="flex items-center">
                <Timer className="w-6 h-6 mr-2" />
                <span>3-15 min each</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dashboard */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cognitiveLocked && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-900 text-center font-semibold">
            ⏳ You've reached your daily 20-minute limit for cognitive brain games. Come back tomorrow for more training!
          </div>
        )}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              Your Brain Training Journey 🚀
            </CardTitle>
            <CardDescription>
              Track your progress and watch your cognitive skills grow stronger every day!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Overall Progress</span>
                <span className="text-lg text-blue-600 font-bold">
                  {completedTasks.length}/{totalTasks} games completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{completedTasks.length}</p>
                  <p className="text-sm text-blue-800">Games Completed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {progressPercentage < 25 ? "Beginner" : 
                     progressPercentage < 50 ? "Intermediate" :
                     progressPercentage < 75 ? "Advanced" : "Expert"}
                  </p>
                  <p className="text-sm text-green-800">Current Level</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{cognitiveMinutesToday}</p>
                  <p className="text-sm text-purple-800">Minutes Trained (Cognitive)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1">
          {Object.entries(taskCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex flex-col items-center space-y-2 p-4 h-auto">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center leading-tight">
                  {category.title}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(taskCategories).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <div className="mb-6">
              <div className={`bg-gradient-to-r ${category.color} text-white p-8 rounded-xl mb-6`}>
                <div className="flex items-center mb-4">
                  <category.icon className="w-10 h-10 mr-4" />
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                </div>
                <p className="text-xl opacity-90">{category.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-gray-800">{task.title}</CardTitle>
                      {task.premium && <Lock className="w-5 h-5 text-orange-500" />}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {task.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Why this helps:</p>
                        <p className="text-sm text-gray-600">{task.benefits}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">⏱️ {task.duration}</span>
                        <Badge className={`${getDifficultyColor(task.difficulty)}`}>{task.difficulty}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-blue-600">
                          🏆 {task.points} points
                        </span>
                        {completedTasks.includes(task.id) && (
                          <Badge className="bg-green-100 text-green-800">
                            ✅ Completed
                          </Badge>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleStartTask(task.id)}
                        className="w-full text-lg py-3"
                        variant={completedTasks.includes(task.id) ? "outline" : "default"}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {completedTasks.includes(task.id) ? "Play Again 🔄" : "Start Game 🚀"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

        {/* Why Train Your Brain? */}
        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              <Lightbulb className="w-8 h-8 mr-3 text-yellow-600" />
              Why Train Your Brain? 🎯
            </CardTitle>
            <CardDescription className="text-lg">
              Discover how brain training games can transform your academic performance and daily life!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800">Better Grades 📚</h3>
                <p className="text-gray-700">
                  Students who train their working memory show <strong>significant improvements</strong> in math, 
                  reading comprehension, and problem-solving skills. Your grades will thank you!
                </p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-green-800">Super Focus 🎯</h3>
                <p className="text-gray-700">
                  Attention training helps you <strong>concentrate better</strong> in class, ignore distractions 
                  while studying, and stay focused during tests. No more wandering minds!
                </p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-purple-800">Better Friendships 👥</h3>
                <p className="text-gray-700">
                  Emotional intelligence training helps you <strong>understand feelings better</strong>, 
                  make stronger friendships, and handle social situations with confidence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scientific Evidence */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🔬 Backed by Science</CardTitle>
            <CardDescription className="text-center text-lg">
              These games aren't just fun - they're based on real neuroscience research!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">📊 Research Shows:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Students improve test scores by up to 20% after cognitive training</li>
                  <li>• Working memory training transfers to better math performance</li>
                  <li>• Attention training reduces ADHD symptoms in 75% of students</li>
                  <li>• Emotional intelligence predicts academic success better than IQ</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">🧠 How It Works:</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Regular training strengthens neural pathways in your brain</li>
                  <li>• Just 15 minutes daily can show improvements in 2-3 weeks</li>
                  <li>• Games target specific brain networks for maximum benefit</li>
                  <li>• Progressive difficulty keeps your brain constantly challenged</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      <Footer />
    </div>
  );
}
export default CognitiveTasks;
