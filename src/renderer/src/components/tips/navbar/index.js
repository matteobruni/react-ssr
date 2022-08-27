import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import { UserContext } from "./../../../context";
import { logoDark, proLogoDark } from "../../../assets";
import "./style.scss";

export default function TipsNavbar({ title }) {
  const [isUserProTier] = useContext(UserContext).tier;

  return (
    <div className="classroom__navbar">
      <Link to="/">
        <div className="classroom__logo">
          <img
            className="header__leftImage"
            src={isUserProTier ? proLogoDark : logoDark}
            alt={isUserProTier ? "PuStack Pro" : "PuStack"}
          />
        </div>
      </Link>

      {title && (
        <>
          <div className="separator">|</div>
          <div className="classroom__chapter__name">{title}</div>
        </>
      )}
    </div>
  );
}
