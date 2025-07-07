import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import { toast } from "react-toastify";
import { MdOutlineDone } from "react-icons/md";
import { CourseData } from "../../context/CourseContext";
import LectureCommentSection from "../../components/comment/LectureCommentSection";
import { useRef } from "react";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddQuiz from '../../admin/Courses/AddQuiz.jsx';

// Adjust path

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [pdf, setPdf] = useState("");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showEditQuiz, setShowEditQuiz] = useState(false);
  const [editQuizId, setEditQuizId] = useState(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  const { fetchCourse, course } = CourseData();

  const watchStartRef = useRef(null);
  const watchDurationRef = useRef(0);
  const lastLectureIdRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    // Allow access for admins, superadmins, assigned instructors, or enrolled students
    const isCourseInstructor = user && (
      user.role === 'admin' ||
      user.role === 'superadmin' ||
      (Array.isArray(course?.instructors) && course.instructors.map(String).includes(String(user._id)))
    );
    if (
      user &&
      !isCourseInstructor &&
      Array.isArray(user.subscription) &&
      !user.subscription.includes(params.id)
    ) {
      navigate("/");
    }
  }, [user, params.id, navigate, course]);

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    if (video) myForm.append("file", video);
    if (pdf) myForm.append("pdf", pdf);
    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
      setPdf("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setCompleted(data.courseProgressPercentage || 0);
      setCompletedLec(data.completedLectures || 0);
      setLectLength(data.allLectures || 0);
      setProgress(data.progress || []);
    } catch (error) {
      // If 404 or error, set all to 0/defaults
      setCompleted(0);
      setCompletedLec(0);
      setLectLength(0);
      setProgress([]);
      console.log(error);
    }
  }

  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log(data.message);
      
      // Show points notification if it's a new completion
      if (data.message === "New Progress added" || data.message === "Progress started") {
        toast.success("🎉 +1 point earned for completing this video!");
      }
      
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  console.log(progress);

  useEffect(() => {
    fetchLectures();
    fetchProgress();
    fetchCourse(params.id);
  }, []);

  // Auto-select lecture if lectureId is present in query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lectureId = searchParams.get('lectureId');
    if (lectureId) {
      fetchLecture(lectureId);
    }
  }, [location.search, lectures.length]);

  //css for comment and desc
  const infoRef = useRef(null);
  const commentRef = useRef(null);
  useEffect(() => {
  if (!infoRef.current || !commentRef.current) return;

  const setWidth = () => {
    commentRef.current.style.width = `${infoRef.current.offsetWidth}px`;
  };

  setWidth(); // Initial sync

  const resizeObserver = new ResizeObserver(setWidth);
  resizeObserver.observe(infoRef.current);

  window.addEventListener("resize", setWidth); // Optional fallback

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("resize", setWidth);
  };
}, []);


  // Helper to log watch time
  const logWatchTime = async (durationMinutes) => {
    if (!lecture?._id || !params.id || user?.role === "admin" || durationMinutes <= 0) return;
    try {
      await axios.post(`${server}/api/user/log-lecture-watch`, {
        lectureId: lecture._id,
        courseId: params.id,
        duration: durationMinutes
      }, {
        headers: { token: localStorage.getItem("token") }
      });
    } catch (err) {
      // Optionally handle error
    }
  };

  // Start timer when lecture changes
  useEffect(() => {
    if (!lecture?._id || user?.role === "admin") return;
    // If switching lectures, log previous watch time
    if (lastLectureIdRef.current && lastLectureIdRef.current !== lecture._id) {
      const elapsed = Math.round((Date.now() - watchStartRef.current) / 60000);
      logWatchTime(elapsed);
    }
    watchStartRef.current = Date.now();
    lastLectureIdRef.current = lecture._id;
    // Reset duration
    watchDurationRef.current = 0;
    return () => {
      // On unmount, log time for current lecture
      if (watchStartRef.current && lastLectureIdRef.current === lecture._id) {
        const elapsed = Math.round((Date.now() - watchStartRef.current) / 60000);
        logWatchTime(elapsed);
      }
    };
  }, [lecture?._id]);

  // On video end, log time and reset timer
  const handleVideoEnded = () => {
    if (!watchStartRef.current) return;
    const elapsed = Math.round((Date.now() - watchStartRef.current) / 60000);
    logWatchTime(elapsed);
    watchStartRef.current = Date.now(); // reset for possible replay
  };

  // Fetch lectures and quizzes, merge and sort by order
  useEffect(() => {
    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        const [lecturesRes, quizzesRes] = await Promise.all([
          axios.get(`${server}/api/lectures/${params.id}`, { headers: { token: localStorage.getItem('token') } }),
          axios.get(`${server}/api/quiz/${params.id}`, { headers: { token: localStorage.getItem('token') } })
        ]);
        const lectures = Array.isArray(lecturesRes.data.lectures) ? lecturesRes.data.lectures : [];
        const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
        const merged = [
          ...lectures.map(l => ({ ...l, type: 'lecture', id: l._id })),
          ...quizzes.map(q => ({ ...q, type: 'quiz', id: q._id }))
        ];
        merged.sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log('Merged contentList (order):', merged.map(item => ({ type: item.type, title: item.title, order: item.order })));
        setContentList(merged);
      } catch (err) {
        // Do not clear contentList on error; just log the error
        console.error('Failed to fetch lectures/quizzes:', err);
      }
      setLoadingContent(false);
    };
    fetchContent();
  }, [params.id]);

  // Helper to get best score for a quiz
  const getBestQuizScore = (quizId) => {
    if (!progress[0] || !Array.isArray(progress[0].quizScores)) return null;
    const found = progress[0].quizScores.find(q => q.quiz === quizId || q.quiz?._id === quizId);
    return found ? found.bestScore : null;
  };

  function DraggableItem({ item, isDraggable }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    return (
      <div style={{ background: '#f4f4fb', borderRadius: 16, margin: '8px 0', padding: 0 }}>
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center', cursor: isDraggable ? 'grab' : 'pointer', padding: 16 }}>
          {isDraggable && <span {...attributes} {...listeners} style={{ marginRight: 12, fontWeight: 700, cursor: 'grab' }}>≡</span>}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {item.type === 'lecture' ? (
              <>
                <span style={{ fontSize: 20, marginRight: 8 }}>🎬</span>
                <span style={{ fontWeight: 500 }}>{item.title}</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 20, marginRight: 8 }}>📝</span>
                <span style={{ color: '#007aff', fontWeight: 600, marginRight: 8 }}>{item.title}</span>
                {typeof getBestQuizScore(item.id) === 'number' && (
                  <span style={{ color: '#34c759', fontWeight: 700, fontSize: 14 }}>
                    (Best: {getBestQuizScore(item.id)})
                  </span>
                )}
                {isInstructor && (
                  <>
                    <button
                      style={{ marginLeft: 10, background: '#007aff', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }}
                      onClick={e => { e.stopPropagation(); handleEditQuiz(item.id); }}
                      title="Edit Quiz"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{ marginLeft: 6, background: '#ff3b30', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }}
                      onClick={e => { e.stopPropagation(); handleDeleteQuiz(item.id); }}
                      title="Delete Quiz"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isInstructor = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'instructor');

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = contentList.findIndex(i => i.id === active.id);
    const newIndex = contentList.findIndex(i => i.id === over.id);
    const newList = arrayMove(contentList, oldIndex, newIndex);
    setContentList(newList);
    // Prepare payload for backend
    const items = newList.map((item, idx) => ({ type: item.type, id: item.id, order: idx + 1 }));
    try {
      await axios.post(`${server}/api/course/update-content-order`, { courseId: params.id, items }, { headers: { token: localStorage.getItem('token') } });
      // Refetch the latest order from backend
      const [lecturesRes, quizzesRes] = await Promise.all([
        axios.get(`${server}/api/lectures/${params.id}`, { headers: { token: localStorage.getItem('token') } }),
        axios.get(`${server}/api/quiz/${params.id}`, { headers: { token: localStorage.getItem('token') } })
      ]);
      const lectures = Array.isArray(lecturesRes.data.lectures) ? lecturesRes.data.lectures : [];
      const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
      const merged = [
        ...lectures.map(l => ({ ...l, type: 'lecture', id: l._id })),
        ...quizzes.map(q => ({ ...q, type: 'quiz', id: q._id }))
      ];
      merged.sort((a, b) => (a.order || 0) - (b.order || 0));
      setContentList(merged);
    } catch {}
  };

  // Add handlers for edit and delete quiz
  const handleEditQuiz = (quizId) => {
    setEditQuizId(quizId);
    setShowEditQuiz(true);
  };
  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`${server}/api/quiz/${quizId}`, {
          headers: { token: localStorage.getItem('token') },
        });
        // Only refresh content list if delete succeeds
        const [lecturesRes, quizzesRes] = await Promise.all([
          axios.get(`${server}/api/lectures/${params.id}`, { headers: { token: localStorage.getItem('token') } }),
          axios.get(`${server}/api/quiz/${params.id}`, { headers: { token: localStorage.getItem('token') } })
        ]);
        const lectures = Array.isArray(lecturesRes.data.lectures) ? lecturesRes.data.lectures : [];
        const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
        const merged = [
          ...lectures.map(l => ({ ...l, type: 'lecture', id: l._id })),
          ...quizzes.map(q => ({ ...q, type: 'quiz', id: q._id }))
        ];
        merged.sort((a, b) => (a.order || 0) - (b.order || 0));
        setContentList(merged);
      } catch (err) {
        // Show a toast notification instead of alert, and do not clear content
        if (window && window.toast) {
          window.toast.error('Failed to delete quiz');
        } else {
          alert('Failed to delete quiz');
        }
      }
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="lecture-modern">
          {/* Course Progress */}
          {user && user.role === "admin" ? (
            <div
              className="lecture-progress-bar"
              style={{
                margin: "12px 0 auto 12px auto",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                All lectures available for management
              </div>
            </div>
          ) : user && Array.isArray(user.subscription) && user.subscription.includes(params.id) ? (
            lectLength === 0 ? (
              <div
                className="lecture-progress-bar"
                style={{
                  margin: "12px 0 auto 12px auto",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  No lectures available yet.
                </div>
              </div>
            ) : completedLec === 0 ? (
              <div
                className="lecture-progress-bar"
                style={{
                  margin: "12px 0 auto 12px auto",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Course Progress: 0% (No lectures completed yet)
                </div>
                <div
                  className="lecture-progress-bar-track"
                  style={{ width: "100%", maxWidth: 400 }}
                >
                  <div
                    className="lecture-progress-bar-fill"
                    style={{ width: `0%` }}
                  ></div>
                </div>
                <span
                  className="lecture-progress-bar-percent"
                  style={{
                    color: "#34c759",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    marginTop: 12,
                  }}
                >
                  Start your first lecture!
                </span>
              </div>
            ) : (
              <div
                className="lecture-progress-bar"
                style={{
                  margin: "12px 0 auto 12px auto",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Course Progress - {completedLec || 0} out of {lectLength || 0}
                </div>
                <div
                  className="lecture-progress-bar-track"
                  style={{ width: "100%", maxWidth: 400 }}
                >
                  <div
                    className="lecture-progress-bar-fill"
                    style={{ width: `${completedLec / lectLength * 100}%` }}
                  ></div>
                </div>
                <span
                  className="lecture-progress-bar-percent"
                  style={{
                    color: "#34c759",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    marginTop: 12,
                  }}
                >
                  {completedLec / lectLength * 100}%
                </span>
              </div>
            )
          ) : null}
          {/* Admin Add Lecture and Create Quiz Buttons */}
          {user && (user.role === 'admin' || user.role === 'instructor') && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <button
                className="common-btn"
                onClick={() => setShow(!show)}
              >
                {show ? "Close" : "Add Lecture +"}
              </button>
              <button
                className="common-btn"
                onClick={() => setShowCreateQuiz(true)}
              >
                Create Quiz +
              </button>
            </div>
          )}
          {/* Admin Add Lecture Form */}
          {show && user && (user.role === 'admin' || user.role === 'instructor') && (
            <div className="lecture-form-box">
              <div className="lecture-form">
                <form onSubmit={submitHandler}>
                  <label>Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                  <label>Description</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} required />
                  <label>Video File</label>
                  <input type="file" accept="video/mp4" onChange={changeVideoHandler} />
                  <label>PDF File (optional)</label>
                  <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files[0])} />
                  <button type="submit" className="common-btn" disabled={btnLoading}>{btnLoading ? "Adding..." : "Add"}</button>
                </form>
              </div>
            </div>
          )}
          {/* Video Section (if present) */}
          {lecture?.video ? (
            <div className="lecture-video-section-modern">
              <video
                src={`${server}/${lecture.video}`}
                width="100%"
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                autoPlay
                onEnded={handleVideoEnded}
                style={{
                  borderRadius: "16px",
                  marginBottom: "1.5rem",
                  marginTop: "2rem",
                }}
              ></video>
            </div>
          ) : (
            <h2 style={{ marginTop: "2rem", textAlign: "center" }}>
              Please Select a Lecture
            </h2>
          )}
          {/* Side by Side Layout for Info and List */}
          <div className={lecture?._id ? "lecture-main-grid" : "lecture-main-flex"}>
            {lecture?.title && (
              <div className="lecture-info-modern" ref={infoRef}>
                <h2>
                  Lecture {lectures.findIndex((l) => l._id === lecture._id) + 1}
                  : {lecture?.title}
                </h2>
                <div style={{ color: "#888", fontSize: 16, margin: "8px 0" }}>
                  <span>Design</span>
                  <span style={{ marginLeft: 16 }}>3 Month</span>
                </div>
                <div style={{ margin: "8px 0" }}>
                  <b>Description:</b>
                  <div style={{ marginTop: 4 }}>{lecture?.description}</div>
                </div>
                <button className="notes-btn-modern" onClick={() => {
                  if (lecture.pdf) {
                    window.open(`${server}/${lecture.pdf}`, '_blank', 'noopener,noreferrer');
                  } else {
                    window.alert('No notes available.');
                  }
                }}>Notes</button>
              </div>
            )}

            <div className="lecture-list-vertical-scroll">
              {loadingContent ? (
                <div>Loading content...</div>
              ) : isInstructor ? (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={contentList.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {contentList.map((item, i) => (
                      <div key={item.id} style={{ position: 'relative', display: 'inline-block' }}>
                        <div
                          className={`lecture-list-btn-modern${lecture._id === item.id ? ' active' : ''}`}
                          onClick={() => item.type === 'lecture' ? fetchLecture(item.id) : navigate(`/quiz/${item.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {i + 1}. <DraggableItem item={item} isDraggable={true} />
                          {item.type === 'lecture' && item.video && (
                            <span style={{ marginLeft: 10, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#155724', fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '2px 10px', boxShadow: '0 2px 8px rgba(40, 167, 69, 0.10)', verticalAlign: 'middle', display: 'inline-block', letterSpacing: 0.5, marginTop: -2 }}>
                              +1 point
                            </span>
                          )}
                          {item.type === 'lecture' && progress[0] && progress[0].completedLectures.includes(item.id) && (
                            <span style={{ marginLeft: 8, color: '#000000', fontWeight: 700 }}>✔</span>
                          )}
                        </div>
                        {isInstructor && (user.role === 'admin' || user.role === 'instructor') && item.type === 'lecture' && (
                          <button
                            className="delete-lecture-btn"
                            style={{ position: 'absolute', top: 6, right: 6, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontWeight: 700, fontSize: 14, zIndex: 2 }}
                            onClick={() => deleteHandler(item.id)}
                            title={`Delete ${item.title}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                contentList.map((item, i) => (
                  <div key={item.id} style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      className={`lecture-list-btn-modern${lecture._id === item.id ? ' active' : ''}`}
                      onClick={() => item.type === 'lecture' ? fetchLecture(item.id) : navigate(`/quiz/${item.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {i + 1}. {item.type === 'lecture' ? <span>🎬 {item.title}</span> : <span style={{ color: '#007aff', fontWeight: 600 }}>📝 Quiz: {item.title}{typeof getBestQuizScore(item.id) === 'number' && (<span style={{ marginLeft: 8, color: '#34c759', fontWeight: 700, fontSize: 14 }}>(Best: {getBestQuizScore(item.id)})</span>)}</span>}
                      {item.type === 'lecture' && item.video && (
                        <span style={{ marginLeft: 10, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#155724', fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '2px 10px', boxShadow: '0 2px 8px rgba(40, 167, 69, 0.10)', verticalAlign: 'middle', display: 'inline-block', letterSpacing: 0.5, marginTop: -2 }}>
                          +1 point
                        </span>
                      )}
                      {item.type === 'lecture' && progress[0] && progress[0].completedLectures.includes(item.id) && (
                        <span style={{ marginLeft: 8, color: '#000000', fontWeight: 700 }}>✔</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {lecture?._id && (
              <div className="lecture-comment" ref={commentRef}>
                <LectureCommentSection
                  lectureId={lecture._id}
                  isPaidUser={
                    user?.subscription?.includes(params.id) ||
                    user?.role === "admin"
                  }
                  user={user}
                />
              </div>
            )}
          </div>
          {showEditQuiz && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', minWidth: 420, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button style={{ position: 'absolute', top: 8, right: 8, background: '#eee', border: 'none', borderRadius: 5, padding: '0.3rem 0.7rem', cursor: 'pointer', fontWeight: 700, fontSize: 18 }} onClick={() => setShowEditQuiz(false)}>×</button>
                <AddQuiz courseId={params.id} quizId={editQuizId} onSuccess={() => { setShowEditQuiz(false); setEditQuizId(null); /* refresh content list */ fetchContent(); }} />
              </div>
            </div>
          )}
          {/* Create Quiz Modal */}
          {showCreateQuiz && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', minWidth: 420, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button style={{ position: 'absolute', top: 8, right: 8, background: '#eee', border: 'none', borderRadius: 5, padding: '0.3rem 0.7rem', cursor: 'pointer', fontWeight: 700, fontSize: 18 }} onClick={() => setShowCreateQuiz(false)}>×</button>
                <AddQuiz courseId={params.id} onSuccess={() => { setShowCreateQuiz(false); /* refresh content list if needed */ }} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Lecture;
