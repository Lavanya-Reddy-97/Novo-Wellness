
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play } from 'lucide-react';

interface DigitSpanGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const DigitSpanGame: React.FC<DigitSpanGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'difficulty' | 'playing' | 'complete'>('instructions');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [showSequence, setShowSequence] = useState(true);
  const [isReverse, setIsReverse] = useState(false);

  const difficultySettings = {
    easy: { startLength: 3, maxLength: 6, trials: 8, displayTime: 1000 },
    medium: { startLength: 4, maxLength: 8, trials: 10, displayTime: 800 },
    hard: { startLength: 5, maxLength: 10, trials: 12, displayTime: 600 }
  };

  const generateSequence = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  };

  const startGame = () => {
    setCurrentTrial(0);
    setScore(0);
    setGameState('playing');
    nextTrial();
  };

  const nextTrial = () => {
    const settings = difficultySettings[difficulty];
    const currentLength = Math.min(
      settings.startLength + Math.floor(currentTrial / 2),
      settings.maxLength
    );
    const sequence = generateSequence(currentLength);
    setCurrentSequence(sequence);
    setUserInput('');
    setShowSequence(true);
    setIsReverse(currentTrial >= settings.trials / 2);

    setTimeout(() => setShowSequence(false), settings.displayTime + currentLength * 500);
  };

  const handleSubmit = () => {
    const userNumbers = userInput.split('').map(n => parseInt(n)).filter(n => !isNaN(n));
    const expectedSequence = isReverse ? [...currentSequence].reverse() : currentSequence;
    
    const isCorrect = userNumbers.length === expectedSequence.length &&
      userNumbers.every((num, index) => num === expectedSequence[index]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const nextTrialNumber = currentTrial + 1;
    if (nextTrialNumber < difficultySettings[difficulty].trials) {
      setCurrentTrial(nextTrialNumber);
      setTimeout(() => nextTrial(), 1000);
    } else {
      setGameState('complete');
      const finalScore = Math.round((score / difficultySettings[difficulty].trials) * 100);
      setTimeout(() => onComplete(finalScore), 1000);
    }
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🔢 Number Memory Challenge</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-lg">Test your memory power with number sequences! 🧠</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to play:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Watch the numbers appear on screen</li>
                <li>Memorize the sequence in order</li>
                <li>Type the numbers back when prompted</li>
                <li>Later rounds require BACKWARD entry!</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Why this helps:</h4>
              <p>Strong number memory helps with mental math, remembering formulas, and following multi-step instructions in school!</p>
            </div>
          </div>
          <Button onClick={() => setGameState('difficulty')} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Choose Your Challenge Level
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'difficulty') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Choose Your Challenge Level 🎯</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(difficultySettings).map(([level, settings]) => (
              <Button
                key={level}
                variant={difficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                className="h-20 text-left flex flex-col items-start justify-center p-4"
              >
                <span className="text-lg font-semibold capitalize">
                  {level === 'easy' ? '🟢 Easy' : level === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                </span>
                <span className="text-sm opacity-80">
                  {settings.startLength}-{settings.maxLength} digits, {settings.trials} rounds
                </span>
              </Button>
            ))}
          </div>
          <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700">
            Start Memory Challenge! 🚀
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
            <CardTitle>Round {currentTrial + 1}/{difficultySettings[difficulty].trials}</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={(currentTrial / difficultySettings[difficulty].trials) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">
              {showSequence ? '👀 Memorize these numbers:' : 
               isReverse ? '🔄 Enter BACKWARDS:' : '➡️ Enter the sequence:'}
            </h3>
            
            {showSequence ? (
              <div className="text-6xl font-mono font-bold text-blue-600 tracking-wider bg-blue-50 p-8 rounded-lg">
                {currentSequence.join(' ')}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="text-center text-3xl font-mono p-6 border-2 border-blue-300 rounded-lg w-full max-w-md mx-auto block focus:border-blue-500 focus:outline-none"
                  placeholder="Type numbers here..."
                  maxLength={currentSequence.length}
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={userInput.length !== currentSequence.length}
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                >
                  Submit Answer ✅
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Score: {score}/{currentTrial} | Difficulty: {difficulty.toUpperCase()} | 
              {isReverse ? " 🔄 REVERSE MODE" : " ➡️ FORWARD MODE"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const finalScore = Math.round((score / difficultySettings[difficulty].trials) * 100);
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🎉 Amazing Work!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-6xl">🧠</div>
        <p className="text-2xl font-bold text-blue-600">Memory Score: {finalScore}%</p>
        <p className="text-lg">You remembered {score} out of {difficultySettings[difficulty].trials} sequences correctly!</p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            {finalScore >= 80 ? "🌟 Outstanding memory! You're ready for advanced challenges!" :
             finalScore >= 60 ? "👍 Great job! Your memory is getting stronger!" :
             "💪 Keep practicing! Every attempt makes your brain stronger!"}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setGameState('difficulty')} className="bg-blue-600 hover:bg-blue-700">
            Try Different Level
          </Button>
          <Button variant="outline" onClick={onBack}>Back to Games</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitSpanGame;
