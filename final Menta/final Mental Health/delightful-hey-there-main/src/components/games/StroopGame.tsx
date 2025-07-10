
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play } from 'lucide-react';

interface StroopGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const StroopGame: React.FC<StroopGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'complete'>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const colors = ['red', 'blue', 'green', 'yellow'];
  const colorClasses = {
    red: 'text-red-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500'
  };

  const generateTrial = () => {
    const word = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord(word);
    setCurrentColor(color);
    setStartTime(Date.now());
  };

  const startGame = () => {
    setCurrentTrial(0);
    setScore(0);
    setReactionTimes([]);
    setGameState('playing');
    generateTrial();
  };

  const handleAnswer = (selectedColor: string) => {
    const isCorrect = selectedColor === currentColor;
    const reactionTime = Date.now() - startTime;
    
    setReactionTimes(prev => [...prev, reactionTime]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const nextTrial = currentTrial + 1;
    if (nextTrial < 20) {
      setCurrentTrial(nextTrial);
      setTimeout(() => generateTrial(), 500);
    } else {
      setGameState('complete');
      const finalScore = Math.round((score / 20) * 100);
      setTimeout(() => onComplete(finalScore), 1000);
    }
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stroop Test Instructions</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p>In this test, you'll see color words displayed in different colors.</p>
            <p>Your task is to identify the <strong>color of the text</strong>, not the word itself.</p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Example:</h4>
              <p>If you see the word <span className="text-blue-500 font-bold">"RED"</span> written in blue, click "Blue"</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Tips:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Focus on the color, ignore the word</li>
                <li>Answer as quickly and accurately as possible</li>
                <li>You'll complete 20 trials</li>
              </ul>
            </div>
          </div>
          <Button onClick={startGame} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'playing') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stroop Test - Trial {currentTrial + 1}/20</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={(currentTrial / 20) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <p className="text-lg mb-4">What color is this word?</p>
            <div className="text-8xl font-bold mb-8">
              <span className={colorClasses[currentColor as keyof typeof colorClasses]}>
                {currentWord.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {colors.map((color) => (
              <Button
                key={color}
                onClick={() => handleAnswer(color)}
                className={`h-16 text-lg ${
                  color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                  color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                  color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Button>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-600">
            Score: {score}/{currentTrial}
          </p>
        </CardContent>
      </Card>
    );
  }

  const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-6xl">✨</div>
        <p className="text-xl">Accuracy: {Math.round((score / 20) * 100)}%</p>
        <p>You got {score} out of 20 correct!</p>
        <p className="text-sm text-gray-600">
          Average reaction time: {Math.round(avgReactionTime)}ms
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={startGame}>Try Again</Button>
          <Button variant="outline" onClick={onBack}>Back to Tasks</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StroopGame;
