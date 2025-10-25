import { config } from '../config';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_color: string;
  total_games_played: number;
  total_score: number;
  highest_score: number;
}

export interface UserAuthResponse {
  user: User;
  token: string;
}

class UserAuthService {
  private baseURL: string;
  private tokenKey = 'quizlink_user_token';
  private userKey = 'quizlink_current_user';

  constructor() {
    this.baseURL = `${config.API_URL}/api/auth/user`;
  }

  async register(
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<UserAuthResponse> {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        username,
        display_name: displayName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data: UserAuthResponse = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async login(
    emailOrUsername: string,
    password: string
  ): Promise<UserAuthResponse> {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: UserAuthResponse = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseURL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      this.setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      return null;
    }
  }

  async getUserProfile() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      return response.json();
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    return data;
  }
}

export const userAuthService = new UserAuthService();
