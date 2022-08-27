import React, { useContext, useEffect, useState } from "react";
import Lottie from "lottie-react-web";
import Icon from "@material-ui/core/Icon";
import { Link, useLocation } from "react-router-dom";

import homeIcon from "../../../../assets/images/icons/home.svg";
import liveIcon from "../../../../assets/images/icons/live.svg";
import doubtIcon from "../../../../assets/images/icons/doubt.svg";
import blazeIcon from "../../../../assets/images/icons/flash.svg";
import newsfeedIcon from "../../../../assets/images/icons/newspaper.svg";
import glowIndicator from "../../../../assets/lottie/glow_indicator.json";
import homeIconSelected from "../../../../assets/images/icons/home_selected.svg";
import liveIconSelected from "../../../../assets/images/icons/live_selected.svg";
import homeIconSelected2 from "../../../../assets/images/icons/home_selected2.svg";
import doubtIconSelected from "../../../../assets/images/icons/doubt_selected.svg";
import liveIconSelected2 from "../../../../assets/images/icons/live_selected2.svg";
import doubtIconSelected2 from "../../../../assets/images/icons/doubt_selected2.svg";
import newsfeedIconSelected from "../../../../assets/images/icons/newspaper_selected.svg";
import newsfeedIconSelected2 from "../../../../assets/images/icons/newspaper_selected2.svg";
import {
  SidebarContext,
  UserContext,
  ThemeContext,
  IntroContext,
} from "../../../../context";
import "./style.scss";

export default function MobileMenuItems({
  setMenuItem,
  selectedMenuItem,
  blazeNewMsg,
}) {
  const [isDark] = useContext(ThemeContext).theme;

  const [, setSortBy] = useContext(SidebarContext).sortBy;
  const [, setTopLevel] = useContext(SidebarContext).topLevel;
  const [, setIsAnswered] = useContext(SidebarContext).isAnswered;
  const [, setSortByDBString] = useContext(SidebarContext).sortByDBString;
  const [, setSelectedSubject] = useContext(SidebarContext).selectedSubject;
  const [, setSelectedChapter] = useContext(SidebarContext).selectedChapter;

  const [, setAnchor] = useContext(IntroContext).anchor;

  const [hasSessions] = useContext(UserContext).hasSessions;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [unreadAnswerCount] = useContext(UserContext).unreadAnswerCount;

  const [bounce, setBounce] = useContext(UserContext).bounceBlazeIcon;

  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath.includes("/blaze")) {
      setMenuItem("blaze");
    } else if (currentPath.includes("/classes")) {
      setMenuItem("videos");
    } else if (currentPath.includes("/doubt")) {
      setMenuItem("doubts");
    } else if (currentPath === "/newsfeed") {
      setMenuItem("news");
    } else if (currentPath === "/") {
      setMenuItem("homepage");
    }
  }, [location]);

  const getClassName = (name) =>
    selectedMenuItem === name
      ? isDark
        ? `navbar-item active ${name} navbar-item-dark`
        : `navbar-item ${name} active`
      : isDark
      ? "navbar-item navbar-item-dark"
      : "navbar-item";

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  return (
    <div className="header__middle__sm">
      <div className="left__menu">
        <Link
          to="/"
          onClick={(e) => {
            setMenuItem("homepage");
            handleClick(e);
            navigator && navigator.vibrate && navigator.vibrate(5);
          }}
          className={getClassName("homepage")}
          style={{ textDecoration: "inherit" }}
          id="homeIntro"
        >
          <div className="nav__box__wrapper">
            <Icon className="nav__icon">
              <img
                className="nav__icon__img"
                src={
                  selectedMenuItem === "homepage"
                    ? isDark
                      ? homeIconSelected2
                      : homeIconSelected
                    : homeIcon
                }
                alt="Home Icon"
              />
            </Icon>
            <p
              style={{
                color:
                  selectedMenuItem === "homepage" &&
                  (isDark ? "#39d9f9" : "#4C72FA"),
              }}
            >
              Home
            </p>
          </div>
        </Link>
      </div>
      <div className="middle__menu">
        <svg
          width={115}
          height={76}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#a)">
            <path
              d="M104.5 12.845V19L57 66 10 19v-5.065c0-1.723 2.033-2.64 3.324-1.5l43.351 38.288a4 4 0 0 0 5.483-.177l38.924-39.112c1.259-1.264 3.418-.373 3.418 1.41Z"
              fill="#232323"
              fillOpacity={0.07}
            />
          </g>
          <path
            d="M109 16.603V71H6V16.603c0-1.781 2.154-2.674 3.414-1.414L50.43 56.204c3.905 3.905 10.237 3.905 14.142 0l41.015-41.015c1.26-1.26 3.414-.367 3.414 1.414Z"
            fill="var(--color-navbar)"
          />
          <defs>
            <filter
              id="a"
              x={0}
              y={0.841}
              width={114.5}
              height={75.159}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur
                stdDeviation={5}
                result="effect1_foregroundBlur_126_19"
              />
            </filter>
          </defs>
        </svg>
        {/*<div className="left__fall" />*/}
        <Link
          to="/blaze"
          onClick={(e) => {
            setMenuItem("blaze");
            handleClick(e);
            navigator && navigator.vibrate && navigator.vibrate(5);
            setBounce(true);
            setTimeout(() => setBounce(false), 150);
          }}
          className={
            isDark
              ? "navbar-item navbar-item-dark diamond"
              : "navbar-item diamond"
          }
          style={{
            textDecoration: "inherit",
            // animation:
            //   location.pathname.includes("/blaze") &&
            //   bounce &&
            //   "bounce 0.15s ease both",
          }}
          id="blazeIntro"
        >
          <div className="nav__box__wrapper diamond__blaze">
            <Icon className="nav__icon">
              {blazeNewMsg && (
                <div className="has__sessions">
                  <div class="red__wrapper">
                    <div className="dot__red count blaze" />
                  </div>
                </div>
              )}
              <img
                className="nav__icon__img"
                src={blazeIcon}
                alt="Blaze Icon"
              />
            </Icon>
          </div>
        </Link>
        {/*<div className="blaze__waterfall" />*/}
        {/*<div className="blaze__waterfall border" />*/}
        {/*<div className="blaze__bg__blur" />*/}
        {/*<div className="right__fall" />*/}
      </div>

      <div className="right__menu">
        <Link
          to="/classes"
          style={{ textDecoration: "inherit" }}
          className={getClassName("videos")}
          onClick={(e) => {
            setMenuItem("videos");
            handleClick(e);
            navigator && navigator.vibrate && navigator.vibrate(5);
          }}
          id="classesIntro"
        >
          <div className="nav__box__wrapper">
            <Icon className="nav__icon">
              {hasSessions && (
                <div className="has__sessions">
                  <div class="red__wrapper">
                    <div className="dot__red" />
                    <div className="red__bg">
                      <Lottie
                        options={{ animationData: glowIndicator, loop: true }}
                        speed={1.5}
                      />
                    </div>
                  </div>
                </div>
              )}
              <img
                className="nav__icon__img"
                src={
                  selectedMenuItem === "videos"
                    ? isDark
                      ? liveIconSelected2
                      : liveIconSelected
                    : liveIcon
                }
                alt="Live Icon"
              />
            </Icon>
            <p
              style={{
                color:
                  selectedMenuItem === "videos" &&
                  (isDark ? "#ff512f" : "#dd2476"),
              }}
            >
              Classes
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}


