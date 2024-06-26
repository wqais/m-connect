// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const token = Cookies.get('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
