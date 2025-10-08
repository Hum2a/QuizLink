import { neon } from '@neondatabase/serverless';
import type { GameState, Question, Player } from './types';

export class Database {
  private sql: ReturnType<typeof neon>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  // Create a new game
  async createGame(roomCode: string, hostName: string, questions: Question[]): Promise<string> {
    const result = await this.sql`
      INSERT INTO games (room_code, host_name, status)
      VALUES (${roomCode}, ${hostName}, 'lobby')
      RETURNING id
    `;
    
    const gameId = result[0].id;

    // Insert questions
    for (const question of questions) {
      await this.sql`
        INSERT INTO questions (game_id, question_text, options, correct_answer, display_order)
        VALUES (
          ${gameId},
          ${question.question},
          ${JSON.stringify(question.options)},
          ${question.correctAnswer},
          ${question.displayOrder}
        )
      `;
    }

    return gameId;
  }

  // Get game by room code
  async getGameByRoomCode(roomCode: string): Promise<any> {
    const result = await this.sql`
      SELECT * FROM games WHERE room_code = ${roomCode} LIMIT 1
    `;
    return result[0] || null;
  }

  // Get game questions
  async getGameQuestions(gameId: string): Promise<Question[]> {
    const result = await this.sql`
      SELECT id, question_text as question, options, correct_answer as "correctAnswer", display_order as "displayOrder"
      FROM questions
      WHERE game_id = ${gameId}
      ORDER BY display_order ASC
    `;
    
    return result.map((row: any) => ({
      id: row.id,
      question: row.question,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correctAnswer: row.correctAnswer,
      displayOrder: row.displayOrder
    }));
  }

  // Add player to game
  async addPlayer(gameId: string, socketId: string, name: string, isAdmin: boolean): Promise<string> {
    const result = await this.sql`
      INSERT INTO players (game_id, socket_id, name, is_admin)
      VALUES (${gameId}, ${socketId}, ${name}, ${isAdmin})
      RETURNING id
    `;
    return result[0].id;
  }

  // Update player socket ID
  async updatePlayerSocketId(playerId: string, socketId: string): Promise<void> {
    await this.sql`
      UPDATE players
      SET socket_id = ${socketId}, last_active = NOW()
      WHERE id = ${playerId}
    `;
  }

  // Update game status
  async updateGameStatus(gameId: string, status: string, currentQuestion?: number): Promise<void> {
    if (currentQuestion !== undefined) {
      await this.sql`
        UPDATE games
        SET status = ${status}, current_question = ${currentQuestion}, started_at = NOW()
        WHERE id = ${gameId}
      `;
    } else {
      await this.sql`
        UPDATE games
        SET status = ${status}
        WHERE id = ${gameId}
      `;
    }
  }

  // Save player answer
  async saveAnswer(playerId: string, questionId: string, gameId: string, answerIndex: number, isCorrect: boolean): Promise<void> {
    await this.sql`
      INSERT INTO answers (player_id, question_id, game_id, answer_index, is_correct)
      VALUES (${playerId}, ${questionId}, ${gameId}, ${answerIndex}, ${isCorrect})
      ON CONFLICT (player_id, question_id) DO UPDATE
      SET answer_index = ${answerIndex}, is_correct = ${isCorrect}, answered_at = NOW()
    `;
  }

  // Update player score
  async updatePlayerScore(playerId: string, score: number): Promise<void> {
    await this.sql`
      UPDATE players
      SET score = ${score}
      WHERE id = ${playerId}
    `;
  }

  // Complete game and save to history
  async completeGame(gameId: string, winnerName: string, totalPlayers: number, totalQuestions: number): Promise<void> {
    await this.sql`
      UPDATE games
      SET status = 'completed', ended_at = NOW()
      WHERE id = ${gameId}
    `;

    await this.sql`
      INSERT INTO game_history (game_id, winner_name, total_players, total_questions)
      VALUES (${gameId}, ${winnerName}, ${totalPlayers}, ${totalQuestions})
    `;
  }

  // Get leaderboard (top scores across all games)
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const result = await this.sql`
      SELECT p.name, p.score, g.room_code, gh.completed_at
      FROM players p
      JOIN games g ON p.game_id = g.id
      JOIN game_history gh ON g.id = gh.game_id
      WHERE p.is_admin = false
      ORDER BY p.score DESC, gh.completed_at DESC
      LIMIT ${limit}
    `;
    return result;
  }

  // Clean up old games (maintenance)
  async cleanupOldGames(daysOld: number = 7): Promise<void> {
    await this.sql`
      DELETE FROM games
      WHERE status = 'completed'
      AND ended_at < NOW() - INTERVAL '${daysOld} days'
    `;
  }
}

