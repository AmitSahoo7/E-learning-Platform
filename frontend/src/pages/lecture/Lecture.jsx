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
  const [toggle, setToggle] = useState("video"); // 'video' or 'pdf'
  // PDF upload states
  const [pdf, setPdf] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfBtnLoading, setPdfBtnLoading] = useState(false);

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
    myForm.append("file", video);

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



  // PDF upload handler
  const submitPdfHandler = async (e) => {
    setPdfBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();
    myForm.append("title", pdfTitle);
    myForm.append("description", pdfDescription);
    if (pdf) myForm.append("file", pdf);
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
      setPdfBtnLoading(false);
      setShow(false);
      fetchLectures();
      setPdf("");
      setPdfTitle("");
      setPdfDescription("");
    } catch (error) {
      toast.error(error.response.data.message);
      setPdfBtnLoading(false);
    }
  };

  // --- Progress bar safety logic ---
  const safeLectLength = lectLength > 0 ? lectLength : 1; // avoid division by zero
  const safeCompletedLec = Math.min(completedLec, safeLectLength);
  const percent = Math.round((safeCompletedLec / safeLectLength) * 100);
  const safeCompleted = Math.min(percent, 100);

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
                  Course Progress - {safeCompletedLec} out of {safeLectLength}
                </div>
                <div
                  className="lecture-progress-bar-track"
                  style={{ width: "100%", maxWidth: 400 }}
                >
                  <div
                    className="lecture-progress-bar-fill"
                    style={{ width: `${safeCompleted}%` }}
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
                  {safeCompleted}%
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
                <div className="toggle-upload">
                  <button
                    className={
                      toggle === "video" ? "common-btn active" : "common-btn"
                    }
                    onClick={() => setToggle("video")}
                    type="button"
                  >
                    Video
                  </button>
                  <button
                    className={
                      toggle === "pdf" ? "common-btn active" : "common-btn"
                    }
                    onClick={() => setToggle("pdf")}
                    type="button"
                  >
                    PDF
                  </button>
                </div>
                {toggle === "video" ? (
                  <div className="lecture-form-box">
                    <h2>Add Lecture</h2>
                    <form onSubmit={submitHandler}>
                      <label htmlFor="lecture-title">Title</label>
                      <input
                        id="lecture-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                      <label htmlFor="lecture-description">Description</label>
                      <input
                        id="lecture-description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                      <input
                        type="file"
                        placeholder="choose video"
                        onChange={changeVideoHandler}
                        required
                        accept="video/mp4"
                      />
                      {videoPrev && (
                        <video
                          src={videoPrev}
                          alt=""
                          width={300}
                          controls
                        ></video>
                      )}
                      <button
                        disabled={btnLoading}
                        type="submit"
                        className="common-btn"
                      >
                        {btnLoading ? "Please Wait..." : "Add"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="lecture-form-box">
                    <h2>Add Lecture PDF</h2>
                    <form onSubmit={submitPdfHandler}>
                      <label htmlFor="pdf-title">Title</label>
                      <input
                        id="pdf-title"
                        type="text"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        required
                      />
                      <label htmlFor="pdf-description">Description</label>
                      <input
                        id="pdf-description"
                        type="text"
                        value={pdfDescription}
                        onChange={(e) => setPdfDescription(e.target.value)}
                        required
                      />
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdf(e.target.files[0])}
                        required
                      />
                      <button
                        disabled={pdfBtnLoading}
                        type="submit"
                        className="common-btn"
                      >
                        {pdfBtnLoading ? "Please Wait..." : "Add PDF"}
                      </button>
                    </form>
                  </div>
                )}
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
                <button className="notes-btn-modern">Notes</button>
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
                      {progress[0] &&
                        progress[0].completedLectures.includes(e._id) && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "#000000",
                              fontWeight: 700,
                            }}
                          >
                            ✔
                          </span>
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
    </>
  );
};

export default Lecture;
