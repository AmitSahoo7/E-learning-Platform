import React, { useState } from "react";
import Layout from "../Utils/Layout";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import AddCourse from "./AddCourse";
import Modal from "../../components/Modal";
import { FaPencilAlt, FaFileAlt } from "react-icons/fa";
import "./admincourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";
import FinalAssessmentManager from './FinalAssessmentManager';

const categories = [
  "Web Development",
  "App Development",
  "Game Development",
  "Data Science",
  "Artificial Intelligence",
];

const AdminCourses = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") return navigate("/");

  const [toggle, setToggle] = useState("video");

  // Video upload states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // PDF upload states
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdf, setPdf] = useState("");
  const [pdfBtnLoading, setPdfBtnLoading] = useState(false);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const { courses, fetchCourses } = CourseData();
  const [editCourse, setEditCourse] = useState(null);
  const [assessmentCourseId, setAssessmentCourseId] = useState(null);

  // Custom onClose for modal: only allow close via close button
  const handleModalClose = (e) => {
    // If e is defined and is a click event, prevent closing if not from close button
    if (e && e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
      // Do nothing (disable close on overlay click)
      return;
    }
    setEditCourse(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("createdBy", createdBy);
    myForm.append("duration", duration);
    myForm.append("image", image);

    try {
      const { data } = await axios.post(`${server}/api/admin/course/new`, myForm, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      toast.success(data.message);
      setBtnLoading(false);
      await fetchCourses();
      setImage("");
      setTitle("");
      setDescription("");
      setDuration("");
      setImagePrev("");
      setCreatedBy("");
      setPrice("");
      setCategory("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setBtnLoading(false);
    }
  };

  const submitPdfHandler = async (e) => {
    e.preventDefault();
    setPdfBtnLoading(true);
    const myForm = new FormData();
    myForm.append("title", pdfTitle);
    if (pdf) myForm.append("pdf", pdf);

    try {
      const { data } = await axios.post(`${server}/api/admin/course/new`, myForm, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      setPdfBtnLoading(false);
      await fetchCourses();
      setPdf("");
      setPdfTitle("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setPdfBtnLoading(false);
    }
  };

  return (
    <Layout>
      {/* Restore navigation links at the top */}
      <nav className="admin-feature-nav">
        <a href="/admin/dashboard" className="admin-feature-link">Dashboard Home</a>
        <a href="/admin/course/add" className="admin-feature-link">Add Course</a>
        <a href="/admin/course" className="admin-feature-link">Manage Courses</a>
        <a href="/admin/users" className="admin-feature-link">Manage Users</a>
      </nav>

      <div className="admin-courses">
        <div className="left">
          <h1>All Courses</h1>
          <div className="dashboard-content">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} style={{ position: 'relative' }}>
                  {/* Floating Edit Button */}
                  <button
                    className="edit-fab-btn"
                    title="Edit Course"
                    onClick={() => setEditCourse(course)}
                  >
                    <FaPencilAlt size={16} />
                  </button>
                  {/* Floating Assessment Button */}
                  <button
                    className="assessment-fab-btn"
                    title="Manage Final Assessments"
                    onClick={() => navigate(`/admin/course/${course._id}/assessments`)}
                  >
                    <FaFileAlt size={16} />
                  </button>
                  <CourseCard course={course} />
                </div>
              ))
            ) : (
              <p>No Courses Yet</p>
            )}
          </div>
        </div>
      </div>
      {/* Edit Form Modal */}
      <Modal isOpen={!!editCourse} onClose={handleModalClose} disableOverlayClick={true}>
        {editCourse && (
          <AddCourse
            user={user}
            editMode={true}
            initialData={editCourse}
            onSuccess={() => {
              setEditCourse(null);
              fetchCourses();
              toast.success("Course updated!");
            }}
          />
        )}
      </Modal>
      <Modal isOpen={!!assessmentCourseId} onClose={() => setAssessmentCourseId(null)}>
        {assessmentCourseId && <FinalAssessmentManager courseId={assessmentCourseId} />}
      </Modal>
    </Layout>
  );
};

export default AdminCourses;
