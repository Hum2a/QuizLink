import { DurableObject } from 'cloudflare:workers';
import { Database } from './database';
import type {
  GameState,
  Player,
  Question,
  WebSocketMessage,
  Env,
} from './types';

// Default questions - can be customized per game
const DEFAULT_QUESTIONS: Question[] = [
  {
    question: "What is Humza's favorite color?",
    options: ['Blue', 'Red', 'Green', 'Purple'],
    correctAnswer: 0,
    displayOrder: 0,
  },
  {
    question: 'In what year was Humza born?',
    options: ['1995', '1998', '2000', '2002'],
    correctAnswer: 1,
    displayOrder: 1,
  },
  {
    question: "What is Humza's favorite food?",
    options: ['Pizza', 'Biryani', 'Sushi', 'Tacos'],
    correctAnswer: 1,
    displayOrder: 2,
  },
  {
    question: "What is Humza's hobby?",
    options: ['Gaming', 'Reading', 'Cooking', 'Programming'],
    correctAnswer: 3,
    displayOrder: 3,
  },
  {
    question: "What's Humza's dream vacation destination?",
    options: ['Japan', 'Switzerland', 'Maldives', 'Iceland'],
    correctAnswer: 0,
    displayOrder: 4,
  },
];

export class GameRoom extends DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private sessions: Map<WebSocket, string>; // WebSocket -> playerId
  private gameState: GameState | null = null;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
    this.sessions = new Map();

    // Load game state from storage
    this.state.blockConcurrencyWhile(async () => {
      this.gameState =
        (await this.state.storage.get<GameState>('gameState')) || null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    console.log('Durable Object fetch called with URL:', request.url);
    console.log('Request method:', request.method);
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    );

    // Handle WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    console.log('Upgrade header:', upgradeHeader);

    if (upgradeHeader === 'websocket') {
      console.log('WebSocket upgrade request received in Durable Object');
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleSession(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Handle HTTP requests
    const url = new URL(request.url);

    if (url.pathname === '/state' && request.method === 'GET') {
      return new Response(JSON.stringify(this.gameState), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  }

  async handleSession(webSocket: WebSocket) {
    console.log('Handling new WebSocket session');
    this.state.acceptWebSocket(webSocket);

    // Send current game state to new connection
    if (this.gameState) {
      console.log('Sending initial game state to new connection');
      this.send(webSocket, {
        type: 'game-state-update',
        payload: this.getPublicGameState(),
      });
    } else {
      console.log('No game state available for new connection');
    }

    webSocket.addEventListener('message', async msg => {
      try {
        const data: WebSocketMessage = JSON.parse(msg.data as string);
        await this.handleMessage(webSocket, data);
      } catch (error) {
        console.error('Error handling message:', error);
        this.send(webSocket, {
          type: 'error',
          payload: { message: 'Invalid message format' },
        });
      }
    });

    webSocket.addEventListener('close', () => {
      const playerId = this.sessions.get(webSocket);
      if (playerId && this.gameState) {
        // Remove player
        this.gameState.players = this.gameState.players.filter(
          p => p.id !== playerId
        );
        this.sessions.delete(webSocket);
        this.saveState();
        this.broadcast({
          type: 'game-state-update',
          payload: this.getPublicGameState(),
        });
      }
    });
  }

  async handleMessage(webSocket: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'join-game':
        await this.handleJoinGame(webSocket, message.payload);
        break;
      case 'start-quiz':
        await this.handleStartQuiz(webSocket);
        break;
      case 'submit-answer':
        await this.handleSubmitAnswer(webSocket, message.payload);
        break;
      case 'reveal-answers':
        await this.handleRevealAnswers(webSocket);
        break;
      case 'next-question':
        await this.handleNextQuestion(webSocket);
        break;
      case 'reset-game':
        await this.handleResetGame(webSocket);
        break;
      default:
        this.send(webSocket, {
          type: 'error',
          payload: { message: 'Unknown message type' },
        });
    }
  }

  async handleJoinGame(
    webSocket: WebSocket,
    payload: { name: string; isAdmin: boolean; roomCode: string }
  ) {
    console.log('handleJoinGame called with payload:', payload);
    const { name, isAdmin, roomCode } = payload;

    // Initialize game if it doesn't exist
    if (!this.gameState) {
      console.log('Initializing new game state');
      // For local development, skip database operations
      const gameData = null;
      console.log('Skipping database load for local development');

      this.gameState = {
        gameId: gameData?.id || crypto.randomUUID(),
        roomCode: roomCode || this.generateRoomCode(),
        hostName: isAdmin ? name : gameData?.host_name || 'Host',
        players: [],
        currentQuestion: -1,
        isQuizActive: false,
        showResults: false,
        status: 'lobby',
        questions: gameData?.questions || DEFAULT_QUESTIONS,
        answers: {},
        createdAt: gameData?.created_at
          ? new Date(gameData.created_at).getTime()
          : Date.now(),
      };
      console.log('Created new game state:', this.gameState);
    }

    const playerId = crypto.randomUUID();
    const player: Player = {
      id: playerId,
      socketId: null,
      name,
      score: 0,
      isAdmin,
      hasAnswered: false,
      joinedAt: Date.now(),
    };

    console.log('Adding player to game:', player);
    this.gameState.players.push(player);
    this.sessions.set(webSocket, playerId);

    await this.saveState();

    // Send success to joining player
    console.log('Sending join-success to player:', playerId);
    this.send(webSocket, {
      type: 'join-success',
      payload: { playerId, isAdmin },
    });

    // Broadcast updated state to all
    console.log('Broadcasting game state update');
    this.broadcast({
      type: 'game-state-update',
      payload: this.getPublicGameState(),
    });
  }

  async handleStartQuiz(webSocket: WebSocket) {
    const playerId = this.sessions.get(webSocket);
    if (!this.gameState || !playerId) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAdmin) {
      this.send(webSocket, {
        type: 'error',
        payload: { message: 'Only admin can start the quiz' },
      });
      return;
    }

    this.gameState.isQuizActive = true;
    this.gameState.currentQuestion = 0;
    this.gameState.status = 'active';
    this.gameState.showResults = false;
    this.gameState.answers = {};
    this.gameState.startedAt = Date.now();

    // Reset all players
    this.gameState.players.forEach(p => {
      p.hasAnswered = false;
      p.score = 0;
    });

    await this.saveState();

    this.broadcast({
      type: 'quiz-started',
      payload: {},
    });

    this.broadcast({
      type: 'game-state-update',
      payload: this.getPublicGameState(),
    });
  }

  async handleSubmitAnswer(
    webSocket: WebSocket,
    payload: { answerIndex: number }
  ) {
    const playerId = this.sessions.get(webSocket);
    if (!this.gameState || !playerId) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (
      !player ||
      player.hasAnswered ||
      !this.gameState.isQuizActive ||
      this.gameState.showResults
    ) {
      return;
    }

    player.hasAnswered = true;
    this.gameState.answers[playerId] = payload.answerIndex;

    await this.saveState();

    this.broadcast({
      type: 'game-state-update',
      payload: this.getPublicGameState(),
    });
  }

  async handleRevealAnswers(webSocket: WebSocket) {
    const playerId = this.sessions.get(webSocket);
    if (!this.gameState || !playerId) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAdmin) return;

    this.gameState.showResults = true;

    // Calculate scores
    const currentQuestion =
      this.gameState.questions[this.gameState.currentQuestion];
    Object.entries(this.gameState.answers).forEach(([pId, answerIndex]) => {
      const p = this.gameState!.players.find(player => player.id === pId);
      if (p && answerIndex === currentQuestion.correctAnswer) {
        p.score += 100;
      }
    });

    await this.saveState();

    this.broadcast({
      type: 'game-state-update',
      payload: this.getPublicGameState(),
    });
  }

  async handleNextQuestion(webSocket: WebSocket) {
    const playerId = this.sessions.get(webSocket);
    if (!this.gameState || !playerId) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAdmin) return;

    if (this.gameState.currentQuestion < this.gameState.questions.length - 1) {
      // Move to next question
      this.gameState.currentQuestion++;
      this.gameState.showResults = false;
      this.gameState.answers = {};
      this.gameState.players.forEach(p => (p.hasAnswered = false));
    } else {
      // Quiz ended
      this.gameState.isQuizActive = false;
      this.gameState.status = 'completed';
      this.gameState.endedAt = Date.now();

      this.broadcast({
        type: 'quiz-ended',
        payload: {},
      });
    }

    await this.saveState();

    this.broadcast({
      type: 'game-state-update',
      payload: this.getPublicGameState(),
    });
  }

  async handleResetGame(webSocket: WebSocket) {
    const playerId = this.sessions.get(webSocket);
    if (!this.gameState || !playerId) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAdmin) return;

    this.gameState.currentQuestion = -1;
    this.gameState.isQuizActive = false;
    this.gameState.showResults = false;
    this.gameState.status = 'lobby';
    this.gameState.answers = {};
    this.gameState.players.forEach(p => {
      p.hasAnswered = false;
      p.score = 0;
    });

    await this.saveState();

    this.broadcast({
      type: 'game-state-update',
      payload: this.getPublicGameState(),
    });
  }

  getPublicGameState() {
    if (!this.gameState) return null;

    const currentQ = this.gameState.questions[this.gameState.currentQuestion];

    return {
      players: this.gameState.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isAdmin: p.isAdmin,
        hasAnswered: p.hasAnswered,
      })),
      currentQuestion: this.gameState.currentQuestion,
      isQuizActive: this.gameState.isQuizActive,
      showResults: this.gameState.showResults,
      totalQuestions: this.gameState.questions.length,
      question: currentQ
        ? {
            question: currentQ.question,
            options: currentQ.options,
            correctAnswer: this.gameState.showResults
              ? currentQ.correctAnswer
              : null,
          }
        : null,
      answers: this.gameState.answers,
      roomCode: this.gameState.roomCode,
    };
  }

  async saveState() {
    if (this.gameState) {
      await this.state.storage.put('gameState', this.gameState);
    }
  }

  broadcast(message: WebSocketMessage) {
    const sockets = this.state.getWebSockets();
    sockets.forEach(socket => {
      this.send(socket, message);
    });
  }

  send(socket: WebSocket, message: WebSocketMessage) {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
