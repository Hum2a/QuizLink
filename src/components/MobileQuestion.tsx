import React, { useState, useCallback, useEffect } from 'react';
import { FaCheck, FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useTouchGestures, type TouchGesture } from '../hooks/useTouchGestures';
// Define Question interface locally since types/quiz might not exist
interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface MobileQuestionProps {
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
}

const MobileQuestion: React.FC<MobileQuestionProps> = ({
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
}) => {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<
    string | undefined
  >(selectedAnswer);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedAnswer(selectedAnswer);
  }, [selectedAnswer]);

  const handleGesture = useCallback(
    (gesture: TouchGesture) => {
      setIsAnimating(true);

      switch (gesture.type) {
        case 'swipe-left': {
          if (questionNumber < totalQuestions) {
            setGestureFeedback('Next question →');
            setTimeout(() => {
              onNext();
              setIsAnimating(false);
              setGestureFeedback(null);
            }, 300);
          } else {
            setGestureFeedback('Last question');
            setTimeout(() => {
              setIsAnimating(false);
              setGestureFeedback(null);
            }, 1000);
          }
          break;
        }

        case 'swipe-right': {
          if (questionNumber > 1) {
            setGestureFeedback('← Previous question');
            setTimeout(() => {
              onPrevious();
              setIsAnimating(false);
              setGestureFeedback(null);
            }, 300);
          } else {
            setGestureFeedback('First question');
            setTimeout(() => {
              setIsAnimating(false);
              setGestureFeedback(null);
            }, 1000);
          }
          break;
        }

        case 'tap': {
          // Handle tap on answer options
          const tapX = gesture.startX || 0;
          const tapY = gesture.startY || 0;
          const element = document.elementFromPoint(tapX, tapY);

          if (element && element.closest('.option-button')) {
            const optionElement = element.closest('.option-button');
            const answer = optionElement?.getAttribute('data-answer');
            if (answer && !showResult) {
              setLocalSelectedAnswer(answer);
              onAnswer(answer);
              setGestureFeedback('Answer selected!');
              setTimeout(() => {
                setGestureFeedback(null);
              }, 1000);
            }
          }
          break;
        }

        case 'long-press': {
          setGestureFeedback('Long press detected');
          setTimeout(() => {
            setGestureFeedback(null);
          }, 1000);
          break;
        }

        default:
          setIsAnimating(false);
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

  const getOptionIcon = (option: string) => {
    if (!showResult || !correctAnswer) return null;

    if (option === correctAnswer) {
      return <FaCheck className="option-icon correct" />;
    } else if (option === localSelectedAnswer && option !== correctAnswer) {
      return <FaTimes className="option-icon incorrect" />;
    }
    return null;
  };

  const getOptionClass = (option: string) => {
    let baseClass = 'option-button';

    if (showResult && correctAnswer) {
      if (option === correctAnswer) {
        baseClass += ' correct';
      } else if (option === localSelectedAnswer && option !== correctAnswer) {
        baseClass += ' incorrect';
      }
    } else if (option === localSelectedAnswer) {
      baseClass += ' selected';
    }

    if (isAnimating) {
      baseClass += ' animating';
    }

    return baseClass;
  };

  return (
    <div
      className="mobile-question"
      ref={elementRef as React.RefObject<HTMLDivElement>}
    >
      {/* Progress Bar */}
      <div className="question-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          Question {questionNumber} of {totalQuestions}
        </div>
      </div>

      {/* Timer */}
      {timeRemaining !== undefined && (
        <div className="timer">
          <div
            className={`timer-circle ${timeRemaining <= 10 ? 'warning' : ''}`}
          >
            <span className="timer-text">{timeRemaining}</span>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="question-content">
        <h2 className="question-text">{question.question}</h2>

        {/* Options */}
        <div className="options-container">
          {question.options.map((option: string, index: number) => (
            <button
              key={index}
              className={getOptionClass(option)}
              data-answer={option}
              onClick={() => {
                if (!showResult) {
                  setLocalSelectedAnswer(option);
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
                {getOptionIcon(option)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gesture Feedback */}
      {gestureFeedback && (
        <div className="gesture-feedback">{gestureFeedback}</div>
      )}

      {/* Navigation Hints */}
      <div className="navigation-hints">
        <div className="hint-item">
          <FaArrowLeft className="hint-icon" />
          <span>Swipe right for previous</span>
        </div>
        <div className="hint-item">
          <span>Tap to select answer</span>
        </div>
        <div className="hint-item">
          <FaArrowRight className="hint-icon" />
          <span>Swipe left for next</span>
        </div>
      </div>

      <style>{`
        .mobile-question {
          min-height: 100vh;
          padding: 1rem;
          background: var(--color-background);
          display: flex;
          flex-direction: column;
          position: relative;
          touch-action: pan-y;
        }

        .question-progress {
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }

        .progress-text {
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .timer {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }

        .timer-circle {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--color-primary);
          color: var(--color-text-inverse);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          transition: all var(--transition-fast);
        }

        .timer-circle.warning {
          background: var(--color-error);
          animation: pulse 1s infinite;
        }

        .question-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0;
        }

        .question-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary);
          text-align: center;
          margin: 0 0 3rem 0;
          line-height: 1.4;
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
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

        .option-button.animating {
          transform: scale(0.95);
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

        .navigation-hints {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-top: 1px solid var(--color-border);
          margin-top: auto;
        }

        .hint-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          text-align: center;
        }

        .hint-icon {
          font-size: 1.25rem;
          color: var(--color-primary);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
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

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .mobile-question {
            padding: 0.75rem;
          }

          .question-text {
            font-size: 1.25rem;
          }

          .option-button {
            padding: 1.25rem;
          }

          .navigation-hints {
            flex-direction: column;
            gap: 1rem;
          }

          .hint-item {
            flex-direction: row;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileQuestion;
