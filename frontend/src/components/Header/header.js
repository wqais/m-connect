// src/components/Header/header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUserFriends, FaEnvelope, FaBell } from 'react-icons/fa';
import axios from 'axios';
import './header.css';

const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, {
                withCredentials: true
            });
            // Clear the token from localStorage
            localStorage.removeItem('token');
            // Redirect to the login page
            navigate('/login');
        } catch (error) {
            console.error('Error during sign out:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <img src="path/to/temporary/logo.png" alt="App Logo" className="logo" />
                <h1 className="app-name">m-Connect</h1>
            </div>
            <nav className="header-center">
                <Link to="/home" className="nav-link">
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
