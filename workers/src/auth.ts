import { neon } from '@neondatabase/serverless';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export class Auth {
  private sql: ReturnType<typeof neon>;
  private jwtSecret: string;

  constructor(databaseUrl: string, jwtSecret: string = 'your-secret-key-change-this') {
    this.sql = neon(databaseUrl);
    this.jwtSecret = jwtSecret;
  }

  // Hash password using Web Crypto API
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Generate JWT token
  async generateToken(user: AuthUser): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
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

  // Verify JWT token
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const signatureInput = `${encodedHeader}.${encodedPayload}`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signature = Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0));
      
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signature,
        encoder.encode(signatureInput)
      );

      if (!isValid) return null;

      const payload: JWTPayload = JSON.parse(atob(encodedPayload));

      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthUser> {
    // Check if user exists
    const existing = await this.sql`
      SELECT id FROM admin_users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      throw new Error('User already exists');
    }

    const passwordHash = await this.hashPassword(password);

    const result = await this.sql`
      INSERT INTO admin_users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
      RETURNING id, email, name
    `;

    return result[0];
  }

  // Login user
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
    const result = await this.sql`
      SELECT id, email, name, password_hash
      FROM admin_users
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    const isValidPassword = await this.verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await this.sql`
      UPDATE admin_users
      SET last_login = NOW()
      WHERE id = ${user.id}
    `;

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    const token = await this.generateToken(authUser);

    return { user: authUser, token };
  }

  // Get user from token
  async getUserFromToken(token: string): Promise<AuthUser | null> {
    const payload = await this.verifyToken(token);
    if (!payload) return null;

    const result = await this.sql`
      SELECT id, email, name
      FROM admin_users
      WHERE id = ${payload.userId}
    `;

    if (result.length === 0) return null;

    return result[0];
  }

  // Extract token from Authorization header
  extractToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
  }
}

