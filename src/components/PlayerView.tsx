import { useState, useEffect } from 'react';
import type { GameState } from '../types';

interface PlayerViewProps {
  gameState: GameState;
  playerId: string;
  playerName: string;
  onSubmitAnswer: (answerIndex: number) => void;
}

function PlayerView({ gameState, playerId, playerName, onSubmitAnswer }: PlayerViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const player = gameState.players.find(p => p.id === playerId);
  const hasAnswered = player?.hasAnswered || false;

  // Reset selected answer when moving to next question
  useEffect(() => {
    if (!hasAnswered) {
      setSelectedAnswer(null);
    }
  }, [gameState.currentQuestion, hasAnswered]);

  const handleSubmit = () => {
    if (selectedAnswer !== null && !hasAnswered) {
      onSubmitAnswer(selectedAnswer);
    }
  };

  if (!gameState.question) {
    return (
      <div className="quiz-view">
        <p>Loading question...</p>
      </div>
    );
  }

  const getOptionClass = (index: number) => {
    if (!gameState.showResults) {
      return selectedAnswer === index ? 'selected' : '';
    }
    
    if (gameState.question?.correctAnswer === index) {
      return 'correct';
    }
    
    if (selectedAnswer === index && gameState.question?.correctAnswer !== index) {
      return 'incorrect';
    }
    
    return '';
  };

  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <div className="question-counter">
          Question {gameState.currentQuestion + 1} of {gameState.totalQuestions}
        </div>
        <div className="player-info">
          <div className="name">{playerName}</div>
          <div className="score">{player?.score || 0} pts</div>
        </div>
      </div>

      <h2 className="question-text">{gameState.question.question}</h2>

      <div className="options-grid">
        {gameState.question.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${getOptionClass(index)}`}
            onClick={() => !hasAnswered && setSelectedAnswer(index)}
            disabled={hasAnswered}
          >
            {String.fromCharCode(65 + index)}. {option}
          </button>
        ))}
      </div>

      {!hasAnswered && !gameState.showResults && (
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
        >
          Submit Answer
        </button>
      )}

      {hasAnswered && !gameState.showResults && (
        <div className="waiting-for-others">
          ✓ Answer submitted! Waiting for others...
        </div>
      )}

      {gameState.showResults && (
        <div className="waiting-for-others">
          {gameState.question.correctAnswer === selectedAnswer ? (
            <span>🎉 Correct! +100 points</span>
          ) : (
            <span>❌ Incorrect. The correct answer was {String.fromCharCode(65 + (gameState.question.correctAnswer || 0))}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default PlayerView;

