import React, {useEffect, useState, useContext, useRef, useCallback} from "react";
import Modal from "react-modal";
import Lottie from "lottie-react-web";
import AgoraRTC from "agora-rtc-sdk-ng";
import useAgora from "./hooks/useAgora";
import MediaPlayer from "./mediaPlayer";
import MicIcon from "@material-ui/icons/Mic";
import CloseIcon from "@material-ui/icons/Close";
import { useMediaQuery } from "react-responsive";
import MicOffIcon from "@material-ui/icons/MicOff";
import { ReservationChats } from "../../components";
import { TextareaAutosize } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import joinedCall from "../..//assets/sounds/join_call.mp3";
import BlazeLogo from "../../assets/images/pustackBlazeLogo.png";
import CallEndRoundedIcon from "@material-ui/icons/CallEndRounded";
import callDisconnected from "../..//assets/sounds/call_disconnected.mp3";
import {UserContext, ThemeContext, BlazeSessionContext, PustackProContext} from "../../context";

import {
  sendBlazeChat,
  listenToCallDoc,
  cancelOnDisconnect,
  updateCallDocument,
  markUserBlazeOffline,
  updateStudentEngagement,
  completeHandoverStudent,
  updateUserBlazeAvailability,
} from "../../database";
import {
  agoraAppID,
  makeUniqueNumericId,
  formatBillDuration,
  showSnackbar,
  getGrade, fetchIndianTime, starPath,
} from "../../helpers";

import { circularProgress } from "../../assets";
import SendIcon from "../../assets/blaze/sendIcon";
import imageGallery from "../../assets/images/blaze/imageGallery.svg";
import { updateInstructorStatus } from "../../database/blazeExternal";
import "./call.scss";
import useTimer from "../../hooks/timer";
import {db, rdb} from "../../firebase_config";
import {formatDateDoc} from "../../database/livesessions/sessions";
import {Link} from "react-router-dom";
import roundedVideoCamera from "../../assets/blaze/rounded_video_camera.svg";
import verfifiedCheck from "../../assets/images/icons/verified.png";
import unAssigned from "../../assets/images/unassigned.png";
import searchInstructor from "../../assets/lottie/searching_instructor.json";
import StarRatings from "react-star-ratings";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import {CloseRounded} from "@material-ui/icons";
import {usedMinutesForToday} from "../../database/blaze/fetch-data";
import {database} from "firebase";

const client = AgoraRTC.createClient({ codec: "h264", mode: "rtc" });

