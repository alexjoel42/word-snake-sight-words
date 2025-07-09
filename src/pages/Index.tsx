
import React from 'react';
import SnakeGame from '../components/SnakeGame';

// Main page that displays our educational Snake game
const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      {/* Page header with game title and instructions */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-green-800 mb-2">
          🐍 Word Snake Learning Game
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Help the snake collect sight words in order! Listen to each word as you collect it.
          Use arrow keys to move the snake around the board.
        </p>
      </div>
      
      {/* The main game component */}
      <SnakeGame />
    </div>
  );
};

export default Index;
