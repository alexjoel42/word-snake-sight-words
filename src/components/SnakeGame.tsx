import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WordDisplay from './WordDisplay';
import Leaderboard from './Leaderboard';
import { sightWords } from '../data/sightWords';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Game board dimensions - these control how big our playing field is
const BOARD_SIZE = 20; // 20x20 grid
const INITIAL_SNAKE = [{ x: 10, y: 10 }]; // Snake starts in the middle
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Snake starts moving up

// Main Snake Game component - this handles all the game logic
const SnakeGame = () => {
  // Game state variables - these keep track of everything happening in the game
  const [snake, setSnake] = useState(INITIAL_SNAKE); // Where each part of the snake is
  const [direction, setDirection] = useState(INITIAL_DIRECTION); // Which way snake is moving
  const [wordsOnBoard, setWordsOnBoard] = useState([]); // The 5 words currently visible
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Which word we're looking for next
  const [score, setScore] = useState(0); // Player's current score
  const [gameRunning, setGameRunning] = useState(false); // Is the game currently playing?
  const [gameOver, setGameOver] = useState(false); // Did the snake crash?
  const [playerName, setPlayerName] = useState(''); // Player's name for the leaderboard
  const [missedWords, setMissedWords] = useState([]); // Words the player got wrong

  // Function to make the computer read words out loud
  const speakWord = (word) => {
    // Check if the browser supports text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8; // Speak a bit slower for learning
      utterance.volume = 0.7; // Not too loud
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to create random positions for words on the game board
  const generateRandomPosition = () => {
    return {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
  };

  // Function to start a new game - resets everything back to the beginning
  const startNewGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setCurrentWordIndex(0);
    setScore(0);
    setGameOver(false);
    setMissedWords([]);
    
    // Put the first 5 sight words on the board in random positions
    const initialWords = sightWords.slice(0, 5).map((word) => ({
      word,
      position: generateRandomPosition()
    }));
    setWordsOnBoard(initialWords);
    
    // Read the first word to help the player know what to look for
    if (sightWords[0]) {
      setTimeout(() => speakWord(sightWords[0]), 500);
    }
  };

  // Function that runs every time the snake moves
  const moveSnake = useCallback(() => {
    // Don't move if game is over or not running
    if (gameOver || !gameRunning) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Move the snake's head in the current direction
      head.x += direction.x;
      head.y += direction.y;
      
      // Check if snake hit the walls (game over!)
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }
      
      // Check if snake hit itself (game over!)
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }
      
      // Add the new head to the front of the snake
      newSnake.unshift(head);
      
      // Check if snake ate a word
      const targetWord = sightWords[currentWordIndex];
      const wordOnBoard = wordsOnBoard.find(w => w.word === targetWord);
      
      if (wordOnBoard && head.x === wordOnBoard.position.x && head.y === wordOnBoard.position.y) {
        // Snake ate the correct word! 
        setScore(prev => prev + 10); // Give points
        speakWord(targetWord); // Read the word out loud
        
        // Move to the next word in our list
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        
        // Add a new word to the board if we haven't finished all words
        if (nextIndex + 4 < sightWords.length) {
          const newWord = {
            word: sightWords[nextIndex + 4],
            position: generateRandomPosition()
          };
          
          setWordsOnBoard(prev => {
            const updated = prev.filter(w => w.word !== targetWord);
            updated.push(newWord);
            return updated;
          });
        } else {
          // Remove the eaten word but don't add new ones (we're near the end)
          setWordsOnBoard(prev => prev.filter(w => w.word !== targetWord));
        }
        
        // Snake grows by keeping the tail (don't remove the last segment)
        return newSnake;
      }
      
      // Check if snake ate the wrong word
      const wrongWord = wordsOnBoard.find(w => 
        w.position.x === head.x && w.position.y === head.y && w.word !== targetWord
      );
      
      if (wrongWord) {
        // Snake ate wrong word - add to missed words but don't end game
        setMissedWords(prev => [...prev, wrongWord.word]);
        speakWord("Try again!"); // Give encouraging feedback
        
        // Move the wrong word to a new position
        setWordsOnBoard(prev => prev.map(w => 
          w.word === wrongWord.word 
            ? { ...w, position: generateRandomPosition() }
            : w
        ));
      }
      
      // Remove the tail since no word was eaten (snake doesn't grow)
      if (!wrongWord) {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [direction, gameOver, gameRunning, currentWordIndex, wordsOnBoard]);

  // Handle keyboard input for controlling the snake
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning) return;
      
      // Prevent the snake from going backwards into itself
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  // Game loop - this makes the snake move automatically
  useEffect(() => {
    if (!gameRunning) return;
    
    const gameInterval = setInterval(moveSnake, 200); // Move every 200 milliseconds
    return () => clearInterval(gameInterval);
  }, [moveSnake, gameRunning]);

  // Function to start or pause the game
  const toggleGame = () => {
    if (gameOver) {
      startNewGame();
    }
    setGameRunning(!gameRunning);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Controls and Score Display */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-48"
          />
          <Button onClick={toggleGame} className="flex items-center gap-2">
            {gameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {gameOver ? 'New Game' : gameRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={startNewGame} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        
        <div className="text-xl font-bold text-green-800">
          Score: {score} | Words Missed: {missedWords.length}
        </div>
      </div>

      {/* Current Target Word Display */}
      <WordDisplay 
        currentWord={sightWords[currentWordIndex]} 
        wordsOnBoard={wordsOnBoard}
        gameRunning={gameRunning}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Game Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="grid bg-green-50 border-2 border-green-300 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  width: '600px',
                  height: '600px'
                }}
              >
                {/* Create each cell of the game board */}
                {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
                  const x = index % BOARD_SIZE;
                  const y = Math.floor(index / BOARD_SIZE);
                  
                  // Check if this cell contains part of the snake
                  const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                  const isHead = snake[0]?.x === x && snake[0]?.y === y;
                  
                  // Check if this cell contains a word
                  const wordHere = wordsOnBoard.find(w => w.position.x === x && w.position.y === y);
                  const isTargetWord = wordHere?.word === sightWords[currentWordIndex];
                  
                  return (
                    <div
                      key={index}
                      className={`
                        border border-green-200 flex items-center justify-center text-xs font-bold
                        ${isSnake ? (isHead ? 'bg-green-600' : 'bg-green-400') : ''}
                        ${wordHere ? (isTargetWord ? 'bg-yellow-300' : 'bg-blue-200') : ''}
                      `}
                    >
                      {wordHere && (
                        <span className={isTargetWord ? 'text-red-600' : 'text-blue-600'}>
                          {wordHere.word}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {gameOver && (
                <div className="text-center mt-4 p-4 bg-red-100 rounded-lg">
                  <h3 className="text-xl font-bold text-red-800 mb-2">Game Over!</h3>
                  <p className="text-red-600">
                    Final Score: {score} | Words Collected: {currentWordIndex} | Words Missed: {missedWords.length}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <Leaderboard 
            currentScore={score}
            playerName={playerName}
            wordsCollected={currentWordIndex}
            missedWords={missedWords}
            gameOver={gameOver}
          />
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
