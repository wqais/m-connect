// src/components/Home.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/header";
import { FaSearch, FaUser } from "react-icons/fa";
import { Editor } from "@tinymce/tinymce-react";
import "./home.css"; // Import the CSS file for custom styles

const Home = () => {
  const { username } = useParams();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("People");
  const [user, setUser] = useState(null);
  const [postBody, setPostBody] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/home/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setMessage(response.data.message);
          setUser(response.data.user);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        if (error.response && error.response.data) {
          console.error(error.response.data.message);
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [username]);

  const handlePostSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/posts",
        { body: postBody },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setPostBody("");
        navigate(`/post/${response.data.post._id}`);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error(error.response.data.message);
      } else {
        console.error("Error submitting post:", error);
      }
    }
  };

  const handleEditorChange = (content, editor) => {
    setPostBody(content);
  };

  const handleSearch = () => {
    navigate(`/search?term=${searchTerm}&category=${searchCategory}`);
  };

  return (
    <div>
      <Header />
      <div className="home-container">
        <div
          className="search-container"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <input
            type="text"
            placeholder="Search for people or posts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="search-dropdown"
          >
            <option value="People">People</option>
            <option value="Posts">Posts</option>
          </select>
          <button onClick={handleSearch} className="search-button">
            <FaSearch />
          </button>
        </div>
        <div className="home-content">
          <div className="home-content">
            <div className="profile-section">
              <div className="user-profile">
                <div className="avatar-container">
                  {user && user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="avatar" />
                  ) : (
                    <FaUser className="profile-icon" />
                  )}
                  <div className="user-block-info">
                    <h2>{user?.name}</h2>
                    <p>@{user?.username}</p>
                  </div>
                </div>
              </div>
              <div className="profile-details">
                <button
                  onClick={() => navigate("/profile")}
                  className="edit-profile-button"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate(`/posts/${user?.username}`)}
                  className="view-posts-button"
                >
                  View Your Posts
                </button>
              </div>
            </div>
          </div>
          <div className="post-section">
            <h2>Make a Post</h2>
            <Editor
              apiKey="1m9gglpbnyxxpsj9b2roi7pjrlhnycpmaqs7k84jfoycewsz"
              init={{
                plugins: "",
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                tinycomments_mode: "embedded",
                mergetags_list: [
                  { value: "First.Name", title: "First Name" },
                  { value: "Email", title: "Email" },
                ],
                height: "200px",
              }}
              initialValue="Start typing..."
              onEditorChange={handleEditorChange}
            />
            <button onClick={handlePostSubmit} className="post-button">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
