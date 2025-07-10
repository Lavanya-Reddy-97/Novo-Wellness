
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play } from 'lucide-react';

interface EmotionRecognitionGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const EmotionRecognitionGame: React.FC<EmotionRecognitionGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'complete'>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const emotions = [
    { emoji: '😊', name: 'Happy', description: 'Smiling, positive expression' },
    { emoji: '😢', name: 'Sad', description: 'Downturned mouth, tears' },
    { emoji: '😠', name: 'Angry', description: 'Frowning, intense expression' },
    { emoji: '😨', name: 'Scared', description: 'Wide eyes, open mouth' },
    { emoji: '😲', name: 'Surprised', description: 'Raised eyebrows, open mouth' },
    { emoji: '🤢', name: 'Disgusted', description: 'Wrinkled nose, negative expression' }
  ];

  const questions = [
    { emoji: '😊', correct: 'Happy', options: ['Happy', 'Excited', 'Calm', 'Proud'] },
    { emoji: '😢', correct: 'Sad', options: ['Sad', 'Tired', 'Worried', 'Disappointed'] },
    { emoji: '😠', correct: 'Angry', options: ['Angry', 'Frustrated', 'Annoyed', 'Serious'] },
    { emoji: '😨', correct: 'Scared', options: ['Scared', 'Shocked', 'Nervous', 'Anxious'] },
    { emoji: '😲', correct: 'Surprised', options: ['Surprised', 'Amazed', 'Confused', 'Curious'] },
    { emoji: '🤢', correct: 'Disgusted', options: ['Disgusted', 'Sick', 'Uncomfortable', 'Disappointed'] },
    { emoji: '😴', correct: 'Tired', options: ['Tired', 'Bored', 'Sleepy', 'Relaxed'] },
    { emoji: '😍', correct: 'Love', options: ['Love', 'Happy', 'Excited', 'Admiring'] },
    { emoji: '🤔', correct: 'Thinking', options: ['Thinking', 'Confused', 'Curious', 'Doubtful'] },
    { emoji: '😌', correct: 'Peaceful', options: ['Peaceful', 'Content', 'Calm', 'Satisfied'] }
  ];

  const startGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const handleAnswer = (selectedEmotion: string) => {
    const isCorrect = selectedEmotion === questions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setGameState('complete');
      const finalScore = Math.round((score / questions.length) * 100);
      setTimeout(() => onComplete(finalScore), 1000);
    }
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Emotion Recognition Game</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p>Test your ability to recognize emotions from facial expressions!</p>
            <p>You'll see different emoji faces and need to identify the emotion they represent.</p>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to play:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Look at each emoji carefully</li>
                <li>Choose the emotion that best matches the expression</li>
                <li>Answer {questions.length} questions total</li>
                <li>Build your emotional intelligence skills!</li>
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {emotions.slice(0, 6).map((emotion) => (
                <div key={emotion.name} className="text-center">
                  <div className="text-4xl mb-1">{emotion.emoji}</div>
                  <p className="text-sm font-medium">{emotion.name}</p>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={startGame} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'playing') {
    const current = questions[currentQuestion];
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question {currentQuestion + 1}/{questions.length}</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <p className="text-lg mb-6">What emotion does this face show?</p>
            <div className="text-9xl mb-6">{current.emoji}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {current.options.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="h-16 text-lg hover:bg-purple-50"
              >
                {option}
              </Button>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-600">
            Score: {score}/{currentQuestion}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Game Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-6xl">🎭</div>
        <p className="text-xl">Emotion Recognition Score: {Math.round((score / questions.length) * 100)}%</p>
        <p>You identified {score} out of {questions.length} emotions correctly!</p>
        {score >= questions.length * 0.8 && (
          <p className="text-green-600 font-semibold">Excellent emotional intelligence! 🌟</p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={startGame}>Play Again</Button>
          <Button variant="outline" onClick={onBack}>Back to Tasks</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionRecognitionGame;
