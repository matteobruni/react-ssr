import React from "react";
import "./style.scss";

function Snackbar({ label }) {
  return (
    <div
      id="snackbar"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <i id="snackbar__icon" aria-hidden="true" />
      <div>
        <h4 id="snackbar__heading"/>
        <p id="snackbar__label">{label}</p>
      </div>
    </div>
  );
}

export default Snackbar;
