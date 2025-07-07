import React, { useState, useEffect } from "react";
import Layout from "../Utils/Layout";
import "./admincourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const categories = [
  "Web Development",
  "App Development",
  "Game Development",
  "Data Science",
  "Artificial Intelligence",
];

const AddCourse = ({ user, editMode = false, initialData = {}, onSuccess }) => {
  const [toggle, setToggle] = useState("video");
  // Video upload states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  // New fields for dynamic course info
  const [tagline, setTagline] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [whatYouLearn, setWhatYouLearn] = useState("");
  const [courseOutcomes, setCourseOutcomes] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [instructorBio, setInstructorBio] = useState("");
  const [instructorAvatar, setInstructorAvatar] = useState("");
  const [instructorAvatarPrev, setInstructorAvatarPrev] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [previewVideoPrev, setPreviewVideoPrev] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setPrice(initialData.price || "");
      setDuration(initialData.duration || "");
      setImagePrev(initialData.image ? `${server}/${initialData.image}` : "");
      setTagline(initialData.tagline || "");
      setDifficulty(initialData.difficulty || "");
      setPrerequisites(initialData.prerequisites || "");
      setWhatYouLearn(initialData.whatYouLearn || "");
      setCourseOutcomes(initialData.courseOutcomes || "");
      setInstructorName(initialData.instructorName || "");
      setInstructorBio(initialData.instructorBio || "");
      setInstructorAvatarPrev(initialData.instructorAvatar ? `${server}/${initialData.instructorAvatar}` : "");
      setPreviewVideoPrev(initialData.previewVideo ? `${server}/${initialData.previewVideo}` : "");
    }
  }, [editMode, initialData]);

  // Fetch instructors on mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await axios.get(`${server}/api/admin/users`, {
          headers: { token: localStorage.getItem("token") },
        });
        const instructorUsers = res.data.users.filter(u => u.role === "instructor");
        setInstructors(instructorUsers);
      } catch (err) {
        toast.error("Failed to fetch instructors");
      }
    };
    fetchInstructors();
  }, []);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  // Handlers for new file inputs
  const changeInstructorAvatarHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setInstructorAvatarPrev(reader.result);
      setInstructorAvatar(file);
    };
  };
  const changePreviewVideoHandler = (e) => {
    const file = e.target.files[0];
    setPreviewVideo(file);
    setPreviewVideoPrev(URL.createObjectURL(file));
  };

  // Video upload handler (course creation or edit)
  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("duration", duration);
    myForm.append("tagline", tagline);
    myForm.append("difficulty", difficulty);
    myForm.append("prerequisites", prerequisites);
    myForm.append("whatYouLearn", whatYouLearn);
    myForm.append("courseOutcomes", courseOutcomes);
    myForm.append("instructorName", instructorName);
    myForm.append("instructorBio", instructorBio);
    if (image) myForm.append("image", image);
    if (instructorAvatar) myForm.append("instructorAvatar", instructorAvatar);
    if (previewVideo) myForm.append("previewVideo", previewVideo);
    selectedInstructors.forEach(id => myForm.append('instructors', id));
    try {
      let res;
      if (editMode && initialData && initialData._id) {
        res = await axios.put(`${server}/api/admin/course/${initialData._id}`, myForm, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
      } else {
        res = await axios.post(`${server}/api/admin/course/new`, myForm, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
      }
      toast.success(res.data.message);
      setBtnLoading(false);
      if (onSuccess) onSuccess();
      if (!editMode) {
        setImage("");
        setTitle("");
        setDescription("");
        setDuration("");
        setImagePrev("");
        setPrice("");
        setCategory("");
        setTagline("");
        setDifficulty("");
        setPrerequisites("");
        setWhatYouLearn("");
        setCourseOutcomes("");
        setInstructorName("");
        setInstructorBio("");
        setInstructorAvatar("");
        setInstructorAvatarPrev("");
        setPreviewVideo("");
        setPreviewVideoPrev("");
        setSelectedInstructors([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setBtnLoading(false);
    }
  };

  return (
    editMode ? (
      <div className="add-course-page">
        <div className="cd-card add-course-form-card">
          <div className="course-form">
            <h2 className="cd-title" style={{ fontSize: '1.5rem', color: '#34c759', marginBottom: '1.2rem' }}>{editMode ? "Edit Course" : "Add Course (Video)"}</h2>
            <form onSubmit={submitHandler} className="add-course-form">
              <label>Title</label>
              <input
                className="cd-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label>Description</label>
              <input
                className="cd-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <label>Price</label>
              <input
                className="cd-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <label>Instructors (assign multiple)</label>
              <select
                className="cd-input"
                multiple
                value={selectedInstructors}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedInstructors(options.map(opt => opt.value));
                }}
                required={selectedInstructors.length === 0}
              >
                {instructors.map(inst => (
                  <option value={inst._id} key={inst._id}>{inst.name} ({inst.email})</option>
                ))}
              </select>
              <label>Category</label>
              <select
                className="cd-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value={""}>Select Category</option>
                {categories.map((e) => (
                  <option value={e} key={e}>
                    {e}
                  </option>
                ))}
              </select>
              <label>Duration</label>
              <input
                className="cd-input"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
              <label>Course Image</label>
              <input className="cd-input" type="file" onChange={changeImageHandler} { ...(editMode ? {} : { required: true }) } />
              {imagePrev && <img src={imagePrev} alt="" width={300} style={{ borderRadius: 12, margin: '1rem 0' }} />}
              <label>Tagline</label>
              <input
                className="cd-input"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short catchy summary"
              />
              <label>Difficulty</label>
              <select
                className="cd-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                required
              >
                <option value="">Select Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Medium">Medium</option>
                <option value="Advanced">Advanced</option>
              </select>
              <label>Prerequisites</label>
              <textarea
                className="cd-input"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="Enter each prerequisite on a new line"
                rows={3}
              />
              <label>What you'll learn</label>
              <textarea
                className="cd-input"
                value={whatYouLearn}
                onChange={(e) => setWhatYouLearn(e.target.value)}
                placeholder="Enter each learning outcome on a new line"
                rows={3}
              />
              <label>Course Outcomes</label>
              <textarea
                className="cd-input"
                value={courseOutcomes}
                onChange={(e) => setCourseOutcomes(e.target.value)}
                placeholder="Enter each course outcome on a new line"
                rows={3}
              />
              <label>Instructor Bio</label>
              <textarea
                className="cd-input"
                value={instructorBio}
                onChange={(e) => setInstructorBio(e.target.value)}
                placeholder="Short instructor bio"
                rows={2}
              />
              <label>Instructor Avatar</label>
              <input className="cd-input" type="file" accept="image/*" onChange={changeInstructorAvatarHandler} />
              {instructorAvatarPrev && <img src={instructorAvatarPrev} alt="Instructor Avatar" width={80} style={{ borderRadius: 40, margin: '0.5rem 0' }} />}
              <label>Preview Video (optional)</label>
              <input className="cd-input" type="file" accept="video/*" onChange={changePreviewVideoHandler} />
              {previewVideoPrev && <video src={previewVideoPrev} width={200} height={80} controls style={{ borderRadius: 12, margin: '0.5rem 0' }} />}
              <button
                type="submit"
                disabled={btnLoading}
                className="cd-btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {btnLoading ? "Please Wait..." : editMode ? "Save Changes" : "Add"}
              </button>
            </form>
          </div>
        </div>
      </div>
    ) : (
      <Layout>
        <nav className="admin-feature-nav">
          <a href="/admin/dashboard" className="admin-feature-link">Dashboard Home</a>
          <a href="/admin/course/add" className="admin-feature-link">Add Course</a>
          <a href="/admin/course" className="admin-feature-link">Manage Courses</a>
          <a href="/admin/users" className="admin-feature-link">Manage Users</a>
        </nav>
        <div className="add-course-page">
          <div className="cd-card add-course-form-card">
            <div className="course-form">
              <h2 className="cd-title" style={{ fontSize: '1.5rem', color: '#34c759', marginBottom: '1.2rem' }}>{editMode ? "Edit Course" : "Add Course (Video)"}</h2>
              <form onSubmit={submitHandler} className="add-course-form">
                <label>Title</label>
                <input
                  className="cd-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <label>Description</label>
                <input
                  className="cd-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <label>Price</label>
                <input
                  className="cd-input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <label>Instructors (assign multiple)</label>
                <select
                  className="cd-input"
                  multiple
                  value={selectedInstructors}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions);
                    setSelectedInstructors(options.map(opt => opt.value));
                  }}
                  required={selectedInstructors.length === 0}
                >
                  {instructors.map(inst => (
                    <option value={inst._id} key={inst._id}>{inst.name} ({inst.email})</option>
                  ))}
                </select>
                <label>Category</label>
                <select
                  className="cd-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value={""}>Select Category</option>
                  {categories.map((e) => (
                    <option value={e} key={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <label>Duration</label>
                <input
                  className="cd-input"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
                <label>Course Image</label>
                <input className="cd-input" type="file" onChange={changeImageHandler} { ...(editMode ? {} : { required: true }) } />
                {imagePrev && <img src={imagePrev} alt="" width={300} style={{ borderRadius: 12, margin: '1rem 0' }} />}
                <label>Tagline</label>
                <input
                  className="cd-input"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Short catchy summary"
                />
                <label>Difficulty</label>
                <select
                  className="cd-input"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  required
                >
                  <option value="">Select Difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <label>Prerequisites</label>
                <textarea
                  className="cd-input"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="Enter each prerequisite on a new line"
                  rows={3}
                />
                <label>What you'll learn</label>
                <textarea
                  className="cd-input"
                  value={whatYouLearn}
                  onChange={(e) => setWhatYouLearn(e.target.value)}
                  placeholder="Enter each learning outcome on a new line"
                  rows={3}
                />
                <label>Course Outcomes</label>
                <textarea
                  className="cd-input"
                  value={courseOutcomes}
                  onChange={(e) => setCourseOutcomes(e.target.value)}
                  placeholder="Enter each course outcome on a new line"
                  rows={3}
                />
                <label>Instructor Bio</label>
                <textarea
                  className="cd-input"
                  value={instructorBio}
                  onChange={(e) => setInstructorBio(e.target.value)}
                  placeholder="Short instructor bio"
                  rows={2}
                />
                <label>Instructor Avatar</label>
                <input className="cd-input" type="file" accept="image/*" onChange={changeInstructorAvatarHandler} />
                {instructorAvatarPrev && <img src={instructorAvatarPrev} alt="Instructor Avatar" width={80} style={{ borderRadius: 40, margin: '0.5rem 0' }} />}
                <label>Preview Video (optional)</label>
                <input className="cd-input" type="file" accept="video/*" onChange={changePreviewVideoHandler} />
                {previewVideoPrev && <video src={previewVideoPrev} width={200} height={80} controls style={{ borderRadius: 12, margin: '0.5rem 0' }} />}
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="cd-btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {btnLoading ? "Please Wait..." : editMode ? "Save Changes" : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    )
  );
};

export default AddCourse; 