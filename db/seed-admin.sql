-- Seed data for QuizLink admin and default quiz

-- Create a default admin user (password: admin123 - CHANGE THIS!)
-- Password hash is bcrypt of 'admin123'
INSERT INTO admin_users (id, email, password_hash, name) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@quizlink.com', '$2a$10$rZ8qh9PvMJ8kXCJZvqXzGeTYGz3Q8YfKQZJ8ZqJ8ZqJ8ZqJ8ZqJ8Z', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Create a default quiz template
INSERT INTO quiz_templates (id, title, description, category, difficulty, created_by, is_public) VALUES
('00000000-0000-0000-0000-000000000002', 
 'Birthday Party Trivia', 
 'Fun trivia questions perfect for birthday celebrations!',
 'Party Games',
 'easy',
 '00000000-0000-0000-0000-000000000001',
 true)
ON CONFLICT DO NOTHING;

-- Add default questions to the template
INSERT INTO question_bank (quiz_template_id, question_text, options, correct_answer, explanation, display_order) VALUES
('00000000-0000-0000-0000-000000000002',
 'What is the most popular birthday cake flavor?',
 '["Chocolate", "Vanilla", "Strawberry", "Red Velvet"]',
 0,
 'Chocolate is consistently rated as the most popular birthday cake flavor worldwide!',
 1),

('00000000-0000-0000-0000-000000000002',
 'Which song is traditionally sung at birthday parties?',
 '["Happy Birthday", "For He''s a Jolly Good Fellow", "Celebration", "Birthday"]',
 0,
 'Happy Birthday to You is the most recognized song in the English language!',
 2),

('00000000-0000-0000-0000-000000000002',
 'What do people blow out on a birthday cake?',
 '["Candles", "Balloons", "Sparklers", "Matches"]',
 0,
 'The tradition of birthday candles dates back to ancient Greece!',
 3),

('00000000-0000-0000-0000-000000000002',
 'In which country did birthday cakes originate?',
 '["Germany", "France", "Italy", "England"]',
 0,
 'Birthday cakes originated in Germany during the Middle Ages with Kinderfest celebrations.',
 4),

('00000000-0000-0000-0000-000000000002',
 'What is the world record for the most birthday cakes?',
 '["27,413 cakes", "15,000 cakes", "10,500 cakes", "50,000 cakes"]',
 0,
 'The record was set in India with 27,413 birthday cakes!',
 5)
ON CONFLICT DO NOTHING;

-- Create another template for general knowledge
INSERT INTO quiz_templates (id, title, description, category, difficulty, created_by, is_public) VALUES
('00000000-0000-0000-0000-000000000003', 
 'General Knowledge Quiz', 
 'Test your knowledge with these fun general trivia questions!',
 'General Knowledge',
 'medium',
 '00000000-0000-0000-0000-000000000001',
 true)
ON CONFLICT DO NOTHING;

INSERT INTO question_bank (quiz_template_id, question_text, options, correct_answer, explanation, display_order) VALUES
('00000000-0000-0000-0000-000000000003',
 'What is the capital of France?',
 '["Paris", "London", "Berlin", "Madrid"]',
 0,
 'Paris has been the capital of France since the 12th century.',
 1),

('00000000-0000-0000-0000-000000000003',
 'Which planet is known as the Red Planet?',
 '["Mars", "Venus", "Jupiter", "Saturn"]',
 0,
 'Mars appears red due to iron oxide (rust) on its surface.',
 2),

('00000000-0000-0000-0000-000000000003',
 'Who painted the Mona Lisa?',
 '["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"]',
 0,
 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.',
 3),

('00000000-0000-0000-0000-000000000003',
 'What is the largest ocean on Earth?',
 '["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"]',
 0,
 'The Pacific Ocean covers more area than all landmasses combined!',
 4),

('00000000-0000-0000-0000-000000000003',
 'In what year did World War II end?',
 '["1945", "1944", "1946", "1943"]',
 0,
 'World War II ended in 1945 with the surrender of Japan.',
 5)
ON CONFLICT DO NOTHING;

