
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

// Component that shows the current target word and all words on the board
const WordDisplay = ({ currentWord, wordsOnBoard, gameRunning }) => {
  
  // Function to read the current target word out loud
  const speakCurrentWord = () => {
    if ('speechSynthesis' in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.rate = 0.8; // Speak slowly for learning
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Current Target Word Card */}
      <Card className="border-2 border-yellow-400 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-center text-yellow-800">
            🎯 Find This Word:
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-red-600 mb-4">
            {currentWord || 'Game Complete!'}
          </div>
          {currentWord && (
            <Button 
              onClick={speakCurrentWord} 
              variant="outline" 
              className="flex items-center gap-2 mx-auto"
            >
              <Volume2 className="w-4 h-4" />
              Hear Word
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Words Currently on Board */}
      <Card className="border-2 border-blue-400 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">
            📝 Words on Board:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {wordsOnBoard.map((wordObj, index) => (
              <div 
                key={index} 
                className={`
                  p-2 rounded text-center font-bold text-sm
                  ${wordObj.word === currentWord 
                    ? 'bg-yellow-200 text-red-600 border-2 border-red-400' 
                    : 'bg-white text-blue-600'
                  }
                `}
              >
                {wordObj.word}
              </div>
            ))}
          </div>
          
          {/* Game Instructions */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            {gameRunning ? (
              <>
                <p>🐍 Use arrow keys to move</p>
                <p>🎯 Collect the <span className="font-bold text-red-600">highlighted word</span> first!</p>
              </>
            ) : (
              <p>Click Start to begin the game!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordDisplay;
