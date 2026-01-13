import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { NBA_LINEUPS } from './lineups';

export default function NBAStarting5Game() {
  const [currentLineup, setCurrentLineup] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [revealedPlayers, setRevealedPlayers] = useState(1);
  const [guess, setGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [guessHistory, setGuessHistory] = useState([]);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomLineup = NBA_LINEUPS[Math.floor(Math.random() * NBA_LINEUPS.length)];
    setCurrentLineup(randomLineup);
    setAttempts(0);
    setRevealedPlayers(1);
    setGuess('');
    setGameStatus('playing');
    setGuessHistory([]);
  };

  const handleGuess = (e) => {
    e.preventDefault();
    
    if (!guess || attempts >= 6 || gameStatus !== 'playing') return;

    const guessedYear = parseInt(guess);
    const newAttempts = attempts + 1;
    
    setGuessHistory([...guessHistory, guessedYear]);
    setAttempts(newAttempts);

    if (guessedYear === currentLineup.year) {
      setGameStatus('won');
    } else if (newAttempts >= 6) {
      setGameStatus('lost');
      setRevealedPlayers(5);
    } else {
      setRevealedPlayers(Math.min(newAttempts + 1, 5));
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
          <p className="text-slate-400 text-sm mt-2">25 years of NBA Finals teams</p>
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
            <p className="text-lg">
              It was the {currentLineup.year} {currentLineup.team}
            </p>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="bg-red-600 rounded-lg p-6 mb-6 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-lg">
              The answer was {currentLineup.year} {currentLineup.team}
            </p>
          </div>
        )}

        {gameStatus === 'playing' && (
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

        {gameStatus !== 'playing' && (
          <button
            onClick={startNewGame}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
        )}

        <div className="mt-8 text-center text-slate-400 text-sm">
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