import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Award, Brain, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameResultsProps {
  results: {
    score: number;
    gameType: string;
    totalQuestions?: number;
    correctAnswers?: number;
    timeSpent?: number;
    accuracy?: number;
  };
  onBack: () => void;
  onSelectAnother: () => void;
  gameTitle?: string;
  showSelectAnother?: boolean;
}

const GameResults: React.FC<GameResultsProps> = ({
  results,
  onBack,
  onSelectAnother,
  gameTitle,
  showSelectAnother = true
}) => {
  const { score, gameType, totalQuestions, correctAnswers, timeSpent, accuracy } = results;
  const navigate = useNavigate();

  // Default values if not provided
  const displayTotalQuestions = totalQuestions || 10;
  const displayCorrectAnswers = correctAnswers || Math.round((score / 100) * displayTotalQuestions);
  const displayAccuracy = accuracy || score;
  const displayTimeSpent = timeSpent || 0;

  const getGameTitle = (type: string) => {
    if (gameTitle) return gameTitle;

    const titles: Record<string, string> = {
      'stroop': 'Color Mind Trick',
      'nback': 'Brain Trainer Pro',
      'emotion': 'Emotion Detective',
      'breathing': 'Calm Bubble Breathing',
      'digit': 'Number Memory Challenge',
      'reaction': 'Lightning Reflexes',
      'pattern': 'Pattern Detective',
      'memory': 'Memory Challenge',
      'math': 'Math Wizard',
      'vocabulary': 'Word Master'
    };
    return titles[type] || 'Brain Training Game';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { 
      level: 'Exceptional', 
      color: 'text-purple-600', 
      emoji: '🌟', 
      badgeColor: 'bg-purple-100 text-purple-800' 
    };
    if (score >= 80) return { 
      level: 'Excellent', 
      color: 'text-green-600', 
      emoji: '🏆', 
      badgeColor: 'bg-green-100 text-green-800' 
    };
    if (score >= 70) return { 
      level: 'Good', 
      color: 'text-blue-600', 
      emoji: '👍', 
      badgeColor: 'bg-blue-100 text-blue-800' 
    };
    if (score >= 60) return { 
      level: 'Fair', 
      color: 'text-yellow-600', 
      emoji: '👌', 
      badgeColor: 'bg-yellow-100 text-yellow-800' 
    };
    return { 
      level: 'Keep Practicing', 
      color: 'text-orange-600', 
      emoji: '💪', 
      badgeColor: 'bg-orange-100 text-orange-800' 
    };
  };

  const getPerformanceFeedback = (score: number, gameType: string) => {
    const feedbackMap: Record<string, string> = {
      'stroop': 'Your ability to process conflicting information is ' + 
               (score >= 80 ? 'exceptional! You can easily focus on relevant information while ignoring distractions.' :
               score >= 60 ? 'good! With more practice, you\'ll get even better at managing conflicting information.' :
               'developing. Try to focus on the text color rather than the word itself.'),
      'nback': 'Your working memory is ' +
             (score >= 80 ? 'excellent! You can hold and process multiple pieces of information with ease.' :
             score >= 60 ? 'good! Keep practicing to improve your ability to remember sequences.' :
             'improving. Try to focus on the pattern of the last few items.'),
      'emotion': 'Your ability to recognize emotions is ' +
                (score >= 80 ? 'exceptional! You\'re very perceptive of emotional cues.' :
                score >= 60 ? 'good! With practice, you\'ll become even better at reading emotions.' :
                'developing. Pay attention to facial expressions and context clues.'),
      'digit': 'Your number memory is ' +
              (score >= 80 ? 'outstanding! You can recall long sequences with ease.' :
              score >= 60 ? 'good! Keep practicing to remember even longer sequences.' :
              'improving. Try chunking numbers together to remember them better.'),
      'reaction': 'Your reaction time is ' +
                (score >= 80 ? 'excellent! Your reflexes are quick and accurate.' :
                score >= 60 ? 'good! With practice, you can make your responses even faster.' :
                'improving. Try to stay focused and anticipate the next stimulus.'),
      'pattern': 'Your pattern recognition is ' +
               (score >= 80 ? 'exceptional! You spot patterns quickly and accurately.' :
               score >= 60 ? 'good! With more practice, you\'ll recognize even complex patterns.' :
               'developing. Look for repeating sequences and relationships between elements.')
    };
    return feedbackMap[gameType] || `You scored ${score}% on this task. ${score >= 70 ? 'Great job!' : 'Keep practicing to improve!'}`;
  };

  const performance = getPerformanceLevel(displayAccuracy);
  const performanceFeedback = getPerformanceFeedback(displayAccuracy, gameType);
  
  const stats = [
    { label: 'Score', value: `${displayAccuracy}%`, icon: <Star className="w-5 h-5" /> },
    { label: 'Time', value: `${Math.floor(displayTimeSpent / 60)}:${String(displayTimeSpent % 60).padStart(2, '0')}`, icon: <Clock className="w-5 h-5" /> },
    { label: 'Best', value: '92%', icon: <Award className="w-5 h-5" /> },
  ];
  
  const handleBackToGames = () => {
    navigate('/cognitive-tasks');
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Card className="max-w-3xl mx-auto shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="text-6xl mb-4">{performance.emoji}</div>
          <CardTitle className="text-3xl font-bold">Game Complete!</CardTitle>
          <p className="text-xl mt-2">You scored <span className="font-bold">{displayAccuracy}%</span> on {getGameTitle(gameType)}</p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{displayAccuracy}%</div>
              <div className="text-sm text-gray-600 font-medium">Accuracy</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
              <div className="text-3xl font-bold text-green-600">{displayCorrectAnswers}/{displayTotalQuestions}</div>
              <div className="text-sm text-gray-600 font-medium">Correct Answers</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(displayTimeSpent / 60)}:{String(displayTimeSpent % 60).padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600 font-medium">Time Spent</div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Award className={`w-5 h-5 mr-2 ${performance.color}`} />
              <span className={`text-sm font-medium ${performance.color}`}>
                {performance.level} Performance
              </span>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {performanceFeedback}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={onBack}
                variant="outline" 
                className="flex-1 sm:flex-none items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {gameType === 'cognitive' ? 'Back to Tasks' : 'Play Again'}
              </Button>
              
              {showSelectAnother && (
                <Button 
                  onClick={onSelectAnother}
                  variant="outline"
                  className="flex-1 sm:flex-none items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Another Game
                </Button>
              )}
              
              <Button 
                onClick={handleBackToGames}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                All Cognitive Tasks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameResults;