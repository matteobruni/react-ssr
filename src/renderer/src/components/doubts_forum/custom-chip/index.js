import React, { useContext } from "react";
import { UserContext } from "../../../context";
import "./style.scss";

export default function CustomChip({
  label,
  isSelected,
  leading = null,
  isDark,
}) {
  const [unreadAnswerCount] = useContext(UserContext).unreadAnswerCount;

  return (
    <div>
      <div
        className={
          isSelected
            ? label === "General"
              ? isDark
                ? "customChip customChipDark filtered"
                : "customChip filtered"
              : isDark
              ? "customChip customChipDark selected"
              : "customChip selected"
            : isDark
            ? "customChip customChipDark"
            : "customChip"
        }
        style={{
          color: isSelected
            ? "#FFF"
            : isDark
            ? "rgba(255, 255, 255, 0.75)"
            : "rgb(39, 39, 39)",
        }}
      >
        {leading !== null && (
          <img
            className="leading__icon"
            src={leading}
            alt="Chip Icon"
            draggable={false}
          />
        )}
        {label}
        {label === "My Doubts" && unreadAnswerCount > 0 && (
          <p className="new__doubt"></p>
        )}
      </div>
    </div>
  );
}
