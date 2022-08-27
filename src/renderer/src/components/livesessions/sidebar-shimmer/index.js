import React, { useContext, useEffect } from "react";
import ContentLoader from "react-content-loader";
import { useMediaQuery } from "react-responsive";
import "./style.scss";

import { ThemeContext } from "../../../context";

export default function SidebarShimmer({ showPlayer }) {
  const [isDark] = useContext(ThemeContext).theme;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 430px)" });

  useEffect(() => {
    if (!isSmallScreen) {
      showPlayer();
    }
  }, [isSmallScreen]);

  return (
    <div className="sidebar__shimmer__wrapper">
      <div className="shimmer__title">Live Classes</div>
      <ContentLoader
        width={isSmallScreen ? "100vw" : 344}
        height={"calc(100vh - 140px)"}
        backgroundColor={isDark ? "#282828" : "#f5f5f5"}
        foregroundColor={isDark ? "#343434" : "#dbdbdb"}
      >
        <rect x="15" y="35" rx="3" ry="3" width="38" height="55" />
        <rect x="70" y="35" rx="3" ry="3" width="38" height="55" />
        <rect x="125" y="35" rx="3" ry="3" width="38" height="55" />
        <rect x="180" y="35" rx="3" ry="3" width="38" height="55" />
        <rect x="235" y="35" rx="3" ry="3" width="38" height="55" />
        <rect x="290" y="35" rx="3" ry="3" width="38" height="55" />
        {isSmallScreen && (
          <rect x="345" y="35" rx="3" ry="3" width="38" height="55" />
        )}
        <rect
          x="12"
          y="119"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="184"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="249"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="314"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="379"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="444"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="509"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="574"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="639"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="704"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="769"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="834"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="899"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
        <rect
          x="12"
          y="964"
          rx="3"
          ry="3"
          width={isSmallScreen ? "94vw" : "320"}
          height="5"
        />
      </ContentLoader>
    </div>
  );
}
