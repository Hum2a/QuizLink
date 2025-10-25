import {
  FaUsers,
  FaPlay,
  FaCrown,
  FaSignOutAlt,
  FaCog,
  FaUserMinus,
  FaCopy,
  FaRedo,
  FaVolumeUp,
  FaLock,
  FaUnlock,
  FaSave,
  FaTimes,
  FaEdit,
  FaPowerOff,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { GameState } from '../types';
import IconPicker from './IconPicker';
import IconRenderer from './IconRenderer';

interface GameLobbyProps {
  gameState: GameState;
  playerId: string;
  isAdmin: boolean;
  onStartQuiz: () => void;
  onLogout: () => void;
  onKickPlayer?: (playerId: string) => void;
  onToggleMute?: (playerId: string) => void;
  onUpdateSettings?: (settings: Record<string, any>) => void;
  onResetGame?: () => void;
  onToggleRoomLock?: () => void;
  onUpdatePlayerIcon?: (playerId: string, iconName: string) => void;
  onCloseGame?: () => void;
  onLeaveGame?: () => void;
}

function GameLobby({
  gameState,
  playerId,
  isAdmin,
  onStartQuiz,
  onLogout,
  onKickPlayer,
  onToggleMute,
  onUpdateSettings,
  onResetGame,
  onToggleRoomLock,
  onUpdatePlayerIcon,
  onCloseGame,
  onLeaveGame,
}: GameLobbyProps) {
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlayerManagement, setShowPlayerManagement] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [roomSettings, setRoomSettings] = useState({
    maxPlayers: 10,
    timePerQuestion: 30,
    allowSpectators: true,
    roomLocked: false,
    showLeaderboard: true,
    allowLateJoin: true,
  });

  const handleIconSelect = (iconName: string) => {
    if (onUpdatePlayerIcon && currentPlayer) {
      onUpdatePlayerIcon(currentPlayer.id, iconName);
    }
    setShowIconPicker(false);
  };

  const getPlayerIcon = (player: { iconName?: string } | undefined) => {
    return <IconRenderer iconName={player?.iconName} size={24} />;
  };

  // Track player count changes for activity feed
  useEffect(() => {
    const currentCount = gameState.players.length;
    const previousCount =
      recentActivity.length > 0
        ? parseInt(recentActivity[recentActivity.length - 1].split(' ')[0]) || 0
        : 0;

    if (previousCount > 0 && currentCount !== previousCount) {
      const activityMessage = `${currentCount} players in lobby`;
      setRecentActivity(prev => [...prev.slice(-2), activityMessage]);
    }
  }, [gameState.players.length]);

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
            <div className="user-avatar-container">
              <div
                className="user-avatar"
                onClick={() => setShowIconPicker(true)}
              >
                {getPlayerIcon(currentPlayer)}
              </div>
              <button
                className="btn-edit-icon"
                onClick={() => setShowIconPicker(true)}
                title="Change Avatar"
                aria-label="Change Avatar"
              >
                <FaEdit />
              </button>
            </div>
            <div className="player-details">
              <span className="player-name">
                {currentPlayer?.name}
                {isAdmin && <FaCrown className="admin-crown" />}
              </span>
              <span className="player-role">{isAdmin ? 'Host' : 'Player'}</span>
            </div>
          </div>
          <div className="user-actions">
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="btn-leave-game"
              title="Leave Game"
            >
              <FaSignOutAlt /> Leave Game
            </button>
            <button onClick={onLogout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </div>
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
                <div className="player-avatar">{getPlayerIcon(player)}</div>
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

        {/* Activity Feed */}
        {recentActivity.length > 0 && (
          <div className="activity-feed">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-time">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <span className="activity-message">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="admin-controls">
            <div className="admin-header">
              <h3>
                <FaCrown className="admin-icon" /> Host Controls
              </h3>
              <div className="admin-actions">
                <button
                  className="btn-admin-action"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Game Settings"
                >
                  <FaCog />
                  <span>Settings</span>
                </button>
                <button
                  className="btn-admin-action"
                  onClick={() => setShowPlayerManagement(!showPlayerManagement)}
                  title="Player Management"
                >
                  <FaUsers />
                  <span>Players</span>
                </button>
                <button
                  className="btn-admin-action"
                  onClick={() =>
                    navigator.clipboard.writeText(gameState.roomCode)
                  }
                  title="Copy Room Code"
                >
                  <FaCopy />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Main Action Section */}
            <div className="main-action-section">
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

            {/* Secondary Actions */}
            <div className="secondary-actions">
              <button
                onClick={onResetGame}
                className="btn-secondary"
                title="Reset Game"
              >
                <FaRedo />
                <span>Reset</span>
              </button>
              <button
                onClick={onToggleRoomLock}
                className={`btn-secondary ${
                  roomSettings.roomLocked ? 'active' : ''
                }`}
                title={roomSettings.roomLocked ? 'Unlock Room' : 'Lock Room'}
              >
                {roomSettings.roomLocked ? <FaLock /> : <FaUnlock />}
                <span>{roomSettings.roomLocked ? 'Unlock' : 'Lock'}</span>
              </button>
              <button
                onClick={() => setShowCloseConfirm(true)}
                className="btn-secondary danger"
                title="Close Game"
              >
                <FaPowerOff />
                <span>Close</span>
              </button>
            </div>

            {/* Game Settings Panel */}
            {showSettings && (
              <div className="admin-panel settings-panel">
                <div className="panel-header">
                  <h4>Game Settings</h4>
                  <button
                    className="btn-close"
                    onClick={() => setShowSettings(false)}
                    title="Close Settings"
                    aria-label="Close Settings"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="settings-grid">
                  <div className="setting-item">
                    <label>Max Players</label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={roomSettings.maxPlayers}
                      onChange={e =>
                        setRoomSettings({
                          ...roomSettings,
                          maxPlayers: parseInt(e.target.value),
                        })
                      }
                      aria-label="Maximum number of players"
                    />
                  </div>
                  <div className="setting-item">
                    <label>Time per Question (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={roomSettings.timePerQuestion}
                      onChange={e =>
                        setRoomSettings({
                          ...roomSettings,
                          timePerQuestion: parseInt(e.target.value),
                        })
                      }
                      aria-label="Time per question in seconds"
                    />
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={roomSettings.allowSpectators}
                        onChange={e =>
                          setRoomSettings({
                            ...roomSettings,
                            allowSpectators: e.target.checked,
                          })
                        }
                      />
                      Allow Spectators
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={roomSettings.showLeaderboard}
                        onChange={e =>
                          setRoomSettings({
                            ...roomSettings,
                            showLeaderboard: e.target.checked,
                          })
                        }
                      />
                      Show Leaderboard
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={roomSettings.allowLateJoin}
                        onChange={e =>
                          setRoomSettings({
                            ...roomSettings,
                            allowLateJoin: e.target.checked,
                          })
                        }
                      />
                      Allow Late Join
                    </label>
                  </div>
                </div>
                <div className="panel-actions">
                  <button
                    className="btn-save"
                    onClick={() => {
                      onUpdateSettings?.(roomSettings);
                      setShowSettings(false);
                    }}
                  >
                    <FaSave /> Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Player Management Panel */}
            {showPlayerManagement && (
              <div className="admin-panel player-panel">
                <div className="panel-header">
                  <h4>Player Management</h4>
                  <button
                    className="btn-close"
                    onClick={() => setShowPlayerManagement(false)}
                    title="Close Player Management"
                    aria-label="Close Player Management"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="player-list-admin">
                  {gameState.players.map(player => (
                    <div key={player.id} className="player-item-admin">
                      <div className="player-info">
                        <div className="player-avatar">
                          {getPlayerIcon(player)}
                        </div>
                        <div className="player-details">
                          <span className="player-name">
                            {player.name}
                            {player.isAdmin && (
                              <FaCrown className="admin-crown" />
                            )}
                          </span>
                          <span className="player-role">
                            {player.isAdmin ? 'Host' : 'Player'}
                          </span>
                        </div>
                      </div>
                      <div className="player-actions">
                        {!player.isAdmin && (
                          <>
                            <button
                              className="btn-player-action"
                              onClick={() => onToggleMute?.(player.id)}
                              title="Toggle Mute"
                            >
                              <FaVolumeUp />
                            </button>
                            <button
                              className="btn-player-action danger"
                              onClick={() => onKickPlayer?.(player.id)}
                              title="Kick Player"
                            >
                              <FaUserMinus />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Players:</span>
                    <span className="stat-value">
                      {gameState.players.length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Admins:</span>
                    <span className="stat-value">
                      {gameState.players.filter(p => p.isAdmin).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
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

      {/* Close Game Confirmation Modal */}
      {showCloseConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Close Game</h3>
              <button
                className="btn-close"
                onClick={() => setShowCloseConfirm(false)}
                title="Cancel"
                aria-label="Cancel"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to close this game?</p>
              <p className="warning-text">
                This will end the game for all players and cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCloseConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  onCloseGame?.();
                  setShowCloseConfirm(false);
                }}
              >
                <FaPowerOff /> Close Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Game Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Leave Game</h3>
              <button
                className="btn-close"
                onClick={() => setShowLeaveConfirm(false)}
                title="Cancel"
                aria-label="Cancel"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to leave this game?</p>
              <p className="warning-text">
                You will be removed from the game and redirected to the
                dashboard.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-warning"
                onClick={() => {
                  onLeaveGame?.();
                  setShowLeaveConfirm(false);
                }}
              >
                <FaSignOutAlt /> Leave Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      <IconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={handleIconSelect}
        currentIcon={currentPlayer?.iconName}
      />
    </div>
  );
}

export default GameLobby;
