import React, { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";
import Header from '../../components/Header/header'
import { Link } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/home", {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
    <div className="home-container">
      <div className="profile">
        <h2>{user.name}</h2>
        <Link to="/profile"><span>Edit Profile</span>
        </Link>
        {/* Placeholder for profile picture */}
        
      </div>
      <div className="posts">
        <h1>Posts</h1>
        {/* Display static posts */}
      </div>
      <div className="messages">
        <h1>Messages</h1>
        {/* Placeholder for messages */}
      </div>
    </div>
    </div>
  );
};

export default Home;
