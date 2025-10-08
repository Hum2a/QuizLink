import { neon } from '@neondatabase/serverless';

export interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  times_played: number;
  question_count?: number;
}

export interface QuestionBankItem {
  id: string;
  quiz_template_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  display_order: number;
}

export class AdminAPI {
  private sql: ReturnType<typeof neon>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  // Quiz Templates
  async getAllQuizTemplates(): Promise<QuizTemplate[]> {
    const result = await this.sql`
      SELECT 
        qt.*,
        COUNT(qb.id) as question_count
      FROM quiz_templates qt
      LEFT JOIN question_bank qb ON qt.id = qb.quiz_template_id
      WHERE qt.is_public = true
      GROUP BY qt.id
      ORDER BY qt.created_at DESC
    `;
    return result.map((row: any) => ({
      ...row,
      question_count: parseInt(row.question_count) || 0
    }));
  }

  async getQuizTemplate(id: string): Promise<QuizTemplate | null> {
    const result = await this.sql`
      SELECT 
        qt.*,
        COUNT(qb.id) as question_count
      FROM quiz_templates qt
      LEFT JOIN question_bank qb ON qt.id = qb.quiz_template_id
      WHERE qt.id = ${id}
      GROUP BY qt.id
    `;
    
    if (result.length === 0) return null;
    
    return {
      ...result[0],
      question_count: parseInt(result[0].question_count) || 0
    };
  }

  async createQuizTemplate(template: Omit<QuizTemplate, 'id' | 'created_at' | 'updated_at' | 'times_played'>): Promise<string> {
    const result = await this.sql`
      INSERT INTO quiz_templates (title, description, category, difficulty, is_public)
      VALUES (${template.title}, ${template.description}, ${template.category}, ${template.difficulty}, ${template.is_public})
      RETURNING id
    `;
    return result[0].id;
  }

  async updateQuizTemplate(id: string, template: Partial<QuizTemplate>): Promise<void> {
    await this.sql`
      UPDATE quiz_templates
      SET 
        title = COALESCE(${template.title}, title),
        description = COALESCE(${template.description}, description),
        category = COALESCE(${template.category}, category),
        difficulty = COALESCE(${template.difficulty}, difficulty),
        is_public = COALESCE(${template.is_public}, is_public),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  async deleteQuizTemplate(id: string): Promise<void> {
    await this.sql`DELETE FROM quiz_templates WHERE id = ${id}`;
  }

  // Questions
  async getQuizQuestions(quizTemplateId: string): Promise<QuestionBankItem[]> {
    const result = await this.sql`
      SELECT * FROM question_bank
      WHERE quiz_template_id = ${quizTemplateId}
      ORDER BY display_order ASC
    `;
    
    return result.map((row: any) => ({
      ...row,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
    }));
  }

  async addQuestion(question: Omit<QuestionBankItem, 'id'>): Promise<string> {
    const result = await this.sql`
      INSERT INTO question_bank (
        quiz_template_id, question_text, options, correct_answer, explanation, display_order
      )
      VALUES (
        ${question.quiz_template_id},
        ${question.question_text},
        ${JSON.stringify(question.options)},
        ${question.correct_answer},
        ${question.explanation},
        ${question.display_order}
      )
      RETURNING id
    `;
    return result[0].id;
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<void> {
    const updates: any = {};
    
    if (question.question_text) updates.question_text = question.question_text;
    if (question.options) updates.options = JSON.stringify(question.options);
    if (question.correct_answer !== undefined) updates.correct_answer = question.correct_answer;
    if (question.explanation !== undefined) updates.explanation = question.explanation;
    if (question.display_order !== undefined) updates.display_order = question.display_order;

    if (Object.keys(updates).length > 0) {
      await this.sql`
        UPDATE question_bank
        SET 
          question_text = COALESCE(${question.question_text}, question_text),
          options = COALESCE(${question.options ? JSON.stringify(question.options) : null}, options),
          correct_answer = COALESCE(${question.correct_answer}, correct_answer),
          explanation = COALESCE(${question.explanation}, explanation),
          display_order = COALESCE(${question.display_order}, display_order),
          updated_at = NOW()
        WHERE id = ${id}
      `;
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.sql`DELETE FROM question_bank WHERE id = ${id}`;
  }

  async reorderQuestions(quizTemplateId: string, questionIds: string[]): Promise<void> {
    // Update display_order for each question
    for (let i = 0; i < questionIds.length; i++) {
      await this.sql`
        UPDATE question_bank
        SET display_order = ${i + 1}
        WHERE id = ${questionIds[i]} AND quiz_template_id = ${quizTemplateId}
      `;
    }
  }

  // Analytics
  async getQuizAnalytics(quizTemplateId: string) {
    const games = await this.sql`
      SELECT 
        COUNT(*) as total_games,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration,
        COUNT(DISTINCT host_name) as unique_hosts
      FROM games
      WHERE quiz_template_id = ${quizTemplateId}
        AND status = 'completed'
    `;

    const topScores = await this.sql`
      SELECT p.name, p.score, g.ended_at
      FROM players p
      JOIN games g ON p.game_id = g.id
      WHERE g.quiz_template_id = ${quizTemplateId}
        AND g.status = 'completed'
        AND p.is_admin = false
      ORDER BY p.score DESC, g.ended_at DESC
      LIMIT 10
    `;

    return {
      total_games: parseInt(games[0]?.total_games) || 0,
      avg_duration: Math.round(games[0]?.avg_duration || 0),
      unique_hosts: parseInt(games[0]?.unique_hosts) || 0,
      top_scores: topScores
    };
  }

  // Categories
  async getCategories(): Promise<string[]> {
    const result = await this.sql`
      SELECT DISTINCT category
      FROM quiz_templates
      WHERE category IS NOT NULL
      ORDER BY category
    `;
    return result.map((row: any) => row.category);
  }
}

