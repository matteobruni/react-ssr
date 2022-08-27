import React from "react";

const ThreeImagesGrid = ({ body }) => {
  return (
    <div className="image-post-grid">
      <img
        src={body[0]}
        alt="Pustack Newsfeed"
        style={{ height: "100%", objectFit: "cover" }}
      />
      <div className="images-column">
        <img src={body[1]} alt="Pustack Newsfeed" draggable={false} />

        <img src={body[2]} alt="Pustack Newsfeed" draggable={false} />

        {body.length > 3 && (
          <div className="left-images">+{body.length - 3}</div>
        )}
      </div>
    </div>
  );
};

export default ThreeImagesGrid;
