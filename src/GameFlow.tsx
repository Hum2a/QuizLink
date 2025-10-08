import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import JoinScreen from './components/JoinScreen';
import Lobby from './components/Lobby';
import PlayerView from './components/PlayerView';
import AdminView from './components/AdminView';
import ResultsView from './components/ResultsView';
import type { GameState } from './types';
import { WebSocketClient } from './websocket-client';
import { config } from './config';
import { userAuthService } from './services/userAuth';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

function GameFlow() {
  const navigate = useNavigate();
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [roomCode, setRoomCode] = useState<string>('QUIZLINK');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState(userAuthService.getUser());

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!userAuthService.isAuthenticated()) {
        navigate('/register');
        return;
      }

      // Verify token is still valid
      const user = await userAuthService.getCurrentUser();
      if (!user) {
        navigate('/register');
      } else {
        setCurrentUser(user);
        setPlayerName(user.display_name);
      }
    };

    checkAuth();
  }, [navigate]);

  const connectToRoom = async (code: string) => {
    setIsConnecting(true);
    setError('');
    
    try {
      const client = new WebSocketClient(config.WS_URL, code);
      
      client.on('game-state-update', (state: GameState) => {
        setGameState(state);
      });

      client.on('join-success', ({ playerId, isAdmin }) => {
        setPlayerId(playerId);
        setIsAdmin(isAdmin);
        setHasJoined(true);
      });

      client.on('error', ({ message }) => {
        setError(message);
      });

      await client.connect();
      setWsClient(client);
      setRoomCode(code);
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to game room. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wsClient) {
        wsClient.close();
      }
    };
  }, [wsClient]);

  const handleJoin = async (name: string, asAdmin: boolean, roomCodeInput?: string) => {
    const code = roomCodeInput || roomCode;
    const displayName = name || currentUser?.display_name || 'Player';
    setPlayerName(displayName);
    
    if (!wsClient) {
      await connectToRoom(code);
    }
    
    // Wait a bit for connection to establish
    setTimeout(() => {
      if (wsClient && wsClient.isConnected()) {
        wsClient.emit('join-game', { 
          name: displayName, 
          isAdmin: asAdmin, 
          roomCode: code,
          userId: currentUser?.id 
        });
      }
    }, 100);
  };

  const handleLogout = () => {
    userAuthService.logout();
    if (wsClient) {
      wsClient.close();
    }
    navigate('/register');
  };

  const handleStartQuiz = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('start-quiz');
    }
  };

  const handleSubmitAnswer = (answerIndex: number) => {
    if (wsClient) {
      wsClient.emit('submit-answer', { answerIndex });
    }
  };

  const handleRevealAnswers = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('reveal-answers');
    }
  };

  const handleNextQuestion = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('next-question');
    }
  };

  const handleResetGame = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('reset-game');
    }
  };

  // Don't render if no user
  if (!currentUser) {
    return null;
  }

  // Show join screen if not joined
  if (!hasJoined || !gameState) {
    return (
      <div className="app">
        <div className="admin-link-container">
          <Link to="/profile" className="btn-admin-link">
            <FaUser /> {currentUser.display_name}
          </Link>
          <button onClick={handleLogout} className="btn-admin-link">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        <JoinScreen 
          onJoin={handleJoin} 
          isConnecting={isConnecting}
          error={error}
          defaultName={currentUser.display_name}
        />
      </div>
    );
  }

  // Show results if quiz ended
  if (!gameState.isQuizActive && gameState.currentQuestion >= gameState.totalQuestions - 1 && gameState.currentQuestion !== -1) {
    return (
      <div className="app">
        <ResultsView 
          players={gameState.players}
          isAdmin={isAdmin}
          onReset={handleResetGame}
        />
      </div>
    );
  }

  // Show lobby if quiz hasn't started
  if (gameState.currentQuestion === -1) {
    return (
      <div className="app">
        <Lobby
          players={gameState.players}
          isAdmin={isAdmin}
          onStartQuiz={handleStartQuiz}
          roomCode={gameState.roomCode}
        />
      </div>
    );
  }

  // Show admin or player view during quiz
  if (isAdmin) {
    return (
      <div className="app">
        <AdminView
          gameState={gameState}
          onRevealAnswers={handleRevealAnswers}
          onNextQuestion={handleNextQuestion}
          onReset={handleResetGame}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <PlayerView
        gameState={gameState}
        playerId={playerId}
        playerName={playerName}
        onSubmitAnswer={handleSubmitAnswer}
      />
    </div>
  );
}

export default GameFlow;

