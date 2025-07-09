import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, User, Target, AlertCircle } from 'lucide-react';

// Component that tracks and displays high scores
const Leaderboard = ({ currentScore, playerName, wordsCollected, missedWords, gameOver }) => {
  // State to store all the game scores (saved in browser storage)
  const [scores, setScores] = useState([]);

  // Load saved scores when component first loads
  useEffect(() => {
    const savedScores = localStorage.getItem('snakeGameScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  // Save a new score when the game ends
  const saveScore = () => {
    if (!playerName.trim() || !gameOver) return;

    const newScore = {
      id: Date.now(), // Unique ID for each game
      playerName: playerName.trim(),
      score: currentScore,
      wordsCollected: wordsCollected,
      missedWords: [...missedWords], // Copy the array
      date: new Date().toLocaleDateString() // When the game was played
    };

    const updatedScores = [...scores, newScore];
    // Keep only the top 10 scores
    const topScores = updatedScores
      .sort((a, b) => b.score - a.score) // Sort by highest score first
      .slice(0, 10); // Keep only top 10

    setScores(topScores);
    localStorage.setItem('snakeGameScores', JSON.stringify(topScores));
  };

  // Clear all saved scores
  const clearLeaderboard = () => {
    setScores([]);
    localStorage.removeItem('snakeGameScores');
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Game Stats */}
        {gameOver && playerName && (
          <div className="p-3 bg-green-100 rounded-lg border border-green-300">
            <h4 className="font-bold text-green-800 mb-2">Your Game:</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {playerName}
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Score: {currentScore}
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Words: {wordsCollected}
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Missed: {missedWords.length}
              </div>
            </div>
            <Button 
              onClick={saveScore} 
              className="w-full mt-2" 
              size="sm"
              disabled={!playerName.trim()}
            >
              Save Score
            </Button>
          </div>
        )}

        {/* Top Scores List */}
        <div>
          <h4 className="font-bold text-gray-800 mb-2">Top Scores:</h4>
          {scores.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No scores yet. Be the first to play!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scores.map((score, index) => (
                <div 
                  key={score.id} 
                  className={`
                    p-2 rounded border text-sm
                    ${index === 0 ? 'bg-yellow-100 border-yellow-400' : 
                      index === 1 ? 'bg-gray-100 border-gray-400' : 
                      index === 2 ? 'bg-orange-100 border-orange-400' : 
                      'bg-white border-gray-200'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">
                        #{index + 1} {score.playerName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {score.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {score.score} pts
                      </div>
                      <div className="text-xs text-gray-600">
                        {score.wordsCollected} words
                      </div>
                    </div>
                  </div>
                  
                  {/* Show missed words if any */}
                  {score.missedWords.length > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="text-red-600">
                        Missed: {score.missedWords.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Leaderboard Button */}
        {scores.length > 0 && (
          <Button 
            onClick={clearLeaderboard} 
            variant="outline" 
            size="sm" 
            className="w-full text-red-600 hover:text-red-700"
          >
            Clear Leaderboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
