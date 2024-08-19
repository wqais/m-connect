import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/header";
import "./viewProfile.css";

const ViewProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/view/${username}`);
        if (response.status === 200) {
          setUser(response.data.user);
          setPosts(response.data.posts);
        } else {
          console.error("Error fetching profile data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [username]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="profile-container">
        <div className="user-info">
          <img src={user.avatar || "path/to/default-avatar.png"} alt="Avatar" className="user-avatar" />
          <div className="user-details">
            <h1>{user.name}</h1>
            <p>@{user.username}</p>
            <p>{user.email}</p>
            <p>{user.summary}</p>
          </div>
        </div>

        <div className="user-posts">
          <h2>Posts by {user.name}</h2>
          {posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post-item">
                <div className="post-content" dangerouslySetInnerHTML={{ __html: post.body }}></div>
                <p className="post-date">{new Date(post.timestamp).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
