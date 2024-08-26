import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaUser, FaCheck, FaTimes, FaUserPlus } from "react-icons/fa";
import "./network.css";
import Header from "../../components/Header/header";
import { useNavigate } from "react-router-dom";

const Network = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch incoming requests on component mount
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/connections",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setConnections(response.data);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchRequests();
    fetchConnections();
  }, []);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/search/people?term=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching for people:", error);
    }
  };

  const handleRequestAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/requests/${id}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(requests.filter((request) => request._id !== id));
      if (action === "reject") {
        alert("Request rejected");
      } else {
        alert("Connection request accepted!");
      }
    } catch (error) {
      console.error(`Error ${action} request:`, error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/connect",
        { receiver: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Connection request sent");
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };

  const handleCardClick = (username) => {
    navigate(`/view/${username}`);
  };

  return (
    <div>
      <Header />
      <div className="network-container">
        <div className="search-container-network">
          <div className="search-box-container">
            <input
              type="text"
              placeholder="Search for people"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-box-network"
            />
            <button onClick={handleSearch} className="search-button">
              <FaSearch />
            </button>
          </div>
          <div className="search-results">
            {searchResults.map((user) => (
              <div key={user._id} className="user-card">
                <FaUser className="post-profile-icon" />
                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p>@{user.username}</p>
                  <p>{user.summary}</p>
                </div>
                <button
                  onClick={() => handleSendRequest(user._id)}
                  className="send-request-button"
                >
                  <FaUserPlus />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="requests-container">
          <h3 className="requests-heading">Pending Requests</h3>
          {requests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="request-card">
                <FaUser className="post-profile-icon" />
                <div className="request-details">
                  <h3>{request.sender.name}</h3>
                  <p>@{request.sender.username}</p>
                  <p>{request.sender.summary}</p>
                  <p>
                    Received on:{" "}
                    {new Date(request.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleRequestAction(request._id, "accept")}
                    className="accept-button"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleRequestAction(request._id, "reject")}
                    className="reject-button"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="connections-container">
          <h3 className="connections-heading">Your Connections</h3>
          {connections.length === 0 ? (
            <p>No connections yet</p>
          ) : (
            connections.map((connection) => (
              <div
                key={connection._id}
                className="connection-card"
                onClick={() => handleCardClick(connection.username)}
              >
                <FaUser className="post-profile-icon" />
                <div className="connection-details">
                  <div className="connection-header">
                    <h3>{connection.name}</h3>
                  </div>
                  <p className="username">@{connection.username}</p>
                  <p>{connection.summary}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;
