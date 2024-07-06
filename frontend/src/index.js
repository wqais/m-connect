import React from "react";
import "./index.css"
import ReactDOM from "react-dom/client";
import Login from "./screens/SignIn/login";
import Home from "./screens/Home/home";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Search from "./screens/Search/search";
import Network from "./screens/Network/network";
import Profile from "./screens/Profile/profile";
import { setCssVariables } from './theme/colors';
setCssVariables();  // Set CSS variables
// import Header from "./components/Header/header";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/network" element={<Network />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home/:username" element={<Home/>}/>
        <Route path="/search" element={<Search />} />
      </>
    )
  );
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
      {/* <Header /> */}
      <App />
    </React.StrictMode>
);
