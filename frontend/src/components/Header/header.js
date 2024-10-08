import React, {useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUserFriends, FaEnvelope, FaBell } from 'react-icons/fa';
import axios from 'axios';
import './header.css';
import { FaConnectdevelop } from 'react-icons/fa';

const Header = () => {
    const navigate = useNavigate();
    const [username, setUserName] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
          try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
              'http://localhost:5000/me',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.status === 200) {
              setUserName(response.data.username);
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

    const handleSignOut = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, {
                withCredentials: true
            });
            // Clear the token and username from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/login');
        } catch (error) {
            console.error('Error during sign out:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <FaConnectdevelop alt="m-Connect" className="logo" />
                <h1 className="app-name">m-Connect</h1>
            </div>
            <nav className="header-center">
                <Link to={`/home/${username}`} className="nav-link">
                    <FaHome className="nav-icon" />
                    <span>Home</span>
                </Link>
                <Link to="/network" className="nav-link">
                    <FaUserFriends className="nav-icon" />
                    <span>Network</span>
                </Link>
                <Link to="/messages" className="nav-link">
                    <FaEnvelope className="nav-icon" />
                    <span>Messaging</span>
                </Link>
                <Link to="/notifications" className="nav-link">
                    <FaBell className="nav-icon" />
                    <span>Notifications</span>
                </Link>
            </nav>
            <div className="header-right">
                <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
            </div>
        </header>
    );
};

export default Header;
