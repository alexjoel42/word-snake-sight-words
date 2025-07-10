import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, User, Target, AlertCircle, Clock } from 'lucide-react';

interface GameScore {
  id: number;
  playerName: string;
  score: number;
  wordsCollected: number;
  missedWords: string[];
  date: string;
  timeElapsed?: number;
}

interface LeaderboardProps {
  currentScore: number;
  playerName: string;
  wordsCollected: number;
  missedWords: string[];
  gameOver: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentScore,
  playerName,
  wordsCollected,
  missedWords,
  gameOver,
}) => {
  const [scores, setScores] = useState<GameScore[]>([]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Load saved scores
  useEffect(() => {
    const savedScores = localStorage.getItem('snakeGameScores');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (error) {
        console.error('Error parsing saved scores:', error);
      }
    }
  }, []);

  // Save current score
  const saveScore = () => {
    if (!playerName.trim() || !gameOver) return;

    const newScore: GameScore = {
      id: Date.now(),
      playerName: playerName.trim(),
      score: currentScore,
      wordsCollected,
      missedWords: [...missedWords],
      date: new Date().toLocaleDateString(),
    };

    const updatedScores = [...scores, newScore]
      .sort((a, b) => b.score - a.score
  )
    setScores(updatedScores);
    localStorage.setItem('snakeGameScores', JSON.stringify(updatedScores));
  };

  // Clear all scores
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
        {gameOver && (
          <div className="p-3 bg-green-100 rounded-lg border border-green-300">
            <h4 className="font-bold text-green-800 mb-2">Your Game:</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {playerName || 'Anonymous'}
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
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            {playerName.trim() && (
              <Button 
                onClick={saveScore} 
                className="w-full mt-2" 
                size="sm"
              >
                Save Score
              </Button>
            )}
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
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
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
                      {score.timeElapsed && (
                        <div className="text-xs text-gray-600">
                          {formatTime(score.timeElapsed)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {score.missedWords.length > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="text-red-600">
                        Missed: {score.missedWords.slice(0, 3).join(', ')}
                        {score.missedWords.length > 3 ? '...' : ''}
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