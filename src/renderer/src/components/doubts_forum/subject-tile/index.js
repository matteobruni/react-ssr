import React from "react";
import { usePalette } from "react-palette";
import "./style.scss";

export default function SubjectTile({ label, image, isSelected }) {
  const { data } = usePalette(image);

  return (
    <div className={isSelected ? "subjectTile selectedTile" : "subjectTile"}>
      <div>
        <div
          className="subjectTile__headerColor"
          style={{ backgroundColor: `${data.lightMuted}` }}
        >
          <img src={image} className="subjectTile__logo" alt="sub__logo" />
        </div>
      </div>
      <div className="subjectTile__labelContainer">
        <p className="subjectTile__label">
          {label.length > 35 ? label.substring(0, 33) + "..." : label}
        </p>
        <h6>Learn</h6>
      </div>
    </div>
  );
}
