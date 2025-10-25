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
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [processLog, setProcessLog] = useState<string[]>([]);

  // Helper function to add log entries
  const addLogEntry = (message: string) => {
    setProcessLog(prev => [...prev, message]);
  };

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
    addLogEntry(`Starting connection to room: ${code}`);
    setConnectionStatus('connecting');
    setIsConnecting(true);
    setError('');

    try {
      console.log('Creating WebSocket client with URL:', config.WS_URL);
      addLogEntry('Creating WebSocket client...');
      const client = new WebSocketClient(config.WS_URL, code);

      client.on('game-state-update', (state: GameState) => {
        console.log('Received game-state-update:', state);
        addLogEntry('Lobby updated');
        setGameState(state);
      });

      client.on('player-joined', ({ playerName, gameState }) => {
        console.log('Player joined:', playerName);
        addLogEntry(`${playerName} joined the game`);
        setGameState(gameState);
      });

      client.on('player-left', ({ message, playerName, gameState }) => {
        console.log('Player left:', message);
        addLogEntry(`${playerName} left the game`);
        setGameState(gameState);
      });

      client.on('join-success', ({ playerId, isAdmin }) => {
        console.log('Join successful:', { playerId, isAdmin });
        addLogEntry(`Successfully joined as ${isAdmin ? 'admin' : 'player'}`);
        setPlayerId(playerId);
        setIsAdmin(isAdmin);
        setHasJoined(true);
        setConnectionStatus('connected');
      });

      client.on('error', ({ message }) => {
        console.error('WebSocket error:', message);
        addLogEntry(`Error: ${message}`);
        setError(message);
        setConnectionStatus('error');
      });

      client.on('game-closed', ({ message, gameState }) => {
        console.log('Game closed:', message);
        addLogEntry(`Game closed: ${message}`);
        setGameState(gameState);
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      });

      client.on('player-left', ({ message, playerName, gameState }) => {
        console.log('Player left:', message);
        addLogEntry(`${playerName} left the game`);
        setGameState(gameState);
      });

      // Handle WebSocket close events
      client.on('close', () => {
        console.log('WebSocket connection closed');
        addLogEntry('Connection closed');
        setConnectionStatus('disconnected');
        // Navigate to dashboard if we were in a game
        if (hasJoined) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      });

      // Add a catch-all handler for debugging
      client.on('*', message => {
        console.log('Received unknown message:', message);
        addLogEntry(`Received message: ${message.type}`);
      });

      console.log('Attempting to connect...');
      addLogEntry('Attempting to connect to server...');
      await client.connect();
      console.log('WebSocket connected successfully');
      addLogEntry('WebSocket connection established');
      setConnectionStatus('connected');
      setWsClient(client);
      setRoomCode(code);
      return client;
    } catch (err) {
      console.error('Connection error:', err);
      addLogEntry(
        `Connection failed: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
      setError('Failed to connect to game room. Please try again.');
      setConnectionStatus('error');
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

    // Clear previous logs and reset status
    setProcessLog([]);
    setError('');

    // Prevent multiple calls
    if (isConnecting) {
      console.log('Already connecting, ignoring duplicate call');
      addLogEntry('Already connecting, please wait...');
      return;
    }

    const code = roomCodeInput || roomCode;
    const displayName = name || currentUser?.display_name || 'Player';
    setPlayerName(displayName);

    addLogEntry(`Joining as ${asAdmin ? 'admin' : 'player'}: ${displayName}`);
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

    // Send join message after a short delay to ensure connection is fully established
    addLogEntry('Waiting for WebSocket to be ready...');
    setTimeout(() => {
      console.log('WebSocket connection status:', client?.isConnected());
      console.log('WebSocket readyState:', client?.getReadyState());
      if (client && client.isConnected()) {
        console.log('Emitting join-game event');
        addLogEntry('Sending join request to server...');
        client.emit('join-game', {
          name: displayName,
          isAdmin: asAdmin,
          roomCode: code,
          userId: currentUser?.id || null,
        });
      } else {
        console.error('WebSocket not connected, cannot join game');
        addLogEntry('WebSocket not ready, retrying in 200ms...');
        // Retry after a longer delay
        setTimeout(() => {
          if (client && client.isConnected()) {
            console.log('Retrying join-game event');
            addLogEntry('Retrying join request...');
            client.emit('join-game', {
              name: displayName,
              isAdmin: asAdmin,
              roomCode: code,
              userId: currentUser?.id || null,
            });
          } else {
            console.error('WebSocket still not connected after retry');
            addLogEntry('Failed to connect to WebSocket');
            setConnectionStatus('error');
          }
        }, 200);
      }
    }, 200); // Wait 200ms for connection to be fully established
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
    console.log('handleNextQuestion called - emitting next-question');
    if (wsClient && isAdmin) {
      console.log(
        'WebSocket client exists and user is admin, emitting next-question'
      );
      wsClient.emit('next-question');
    } else {
      console.log(
        'Cannot emit next-question - wsClient:',
        !!wsClient,
        'isAdmin:',
        isAdmin
      );
    }
  };

  const handleResetGame = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('reset-game');
    }
  };

  const handleKickPlayer = (playerId: string) => {
    if (wsClient && isAdmin) {
      wsClient.emit('kick-player', { playerId });
    }
  };

  const handleToggleMute = (playerId: string) => {
    if (wsClient && isAdmin) {
      wsClient.emit('toggle-mute', { playerId });
    }
  };

  const handleUpdateSettings = (settings: any) => {
    if (wsClient && isAdmin) {
      wsClient.emit('update-settings', settings);
    }
  };

  const handleToggleRoomLock = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('toggle-room-lock');
    }
  };

  const handleUpdatePlayerIcon = (playerId: string, iconName: string) => {
    if (wsClient) {
      wsClient.emit('update-player-icon', { playerId, iconName });
    }
  };

  const handleCloseGame = () => {
    if (wsClient && isAdmin) {
      wsClient.emit('close-game');
    }
  };

  const handleLeaveGame = () => {
    if (wsClient) {
      wsClient.emit('leave-game');
      // Navigate away immediately since the server will close the connection
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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
          connectionStatus={connectionStatus}
          processLog={processLog}
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
          onKickPlayer={handleKickPlayer}
          onToggleMute={handleToggleMute}
          onUpdateSettings={handleUpdateSettings}
          onResetGame={handleResetGame}
          onToggleRoomLock={handleToggleRoomLock}
          onUpdatePlayerIcon={handleUpdatePlayerIcon}
          onCloseGame={handleCloseGame}
          onLeaveGame={handleLeaveGame}
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
