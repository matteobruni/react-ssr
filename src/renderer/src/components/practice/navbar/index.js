import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

import { UserContext } from "./../../../context";
import { logoDark, proLogoDark } from "../../../assets";
import "./style.scss";

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: "rgba(0,0,0,0.65)",
    color: "rgba(255,255,255,1)",
    fontWeight: 400,
    fontSize: theme.typography.pxToRem(12.5),
    padding: ".35rem .75rem",
    borderRadius: "8px",
  },
}));

export default function PracticeNavbar({
  title,
  chapterID,
  examCompletionStatus,
}) {
  const [isUserProTier] = useContext(UserContext).tier;
  const [progressValue, setProgressValue] = useState(0);
  const [pathColor, setPathColor] = useState("white");
  const [trailColor, setTrailColor] = useState("rgba(255,255,255,0.25)");

  const tooltipClasses = useStylesBootstrap();

  useEffect(() => {
    const totalLectures = examCompletionStatus?.total_item_count;

    const completedLectures = examCompletionStatus?.completed_item_count;

    const value =
      completedLectures && totalLectures
        ? (completedLectures / totalLectures) * 100
        : 0;

    setProgressValue(value);

    if (value === 0) {
      setPathColor("white");
      setTrailColor("rgba(255, 255, 255, 0.25)");
    }
    if (value > 0 && value <= 90) {
      setPathColor("rgba(0, 255, 0, 1)");
      setTrailColor("rgba(0, 255, 0, 0.25)");
    }
    if (value > 90) {
      setPathColor("rgba(255, 215, 0, 1)");
      setTrailColor("rgba(255, 215, 0, 0.25)");
    }
  }, [chapterID, examCompletionStatus]);

  const progressBarStyles = buildStyles({
    rotation: 0,
    strokeLinecap: "round",
    textSize: "16px",
    pathTransitionDuration: 1.5,
    pathColor: pathColor,
    trailColor: trailColor,
    backgroundColor: "#3e98c7",
  });

  return (
    <div className="classroom__navbar">
      <Link to="/">
        <div className="classroom__logo">
          {isUserProTier ? (
            <img
              className="header__leftImage"
              src={proLogoDark}
              alt="PuStack Pro"
              draggable={false}
            />
          ) : (
            <img
              className="header__leftImage"
              src={logoDark}
              alt="PuStack"
              draggable={false}
            />
          )}
        </div>
      </Link>

      {title && (
        <>
          <div className="separator">|</div>
          <div className="classroom__chapter__name">{title}</div>{" "}
        </>
      )}

      <Tooltip
        title={`${Math.round(progressValue)}% completed`}
        classes={tooltipClasses}
        placement={"bottom"}
        enterTouchDelay={0}
      >
        <div className="classroom__progress">
          <CircularProgressbarWithChildren
            value={progressValue}
            styles={progressBarStyles}
            strokeWidth={7}
          >
            <i
              className={
                progressValue > 90
                  ? "fas fa-trophy cup__golden"
                  : "fas fa-trophy"
              }
              style={{ color: pathColor }}
            ></i>
          </CircularProgressbarWithChildren>
        </div>
      </Tooltip>
    </div>
  );
}
