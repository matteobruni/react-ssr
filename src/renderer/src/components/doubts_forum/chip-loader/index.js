import React, { useContext } from "react";
import ContentLoader from "react-content-loader";
import { ThemeContext } from "../../../context";

const ChipLoader = ({width, height, ...props}) => {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <ContentLoader
      speed={2}
      width={width || 120}
      height={height || 40}
      viewBox="0 0 120 50"
      backgroundColor={props.isDark || isDark ? "#282828" : "#f3f3f3"}
      foregroundColor={props.isDark || isDark ? "#343434" : "#ecebeb"}
      {...props}
    >
      <rect x="2" y="6" rx="24" ry="24" width="112" height="37" />
      <rect x="159" y="5" rx="24" ry="24" width="119" height="41" />
      <rect x="3" y="60" rx="24" ry="24" width="107" height="41" />
      <rect x="126" y="59" rx="24" ry="24" width="119" height="41" />
    </ContentLoader>
  );
};
export default ChipLoader;
