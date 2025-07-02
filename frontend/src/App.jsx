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
import AdminCourses from "./admin/Courses/AdminCourses";
import AdminUsers from "./admin/Users/AdminUsers";
import AdminDashbord from "./admin/Dashboard/AdminDashbord";
import AddCourse from "./admin/Courses/AddCourse";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import axios from "axios";
import { server } from "./main";

const App = () => {
  const { isAuth, user, loading } = UserData();

  // Announcement state
  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);

  // Fetch announcements from backend
  useEffect(() => {
    if (!isAuth) return;
    const fetchAnnouncements = async () => {
      try {
        const { data } = await axios.get(`${server}/api/admin/announcements`, {
          headers: { token: localStorage.getItem("token") },
        });
        setAnnouncements(data.announcements || []);
      } catch (err) {
        setAnnouncements([]);
      }
    };
    fetchAnnouncements();
    // Optionally, poll every 60s for new announcements
    // const interval = setInterval(fetchAnnouncements, 60000);
    // return () => clearInterval(interval);
  }, [isAuth]);

  // Mark announcement as read (local only)
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

  // Add announcement (admin only)
  const addAnnouncement = async (msg) => {
    if (!user || user.role !== "admin") return;
    try {
      const { data } = await axios.post(
        `${server}/api/admin/announcement`,
        { message: msg },
        { headers: { token: localStorage.getItem("token") } }
      );
      // Prepend new announcement to state
      setAnnouncements((prev) => [data.announcement, ...prev]);
    } catch (err) {
      // Optionally show error
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
              path="/leaderboard"
              element={<Leaderboard user={user} />}
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