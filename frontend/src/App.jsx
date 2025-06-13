import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Header from "./components/header/Header";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import Loading from "./components/loading/Loading";
import Courses from "./pages/courses/Courses";

const App = () => {
  console.log("App component rendering");
  const { isAuth, user, loading } = UserData();
  console.log("Context values:", { isAuth, user, loading });
  
  return (
    <BrowserRouter>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header isAuth={isAuth} />
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
          </Routes>
          <Footer />
        </>
      )}
    </BrowserRouter>
  );
};

export default App;
