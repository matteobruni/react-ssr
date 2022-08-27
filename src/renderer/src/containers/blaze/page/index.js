import React, {useState, useEffect, useContext, useCallback} from "react";
import Axios from "axios";
import Modal from "react-modal";
import Lottie from "lottie-react-web";
import StarRatings from "react-star-ratings";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import {useHistory, useLocation} from "react-router-dom";
import Cancel from "@material-ui/icons/Cancel";
import { useMediaQuery } from "react-responsive";
import { SwipeableDrawer } from "@material-ui/core";

import {
  BlazeSidebar,
  BlazeLanding,
  BlazeBookingPopup,
  BlazeReservations,
} from "../../index";
import {
  UserContext,
  BlazeSessionContext,
  ThemeContext,
} from "../../../context";
import {
  fetchIndianTime,
  PUSHY_SECRET_API_KEY, showSnackbar,
  starPath,
} from "../../../helpers";
import {
  getStudentActiveSessionDetails,
  blazeReservationMeta,
  subjectColorsMeta,
  getBlazeBookings,
  endSession,
} from "../../../database";

import PuStackCare from "../../global/pustack-care";
import "../../../assets/bootstrap/bootstrap-grid.css";
import verfifiedCheck from "../../../assets/images/icons/verified.png";
import PuStackCareChatPopup from "../../global/pustack-care-chat-popup";
import newMsgAudio from "../../../assets/sounds/comment_notification.mp3";
import circularProgress from "../../../assets/lottie/circularProgress.json";
import updatedRatingLottie from "../../../assets/lottie/updatedRating.json";
import "./style.scss";
import { getInstructorRatings } from "../../../database/blaze/fetch-data";
import { db, functions } from "../../../firebase_config";
import { Helmet } from "react-helmet";
import useQuery from "../../../hooks/query/useQuery";

// Student Side

