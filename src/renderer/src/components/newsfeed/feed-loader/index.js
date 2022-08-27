import React, { useContext } from "react";
import ContentLoader from "react-content-loader";
import { ThemeContext } from "../../../context";
import "./style.scss";

function FeedLoader(props) {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div className="newsfeed-post">
      <ContentLoader
        speed={2}
        viewBox="0 0 400 188"
        backgroundColor={isDark ? "#282828" : "#f5f5f5"}
        foregroundColor={isDark ? "#343434" : "#dbdbdb"}
        {...props}
      >
        <circle cx="31" cy="31" r="15" />
        <rect x="58" y="18" rx="2" ry="2" width="140" height="10" />
        <rect x="58" y="34" rx="2" ry="2" width="140" height="10" />
        <rect x="0" y="60" rx="2" ry="2" width="400" height="178" />
      </ContentLoader>
    </div>
  );
}

export { FeedLoader as default };
