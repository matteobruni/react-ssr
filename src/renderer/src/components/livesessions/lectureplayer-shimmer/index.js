import React, { useContext, useEffect } from "react";
import ContentLoader from "react-content-loader";
import { useMediaQuery } from "react-responsive";
import { ThemeContext } from "../../../context";

export default function LecturePlayerShimmer() {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const [isDarkMode] = useContext(ThemeContext).theme;

  
  return (
    <>
      {isSmallScreen && (
        <ContentLoader
          height={235}
          width={"100%"}
          backgroundColor={"#282828"}
          foregroundColor={"#343434"}
        >
          <rect x="0" y="0" rx="0" ry="0" width="100%" height="190" />
          <rect x="8" y="209" rx="2" ry="2" width="140" height="15" />
          <rect x="8" y="234" rx="2" ry="2" width="275" height="15" />
        </ContentLoader>
      )}
      {!isSmallScreen && (
        <ContentLoader
          height={"30vw"}
          width={"100%"}
          backgroundColor={isDarkMode ? "#282828" : "#f5f6f7"}
          foregroundColor={isDarkMode ? "#343434" : "#eeeeee"}
          id="live__loader"
        >
          <rect x="0" y="0" rx="0" ry="0" width="100%" height="528" />
          <rect x="8" y="547" rx="2" ry="2" width="140" height="15" />
          <rect x="8" y="571" rx="2" ry="2" width="275" height="15" />
        </ContentLoader>
      )}
    </>
  );
}
