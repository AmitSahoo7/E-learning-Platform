import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { FaCheckCircle } from "react-icons/fa";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const { btnLoading, verifyOtp } = UserData();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    await verifyOtp(Number(otp), navigate);
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-logo"><FaCheckCircle size={48} color="#3ecf8e" /></div>
        <h2>Verify Your Account</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="otp">OTP</label>
          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter the OTP sent to your email"
          />
          <button disabled={btnLoading} type="submit" className="common-btn">
            {btnLoading ? "Please Wait.." : "Verify"}
          </button>

        <p>
          Go to <Link to="/login">Login</Link> page
        </p>
        </form>
      </div>
    </div>
  );
};

export default Verify;