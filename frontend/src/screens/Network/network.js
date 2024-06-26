import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './network.css';
import Header from '../../components/Header/header';

const Network = () => {
    const [profile, setProfile] = useState({ connections: 0 });
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = Cookies.get('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch user profile
                const profileResponse = await axios.get('http://localhost:5000/api/profile', { headers });
                setProfile(profileResponse.data);

                // Fetch pending requests
                const requestsResponse = await axios.get('http://localhost:5000/api/network', { headers });
                setPendingRequests(requestsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setAlertMessage('An error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRequest = async (id, action) => {
        try {
            const token = Cookies.get('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await axios.post(`http://localhost:5000/api/network/${action}`, { id }, { headers });
            setPendingRequests(pendingRequests.filter(request => request._id !== id));
            setAlertMessage(`Request ${action === 'accept' ? 'accepted' : 'denied'} successfully.`);
        } catch (error) {
            console.error('Error handling request:', error);
            setAlertMessage(`An error occurred while ${action === 'accept' ? 'accepting' : 'denying'} the request.`);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Header />
        <div className="network-container">
            {alertMessage && <div className="alert">{alertMessage}</div>}
            <div className="profile">
                <h2>User Profile</h2>
                <p>Connections: {profile.connections}</p>
            </div>
            <div className="pending-requests">
                <h2>Pending Requests</h2>
                {pendingRequests.length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    pendingRequests.map(request => (
                        <div key={request._id} className="request-card">
                            <h3>{request.sender.name}</h3>
                            <p>{request.sender.summary}</p>
                            <button onClick={() => handleRequest(request._id, 'accept')}>Connect</button>
                            <button onClick={() => handleRequest(request._id, 'deny')}>Deny</button>
                            <p className="timestamp">Received: {new Date(request.timestamp).toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
        </div>
    );
};

export default Network;
