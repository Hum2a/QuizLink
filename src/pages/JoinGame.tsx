import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaGamepad } from 'react-icons/fa';
import { userAuthService } from '../services/userAuth';
import { config } from '../config';
import '../styles/admin.css';

function JoinGame() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const user = userAuthService.getUser();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (roomCode.length < 4) {
      setError('Room code must be at least 4 characters');
      return;
    }

    try {
      setIsJoining(true);

      // Validate room exists first
      const response = await fetch(
        `${config.API_URL}/api/validate-room/${roomCode.toUpperCase()}`
      );

      if (response.status === 404) {
        setError('Room not found. Please check the room code.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to validate room');
      }

      const roomData = await response.json();

      if (!roomData.exists) {
        setError('Room not found. Please check the room code.');
        return;
      }

      // Navigate to play page with room code
      navigate(`/play?room=${roomCode.toUpperCase()}`);
    } catch (err) {
      console.error('Join game error:', err);
      setError('Failed to join game. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <Link to="/dashboard" className="btn-back">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1>
            <FaGamepad /> Join Game
          </h1>
        </div>
      </header>

      <div className="admin-dashboard">
        <div className="join-game-section">
          <div className="join-card">
            <div className="user-info">
              <div
                className="user-avatar"
                style={{ backgroundColor: user?.avatar_color || '#667eea' }}
              >
                {user?.display_name.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <h3>Playing as: {user?.display_name || 'Player'}</h3>
                <p>@{user?.username || 'guest'}</p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="join-form">
              <h2>Enter Room Code</h2>
              <p>Get the room code from the game host</p>

              {error && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={10}
                autoFocus
                disabled={isJoining}
                style={{
                  textTransform: 'uppercase',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  padding: '1rem',
                }}
              />

              <button
                type="submit"
                className="btn-primary btn-large"
                disabled={isJoining || !roomCode.trim()}
              >
                <FaGamepad /> {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            </form>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <Link to="/create-game" className="btn-secondary btn-large">
              Create Your Own Game
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .join-game-section {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        .join-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .user-info h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .user-info p {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .join-form {
          text-align: center;
        }

        .join-form h2 {
          margin-top: 0;
          color: #1f2937;
        }

        .join-form p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .join-form input {
          width: 100%;
          margin-bottom: 1.5rem;
          border: 3px solid #e5e7eb;
          border-radius: 12px;
          font-weight: 600;
        }

        .join-form input:focus {
          border-color: #667eea;
          outline: none;
        }

        .btn-large {
          width: 100%;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .or-divider {
          text-align: center;
          margin: 2rem 0;
          position: relative;
        }

        .or-divider::before,
        .or-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: #e5e7eb;
        }

        .or-divider::before {
          left: 0;
        }

        .or-divider::after {
          right: 0;
        }

        .or-divider span {
          background: white;
          padding: 0 1rem;
          color: #6b7280;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default JoinGame;
