import React, { useState, useEffect } from 'react';
import { Trophy, Share2, Check } from 'lucide-react';
import { NBA_LINEUPS } from './lineups';

export default function NBAStarting5Game() {
  const [currentLineup, setCurrentLineup] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [revealedPlayers, setRevealedPlayers] = useState(1);
  const [guess, setGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [guessHistory, setGuessHistory] = useState([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get today's date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get deterministic lineup based on date
  const getLineupForDate = (dateString) => {
    // Simple hash function to get consistent index from date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % NBA_LINEUPS.length;
    return NBA_LINEUPS[index];
  };

  // Load game state from localStorage
  useEffect(() => {
    const todayDate = getTodayDateString();
    const savedData = localStorage.getItem('nbaStarting5Game');
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      
      // Check if the saved game is from today
      if (parsed.date === todayDate) {
        setCurrentLineup(parsed.lineup);
        setAttempts(parsed.attempts);
        setRevealedPlayers(parsed.revealedPlayers);
        setGameStatus(parsed.gameStatus);
        setGuessHistory(parsed.guessHistory);
        setHasPlayedToday(parsed.gameStatus !== 'playing');
      } else {
        // New day, start fresh
        startNewGame();
      }
    } else {
      startNewGame();
    }
  }, []);

  const startNewGame = () => {
    const todayDate = getTodayDateString();
    const lineup = getLineupForDate(todayDate);
    
    setCurrentLineup(lineup);
    setAttempts(0);
    setRevealedPlayers(1);
    setGuess('');
    setGameStatus('playing');
    setGuessHistory([]);
    setHasPlayedToday(false);
    
    // Save to localStorage
    localStorage.setItem('nbaStarting5Game', JSON.stringify({
      date: todayDate,
      lineup: lineup,
      attempts: 0,
      revealedPlayers: 1,
      gameStatus: 'playing',
      guessHistory: []
    }));
  };

  const saveGameState = (newAttempts, newRevealed, newStatus, newHistory) => {
    const todayDate = getTodayDateString();
    localStorage.setItem('nbaStarting5Game', JSON.stringify({
      date: todayDate,
      lineup: currentLineup,
      attempts: newAttempts,
      revealedPlayers: newRevealed,
      gameStatus: newStatus,
      guessHistory: newHistory
    }));
  };

  const handleGuess = (e) => {
    e.preventDefault();
    
    if (!guess || attempts >= 6 || gameStatus !== 'playing') return;

    const guessedYear = parseInt(guess);
    const newAttempts = attempts + 1;
    const newHistory = [...guessHistory, guessedYear];
    
    setGuessHistory(newHistory);
    setAttempts(newAttempts);

    if (guessedYear === currentLineup.year) {
      setGameStatus('won');
      setHasPlayedToday(true);
      saveGameState(newAttempts, revealedPlayers, 'won', newHistory);
    } else if (newAttempts >= 6) {
      setGameStatus('lost');
      setRevealedPlayers(5);
      setHasPlayedToday(true);
      saveGameState(newAttempts, 5, 'lost', newHistory);
    } else {
      const newRevealed = Math.min(newAttempts + 1, 5);
      setRevealedPlayers(newRevealed);
      saveGameState(newAttempts, newRevealed, 'playing', newHistory);
    }
    
    setGuess('');
  };

  const getRewardMessage = () => {
    switch (attempts) {
      case 1: return "🌟 SUPERSTAR! First try legend!";
      case 2: return "🔥 ALL-STAR! Incredible knowledge!";
      case 3: return "⭐ STARTER! Great job!";
      case 4: return "👍 SIXTH MAN! Nice work!";
      case 5: return "✓ ROTATION PLAYER! You got it!";
      case 6: return "📋 BENCHWARMER! Barely made it!";
      default: return "";
    }
  };

  const generateShareText = () => {
    const todayDate = getTodayDateString();
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    let resultText = gameStatus === 'won' ? `${attempts}/6` : 'X/6';
    let squares = '';
    
    guessHistory.forEach((yearGuess) => {
      if (yearGuess === currentLineup.year) {
        squares += '🟩';
      } else {
        squares += '🟥';
      }
    });
    
    // Add remaining attempts as gray squares if lost
    if (gameStatus === 'lost') {
      while (squares.length < 6) {
        squares += '⬜';
      }
    }
    
    return `NBA Starting 5 Game\n${formattedDate}\n${resultText}\n\n${squares}\n\nhttps://nba-starting-5.netlify.app/`;
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (!currentLineup) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="text-yellow-400" size={36} />
            NBA Starting 5
          </h1>
          <p className="text-slate-300 text-lg">Guess the year of this starting lineup!</p>
          <p className="text-slate-400 text-sm mt-2">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold ${
                i < guessHistory.length
                  ? guessHistory[i] === currentLineup.year
                    ? 'bg-green-500 border-green-500'
                    : 'bg-red-500 border-red-500'
                  : i === attempts
                  ? 'border-blue-400'
                  : 'border-slate-600'
              }`}
            >
              {i < guessHistory.length && (
                <span className="text-sm">{guessHistory[i]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Players Revealed ({revealedPlayers}/5)
          </h2>
          <div className="space-y-3">
            {currentLineup.players.slice(0, revealedPlayers).map((player, idx) => (
              <div
                key={idx}
                className="bg-slate-700 p-3 rounded text-center font-medium text-lg animate-fadeIn"
              >
                {player}
              </div>
            ))}
          </div>
        </div>

        {gameStatus === 'won' && (
          <div className="bg-green-600 rounded-lg p-6 mb-6 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">🎉 Correct!</h2>
            <p className="text-xl mb-2">{getRewardMessage()}</p>
            <p className="text-lg mb-4">
              It was the {currentLineup.year} {currentLineup.team}
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 size={20} />
                  Share Results
                </>
              )}
            </button>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="bg-red-600 rounded-lg p-6 mb-6 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-lg mb-4">
              The answer was {currentLineup.year} {currentLineup.team}
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 size={20} />
                  Share Results
                </>
              )}
            </button>
          </div>
        )}

        {gameStatus === 'playing' && !hasPlayedToday && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuess(e)}
                placeholder="Enter year (e.g., 2016)"
                className="flex-1 px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none text-lg"
                min="2000"
                max="2024"
              />
              <button
                onClick={handleGuess}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors"
              >
                Guess
              </button>
            </div>
          </div>
        )}

        {hasPlayedToday && (
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <h3 className="text-xl font-semibold mb-2">Come back tomorrow!</h3>
            <p className="text-slate-300">Next puzzle in {getTimeUntilMidnight()}</p>
          </div>
        )}

        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>New puzzle every day at midnight!</p>
          <p>You have 6 attempts to guess the year.</p>
          <p>A new player is revealed with each wrong guess.</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}