// <Link
//   to="/doubts"
//   onClick={(e) => {
//     navigator && navigator.vibrate && navigator.vibrate(5);
//     setMenuItem("doubts");
//     handleClick(e);
//     setSortBy("Recommended");
//     setSortByDBString("recommendation_score");
//     setTopLevel("General");
//     setSelectedSubject("General");
//     setSelectedChapter(null);
//     setIsAnswered(isInstructor ? false : true);
//   }}
//   className={getClassName("doubts")}
//   style={{ textDecoration: "inherit" }}
//   id="doubtIntro"
// >
//   <div className="nav__box__wrapper">
//     <Icon className="nav__icon">
//       {unreadAnswerCount > 0 && (
//         <div className="has__sessions">
//           <div class="red__wrapper">
//             <div className="dot__red count" />
//           </div>
//         </div>
//       )}
//       <img
//         className="nav__icon__img"
//         src={
//           selectedMenuItem === "doubts"
//             ? isDark
//               ? doubtIconSelected2
//               : doubtIconSelected
//             : doubtIcon
//         }
//         alt="Doubt Icon"
//       />
//     </Icon>
//     <p
//       style={{
//         color:
//           selectedMenuItem === "doubts" &&
//           (isDark ? "#9ce85e" : "#1FBFFF"),
//       }}
//     >
//       Doubts
//     </p>
//   </div>
// </Link>
// <Link
//   to="/newsfeed"
//   onClick={(e) => {
//     setMenuItem("news");
//     handleClick(e);
//     navigator && navigator.vibrate && navigator.vibrate(5);
//   }}
//   className={getClassName("news")}
//   style={{ textDecoration: "inherit" }}
//   id="newsIntro"
// >
//   <div className="nav__box__wrapper">
//     <Icon className="nav__icon">
//       <img
//         className="nav__icon__img"
//         src={
//           selectedMenuItem === "news"
//             ? isDark
//               ? newsfeedIconSelected2
//               : newsfeedIconSelected
//             : newsfeedIcon
//         }
//         alt="News Feed Icon"
//       />
//     </Icon>
//     <p
//       style={{
//         color:
//           selectedMenuItem === "news" &&
//           (isDark ? "#b06ab3" : "#662D8C"),
//       }}
//     >
//       News
//     </p>
//   </div>
// </Link>
