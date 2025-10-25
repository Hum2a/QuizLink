import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaHome, FaRedo } from 'react-icons/fa';
import MobileQuestion from './MobileQuestion';
import LoadingSpinner from './LoadingSpinner';
import { useAchievementTracking } from '../hooks/useAchievementTracking';
import type { Quiz, Question } from '../types/quiz';

interface MobileGameFlowProps {
  quiz: Quiz;
  questions: Question[];
  onComplete: (
    score: number,
    totalQuestions: number,
    timeSpent: number
  ) => void;
}

interface GameState {
  currentQuestionIndex: number;
  answers: string[];
  startTime: number;
  timeSpent: number;
  isCompleted: boolean;
  showResults: boolean;
}

const MobileGameFlow: React.FC<MobileGameFlowProps> = ({
  quiz,
  questions,
  onComplete,
}) => {
  const navigate = useNavigate();
  const { trackQuizCompletion, trackSpecialTime } = useAchievementTracking();

  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    answers: [],
    startTime: Date.now(),
    timeSpent: 0,
    isCompleted: false,
    showResults: false,
  });

  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(
    undefined
  );

  // Timer for timed questions
  useEffect(() => {
    if (quiz.time_limit && quiz.time_limit > 0) {
      const timer = setInterval(() => {
        const elapsed = Date.now() - questionStartTime;
        const remaining = Math.max(
          0,
          quiz.time_limit - Math.floor(elapsed / 1000)
        );

        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleTimeUp();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz.time_limit, questionStartTime]);

  const handleAnswer = useCallback(
    (answer: string) => {
      const newAnswers = [...gameState.answers];
      newAnswers[gameState.currentQuestionIndex] = answer;

      setGameState(prev => ({
        ...prev,
        answers: newAnswers,
      }));

      // Auto-advance after a short delay to show the answer
      setTimeout(() => {
        if (gameState.currentQuestionIndex < questions.length - 1) {
          handleNext();
        } else {
          handleComplete();
        }
      }, 1500);
    },
    [gameState.answers, gameState.currentQuestionIndex, questions.length]
  );

  const handleNext = useCallback(() => {
    if (gameState.currentQuestionIndex < questions.length - 1) {
      setQuestionStartTime(Date.now());
      setTimeRemaining(undefined);

      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [gameState.currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (gameState.currentQuestionIndex > 0) {
      setQuestionStartTime(Date.now());
      setTimeRemaining(undefined);

      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [gameState.currentQuestionIndex]);

  const handleTimeUp = useCallback(() => {
    // Auto-submit with no answer if time runs out
    handleAnswer('');
  }, [handleAnswer]);

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const totalTimeSpent = Math.floor((endTime - gameState.startTime) / 1000);

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (gameState.answers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const isPerfect = score === questions.length;

    // Track achievements
    trackQuizCompletion({
      questionsAnswered: questions.length,
      correctAnswers: score,
      timeSpent: totalTimeSpent,
      category: quiz.category || 'general',
      isPerfect,
    });

    // Track special time achievements
    const currentHour = new Date().getHours();
    trackSpecialTime(currentHour);

    setGameState(prev => ({
      ...prev,
      isCompleted: true,
      showResults: true,
      timeSpent: totalTimeSpent,
    }));

    // Call completion callback
    onComplete(score, questions.length, totalTimeSpent);
  }, [
    gameState.startTime,
    gameState.answers,
    questions,
    quiz.category,
    trackQuizCompletion,
    trackSpecialTime,
    onComplete,
  ]);

  const handleRestart = useCallback(() => {
    setGameState({
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now(),
      timeSpent: 0,
      isCompleted: false,
      showResults: false,
    });
    setQuestionStartTime(Date.now());
    setTimeRemaining(undefined);
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  if (gameState.isCompleted && gameState.showResults) {
    const score = gameState.answers.filter(
      (answer, index) => answer === questions[index].correct_answer
    ).length;

    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="mobile-game-results">
        <div className="results-content">
          <div className="results-header">
            <FaTrophy className="trophy-icon" />
            <h1>Quiz Complete!</h1>
            <p className="quiz-title">{quiz.title}</p>
          </div>

          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/{questions.length}</span>
            </div>
            <div className="score-percentage">{percentage}%</div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{score}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{questions.length - score}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Math.floor(gameState.timeSpent / 60)}:
                {(gameState.timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <div className="stat-label">Time</div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleRestart} className="btn-secondary">
              <FaRedo /> Play Again
            </button>
            <button onClick={handleGoHome} className="btn-primary">
              <FaHome /> Home
            </button>
          </div>
        </div>

        <style>{`
          .mobile-game-results {
            min-height: 100vh;
            background: var(--color-background);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .results-content {
            text-align: center;
            max-width: 400px;
            width: 100%;
          }

          .results-header {
            margin-bottom: 3rem;
          }

          .trophy-icon {
            font-size: 4rem;
            color: var(--color-warning);
            margin-bottom: 1rem;
          }

          .results-header h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0 0 0.5rem 0;
          }

          .quiz-title {
            color: var(--color-text-secondary);
            font-size: 1.125rem;
            margin: 0;
          }

          .score-display {
            margin-bottom: 3rem;
          }

          .score-circle {
            width: 8rem;
            height: 8rem;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
            color: var(--color-text-inverse);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            position: relative;
          }

          .score-number {
            font-size: 2.5rem;
            font-weight: 700;
          }

          .score-total {
            font-size: 1.5rem;
            opacity: 0.8;
          }

          .score-percentage {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 3rem;
          }

          .stat-item {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: 1.5rem 1rem;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin-bottom: 0.25rem;
          }

          .stat-label {
            color: var(--color-text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
          }

          .btn-primary,
          .btn-secondary {
            flex: 1;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all var(--transition-fast);
            cursor: pointer;
          }

          .btn-primary {
            background: var(--color-primary);
            color: var(--color-text-inverse);
            border: 1px solid var(--color-primary);
          }

          .btn-primary:hover {
            background: var(--color-primary-hover);
            border-color: var(--color-primary-hover);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .btn-secondary {
            background: var(--color-surface);
            color: var(--color-text-primary);
            border: 1px solid var(--color-border);
          }

          .btn-secondary:hover {
            background: var(--color-surface-hover);
            border-color: var(--color-border-hover);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          @media (max-width: 480px) {
            .mobile-game-results {
              padding: 1rem;
            }

            .score-circle {
              width: 6rem;
              height: 6rem;
            }

            .score-number {
              font-size: 2rem;
            }

            .score-total {
              font-size: 1.25rem;
            }

            .action-buttons {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mobile-game-loading">
        <LoadingSpinner message="Loading questions..." size="large" />
      </div>
    );
  }

  const currentQuestion = questions[gameState.currentQuestionIndex];
  const selectedAnswer = gameState.answers[gameState.currentQuestionIndex];

  return (
    <MobileQuestion
      question={currentQuestion}
      questionNumber={gameState.currentQuestionIndex + 1}
      totalQuestions={questions.length}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      selectedAnswer={selectedAnswer}
      showResult={false}
      timeRemaining={timeRemaining}
    />
  );
};

export default MobileGameFlow;
