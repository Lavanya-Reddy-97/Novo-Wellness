
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play } from 'lucide-react';

interface PatternMemoryGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const PatternMemoryGame: React.FC<PatternMemoryGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'difficulty' | 'playing' | 'complete'>('instructions');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const difficultySettings = {
    easy: { gridSize: 3, startLength: 3, maxLevel: 8, speed: 1000 },
    medium: { gridSize: 4, startLength: 4, maxLevel: 10, speed: 800 },
    hard: { gridSize: 4, startLength: 5, maxLevel: 12, speed: 600 }
  };

  const generatePattern = (length: number, gridSize: number) => {
    const totalCells = gridSize * gridSize;
    const pattern = [];
    for (let i = 0; i < length; i++) {
      let nextCell;
      do {
        nextCell = Math.floor(Math.random() * totalCells);
      } while (pattern.includes(nextCell));
      pattern.push(nextCell);
    }
    return pattern;
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setGameState('playing');
    startNextLevel();
  };

  const startNextLevel = () => {
    const settings = difficultySettings[difficulty];
    const patternLength = settings.startLength + Math.floor((level - 1) / 2);
    const newPattern = generatePattern(patternLength, settings.gridSize);
    setPattern(newPattern);
    setUserPattern([]);
    setCurrentStep(0);
    showPattern(newPattern);
  };

  const showPattern = (pattern: number[]) => {
    setShowingPattern(true);
    const settings = difficultySettings[difficulty];
    
    pattern.forEach((cell, index) => {
      setTimeout(() => {
        setCurrentStep(index);
      }, index * settings.speed);
    });

    setTimeout(() => {
      setShowingPattern(false);
      setCurrentStep(-1);
    }, pattern.length * settings.speed);
  };

  const handleCellClick = (cellIndex: number) => {
    if (showingPattern) return;

    const newUserPattern = [...userPattern, cellIndex];
    setUserPattern(newUserPattern);

    if (newUserPattern[newUserPattern.length - 1] !== pattern[newUserPattern.length - 1]) {
      // Wrong cell clicked
      gameOver();
      return;
    }

    if (newUserPattern.length === pattern.length) {
      // Pattern completed correctly
      setScore(prev => prev + 1);
      const nextLevelNumber = level + 1;
      if (nextLevelNumber <= difficultySettings[difficulty].maxLevel) {
        setLevel(nextLevelNumber);
        setTimeout(() => startNextLevel(), 1000);
      } else {
        setGameState('complete');
        setTimeout(() => onComplete(100), 1000);
      }
    }
  };

  const gameOver = () => {
    setGameState('complete');
    const finalScore = Math.round((score / difficultySettings[difficulty].maxLevel) * 100);
    setTimeout(() => onComplete(finalScore), 1000);
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🧩 Pattern Detective Challenge</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-lg">Become a pattern master! Train your visual memory! 👁️</p>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to play:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Watch squares light up in a sequence</li>
                <li>Click the squares in the same order</li>
                <li>Patterns get longer each level</li>
                <li>One mistake ends the game!</li>
              </ul>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Brain benefits:</h4>
              <p>Visual pattern memory helps with geometry, map reading, remembering faces, and understanding complex diagrams in science!</p>
            </div>
          </div>
          <Button onClick={() => setGameState('difficulty')} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Choose Challenge Level
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'difficulty') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Select Your Challenge Level 🎯</CardTitle>
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
                  {settings.gridSize}×{settings.gridSize} grid, {settings.maxLevel} levels, {settings.speed}ms speed
                </span>
              </Button>
            ))}
          </div>
          <Button onClick={startGame} className="w-full bg-purple-600 hover:bg-purple-700">
            Start Pattern Challenge! 🚀
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'playing') {
    const settings = difficultySettings[difficulty];
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Level {level} - Pattern: {pattern.length} squares</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={(level / settings.maxLevel) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl mb-4">
              {showingPattern ? '👀 Watch the pattern...' : '🖱️ Click the squares in order!'}
            </p>
          </div>
          
          <div className="flex justify-center">
            <div 
              className="grid gap-2 max-w-md"
              style={{ gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)` }}
            >
              {Array.from({ length: settings.gridSize * settings.gridSize }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 ${
                    showingPattern && currentStep === pattern.indexOf(index) && pattern.includes(index)
                      ? 'bg-yellow-400 border-yellow-500 scale-110 shadow-lg'
                      : userPattern.includes(index)
                      ? 'bg-green-400 border-green-500'
                      : 'bg-gray-200 border-gray-300 hover:bg-gray-300 hover:scale-105'
                  }`}
                  disabled={showingPattern}
                  style={{
                    transform: showingPattern && currentStep === pattern.indexOf(index) && pattern.includes(index) 
                      ? 'scale(1.1)' : userPattern.includes(index) ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-800">
              Level: {level}/{settings.maxLevel} | Progress: {userPattern.length}/{pattern.length} | Score: {score}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const finalScore = Math.round((score / difficultySettings[difficulty].maxLevel) * 100);
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🎉 Pattern Master!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-6xl">🧩</div>
        <p className="text-2xl font-bold text-purple-600">Pattern Score: {finalScore}%</p>
        <p className="text-lg">You completed {score} out of {difficultySettings[difficulty].maxLevel} levels!</p>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-800">
            Difficulty: {difficulty.toUpperCase()} | Longest pattern: {difficultySettings[difficulty].startLength + Math.floor((score) / 2)} squares
          </p>
          <p className="text-sm text-purple-600 mt-2">
            {finalScore >= 80 ? "🌟 Incredible visual memory! You're a pattern genius!" :
             finalScore >= 60 ? "👍 Excellent work! Your visual skills are sharp!" :
             "💪 Great effort! Keep training to boost your visual memory!"}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setGameState('difficulty')} className="bg-purple-600 hover:bg-purple-700">
            Try Different Level
          </Button>
          <Button variant="outline" onClick={onBack}>Back to Games</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternMemoryGame;
