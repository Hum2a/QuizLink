import { neon } from '@neondatabase/serverless';

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

export class UserAuth {
  private sql: ReturnType<typeof neon>;
  private jwtSecret: string;

  constructor(databaseUrl: string, jwtSecret: string = 'user-jwt-secret-key') {
    this.sql = neon(databaseUrl);
    this.jwtSecret = jwtSecret;
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  async generateToken(user: User): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signatureInput)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return `${signatureInput}.${encodedSignature}`;
  }

  async verifyToken(token: string): Promise<any | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, username: string, displayName: string): Promise<{ user: User; token: string }> {
    // Check if email exists
    const existingEmail = await this.sql`
      SELECT id FROM user_accounts WHERE email = ${email}
    `;
    if (existingEmail.length > 0) {
      throw new Error('Email already registered');
    }

    // Check if username exists
    const existingUsername = await this.sql`
      SELECT id FROM user_accounts WHERE username = ${username}
    `;
    if (existingUsername.length > 0) {
      throw new Error('Username already taken');
    }

    const passwordHash = await this.hashPassword(password);
    
    // Generate random avatar color
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6348'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const result = await this.sql`
      INSERT INTO user_accounts (email, password_hash, username, display_name, avatar_color)
      VALUES (${email}, ${passwordHash}, ${username}, ${displayName}, ${avatarColor})
      RETURNING id, email, username, display_name, avatar_color, total_games_played, total_score, highest_score
    `;

    const user: User = result[0];
    const token = await this.generateToken(user);

    return { user, token };
  }

  async login(emailOrUsername: string, password: string): Promise<{ user: User; token: string } | null> {
    const result = await this.sql`
      SELECT * FROM user_accounts
      WHERE email = ${emailOrUsername} OR username = ${emailOrUsername}
    `;

    if (result.length === 0) return null;

    const userData = result[0];
    const isValid = await this.verifyPassword(password, userData.password_hash);

    if (!isValid) return null;

    // Update last login
    await this.sql`
      UPDATE user_accounts
      SET last_login = NOW(), last_active = NOW()
      WHERE id = ${userData.id}
    `;

    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      display_name: userData.display_name,
      avatar_color: userData.avatar_color,
      total_games_played: userData.total_games_played,
      total_score: userData.total_score,
      highest_score: userData.highest_score
    };

    const token = await this.generateToken(user);
    return { user, token };
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const payload = await this.verifyToken(token);
    if (!payload) return null;

    const result = await this.sql`
      SELECT id, email, username, display_name, avatar_color, 
             total_games_played, total_score, highest_score
      FROM user_accounts
      WHERE id = ${payload.userId}
    `;

    return result.length > 0 ? result[0] : null;
  }

  async getUserProfile(userId: string): Promise<any> {
    const user = await this.sql`
      SELECT id, email, username, display_name, avatar_color,
             total_games_played, total_score, highest_score,
             created_at, last_login
      FROM user_accounts
      WHERE id = ${userId}
    `;

    if (user.length === 0) return null;

    // Get recent games
    const recentGames = await this.sql`
      SELECT gh.score, gh.rank, gh.played_at, g.room_code, qt.title as quiz_title
      FROM user_game_history gh
      JOIN games g ON gh.game_id = g.id
      LEFT JOIN quiz_templates qt ON g.quiz_template_id = qt.id
      WHERE gh.user_id = ${userId}
      ORDER BY gh.played_at DESC
      LIMIT 10
    `;

    // Get quiz stats
    const quizStats = await this.sql`
      SELECT us.*, qt.title as quiz_title
      FROM user_stats us
      JOIN quiz_templates qt ON us.quiz_template_id = qt.id
      WHERE us.user_id = ${userId}
      ORDER BY us.times_played DESC
      LIMIT 10
    `;

    return {
      user: user[0],
      recent_games: recentGames,
      quiz_stats: quizStats
    };
  }

  extractToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
  }
}

