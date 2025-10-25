import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';
import JoinScreen from './components/JoinScreen';
import GameLobby from './components/GameLobby';
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
  const [searchParams] = useSearchParams();
  const urlRoomCode = searchParams.get('room');
  const urlIsAdmin = searchParams.get('admin') === 'true';
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(urlIsAdmin);
  const [hasJoined, setHasJoined] = useState(false);
  const [roomCode, setRoomCode] = useState<string>(urlRoomCode || 'QUIZLINK');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState(userAuthService.getUser());

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Try to get current user, but don't require authentication
      const user = await userAuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setPlayerName(user.display_name);
      } else {
        // Allow guest joining
        setCurrentUser(null);
        setPlayerName('Guest');
      }

      // Auto-join if room code is in URL
      if (urlRoomCode && !hasJoined) {
        const displayName = user?.display_name || 'Guest';
        setTimeout(() => {
          handleJoin(displayName, urlIsAdmin, urlRoomCode);
        }, 500);
      }
    };

    checkAuth();
  }, [navigate]);

  const connectToRoom = async (code: string): Promise<WebSocketClient> => {
    console.log('connectToRoom called with code:', code);
    setIsConnecting(true);
    setError('');

    try {
      console.log('Creating WebSocket client with URL:', config.WS_URL);
      const client = new WebSocketClient(config.WS_URL, code);

      client.on('game-state-update', (state: GameState) => {
        console.log('Received game-state-update:', state);
        setGameState(state);
      });

      client.on('join-success', ({ playerId, isAdmin }) => {
        console.log('Join successful:', { playerId, isAdmin });
        setPlayerId(playerId);
        setIsAdmin(isAdmin);
        setHasJoined(true);
      });

      client.on('error', ({ message }) => {
        console.error('WebSocket error:', message);
        setError(message);
      });

      // Add a catch-all handler for debugging
      client.on('*', message => {
        console.log('Received unknown message:', message);
      });

      console.log('Attempting to connect...');
      await client.connect();
      console.log('WebSocket connected successfully');
      setWsClient(client);
      setRoomCode(code);
      return client;
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to game room. Please try again.');
      throw err;
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

  const handleJoin = async (
    name: string,
    asAdmin: boolean,
    roomCodeInput?: string
  ) => {
    console.log('handleJoin called', {
      name,
      asAdmin,
      roomCodeInput,
      currentUser,
    });

    // Prevent multiple calls
    if (isConnecting) {
      console.log('Already connecting, ignoring duplicate call');
      return;
    }

    const code = roomCodeInput || roomCode;
    const displayName = name || currentUser?.display_name || 'Player';
    setPlayerName(displayName);

    console.log('Attempting to connect to room:', code);
    let client: WebSocketClient;

    if (!wsClient) {
      client = await connectToRoom(code);
    } else {
      // If we already have a client, check if it's connected to the right room
      console.log('Using existing WebSocket client');
      if (wsClient.isConnected()) {
        wsClient.emit('join-game', {
          name: displayName,
          isAdmin: asAdmin,
          roomCode: code,
          userId: currentUser?.id || null,
        });
        return;
      } else {
        console.log('Existing client not connected, creating new connection');
        client = await connectToRoom(code);
      }
    }

    // Wait a bit for connection to establish, then emit join event
    setTimeout(() => {
      console.log('WebSocket connection status:', client?.isConnected());
      console.log('WebSocket readyState:', client?.getReadyState());
      if (client && client.isConnected()) {
        console.log('Emitting join-game event');
        client.emit('join-game', {
          name: displayName,
          isAdmin: asAdmin,
          roomCode: code,
          userId: currentUser?.id || null,
        });
      } else {
        console.error('WebSocket not connected, cannot join game');
        // Try to emit anyway in case the connection is just slow
        if (client) {
          console.log('Attempting to emit despite connection check...');
          client.emit('join-game', {
            name: displayName,
            isAdmin: asAdmin,
            roomCode: code,
            userId: currentUser?.id || null,
          });
        }
      }
    }, 500); // Increased timeout to 500ms
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
          defaultName={currentUser?.display_name || 'Guest'}
        />
      </div>
    );
  }

  // Show results if quiz ended
  if (
    !gameState.isQuizActive &&
    gameState.currentQuestion >= gameState.totalQuestions - 1 &&
    gameState.currentQuestion !== -1
  ) {
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
        <GameLobby
          gameState={gameState}
          playerId={playerId}
          isAdmin={isAdmin}
          onStartQuiz={handleStartQuiz}
          onLogout={handleLogout}
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
