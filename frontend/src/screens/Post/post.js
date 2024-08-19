import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaTrash } from 'react-icons/fa';
import Header from '../../components/Header/header';
import "./post.css"

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        if (response.status === 200) {
          setPost(response.data);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
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
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem('token');
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
        setNewComment('');
        setPost(response.data);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
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
      console.error('Error deleting comment:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return ( 
    <>
      <Header />
      <div className="post-container">
        <div className="post-header">
          <img src={post.authorAvatar} alt="Avatar" />
          <h1>{post.authorName}</h1>
        </div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.body }}></div>
        <div className="post-actions">
          <button className="post-like-button" onClick={handleLike}>
            <FaHeart />
          </button>
          <span className="like-count">{post.likes.length}</span>
        </div>
        <div className="comment-section">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            className="comment-input"
          />
          <button className="comment-button" onClick={handleAddComment}>+</button>
        </div>
        <div className="comments-list">
          {post.comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <p>{comment.body}</p>
              <button className="delete-button" onClick={() => handleDeleteComment(comment._id)}>
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Post;
