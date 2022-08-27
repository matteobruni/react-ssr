import React, { useEffect, useContext, useState, useRef, useMemo } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { usePageVisibility } from "react-page-visibility";
import { Helmet } from "react-helmet";
import TopBarProgress from "react-topbar-progress-indicator";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import PdfPreview from "./../../components/newsfeed/pdf-preview/index";

import { TipsNavbar, TipsPlayer, TipsSidebar } from "../../components";
import {
  getSubjectTips,
  getVideoId,
  getTipsEngaggementStatus,
  getUserDailyEngagement,
  changeUserGrade,
} from "../../database";
import { TipsContext, UserContext } from "../../context";
import { proLogoDark } from "../../assets";
import "./style.scss";

TopBarProgress.config({
  barColors: { 0: "#bb281b", "1.0": "#bb281b" },
  shadowBlur: 5,
});

export default function TipsScreen() {
  const location = useLocation();
  const history = useHistory();
  const isMobileScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1367px)" });

  const isVisible = usePageVisibility();

  const [videoID, setVideoID] = useContext(TipsContext).videoID;
  const [tipsData, setTipsData] = useContext(TipsContext).tipsData;
  const [activeItem, setActiveItem] = useContext(TipsContext).activeItem;
  const [nextItem, setNextItem] = useContext(TipsContext).nextItem;
  const [notesLink] = useContext(TipsContext).notesLink;
  const [isNotes, setIsNotes] = useContext(TipsContext).isNotes;
  const [playing, setPlaying] = useContext(TipsContext).playing;
  const [videoSeeking, setVideoSeeking] = useContext(TipsContext).videoSeeking;
  const [beaconBody, setBeaconBody] = useContext(TipsContext).beaconBody;

  const [tipsEngagement, setTipsEngagement] =
    useContext(TipsContext).tipsEngagement;
  const [, setTipTier] = useContext(TipsContext).tipTier;
  const [showOnlyLogo] = useContext(TipsContext).showOnlyLogo;

  const [user, setUser] = useContext(UserContext).user;
  const [isUserProTier] = useContext(UserContext).tier;

  const [userDailyEngagement, setUserDailyEngagement] = useState(null);
  const [tipsSubject, setTipsSubject] = useState(null);
  const [tipsSubjectName, setTipsSubjectName] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalSpentTime, setTotalSpentTime] = useState(0);
  const [totalTipsWatched, setTotalTipsWatched] = useState(0);
  const [isLastEngagementSent, setIsLastEngagementSent] = useState(false);
  const [tipsEngagementStatus, setTipsEngagementStatus] = useState(null);
  const [interval, setInter] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [elapsedPercentage, setElapsedPercentage] = useState(0);
  const [tipsWatched, setTipsWatched] = useState([]);
  const [linkGrade, setLinkGrade] = useState(null);

  const beaconRef = useRef(beaconBody);

  const getClassName = (grade) => {
    const splitted = grade.split("_");

    return (
      splitted[0].charAt(0).toUpperCase() +
      splitted[0].slice(1) +
      " " +
      splitted[1]
    );
  };

  useEffect(() => {
    let _currentURL = new URL(window.location.href);

    if (
      _currentURL.searchParams.has("subject") &&
      _currentURL.searchParams.has("tip")
    ) {
      setTipsSubject(_currentURL.searchParams.get("subject"));
      const _tip = _currentURL.searchParams.get("tip");
      setActiveItem({ item: _tip });
      const splitted = _tip.split("_");

      const grade = {
        id: splitted[0] + "_" + splitted[1],
        name: getClassName(_tip),
      };

      if (user?.grtade !== grade.id) {
        setVideoSeeking(false);
      }

      setLinkGrade(grade);
    } else {
      history.push("/");
    }
  }, [location]);

  const handleGradeChange = async (grade) => {
    const prevGrade = user?.grade;

    const updatedUser = { ...user, grade };
    setUser(updatedUser);

    let res = await changeUserGrade(user?.uid, grade);
    if (res) {
      // window.location.reload();
    } else {
      const updatedUser = { ...user, grade: prevGrade };
      setUser(updatedUser);
    }
  };

  useEffect(() => {
    return () => {
      setActiveItem(null);
      setNextItem(null);
      setVideoID(null);
      setTipsData(null);
      setTipsEngagement(null);
      setElapsedTime(0);
      setElapsedPercentage(0);
      setUserDailyEngagement(null);
      setPlaying(false);
      setVideoSeeking(true);
      setTipsSubject(null);
    };
  }, []);

  useEffect(() => {
    if (tipsSubject) {
      getSubjectTipsFn();
      getUserDailyEngagementFn();
    }
  }, [tipsSubject, user?.grade]);

  useEffect(() => {
    if (activeItem) getVideoIdFn();
  }, [activeItem, user?.grade]);

  const getSubjectTipsFn = async () => {
    const res = await getSubjectTips({
      grade: user?.grade,
      subjectId: tipsSubject,
    });

    setTipsData(res);
    setTipsSubjectName(res?.category_name);
  };

  const getVideoIdFn = async () => {
    const res = await getVideoId({
      grade: user?.grade,
      subjectId: tipsSubject,
      tipId: activeItem?.item,
    });

    setVideoID(res);
  };

  useEffect(() => {
    if (autoPlay) {
      setActiveItem({ item: nextItem?.item });

      setTipTier(nextItem?.tier === "pro");

      setVideoSeeking(true);
      setAutoPlay(false);
    }
  }, [autoPlay]);

  useEffect(() => {
    if (tipsData) {
      setNextLectureFn();
    }
  }, [tipsData, activeItem]);

  const setNextLectureFn = () => {
    let currentIdx = 0;
    tipsData._meta.map((p, idx) =>
      p.tip_id === activeItem.item ? (currentIdx = idx) : ""
    );

    setNextItem({
      item:
        currentIdx !== tipsData._meta.length - 1
          ? tipsData._meta[currentIdx + 1].tip_id
          : null,
      tier:
        currentIdx !== tipsData._meta.length - 1
          ? tipsData._meta[currentIdx + 1].tier
          : null,
      childName:
        currentIdx !== tipsData._meta.length - 1
          ? tipsData._meta[currentIdx + 1].tip_name
          : null,
    });
  };

  useEffect(() => {
    if (user && tipsSubject) getTipsEngaggementStatusFn();
  }, [user, tipsSubject]);

  const getTipsEngaggementStatusFn = async () => {
    const res = await getTipsEngaggementStatus({
      grade: user?.grade,
      userId: user?.uid,
      subjectId: tipsSubject,
    });

    setTipsEngagement(res);
  };

  function countUp() {
    setElapsedTime((elapsedTime) => elapsedTime + 1);
  }

  useEffect(() => {
    if (!playing || videoSeeking) {
      clearInterval(interval);
      setInter(null);
    } else if (playing) {
      let interval = setInterval(() => countUp(), 1000);
      setInter(interval);
    }
  }, [playing, videoSeeking, activeItem]);

  useEffect(() => {
    if (elapsedPercentage > 20) setTotalSpentTime(totalSpentTime + elapsedTime);

    setElapsedTime(0);
    setElapsedPercentage(0);
  }, [activeItem]);

  useEffect(() => {
    if (videoDuration > 0)
      setElapsedPercentage((elapsedTime / videoDuration) * 100);
  }, [elapsedTime, videoDuration]);

  useEffect(() => {
    if (elapsedPercentage > 20) {
      if (!tipsWatched.includes(activeItem?.item)) {
        setTotalTipsWatched(totalTipsWatched + 1);

        const _lecturesWatched = [...tipsWatched];
        _lecturesWatched.push(activeItem?.item);
        setTipsWatched(_lecturesWatched);
      }
    }

    let _tipEngagementStatus;

    if (tipsEngagement) {
      let activeItemBody = tipsEngagement[activeItem?.item];

      _tipEngagementStatus = {
        ...tipsEngagement,
        [activeItem?.item]: {
          is_completed: activeItemBody?.is_completed
            ? activeItemBody?.is_completed
            : elapsedPercentage > 20,
          total_viewed_duration: activeItemBody?.total_viewed_duration
            ? elapsedTime + activeItemBody?.total_viewed_duration
            : elapsedTime,
        },
      };
    } else {
      _tipEngagementStatus = {
        ...tipsEngagement,
        [activeItem?.item]: {
          is_completed: elapsedPercentage > 20,
          total_viewed_duration: elapsedTime,
        },
      };
    }

    setTipsEngagementStatus(_tipEngagementStatus);
  }, [activeItem, elapsedTime]);

  useEffect(() => {
    setTipsEngagement(tipsEngagementStatus);
  }, [activeItem]);

  const getUserDailyEngagementFn = async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const yearMonth = `${year}_${month}`;

    const res = await getUserDailyEngagement({
      grade: user?.grade,
      userId: user?.uid,
      yearMonth,
    });

    setUserDailyEngagement(res);
  };

  const updateDailyEngagementMap = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const date = new Date().getDate();
    const yearMonth = `${year}_${month}`;
    const yearMonthDate = `${year}_${month}_${date}`;

    const total_spent_time =
      userDailyEngagement !== null
        ? typeof userDailyEngagement?.daily_engagement !== "undefined"
          ? typeof userDailyEngagement?.daily_engagement[yearMonthDate] !==
            "undefined"
            ? userDailyEngagement?.daily_engagement[yearMonthDate]
                ?.total_spent_time + totalSpentTime
            : totalSpentTime
          : totalSpentTime
        : totalSpentTime;

    const total_watched_lecture_count =
      userDailyEngagement !== null
        ? typeof userDailyEngagement?.daily_engagement !== "undefined"
          ? typeof userDailyEngagement?.daily_engagement[yearMonthDate] !==
            "undefined"
            ? userDailyEngagement?.daily_engagement[yearMonthDate]
                .total_watched_lecture_count + totalTipsWatched
            : totalTipsWatched
          : totalTipsWatched
        : totalTipsWatched;

    let dailyEngagement = {
      [yearMonthDate]: {
        total_spent_time:
          elapsedPercentage > 20
            ? total_spent_time + elapsedTime
            : total_spent_time,
        total_watched_lecture_count,
      },
    };

    return [dailyEngagement, yearMonth];
  };

  useMemo(() => {
    let [dailyEngagement, yearMonth] = updateDailyEngagementMap();

    let body = {
      dailyEngagement,
      yearMonth,
      tipsEngagement: tipsEngagementStatus,
      subjectId: tipsSubject,
      user,
      context: { auth: !!user?.uid },
    };

    localStorage.setItem("tipsBeaconBody", JSON.stringify(body));

    setBeaconBody(body);
    beaconRef.current = body;
  }, [elapsedTime]);

  useEffect(() => {
    if (!isVisible && !isLastEngagementSent) {
      navigator.sendBeacon(
        "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserTipsEngagement",
        JSON.stringify(beaconBody)
      );

      setIsLastEngagementSent(true);
    }

    if (isVisible) {
      setIsLastEngagementSent(false);
    }
  }, [isVisible]);

  return (
    <div className="classroom__screen__wrapper">
      <div className="classroom__topbar">
        {videoSeeking && !showOnlyLogo && <TopBarProgress />}
      </div>

      <Helmet>
        <meta charSet="utf-8" />
        <title>{tipsSubjectName + " Tips | PuStack"}</title>
      </Helmet>

      {!isMobileScreen && <TipsNavbar title={tipsSubjectName}/>}
      <div className="classroom__screen">
        <div className="classroom__content">
          <div className="back__library">
            <Link to="/">
              <ChevronLeftIcon /> <span>Back to Library</span>
            </Link>
          </div>
          {videoID ? (
            <TipsPlayer
              video_id={videoID}
              playing={playing}
              setPlaying={setPlaying}
              nextItem={nextItem}
              setActiveItem={setActiveItem}
              setTipTier={setTipTier}
              setVideoDuration={setVideoDuration}
              isUserProTier={isUserProTier}
              videoSeeking={videoSeeking}
              setVideoSeeking={setVideoSeeking}
              isSmallScreen={isSmallScreen}
              isTabletScreen={isTabletScreen}
              setAutoPlay={setAutoPlay}
              showOnlyLogo={showOnlyLogo}
            />
          ) : (
            <div className="classroom-player-wrapper">
              <div className="classroom__video__seeking other__grade">
                <div className="classroom__no__video">
                  <img
                    src={proLogoDark}
                    alt="pustack logo"
                    className="no__video"
                    draggable={false}
                  />
                  {user?.grade !== linkGrade?.id && (
                    <div className="different__grade">
                      <h4>This content is from {linkGrade?.name}.</h4>
                      <h5>
                        Do you wish to change your grade from{" "}
                        <span>{getClassName(user?.grade)}</span> to{" "}
                        <span>{linkGrade?.name}</span> ?
                      </h5>
                      <div>
                        <button
                          className="yes__btn"
                          onClick={() => handleGradeChange(linkGrade?.id)}
                        >
                          Yes
                        </button>
                        <button
                          className="no__btn"
                          onClick={() => (window.location = "/")}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <TipsSidebar />

        {isNotes && (
          <PdfPreview pdf={notesLink} onClose={() => setIsNotes(false)} />
        )}
      </div>
    </div>
  );
}
