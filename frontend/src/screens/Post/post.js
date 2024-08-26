import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaTrash, FaUser } from "react-icons/fa";
import Header from "../../components/Header/header";
import "./post.css";

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/posts/${id}`
        );
        if (response.status === 200) {
          setPost(response.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchPost();
    fetchCurrentUser();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setPost(response.data);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/comments`,
        { body: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setNewComment("");
        setPost(response.data);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/posts/${id}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setPost(response.data);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const username = currentUser.username;
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:5000/post/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log(response.data.message);
        navigate(`/home/${username}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="post-container">
        <div className="post-body">
          <div className="post-header">
            <FaUser className="post-profile-icon" />
            <h1>{post.authorName}</h1>
            {currentUser && currentUser.username === post.authorName && (
              <button className="delete-post-button" onClick={handleDeletePost}>
                <FaTrash /> Delete Post
              </button>
            )}
          </div>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.body }}
          ></div>
          <div className="post-actions">
            <button className="post-like-button" onClick={handleLike}>
              <FaHeart />
            </button>
            <span className="like-count">{post.likes.length}</span>
          </div>
        </div>
        <div className="comment-section">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            className="comment-input"
          />
          <button className="comment-button" onClick={handleAddComment}>
            +
          </button>
        </div>
        <div className="comments-list">
          <h3 className="all-comments">All Comments</h3>
          {post.comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-content">
                <span
                  className="comment-author"
                  onClick={() => navigate(`/view/${comment.authorName}`)}
                >
                  @{comment.authorName}
                </span>

                <p className="comment-body">{comment.body}</p>
              </div>
              {currentUser &&
                (currentUser.username === comment.authorName ||
                  currentUser.username === post.authorName) && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <FaTrash />
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Post;
