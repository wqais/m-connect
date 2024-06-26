import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./profile.css";
import Header from "../../components/Header/header";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profession: "",
    company: "",
    degree: "",
    yearOfPassing: "",
  });

  useEffect(() => {
    // Fetch the user's profile details from the server
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/profile", profile);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="profile-container">
        <div className="profile-main">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Profession:</label>
              <input
                type="text"
                name="profession"
                value={profile.profession}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                name="company"
                value={profile.company}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Highest Qualification Degree:</label>
              <input
                type="text"
                name="degree"
                value={profile.degree}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Year of Passing:</label>
              <input
                type="text"
                name="yearOfPassing"
                value={profile.yearOfPassing}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </form>
        </div>
        <div className="profile-sidebar">
          <Link to="/profile/workex">+Add Work Experience</Link>
          <Link to="/profile/password">Edit Password</Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
