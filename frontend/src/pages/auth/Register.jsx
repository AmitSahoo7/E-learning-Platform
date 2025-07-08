import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { FaUserPlus , FaEye , FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const { btnLoading, registerUser } = UserData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobile", mobile);
    if (photo) formData.append("photo", photo);
    await registerUser(formData, navigate); // Update registerUser to handle FormData
  };
  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-logo"><FaUserPlus size={48} color="#3ecf8e" /></div>
        <h2>Create Your Account</h2>
        <form onSubmit={submitHandler} encType="multipart/form-data">
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
          <label htmlFor="mobile">Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            placeholder="Enter your mobile number"
          />
          <label htmlFor="photo">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPhoto(e.target.files[0])}
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
          <button type="submit" disabled={btnLoading} className="common-btn">
            {btnLoading ? "Please wait.." : "Register"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
