// Quiz.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import "./quiz.css";

const Quiz = ({ user }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await axios.get(`${server}/api/quiz/${courseId}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setQuizzes(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quizzes");
      }
      setLoading(false);
    };
    fetchQuizzes();
  }, [courseId]);

  useEffect(() => {
    if (selectedQuiz) {
      setAnswers(selectedQuiz.questions.map(() => []));
      setSubmitted(false);
      setScore(null);
    }
  }, [selectedQuiz]);

  const handleOptionToggle = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const question = selectedQuiz.questions[qIndex];
      // Use only correctAnswers array length to determine single/multiple
      const isMultiple = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 1;
      if (!isMultiple) {
        updated[qIndex] = [optIndex];
      } else {
        const existing = updated[qIndex] || [];
        if (existing.includes(optIndex)) {
          updated[qIndex] = existing.filter((i) => i !== optIndex);
        } else {
          updated[qIndex] = [...existing, optIndex];
        }
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(
        `${server}/api/quiz/submit/${selectedQuiz._id}`,
        { answers },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setScore(data.score);
      setSubmitted(true);
    } catch {
      alert("Quiz submission failed");
    }
  };

  if (loading) return <div className="quiz-container">Loading quizzes...</div>;
  if (error) return <div className="quiz-container error">{error}</div>;
  if (!quizzes || quizzes.length === 0) return <div className="quiz-container">No quizzes available.</div>;

  return (
    <div className="quiz-container">
      {!selectedQuiz ? (
        <>
          <div className="quiz-header">
            <h2>Select a Quiz</h2>
            {user?.role === "admin" && (
              <button
                className="quiz-create-btn"
                onClick={() => navigate(`/addquiz/${courseId}`)}
              >
                ➕ Create / Edit Quiz
              </button>
            )}
          </div>
          <ul className="quiz-list">
            {quizzes.map((quiz) => (
              <li key={quiz._id} className="quiz-list-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setSelectedQuiz(quiz)} className="quiz-select-btn">
                  {quiz.title || "Untitled Quiz"}
                </button>
                {user?.role === 'admin' && (
                  <>
                    <button
                      className="quiz-edit-btn"
                      style={{ background: '#007aff', color: 'white', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}
                      onClick={() => navigate(`/addquiz/${courseId}?quizId=${quiz._id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="quiz-delete-btn"
                      style={{ background: '#ff3b30', color: 'white', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this quiz?')) {
                          try {
                            await axios.delete(`${server}/api/quiz/${quiz._id}`, {
                              headers: { token: localStorage.getItem('token') },
                            });
                            setQuizzes(quizzes.filter(q => q._id !== quiz._id));
                          } catch {
                            alert('Failed to delete quiz');
                          }
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="quiz-header">
            <h2>{selectedQuiz.title || "Quiz"}</h2>
            <button className="quiz-back-btn" onClick={() => setSelectedQuiz(null)}>
              ← Back to Quiz List
            </button>
          </div>
          {selectedQuiz.questions.map((q, qIndex) => (
            <div className="quiz-question-card" key={qIndex}>
              <h4>
                Q{qIndex + 1}. {q.question}
              </h4>
              {Array.isArray(q.options) && q.options.map((opt, optIndex) => {
                const selected = Array.isArray(answers[qIndex]) && answers[qIndex].includes(optIndex);
                const isCorrect = submitted && Array.isArray(q.correctAnswers) && q.correctAnswers.includes(optIndex);
                const isWrongSelected = submitted && selected && !isCorrect;

                return (
                  <div
                    key={optIndex}
                    className={`quiz-option ${selected ? "selected" : ""} ${
                      submitted && isCorrect ? "correct" : ""
                    } ${submitted && isWrongSelected ? "wrong" : ""}`}
                    onClick={() => {
                      if (!submitted) handleOptionToggle(qIndex, optIndex);
                    }}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>
          ))}
          {!submitted ? (
            <button className="quiz-submit-btn" onClick={handleSubmit}>
              Submit Quiz
            </button>
          ) : (
            <div className="quiz-result">
              Your Score: {score} / {selectedQuiz.questions.length}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
