import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import Header from "../../components/Header/header";
import "./search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      const term = searchParams.get("term");
      const category = searchParams.get("category");
      setSearchCategory(category);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/search`, {
          params: { term, category },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setSearchResults(response.data.results);
        } else {
          console.error(
            "Error fetching search results:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div>
      <Header />
      <div className="search-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="search-results">
            <h1 className="search-heading">Your Search Results</h1>
            {searchCategory === "People" ? (
              <ul className="user-list">
                {searchResults.map((user) => (
                  <li key={user._id} className="user-item">
                    <FaUser className="search-profile-icon"/>
                    <div className="user-info">
                      <p
                        className="user-name"
                        onClick={() => navigate(`/view/${user.username}`)}
                      >
                        {user.name}
                      </p>
                      <p
                        className="user-username"
                        onClick={() => navigate(`/view/${user.username}`)}
                      >
                        @{user.username}
                      </p>
                      <p className="user-summary">
                        {user.summary || "No summary available"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="post-list">
                {searchResults.map((post) => (
                  <li
                    key={post._id}
                    className="post-item"
                    onClick={() => handlePostClick(post._id)}
                  >
                    <div
                      className="post-content"
                      dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                    <p className="search-post-date">
                      {new Date(post.timestamp).toLocaleDateString() ||
                        "Invalid Date"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
