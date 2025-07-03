// Quiz.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import "./quiz.css";

const Quiz = ({ user }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`${server}/api/quiz/${courseId}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setQuiz(data);
        setAnswers(
          data.questions.map(() => []) // multi-correct: each answer is an array
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz");
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [courseId]);

  const handleOptionToggle = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const existing = updated[qIndex] || [];
      if (existing.includes(optIndex)) {
        updated[qIndex] = existing.filter((i) => i !== optIndex);
      } else {
        updated[qIndex] = [...existing, optIndex];
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(
        `${server}/api/quiz/submit/${quiz._id}`,
        { answers },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setScore(data.score);
      setSubmitted(true);
    } catch (err) {
      alert("Quiz submission failed");
    }
  };

  if (loading) return <div className="quiz-container">Loading quiz...</div>;
  if (error) return <div className="quiz-container error">{error}</div>;
  if (!quiz || !Array.isArray(quiz.questions)) return <div className="quiz-container">No quiz available.</div>;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quiz.title || "Quiz"}</h2>
        {user?.role === "admin" && (
          <button
            className="quiz-create-btn"
            onClick={() => navigate(`/addquiz/${courseId}`)}
          >
            ➕ Create / Edit Quiz
          </button>
        )}
      </div>

      {quiz.questions.map((q, qIndex) => (
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
          Your Score: {score} / {quiz.questions.length}
        </div>
      )}
    </div>
  );
};

export default Quiz;
