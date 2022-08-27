import React from "react";

const TwoImagesGrid = ({ body }) => {
  return (
    <div className="image-post-grid">
      <img
        src={body[0]}
        alt="Pustack Newsfeed"
        style={{ height: "100%", objectFit: "cover" }}
      />
      <div className="images-column single">
        <img src={body[1]} alt="Pustack Newsfeed" draggable={false} />
      </div>
    </div>
  );
};

export default TwoImagesGrid;
