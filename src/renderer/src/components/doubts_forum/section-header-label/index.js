import React from "react";
import "./style.scss";

export default function SectionHeaderLabel({ label, isDark }) {
  return (
    <div className="sectionHeader">
      <p
        className="sectionHeader__label"
        style={{ color: isDark ? "#ffffff" : "#050505" }}
      >
        {label}
      </p>
    </div>
  );
}
