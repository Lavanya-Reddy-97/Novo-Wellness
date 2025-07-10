
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause } from 'lucide-react';

interface BubbleBreathingGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const BubbleBreathingGame: React.FC<BubbleBreathingGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'paused' | 'complete'>('instructions');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [bubbles, setBubbles] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);
  const [score, setScore] = useState(0);

  const totalCycles = 5;
  const phaseDurations = { inhale: 4, hold: 4, exhale: 6 };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handlePhaseComplete();
    }

    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (phase === 'exhale') {
      generateBubbles();
    }
  }, [phase]);

  const generateBubbles = () => {
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 400,
      y: Math.random() * 300,
      size: 20 + Math.random() * 40
    }));
    setBubbles(newBubbles);
    
    setTimeout(() => setBubbles([]), 6000);
  };

  const handlePhaseComplete = () => {
    if (phase === 'inhale') {
      setPhase('hold');
      setTimeLeft(phaseDurations.hold);
    } else if (phase === 'hold') {
      setPhase('exhale');
      setTimeLeft(phaseDurations.exhale);
      setScore(prev => prev + 1);
    } else if (phase === 'exhale') {
      const nextCycle = currentCycle + 1;
      if (nextCycle < totalCycles) {
        setCurrentCycle(nextCycle);
        setPhase('inhale');
        setTimeLeft(phaseDurations.inhale);
      } else {
        setGameState('complete');
        setTimeout(() => onComplete(100), 1000);
      }
    }
  };

  const startGame = () => {
    setCurrentCycle(0);
    setPhase('inhale');
    setTimeLeft(phaseDurations.inhale);
    setScore(0);
    setBubbles([]);
    setGameState('playing');
  };

  const togglePause = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  if (gameState === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bubble Breathing Exercise</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p>Learn controlled breathing with a fun bubble visualization!</p>
            <p>Follow the breathing pattern to create beautiful floating bubbles.</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Breathing Pattern:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Inhale</strong> for 4 seconds (circle grows)</li>
                <li><strong>Hold</strong> for 4 seconds (circle stays large)</li>
                <li><strong>Exhale</strong> for 6 seconds (bubbles appear)</li>
                <li>Repeat for {totalCycles} cycles</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Benefits:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Reduces stress and anxiety</li>
                <li>Improves focus and concentration</li>
                <li>Helps with emotional regulation</li>
              </ul>
            </div>
          </div>
          <Button onClick={startGame} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Breathing Exercise
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'playing' || gameState === 'paused') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cycle {currentCycle + 1}/{totalCycles}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={togglePause}>
                {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
          <Progress value={(currentCycle / totalCycles) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2 capitalize">
              {phase === 'inhale' ? '🌬️ Breathe In' : 
               phase === 'hold' ? '⏸️ Hold' : 
               '💨 Breathe Out'}
            </h3>
            <p className="text-4xl font-bold text-blue-600">{timeLeft}</p>
            <p className="text-gray-600">seconds</p>
          </div>
          
          <div className="relative h-80 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden">
            {/* Breathing Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className={`rounded-full border-4 border-blue-500 transition-all duration-1000 ${
                  phase === 'inhale' ? 'w-32 h-32 bg-blue-300' :
                  phase === 'hold' ? 'w-32 h-32 bg-blue-400' :
                  'w-16 h-16 bg-blue-200'
                }`}
              />
            </div>
            
            {/* Bubbles */}
            {bubbles.map((bubble) => (
              <div
                key={bubble.id}
                className="absolute rounded-full bg-blue-400 opacity-70 animate-pulse"
                style={{
                  left: bubble.x,
                  top: bubble.y,
                  width: bubble.size,
                  height: bubble.size,
                  animation: 'float 6s ease-in-out forwards'
                }}
              />
            ))}
          </div>
          
          {gameState === 'paused' && (
            <div className="text-center">
              <p className="text-gray-600">Exercise paused</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Exercise Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-6xl">🧘‍♀️</div>
        <p className="text-xl">Well done! You completed {totalCycles} breathing cycles.</p>
        <p>You've taken an important step towards better stress management and mindfulness.</p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">
            Practice this exercise daily for best results! 🌟
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={startGame}>Practice Again</Button>
          <Button variant="outline" onClick={onBack}>Back to Tasks</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BubbleBreathingGame;
