import { useState, useEffect } from 'react';
import type { Question } from '../services/api';
import {
  FaPlusCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';

interface QuestionFormProps {
  question: Question | null;
  onSave: (question: Omit<Question, 'id' | 'quiz_template_id'>) => void;
  onCancel: () => void;
  nextDisplayOrder?: number;
}

function QuestionForm({
  question,
  onSave,
  onCancel,
  nextDisplayOrder,
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    display_order: nextDisplayOrder || 1,
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        options: [...question.options],
        correct_answer: question.correct_answer,
        explanation: question.explanation || '',
        display_order: question.display_order,
      });
    }
  }, [question]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question_text.trim()) {
      alert('Please enter a question');
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      alert('Please fill in all options');
      return;
    }

    onSave({
      question_text: formData.question_text,
      options: formData.options,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation || null,
      display_order: formData.display_order,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {question ? (
              <>
                <FaEdit /> Edit Question
              </>
            ) : (
              <>
                <FaPlusCircle /> Add Question
              </>
            )}
          </h2>
          <button
            onClick={onCancel}
            className="btn-close"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group">
            <label>Question *</label>
            <textarea
              value={formData.question_text}
              onChange={e =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              placeholder="Enter your question..."
              className="form-textarea"
              rows={2}
              required
            />
          </div>

          <div className="form-group">
            <label>Answer Options *</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-input-row">
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}.
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={e => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="form-input"
                  required
                />
                <label
                  className="radio-label"
                  title={`Mark option ${String.fromCharCode(
                    65 + index
                  )} as correct`}
                >
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={formData.correct_answer === index}
                    onChange={() =>
                      setFormData({ ...formData, correct_answer: index })
                    }
                    aria-label={`Mark option ${String.fromCharCode(
                      65 + index
                    )} as correct answer`}
                  />
                  <span className="radio-checkmark">
                    <FaCheckCircle />
                  </span>
                </label>
              </div>
            ))}
            <p className="form-hint">
              Select the correct answer with the checkmark
            </p>
          </div>

          <div className="form-group">
            <label>Explanation (Optional)</label>
            <textarea
              value={formData.explanation}
              onChange={e =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              placeholder="Add an explanation for the correct answer..."
              className="form-textarea"
              rows={2}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <FaSave /> Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionForm;
