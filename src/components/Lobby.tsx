import type { Player } from '../types';
import { FaCrown, FaUsers } from 'react-icons/fa';

interface LobbyProps {
  players: Player[];
  isAdmin: boolean;
  onStartQuiz: () => void;
  roomCode: string;
}

function Lobby({ players, isAdmin, onStartQuiz, roomCode }: LobbyProps) {
  const playerCount = players.filter(p => !p.isAdmin).length;

  return (
    <div className="lobby">
      <h2><FaUsers /> Waiting Room</h2>
      
      <div className="room-code">
        <p>Room Code: <strong>{roomCode}</strong></p>
        <p>{playerCount} player{playerCount !== 1 ? 's' : ''} joined</p>
      </div>

      <div className="players-list">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`player-item ${player.isAdmin ? 'admin' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            {player.isAdmin && (
              <span className="player-badge"><FaCrown /> Host</span>
            )}
          </div>
        ))}
      </div>

      {isAdmin ? (
        <div className="admin-controls">
          <button 
            onClick={onStartQuiz}
            disabled={playerCount === 0}
          >
            Start Quiz
          </button>
          {playerCount === 0 && (
            <p className="waiting-message">
              Waiting for players to join...
            </p>
          )}
        </div>
      ) : (
        <p className="waiting-message">
          Waiting for the host to start the quiz...
        </p>
      )}
    </div>
  );
}

export default Lobby;

