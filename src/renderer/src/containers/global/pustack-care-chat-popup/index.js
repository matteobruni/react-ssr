import React from "react";
import { Link } from "react-router-dom";
import circularIcon from "../../../assets/images/favicon-circle.png";
import "./style.scss";

const PuStackCareChatPopup = () => {
  return (
    <div className="care-popup-bubble">
      <div className="care-popup-wrapper">
        <h6 className="notification-dot" />
        <Link to="/care">
          <img src={circularIcon} alt="pustack notification" />
        </Link>
      </div>
    </div>
  );
};

export default PuStackCareChatPopup;
