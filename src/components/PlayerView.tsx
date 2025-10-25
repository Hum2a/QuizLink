import { useState, useEffect, useCallback } from 'react';
import type { GameState } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface PlayerViewProps {
  gameState: GameState;
  playerId: string;
  playerName: string;
  onSubmitAnswer: (answerIndex: number) => void;
}

function PlayerView({
  gameState,
  playerId,
  playerName,
  onSubmitAnswer,
}: PlayerViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const player = gameState.players.find(p => p.id === playerId);
  const hasAnswered = player?.hasAnswered || false;

  // Reset selected answer when moving to next question
  useEffect(() => {
    if (!hasAnswered) {
      setSelectedAnswer(null);
    }
  }, [gameState.currentQuestion, hasAnswered]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (hasAnswered || gameState.showResults) return;

      // Number keys 1-4 for answer selection
      if (event.key >= '1' && event.key <= '4') {
        const answerIndex = parseInt(event.key) - 1;
        if (answerIndex < (gameState.question?.options.length || 0)) {
          setSelectedAnswer(answerIndex);
        }
      }

      // Letter keys A-D for answer selection
      if (event.key >= 'a' && event.key <= 'd') {
        const answerIndex = event.key.charCodeAt(0) - 'a'.charCodeAt(0);
        if (answerIndex < (gameState.question?.options.length || 0)) {
          setSelectedAnswer(answerIndex);
        }
      }

      // Enter key to submit answer
      if (event.key === 'Enter' && selectedAnswer !== null) {
        handleSubmit();
      }

      // Escape key to clear selection
      if (event.key === 'Escape') {
        setSelectedAnswer(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    hasAnswered,
    gameState.showResults,
    selectedAnswer,
    gameState.question?.options.length,
  ]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer !== null && !hasAnswered) {
      onSubmitAnswer(selectedAnswer);
    }
  }, [selectedAnswer, hasAnswered, onSubmitAnswer]);

  if (!gameState.question) {
    return (
      <div className="quiz-view">
        <LoadingSpinner message="Loading question..." size="medium" />
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

    if (
      selectedAnswer === index &&
      gameState.question?.correctAnswer !== index
    ) {
      return 'incorrect';
    }

    return '';
  };

  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <div className="progress-section">
          <div className="question-counter">
            Question {gameState.currentQuestion + 1} of{' '}
            {gameState.totalQuestions}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((gameState.currentQuestion + 1) / gameState.totalQuestions) *
                  100
                }%`,
              }}
            />
          </div>
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
        <div className="submit-section">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </button>
          <div className="keyboard-hints">
            <small>
              💡 Use <kbd>1-4</kbd> or <kbd>A-D</kbd> to select •{' '}
              <kbd>Enter</kbd> to submit • <kbd>Esc</kbd> to clear
            </small>
          </div>
        </div>
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
            <span>
              ❌ Incorrect. The correct answer was{' '}
              {String.fromCharCode(
                65 + (gameState.question.correctAnswer || 0)
              )}
            </span>
          )}
        </div>
      )}

      <style>{`
        .progress-section {
          flex: 1;
          margin-right: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-sm);
          transition: width var(--transition-normal);
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .question-counter {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .player-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .player-info .name {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .player-info .score {
          font-size: 0.875rem;
          color: var(--color-success);
          font-weight: 500;
        }

        .submit-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .keyboard-hints {
          text-align: center;
          color: var(--color-text-secondary);
        }

        .keyboard-hints kbd {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          font-family: monospace;
          color: var(--color-text-primary);
        }

        @media (max-width: 640px) {
          .quiz-header {
            flex-direction: column;
            gap: 1rem;
          }

          .progress-section {
            margin-right: 0;
            width: 100%;
          }

          .player-info {
            align-items: flex-start;
            flex-direction: row;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default PlayerView;
