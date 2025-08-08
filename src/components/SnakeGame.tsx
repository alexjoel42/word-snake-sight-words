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
const WORD_REPEAT_DELAY = 19000; // 10 seconds

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
  const [currentWords, setCurrentWords] = useState([]);
  const [wordCategories, setWordCategories] = useState({});
  const [currentCategory, setCurrentCategory] = useState('');
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [lastWordTime, setLastWordTime] = useState(0);

  // Helper function to get words from categories in order
  const getRandomWordsFromCategories = () => {
    const categoryOrder = [
      'shortVowels',
      'digraphs',
      'blends', 
      'longVowels',
      'vowelTeams',
      'diphthongs',
      'inflectedEndings',
      'multisyllabic'
    ];

    let allWords = [];
    let categoryMap = {};

    for (const category of categoryOrder) {
      const shuffled = [...sightWords[category]].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5); // Take 5 random words from each category
      
      selected.forEach(word => {
        categoryMap[word] = category;
        categoryMap[`${word}_category`] = category;
      });
      
      allWords = [...allWords, ...selected];
    }

    return {
      words: allWords, // Keep in category order
      categories: categoryMap
    };
  };

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

    speak(); // Speak immediately
    // setTimeout(speak, 3000); // Speak again after 3 seconds
  }, [voiceEnabled, selectedVoice, availableVoices]);

  // Initialize game
  const startNewGame = useCallback(() => {
    const { words, categories } = getRandomWordsFromCategories();
    setCurrentWords(words);
    setWordCategories(categories);
    
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setCurrentWordIndex(0);
    setScore(0);
    setGameOver(false);
    setMissedWords([]);
    setSpeed(INITIAL_SPEED);
    setTimeElapsed(0);
    setHighlightedWord(null);
    setLastWordTime(0);
    
    // Set initial category
    if (words[0]) {
      setCurrentCategory(categories[`${words[0]}_category`]);
    }
    
    // Place initial words on board (first 5 words)
    const initialWords = words.slice(0, 5).map((word) => ({
      word,
      position: generateRandomPosition()
    }));
    setWordsOnBoard(initialWords);
    
    // Speak the first word twice
    if (words[0]) {
      setTimeout(() => speakWord(words[0]), 500);
      setLastWordTime(Date.now());
    }
  }, [generateRandomPosition, speakWord]);

  // Check if word needs to be repeated
  useEffect(() => {
    if (!gameRunning || gameOver || currentWords.length === 0) return;

    const checkRepeat = setInterval(() => {
      if (Date.now() - lastWordTime > WORD_REPEAT_DELAY) {
        const currentWord = currentWords[currentWordIndex];
        speakWord(currentWord);
        setHighlightedWord(currentWord);
        setLastWordTime(Date.now());
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
          setHighlightedWord(null);
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(checkRepeat);
  }, [gameRunning, gameOver, currentWordIndex, lastWordTime, currentWords, speakWord]);

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
      
      // Move head with wrapping
      head.x += direction.x;
      if (head.x < 0) head.x = BOARD_SIZE - 1;
      if (head.x >= BOARD_SIZE) head.x = 0;
      head.y += direction.y;
      if (head.y < 0) head.y = BOARD_SIZE - 1;
      if (head.y >= BOARD_SIZE) head.y = 0;
      
      // Handle self-collision (shrink snake)
      const collisionIndex = newSnake.findIndex(segment => segment.x === head.x && segment.y === head.y);
      if (collisionIndex > 0) {
        newSnake.splice(collisionIndex);
        setSpeed(prev => Math.min(prev + SPEED_INCREMENT * 2, INITIAL_SPEED));
        return newSnake;
      }
      
      newSnake.unshift(head);
      
      // Check word collection
      const targetWord = currentWords[currentWordIndex];
      const wordOnBoard = wordsOnBoard.find(w => w.word === targetWord);
      
      if (wordOnBoard && head.x === wordOnBoard.position.x && head.y === wordOnBoard.position.y) {
        setScore(prev => prev + 10);
        setSpeed(prev => Math.max(prev - SPEED_INCREMENT, MIN_SPEED));
        
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        setLastWordTime(Date.now());
        setHighlightedWord(null);
        
        // Check if game is complete
        if (nextIndex >= currentWords.length) {
          setGameOver(true);
          setGameRunning(false);
          speakWord("Congratulations! You collected all the words!");
          return newSnake;
        }
        
        // Check if moving to new category
        const currentCat = wordCategories[`${targetWord}_category`];
        const nextWord = currentWords[nextIndex];
        const nextCat = wordCategories[`${nextWord}_category`];
        
        if (currentCat !== nextCat) {
          speakWord(`Great job! Now let's try ${nextCat.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
        
        setCurrentCategory(nextCat);
        
        // Speak the new target word
        setTimeout(() => speakWord(nextWord), 500);
        
        // Place next set of words (current + next 4)
        const nextWordsToShow = currentWords.slice(
          nextIndex,
          Math.min(nextIndex + 5, currentWords.length)
        );
        
        const newBoardWords = nextWordsToShow.map(word => ({
          word,
          position: generateRandomPosition()
        }));
        
        setWordsOnBoard(newBoardWords);
        
        return newSnake;
      }
      
      // Check wrong word collision
      const wrongWord = wordsOnBoard.find(w => 
        w.position.x === head.x && w.position.y === head.y && w.word !== targetWord
      );
      
      if (wrongWord) {
        setMissedWords(prev => [...prev, wrongWord.word]);
        speakWord("Try again! Look for: " + targetWord);
        
        // Move wrong word to new position
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
  }, [direction, gameOver, gameRunning, currentWordIndex, wordsOnBoard, speakWord, generateRandomPosition, currentWords, wordCategories]);

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
      const isHighlighted = wordHere && highlightedWord === wordHere.word;
      
      return (
        <div
          key={index}
          className={`border border-gray-200 flex items-center justify-center text-xs font-bold
            ${isSnake ? 'bg-green-500' : ''}
            ${wordHere ? 'bg-blue-100' : ''}
            ${isHighlighted ? '!bg-green-200' : ''}`}
        >
          {wordHere && !isSnake && (
            <span className={`text-blue-800 ${isHighlighted ? 'font-extrabold text-lg' : ''}`}>
              {wordHere.word}
            </span>
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
          Score: {score} | Level: {currentCategory} | 
          Words: {currentWordIndex % 5 + 1}/5 | 
          Time: {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
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
      {gameOver && (
        <div className="text-center p-4 bg-yellow-100 rounded-lg">
          <h3 className="text-xl font-bold">
            {currentWordIndex >= currentWords.length ? 
              "You won! Great job!" : 
              `The target word was: ${currentWords[currentWordIndex]}`}
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