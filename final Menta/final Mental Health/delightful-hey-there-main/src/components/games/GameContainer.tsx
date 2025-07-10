
import React, { useState } from 'react';
import NBackGame from './NBackGame';
import StroopGame from './StroopGame';
import EmotionRecognitionGame from './EmotionRecognitionGame';
import BubbleBreathingGame from './BubbleBreathingGame';
import DigitSpanGame from './DigitSpanGame';
import ReactionTimeGame from './ReactionTimeGame';
import PatternMemoryGame from './PatternMemoryGame';

interface GameContainerProps {
  gameType: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameType, onComplete, onBack }) => {
  const renderGame = () => {
    switch (gameType) {
      case 'nback':
        return <NBackGame onComplete={onComplete} onBack={onBack} />;
      case 'stroop':
        return <StroopGame onComplete={onComplete} onBack={onBack} />;
      case 'emotion':
        return <EmotionRecognitionGame onComplete={onComplete} onBack={onBack} />;
      case 'breathing':
        return <BubbleBreathingGame onComplete={onComplete} onBack={onBack} />;
      case 'digit':
        return <DigitSpanGame onComplete={onComplete} onBack={onBack} />;
      case 'reaction':
        return <ReactionTimeGame onComplete={onComplete} onBack={onBack} />;
      case 'pattern':
        return <PatternMemoryGame onComplete={onComplete} onBack={onBack} />;
      case 'mood-tracker':
      case 'sustained-attention':
      case 'dual-nback':
      case 'task-switching':
      case 'planning-tower':
      case 'empathy':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Coming Soon!</h2>
              <p className="text-gray-600 mb-6">This awesome game is being developed! Check back soon for more brain training fun!</p>
              <button 
                onClick={onBack} 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Not Found</h2>
              <p className="text-gray-600 mb-6">Oops! This game doesn't exist yet.</p>
              <button 
                onClick={onBack} 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {renderGame()}
      </div>
    </div>
  );
};

export default GameContainer;
