import React from "react";
import ContentLoader from "react-content-loader";
import { ThemeContext } from "../../../context";

const CommentLoader = (props) => {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div className="comment">
      <ContentLoader
        speed={2}
        viewBox="0 0 320 54"
        // backgroundColor="#f3f3f3"
        // foregroundColor="#ecebeb"
        backgroundColor={isDark ? "#282828" : "#f3f3f3"}
        foregroundColor={isDark ? "#343434" : "#ecebeb"}
        {...props}
      >
        <circle cx="24" cy="20" r="12" />
        <rect x="46" y="14" rx="3" ry="3" width="180" height="8" />
        <rect x="46" y="24" rx="3" ry="3" width="40" height="6" />
        <rect x="17" y="38" rx="3" ry="3" width="280" height="14" />
      </ContentLoader>
    </div>
  );
};

export { CommentLoader as default };
