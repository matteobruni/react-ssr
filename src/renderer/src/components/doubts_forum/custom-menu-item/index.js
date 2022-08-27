import React from "react";
import { MenuItem } from "@material-ui/core";
import "./style.scss";

export default function CustomMenuItem({ isDark, label, icon, onClickMenuItem }) {
  return (
    <div className="customMenuItem">
      <MenuItem
        onClick={onClickMenuItem}
        style={{ color: label === "Report" ? "#891010" : isDark ? 'var(--color-text)' : "#050505" }}
      >
        <i className={`customMenuItem__icon ${icon}`}></i>
        <p className="customMenuItem__label">{label}</p>
      </MenuItem>
    </div>
  );
}
