import React, { useContext } from "react";
import { ThemeContext } from "../../../context";
import "./style.scss";

export default function CategoryTile({ label, imgAsset, isSelected }) {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div
      className={isSelected ? "categoryTile selected" : "categoryTile"}
      style={{
        backgroundColor: isSelected
          ? isDark
            ? "rgba(255,255,255,0.2)"
            : "#eedfdf"
          : "",
      }}
    >
      <img
        src={imgAsset}
        style={{ height: "40px", width: "40px" }}
        alt={label}
      />
      <p
        style={{
          marginTop: "12px",
          fontSize: "14px",
          fontWeight: isSelected ? "600" : "500",
        }}
      >
        {label}
      </p>
    </div>
  );
}