function BlazeStudentCall({
                            closeModal,
                            chatData,
                            currentReservation,
                            moreChat,
                            getMoreChatsFn,
                          }) {
  const [user] = useContext(UserContext).user;
  const [isProTier] = useContext(UserContext).tier;
  const [isDark] = useContext(ThemeContext).theme;
  const [pushyData] = useContext(UserContext).pushyData;
  const [callStartTs, setCallStartTs] =
    useContext(BlazeSessionContext).callStartTs;
  const [openChat, setOpenChat] = useContext(BlazeSessionContext).openChat;
  const [_, setShowWarning] = useContext(PustackProContext).warning;
  const [, setIsOpen] = useContext(PustackProContext).value;

  const [appid] = useState(agoraAppID);
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);

  const [animate, setAnimate] = useState(false);
  const [canHandover, setCanHandover] = useState(false);
  const [makeTransition, setMakeTransition] = useState(false);
  const [openEndCallModal, setOpenEndCallModal] = useState(false);
  const [isCallDocUpdated, setIsCallDocUpdated] = useState(false);
  const [instructorPlatform, setInstructorPlatform] = useState("");

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatText, setChatText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [leavingCall, setLeavingCall] = useState(false);
  const [showWarningForGracePeriod, setShowWarningForGracePeriod] = useState(false);
  const [warningViewed, setWarningViewed] = useState(false);

  const [billDuration, setBillDuration] = useState(0);
  const [billInterval, setBillInterval] = useState(null);
  const [balanceLeft, setBalanceLeft] = useState(null);
  const [hasStudentEngaged, setHasStudentEngaged] = useState(false);

  const [gracePeriodExceeded, setGracePeriodExceeded] = useState(false);

  const changeRef = useRef(true);
  const displayedWarning = useRef(false);

  const [timer, clearTimer] = useTimer(10000);

  const {
    join,
    leave,
    joinState,
    remoteUsers,
    toggleAudio,
    toggleVideo,
    localVideoTrack,
  } = useAgora(client);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    if(pushyData && remoteUsers?.length > 0) {
      const docRef = db.collection('/blaze_dev/collections/blaze_sessions/' + pushyData.session_id + '/calls').doc(pushyData.meeting_id)
      // const
      fetchIndianTime()
        .then(ist => {
          docRef
            .get()
            .then(snapshot => {
              if(snapshot.exists) {
                const data = snapshot.data();
                if(data.call_start_ts) {
                  setCallStartTs(data.call_start_ts);
                } else {
                  docRef.set({
                    call_start_ts: +ist
                  }, {merge: true})
                    .then(() => {
                      setCallStartTs(+ist);
                    })
                }
              }
            })
            .catch(console.log);
        })
    }
  }, [pushyData, remoteUsers]);

  useEffect(() => {
    // if(balanceLeft === null) return;
    //
    // if(balanceLeft > 600) {
    //
    // }

    let _uid = makeUniqueNumericId(5);

    const channel = pushyData.meeting_id;
    const token = pushyData.rtm_token;

    console.log('pushyData - ', pushyData);

    join(appid, channel, token, _uid, () => {
      // setHasStudentEngaged(true);
    });

    async function markOnline() {
      console.log('Running this when coming online - ', pushyData.session_id, channel);
      await rdb
        .ref(`/sessions/${pushyData.session_id}/calls/${channel}`)
        .update({
          call_end_ts: null
        })

      rdb
        .ref(`/sessions/${pushyData.session_id}/calls/${channel}/student`)
        .update({
          uid: user?.uid,
          platform: 'web',
          is_web_online: true,
          last_seen: database.ServerValue.TIMESTAMP,
        })
        .catch((err) => console.log({ err }));
    }

    window.addEventListener('online', markOnline);

    return () => {
      window.removeEventListener('online', markOnline)
    }

  }, [pushyData]);

  // useEffect(() => {
  //   if (
  //     !joinState &&
  //     !studentActivity?.isEngaged &&
  //     studentActivity &&
  //     !hasStudentEngaged
  //   ) {
  //     toggleVideo(false);
  //     leave();
  //     showSnackbar("Couldn't connect with the server", "info");
  //     closeModal();
  //     window.history.replaceState(
  //       null,
  //       pushyData?.session_id,
  //       `/blaze/chat/${pushyData?.session_id}`
  //     );
  //   }
  // }, [joinState, studentActivity?.isEngaged, hasStudentEngaged]);


  useEffect(() => {
    if (joinState) {
      // toggleVideo(false);
      !callStartTs && updateCallDocumentFn();
    }
  }, [joinState]);

  useEffect(() => {
    if (isCallDocUpdated) {
      if (callStartTs) {
        async function fn() {
          await new Promise(res => setTimeout(res, 1000));
          return listenToCallDocFn()
        }
        let promise = fn();
        return () => {
          promise
            .then(unsubscribe => unsubscribe())
            .catch(console.log)
        }
      } else {
        let unsubscribe = listenToCallDocFn();
        return () => unsubscribe();
      }
    }
  }, [isCallDocUpdated]);

  useEffect(() => {
    console.log('callStartTs - ', callStartTs);
    if (callStartTs) {
      setHasStudentEngaged(true);
      setIsCallDocUpdated(true);
      setBillDuration(Math.round((+new Date() - callStartTs) / 1000));
    }
  }, [callStartTs]);

  useEffect(() => {
    return () => {
      setCallStartTs(null);
      setHasStudentEngaged(false);
      setIsCallDocUpdated(false);
      setCanHandover(false);
    };
  }, []);

  const updateInstructorStatusFn = async ({
                                            isEngaged,
                                            instructorId,
                                            activeCallId,
                                            activeSessionId,
                                          }) => {
    updateInstructorStatus({
      isEngaged,
      instructorId,
      activeCallId,
      activeSessionId,
    });
  };

  useEffect(() => {
    handoverFn();
  }, [canHandover]);

  const handoverFn = async () => {
    if (!canHandover) return;

    const res = await completeHandoverStudent({
      sessionId: pushyData?.session_id,
      meetingId: pushyData?.meeting_id,
    });

    cancelOnDisconnect({
      sessionId: pushyData?.session_id,
      userType: "student",
      callId: pushyData?.meeting_id,
    });

    if (!res) return;

    console.log('leaving from here --- 245')
    leave();
    closeModal();
  };

  const updateCallDocumentFn = async () => {
    const isUpdated = await updateCallDocument({
      sessionId: pushyData?.session_id,
      meetingId: pushyData?.meeting_id,
      status: "engaged",
      duration: billDuration,
      platform: isSmallScreen ? "mweb" : "web",
    });

    // setHasStudentEngaged(true);

    let joinedPing = new Audio(joinedCall);
    joinedPing.play();

    setIsCallDocUpdated(isUpdated);

    updateUserBlazeAvailability({
      userId: user?.uid,
      userType: "student",
      callId: pushyData?.meeting_id,
      sessionId: pushyData?.session_id,
      callStartTs,
    });
  };

  const listenToCallDocFn = () => {
    return listenToCallDoc({
      sessionId: pushyData?.session_id,
      meetingId: pushyData?.meeting_id,
      callback: (call, unsubscribe) => {
        setInstructorPlatform(call?.instructor_platform);

        if (call?.status === "disconnected_by_instructor") {

          console.log('leaving from here --- 284')
          leave();

          closeModal();
          window.history.replaceState(
            null,
            pushyData?.session_id,
            `/blaze/chat/${pushyData?.session_id}`
          );
          unsubscribe();
        }

        if (call?.status === "handover_student") {
          setCanHandover(true);
        }

        if (call?.status === "rejected_by_student") {

          console.log('leaving from here --- 302')
          leave();
          unsubscribe();
          closeModal();
        }

        if (call?.status === "completed") {
          setLeavingCall(true);
          unsubscribe();
        }
      },
    });
  };

  useEffect(() => {
    if (leavingCall) {
      cancelOnDisconnect({
        sessionId: pushyData?.session_id,
        userType: "student",
        callId: pushyData?.meeting_id,
      });
      updateInstructorStatusFn({
        isEngaged: false,
        instructorId: pushyData?.instructor_id,
        activeCallId: null,
        activeSessionId: null,
      });
      setCallStartTs(null);
      leaveCall(billDuration, "disconnected_by_student");
    }
  }, [leavingCall]);

  const  leaveCall = async (billDuration, reason, notMounted) => {
    let audio = new Audio(callDisconnected);
    audio.play();

    if(!notMounted) setOpenEndCallModal(false);

    const res = await updateCallDocument({
      sessionId: pushyData?.session_id,
      meetingId: pushyData?.meeting_id,
      status: "completed",
      duration: billDuration,
      reason: reason,
      platform: isSmallScreen ? "mweb" : "web",
    });

    markUserBlazeOffline({
      userId: user?.uid,
      sessionId: pushyData?.session_id,
      userType: "student",
      callId: pushyData?.meeting_id,
    });

    updateStudentEngagement({
      studentId: user?.uid,
      activeCallId: null,
      activeSessionId: null,
      isEngaged: false,
    });

    await rdb
      .ref(`/sessions/${pushyData?.session_id}/calls/${pushyData?.meeting_id}`)
      .update({
        call_end_ts: new Date().getTime()
      });

    console.log('new Date() - ', +new Date());

    if(notMounted) return;

      if (res) {

      console.log('leaving from here --- 364')
      leave();
      closeModal();
      setCallStartTs(null);

      window.history.replaceState(
        null,
        pushyData?.session_id,
        `/blaze/chat/${pushyData?.session_id}`
      );
    }
  };

  const handleOpenChat = () => {
    setAnimate(true);
    setMakeTransition(!makeTransition);
    openChat ? setTimeout(() => setOpenChat(false), 300) : setOpenChat(true);
  };

  const handleMessageSubmit = async () => {
    setIsSending(true);
    setChatText("");
    await sendBlazeChat({
      user: user,
      text: chatText,
      reference: currentReservation?.reference,
      images: images,
      session_id: currentReservation?.id,
      receiver_id: currentReservation?.instructor_id,
      student_grade: getGrade(currentReservation?.skill),
      type: images.length > 0 ? "attachment" : "text",
    });
    setImages([]);
    setChatText("");
    setIsSending(false);
  };

  const imageSelectionHandler = (e) => {
    const { files } = e.target;

    let _images = [];

    let _num =
      files.length + images.length > 1
        ? images.length - files.length > 0
          ? images.length - files.length
          : 1
        : files.length;

    if (files.length + images.length > 1) {
      setMessage("Only 1 image is allowed at a time");
      setOpenSnack(true);
      setTimeout(() => setOpenSnack(false), 2500);
    }

    if (images.length !== 1) {
      for (let i = 0; i < _num; i++) {
        _images[i] = {
          url: URL.createObjectURL(files[i]),
          ext: files[i].name.split(".").slice(-1)[0],
          name: files[i].name,
        };
      }
      setImages(images.concat(_images));
    }
    e.target.value = "";
  };

  const handleImageDelete = () => {
    setImages([]);
  };

  const remainingMinutes = useCallback(async () => {
    if(!joinState || !user) return;
    const usedMinutes = await usedMinutesForToday(user?.uid);
    // if(!usedMinutes) return;

    setWarningViewed(false);
    setBalanceLeft(usedMinutes);
  }, [joinState, user]);

  function billDurationIncrement() {
    setBillDuration((duration) => duration + 1);
    console.log('bill duration - set', billDuration);
    setBalanceLeft((balance) => balance + 1);
  }

  useEffect(() => {
    // if(isProTier) {
      // clearTimer(billInterval);
      // return;
    // }
    let timer, a;
    if (hasStudentEngaged) {
      a = remainingMinutes();
      a.then(() => {
        timer = setInterval(() => billDurationIncrement(), 1000);
        setBillInterval(timer);
      })
    } else {
      a = new Promise(() => {});
      clearInterval(billInterval);
    }

    return () => {
      a.then(() => {
        clearInterval(timer);
      })
    }
  }, [hasStudentEngaged, remainingMinutes, isProTier]);

  useEffect(() => {
    console.log(isProTier, balanceLeft, warningViewed);
    if(isProTier) return;
    if (balanceLeft >= 480 && balanceLeft < 600 && !warningViewed) {
      setShowWarningForGracePeriod(true);
      displayedWarning.current = true;
      setWarningViewed(true);
    }

    if (balanceLeft >= 600) {
      console.log('balanceLeft - ', balanceLeft);
      showSnackbar("You have exhausted the grace period", "info");

      leaveCall(billDuration, "student_grace_exceeded").then(() => {
        cancelOnDisconnect({
          sessionId: pushyData?.session_id,
          userType: "student",
          callId: pushyData?.meeting_id,
        });

        setShowWarning({Content: (
            <>
              <h2>Daily Limit Reached</h2>
              <p>Join Pro to get unlimited access and much more.</p>
            </>
          )});
        setGracePeriodExceeded(true);
      })
    }
  }, [balanceLeft, warningViewed, isProTier]);

  return (
    <div className="call">
      <div
        className={
          animate &&
          (makeTransition
            ? "call__blaze__wrapper keep__aside"
            : "call__blaze__wrapper")
        }
      >
        {!hasStudentEngaged && (
          <div className="call_loading">
            <Lottie options={{ animationData: circularProgress, loop: true }} />
          </div>
        )}
        <div className="player-container">
          <div className="call__blaze__head">
            <img
              src={BlazeLogo}
              alt="blaze"
              className="call__blaze__logo"
              draggable={false}
            />
          </div>
          <div className="local-player-wrapper">
            {remoteUsers.slice(0, 1).map((user) => (
              <>
                {user.videoTrack ? (
                  <MediaPlayer
                    videoTrack={user.videoTrack}
                    audioTrack={user.audioTrack}
                    type="main"
                    platform={instructorPlatform}
                  />
                ) : (
                  <div className="main__video__bg">
                    <img
                      src={currentReservation?.instructor_profile_pic}
                      alt="main bg"
                      className="main__bg"
                    />
                    <img
                      src={currentReservation?.instructor_profile_pic}
                      alt="main"
                      className="main__placeholder"
                    />
                  </div>
                )}
                <div className="instructor__mic">
                  {user?.hasAudio ? <MicIcon /> : <MicOffIcon />}
                </div>
              </>
            ))}
          </div>
        </div>
        <div className="student-container">
          <div className="remote-player-wrapper">
            {video ? (
              <MediaPlayer
                videoTrack={localVideoTrack}
                type="student"
                platform={null}
              />
            ) : (
              <div className="student__video__bg">
                <img
                  src={user?.profile_url}
                  alt="student bg"
                  className="student__bg"
                />
                <img
                  src={user?.profile_url}
                  alt="student"
                  className="student__placeholder"
                />
              </div>
            )}
            {joinState && (
              <div className="student__mic">
                {audio ? <MicIcon /> : <MicOffIcon />}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="button-group">
        <div className="bill-duration">
          <p>{formatBillDuration(billDuration)}</p>
        </div>
        {joinState && (
          <div>
            <button
              className={makeTransition ? "chat-icon on" : "chat-icon"}
              onClick={handleOpenChat}
            >
              {currentReservation?.student_unread_count > 0 && (
                <div className="unread-dot" />
              )}
              <ChatBubbleIcon />
            </button>
            <button
              onClick={() => {
                toggleVideo(!video);
                setVideo(!video);
              }}
              className={!video ? "off" : "on"}
            >
              {!video ? <VideocamOffIcon /> : <VideocamIcon />}
            </button>
            <button
              onClick={() => {
                toggleAudio(!audio);
                setAudio(!audio);
              }}
              className={!audio ? "off" : "on"}
            >
              {!audio ? <MicOffIcon /> : <MicIcon />}
            </button>

            <button
              id="leave"
              type="button"
              className="leave-btn"
              onClick={() => setOpenEndCallModal(true)}
            >
              <CallEndRoundedIcon />
            </button>
          </div>
        )}
      </div>
      <div
        className={
          animate &&
          (makeTransition
            ? "chat-messages slideInside"
            : "chat-messages slideOutside")
        }
      >
        {openChat && chatData && (
          <>
            <div className="chat-messages-head">
              <h1>In-session messages</h1>{" "}
              <CloseIcon onClick={handleOpenChat} />
            </div>
            <ReservationChats
              chats={chatData}
              moreChat={moreChat}
              getMoreChatsFn={getMoreChatsFn}
              currentReservation={currentReservation}
            />
            <div className="blaze__chat__image__preview fadeOutDown">
              {images.length > 0 &&
                images.map((image, i) => (
                  <div className="image__preview">
                    <CloseIcon
                      onClick={handleImageDelete}
                      className="imagePreviewDialog_closeIcon"
                    />
                    <img src={image.url} alt="X" />
                  </div>
                ))}
            </div>
            <div className="user__chat__input">
              <div
                className={
                  isDark ? "blaze__image__picker dark" : "blaze__image__picker"
                }
              >
                <label htmlFor="blaze-image-picker-student">
                  <div>
                    <img
                      className="blaze__input__image"
                      style={{ color: "rgb(68, 189, 96)", cursor: "cursor" }}
                      src={imageGallery}
                      alt="chatImageInput"
                    />
                  </div>
                </label>
                <input
                  accept="image/*"
                  type="file"
                  id="blaze-image-picker-student"
                  style={{ display: "none" }}
                  onChange={imageSelectionHandler}
                />
              </div>

              <div className="textarea__wrapper">
                <TextareaAutosize
                  className="livesession__commentSectionInput blazeres__input"
                  rowsMax={chatText === "" ? 1 : 4}
                  aria-label="maximum height"
                  autoFocus
                  value={chatText}
                  placeholder={"Type your doubt here ..."}
                  disabled={images.length > 0}
                  onChange={(event) =>
                    changeRef.current && setChatText(event.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      (chatText.trim() !== "" || images.length !== 0)
                    ) {
                      changeRef.current = false;
                      handleMessageSubmit();
                    } else {
                      changeRef.current = true;
                    }
                  }}
                />
              </div>
              <button
                onClick={handleMessageSubmit}
                className="livesession__commentSectionButton blazeres__btn"
                disabled={chatText.trim() === "" && images.length === 0}
                aria-label="blazeres__btn"
              >
                {isSending ? (
                  <div className="circular__progress__lottie">
                    <Lottie
                      options={{ animationData: circularProgress, loop: true }}
                    />
                  </div>
                ) : (
                  <SendIcon
                    className="blaze-send-icon"
                    color={
                      chatText.trim() === "" && images.length === 0
                        ? "grey"
                        : "var(--color-highlight)"
                    }
                  />
                )}
              </button>
            </div>
          </>
        )}
      </div>
      <Modal
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        onRequestClose={() => setOpenEndCallModal(false)}
        ariaHideApp={false}
        overlayClassName="new-post-modal-overlay"
        isOpen={openEndCallModal}
        className={isDark ? "end__call dark" : "end__call"}
      >
        <div>
          <div>
            <button
              aria-label="end-call"
              className="yes__btn"
              onClick={() => setLeavingCall(true)}
            >
              End Call
            </button>
            <button
              className="no__btn"
              onClick={() => setOpenEndCallModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>


      {showWarningForGracePeriod && <div
        className="blaze-card join-pro-modal fadeIn"
        onClick={() => {
          // onClick();
          // setInstructorRating(rating);
        }}
      >
        <CloseRounded onClick={() => {
          setShowWarningForGracePeriod(false);
        }} style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '0.8em',
          height: '0.8em',
          cursor: 'pointer',
          zIndex: 3
        }}/>
        {/*<div className="blaze-card-bg"/>*/}
        <div className={"blaze-card-content"}>
          {/*<div*/}
          {/*  className={`card-accepted`}*/}
          {/*  style={{*/}
          {/*    backgroundColor: 'rgb(251, 139, 35)',*/}
          {/*    boxShadow: `4px 0 14px 3px rgba(255, 221, 0, 0.5)`,*/}
          {/*  }}/>*/}
          <div className="blaze-card-inner">
            <h2>Daily Limit Reached</h2>
            <p>As a courtesy, we have given you 2 minutes more for free.</p>
            <button onClick={() => {
              // setShowWarning(false);
              setShowWarningForGracePeriod(false);
              setIsOpen(true)
            }}>Get Unlimited Access
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default BlazeStudentCall;

