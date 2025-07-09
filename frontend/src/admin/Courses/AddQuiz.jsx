import React, { useState, useEffect } from "react";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";
import { useLocation, useParams } from "react-router-dom";

const AddQuiz = ({ courseId: propCourseId, quizId: propQuizId, onSuccess }) => {
  const params = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlQuizId = searchParams.get("quizId");
  const quizId = propQuizId || urlQuizId;
  const courseId = propCourseId || params.courseId;

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswers: [],
      questionType: "single",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // Fetch quiz data if editing
  useEffect(() => {
    if (quizId) {
      setLoading(true);
      axios.get(`${server}/api/quiz/${courseId}`, {
        headers: { token: localStorage.getItem("token") },
      })
        .then(({ data }) => {
          const quiz = Array.isArray(data) ? data.find(q => q._id === quizId) : null;
          if (quiz) {
            setQuizTitle(quiz.title || "");
            setQuestions(
              quiz.questions.map(q => ({
                questionText: q.question,
                options: q.options,
                correctAnswers: q.correctAnswers,
                questionType: q.questionType || "single",
              }))
            );
          }
        })
        .catch(() => {
          toast.error("Failed to load quiz for editing");
        })
        .finally(() => setLoading(false));
    }
  }, [quizId, courseId]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswers: [],
        questionType: "single",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...questions];
    const current = updated[qIndex].correctAnswers;
    const type = updated[qIndex].questionType;

    if (type === "single") {
      updated[qIndex].correctAnswers = [optIndex];
    } else {
      if (current.includes(optIndex)) {
        updated[qIndex].correctAnswers = current.filter((i) => i !== optIndex);
      } else {
        updated[qIndex].correctAnswers = [...current, optIndex];
      }
    }
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedQuestions = questions.map((q) => ({
        question: q.questionText,
        options: q.options,
        correctAnswers: q.correctAnswers || [],
        questionType: q.questionType || "single",
      }));
      const payload = {
        title: quizTitle,
        courseId,
        questions: formattedQuestions,
      };
      let res;
      if (quizId) {
        // Edit existing quiz
        res = await axios.put(`${server}/api/quiz/${quizId}`, payload, {
          headers: { token: localStorage.getItem("token") },
        });
      } else {
        // Create new quiz
        res = await axios.post(`${server}/api/quiz/create`, payload, {
          headers: { token: localStorage.getItem("token") },
        });
      }
      console.log('Quiz API response:', res);
      // Only show success if the response is OK
      if (res && res.status >= 200 && res.status < 300) {
        toast.success(quizId ? "Quiz updated!" : "Quiz Created!");
        setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswers: [], questionType: "single" }]);
        setQuizTitle("");
        if (onSuccess) {
          try {
            onSuccess();
          } catch (onSuccessErr) {
            console.error('Error in onSuccess:', onSuccessErr);
          }
        }
      } else {
        toast.error(res?.data?.message || "Quiz save failed");
      }
    } catch (err) {
      console.error('Quiz save error:', err);
      toast.error(err.response?.data?.message || "Quiz save failed");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="add-course-page">
        <div className="cd-card add-course-form-card">
          <h2 className="cd-title" style={{ fontSize: "1.5rem", color: "#007aff", marginBottom: "1.2rem" }}>
            {quizId ? "Edit Quiz" : "Create Quiz for Course"}
          </h2>

          <form onSubmit={handleSubmit}>
            
            <label>Quiz Title</label>
            <input
              className="cd-input"
              type="text"
              placeholder="Enter quiz title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              required
              style={{ marginBottom: "1.5rem" }}
            />

            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: "1rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem" }}>
                <label>Question {i + 1}</label>
                <input
                  className="cd-input"
                  type="text"
                  placeholder="Enter question"
                  value={q.questionText}
                  onChange={(e) => handleChange(i, "questionText", e.target.value)}
                  required
                />

                <label>Type</label>
                <select
                  className="cd-input"
                  value={q.questionType}
                  onChange={(e) => handleChange(i, "questionType", e.target.value)}
                >
                  <option value="single">Single Correct</option>
                  <option value="multiple">Multiple Correct</option>
                </select>

                {q.options.map((opt, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center" }}>
                    <input
                      className="cd-input"
                      type="text"
                      placeholder={`Option ${j + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, j, e.target.value)}
                      required
                      style={{ flexGrow: 1 }}
                    />
                    <input
                      type={q.questionType === "single" ? "radio" : "checkbox"}
                      checked={q.correctAnswers.includes(j)}
                      onChange={() => toggleCorrectAnswer(i, j)}
                      style={{ marginLeft: "10px" }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(i)}
                  className="cd-btn-secondary"
                  style={{ marginTop: "0.5rem", backgroundColor: "#ff3b30", color: "white" }}
                >
                  Delete Question
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="cd-btn-secondary"
              style={{ marginBottom: "1rem" }}
            >
              + Add Question
            </button>

            <button
              type="submit"
              className="cd-btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {loading ? (quizId ? "Saving..." : "Submitting...") : (quizId ? "Save Changes" : "Submit Quiz")}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddQuiz;
