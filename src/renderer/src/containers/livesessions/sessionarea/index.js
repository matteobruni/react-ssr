import React, {useContext, useEffect, useState, useRef, useCallback} from "react";
import Modal from "react-modal";
import {Link, useHistory} from "react-router-dom";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import { useMediaQuery } from "react-responsive";
import { usePageVisibility } from "react-page-visibility";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import {circularProgress} from "../../../assets";
import Lottie from "lottie-react-web";
import { PdfPreview, LiveSessionLectureShimmer } from "../../../components";
import {
  RecordedPlayer,
  LiveSessionLecturePlayer,
  LiveSessionPrePlaceholder,
  LiveSessionPostPlaceholder,
  LiveSessionQuizSidebar,
} from "../../index";

import {
  LiveSessionContext, LiveSessionContextProvider,
  ThemeContext,
  UserContext,
} from "../../../context";

import {
  getCurrentSessionDetails,
  getUserDailyEngagement,
  userJoinedSession,
} from "../../../database";
import NotesSVG from "../../../assets/images/pdf.svg";

import "./style.scss";
import {fetchIndianTime} from "../../../helpers/functions/getIndianTime";
import { showSnackbar } from "../../../helpers";
import {Tooltip} from "@material-ui/core";
import {ModalContext} from "../../../context/global/ModalContext";
import {deleteSession, orchestrateLiveSession} from "../../../database/livesessions/sessions";
import useTimer from "../../../hooks/timer";

export const DeleteSessionConfirmationContent = ({sessionObj = null}) => {
  const [currentSession] = useContext(LiveSessionContext).current;
  const [_, setRedirectState] = useContext(LiveSessionContext).redirectState;
  const [, setConfirmationModalData] = useContext(ModalContext).state;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [deleting, setDeleting] = useState(false);
  const history = useHistory();

  // TODO: Refactor this
  const handleDeleteSession = useCallback(async () => {
    document.body.style.pointerEvents = 'none';
    if(deleting) return;
    if(!currentSession && !sessionObj) return;
    const sessionObject = sessionObj ?? currentSession?.sessionObj;
    setDeleting(true);
    let air_time = sessionObject.air_time;
    let deleted = await deleteSession(sessionObject);
    await orchestrateLiveSession({session: sessionObject, isUpdate: false, isDelete: true});
    if(deleted) {
      showSnackbar('Session deleted successfully.', 'success');
    } else {
      showSnackbar('Something went wrong, Please try again later', 'error');
    }
    let date = await fetchIndianTime();
    history.push('/classes');
    let state = {
      timelineDate: date,
      clearDateSessionData: {...air_time, month: air_time.month - 1, date: air_time.day},
      showLatest: true
    };
    setRedirectState(state);
    setConfirmationModalData(data => ({...data, open: false}));
    document.body.style.pointerEvents = 'all';
  }, [currentSession, sessionObj]);

  return (
    <div className={"delete-session-confirmation" + (isDarkMode ? ' dark' : '')}>
      <h2>Delete Session</h2>
      <div className="text">Are you sure you want to delete this session? This cannot be undone.</div>
      <div className="flex-buttons">
        <div className="danger btn"
             onClick={handleDeleteSession}
        >{
          deleting ? (
            <Lottie options={{animationData: circularProgress, loop: true}} style={{padding: 0}} />
          ) : 'Yes'
        }</div>
        <div className="btn" onClick={() => {
          setConfirmationModalData(data => ({...data, open: false}))
        }}>No</div>
      </div>
    </div>
  )
}

export const RouteConfirmationContent = ({route, title, description}) => {
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [, setConfirmationModalData] = useContext(ModalContext).state;
  const history = useHistory();

  return (
    <div className={"delete-session-confirmation" + (isDarkMode ? ' dark' : '')}>
      <h2>{title || 'Confirmation'}</h2>
      <div className="text">{description || 'Are you sure?'}</div>
      <div className="flex-buttons">
        <div className="danger btn"
             onClick={() => {
               setConfirmationModalData(data => ({...data, open: false}))
               setTimeout(() => {
                 history.push(route);
               }, 300)
             }}
        >Yes</div>
        <div className="btn" onClick={() => {
          setConfirmationModalData(data => ({...data, open: false}))
        }}>No</div>
      </div>
    </div>
  )
}

