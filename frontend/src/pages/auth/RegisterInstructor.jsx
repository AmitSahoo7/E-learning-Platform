import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { FaUserPlus , FaEye , FaEyeSlash } from "react-icons/fa";

// Instructor registration form with extra fields for description and years of experience
const RegisterInstructor = () => {
  const navigate = useNavigate();
  const { btnLoading, registerUser } = UserData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    // You may want to create a separate registerInstructor function in UserContext
    await registerUser(name, email, password, navigate, {
      description,
      yearsOfExperience,
      role: 'instructor',
    });
  };
  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-logo"><FaUserPlus size={48} color="#3ecf8e" /></div>
        <h2>Create Instructor Account</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label="Toggle password visibility"
            >
              {showPassword ?<FaEye /> : <FaEyeSlash /> }
            </span>
          </div>
          <label htmlFor="description">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe your expertise, background, etc."
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <label htmlFor="yearsOfExperience">Years of Experience</label>
          <input
            type="number"
            min="0"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            required
            placeholder="Enter years of experience"
          />
          <button type="submit" disabled={btnLoading} className="common-btn">
            {btnLoading ? "Please wait.." : "Register as Instructor"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterInstructor; 