-- Seed data - Default quiz questions for parties and events
-- You can customize these questions or add more via the admin interface

-- Note: This is a template. Questions will be created when a game is started.
-- The questions are defined in the application code for easy customization.

-- Example of how to insert default questions if needed:
-- INSERT INTO questions (question_text, options, correct_answer, display_order) VALUES
-- ('What is Humza''s favorite color?', '["Blue", "Red", "Green", "Purple"]', 0, 1),
-- ('In what year was Humza born?', '["1995", "1998", "2000", "2002"]', 1, 2);

-- Clean up old completed games (optional maintenance query)
-- DELETE FROM games WHERE status = 'completed' AND ended_at < NOW() - INTERVAL '7 days';

