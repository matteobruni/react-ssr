import React from "react";
import "./style.scss";
import { Link } from "react-router-dom";

export default function FilterOption({
  imgSrc,
  label,
  selectedFilterOption,
  onClick,
  delay,
}) {
  return label === "All" || label === "Bookmarked" ? (
    <Link
      to={"/newsfeed"}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <div
        className={
          selectedFilterOption === label
            ? "filterOption filterOptionSelected fadeIn"
            : "filterOption filterOptionHover fadeIn"
        }
        onClick={onClick}
        style={{ animationDelay: `${0.1 * delay}s` }}
      >
        <div
          className={
            selectedFilterOption === label
              ? "filterOption_icon filterOption_iconSelected"
              : "filterOption_icon"
          }
        >
          <img src={imgSrc} style={{ height: 20, width: 20 }}></img>
        </div>
        <div className="filterOption_content">
          <p>{label}</p>
        </div>
      </div>
    </Link>
  ) : (
    <Link
      to={"/newsfeed"}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <div
        className={
          selectedFilterOption === label
            ? "filterOption filterOptionSelected fadeIn"
            : "filterOption filterOptionHover fadeIn"
        }
        onClick={onClick}
        style={{ animationDelay: `${0.1 * delay}s` }}
      >
        <div
          className={
            selectedFilterOption === label
              ? "filterOption_icon filterOption_iconSelected"
              : "filterOption_icon"
          }
        >
          <img src={imgSrc} style={{ height: 20, width: 20 }}></img>
        </div>
        <div className="filterOption_content">
          <p>{label}</p>
        </div>
      </div>
    </Link>
  );
}
