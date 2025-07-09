// Quiz.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import "./quiz.css";
import AddQuiz from '../../admin/Courses/AddQuiz.jsx';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Quiz = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = params.courseId;
  const quizId = params.quizId;
  // Get lectureId from query string
  const searchParams = new URLSearchParams(location.search);
  const lectureId = searchParams.get('lectureId');
  console.log('Quiz page lectureId:', lectureId);
  // const navigate = useNavigate(); // This line was removed as per the edit hint

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [quizProgress, setQuizProgress] = useState({ completed: [], scores: {} });
  const [showReattemptConfirm, setShowReattemptConfirm] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState(null);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editQuizId, setEditQuizId] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [quizOrder, setQuizOrder] = useState([]);
  const [singleQuizCourseId, setSingleQuizCourseId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Disambiguate params: if quizId is present, ignore courseId for fetching
  const isSingleQuizView = !!quizId;

  // Move fetchQuizzes out of useEffect for reuse
  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get(`${server}/api/quiz/${courseId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setQuizzes(data);
      setQuizOrder(Array.isArray(data) ? data.map(q => q._id) : []);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setQuizzes([]);
      }
    }
  };

  // Update fetchQuizProgress to handle 404 and accept courseId param
  const fetchQuizProgress = async (cid) => {
    try {
      const { data } = await axios.get(`${server}/api/user/progress?course=${cid}`, {
        headers: { token: localStorage.getItem("token") },
      });
      // Map quizId to bestScore
      const scores = {};
      if (Array.isArray(data.quizScores)) {
        data.quizScores.forEach(qs => {
          if (qs.quiz) scores[qs.quiz] = qs.bestScore;
        });
      }
      setQuizProgress({
        completed: Array.isArray(data.completedQuizzes) ? data.completedQuizzes.map(id => id.toString()) : [],
        scores,
      });
    } catch {
      setQuizProgress({ completed: [], scores: {} });
    }
  };

  // Fetch a single quiz if quizId is present
  const fetchSingleQuiz = async () => {
    const { data } = await axios.get(`${server}/api/quiz/single/${quizId}`, {
      headers: { token: localStorage.getItem("token") },
    });
    setSelectedQuiz(data);
    setQuizzes([data]);
    setSingleQuizCourseId(data.courseId || data.course || null);
  };

  useEffect(() => {
    if (isSingleQuizView) {
      fetchSingleQuiz();
    } else if (courseId) {
      fetchQuizzes();
      fetchQuizProgress(courseId);
    }
  }, [courseId, quizId, isSingleQuizView]);

  // New effect: fetch progress when singleQuizCourseId is set
  useEffect(() => {
    if (quizId && singleQuizCourseId && user) {
      // Debug: log subscription and courseId
      console.log('user.subscription:', user.subscription);
      console.log('singleQuizCourseId:', singleQuizCourseId);
      // Defensive: normalize subscription to array of strings
      let userSubs = user.subscription;
      if (Array.isArray(userSubs) && typeof userSubs[0] === 'object' && userSubs[0] !== null) {
        userSubs = userSubs.map(s => s._id ? s._id.toString() : String(s));
      } else if (Array.isArray(userSubs)) {
        userSubs = userSubs.map(s => s.toString());
      } else {
        userSubs = [];
      }
      // Store normalized for enrollment check
      // setNormalizedSubs(userSubs); // This line was removed as per the edit hint
      fetchQuizProgress(singleQuizCourseId);
    }
  }, [quizId, singleQuizCourseId, user]);

  useEffect(() => {
    if (selectedQuiz) {
      setAnswers(selectedQuiz.questions.map(() => []));
      setSubmitted(false);
      setScore(null);
    }
  }, [selectedQuiz]);

  useEffect(() => {
    if (selectedQuiz && !submitted) {
      setTimeLeft(600); // 10 minutes in seconds
    } else {
      setTimeLeft(null);
    }
  }, [selectedQuiz, submitted]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      if (!submitted) handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

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

  // Handler for edit
  const handleEditQuiz = (quizId) => {
    setEditQuizId(quizId);
    setShowAddQuiz(true);
  };
  // Handler for create
  const handleCreateQuiz = () => {
    setEditQuizId(null);
    setShowAddQuiz(true);
  };
  // Handler for close
  const handleCloseAddQuiz = () => {
    setEditQuizId(null);
    setShowAddQuiz(false);
  };
  // Handler for successful quiz creation/edit
  const handleQuizSaved = () => {
    setEditQuizId(null);
    setShowAddQuiz(false);
    // Refresh quiz list
    fetchQuizzes();
  };

  // Drag-and-drop handlers for quiz reordering
  function DraggableQuizItem({ quiz, isDraggable }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: quiz._id });
    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, border: '1px solid #eee', borderRadius: 8, margin: '8px 0', background: '#fff', padding: 16, display: 'flex', alignItems: 'center', cursor: isDraggable ? 'grab' : 'default' }}>
        {isDraggable && <span {...attributes} {...listeners} style={{ marginRight: 12, fontWeight: 700, cursor: 'grab' }}>≡</span>}
        <span>{quiz.title || 'Untitled Quiz'}</span>
      </div>
    );
  }

  const handleQuizDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = quizOrder.findIndex(id => id === active.id);
    const newIndex = quizOrder.findIndex(id => id === over.id);
    const newOrder = arrayMove(quizOrder, oldIndex, newIndex);
    setQuizOrder(newOrder);
    // Prepare payload for backend
    const items = newOrder.map((id, idx) => ({ type: 'quiz', id, order: idx + 1 }));
    try {
      await axios.post(`${server}/api/course/update-content-order`, { courseId, items }, { headers: { token: localStorage.getItem('token') } });
      fetchQuizzes();
    } catch {
      // Optionally log or handle error, but do not leave block empty
    }
  };

  return (
    <>
      {selectedQuiz && timeLeft !== null && !submitted && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '32px 0 16px 0',
          width: '100%',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #1cc524',
            borderRadius: 8,
            padding: '12px 32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            fontWeight: 700,
            color: timeLeft <= 30 ? 'red' : '#1cc524',
            fontSize: 20,
            textAlign: 'center',
            minWidth: 180
          }}>
            <div style={{ fontSize: 15, color: '#333', fontWeight: 500, marginBottom: 2 }}>Remaining time</div>
            <div>{formatTime(timeLeft)}</div>
          </div>
        </div>
      )}
      <div className="quiz-container">
        {(user?.role === 'admin' || user?.role === 'instructor' || (Array.isArray(user?.roles) && user?.roles.includes('instructor'))) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button className="quiz-create-btn" onClick={handleCreateQuiz} disabled={reorderMode}>
              ➕ Create Quiz
            </button>
            <button className="quiz-create-btn" style={{ marginLeft: 8 }} onClick={() => setReorderMode(r => !r)}>
              {reorderMode ? 'Done' : 'Reorder Quizzes'}
            </button>
            {showAddQuiz && (
              <div style={{ marginTop: '1.5rem' }}>
                <AddQuiz courseId={courseId} quizId={editQuizId} onSuccess={handleQuizSaved} />
                <button className="quiz-create-btn" style={{ background: '#ff3b30', marginTop: 8 }} onClick={handleCloseAddQuiz}>
                  Cancel
                </button>
              </div>
            )}
            {reorderMode && (
              <div style={{ marginTop: '2rem' }}>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleQuizDragEnd}>
                  <SortableContext items={quizOrder} strategy={verticalListSortingStrategy}>
                    {quizOrder.map(id => {
                      const quiz = quizzes.find(q => q._id === id);
                      if (!quiz) return null;
                      return <DraggableQuizItem key={quiz._id} quiz={quiz} isDraggable={true} />;
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )}
        {!selectedQuiz ? (
          <>
            <div className="quiz-header">
              <h2>Select a Quiz</h2>
            </div>
            <ul className="quiz-list">
              {quizzes && quizzes.length > 0 ? (
                quizzes.map((quiz) => {
                  const isCompleted = quizProgress.completed.includes(quiz._id);
                  const bestScore = quizProgress.scores[quiz._id];
                  return (
                    <li key={quiz._id} className="quiz-list-item">
                      <button
                        onClick={() => {
                          if (isCompleted) {
                            setPendingQuiz(quiz);
                            setShowReattemptConfirm(true);
                          } else {
                            setSelectedQuiz(quiz);
                          }
                        }}
                        className={`quiz-select-btn${isCompleted ? ' completed' : ''}`}
                      >
                        <span className="quiz-title">
                          {quiz.title || "Untitled Quiz"}
                        </span>
                        <span className="quiz-best-score">
                          Best: {typeof bestScore === 'number' ? bestScore : 0} / {quiz.questions.length}
                        </span>
                        {isCompleted && (
                          <span className="quiz-tick">✔</span>
                        )}
                      </button>
                      {(user?.role === 'admin' || user?.role === 'instructor' || (Array.isArray(user?.roles) && user?.roles.includes('instructor'))) && (
                        <>
                          <button
                            className="quiz-edit-btn"
                            style={{ background: '#007aff', color: 'white', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer', marginTop: 8 }}
                            onClick={() => handleEditQuiz(quiz._id)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="quiz-delete-btn"
                            style={{ background: '#ff3b30', color: 'white', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer', marginTop: 8, marginLeft: 8 }}
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this quiz?')) {
                                try {
                                  await axios.delete(`${server}/api/quiz/${quiz._id}`, {
                                    headers: { token: localStorage.getItem('token') },
                                  });
                                  fetchQuizzes();
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
                  );
                })
              ) : (
                (user?.role === 'admin' || user?.role === 'instructor' || (Array.isArray(user?.roles) && user?.roles.includes('instructor'))) ? (
                  <div style={{ margin: '2rem auto', textAlign: 'center', color: '#1cc524', fontWeight: 600 }}>
                    No quizzes found for this course. Create one above!
                  </div>
                ) : (
                  <div style={{ margin: '2rem auto', textAlign: 'center', color: '#1cc524', fontWeight: 600 }}>
                    No quizzes available.
                  </div>
                )
              )}
            </ul>
            <div className="quiz-card-grid-spacer"></div>
            {/* Info message about attempts */}
            <div style={{ color: '#1cc524', fontWeight: 500, marginTop: 16, textAlign: 'center' }}>
              You can attempt any quiz any number of times. Your best score will always be considered.
            </div>
            {/* Reattempt confirmation popup */}
            {showReattemptConfirm && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', minWidth: 320, textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18, color: '#1cc524' }}>
                    You have already attempted this quiz.<br />Are you sure you want to reattempt?
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <button
                      style={{ background: '#1cc524', color: '#fff', border: 'none', borderRadius: 5, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedQuiz(pendingQuiz);
                        setShowReattemptConfirm(false);
                        setPendingQuiz(null);
                      }}
                    >
                      OK
                    </button>
                    <button
                      style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 5, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                      onClick={() => {
                        setShowReattemptConfirm(false);
                        setPendingQuiz(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {selectedQuiz && (
              <div className="quiz-header">
                <h2>{selectedQuiz.title || "Quiz"}</h2>
                <button className="quiz-back-btn" onClick={() => lectureId ? navigate(`/lectures/${lectureId}`) : null} disabled={!lectureId}>
                  ← Back
                </button>
                {!lectureId && (
                  <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
                    Cannot determine lecture page to return to.
                  </div>
                )}
              </div>
            )}
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
    </>
  );
};

export default Quiz;