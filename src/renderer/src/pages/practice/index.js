import React, { useEffect, useContext, useState, useRef, useMemo } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { usePageVisibility } from "react-page-visibility";
import { Helmet } from "react-helmet";
import TopBarProgress from "react-topbar-progress-indicator";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import PdfPreview from "./../../components/newsfeed/pdf-preview/index";
import Modal from "react-modal";

import {
  PracticeNavbar,
  PracticePlayer,
  PracticeSidebar,
} from "../../components";
import {
  getSubjectPracticeData,
  getItemDetails,
  getHeaderItemDetails,
  getExamUserEngagement,
  getUserDailyEngagement,
  changeUserGrade,
} from "../../database";
import { PracticeContext, UserContext } from "../../context";
import { getYoutubeID } from "../../helpers";
import { proLogoDark } from "../../assets";
import "./style.scss";

TopBarProgress.config({
  barColors: { 0: "#bb281b", "1.0": "#bb281b" },
  shadowBlur: 5,
});

export default function PracticeScreen() {
  const location = useLocation();
  const history = useHistory();
  const isMobileScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1367px)" });

  const [videoID, setVideoID] = useContext(PracticeContext).videoID;
  const [practiceData, setPracticeData] =
    useContext(PracticeContext).practiceData;
  const [activeItem, setActiveItem] = useContext(PracticeContext).activeItem;
  const [practiceNotes, setPracticeNotes] =
    useContext(PracticeContext).notesLink;
  const [isNotes, setIsNotes] = useContext(PracticeContext).isNotes;
  const [nextItem, setNextItem] = useContext(PracticeContext).nextItem;
  const [, setActiveTabIndex] = useContext(PracticeContext).activeTabIndex;
  const [practiceTabs, setPracticeTabs] =
    useContext(PracticeContext).practiceTabs;

  const [playing, setPlaying] = useContext(PracticeContext).playing;
  const [videoSeeking, setVideoSeeking] =
    useContext(PracticeContext).videoSeeking;
  const [showOnlyLogo] = useContext(PracticeContext).showOnlyLogo;
  const [, setPracticeTier] = useContext(PracticeContext).practiceTier;
  const [beaconBody, setBeaconBody] = useContext(PracticeContext).beaconBody;

  const [user, setUser] = useContext(UserContext).user;
  const [isUserProTier] = useContext(UserContext).tier;

  const [videoDuration, setVideoDuration] = useState(0);
  const [userDailyEngagement, setUserDailyEngagement] = useState(null);
  const [lastActivityMap, setLastActivityMap] = useState(null);
  const [dailyEngagementInside, setDailyEngagementInside] = useState(null);
  const [examUserEngagement, setExamUserEngagement] = useState(null);
  const [examEngagementStatus, setExamEngagementStatus] = useState(null);
  const [examCompletionStatus, setExamCompletionStatus] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedPercentage, setElapsedPercentage] = useState(0);
  const [totalSpentTime, setTotalSpentTime] = useState(0);
  const [totalLecturesWatched, setTotalLecturesWatched] = useState(0);
  const [interval, setInter] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [examName, setExamName] = useState("");

  const [practiceId, setPracticeId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [isLastEngagementSent, setIsLastEngagementSent] = useState(false);
  const [lecturesWatched, setLecturesWatched] = useState([]);
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
      _currentURL.searchParams.has("practice")
    ) {
      setSubjectId(_currentURL.searchParams.get("subject"));

      const _practice = _currentURL.searchParams.get("practice");
      setPracticeId(_practice);

      const splitted = _practice.split("_");

      const grade = {
        id: splitted[0] + "_" + splitted[1],
        name: getClassName(_practice),
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
    window.addEventListener("pagehide", updateUserPracticeEngagmentOnPageHide);

    return () => {
      window.removeEventListener(
        "pagehide",
        updateUserPracticeEngagmentOnPageHide
      );
    };
  });

  const updateUserPracticeEngagmentOnPageHide = () => {
    if (beaconRef.current && lastActivityMap) {
      const response = navigator.sendBeacon(
        "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserPracticeEngagement",
        JSON.stringify(beaconRef.current)
      );

      if (response) {
        setPracticeData(null);
        setVideoID(null);
        setPracticeTabs(null);
        setPracticeNotes(null);
        setIsNotes(false);
        setActiveItem(null);
        setNextItem(null);
        setVideoSeeking(true);
        setPlaying(false);
        setBeaconBody(null);
        setActiveTabIndex(0);
      }
    }
  };

  useEffect(() => {
    return () => {
      setPracticeData(null);
      setVideoID(null);
      setPracticeTabs(null);
      setPracticeNotes(null);
      setIsNotes(false);
      setActiveItem(null);
      setNextItem(null);
      setVideoSeeking(true);
      setPlaying(false);
      setActiveTabIndex(0);
    };
  }, []);

  const populatepracticeData = async () => {
    let _data = await getSubjectPracticeData({
      grade: user?.grade,
      subjectId: subjectId,
      practiceId: practiceId,
    });

    setPracticeData(_data?._meta);
    setExamName(_data?.exam_name);
  };

  const getExamUserEngagementFn = async () => {
    let _data = await getExamUserEngagement({
      grade: user?.grade,
      userId: user?.uid,
      practiceId,
    });

    setExamUserEngagement(_data);
  };

  useEffect(() => {
    if (subjectId !== null && practiceId !== null) {
      populatepracticeData();
      getExamUserEngagementFn();

      getUserDailyEngagementFn();
    }
  }, [subjectId, practiceId, user?.grade]);

  useEffect(() => {
    let _practiceTabs = [];

    let otherData = [];

    if (practiceData) {
      practiceData.map((data) => {
        if (data.exam_item_type === "header") {
          _practiceTabs.push({
            tab_name: "Solution",
            tab_id: 1,
            ...data,
          });
        } else {
          otherData.push(data);
        }
      });

      _practiceTabs.push({
        tab_name: "Practice",
        tab_id: 0,
        list_items: otherData,
      });

      setPracticeTabs(_practiceTabs?.sort((a, b) => a?.tab_id - b?.tab_id));
    }
  }, [practiceData]);

  useEffect(() => {
    if (practiceTabs) {
      setActiveItem({
        parent: null,
        item: practiceTabs[0]?.list_items[0]?.exam_item_id,
      });
    }
  }, [practiceTabs, user?.grade]);

  useEffect(() => {
    if (subjectId && practiceId) {
      if (activeItem?.parent) {
        getHeaderItemDetailsFn();
        getNextItemFn();
      } else if (activeItem?.item) {
        getItemDetailsFn();
        setNextItem(null);
      }
    }
  }, [activeItem, subjectId, practiceId]);

  useEffect(() => {
    if (autoPlay) {
      setActiveItem({
        parent: nextItem?.parent,
        item: nextItem?.item,
      });

      if (nextItem?.tier === "pro") {
        setPracticeTier(true);
      } else {
        setPracticeTier(false);
      }

      setVideoSeeking(true);
      setAutoPlay(false);
    }
  }, [autoPlay]);

  const getItemDetailsFn = async () => {
    const data = await getItemDetails({
      grade: user?.grade,
      subjectId,
      practiceId,
      itemId: activeItem?.item,
    });

    if (data?.youtube_url) {
      setVideoID(getYoutubeID(data?.youtube_url));
    }

    if (data?.notes_link) {
      setPracticeNotes(data?.notes_link);
    }
  };

  const getHeaderItemDetailsFn = async () => {
    const data = await getHeaderItemDetails({
      grade: user?.grade,
      subjectId,
      practiceId,
      parentId: activeItem?.parent,
      itemId: activeItem?.item,
    });

    if (data?.youtube_url) {
      setVideoID(getYoutubeID(data?.youtube_url));
    }

    if (data?.notes_link) {
      setPracticeNotes(data?.notes_link);
    }
  };

  const getNextItemFn = () => {
    if (activeItem?.parent) {
      let index = practiceTabs[1]?.exam_header_items?.findIndex(
        (x) => x.exam_header_item_id === activeItem?.item
      );

      let nextData = practiceTabs[1]?.exam_header_items[index + 1];

      setNextItem({
        parent: practiceTabs[1]?.exam_item_id,
        item: nextData?.exam_header_item_id,
        childName: nextData?.lecture_header_item_name,
        lectureType: nextData?.lecture_header_item_type,
        headerItemIndex: 0,
        itemIndex: nextData?.serial_order,
        tabIndex: 1,
        tier: nextData?.tier,
      });
    }
  };

  const getTotalLecturesCount = (lectureItems) => {
    let count = 0;

    if (lectureItems) {
      lectureItems.map((item) => {
        if (item.exam_header_items.length > 0)
          count += item.exam_header_items.length;
        else count++;
      });
    }

    return count;
  };

  const getTotalLecturesCompletedCount = (lectureItems) => {
    let count = 0;

    if (lectureItems) {
      for (let key in lectureItems) {
        if (lectureItems[key]?.header_item_status) {
          for (let hkey in lectureItems[key]?.header_item_status) {
            count += lectureItems[key]?.header_item_status[hkey].is_completed
              ? 1
              : 0;
          }
        } else {
          count += lectureItems[key]?.is_completed ? 1 : 0;
        }
      }
    }

    return count;
  };

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
      // Clearing the interval here
      return () => clearInterval(interval);
    }
  }, [playing, videoSeeking, activeItem]);

  useEffect(() => {
    if (elapsedPercentage > 20) setTotalSpentTime(totalSpentTime + elapsedTime);

    setElapsedTime(0);
    setElapsedPercentage(0);
  }, [activeItem]);

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
                .total_watched_lecture_count + totalLecturesWatched
            : totalLecturesWatched
          : totalLecturesWatched
        : totalLecturesWatched;

    let dailyEngagement = {
      [yearMonthDate]: {
        total_spent_time:
          elapsedPercentage > 20
            ? total_spent_time + elapsedTime
            : total_spent_time,
        total_watched_lecture_count,
      },
    };

    setDailyEngagementInside(dailyEngagement);

    return [dailyEngagement, yearMonth];
  };

  useEffect(() => {
    if (videoDuration > 0)
      setElapsedPercentage((elapsedTime / videoDuration) * 100);
  }, [elapsedTime, videoDuration]);

  useEffect(() => {
    if (examUserEngagement) {
      const _lastActivityMap = examUserEngagement?.last_activity_map;
      setLastActivityMap(_lastActivityMap);

      setActiveItem({
        item: _lastActivityMap?.header_item_id
          ? _lastActivityMap?.header_item_id
          : _lastActivityMap?.item_id,
        parent: _lastActivityMap?.header_item_id
          ? _lastActivityMap?.item_id
          : _lastActivityMap?.header_item_id,
      });

      setActiveTabIndex(_lastActivityMap?.header_item_id ? 1 : 0);
    }
  }, [examUserEngagement]);

  useEffect(() => {
    const _lastActivityMap = {
      header_item_id: activeItem?.parent ? activeItem?.item : null,
      item_id: activeItem?.parent ? activeItem?.parent : activeItem?.item,
    };

    setLastActivityMap(_lastActivityMap);

    let exam_completion_status = {};
    let exam_engagement_status = {};

    if (elapsedPercentage > 20) {
      if (!lecturesWatched.includes(activeItem?.item)) {
        setTotalLecturesWatched(totalLecturesWatched + 1);

        const _lecturesWatched = [...lecturesWatched];
        _lecturesWatched.push(activeItem?.item);
        setLecturesWatched(_lecturesWatched);
      }
    }

    // exam_engagement_status

    if (activeItem?.parent) {
      const headerItemData =
        examUserEngagement?.exam_engagement_status[activeItem?.parent]
          ?.header_item_status[activeItem?.item];

      exam_engagement_status = {
        ...examEngagementStatus,
        ...examUserEngagement?.exam_engagement_status,

        [activeItem?.parent]: {
          header_item_status: {
            ...examUserEngagement?.exam_engagement_status[activeItem?.parent]
              ?.header_item_status,

            [activeItem?.item]: {
              is_completed: headerItemData?.is_completed
                ? headerItemData?.is_completed
                : elapsedPercentage > 20,
              total_viewed_duration: headerItemData?.total_viewed_duration
                ? elapsedTime + headerItemData?.total_viewed_duration
                : elapsedTime,
            },
          },

          is_completed: false,
        },
      };
    } else if (activeItem?.item) {
      const itemData =
        examUserEngagement?.exam_engagement_status[activeItem?.item];

      exam_engagement_status = {
        ...examEngagementStatus,
        ...examUserEngagement?.exam_engagement_status,

        [activeItem?.item]: {
          is_completed: itemData?.is_completed
            ? itemData?.is_completed
            : elapsedPercentage > 20,
          total_viewed_duration: itemData?.total_viewed_duration
            ? itemData?.total_viewed_duration + elapsedTime
            : elapsedTime,
        },
      };
    }

    setExamEngagementStatus(exam_engagement_status);

    exam_completion_status = {
      completed_item_count: getTotalLecturesCompletedCount(
        exam_engagement_status
      ),
      total_item_count: getTotalLecturesCount(practiceData) - 2,
    };

    setExamCompletionStatus(exam_completion_status);
  }, [activeItem, elapsedTime]);

  const isVisible = usePageVisibility();

  useMemo(() => {
    let [dailyEngagement, yearMonth] = updateDailyEngagementMap();

    let body = {
      lastActivityMap,
      dailyEngagement,
      yearMonth,
      examCompletionStatus,
      examEngagementStatus,
      practiceId,
      user,
      context: { auth: !!user?.uid },
    };

    localStorage.setItem("practiceBeaconBody", JSON.stringify(body));

    setBeaconBody(body);
    beaconRef.current = body;
  }, [lastActivityMap, examCompletionStatus, examEngagementStatus]);

  useEffect(() => {
    if (!isVisible && !isLastEngagementSent) {
      navigator.sendBeacon(
        "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserPracticeEngagement",
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
        <title>{examName ? examName + " | PuStack" : "PuStack"}</title>
      </Helmet>

      {!isMobileScreen && <PracticeNavbar
        title={examName}
        chapterID={practiceId}
        examCompletionStatus={examCompletionStatus}
      />}
      <div className="classroom__screen">
        <div className="classroom__content">
          <div className="back__library">
            <Link to="/">
              <ChevronLeftIcon /> <span>Back to Library</span>
            </Link>
          </div>
          {videoID ? (
            <PracticePlayer
              video_id={videoID}
              playing={playing}
              setPlaying={setPlaying}
              nextItem={nextItem}
              setActiveItem={setActiveItem}
              setPracticeTier={setPracticeTier}
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
        <PracticeSidebar
          examEngagementStatus={examEngagementStatus}
          subjectId={subjectId}
          practiceId={practiceId}
        />

        <Modal
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => setIsNotes(false)}
          ariaHideApp={false}
          className="new-post-modal pdf-preview-modal"
          overlayClassName="new-post-modal-overlay"
          isOpen={isNotes}
        >
          <PdfPreview
            pdf={practiceNotes}
            onClose={() => {
              setIsNotes(false);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
