-- Social Features Database Schema
-- This extends the existing schema with social functionality

-- Users table (if not exists, extend existing user_accounts)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  join_date TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE(from_user_id, to_user_id),
  CHECK(from_user_id != to_user_id)
);

-- Social activities table
CREATE TABLE IF NOT EXISTS social_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'quiz_completed', 'achievement_unlocked', etc.
  activity_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'friend_request', 'achievement_unlocked', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz challenges table (will be created when quizzes table exists)
-- For now, we'll create it without the foreign key constraint
CREATE TABLE IF NOT EXISTS quiz_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL, -- Will add foreign key constraint later
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  winner_id UUID REFERENCES users(id),
  from_user_score INTEGER,
  to_user_score INTEGER,
  CHECK(from_user_id != to_user_id)
);

-- User social stats table
CREATE TABLE IF NOT EXISTS user_social_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_quizzes_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Leaderboards table (for caching)
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_frame VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all-time'
  category VARCHAR(100),
  difficulty VARCHAR(20),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  last_played TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(time_frame, category, difficulty, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_created_at ON social_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_quiz_challenges_to_user ON quiz_challenges(to_user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_challenges_status ON quiz_challenges(status);
CREATE INDEX IF NOT EXISTS idx_leaderboards_time_frame ON leaderboards(time_frame);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category);
CREATE INDEX IF NOT EXISTS idx_leaderboards_difficulty ON leaderboards(difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(score DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_social_stats_updated_at
    BEFORE UPDATE ON user_social_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user's last_active
CREATE OR REPLACE FUNCTION update_user_last_active(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET last_active = NOW(), is_online = TRUE
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to mark user as offline
CREATE OR REPLACE FUNCTION mark_user_offline(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET is_online = FALSE
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's rank in leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(
    user_uuid UUID,
    time_frame_param VARCHAR(20),
    category_param VARCHAR(100) DEFAULT NULL,
    difficulty_param VARCHAR(20) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM leaderboards
    WHERE user_id = user_uuid
    AND time_frame = time_frame_param
    AND (category_param IS NULL OR category = category_param)
    AND (difficulty_param IS NULL OR difficulty = difficulty_param);

    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard(
    time_frame_param VARCHAR(20),
    category_param VARCHAR(100) DEFAULT NULL,
    difficulty_param VARCHAR(20) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Clear existing leaderboard entries for this timeframe/category/difficulty
    DELETE FROM leaderboards
    WHERE time_frame = time_frame_param
    AND (category_param IS NULL OR category = category_param)
    AND (difficulty_param IS NULL OR difficulty = difficulty_param);

    -- Insert new leaderboard entries
    INSERT INTO leaderboards (time_frame, category, difficulty, user_id, score, rank, last_played)
    SELECT
        time_frame_param,
        category_param,
        difficulty_param,
        user_id,
        score,
        ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
        last_played
    FROM (
        SELECT
            uss.user_id,
            uss.total_score as score,
            u.last_active as last_played
        FROM user_social_stats uss
        JOIN users u ON uss.user_id = u.id
        WHERE uss.total_quizzes_played > 0
        AND (category_param IS NULL OR EXISTS (
            SELECT 1 FROM quiz_templates q
            WHERE q.created_by = uss.user_id
            AND q.category = category_param
        ))
        AND (difficulty_param IS NULL OR EXISTS (
            SELECT 1 FROM quiz_templates q
            WHERE q.created_by = uss.user_id
            AND q.difficulty = difficulty_param
        ))
    ) ranked_users;
END;
$$ LANGUAGE plpgsql;

-- Function to add social activity
CREATE OR REPLACE FUNCTION add_social_activity(
    user_uuid UUID,
    activity_type_param VARCHAR(50),
    activity_data_param JSONB,
    is_public_param BOOLEAN DEFAULT TRUE
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO social_activities (user_id, activity_type, activity_data, is_public)
    VALUES (user_uuid, activity_type_param, activity_data_param, is_public_param)
    RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add notification
CREATE OR REPLACE FUNCTION add_notification(
    user_uuid UUID,
    type_param VARCHAR(50),
    title_param VARCHAR(255),
    message_param TEXT,
    data_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (user_uuid, type_param, title_param, message_param, data_param)
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update social stats
CREATE OR REPLACE FUNCTION update_social_stats(
    user_uuid UUID,
    quizzes_played INTEGER DEFAULT 0,
    score_points INTEGER DEFAULT 0,
    achievement_count INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_social_stats (
        user_id,
        total_quizzes_played,
        total_score,
        achievements_unlocked,
        friends_count,
        current_streak
    )
    VALUES (
        user_uuid,
        quizzes_played,
        score_points,
        achievement_count,
        friends_count,
        streak_count
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_quizzes_played = user_social_stats.total_quizzes_played + EXCLUDED.total_quizzes_played,
        total_score = user_social_stats.total_score + EXCLUDED.total_score,
        average_score = CASE
            WHEN user_social_stats.total_quizzes_played + EXCLUDED.total_quizzes_played > 0
            THEN (user_social_stats.total_score + EXCLUDED.total_score)::DECIMAL / (user_social_stats.total_quizzes_played + EXCLUDED.total_quizzes_played)
            ELSE 0
        END,
        achievements_unlocked = user_social_stats.achievements_unlocked + EXCLUDED.achievements_unlocked,
        friends_count = EXCLUDED.friends_count,
        current_streak = GREATEST(user_social_stats.current_streak, EXCLUDED.current_streak),
        best_streak = GREATEST(user_social_stats.best_streak, EXCLUDED.current_streak),
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
