
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play } from 'lucide-react';

interface ReactionTimeGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const ReactionTimeGame: React.FC<ReactionTimeGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'difficulty' | 'playing' | 'waiting' | 'react' | 'complete'>('instructions');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [waitTime, setWaitTime] = useState(0);

  const difficultySettings = {
    easy: { trials: 8, minWait: 2000, maxWait: 5000, target: 'Click when the circle turns GREEN! 🟢' },
    medium: { trials: 10, minWait: 1500, maxWait: 4000, target: 'Click when you see the BLUE square! 🟦' },
    hard: { trials: 12, minWait: 1000, maxWait: 3000, target: 'Click when the pattern changes! ⚡' }
  };

  const startGame = () => {
    setCurrentTrial(0);
    setReactionTimes([]);
    setGameState('playing');
    startNextTrial();
  };

  const startNextTrial = () => {
    const settings = difficultySettings[difficulty];
    const waitTime = Math.random() * (settings.maxWait - settings.minWait) + settings.minWait;
    setWaitTime(waitTime);
    setGameState('waiting');
    
    setTimeout(() => {
      setStartTime(Date.now());
      setGameState('react');
    }, waitTime);
  };

  const handleClick = () => {
    if (gameState === 'react') {
      const reactionTime = Date.now() - startTime;
      setReactionTimes(prev => [...prev, reactionTime]);
      
      const nextTrialNumber = currentTrial + 1;
      if (nextTrialNumber < difficultySettings[difficulty].trials) {
        setCurrentTrial(nextTrialNumber);
        setTimeout(() => startNextTrial(), 1000);
      } else {
        setGameState('complete');
        const avgReactionTime = reactionTimes.reduce((a, b) => a + b, reactionTime) / (reactionTimes.length + 1);
        const score = Math.max(0, Math.min(100, 100 - Math.floor(avgReactionTime / 10)));
        setTimeout(() => onComplete(score), 1000);
      }
    } else if (gameState === 'waiting') {
      // Clicked too early
      setGameState('playing');
      setTimeout(() => startNextTrial(), 1000);
    }
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>⚡ Lightning Reflexes Challenge</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-lg">Test your lightning-fast reflexes! ⚡</p>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to play:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Wait for the visual signal to appear</li>
                <li>Click as fast as you can when you see it!</li>
                <li>Don't click too early or you'll restart the round</li>
                <li>Try to stay focused throughout all trials</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Why this helps:</h4>
              <p>Quick reaction time helps with sports, gaming, driving safety, and staying alert during conversations and activities!</p>
            </div>
          </div>
          <Button onClick={() => setGameState('difficulty')} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Choose Your Speed Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'difficulty') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Select Your Speed Level 🏃‍♂️</CardTitle>
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
                  {settings.trials} trials | {settings.target}
                </span>
              </Button>
            ))}
          </div>
          <Button onClick={startGame} className="w-full bg-orange-600 hover:bg-orange-700">
            Start Speed Challenge! ⚡
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'waiting' || gameState === 'react') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trial {currentTrial + 1}/{difficultySettings[difficulty].trials}</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={(currentTrial / difficultySettings[difficulty].trials) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            className="h-80 rounded-xl cursor-pointer flex items-center justify-center text-2xl font-bold transition-all duration-200 border-4"
            onClick={handleClick}
            style={{
              backgroundColor: gameState === 'waiting' ? '#f3f4f6' : 
                             difficulty === 'easy' ? '#10b981' :
                             difficulty === 'medium' ? '#3b82f6' : '#8b5cf6',
              color: gameState === 'waiting' ? '#6b7280' : 'white',
              borderColor: gameState === 'waiting' ? '#d1d5db' : 
                          difficulty === 'easy' ? '#059669' :
                          difficulty === 'medium' ? '#2563eb' : '#7c3aed',
              transform: gameState === 'react' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: gameState === 'react' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            {gameState === 'waiting' ? (
              <div className="text-center">
                <p className="text-3xl mb-2">⏳ Get Ready...</p>
                <p className="text-lg">Wait for the signal!</p>
              </div>
            ) : (
              <div className="text-center animate-pulse">
                <p className="text-4xl mb-4">⚡ CLICK NOW! ⚡</p>
                {difficulty === 'medium' && (
                  <div className="w-20 h-20 bg-white rounded-lg mx-auto animate-bounce"></div>
                )}
                {difficulty === 'hard' && (
                  <div className="flex justify-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full animate-ping"></div>
                    <div className="w-8 h-8 bg-white rounded-full animate-ping delay-75"></div>
                    <div className="w-8 h-8 bg-white rounded-full animate-ping delay-150"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {reactionTimes.length > 0 && (
            <div className="text-center bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-green-600">
                Last time: {reactionTimes[reactionTimes.length - 1]}ms
              </p>
              <p className="text-sm text-gray-600">
                Average: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
  const score = Math.max(0, Math.min(100, 100 - Math.floor(avgReactionTime / 10)));

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>⚡ Speed Demon Results!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-6xl">🏃‍♂️</div>
        <p className="text-2xl font-bold text-orange-600">Average Time: {Math.round(avgReactionTime)}ms</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-800">⚡ Fastest</p>
            <p className="text-2xl font-bold text-green-600">{Math.min(...reactionTimes)}ms</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-800">📊 Average</p>
            <p className="text-2xl font-bold text-blue-600">{Math.round(avgReactionTime)}ms</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="font-semibold text-orange-800">🐌 Slowest</p>
            <p className="text-2xl font-bold text-orange-600">{Math.max(...reactionTimes)}ms</p>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-lg font-semibold text-purple-800">
            {avgReactionTime < 250 ? "🌟 Lightning fast! You have incredible reflexes!" :
             avgReactionTime < 350 ? "👍 Great speed! You're quicker than most people!" :
             avgReactionTime < 450 ? "💪 Good reflexes! Keep practicing to get even faster!" :
             "🎯 Nice work! Regular practice will boost your reaction time!"}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setGameState('difficulty')} className="bg-orange-600 hover:bg-orange-700">
            Try Different Level
          </Button>
          <Button variant="outline" onClick={onBack}>Back to Games</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReactionTimeGame;
