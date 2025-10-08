import type { GameState } from '../types';
import { FaUsers, FaGamepad } from 'react-icons/fa';
import { IoGameController } from 'react-icons/io5';

interface AdminViewProps {
  gameState: GameState;
  onRevealAnswers: () => void;
  onNextQuestion: () => void;
  onReset: () => void;
}

function AdminView({ gameState, onRevealAnswers, onNextQuestion, onReset }: AdminViewProps) {
  const nonAdminPlayers = gameState.players.filter(p => !p.isAdmin);
  const answeredCount = nonAdminPlayers.filter(p => p.hasAnswered).length;
  const allAnswered = answeredCount === nonAdminPlayers.length && nonAdminPlayers.length > 0;

  if (!gameState.question) {
    return (
      <div className="admin-view">
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="admin-header">
        <h2><IoGameController /> Admin Control Panel</h2>
        <div className="question-counter">
          Question {gameState.currentQuestion + 1} of {gameState.totalQuestions}
        </div>
      </div>

      <div className="admin-question-section">
        <h3 className="question-text">{gameState.question.question}</h3>
        
        <div className="options-grid">
          {gameState.question.options.map((option, index) => (
            <div
              key={index}
              className={`option-button ${
                gameState.showResults && gameState.question?.correctAnswer === index ? 'correct' : ''
              }`}
            >
              {String.fromCharCode(65 + index)}. {option}
            </div>
          ))}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-section">
          <h3><FaUsers /> Players ({answeredCount}/{nonAdminPlayers.length})</h3>
          {nonAdminPlayers.map((player) => (
            <div 
              key={player.id} 
              className={`player-status ${player.hasAnswered ? 'answered' : ''}`}
            >
              <span>{player.name}</span>
              <div className="admin-player-score">
                <span>{player.score} pts</span>
                <div className={`status-indicator ${player.hasAnswered ? 'answered' : ''}`} />
              </div>
            </div>
          ))}
          {nonAdminPlayers.length === 0 && (
            <p className="admin-waiting-text">No players yet</p>
          )}
        </div>

        <div className="admin-section">
          <h3><FaGamepad /> Controls</h3>
          <div className="admin-controls-grid">
            {!gameState.showResults ? (
              <button 
                className="btn-reveal"
                onClick={onRevealAnswers}
                disabled={!allAnswered}
              >
                Reveal Answers
                {!allAnswered && ` (${answeredCount}/${nonAdminPlayers.length})`}
              </button>
            ) : (
              <button 
                className="btn-next"
                onClick={onNextQuestion}
              >
                {gameState.currentQuestion < gameState.totalQuestions - 1 
                  ? 'Next Question' 
                  : 'Show Results'}
              </button>
            )}
            
            <button 
              className="btn-reset"
              onClick={onReset}
            >
              Reset Game
            </button>
          </div>

          {!allAnswered && !gameState.showResults && (
            <p className="admin-waiting-text">
              Waiting for all players to answer...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminView;

