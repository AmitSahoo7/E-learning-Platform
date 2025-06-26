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

const App = () => {
  const { isAuth, user, loading } = UserData();

  // Announcement state
  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  useEffect(() => {
    const stored = localStorage.getItem("announcements");
    if (stored) setAnnouncements(JSON.parse(stored));
    const read = localStorage.getItem("readAnnouncements");
    if (read) setReadAnnouncements(JSON.parse(read));
  }, []);
  const addAnnouncement = (msg) => {
    const newAnnouncement = {
      id: Date.now(),
      message: msg,
      timestamp: new Date().toISOString(),
    };
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("announcements", JSON.stringify(updated));
  };
  const markAnnouncementRead = (id) => {
    if (!readAnnouncements.includes(id)) {
      const updated = [id, ...readAnnouncements];
      setReadAnnouncements(updated);
      localStorage.setItem("readAnnouncements", JSON.stringify(updated));
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
              path="/:id/dashboard"
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
          </Routes>
          <Footer />
          <GeneralChatbot />
        </>
      )}
    </BrowserRouter>
  );
};

export default App;