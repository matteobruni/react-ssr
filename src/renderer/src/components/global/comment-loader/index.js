import React from "react";
import ContentLoader from "react-content-loader";
import "./style.scss";

const CommentLoader = (props) => (
  <div className="commentLoader">
    <ContentLoader
      speed={2}
      width={400}
      height={100}
      viewBox="0 0 400 100"
      backgroundColor="#ffffff"
      foregroundColor="#ecebeb"
      {...props}
    >
      <circle cx="20" cy="31" r="17" />
      <rect x="45" y="18" rx="18" ry="18" width="219" height="47" />
    </ContentLoader>
  </div>
);

export default CommentLoader;
