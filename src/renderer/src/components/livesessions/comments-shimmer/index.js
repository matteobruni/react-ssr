import React, { useContext } from "react";
import ContentLoader from "react-content-loader";
import { ThemeContext } from "../../../context";
import {useMediaQuery} from "react-responsive";

export default function CommentsShimmer() {
  const [isDark] = useContext(ThemeContext).theme;
  const isMobileScreen = useMediaQuery({ query: "(max-width: 500px)" });

  return (
    <ContentLoader
      className="live__comment__shimmer"
      width={"100%"}
      height={172}
      backgroundColor={isDark || isMobileScreen ? "#282828" : "#f5f5f5"}
      foregroundColor={isDark || isMobileScreen ? "#343434" : "#dbdbdb"}
    >
      <rect x="72" y="50" rx="3" ry="3" width="80%" height="24" />
      <circle cx="48" cy="63" r="16" />
      <rect x="72" y="100" rx="3" ry="3" width="80%" height="24" />
      <circle cx="48" cy="113" r="16" />
    </ContentLoader>
  );
}