function SessionArea({ hidePlayer = null }) {
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [currentCard, setCurrentCard] =
    useContext(LiveSessionContext).currentCard;
  const [, setCurrentSessionDetails] =
    useContext(LiveSessionContext).currentSessionDetails;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [activeSession] = useContext(LiveSessionContext).current;
  const [, setHasSessionEnded] = useContext(LiveSessionContext).ended;
  const [, setConfirmationModalData] = useContext(ModalContext).state;
  const [playing, setPlaying] = useContext(LiveSessionContext).playing;
  const [isSessionLive, setIsSessionLive] = useContext(LiveSessionContext).live;
  const [, setReplyingTo] = useContext(LiveSessionContext).replyingTo;

  const [loading, setLoading] = useState(true);
  const [showPDF, setShowPDF] = useState(false);
  const [isPDFOpen, setisPDFOpen] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [isCoolDownOver, setIsCoolDownOver] = useState(false);
  const [isCoolDownPeriod, setIsCoolDownPeriod] = useState(false);

  // User Daily Engagement
  const [, setInter2] = useState(null);
  const [totalLecturesWatched] = useState(0);
  const [interval, setInter] = useState(null);
  const [isSent, setIsSent] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [beaconBody, setBeaconBody] = useState(null);
  // const [elapsedTime2, setElapsedTime2] = useState(0);
  const [totalSpentTime, setTotalSpentTime] = useState(0);
  const [userDailyEngagement, setUserDailyEngagement] = useState(null);

  const beaconRef = useRef(beaconBody);
  const isVisible = usePageVisibility();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const history = useHistory();
  const [timer] = useTimer(10000);

  const getActiveSession = (activeSession) => {
    setLoading(true);
    setCurrentSession(null);
    setReplyingTo(null);

    return getCurrentSessionDetails(
      activeSession.reference,
      (e) => {
        setCurrentSession(e);
        setCurrentSessionDetails(e);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    localStorage.setItem("liveSessionsBeaconBody", null);
  }, []);

  useEffect(() => {
    return () => {
      setCurrentCard(null);
      setPlaying(false);
      setIsSessionLive(false);
      setCurrentSession(null);
      setHasSessionEnded(false);
    };
  }, []);

  useEffect(() => {
    // SNAPSHOT ACTIVE SESSION
    if (activeSession) {
      let unsubscribe = getActiveSession(activeSession);
      return () => unsubscribe();
    }
  }, [activeSession]);

  // useEffect(() => {
  //   currentSession && checkTimer();
  //
  //   if (timer !== null) clearInterval(timer);
  // }, [currentSession]);
  //
  // const checkTimer = () => {
  //   // If Session has started according to the schedule
  //   const indianTime = +getIndianTime();
  //   const isBeforeTime = +new Date(currentSession?.start_ts) >= indianTime;
  //
  //   const sessionLength =
  //     currentSession?.video_length > 0
  //       ? Number(currentSession?.video_length) * 1000
  //       : Number(currentSession?.duration) * 60 * 1000;
  //
  //   const isAfterTime =
  //     +new Date(currentSession?.start_ts) + sessionLength <= indianTime;
  //
  //   const isCoolDownOver =
  //     +new Date(currentSession?.start_ts) + sessionLength + 5 * 60 * 1000 <=
  //     indianTime;
  //
  //   const _isCoolDownPeriod = isAfterTime && !isCoolDownOver;
  //
  //   const isAirTime = !isBeforeTime && !isAfterTime;
  //
  //   if (_isCoolDownPeriod) {
  //     setIsCoolDownPeriod(true);
  //   } else setIsCoolDownPeriod(false);
  //
  //   if (isCoolDownOver) {
  //     setIsCoolDownOver(true);
  //   } else setIsCoolDownOver(false);
  //
  //   if (isAirTime) {
  //     userJoinedSession(currentSession.reference, {
  //       uid: user.uid,
  //       name: user.name,
  //       profile: user.profile_url,
  //     });
  //   }
  //
  //   if (currentSession.status === "disposed") {
  //     setIsSessionLive(false);
  //     setHasSessionEnded(true);
  //     return setSessionStatus("ended");
  //   } else {
  //     setHasSessionEnded(false);
  //   }
  //
  //   if (isAirTime) {
  //     return setIsSessionLive(true);
  //   }
  //
  //   if (isBeforeTime) {
  //     setIsSessionLive(false);
  //     setSessionStatus("initial");
  //   } else if (isAfterTime) {
  //     setIsSessionLive(false);
  //     setHasSessionEnded(true);
  //     setSessionStatus("ended");
  //   }
  //
  //   if (_isCoolDownPeriod) {
  //     return setIsCoolDownPeriod(true);
  //   }
  //
  //   if (isCoolDownOver) {
  //     return setIsCoolDownOver(true);
  //   }
  // };

  useEffect(() => {
    if (currentSession && timer) {
      const indianTime = +timer;
      const isBeforeTime = +new Date(currentSession?.start_ts) >= indianTime;

      const sessionLength =
        currentSession?.video_length > 0
          ? Number(currentSession?.video_length) * 1000
          : Number(currentSession?.duration) * 60 * 1000;

      const isAfterTime =
        +new Date(currentSession?.start_ts) + sessionLength <= indianTime;

      const isCoolDownOver =
        +new Date(currentSession?.start_ts) + sessionLength + 5 * 60 * 1000 <=
        indianTime;

      const _isCoolDownPeriod = isAfterTime && !isCoolDownOver;

      const isAirTime = !isBeforeTime && !isAfterTime;

      if (_isCoolDownPeriod) {
        setIsCoolDownPeriod(true);
      } else setIsCoolDownPeriod(false);

      if (isCoolDownOver) {
        setIsCoolDownOver(true);
      } else setIsCoolDownOver(false);

      if (currentSession.status === "disposed") {
        setIsSessionLive(false);
        setHasSessionEnded(true);
        return setSessionStatus("ended");
      } else {
        setHasSessionEnded(false);
      }

      if (isAirTime) {
        return setIsSessionLive(true);
      }

      if (isBeforeTime) {
        setIsSessionLive(false);
        setSessionStatus("initial");
      } else if (isAfterTime) {
        setIsSessionLive(false);
        setHasSessionEnded(true);
        setSessionStatus("ended");
      }

      if (_isCoolDownPeriod) {
        return setIsCoolDownPeriod(true);
      }

      if (isCoolDownOver) {
        return setIsCoolDownOver(true);
      }
    }
  }, [currentSession, timer]);

  // function countUp2() {
  //   setElapsedTime2((elapsedTime) => elapsedTime + 1);
  // }
  //
  // useEffect(() => {
  //   let _interval = setInterval(() => countUp2(), 10000);
  //   setInter2(_interval);
  // }, []);

  const NotesSVGIcon = (
    <Icon>
      <img className="notes__svg" alt="PuStack Notes" src={NotesSVG} />
    </Icon>
  );

  function countUp() {
    setElapsedTime((elapsedTime) => elapsedTime + 1);
  }

  useEffect(() => {
    if (!playing) {
      clearInterval(interval);
      setInter(null);
    } else if (playing) {
      let interval = setInterval(() => countUp(), 1000);
      setInter(interval);
    }
  }, [playing]);

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
                .total_watched_lecture_count
            : totalLecturesWatched
          : totalLecturesWatched
        : totalLecturesWatched;

    let dailyEngagement = {
      [yearMonthDate]: {
        total_spent_time: total_spent_time + elapsedTime,
        total_watched_lecture_count,
      },
    };

    return [dailyEngagement, yearMonth];
  };

  useEffect(() => {
    const [dailyEngagement, yearMonth] = updateDailyEngagementMap();

    let body = {
      dailyEngagement,
      yearMonth,
      user,
      context: { auth: !!user?.uid },
    };

    if (elapsedTime > 2) {
      localStorage.setItem("liveSessionsBeaconBody", JSON.stringify(body));
    }

    setBeaconBody(body);
    beaconRef.current = body;
  }, [elapsedTime]);

  useEffect(() => {
    if (!isVisible && !isSent && elapsedTime > 5) {
      navigator.sendBeacon(
        "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserLiveSessionsEngagement",
        JSON.stringify(beaconBody)
      );

      setIsSent(true);
    } else if (isVisible) {
      setIsSent(false);
    }
  }, [isVisible]);

  useEffect(() => {
    window.addEventListener("pagehide", updateEngagmentOnPageHide);

    return () => {
      window.removeEventListener("pagehide", updateEngagmentOnPageHide);
    };
  });

  const updateEngagmentOnPageHide = () => {
    if (beaconRef.current && elapsedTime > 5) {
      navigator.sendBeacon(
        "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserLiveSessionsEngagement",
        JSON.stringify(beaconRef.current)
      );
    }
  };

  useEffect(() => {
    setTotalSpentTime(totalSpentTime + elapsedTime);

    setElapsedTime(0);
  }, [currentSession?.videokey]);

  useEffect(() => {
    getUserDailyEngagementFn();
  }, []);

  return (
    <>
      <div className="session__area--holder">
        {(loading || !activeSession) && (
          <div
            className="session__area"
            style={{
              background: isSmallScreen
                ? "#202020"
                : isDarkMode
                ? "#202020"
                : "white",
            }}
          >
            <LiveSessionLectureShimmer />
          </div>
        )}
        {!loading && activeSession && (
          <div className="session__area">
            <Link to="/classes" onClick={hidePlayer}>
              <div className="back__icon">
                <ChevronLeftIcon />
              </div>
            </Link>

            {!isCoolDownOver &&
              currentSession !== null &&
              !isSessionLive &&
              sessionStatus === "initial" && !isInstructor && (
                <LiveSessionPrePlaceholder start_time={currentSession.start_ts} />
              )}

            {!isCoolDownOver &&
              currentSession !== null &&
              !isSessionLive &&
              sessionStatus === "ended" && !isInstructor && (
                <LiveSessionPostPlaceholder isCoolDownPeriod={isCoolDownPeriod} />
              )}

            {!isCoolDownOver && currentSession !== null && isSessionLive && !isInstructor && (
              <LiveSessionLecturePlayer
                video_id={currentSession.videokey}
                setPlaying={setPlaying}
                playing={playing}
                sessionStartTime={currentSession?.start_ts}
              />
            )}

            {(isCoolDownOver || isInstructor) && currentSession !== null && (
              <RecordedPlayer
                video_id={currentSession.videokey}
                isInstructor={isInstructor}
                setPlaying={setPlaying}
                playing={playing}
              />
            )}
          </div>
        )}
        <div className="session__details">
        {(currentSession !== null) && (
          <div className={"fadeIn"}>
            <div className="left__wrapper">
              <div className="session__details__category">
                {currentSession !== null ? currentSession.category : ""}
              </div>
              <div className="session__details__topic">
                {currentSession !== null ? currentSession.name : ""}
              </div>
            </div>
            <div className="right__wrapper">
              {isInstructor && (
                <>
                  <Tooltip title="Edit Session" >
                    <Button
                      variant="text"
                      style={{marginRight: '10px'}}
                      startIcon={(
                        <svg height="20" fill="#96999b" viewBox="0 0 492.49284 492" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m304.140625 82.472656-270.976563 270.996094c-1.363281 1.367188-2.347656 3.09375-2.816406 4.949219l-30.035156 120.554687c-.898438 3.628906.167969 7.488282 2.816406 10.136719 2.003906 2.003906 4.734375 3.113281 7.527344 3.113281.855469 0 1.730469-.105468 2.582031-.320312l120.554688-30.039063c1.878906-.46875 3.585937-1.449219 4.949219-2.8125l271-270.976562zm0 0"/><path d="m476.875 45.523438-30.164062-30.164063c-20.160157-20.160156-55.296876-20.140625-75.433594 0l-36.949219 36.949219 105.597656 105.597656 36.949219-36.949219c10.070312-10.066406 15.617188-23.464843 15.617188-37.714843s-5.546876-27.648438-15.617188-37.71875zm0 0"/></svg>
                      )}
                      onClick={() => {
                        setConfirmationModalData({
                          open: true,
                          Children: <RouteConfirmationContent
                            title="Edit Session"
                            description="Are you sure you want to edit this session?"
                            route="/classes/create?edit=true"
                          />
                        })
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Copy Session">
                    <Button
                      variant="text"
                      style={{marginRight: '10px'}}
                      startIcon={(
                        <svg version="1.1" fill="#96999b" id="Capa_1" width={20} height={20} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                             viewBox="0 0 210.107 210.107" xmlSpace="preserve">
                          <g>
                            <path d="M168.506,0H80.235C67.413,0,56.981,10.432,56.981,23.254v2.854h-15.38
                          c-12.822,0-23.254,10.432-23.254,23.254v137.492c0,12.822,10.432,23.254,23.254,23.254h88.271
                          c12.822,0,23.253-10.432,23.253-23.254V184h15.38c12.822,0,23.254-10.432,23.254-23.254V23.254C191.76,10.432,181.328,0,168.506,0z
                           M138.126,186.854c0,4.551-3.703,8.254-8.253,8.254H41.601c-4.551,0-8.254-3.703-8.254-8.254V49.361
                          c0-4.551,3.703-8.254,8.254-8.254h88.271c4.551,0,8.253,3.703,8.253,8.254V186.854z M176.76,160.746
                          c0,4.551-3.703,8.254-8.254,8.254h-15.38V49.361c0-12.822-10.432-23.254-23.253-23.254H71.981v-2.854
                          c0-4.551,3.703-8.254,8.254-8.254h88.271c4.551,0,8.254,3.703,8.254,8.254V160.746z"/>
                          </g>
                        </svg>
                      )}
                      onClick={() => {
                        setConfirmationModalData({
                          open: true,
                          Children: <RouteConfirmationContent
                            title="Copy Session"
                            description="Are you sure you want to copy this session?"
                            route="/classes/create?edit=true&duplicate=true"
                          />
                        })
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Session">
                    <Button
                      variant="text"
                      style={{marginRight: '10px'}}
                      startIcon={(
                        <svg version="1.1" fill="#96999b" id="Capa_1" width={20} height={20} xmlns="http://www.w3.org/2000/svg"
                             xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                             viewBox="0 0 384 384" xmlSpace="preserve"
                        >
                          <g>
                            <path
                              d="M64,341.333C64,364.907,83.093,384,106.667,384h170.667C300.907,384,320,364.907,320,341.333v-256H64V341.333z"/>
                            <polygon
                              points="266.667,21.333 245.333,0 138.667,0 117.333,21.333 42.667,21.333 42.667,64 341.333,64 341.333,21.333 			"/>
                          </g>
                        </svg>
                      )}
                      onClick={() => {
                        setConfirmationModalData({open: true, Children: <DeleteSessionConfirmationContent />});
                      }}
                    />
                  </Tooltip>
                </>
              )}
              {currentSession !== null && currentSession.notes !== null && (
                <Tooltip title="View Attachment">
                  <Button
                    variant="text"
                    startIcon={NotesSVGIcon}
                    onClick={() => {
                      if (
                        +new Date(currentSession?.start_ts) < +timer || isInstructor
                      ) {
                        setShowPDF(true);
                        setisPDFOpen(true);
                      } else {
                        showSnackbar("Please wait until session begins", "info");
                      }
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </div>
        )}
        {/*{currentSession !== null && isSmallScreen && !isInstructor && <LiveSessionQuizSidebar />}*/}
      </div>
      </div>

      {currentSession !== null && currentSession.notes !== null && showPDF && (
        <Modal
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => {
            setisPDFOpen(false);
            setShowPDF(false);
          }}
          ariaHideApp={false}
          className="new-post-modal pdf-preview-modal"
          overlayClassName="new-post-modal-overlay"
          isOpen={isPDFOpen}
        >
          <PdfPreview
            pdf={currentSession.notes}
            onClose={() => {
              setisPDFOpen(false);
              setShowPDF(false);
            }}
            isDarkOnSm={isSmallScreen}
          />
        </Modal>
      )}
    </>
  );
}

export default SessionArea;
