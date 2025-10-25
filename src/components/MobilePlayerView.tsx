import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useTouchGestures, type TouchGesture } from '../hooks/useTouchGestures';
import { useMobileDetection } from '../hooks/useMobileDetection';
import MobileQuestion from './MobileQuestion';
import LoadingSpinner from './LoadingSpinner';
import type { Question } from '../types/quiz';

interface MobilePlayerViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  selectedAnswer?: string;
  showResult?: boolean;
  correctAnswer?: string;
  timeRemaining?: number;
  playerName: string;
  playerScore: number;
}

const MobilePlayerView: React.FC<MobilePlayerViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  selectedAnswer,
  showResult,
  correctAnswer,
  timeRemaining,
  playerName,
  playerScore,
}) => {
  const { isMobile, isTablet } = useMobileDetection();
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);

  const handleGesture = useCallback(
    (gesture: TouchGesture) => {
      switch (gesture.type) {
        case 'swipe-left':
          if (questionNumber < totalQuestions) {
            setGestureFeedback('Next question →');
            setTimeout(() => {
              onNext();
              setGestureFeedback(null);
            }, 300);
          } else {
            setGestureFeedback('Last question');
            setTimeout(() => {
              setGestureFeedback(null);
            }, 1000);
          }
          break;

        case 'swipe-right':
          if (questionNumber > 1) {
            setGestureFeedback('← Previous question');
            setTimeout(() => {
              onPrevious();
              setGestureFeedback(null);
            }, 300);
          } else {
            setGestureFeedback('First question');
            setTimeout(() => {
              setGestureFeedback(null);
            }, 1000);
          }
          break;

        case 'tap':
          // Handle tap on answer options
          const tapX = gesture.startX || 0;
          const tapY = gesture.startY || 0;
          const element = document.elementFromPoint(tapX, tapY);

          if (element && element.closest('.option-button')) {
            const optionElement = element.closest('.option-button');
            const answer = optionElement?.getAttribute('data-answer');
            if (answer && !showResult) {
              onAnswer(answer);
              setGestureFeedback('Answer selected!');
              setTimeout(() => {
                setGestureFeedback(null);
              }, 1000);
            }
          }
          break;

        case 'long-press':
          setGestureFeedback('Long press detected');
          setTimeout(() => {
            setGestureFeedback(null);
          }, 1000);
          break;
      }
    },
    [questionNumber, totalQuestions, onNext, onPrevious, onAnswer, showResult]
  );

  const { elementRef } = useTouchGestures(handleGesture, {
    swipeThreshold: 50,
    tapThreshold: 15,
    longPressDuration: 800,
    velocityThreshold: 0.2,
    preventDefault: true,
  });

  // Use mobile component for mobile/tablet devices
  if (isMobile || isTablet) {
    return (
      <div ref={elementRef}>
        <MobileQuestion
          question={question}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          onAnswer={onAnswer}
          onNext={onNext}
          onPrevious={onPrevious}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          correctAnswer={correctAnswer}
          timeRemaining={timeRemaining}
        />

        {/* Gesture Feedback */}
        {gestureFeedback && (
          <div className="gesture-feedback">{gestureFeedback}</div>
        )}
      </div>
    );
  }

  // Desktop fallback - render the original PlayerView logic
  return (
    <div className="desktop-player-view">
      <div className="quiz-header">
        <div className="progress-section">
          <div className="question-counter">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="player-info">
          <div className="name">{playerName}</div>
          <div className="score">Score: {playerScore}</div>
        </div>
      </div>

      <div className="question-content">
        <h2 className="question-text">{question.question}</h2>

        <div className="options-container">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = showResult && correctAnswer === option;
            const isIncorrect =
              showResult && isSelected && option !== correctAnswer;

            return (
              <button
                key={index}
                className={`option-button ${isSelected ? 'selected' : ''} ${
                  isCorrect ? 'correct' : ''
                } ${isIncorrect ? 'incorrect' : ''}`}
                onClick={() => {
                  if (!showResult) {
                    onAnswer(option);
                  }
                }}
                disabled={showResult}
              >
                <div className="option-content">
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                  {showResult && (
                    <>
                      {isCorrect && <FaCheck className="option-icon correct" />}
                      {isIncorrect && (
                        <FaTimes className="option-icon incorrect" />
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="submit-section">
        <div className="keyboard-hints">
          <p>
            Use <kbd>1-4</kbd> or <kbd>A-D</kbd> to select, <kbd>Enter</kbd> to
            submit
          </p>
        </div>
      </div>

      <style>{`
        .desktop-player-view {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--color-background);
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .progress-section {
          flex: 1;
          margin-right: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-sm);
          transition: width var(--transition-normal);
        }

        .question-counter {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .player-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .player-info .name {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .player-info .score {
          font-size: 0.875rem;
          color: var(--color-success);
          font-weight: 500;
        }

        .question-content {
          margin-bottom: 2rem;
        }

        .question-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary);
          text-align: center;
          margin: 0 0 2rem 0;
          line-height: 1.4;
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .option-button {
          width: 100%;
          padding: 1.5rem;
          background: var(--color-surface);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .option-button:hover {
          background: var(--color-surface-hover);
          border-color: var(--color-border-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .option-button.selected {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .option-button.correct {
          background: var(--color-success-light);
          border-color: var(--color-success);
          color: var(--color-success);
        }

        .option-button.incorrect {
          background: var(--color-error-light);
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .option-letter {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: var(--color-secondary-light);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .option-button.selected .option-letter {
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .option-button.correct .option-letter {
          background: var(--color-success);
          color: var(--color-text-inverse);
        }

        .option-button.incorrect .option-letter {
          background: var(--color-error);
          color: var(--color-text-inverse);
        }

        .option-text {
          flex: 1;
          font-size: 1rem;
          font-weight: 500;
          text-align: left;
        }

        .option-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .option-icon.correct {
          color: var(--color-success);
        }

        .option-icon.incorrect {
          color: var(--color-error);
        }

        .submit-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .keyboard-hints {
          text-align: center;
          color: var(--color-text-secondary);
        }

        .keyboard-hints kbd {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          font-family: monospace;
          color: var(--color-text-primary);
        }

        .gesture-feedback {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--color-primary);
          color: var(--color-text-inverse);
          padding: 1rem 2rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
          z-index: 1000;
          animation: fadeInOut 1s ease-in-out;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }

        @media (max-width: 640px) {
          .quiz-header {
            flex-direction: column;
            gap: 1rem;
          }

          .progress-section {
            margin-right: 0;
            width: 100%;
          }

          .player-info {
            align-items: flex-start;
            flex-direction: row;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MobilePlayerView;
