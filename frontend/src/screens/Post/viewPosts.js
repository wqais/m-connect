import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/header";
import "./viewPosts.css";

const ViewPosts = () => {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/posts/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setPosts(response.data.results);
        } else {
          console.error("Error fetching posts:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [username]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div>
      <Header />
      <div className="view-posts-container">
        <h3 className="view-posts-heading">Your Posts</h3>
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <ul className="user-post-list">
            {posts.map((post) => (
              <li
                key={post._id}
                className="post-item"
                onClick={() => handlePostClick(post._id)}
              >
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: post.body }}
                />
                <p className="post-date">
                  {new Date(post.timestamp).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewPosts;
