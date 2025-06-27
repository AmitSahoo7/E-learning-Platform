import React, { useState } from "react";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main"; // make sure this points to your VITE_SERVER

const AddQuiz = ({ courseId }) => {
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
  ]);

  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/quiz/create`,
        { courseId, questions },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message || "Quiz Created!");
      setQuestions([
        { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
      ]);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Quiz creation failed");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="add-course-page">
        <div className="cd-card add-course-form-card">
          <h2 className="cd-title" style={{ fontSize: "1.5rem", color: "#007aff", marginBottom: "1.2rem" }}>
            Create Quiz for Course
          </h2>

          <form onSubmit={handleSubmit}>
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
                {q.options.map((opt, j) => (
                  <input
                    key={j}
                    className="cd-input"
                    type="text"
                    placeholder={`Option ${j + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, j, e.target.value)}
                    required
                  />
                ))}
                <label>Correct Answer</label>
                <select
                  className="cd-input"
                  value={q.correctAnswerIndex}
                  onChange={(e) =>
                    handleChange(i, "correctAnswerIndex", Number(e.target.value))
                  }
                  required
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
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
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddQuiz;
