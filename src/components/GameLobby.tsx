import { FaUsers, FaPlay, FaCrown, FaSignOutAlt } from 'react-icons/fa';
import type { GameState } from '../types';

interface GameLobbyProps {
  gameState: GameState;
  playerId: string;
  isAdmin: boolean;
  onStartQuiz: () => void;
  onLogout: () => void;
}

function GameLobby({
  gameState,
  playerId,
  isAdmin,
  onStartQuiz,
  onLogout,
}: GameLobbyProps) {
  const currentPlayer = gameState.players.find(p => p.id === playerId);

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <div className="room-info">
          <h1>🎮 Game Room</h1>
          <div className="room-code">
            <span className="code-label">Room Code:</span>
            <span className="code-value">{gameState.roomCode}</span>
          </div>
        </div>

        <div className="player-info">
          <div className="current-player">
            <span className="player-name">
              {currentPlayer?.name}
              {isAdmin && <FaCrown className="admin-crown" />}
            </span>
            <span className="player-role">{isAdmin ? 'Host' : 'Player'}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="lobby-content">
        <div className="players-section">
          <h2>
            <FaUsers /> Players ({gameState.players.length})
          </h2>
          <div className="players-list">
            {gameState.players.map(player => (
              <div
                key={player.id}
                className={`player-card ${
                  player.id === playerId ? 'current-player' : ''
                } ${player.isAdmin ? 'admin' : ''}`}
              >
                <div className="player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="player-details">
                  <span className="player-name">
                    {player.name}
                    {player.isAdmin && <FaCrown className="admin-crown" />}
                  </span>
                  <span className="player-role">
                    {player.isAdmin ? 'Host' : 'Player'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="admin-controls">
            <h3>Host Controls</h3>
            <button
              onClick={onStartQuiz}
              className="btn-start-quiz"
              disabled={gameState.players.length < 1}
            >
              <FaPlay /> Start Quiz
            </button>
            <p className="start-hint">
              {gameState.players.length < 1
                ? 'Wait for players to join...'
                : `Ready to start with ${gameState.players.length} player${
                    gameState.players.length === 1 ? '' : 's'
                  }!`}
            </p>
          </div>
        )}

        {!isAdmin && (
          <div className="waiting-section">
            <h3>Waiting for Host</h3>
            <p>The host will start the quiz when ready!</p>
            <div className="waiting-animation">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lobby-footer">
        <p className="room-tip">
          💡 Share the room code <strong>{gameState.roomCode}</strong> with
          friends to invite them!
        </p>
      </div>
    </div>
  );
}

export default GameLobby;
