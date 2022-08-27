import React, { useContext } from "react";
import ContentLoader from "react-content-loader";
import { ThemeContext } from "../../../context";

const CommentLoader = (props) => {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div className="commentLoader">
      <ContentLoader
        speed={2}
        width={400}
        height={100}
        viewBox="0 0 400 100"
        backgroundColor={isDark ? "#282828" : "#f3f3f3"}
        foregroundColor={isDark ? "#343434" : "#ecebeb"}
        {...props}
      >
        <circle cx="20" cy="31" r="17" />
        <rect x="45" y="18" rx="18" ry="18" width="219" height="47" />
      </ContentLoader>
    </div>
  );
};

export default CommentLoader;
