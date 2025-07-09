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
import { MdEdit } from "react-icons/md";

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
  const [activeTab, setActiveTab] = useState('lectures');
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editLectureData, setEditLectureData] = useState({});

  const { fetchCourse, course } = CourseData();

  const watchStartRef = useRef(null);
  const watchDurationRef = useRef(0);
  const lastLectureIdRef = useRef(null);
  const videoRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    // Only run if user, course, and user.subscription are loaded and not loading
    if (loading || !user || !course || !Array.isArray(user.subscription)) return;

    const isCourseInstructor = (
      user.role === 'admin' ||
      (Array.isArray(course?.instructors) && course.instructors.map(String).includes(String(user._id)))
    );
    if (
      !isCourseInstructor &&
      !user.subscription.includes(params.id)
    ) {
      navigate("/");
    }
  }, [user, params.id, navigate, course, loading]);

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
    // Only mark progress if user watched at least 90% of the video
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const watched = videoRef.current.currentTime;
      if (duration && watched / duration >= 0.9) {
        addProgress(lecture._id);
      }
    }
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

  // Helper to get best score for a quiz (in points)
  const getBestQuizScore = (quizId) => {
    if (!progress[0] || !Array.isArray(progress[0].quizScores)) return null;
    const found = progress[0].quizScores.find(q => (q.quiz === quizId || q.quiz?._id === quizId));
    return found ? (typeof found.bestScore === 'number' ? found.bestScore : (found.score || null)) : null;
  };

  // Define a consistent style for point badges
  const pointBadgeStyle = {
    width: 110,
    minWidth: 110,
    display: 'inline-block',
    textAlign: 'center',
    marginLeft: 0,
    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
    color: '#155724',
    fontWeight: 700,
    fontSize: 16,
    borderRadius: 14,
    padding: '10px 0',
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.10)',
    verticalAlign: 'middle',
    letterSpacing: 0.5,
    marginTop: -2
  };

  // Use existing logic for lecture and quiz progress
  const lectureProgressPercent = lectLength ? Math.round((completedLec / lectLength) * 100) : 0;
  const quizIdsInCourse = new Set(contentList.filter(item => item.type === 'quiz').map(q => q.id));
  let completedQuizCount = 0;
  if (progress && progress[0] && Array.isArray(progress[0].quizScores)) {
    // Only count unique quizzes in this course where bestScore >= 50% of total points
    const passedQuizIds = new Set();
    contentList.filter(item => item.type === 'quiz').forEach(quiz => {
      const bestScore = getBestQuizScore(quiz.id);
      const totalPoints = quiz.totalPoints || 1; // fallback to 1 to avoid div by zero
      if (bestScore !== null && totalPoints > 0 && (bestScore / totalPoints) * 100 >= 50) {
        passedQuizIds.add(quiz.id);
      }
    });
    completedQuizCount = passedQuizIds.size;
  }
  const quizCount = quizIdsInCourse.size;
  const quizProgressPercent = quizCount ? Math.round((completedQuizCount / quizCount) * 100) : 0;

  function DraggableItem({ item, isDraggable, onClick, isActive, bestScore, onLectureEdit, editingLectureId, setEditingLectureId, editLectureData, setEditLectureData }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const isEditing = editingLectureId === item.id;
    // Use parent state for edit fields
    const editData = isEditing && editLectureData && editLectureData.id === item.id ? editLectureData : { title: item.title, description: item.description, video: null, pdf: null };
    const handleEdit = (e) => {
      e.stopPropagation();
      setEditingLectureId(item.id);
      setEditLectureData({ id: item.id, title: item.title, description: item.description, video: null, pdf: null });
    };
    const handleCancel = (e) => { e && e.stopPropagation(); setEditingLectureId(null); setEditLectureData({}); };
    const handleSave = async (e) => {
      e.preventDefault();
      try {
        const formData = new FormData();
        formData.append("title", editData.title);
        formData.append("description", editData.description);
        if (editData.video) formData.append("file", editData.video);
        if (editData.pdf) formData.append("pdf", editData.pdf);
        await axios.put(`${server}/api/lecture/${item.id}`, formData, {
          headers: {
            token: localStorage.getItem("token"),
            'Content-Type': 'multipart/form-data',
          },
        });
        if (onLectureEdit) onLectureEdit(item.id, { title: editData.title, description: editData.description });
        setEditingLectureId(null);
        setEditLectureData({});
      } catch (err) {
        alert("Failed to update lecture.");
      }
    };
    if (isEditing) {
      return (
        <form ref={setNodeRef} onSubmit={handleSave} style={{ width: '100%', background: '#232a34', borderRadius: 8, margin: '8px 0', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ color: '#fff', fontWeight: 600 }}>Title
            <input type="text" value={editData.title} onChange={e => setEditLectureData(data => ({ ...data, title: e.target.value }))} required style={{ width: '100%', marginBottom: 8, borderRadius: 6, border: '1px solid #10b981', padding: 6 }} />
          </label>
          <label style={{ color: '#fff', fontWeight: 600 }}>Description
            <input type="text" value={editData.description} onChange={e => setEditLectureData(data => ({ ...data, description: e.target.value }))} required style={{ width: '100%', marginBottom: 8, borderRadius: 6, border: '1px solid #10b981', padding: 6 }} />
          </label>
          <label style={{ color: '#fff', fontWeight: 600 }}>Video File
            <input type="file" accept="video/*" onChange={e => setEditLectureData(data => ({ ...data, video: e.target.files[0] }))} style={{ marginBottom: 8 }} />
          </label>
          <label style={{ color: '#fff', fontWeight: 600 }}>PDF File (optional)
            <input type="file" accept="application/pdf" onChange={e => setEditLectureData(data => ({ ...data, pdf: e.target.files[0] }))} style={{ marginBottom: 8 }} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="modern-btn">Save</button>
            <button type="button" className="modern-btn secondary" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      );
    }
    return (
      <div
        ref={setNodeRef}
        className={`lecture-list-btn-modern${item.type === 'quiz' ? ' quiz' : ''}${isActive ? ' active' : ''}`}
        style={{ cursor: 'default', position: 'relative', opacity: isDragging ? 0.5 : 1, userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 0, paddingRight: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          {isDraggable && (
            <span
              {...attributes}
              {...listeners}
              className="drag-handle"
              style={{ marginRight: 18, fontSize: 22, color: '#43e97b', cursor: 'grab', userSelect: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              ≡
            </span>
          )}
          <div className="accent-bar" />
          <span style={{ fontSize: 20, marginRight: 16, flexShrink: 0 }}>{item.type === 'lecture' ? '🎬' : '📝'}</span>
          <span
            className="lecture-title-link"
            style={{ fontWeight: 600, color: item.type === 'quiz' ? '#43e97b' : '#fff', marginRight: 0, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, overflow: 'hidden' }}
            onClick={e => {
              e.stopPropagation();
              if (item.type === 'lecture') onClick && onClick();
              else if (item.type === 'quiz') onClick && onClick();
            }}
            tabIndex={0}
            role="button"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (item.type === 'lecture') onClick && onClick();
                else if (item.type === 'quiz') onClick && onClick();
              }
            }}
          >
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160, display: 'inline-block', verticalAlign: 'middle' }}>{item.title}</span>
            {isInstructor && item.type === 'lecture' && (
              <button
                style={{ background: 'transparent', color: '#007aff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 18, marginLeft: 8, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                onClick={handleEdit}
                title="Edit Lecture"
              >
                ✏️
              </button>
            )}
            {item.type === 'quiz' && bestScore !== null && (
              <span style={{ marginLeft: 8,marginTop: 20, fontSize: 13, color: '#ffd700', fontWeight: 700 }}>
                (Best: {bestScore} points)
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12, flexShrink: 0 , marginTop: 0}}>
          {item.type === 'lecture' && item.video && (
            <span className="point-badge-modern">+1 point</span>
          )}
          {item.type === 'quiz' && (
            <span className="point-badge-modern">+5 points</span>
          )}
          {isInstructor && item.type === 'quiz' && (
            <>
              <button
                style={{ background: 'transparent', color: '#007aff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 18, marginLeft: 8, marginTop: 20, display: 'inline-flex', alignItems: 'center' }}
                onClick={e => { e.stopPropagation(); handleEditQuiz(item.id); }}
                title="Edit Quiz"
              >
                ✏️
              </button>
              <button
                style={{ marginLeft: 6, background: 'transparent', color: '#ff3b30', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 18, marginTop: 20, display: 'inline-flex', alignItems: 'center' }}
                onClick={e => { e.stopPropagation(); handleDeleteQuiz(item.id); }}
                title="Delete Quiz"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const isInstructor = user && (user.role === 'admin' || user.role === 'instructor');
  const isInstructorOrAdmin = user && (
    user.role === 'admin' ||
    user.role === 'instructor'
  );

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

  const lecturesOnly = contentList.filter(item => item.type === 'lecture');
  const quizzesOnly = contentList.filter(item => item.type === 'quiz');

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="lecture-page-modern">
          <div className="lecture-content-container">
            {/* Progress Bars at the very top, outside main content */}
            {!isInstructorOrAdmin && (
              <div className="lecture-progress-sticky">
                <div style={{ width: '100%', maxWidth: 900, margin: '0 auto 0 auto', padding: '0 12px' }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: '#63e642', marginBottom: 4 }}>Lecture Progress</div>
                    <div style={{ background: '#232a36', borderRadius: 8, height: 18, width: '100%', marginBottom: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0002' }}>
                      <div style={{ width: `${lectureProgressPercent}%`, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', height: '100%', borderRadius: 8, transition: 'width 0.5s' }}></div>
                    </div>
                    <span style={{ color: '#fff', fontSize: 14 }}>{completedLec} / {lectLength} lectures completed ({lectureProgressPercent}%)</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#43e97b', marginBottom: 4 }}>Quiz Progress</div>
                    <div style={{ background: '#232a36', borderRadius: 8, height: 18, width: '100%', marginBottom: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0002' }}>
                      <div style={{ width: `${quizProgressPercent}%`, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', height: '100%', borderRadius: 8, transition: 'width 0.5s' }}></div>
                    </div>
                    <span style={{ color: '#fff', fontSize: 14 }}>{completedQuizCount} / {quizCount} quizzes completed ({quizProgressPercent}%)</span>
                  </div>
                </div>
              </div>
            )}
            <div className={`lecture-main-flex-row${!lecture?.video ? ' center-list' : ''}`}>
              {lecture?.video && (
                <div className="lecture-main-left-col">
                  <div className="lecture-video-section-modern">
                    <video
                      ref={videoRef}
                      src={`${server}/${lecture.video}`}
                      width="100%"
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      autoPlay
                      onEnded={handleVideoEnded}
                      style={{ borderRadius: "20px", marginBottom: "1.5rem", marginTop: "0.5rem", boxShadow: '0 8px 40px 0 rgba(60, 255, 180, 0.13)' }}
                    ></video>
                  </div>
                  {lecture?.title && (
                    <div className="lecture-info-modern">
                      <h2 className="lecture-title-modern">
                        {lecture?.title}
                      </h2>
                      <div className="lecture-meta-modern" style={{ color: "#888", fontSize: 16, margin: "8px 0" }}>
                        <span>Design</span>
                        <span style={{ marginLeft: 16 }}>3 Month</span>
                      </div>
                      <div className="lecture-description-modern" style={{ margin: "8px 0" }}>
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
                  {lecture?._id && (
                    <div className="lecture-comment-modern">
                      <LectureCommentSection
                        lectureId={lecture._id}
                        isPaidUser={user?.subscription?.includes(params.id) || user?.role === "admin"}
                        user={user}
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="lecture-main-right-col">
                <div className="lecture-list-glass-container">
                  {user && (user.role === 'admin' || user.role === 'instructor') && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
                      <button className="common-btn" onClick={() => setShow(!show)}>
                        {show ? "Close" : "Add Lecture +"}
                      </button>
                      <button className="common-btn" onClick={() => setShowCreateQuiz(true)}>
                        Create Quiz +
                      </button>
                    </div>
                  )}
                  {show && user && (user.role === 'admin' || user.role === 'instructor') && (
                    <div className="lecture-form-box" style={{ background: 'rgba(24,28,36,0.92)', borderRadius: 24, boxShadow: '0 8px 32px rgba(16,185,129,0.10)', padding: '2.5rem 2rem', marginBottom: 24, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', border: '1.5px solid rgba(16,185,129,0.18)' }}>
                      <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={{ color: '#10b981', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: 16 }}>Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', borderRadius: 10, border: '1.5px solid #10b981', background: '#181c24', color: '#fff', padding: '10px 12px', fontSize: 15, marginBottom: 0, outline: 'none', boxShadow: '0 2px 8px #10b98111', transition: 'border 0.2s' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={{ color: '#10b981', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: 16 }}>Description</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', borderRadius: 10, border: '1.5px solid #10b981', background: '#181c24', color: '#fff', padding: '10px 12px', fontSize: 15, marginBottom: 0, outline: 'none', boxShadow: '0 2px 8px #10b98111', transition: 'border 0.2s' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={{ color: '#10b981', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: 16 }}>Video File</label>
                            <input type="file" accept="video/mp4,video/*" onChange={changeVideoHandler} style={{ width: '100%', borderRadius: 10, border: '1.5px solid #10b981', background: '#181c24', color: '#fff', padding: '8px 6px', fontSize: 15, marginBottom: 0, outline: 'none', boxShadow: '0 2px 8px #10b98111', transition: 'border 0.2s' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={{ color: '#10b981', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: 16 }}>PDF File <span style={{ color: '#bdbdbd', fontWeight: 400, fontSize: 13 }}>(optional)</span></label>
                            <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files[0])} style={{ width: '100%', borderRadius: 10, border: '1.5px solid #10b981', background: '#181c24', color: '#fff', padding: '8px 6px', fontSize: 15, marginBottom: 0, outline: 'none', boxShadow: '0 2px 8px #10b98111', transition: 'border 0.2s' }} />
                          </div>
                        </div>
                        <button type="submit" className="modern-btn" style={{ marginTop: 18, width: 120, alignSelf: 'flex-start', fontSize: 18, fontWeight: 700, borderRadius: 14, boxShadow: '0 2px 8px #10b98144' }} disabled={btnLoading}>{btnLoading ? "Adding..." : "Add"}</button>
                      </form>
                    </div>
                  )}
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={contentList.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      <div className="lecture-list-vertical-scroll">
                        {contentList.map((item, i) => (
                          <DraggableItem
                            key={item.id}
                            item={item}
                            isDraggable={isInstructor}
                            onClick={() => {
                              if (item.type === 'lecture') fetchLecture(item.id);
                              else if (item.type === 'quiz') navigate(`/quiz/${item.id}?lectureId=${lecture?._id || params.id}`);
                            }}
                            isActive={lecture?._id === item.id}
                            bestScore={item.type === 'quiz' ? getBestQuizScore(item.id) : null}
                            onLectureEdit={(id, updatedItem) => {
                              const updatedContentList = contentList.map(item => {
                                if (item.id === id) {
                                  return { ...item, ...updatedItem };
                                }
                                return item;
                              });
                              setContentList(updatedContentList);
                            }}
                            editingLectureId={editingLectureId}
                            setEditingLectureId={setEditingLectureId}
                            editLectureData={editLectureData}
                            setEditLectureData={setEditLectureData}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
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
        </div>
      )}
    </>
  );
};

export default Lecture;
