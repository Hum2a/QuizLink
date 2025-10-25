import { config } from '../config';
import { userAuthService } from './userAuth';

export interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_public: boolean;
  created_at: string;
  updated_at: string;
  times_played: number;
  question_count?: number;
}

export interface Question {
  id: string;
  quiz_template_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  display_order: number;
}

export interface Analytics {
  total_games: number;
  avg_duration: number;
  unique_hosts: number;
  top_scores: Array<{
    name: string;
    score: number;
    ended_at: string;
  }>;
}

class QuizAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${config.API_URL}/api/admin`;
  }

  private getAuthHeaders(): HeadersInit {
    const token = userAuthService.getToken();
    if (!token) throw new Error('No authentication token');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Quiz Templates
  async getAllQuizzes(): Promise<QuizTemplate[]> {
    const response = await fetch(`${this.baseURL}/quizzes`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  }

  async getQuiz(id: string): Promise<QuizTemplate> {
    const response = await fetch(`${this.baseURL}/quizzes/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch quiz');
    return response.json();
  }

  async createQuiz(
    quiz: Omit<
      QuizTemplate,
      'id' | 'created_at' | 'updated_at' | 'times_played'
    >
  ): Promise<{ id: string }> {
    const response = await fetch(`${this.baseURL}/quizzes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(quiz),
    });
    if (!response.ok) throw new Error('Failed to create quiz');
    return response.json();
  }

  async updateQuiz(id: string, quiz: Partial<QuizTemplate>): Promise<void> {
    const response = await fetch(`${this.baseURL}/quizzes/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(quiz),
    });
    if (!response.ok) throw new Error('Failed to update quiz');
  }

  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/quizzes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete quiz');
  }

  // Questions
  async getQuestions(quizId: string): Promise<Question[]> {
    const response = await fetch(
      `${this.baseURL}/quizzes/${quizId}/questions`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  }

  async addQuestion(
    quizId: string,
    question: Omit<Question, 'id' | 'quiz_template_id'>
  ): Promise<{ id: string }> {
    const response = await fetch(
      `${this.baseURL}/quizzes/${quizId}/questions`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(question),
      }
    );
    if (!response.ok) throw new Error('Failed to add question');
    return response.json();
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<void> {
    const response = await fetch(`${this.baseURL}/questions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(question),
    });
    if (!response.ok) throw new Error('Failed to update question');
  }

  async deleteQuestion(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/questions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete question');
  }

  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseURL}/quizzes/${quizId}/reorder`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ questionIds }),
    });
    if (!response.ok) throw new Error('Failed to reorder questions');
  }

  // Analytics
  async getAnalytics(quizId: string): Promise<Analytics> {
    const response = await fetch(
      `${this.baseURL}/quizzes/${quizId}/analytics`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }

  // Categories
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/categories`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }
}

export const quizAPI = new QuizAPI();
