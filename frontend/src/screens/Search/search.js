import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/header";
import "./search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [loading, setLoading] = useState(true);

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
                    <img
                      src={user.profilePicture || "path/to/default-profile.png"}
                      alt={user.username}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <p className="user-name">{user.name}</p>
                      <p className="user-username">@{user.username}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="post-list">
                {searchResults.map((post) => (
                  <li key={post._id} className="post-item">
                    <p className="post-body">{post.body}</p>
                    <p className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
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
