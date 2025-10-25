import { useState, useEffect } from 'react';
import { FaGamepad, FaInfoCircle } from 'react-icons/fa';

interface JoinScreenProps {
  onJoin: (name: string, isAdmin: boolean, roomCode?: string) => void;
  isConnecting?: boolean;
  error?: string;
  defaultName?: string;
}

function JoinScreen({
  onJoin,
  isConnecting,
  error,
  defaultName = '',
}: JoinScreenProps) {
  const [name, setName] = useState(defaultName);
  const [roomCode, setRoomCode] = useState('QUIZLINK');

  // Update name if defaultName changes
  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  const handleJoinAsPlayer = () => {
    console.log('Join as Player clicked', { name, roomCode });
    if (name.trim() && roomCode.trim()) {
      console.log('Calling onJoin with player data');
      onJoin(name.trim(), false, roomCode.trim().toUpperCase());
    } else {
      console.log('Missing name or room code', {
        name: name.trim(),
        roomCode: roomCode.trim(),
      });
    }
  };

  const handleJoinAsAdmin = () => {
    console.log('Join as Admin clicked', { name, roomCode });
    if (name.trim() && roomCode.trim()) {
      console.log('Calling onJoin with admin data');
      onJoin(name.trim(), true, roomCode.trim().toUpperCase());
    } else {
      console.log('Missing name or room code', {
        name: name.trim(),
        roomCode: roomCode.trim(),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleJoinAsPlayer();
    }
  };

  return (
    <div className="join-screen">
      <h1>
        <FaGamepad className="title-icon" /> QuizLink
      </h1>
      <p className="subtitle">Join the fun and test your knowledge!</p>

      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyPress={handleKeyPress}
        maxLength={20}
        autoFocus
        disabled={isConnecting}
      />

      <input
        type="text"
        placeholder="Room Code (e.g., QUIZLINK)"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value.toUpperCase())}
        maxLength={20}
        disabled={isConnecting}
      />

      <button
        className="btn-player"
        onClick={handleJoinAsPlayer}
        disabled={!name.trim() || !roomCode.trim() || isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Join as Player'}
      </button>

      <button
        className="btn-admin"
        onClick={handleJoinAsAdmin}
        disabled={!name.trim() || !roomCode.trim() || isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Join as Admin'}
      </button>

      <div className="room-code">
        <p>
          <FaInfoCircle /> Tip: Use the same room code to join together!
        </p>
      </div>
    </div>
  );
}

export default JoinScreen;
