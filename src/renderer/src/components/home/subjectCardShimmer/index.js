import React, { useContext } from "react";
import { ThemeContext } from "./../../../context";
import { logoDark2, logoLight2 } from "./../../../assets";

export default function SubjectCardShimmer() {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div className="cwc__card subject__shimmer" key={Math.random() * 100}>
      <div
        className="subject__thumbnail"
        style={{ backgroundColor: isDark ? "#282828" : "#e3e3e3" }}
      >
        <img
          src={isDark ? logoDark2 : logoLight2}
          alt={"Subject"}
          draggable={false}
        />

        <div className="subject__radial__overlay"></div>
        <div className="subject__overlay"></div>
      </div>
    </div>
  );
}
