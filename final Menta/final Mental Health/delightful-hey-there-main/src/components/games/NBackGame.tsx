
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause } from 'lucide-react';

interface NBackGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const NBackGame: React.FC<NBackGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'complete'>('instructions');
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [nLevel] = useState(2); // 2-back task
  const [showStimulus, setShowStimulus] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);

  const gridPositions = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
    { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
  ];

  const generateSequence = useCallback(() => {
    const sequence = [];
    for (let i = 0; i < 20; i++) {
      if (i >= nLevel && Math.random() < 0.3) {
        // 30% chance to repeat n-back position
        sequence.push(sequence[i - nLevel]);
      } else {
        sequence.push(Math.floor(Math.random() * 9));
      }
    }
    return sequence;
  }, [nLevel]);

  const startGame = () => {
    const sequence = generateSequence();
    setCurrentSequence(sequence);
    setCurrentIndex(0);
    setUserResponses([]);
    setScore(0);
    setGameState('playing');
    showNextStimulus(sequence, 0);
  };

  const showNextStimulus = (sequence: number[], index: number) => {
    setCurrentNumber(sequence[index]);
    setShowStimulus(true);
    
    setTimeout(() => {
      setShowStimulus(false);
      setCurrentNumber(null);
    }, 500);
  };

  const handleResponse = (isMatch: boolean) => {
    const correctAnswer = currentIndex >= nLevel && 
      currentSequence[currentIndex] === currentSequence[currentIndex - nLevel];
    
    const isCorrect = isMatch === correctAnswer;
    setUserResponses(prev => [...prev, isCorrect]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < currentSequence.length) {
      setCurrentIndex(nextIndex);
      setTimeout(() => showNextStimulus(currentSequence, nextIndex), 1000);
    } else {
      setGameState('complete');
      const finalScore = Math.round((score / currentSequence.length) * 100);
      setTimeout(() => onComplete(finalScore), 1000);
    }
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>N-Back Task Instructions</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p>In this task, you'll see a sequence of positions on a 3x3 grid.</p>
            <p>Your job is to identify when the current position matches the position from <strong>{nLevel} steps back</strong>.</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to play:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Watch the highlighted squares on the grid</li>
                <li>Press "Match" if the current position is the same as {nLevel} positions ago</li>
                <li>Press "No Match" if it's different</li>
                <li>You'll see 20 positions total</li>
              </ul>
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
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>N-Back Task - Position {currentIndex + 1}/20</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={(currentIndex / 20) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2 w-48 h-48">
              {gridPositions.map((_, index) => (
                <div
                  key={index}
                  className={`border-2 border-gray-300 rounded transition-all duration-200 ${
                    showStimulus && currentNumber === index
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-gray-100'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-lg">
              Does this position match the one from {nLevel} steps back?
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleResponse(true)}
                disabled={showStimulus}
                className="bg-green-500 hover:bg-green-600"
              >
                Match
              </Button>
              <Button 
                onClick={() => handleResponse(false)}
                disabled={showStimulus}
                variant="outline"
              >
                No Match
              </Button>
            </div>
            <p className="text-sm text-gray-600">Score: {score}/{currentIndex}</p>
          </div>
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
        <div className="text-6xl">🎉</div>
        <p className="text-xl">Final Score: {Math.round((score / currentSequence.length) * 100)}%</p>
        <p>You got {score} out of {currentSequence.length} correct!</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={startGame}>Play Again</Button>
          <Button variant="outline" onClick={onBack}>Back to Tasks</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NBackGame;