export default function BlazePage(props) {
  const location = useLocation();
  const pathName = location.pathname.split("/");
  const sessionPath = pathName[3];
  const history = useHistory();
  const query = useQuery();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [targetedItem, setTargetedItem] = useState(null);
  const [sessionRating, setSessionRating] = useState(0);
  const [noMoreCompletedSessions, setNoMoreCompletedSessions] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useContext(BlazeSessionContext).openBookingPopup;
  const [chaptersMeta, setChaptersMeta] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [ongoingSessions, setOngoingSessions] = useContext(BlazeSessionContext).ongoingSessions;
  const [requestedSessions, setRequestedSessions] = useContext(BlazeSessionContext).requestedSessions;
  const [completedSessions, setCompletedSessions] = useState(null);
  const [moreCompletedSessions, setMoreCompletedSessions] = useState(true);
  const [completedSessionsLimit, setCompletedSessionsLimit] = useState(10);
  const [updatingRating, setUpdatingRating] = useState(false);
  const [showLottie, setShowLottie] = useState(false);

  const [pushyData, setPushyData] = useContext(UserContext).pushyData;
  const [openBlazeCall, setOpenBlazeCall] =
    useContext(UserContext).openBlazeCallModal;

  const [studentActivity, setStudentActivity] =
    useContext(BlazeSessionContext).studentActivity;

  const [showBlazeMain, setShowBlazeMain] = useContext(UserContext).showBlazeMain;

  const [openRatingModal, setOpenRatingModal] =
    useContext(BlazeSessionContext).openRatingModal;

  const [ratingDetails, setRatingDetails] =
    useContext(BlazeSessionContext).ratingModalDetails;

  const [, setSubjectColors] = useContext(BlazeSessionContext).subjectColors;

  const [hasRatedBlazeSession, setHasRatedBlazeSession] =
    useContext(UserContext).hasRatedBlazeSession;

  const [user] = useContext(UserContext).user;

  const [messageCount, setMessageCount] = useState(
    Number(localStorage.getItem("unreadMessageCount"))
  );

  const [isDark] = useContext(ThemeContext).theme;
  const [openPustackCare] = useContext(UserContext).openPustackCare;
  const [unreadCareMsgCount] = useContext(UserContext).unreadCareMsgCount;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1200px)" });

  const handleGetBookings = (_bookings) => {
    if (_bookings) {
      setRequestedSessions(_bookings);
    }

    setIsLoading(false);
  };

  const getBookings = () => {
    return getBlazeBookings({
      user_id: user?.uid,
      type: "outstanding",
      timestamp: "requested_ts",
      limit: 20,
      callback: (_bookings) => handleGetBookings(_bookings),
    });
  };

  const getBlazeOngoing = () => {
    return getBlazeBookings({
      user_id: user?.uid,
      type: "accepted",
      timestamp: "last_message_ts",
      limit: 20,
      callback: (_bookings) => {
        if (_bookings?.length > 0) {
          // let session = _bookings.filter(
          //   (session) => session?.id === selectedSessionId
          // )[0];
          // if (session?.session_status !== "accepted") {
          //   setSelectedSession(session);
          // }
        }
        setOngoingSessions(_bookings);
      },
    });
  };

  const getBlazeCompleted = async (endAtId) => {
    let snapshot = null;
    if(endAtId) {
      snapshot = await db.collection("blaze_dev/collections/blaze_sessions")
        .doc(endAtId).get();
    }
    const snapShotCB = (snapshot, fetchMore) => {
      const requests = [];
      snapshot.docs.map((item) =>
        requests.push({reference: item.ref, item, ...item.data()})
      );
      // setLoadingStatus(false);
      console.log('requests - ', requests);
      setCompletedSessions(requests);
      if(endAtId) setTargetedItem(endAtId);
      if(fetchMore && requests.length < 7) {
        return fetchMoreCompletedSessions(requests);
      }
      setInitialized(true);
    }
    const ref = db.collection("blaze_dev")
      .doc("collections")
      .collection("blaze_sessions")
      .where("session_status", "==", "completed")
      .where('instructor_id', '!=', null)
      .where("student_id", "==", user?.uid)
      .orderBy("instructor_id");
      // .orderBy('id')

    if(snapshot) {
      return ref
        .orderBy("completed_ts", "desc")
        .endAt(snapshot)
        .onSnapshot((ss) => snapShotCB(ss, true));
    } else {
      return ref
        .orderBy("completed_ts", "desc")
        .limit(10)
        .onSnapshot(snapShotCB);
    }


    // return getBlazeBookings({
    //   user_id: user?.uid,
    //   type: "completed",
    //   timestamp: "completed_ts",
    //   limit: limit,
    //   callback: (_bookings) => {
    //     setIsFetching(false);
    //     if (_bookings?.length > 0) {
    //       setSelectedSession(
    //         _bookings.filter((session) => session?.id === selectedSessionId)[0]
    //       );
    //     }
    //     if (_bookings.length < limit) {
    //       setMoreCompletedSessions(false);
    //     }
    //
    //     setCompletedSessions(_bookings);
    //   },
    // });
  };

  useEffect(() => {
    setShowBlazeMain(
      requestedSessions?.length === 0 && ongoingSessions?.length === 0 && !query.get('completed')
    );
  }, [requestedSessions, ongoingSessions, query]);

  // const fetchMoreCompletedSessions = () => {
  //   moreCompletedSessions && setCompletedSessionsLimit((i) => i + 5);
  // };

  const fetchMoreCompletedSessions = useCallback(async (preCompletedSessions) => {
    let compSessions = preCompletedSessions ?? completedSessions;
    if (!compSessions || !compSessions.length > 0 || !user?.uid) {
      setInitialized(true);
      setNoMoreCompletedSessions(true);
      return;
    }
    return db.collection("blaze_dev")
      .doc("collections")
      .collection("blaze_sessions")
      .where("session_status", "==", "completed")
      .where('instructor_id', '!=', null)
      .where("student_id", "==", user?.uid)
      // .where("completed_ts", "<", compSessions.at(-1).completed_ts)
      .orderBy("instructor_id")
      .orderBy("completed_ts", "desc")
      .startAfter(compSessions.at(-1).item)
      .limit(10)
      .get()
      .then((snapshot) => {
        const requests = [];
        snapshot.docs.map((item) =>
          requests.push({item, ...item.data()})
        );
        setCompletedSessions(c => [...c, ...requests]);
        setInitialized(true);
        setNoMoreCompletedSessions(!(requests.length > 0 && requests.length >= 10));
      });
  }, [completedSessions, user?.uid])

  useEffect(() => {
    if(!ongoingSessions || !requestedSessions || !completedSessions || isSmallScreen) return;
    if(location.pathname === '/blaze') {
      let sessionToSelect = null;
      if(ongoingSessions.length > 0) sessionToSelect = ongoingSessions[0];
      else if(requestedSessions.length > 0) sessionToSelect = requestedSessions[0];
      else return;
      console.log(' - - hello');
      // else if(completedSessions.length > 0) sessionToSelect = completedSessions[0];
      history.push('/blaze/chat/' + sessionToSelect?.id);
      // setSelectedSession(sessionToSelect);
      // setSelectedSessionId(sessionToSelect?.id);
    }
  }, [location, ongoingSessions, requestedSessions, completedSessions]);

  useEffect(() => {
    const unsub = getBlazeOngoing();
    const unsubscribe = getBookings();
    return () => {
      unsub()
      unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (isFetching) return;
    if(completedSessions || completedSessions?.length > 0) return;
    let unsubscribe = () => {};
    console.log('location - ', location, query.get('completed'), location.pathname.split('/').length === 4);
    if(query.get('completed') && location.pathname.split('/').length === 4) {
      let id = location.pathname.split('/')[3];
      unsubscribe = getBlazeCompleted(id);
    } else {
      unsubscribe = getBlazeCompleted();
    }
    return () => unsubscribe.then(c => c());
  }, [query, location, completedSessions]);

  useEffect(() => {
    const subjectColorsMetaFn = async () => {
      setSubjectColors(await subjectColorsMeta({ grade: user?.grade }));
    };

    if (user?.grade) subjectColorsMetaFn();
  }, [user?.grade]);

  useEffect(() => {
    if (!showBlazeMain) {
      const _sessionId = sessionPath;

      let session = null;

      if (_sessionId && ongoingSessions) {
        session = ongoingSessions?.filter(
          (session) => session.id === _sessionId
        )[0];
      }

      if (_sessionId && requestedSessions) {
        let _session = requestedSessions?.filter(
          (session) => session.id === _sessionId
        )[0];

        if (_session) session = _session;
      }

      if (_sessionId && completedSessions) {
        let _session = completedSessions?.filter(
          (session) => session.id === _sessionId
        )[0];
        if (_session) session = _session;
      }

      if (session) {
        setSelectedSession(session);
        setIsChatOpen(true);
      } else if (!session && isSmallScreen) {
        setSelectedSession(null);
        setIsChatOpen(false);
      }
    }
  }, [
    ongoingSessions,
    completedSessions,
    requestedSessions,
    showBlazeMain,
    sessionPath,
  ]);

  // useEffect(() => {
  //   if (pathName.length > 4 || !showBlazeMain) return;
  //
  //   const _sessionId = pathName[3];
  //   if (
  //     !_sessionId &&
  //     (ongoingSessions || completedSessions || requestedSessions)
  //   ) {
  //     let allSessions = [
  //       ...(ongoingSessions || []),
  //       ...(requestedSessions || []),
  //       ...(completedSessions || []),
  //     ];
  //
  //     let session = allSessions[0];
  //
  //     if (session && !isSmallScreen) {
  //       setSelectedSession(session ? session : selectedSession);
  //
  //       console.log('Changing from here - ');
  //
  //       window.history.replaceState(
  //         null,
  //         session.topic,
  //         `/blaze/chat/${session?.id}`
  //       );
  //     }
  //   }
  // }, [ongoingSessions, completedSessions, requestedSessions, showBlazeMain]);

  useEffect(() => {
    props.showMenuItem(isChatOpen);
  }, [isChatOpen]);

  useEffect(() => {
    const blazeTotalMessagesCount = (grade, userID) => {
      const doc = db
        .collection("user_notifications")
        .doc(grade)
        .collection("user_notifications")
        .doc(userID);

      return doc.onSnapshot((docSnapshot) => {
        if (typeof docSnapshot.data() !== "undefined") {
          const { unread_blaze_message_count } = docSnapshot.data();

          if (
            unread_blaze_message_count > 0 &&
            unread_blaze_message_count !== messageCount
          ) {
            setNewMessage(true);
            setTimeout(() => setNewMessage(false), 100);
          } else {
            setNewMessage(false);
          }

          setMessageCount(unread_blaze_message_count);
          localStorage.setItem(
            "unreadMessageCount",
            unread_blaze_message_count
          );
        } else {
          setMessageCount(0);
          localStorage.setItem("unreadMessageCount", 0);
        }
      });
    };
    const unsubscribe = blazeTotalMessagesCount(user?.grade, user?.uid);
    return () => unsubscribe();
  }, []);

  const onFocus = () => {
    setIsTabActive(true);
    setNewMessage(false);
  };

  const onBlur = () => {
    setIsTabActive(false);
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    if (newMessage && !isTabActive) {
      let audio = new Audio(newMsgAudio);
      audio.play();
    }
  }, [newMessage, isTabActive]);

  useEffect(() => {
    getChapterMeta();
  }, [user?.grade]);

  const getChapterMeta = async () => {
    const res = await blazeReservationMeta({ grade: user?.grade });
    setChaptersMeta(res);
  };

  useEffect(() => {
    if (openBlazeCall && pushyData && ongoingSessions) {
      const sessionId = pushyData?.session_id;
      let _selectedSession = ongoingSessions?.filter(
        (session) => session.id === sessionId
      )[0];

      setSelectedSession(_selectedSession);
      setIsChatOpen(true);
    }
  }, [openBlazeCall, pushyData, ongoingSessions]);

  useEffect(() => {
    fetchIndianTime()
      .then(indianTime => {
        let url_string = window.location.href;
        let url = new URL(url_string);

        let pathname = window.location.pathname;
        const sessionId = pathname.split("/")[3];

        const meetingId = url.searchParams.get("meetingId");
        const pushyToken = url.searchParams.get("pushyToken");
        const notificationTitle = url.searchParams.get("notificationTitle");
        const notificationSub = url.searchParams.get("notificationSub");
        const missedNotificationTitle = url.searchParams.get(
          "missedNotificationTitle"
        );
        const last_active_mobile_platform = url.searchParams.get('last_active_mobile_platform');
        const missedNotificationSub = url.searchParams.get("missedNotificationSub");
        const notificationBrief = url.searchParams.get("notificationBrief");

        const notificationId = url.searchParams.get("notificationId");

        if (ongoingSessions && meetingId && sessionId) {
          let _selectedSession = ongoingSessions?.filter(
            (session) => session.id === sessionId
          )[0];

          let _pushyData = {
            notification_title: notificationTitle,
            notification_subtitle: notificationSub,
            missed_notification_title: missedNotificationTitle,
            missed_notification_subtitle: missedNotificationSub,
            notification_brief: notificationBrief,
            notification_type: "session_ping",
            instructor_id: _selectedSession?.instructor_id,
            instructor_name: _selectedSession?.instructor_name,
            instructor_profile_picture: _selectedSession?.instructor_profile_pic,
            session_id: sessionId,
            meeting_id: meetingId,
            notification_id: notificationId,
            deliver_ts: +indianTime,
            rtm_token: _selectedSession?.rtm_token,
            student_mobile_token: pushyToken,
            student_web_token: "",
            last_active_mobile_platform,
            instuctor_avg_rating: _selectedSession?.instructor_rating,
          };

          setPushyData(_pushyData);

          if (pushyToken) {
            Axios.post(
              `https://api.pushy.me/push?api_key=${PUSHY_SECRET_API_KEY}`,
              {
                to: pushyToken,
                data: { ..._pushyData, notification_type: "dismiss_ping" },
              }
            )
              .then((response) => console.log(response.data))
              .catch((err) => console.log(err));
          }

          setSelectedSession(_selectedSession);
          setIsChatOpen(true);
          setTimeout(() => setOpenBlazeCall(true), 1000);
        }
      })
  }, [ongoingSessions]);

  useEffect(() => {
    if(user?.uid) {
      let unsubscribe = setActiveStudentCall();
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const setActiveStudentCall = () => {
    return getStudentActiveSessionDetails({
      studentId: user?.uid,
      callback: (data) => {
        if (data)
          setStudentActivity({
            isEngaged: data?.is_engaged,
            meetingId: data?.active_call_id,
            sessionId: data?.active_call_session_id,
            pendingRatingList: data?.pending_rating_list,
            refundCount: data?.refund_count,
            sessionCount: data?.session_count,
          });
      },
    });
  };

  const handleRatingModalClose = () => {
    setOpenRatingModal(false);
    if (ratingDetails?.pending) setHasRatedBlazeSession(true);

    setSessionRating(0);
  };

  const changeRating = (rating) => {
    setSessionRating(rating);
    navigator && navigator.vibrate && navigator.vibrate(5);
  };

  const handleCompleteSession = async () => {
    handleRatingModalClose();
    setUpdatingRating(true);

    const docRef = db
      .collection("blaze_dev")
      .doc("collections")
      .collection("blaze_sessions")
      .doc(ratingDetails?.session_id);

    const snapshot = await docRef.get();

    if(snapshot.exists) {
      const d = snapshot.data();
      if(d.rating) {
        showSnackbar('Session was already rated.');
        setUpdatingRating(false);
        return;
      }
    }

    setShowLottie(true);

    let timeStamp = +(await fetchIndianTime());

    let sessionEndHandler = functions.httpsCallable("sessionEndHandler");

    setTimeout(async () => {
      await endSession({
        sessionId: ratingDetails?.session_id,
        completedTs: !ratingDetails?.pending ? timeStamp : null,
        ratingTs: timeStamp,
        rating: sessionRating,
        studentId: user?.uid,
        instructorId: ratingDetails?.instructor_id,
        instructorName: ratingDetails?.instructor_name,
        instructorProfilePic: ratingDetails?.instructor_profile_pic,
        skill: ratingDetails?.skill,
        topic: ratingDetails?.topic,
      });

      if (!ratingDetails?.pending) {
        await sessionEndHandler({
          student_id: user?.uid,
          instructor_id: ratingDetails?.instructor_id,
          session_end_time: timeStamp,
        });
      }

      let sessionToSelect = ratingDetails?.session_id;

      // Select the latest session according to the session status.
      if(ongoingSessions.length > 0 && !(ongoingSessions.length === 1 && ongoingSessions[0].id === ratingDetails?.session_id)) {
        if(ongoingSessions[0].id === ratingDetails?.session_id) sessionToSelect = ongoingSessions[1].id;
        else sessionToSelect = ongoingSessions[0].id;
      } else if(requestedSessions.length > 0 && !(requestedSessions.length === 1 && requestedSessions[0].id === ratingDetails?.session_id)) {
        if(requestedSessions[0].id === ratingDetails?.session_id) sessionToSelect = requestedSessions[1].id;
        else sessionToSelect = requestedSessions[0].id;
      }

      console.log('ongoingSessions, requestedSessions - ', ongoingSessions, requestedSessions);

      history.push('/blaze/chat/' + sessionToSelect);

      setTimeout(() => setUpdatingRating(false), 250);
      setTimeout(() => setShowLottie(false), 500);
    }, 250);
  };

  const getPendingSessionRatingList = async () => {
    const pendingList = studentActivity?.pendingRatingList;

    if (pendingList?.length > 0) {
      let _session = pendingList[pendingList?.length - 1];

      const instructorRating = await getInstructorRatings({
        instructorId: _session?.instructor_id,
      });

      setRatingDetails({
        instructor_id: _session?.instructor_id,
        instructor_name: _session?.instructor_name,
        instructor_profile_pic: _session?.instructor_profile_pic,
        instructor_rating: instructorRating,
        session_id: _session?.session_id,
        topic: _session?.topic,
        skill: _session?.skill,
        pending: true,
      });

      setOpenRatingModal("pending");
    } else {
      setRatingDetails(null);
      setOpenRatingModal(false);
    }
  };

  const openSessionPendingRating = async () => {
    const pendingList = studentActivity?.pendingRatingList;

    if (pendingList?.length > 0) {
      let _session = pendingList?.filter(
        (item) => item.session_id === selectedSession?.id
      )[0];

      if (!_session) return;

      const instructorRating = await getInstructorRatings({
        instructorId: _session?.instructor_id,
      });

      setRatingDetails({
        instructor_id: _session?.instructor_id,
        instructor_name: _session?.instructor_name,
        instructor_profile_pic: _session?.instructor_profile_pic,
        instructor_rating: instructorRating,
        session_id: _session?.session_id,
        topic: _session?.topic,
        skill: _session?.skill,
        pending: true,
      });

      setOpenRatingModal("pending");
    } else {
      setRatingDetails(null);
      setOpenRatingModal(false);
    }
  };

  useEffect(() => {
    if (!hasRatedBlazeSession && studentActivity?.pendingRatingList) {
      getPendingSessionRatingList();
    } else
    if (selectedSession?.id && studentActivity?.pendingRatingList) {
      openSessionPendingRating();
    }
  }, [
    hasRatedBlazeSession,
    studentActivity?.pendingRatingList,
    selectedSession?.id,
  ]);

  const getSubject = (arr) => {
    let sub = "";
    arr.map((w) => (sub = sub + " " + w));
    return sub.slice(1);
  };

  const subjectName = (skill) => {
    let splitted = skill?.split("_");

    if (splitted?.length > 0) {
      return splitted.length === 3
        ? splitted[2]
        : getSubject(splitted.slice(3));
    }
  };

  return (
    <>
      {isLoading && (
        <div
          style={{
            width: "100%",
            display: "grid",
            placeItems: "center",
            height: "calc(100vh - var(--header-height))",
          }}
        >
          <div className="blaze__loader">
            <Lottie options={{ animationData: circularProgress, loop: true }} />
          </div>
        </div>
      )}
      {!isLoading && (
        <section className="blaze__page">
          <Helmet>
            <meta charSet="utf-8" />
            <title>
              Blaze{" "}
              {selectedSession?.topic ? " | " + selectedSession?.topic : ""}
            </title>
          </Helmet>
          <div className="row">
            {(isSmallScreen ? !isChatOpen : true) && (
              <div className="blaze__sidebar__wrapper">
                <BlazeSidebar
                  setSelectedSession={setSelectedSession}
                  setSelectedSessionId={setSelectedSessionId}
                  sessionSelected={selectedSession}
                  requestedSessions={requestedSessions}
                  targetedItem={targetedItem}
                  ongoingSessions={ongoingSessions}
                  initialized={initialized}
                  completedSessions={completedSessions}
                  openPopUp={() => setIsPopupOpen(true)}
                  closeDrawer={() => null}
                  setIsChatOpen={setIsChatOpen}
                  chaptersMeta={chaptersMeta}
                  fetchMoreCompletedSessions={fetchMoreCompletedSessions}
                  noMoreCompletedSessions={noMoreCompletedSessions}
                  moreCompletedSessions={moreCompletedSessions}
                />
              </div>
            )}

            {(isSmallScreen ? isChatOpen : true) && (
              <div className="col col-md-12 col-xs-12" id="blaze__content">
                {!showBlazeMain && selectedSession ? (
                  <BlazeReservations
                    currentReservation={selectedSession}
                    setIsChatOpen={setIsChatOpen}
                    chaptersMeta={chaptersMeta}
                    key={selectedSession?.id}
                  />
                ) : (
                  <BlazeLanding openPopUp={() => setIsPopupOpen(true)} />
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {openPustackCare && (
        <div className="pustack-care-chat">
          <PuStackCare />
        </div>
      )}
      {!openPustackCare && unreadCareMsgCount > 0 && <PuStackCareChatPopup />}

      <BlazeBookingPopup
        isOpen={isPopupOpen}
        handleClose={() => setIsPopupOpen(false)}
      />

      {isTabletScreen && <Hidden xsDown implementation="js">
        <Drawer
          variant="temporary"
          open={props.isMobileOpen}
          onClose={props.handleDrawerToggle}
          ModalProps={{keepMounted: true}}
        >
          <BlazeSidebar
            setSelectedSession={setSelectedSession}
            setSelectedSessionId={setSelectedSessionId}
            sessionSelected={selectedSession}
            requestedSessions={requestedSessions}
            ongoingSessions={ongoingSessions}
            completedSessions={completedSessions}
            targetedItem={targetedItem}
            initialized={initialized}
            openPopUp={() => setIsPopupOpen(true)}
            closeDrawer={props.handleDrawerToggle}
            setIsChatOpen={setIsChatOpen}
            chaptersMeta={chaptersMeta}
            fetchMoreCompletedSessions={fetchMoreCompletedSessions}
            noMoreCompletedSessions={noMoreCompletedSessions}
            moreCompletedSessions={moreCompletedSessions}
          />
        </Drawer>
      </Hidden>}
      {showLottie && (
        <div
          className={
            updatingRating
              ? "updating-rating fadeIn"
              : "updating-rating fadeOut"
          }
        >
          <div className="updated-lottie">
            <Lottie
              options={{
                animationData: updatedRatingLottie,
                loop: false,
              }}
            />
          </div>
        </div>
      )}
      {!isSmallScreen ? (
        <Modal
          ariaHideApp={false}
          shouldCloseOnEsc={true}
          isOpen={openRatingModal}
          // isOpen={true}
          shouldCloseOnOverlayClick={true}
          onRequestClose={handleRatingModalClose}
          overlayClassName="new-post-modal-overlay"
          className={isDark ? "rate-session-modal dark" : "rate-session-modal"}
        >
          <div className="rate-session fadeIn">
            <h1>Rate Your Session</h1>{" "}
            <Cancel className="close-rating" onClick={handleRatingModalClose} />
            <h2>{ratingDetails?.topic}</h2>
            <div className="instructor-details">
              <div className="instructor-inner">
                <div className="instructor-img">
                  <img
                    src={ratingDetails?.instructor_profile_pic}
                    className="image__instructor"
                  />
                  <img
                    src={verfifiedCheck}
                    alt="v"
                    className="image__verified"
                  />
                </div>

                <section>
                  <div>
                    <h4>{ratingDetails?.instructor_name}</h4>

                    <p>
                      <StarRatings
                        name="rating"
                        rating={1}
                        starSpacing="2px"
                        numberOfStars={1}
                        starDimension="20px"
                        svgIconPath={starPath}
                        starRatedColor="#fec107"
                        starHoverColor="#fec107"
                        svgIconViewBox="0 0 207.802 207.748"
                      />{" "}
                      {ratingDetails?.instructor_rating}
                    </p>
                  </div>
                  <h6>
                    PuStack{" "}
                    {subjectName(ratingDetails?.skill) === "maths"
                      ? "Mathematics"
                      : subjectName(ratingDetails?.skill)}{" "}
                    Expert
                  </h6>
                </section>
              </div>
            </div>
            <StarRatings
              name="rating"
              numberOfStars={5}
              starSpacing="7.5px"
              starDimension="32px"
              rating={sessionRating}
              svgIconPath={starPath}
              starRatedColor="#fec107"
              starHoverColor="#fec107"
              svgIconViewBox="0 0 207.802 207.748"
              changeRating={changeRating}
            />
            <button
              disabled={sessionRating === 0}
              onClick={handleCompleteSession}
            >
              {openRatingModal === 'pending' ? 'Rate Session' : 'End Session'}
            </button>
          </div>
        </Modal>
      ) : (
        <SwipeableDrawer
          variant="temporary"
          open={openRatingModal}
          anchor="bottom"
          onClose={() => {
            handleRatingModalClose();
            navigator && navigator.vibrate && navigator.vibrate(5);
          }}
          className={
            isDark ? "blaze-rating-bottom dark" : "blaze-rating-bottom"
          }
          ModalProps={{ keepMounted: true }}
        >
          <div className="rating-wrapper">
            <h5 />
            <h4>Rate Your Session</h4>
            <Cancel
              className="close-info"
              onClick={() => {
                handleRatingModalClose();
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
            />
            <h2>{ratingDetails?.topic}</h2>

            <div className="rating-content">
              <div className="instructor-details">
                <div className="instructor-inner">
                  <div className="instructor-img">
                    <img
                      src={ratingDetails?.instructor_profile_pic}
                      className="image__instructor"
                    />
                    <img
                      src={verfifiedCheck}
                      alt="v"
                      className="image__verified"
                    />
                  </div>

                  <section>
                    <div>
                      <h4>{ratingDetails?.instructor_name}</h4>
                      <p>
                        <StarRatings
                          name="rating"
                          rating={1}
                          starSpacing="2px"
                          numberOfStars={1}
                          starDimension="20px"
                          svgIconPath={starPath}
                          starRatedColor="#fec107"
                          starHoverColor="#fec107"
                          svgIconViewBox="0 0 207.802 207.748"
                        />{" "}
                        {ratingDetails?.instructor_rating}
                      </p>
                    </div>
                    <h6>
                      PuStack{" "}
                      {subjectName(ratingDetails?.skill) === "maths"
                        ? "Mathematics"
                        : subjectName(ratingDetails?.skill)}{" "}
                      Expert
                    </h6>
                  </section>
                </div>
              </div>

              <div className="rating-stars">
                <StarRatings
                  name="rating"
                  numberOfStars={5}
                  starSpacing="7.5px"
                  starDimension="32px"
                  rating={sessionRating}
                  svgIconPath={starPath}
                  starRatedColor="#fec107"
                  starHoverColor="#fec107"
                  svgIconViewBox="0 0 207.802 207.748"
                  changeRating={changeRating}
                />
              </div>
            </div>
            <button
              onClick={() => {
                handleRatingModalClose();
                navigator && navigator.vibrate && navigator.vibrate(5);
                handleCompleteSession();
              }}
              disabled={sessionRating === 0}
            >
              {openRatingModal === 'pending' ? 'Rate Session' : 'End Session'}
            </button>
          </div>
        </SwipeableDrawer>
      )}
    </>
  );
}
