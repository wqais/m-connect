import React from "react";
import "./middleware.css";

const Middleware = () => {
  const blocks = [
    {
      id: 1,
      name: "John Doe",
      picture: "https://example.com/john-doe.jpg",
    },
    {
      id: 2,
      name: "Jane Smith",
      picture: "https://example.com/jane-smith.jpg",
    },
  ];

  return (
    <div className="linkedin-page">
      <header className="header">
        <h1>LinkedIn-like Page</h1>
      </header>
      <main className="main-content">
        {blocks.map((block) => (
          <div key={block.id} className="block">
            <img
              src={block.picture}
              alt={block.name}
              className="profile-picture"
            />
            <h2 className="name">{block.name}</h2>
            <p className="prompt">Where to go?</p>
            <button className="go-button">Go</button>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Middleware;
