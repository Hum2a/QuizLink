import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Game state
const gameState = {
  players: [], // { id, name, score, isAdmin, hasAnswered }
  currentQuestion: -1, // -1 means lobby
  isQuizActive: false,
  showResults: false,
  answers: {}, // { playerId: answerIndex }
  roomCode: 'QUIZLINK',
  questions: [
    {
      question: "What is Humza's favorite color?",
      options: ["Blue", "Red", "Green", "Purple"],
      correctAnswer: 0
    },
    {
      question: "In what year was Humza born?",
      options: ["1995", "1998", "2000", "2002"],
      correctAnswer: 1
    },
    {
      question: "What is Humza's favorite food?",
      options: ["Pizza", "Biryani", "Sushi", "Tacos"],
      correctAnswer: 1
    },
    {
      question: "What is Humza's hobby?",
      options: ["Gaming", "Reading", "Cooking", "Programming"],
      correctAnswer: 3
    },
    {
      question: "What's Humza's dream vacation destination?",
      options: ["Japan", "Switzerland", "Maldives", "Iceland"],
      correctAnswer: 0
    }
  ]
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join as player
  socket.on('join-game', ({ name, isAdmin }) => {
    const existingPlayer = gameState.players.find(p => p.id === socket.id);
    
    if (existingPlayer) {
      existingPlayer.name = name;
      existingPlayer.isAdmin = isAdmin;
    } else {
      gameState.players.push({
        id: socket.id,
        name,
        score: 0,
        isAdmin: isAdmin || false,
        hasAnswered: false
      });
    }

    socket.emit('join-success', {
      playerId: socket.id,
      isAdmin: isAdmin || false
    });

    io.emit('game-state-update', getGameState());
    console.log(`${name} joined as ${isAdmin ? 'admin' : 'player'}`);
  });

  // Start quiz (admin only)
  socket.on('start-quiz', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isAdmin) {
      gameState.isQuizActive = true;
      gameState.currentQuestion = 0;
      gameState.showResults = false;
      gameState.answers = {};
      
      // Reset all players' hasAnswered status
      gameState.players.forEach(p => {
        p.hasAnswered = false;
        p.score = 0;
      });

      io.emit('game-state-update', getGameState());
      io.emit('quiz-started');
      console.log('Quiz started!');
    }
  });

  // Submit answer
  socket.on('submit-answer', ({ answerIndex }) => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && !player.hasAnswered && gameState.isQuizActive && !gameState.showResults) {
      player.hasAnswered = true;
      gameState.answers[socket.id] = answerIndex;
      
      io.emit('game-state-update', getGameState());
      console.log(`${player.name} answered question ${gameState.currentQuestion}`);
    }
  });

  // Reveal answers (admin only)
  socket.on('reveal-answers', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isAdmin) {
      gameState.showResults = true;
      
      // Calculate scores
      const currentQ = gameState.questions[gameState.currentQuestion];
      Object.keys(gameState.answers).forEach(playerId => {
        const playerObj = gameState.players.find(p => p.id === playerId);
        if (playerObj && gameState.answers[playerId] === currentQ.correctAnswer) {
          playerObj.score += 100;
        }
      });

      io.emit('game-state-update', getGameState());
      console.log('Answers revealed for question', gameState.currentQuestion);
    }
  });

  // Next question (admin only)
  socket.on('next-question', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isAdmin) {
      if (gameState.currentQuestion < gameState.questions.length - 1) {
        gameState.currentQuestion++;
        gameState.showResults = false;
        gameState.answers = {};
        gameState.players.forEach(p => p.hasAnswered = false);
        
        io.emit('game-state-update', getGameState());
        console.log('Moving to question', gameState.currentQuestion);
      } else {
        // Quiz ended
        gameState.isQuizActive = false;
        io.emit('game-state-update', getGameState());
        io.emit('quiz-ended');
        console.log('Quiz ended!');
      }
    }
  });

  // Reset game (admin only)
  socket.on('reset-game', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isAdmin) {
      gameState.currentQuestion = -1;
      gameState.isQuizActive = false;
      gameState.showResults = false;
      gameState.answers = {};
      gameState.players.forEach(p => {
        p.hasAnswered = false;
        p.score = 0;
      });
      
      io.emit('game-state-update', getGameState());
      console.log('Game reset');
    }
  });

  socket.on('disconnect', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player) {
      console.log(`${player.name} disconnected`);
      gameState.players = gameState.players.filter(p => p.id !== socket.id);
      io.emit('game-state-update', getGameState());
    }
  });
});

function getGameState() {
  return {
    players: gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isAdmin: p.isAdmin,
      hasAnswered: p.hasAnswered
    })),
    currentQuestion: gameState.currentQuestion,
    isQuizActive: gameState.isQuizActive,
    showResults: gameState.showResults,
    totalQuestions: gameState.questions.length,
    question: gameState.currentQuestion >= 0 ? {
      question: gameState.questions[gameState.currentQuestion].question,
      options: gameState.questions[gameState.currentQuestion].options,
      correctAnswer: gameState.showResults ? gameState.questions[gameState.currentQuestion].correctAnswer : null
    } : null,
    answers: gameState.answers,
    roomCode: gameState.roomCode
  };
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

