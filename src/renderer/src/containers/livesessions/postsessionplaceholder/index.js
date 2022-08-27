import React from "react";
import placeholder from "../../../assets/images/pustack_live_white_logo.png";
import "./style.scss";

export default function PostSessionPlaceHolder({ isCoolDownPeriod }) {
  return (
    <div className="postsession__placeholder">
      <img src={placeholder} alt="PuStack Logo" className="placeholder__logo" />
      <div className="placeholder__content">
        {isCoolDownPeriod ? (
          <>
            <h2>Live Session has ended</h2>
            <h2>Video will be available soon</h2>
          </>
        ) : (
          <h2>Live Session has ended</h2>
        )}
      </div>
    </div>
  );
}
