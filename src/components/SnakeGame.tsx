import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Leaderboard from './Leaderboard';
import { sightWords } from '../data/sightWords';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronDown } from 'lucide-react';

// Game constants
const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 300;
const SPEED_INCREMENT = 15;
const MIN_SPEED = 80;

const SnakeGame = () => {
  // Game state
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [wordsOnBoard, setWordsOnBoard] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [missedWords, setMissedWords] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Generate random position for words
  const generateRandomPosition = useCallback(() => {
    let position;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      position = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
      attempts++;
    } while (
      attempts < maxAttempts && 
      snake.some(segment => segment.x === position.x && segment.y === position.y)
    );
    
    return position;
  }, [snake]);

  // Enhanced speech function with double pronunciation
  const speakWord = useCallback((word) => {
    if (!voiceEnabled || !selectedVoice) return;
    
    window.speechSynthesis.cancel();
    
    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Speech error:', error);
      }
    };

    // Speak immediately
    speak();
    
    // Speak again after 3 seconds
    setTimeout(speak, 3000);
  }, [voiceEnabled, selectedVoice, availableVoices]);

  // Initialize game
  const startNewGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setCurrentWordIndex(0);
    setScore(0);
    setGameOver(false);
    setMissedWords([]);
    setSpeed(INITIAL_SPEED);
    setTimeElapsed(0);
    
    // Place initial words on board
    const initialWords = sightWords.slice(0, 5).map((word) => ({
      word,
      position: generateRandomPosition()
    }));
    setWordsOnBoard(initialWords);
    
    // Speak the first word twice
    if (sightWords[0]) {
      setTimeout(() => speakWord(sightWords[0]), 500);
    }
  }, [generateRandomPosition, speakWord]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.filter(v => v.lang.includes('en')));
      
      const preferredVoices = [
        'Samantha', // macOS
        'Google US English', // Chrome
        'Microsoft Zira', // Windows Edge
        'Karen', // Australian
        'Tessa' // South African
      ];
      
      const foundVoice = voices.find(v => 
        preferredVoices.includes(v.name) && v.lang.includes('en')
      );
      
      if (foundVoice) setSelectedVoice(foundVoice.name);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameRunning && !gameOver) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameRunning, gameOver]);

  // Game movement logic
  const moveSnake = useCallback(() => {
    if (gameOver || !gameRunning) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += direction.x;
      head.y += direction.y;
      
      // Check collisions
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }
      
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }
      
      newSnake.unshift(head);
      
      // Check word collection
      const targetWord = sightWords[currentWordIndex];
      const wordOnBoard = wordsOnBoard.find(w => w.word === targetWord);
      
      if (wordOnBoard && head.x === wordOnBoard.position.x && head.y === wordOnBoard.position.y) {
        setScore(prev => prev + 10);
        setSpeed(prev => Math.max(prev - SPEED_INCREMENT, MIN_SPEED));
        
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        
        if (nextIndex >= sightWords.length) {
          setGameOver(true);
          setGameRunning(false);
          speakWord("Congratulations! You collected all the words!");
          return newSnake;
        }
        
        // Speak the new target word
        setTimeout(() => speakWord(sightWords[nextIndex]), 500);
        
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
          setWordsOnBoard(prev => prev.filter(w => w.word !== targetWord));
        }
        
        return newSnake;
      }
      
      // Check wrong word collision
      const wrongWord = wordsOnBoard.find(w => 
        w.position.x === head.x && w.position.y === head.y && w.word !== targetWord
      );
      
      if (wrongWord) {
        setMissedWords(prev => [...prev, wrongWord.word]);
        speakWord("Try again!");
        
        setWordsOnBoard(prev => prev.map(w => 
          w.word === wrongWord.word 
            ? { ...w, position: generateRandomPosition() }
            : w
        ));
        
        return newSnake;
      }
      
      newSnake.pop();
      return newSnake;
    });
  }, [direction, gameOver, gameRunning, currentWordIndex, wordsOnBoard, speakWord, generateRandomPosition]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (!gameRunning) return;
      
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

  // Game loop
  useEffect(() => {
    if (!gameRunning) return;
    
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, gameRunning, speed]);

  // Toggle game state
  const toggleGame = () => {
    if (gameOver) {
      startNewGame();
    }
    setGameRunning(!gameRunning);
  };

  // Initialize game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  const renderGameBoard = () => {
    return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
      const x = index % BOARD_SIZE;
      const y = Math.floor(index / BOARD_SIZE);
      const isSnake = snake.some(segment => segment.x === x && segment.y === y);
      const wordHere = wordsOnBoard.find(w => w.position.x === x && w.position.y === y);
      
      return (
        <div
          key={index}
          className={`border border-gray-200 flex items-center justify-center text-xs font-bold
            ${isSnake ? 'bg-green-500' : ''}
            ${wordHere ? 'bg-blue-100' : ''}`}
        >
          {wordHere && !isSnake && (
            <span className="text-blue-800">{wordHere.word}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Controls */}
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
          <Button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {voiceEnabled ? 'Sound On' : 'Sound Off'}
          </Button>
        </div>
        
        <div className="text-xl font-bold text-green-800">
          Score: {score} | Words: {currentWordIndex}/{sightWords.length} | Time: {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
        </div>
      </div>

      {/* Voice Selection Dropdown */}
      <div className="relative">
        <Button 
          onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
          variant="outline"
          className="flex items-center gap-2"
        >
          {selectedVoice || "Select Voice"}
          <ChevronDown className="w-4 h-4" />
        </Button>
        {showVoiceDropdown && (
          <div className="absolute z-10 mt-1 w-56 bg-white shadow-lg rounded-md p-1">
            {availableVoices.map(voice => (
              <div
                key={voice.name}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedVoice === voice.name ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedVoice(voice.name);
                  setShowVoiceDropdown(false);
                }}
              >
                {voice.name} ({voice.lang})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid bg-gray-50 border-2 border-gray-300 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          width: '600px',
          height: '600px'
        }}>
        {renderGameBoard()}
      </div>

      {/* Feedback Display */}
      {gameOver && currentWordIndex < sightWords.length && (
        <div className="text-center p-4 bg-yellow-100 rounded-lg">
          <h3 className="text-xl font-bold">
            The target word was: <span className="text-red-600 underline">{sightWords[currentWordIndex]}</span>
          </h3>
        </div>
      )}

      {/* Leaderboard */}
      <Leaderboard 
        currentScore={score}
        playerName={playerName}
        wordsCollected={currentWordIndex}
        missedWords={missedWords}
        gameOver={gameOver}
      />
    </div>
  );
};

export default SnakeGame;