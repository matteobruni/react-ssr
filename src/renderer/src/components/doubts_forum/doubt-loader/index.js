import React, { useContext } from "react";
import ContentLoader from "react-content-loader";
import { ThemeContext } from "../../../context";
import "./style.scss";

function DoubtLoader(props) {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div className="doubt__loader">
      <ContentLoader
        speed={2}
        backgroundColor={isDark ? "#282828" : "#f3f3f3"}
        foregroundColor={isDark ? "#343434" : "#ecebeb"}
        {...props}
      >
        <rect x="83" y="83" rx="0" ry="0" width="88" height="6" />
        <rect x="83" y="69" rx="0" ry="0" width="52" height="6" />
        <rect x="20" y="25" rx="0" ry="0" width="410" height="6" />
        <rect x="20" y="42" rx="0" ry="0" width="237" height="6" />
        <circle cx="37" cy="80" r="20" />
      </ContentLoader>
    </div>
  );
}

export default DoubtLoader;
