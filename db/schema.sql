-- QuizLink Database Schema for Neon PostgreSQL

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- User accounts table (for quiz players)
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_color VARCHAR(7) DEFAULT '#667eea',
  total_games_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  last_active TIMESTAMP DEFAULT NOW()
);

-- User game history - links users to games they've played
CREATE TABLE IF NOT EXISTS user_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  rank INTEGER,
  played_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- User stats - aggregate statistics per user
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
  quiz_template_id UUID REFERENCES quiz_templates(id),
  times_played INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  avg_score INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  last_played TIMESTAMP,
  UNIQUE(user_id, quiz_template_id)
);

-- Quiz templates table - reusable quiz templates
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(20), -- easy, medium, hard
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  times_played INTEGER DEFAULT 0
);

-- Question bank - reusable questions
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_template_id UUID REFERENCES quiz_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL,
  explanation TEXT, -- Optional explanation for the answer
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Games table - stores each quiz game session
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_template_id UUID REFERENCES quiz_templates(id),
  room_code VARCHAR(20) UNIQUE NOT NULL,
  host_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  current_question INTEGER DEFAULT -1,
  is_active BOOLEAN DEFAULT false,
  show_results BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'lobby' -- lobby, active, completed
);

-- Questions table - actual questions used in games (copied from question bank)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  question_bank_id UUID REFERENCES question_bank(id),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Players table - stores players in each game
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_accounts(id), -- Link to user account if logged in
  socket_id VARCHAR(100),
  name VARCHAR(100) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- Answers table - stores player answers
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  answer_index INTEGER NOT NULL,
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, question_id)
);

-- Game history for analytics
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  winner_name VARCHAR(100),
  total_players INTEGER,
  total_questions INTEGER,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_templates_category ON quiz_templates(category);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_created_by ON quiz_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_question_bank_quiz_id ON question_bank(quiz_template_id);
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_quiz_template ON games(quiz_template_id);
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_game_id ON questions(game_id);
CREATE INDEX IF NOT EXISTS idx_answers_player_id ON answers(player_id);
CREATE INDEX IF NOT EXISTS idx_answers_game_id ON answers(game_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_game_history_user ON user_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);

