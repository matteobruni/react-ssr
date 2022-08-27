import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { listenForLiveSessions } from "../../../database";
import { FloatingVideoPlayer } from "../../../components";
import { UserContext, LiveSessionContext } from "../../../context";

import "./style.scss";

export default function FloatingPlayerContainer() {
  const [videoID, setVideoID] = useState(null);
  const [sessionID, setSessionID] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasListener, setHasListener] = useState(false);
  const [dismissProcessing, setDismissProcessing] = useState(false);
  const [allowedAtLocation, setAllowedAtLocation] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [, setInter2] = useState(null);
  const [elapsedTime2, setElapsedTime2] = useState(0);
  const [, setHasSessions] = useContext(UserContext).hasSessions;

  const [user] = useContext(UserContext).user;
  const [openPustackCare] = useContext(UserContext).openPustackCare;
  const [isUserProTier] = useContext(UserContext).tier;

  const location = useLocation();

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const [isFloatingMute, setIsFloatingMute] =
    useContext(LiveSessionContext).isFloatingMute;

  useEffect(() => {
    let _allowedPaths = ["/doubts", "/newsfeed"];

    if (
      location.pathname === "/" ||
      _allowedPaths.includes(location.pathname)
    ) {
      setAllowedAtLocation(true);
    } else if (isMobile && location.pathname === "/classes") {
      setAllowedAtLocation(true);
    } else if (allowedAtLocation) {
      setAllowedAtLocation(false);
    }
  }, [location]);

  useEffect(() => {
    if (!hasListener && user !== null && isUserProTier !== null) {
      handleSessionListener(user?.grade);
      setHasListener(true);
    }
  }, [user?.grade, isUserProTier, elapsedTime2]);

  useEffect(() => {
    setHasListener(false);
  }, [user?.grade]);

  const handleSessionListener = async (grade) => {
    listenForLiveSessions({
      grade,
      isUserPro: isUserProTier,
      callback: (_sessionID, videoID, startTs) => {
        if (localStorage.getItem("dismissed_sessions") !== null) {
          let _list = JSON.parse(localStorage.getItem("dismissed_sessions"));

          if (!_list.includes(_sessionID)) {
            setVideoID(videoID);
            setSessionID(_sessionID);
            setSessionStartTime(startTs);
          }
        } else {
          setVideoID(videoID);
          setSessionID(_sessionID);
          setSessionStartTime(startTs);
        }

        if (_sessionID) {
          setHasSessions(true);
        } else {
          setHasSessions(false);
        }
      },
    });
  };

  function countUp2() {
    setElapsedTime2((elapsedTime) => elapsedTime + 1);
  }

  useEffect(() => {
    let _interval = setInterval(() => countUp2(), 60 * 1000);
    setInter2(_interval);
  }, []);

  const handleDismiss = () => {
    setDismissProcessing(true);

    if (localStorage.getItem("dismissed_sessions") !== null) {
      let _ = [
        ...JSON.parse(localStorage.getItem("dismissed_sessions")),
        sessionID,
      ];

      localStorage.setItem("dismissed_sessions", JSON.stringify(_));
    } else {
      let _ = [sessionID];
      localStorage.setItem("dismissed_sessions", JSON.stringify(_));
    }

    setTimeout(() => {
      setIsDismissed(true);
      setDismissProcessing(false);
    }, 1000);
  };
  return (
    <>
      <div
        className={
          videoID === null
            ? "float__wrapper"
            : dismissProcessing
            ? "float__wrapper showcase dismiss"
            : "float__wrapper showcase"
        }
      >
        {videoID !== null &&
          !isDismissed &&
          allowedAtLocation &&
          sessionStartTime && (
            <FloatingVideoPlayer
              video_id={videoID}
              dismiss={handleDismiss}
              sessionID={sessionID}
              isMute={isFloatingMute}
              handleMute={() => setIsFloatingMute(!isFloatingMute)}
              openPustackCare={openPustackCare}
              sessionStartTime={sessionStartTime}
            />
          )}
      </div>
    </>
  );
}
