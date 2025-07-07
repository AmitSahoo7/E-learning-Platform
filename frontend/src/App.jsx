import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import Loading from "./components/loading/Loading";
import Courses from "./pages/courses/Courses";
import CourseDescription from "./pages/coursedescription/CourseDescription";
import PaymentSuccess from "./pages/paymentsuccess/PaymentSuccess";
import Dashboard from "./pages/dashboard/Dashboard";
import CourseStudy from "./pages/coursestudy/CourseStudy";
import Lecture from "./pages/lecture/Lecture";
import GeneralChatbot from "./components/GeneralChatbot";
import Quiz from "./pages/quiz/Quiz";
import AdminCourses from "./admin/Courses/AdminCourses";
import AdminUsers from "./admin/Users/AdminUsers";
import AdminDashbord from "./admin/Dashboard/AdminDashbord";
import AddCourse from "./admin/Courses/AddCourse";
import AdminFinalAssessmentPage from './admin/Courses/AdminFinalAssessmentPage';
import AssessmentAttemptsViewer from './admin/Courses/AssessmentAttemptsViewer';
import CertificateGenerator from './components/certificate/CertificateGenerator';
import FinalAssessment from './components/finalassessment/FinalAssessment';
import { useNavigate, useParams } from "react-router-dom";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import axios from "axios";
import { server } from "./main";
import Events from "./pages/events";
import Webinar from "./pages/webinar/Webinar";
import AdminWebinars from "./admin/Webinar/AdminWebinars";
import AddQuiz from './admin/Courses/AddQuiz.jsx';
import RegisterInstructor from "./pages/auth/RegisterInstructor";

const App = () => {
  const { isAuth, user, loading } = UserData();

  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);

  useEffect(() => {
    if (!isAuth) return;
    const fetchAnnouncements = async () => {
      try {
        const { data } = await axios.get(`${server}/api/admin/announcements`, {
          headers: { token: localStorage.getItem("token") },
        });
        setAnnouncements(data.announcements || []);
      } catch {
        setAnnouncements([]);
      }
    };
    fetchAnnouncements();
    // const interval = setInterval(fetchAnnouncements, 60000);
    // return () => clearInterval(interval);
  }, [isAuth]);

  useEffect(() => {
    const read = localStorage.getItem("readAnnouncements");
    if (read) setReadAnnouncements(JSON.parse(read));
  }, []);

  const markAnnouncementRead = (id) => {
    if (!readAnnouncements.includes(id)) {
      const updated = [id, ...readAnnouncements];
      setReadAnnouncements(updated);
      localStorage.setItem("readAnnouncements", JSON.stringify(updated));
    }
  };

  const addAnnouncement = async (msg) => {
    if (!user || user.role !== "admin") return;
    try {
      const { data } = await axios.post(
        `${server}/api/admin/announcement`,
        { message: msg },
        { headers: { token: localStorage.getItem("token") } }
      );
      setAnnouncements((prev) => [data.announcement, ...prev]);
    } catch {
      // alert("Failed to send announcement");
    }
  };

  return (
    <BrowserRouter>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header
            isAuth={isAuth}
            announcements={announcements}
            readAnnouncements={readAnnouncements}
            markAnnouncementRead={markAnnouncementRead}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="/account"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
            <Route
              path="/course/:id"
              element={isAuth ? <CourseDescription user={user} /> : <Login />}
            />
            <Route
              path="/payment-success/:id"
              element={isAuth ? <PaymentSuccess user={user} /> : <Login />}
            />
            <Route
              path=":id/dashboard"
              element={isAuth ? <Dashboard user={user} /> : <Login />}
            />
            <Route
              path="/course/study/:id"
              element={isAuth ? <CourseStudy user={user} /> : <Login />}
            />
            <Route
              path="/quiz/course/:courseId"
              element={isAuth ? <Quiz user={user} /> : <Login />}
            />
            <Route
              path="/quiz/:quizId"
              element={isAuth ? <Quiz user={user} /> : <Login />}
            />
            <Route
              path="/quiz/create/:courseId"
              element={<AddQuiz />}
            />
            <Route
              path="/course/:courseId/assessment"
              element={isAuth ? <FinalAssessment user={user} /> : <Login />}
            />
            <Route
              path="/course/:courseId/certificate"
              element={isAuth ? <CertificateGenerator user={user} /> : <Login />}
            />
            <Route
              path="/admin/course"
              element={
                isAuth && user.role === "admin" ? (
                  <AdminCourses />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/users"
              element={
                isAuth && user.role === "admin" ? <AdminUsers /> : <Home />
              }
            />
            <Route
              path="/lectures/:id"
              element={isAuth ? <Lecture user={user} /> : <Login />}
            />
            <Route
              path="/admin/dashboard"
              element={
                isAuth && user.role === "admin"
                  ? <AdminDashbord user={user} addAnnouncement={addAnnouncement} />
                  : <Home />
              }
            />
            <Route
              path="/admin/course/add"
              element={
                isAuth && user.role === "admin" ? (
                  <AddCourse user={user} />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/course/:courseId/assessments"
              element={
                isAuth && user.role === "admin" ? <AdminFinalAssessmentPage /> : <Home />
              }
            />
            <Route
              path="/admin/course/:courseId/attempts"
              element={
                isAuth && user.role === "admin" ? <AssessmentAttemptsViewer /> : <Home />
              }
            />
            <Route
              path="/leaderboard"
              element={<Leaderboard user={user} />}
            />
            <Route path="/events" element={<Events />} />
            <Route
              path="/instructor/dashboard"
              element={
                isAuth && (user.role === "instructor" || (Array.isArray(user.roles) && user.roles.includes("instructor"))) ? (
                  <InstructorDashboard user={user} />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/register-instructor"
              element={isAuth ? <Home /> : <RegisterInstructor />}
            />
            <Route path="/webinar" element={<Webinar />} />
            <Route
              path="/admin/webinars"
              element={
                isAuth && user.role === "admin" ? <AdminWebinars /> : <Home />
              }
            />
          </Routes>
          <Footer />
          <GeneralChatbot />
        </>
      )}
    </BrowserRouter>
  );
};

export default App;