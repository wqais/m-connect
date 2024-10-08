import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardFlip from "react-card-flip";
import "./login.css"; // Import the CSS file for custom styles

const Login = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });

  const [registerDetails, setRegisterDetails] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const [alertMessages, setAlertMessages] = useState([]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setAlertMessages([]); // Clear any existing alerts when flipping the card
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterDetails({ ...registerDetails, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        loginDetails,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token } = response.data;
      setAlertMessages([...alertMessages, "Login successful!"]);
      localStorage.setItem("token", token);
      navigate(`/home/${loginDetails.username}`);
    } catch (error) {
      setAlertMessages([
        ...alertMessages,
        error.response?.data?.message || "An error occurred during login",
      ]);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        registerDetails,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMessages([...alertMessages, "Registration successful! Please log in."]);
      setIsFlipped(false);
    } catch (error) {
      setAlertMessages([
        ...alertMessages,
        error.response?.data?.message || "An error occurred during registration",
      ]);
    }
  };

  return (
    <div className="login-container">
      <CardFlip isFlipped={isFlipped} flipDirection="horizontal">
        <div key="front" className="card">
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginDetails.username}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginDetails.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
          <p onClick={handleFlip} className="toggle-form">
            New User? Register here.
          </p>
        </div>

        <div key="back" className="card">
          <h2>Register</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={registerDetails.name}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerDetails.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={registerDetails.username}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={registerDetails.password}
                onChange={handleRegisterChange}
                minLength="8"
                required
              />
            </div>
            <button type="submit">Register</button>
          </form>
          <p onClick={handleFlip} className="toggle-form">
            Already have an account? Login here.
          </p>
        </div>
      </CardFlip>

      <div className="alert-container">
        {alertMessages.map((message, index) => (
          <div key={index} className="alert">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;
