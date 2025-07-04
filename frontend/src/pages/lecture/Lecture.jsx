import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import { toast } from "react-toastify";
import { MdOutlineDone } from "react-icons/md";
import { CourseData } from "../../context/CourseContext";
import LectureCommentSection from "../../components/comment/LectureCommentSection";
import { useRef } from "react";

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

  const { fetchCourse, course } = CourseData();

  useEffect(() => {
    if (
      user &&
      user.role !== "admin" &&
      !user.subscription.includes(params.id)
    ) {
      navigate("/");
    }
  }, [user, params.id, navigate]);

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

      setCompleted(data.courseProgressPercentage);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);
    } catch (error) {
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
          ) : user && user.subscription.includes(params.id) ? (
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
                  Course Progress - {completedLec} out of {lectLength}
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
          {/* Admin Add Lecture Button */}
          {user && user.role === "admin" && (
            <button
              className="common-btn"
              style={{ margin: "0 auto 16px auto", display: "block" }}
              onClick={() => setShow(!show)}
            >
              {show ? "Close" : "Add Lecture +"}
            </button>
          )}
          {/* Admin Add Lecture Form */}
          {show && user && user.role === "admin" && (
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
                onEnded={() => addProgress(lecture._id)}
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
                <button className="notes-btn-modern" onClick={() => setShowPdfModal(true)}>Notes</button>
              </div>
            )}

            <div className="lecture-list-vertical-scroll">
              {lectures && lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <div
                    key={e._id}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <button
                      className={`lecture-list-btn-modern${
                        lecture._id === e._id ? " active" : ""
                      }`}
                      onClick={() => fetchLecture(e._id)}
                    >
                      {i + 1}. {e.title}

                      {/* +1 point badge for video lectures only */}
                      {e.video && (
                        <span style={{
                          marginLeft: 10,
                          background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                          color: '#155724',
                          fontWeight: 700,
                          fontSize: 13,
                          borderRadius: 8,
                          padding: '2px 10px',
                          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.10)',
                          verticalAlign: 'middle',
                          display: 'inline-block',
                          letterSpacing: 0.5,
                          marginTop: -2
                        }}>
                          +1 point
                        </span>
                      )}
                      {progress[0] && progress[0].completedLectures.includes(e._id) && (
                        <span style={{ marginLeft: 8, color: '#000000', fontWeight: 700 }}>✔</span>
                      )}

                    </button>
                    {user && user.role === "admin" && (
                      <button
                        className="delete-lecture-btn"
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 14,
                          zIndex: 2,
                        }}
                        onClick={() => deleteHandler(e._id)}
                        title={`Delete ${e.title}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No Lectures Yet!</p>
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
        </div>
      )}
      {/* PDF Modal */}
      {showPdfModal && lecture && (
        <div className="modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="modal-content" style={{ maxWidth: 800, width: '90%', height: '80vh', background: '#fff', borderRadius: 12, padding: 16, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setShowPdfModal(false)}>Close</button>
            {lecture.pdf ? (
              <iframe src={`${server}/${lecture.pdf}`} title="Lecture Notes PDF" width="100%" height="100%" style={{ border: 'none', minHeight: 500 }}></iframe>
            ) : (
              <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#888', marginTop: '2em' }}>No notes available.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Lecture;
