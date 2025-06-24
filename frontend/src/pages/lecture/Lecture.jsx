import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import { toast } from "react-toastify";
import { MdOutlineDone } from "react-icons/md";

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

  useEffect(() => {
    if (user && user.role !== "admin" && !user.subscription.includes(params.id)) {
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

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="progress">
            Lecture completed - {completedLec} out of {lectLength} <br />
            <progress value={completed} max={100}></progress> {completed} %
          </div>
          <div className="lecture-page">
            <div className="left">
              {lecLoading ? (
                <Loading />
              ) : (
                <>
                  {lecture.pdf ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '2px solid #8a4baf', borderRadius: '12px', padding: '32px', background: '#fff' }}>
                      <h1 style={{ color: '#8a4baf', marginBottom: '12px' }}>{lecture.title}</h1>
                      <h3 style={{ color: '#333', marginBottom: '24px' }}>{lecture.description}</h3>
                      <a
                        href={`${server}/${lecture.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="common-btn"
                        style={{ fontSize: '1.2rem', padding: '16px 32px', background: '#8a4baf', color: '#fff', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', margin: '0 auto' }}
                      >
                        Download PDF
                      </a>
                    </div>
                  ) : lecture.video ? (
                    <>
                      <video
                        src={`${server}/${lecture.video}`}
                        width={"100%"}
                        controls
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        autoPlay
                        onEnded={() => addProgress(lecture._id)}
                      ></video>
                      <h1>{lecture.title}</h1>
                      <h3>{lecture.description}</h3>
                    </>
                  ) : (
                    <h1>Please Select a Lecture</h1>
                  )}
                </>
              )}
            </div>
            <div className="right">
              {user && user.role === "admin" && (
                <button className="common-btn" onClick={() => setShow(!show)}>
                  {show ? "Close" : "Add Lecture +"}
                </button>
              )}

              {show && (
                <div className="lecture-form">
                  <div className="toggle-upload" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                      className={toggle === "video" ? "common-btn active" : "common-btn"}
                      onClick={() => setToggle("video")}
                      type="button"
                    >
                      Video
                    </button>
                    <button
                      className={toggle === "pdf" ? "common-btn active" : "common-btn"}
                      onClick={() => setToggle("pdf")}
                      type="button"
                    >
                      PDF
                    </button>
                  </div>
                  {toggle === "video" ? (
                    <>
                      <h2>Add Lecture</h2>
                      <form onSubmit={submitHandler}>
                        <label htmlFor="text">Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                        <label htmlFor="text">Description</label>
                        <input
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
                    </>
                  ) : (
                    <>
                      <h2>Add Lecture PDF</h2>
                      <form onSubmit={submitPdfHandler}>
                        <label htmlFor="text">Title</label>
                        <input
                          type="text"
                          value={pdfTitle}
                          onChange={(e) => setPdfTitle(e.target.value)}
                          required
                        />
                        <label htmlFor="text">Description</label>
                        <input
                          type="text"
                          value={pdfDescription}
                          onChange={(e) => setPdfDescription(e.target.value)}
                          required
                        />
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={e => setPdf(e.target.files[0])}
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
                    </>
                  )}
                </div>
              )}

              {lectures && lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <>
                    <div
                      onClick={() => fetchLecture(e._id)}
                      key={i}
                      className={`lecture-number ${
                        lecture._id === e._id && "active"
                      }`}
                    >
                      {i + 1}. {e.title}{" "}
                      {progress[0] &&
                        progress[0].completedLectures.includes(e._id) && (
                          <span
                            style={{
                              background: "green",
                              padding: "2px",
                              borderRadius: "50%",
                              width: "20px",
                              color: "white",
                            }}
                          >
                          <MdOutlineDone />
                            
                          </span>
                        )}
                    </div>
                    {user && user.role === "admin" && (
                      <button
                        className="common-btn"
                        style={{ background: "red" }}
                        onClick={() => deleteHandler(e._id)}
                      >
                        Delete {e.title}
                      </button>
                    )}
                  </>
                ))
              ) : (
                <p>No Lectures Yet!</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Lecture;
