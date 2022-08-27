import React from "react";
import ContentLoader from "react-content-loader";

const CircleLoader = (props, { height, width }) => (
  <ContentLoader
    speed={3}
    width={width}
    height={height}
    viewBox="0 0 40 40"
    backgroundColor="#ffffff"
    foregroundColor="#ecebeb"
    {...props}
  >
    <circle cx="19" cy="20" r="13" />
  </ContentLoader>
);

export default CircleLoader;
