import React, { useState } from "react";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const AddQuiz = ({ courseId }) => {
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
      question: q.questionText, // rename to match backend
      options: q.options,
      correctAnswers: q.correctAnswers || [], // for multiple-correct
      questionType: q.questionType || "single", // default to single
    }));

    const payload = {
      title: quizTitle,       // make sure this is in state
      courseId,
      questions: formattedQuestions,
    };

    const { data } = await axios.post(`${server}/api/quiz/create`, payload, {
      headers: { token: localStorage.getItem("token") },
    });

    toast.success(data.message || "Quiz Created!");
    setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswers: [], questionType: "single" }]);
    setQuizTitle(""); // reset title
  } catch (err) {
    console.error(err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Quiz creation failed");
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
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddQuiz;
