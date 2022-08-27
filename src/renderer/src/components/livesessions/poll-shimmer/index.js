import React from "react";
import ContentLoader from "react-content-loader";
import "./style.scss";

export default function PollCardShimmer({ isDarkMode }) {
  return (
    <div className="poll__shimmer">
      <ContentLoader
        width={"100%"}
        height={280}
        backgroundColor={isDarkMode ? "#282828" : "#f5f5f5"}
        foregroundColor={isDarkMode ? "#343434" : "#dbdbdb"}
      >
        <rect x="0" y="0" width="100%" height="100" />

        <circle cx="18" cy="35" r="6" />
        <circle cx="55" cy="35" r="6" />
        <circle cx="90" cy="35" r="6" />
        <circle cx="130" cy="35" r="6" />

        <rect x="45" y="134" rx="6" ry="6" width="75%" height="10" />
        <rect x="45" y="171" rx="6" ry="6" width="75%" height="10" />
        <rect x="45" y="208" rx="6" ry="6" width="75%" height="10" />
        <rect x="45" y="245" rx="6" ry="6" width="75%" height="10" />
      </ContentLoader>
    </div>
  );
}
