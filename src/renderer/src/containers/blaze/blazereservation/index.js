import React, { useContext, useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import Lottie from "lottie-react-web";
import {Link, useHistory} from "react-router-dom";
import Menu from "@material-ui/core/Menu";
import Fade from "@material-ui/core/Fade";
import StarRatings from "react-star-ratings";
import CloseIcon from "@material-ui/icons/Close";
import { useMediaQuery } from "react-responsive";
import MenuItem from "@material-ui/core/MenuItem";
import Snackbar from "@material-ui/core/Snackbar";
import MoreVert from "@material-ui/icons/MoreVert";
import { TextareaAutosize } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import PictureAsPdfRoundedIcon from "@material-ui/icons/PictureAsPdfRounded";
import searchInstructor from "../../../assets/lottie/searching_instructor.json";

import {
  UserContext,
  ThemeContext,
  BlazeSessionContext, PustackProContext,
} from "../../../context";
import pdfIcon from "../../../assets/images/pdf.svg";
import BlazeStudentCall from "../../blazeStudentCall";
import SendIcon from "../../../assets/blaze/sendIcon";
import {fetchIndianTime, getGrade, showSnackbar, starPath} from "../../../helpers";
import noFilesIcon from "../../../assets/images/icons/no_files.svg";
import { ReservationChats, ModalGallery } from "../../../components";
import noImagesIcon from "../../../assets/images/icons/no_images.svg";
import verfifiedCheck from "../../../assets/images/icons/verified.png";
import imageGallery from "./../../../assets/images/blaze/imageGallery.svg";
import circularProgress from "../../../assets/lottie/circularProgress.json";
import { groupBlazeMessages, monthToStrFormat } from "../../../helpers";
import roundedVideoCamera from "../../../assets/blaze/rounded_video_camera.svg";
import {
  getRtmToken,
  sendBlazeChat,
  getCallDocument,
  startHandoverStudent,
  getInstructorRatings,
  getReceiverUnreadCount,
  getBlazeReservationChats,
  blazeDecreaseMessageCount,
  getMoreBlazeReservationChats,
  getLatestBlazeReservationChats,
  getDeviceTokens,
} from "../../../database";

import "./style.scss";
import {endSession, usedMinutesForToday} from "../../../database/blaze/fetch-data";

export default function BlazeReservations({
  currentReservation,
  setIsChatOpen,
}) {
  const history = useHistory();
  const [user] = useContext(UserContext).user;
  const [isProTier] = useContext(UserContext).tier;
  const [pushyData, setPushyData] = useContext(UserContext).pushyData;
  const [instructorRating] = useContext(BlazeSessionContext).instructorRating;
  const [openBlazeCall, setOpenBlazeCall] =
    useContext(UserContext).openBlazeCallModal;
  const [, setCallStartTs] = useContext(BlazeSessionContext).callStartTs;
  const [studentActivity] = useContext(BlazeSessionContext).studentActivity;
  const [openChat, setOpenChat] = useContext(BlazeSessionContext).openChat;
  const [ongoingSessions] = useContext(BlazeSessionContext).ongoingSessions;
  const [requestedSessions] = useContext(BlazeSessionContext).requestedSessions;

  const [isDark] = useContext(ThemeContext).theme;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [message, setMessage] = useState("");
  const [chatText, setChatText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [moreChat, setMoreChat] = useState(false);
  const [chatsData, setChatsData] = useState(null);
  const [openSnack, setOpenSnack] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatImages, setChatImages] = useState(null);
  const [openPickers, setOpenPickers] = useState(false);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [chatDocuments, setChatDocuments] = useState(null);
  const [receiverUnreadCount, setReceiverUnreadCount] = useState(0);

  const [currentSessionUnreadCount] =
    useContext(BlazeSessionContext).currentSessionUnreadCount;
  const [, setOpenRatingModal] =
    useContext(BlazeSessionContext).openRatingModal;
  const [, setRatingModalDetails] =
    useContext(BlazeSessionContext).ratingModalDetails;

  const changeRef = useRef(true);
  const pickerRef = useRef(null);
  const addBtnRef = useRef(null);

  const handleBlazeCallClose = () => {
    setOpenBlazeCall(false);
    setOpenChat(false);
  };
  const handleClick = (e) => setAnchorEl(e.currentTarget);

  const getSubject = (arr) => {
    let sub = "";
    arr.map((w) => (sub = sub + " " + w));
    return sub.slice(1);
  };

  const subjectName = (skill) => {
    let splitted = skill?.split("_");

    if (splitted.length > 0) {
      return splitted.length === 3
        ? splitted[2] === "maths"
          ? "Mathematics"
          : splitted[2]
        : getSubject(splitted.slice(3));
    }
  };

  const handleMessageSubmit = async () => {
    setIsSending(true);
    setChatText("");
    await sendBlazeChat({
      user: user,
      text: chatText,
      reference: currentReservation?.reference,
      images: images,
      pdfs: pdfs,
      session_id: currentReservation?.id,
      receiver_id: currentReservation?.instructor_id,
      student_grade: getGrade(currentReservation?.skill),
      type: images.length > 0 || pdfs.length > 0 ? "attachment" : "text",
    });
    setPdfs([]);
    setImages([]);
    setChatText("");
    setIsSending(false);
    changeRef.current = true;
  };

  useEffect(() => {
    if (chatsData?.length > 0 && !isSending) {
      let groupedMessages = [...chatsData];

      let selfMsgCount = 0;

      for (let i = 0; i < groupedMessages?.length; i++) {
        if (groupedMessages[i]?.isByUser) {
          selfMsgCount++;
        }
      }
      selfMsgCount = Math.abs(selfMsgCount - receiverUnreadCount);

      groupedMessages = groupedMessages.map((msg) => {
        if (msg?.isByUser && selfMsgCount > 0) {
          selfMsgCount--;
          msg["hasRead"] = true;
        } else if (msg?.isByUser && selfMsgCount === 0) {
          msg["hasRead"] = false;
        }
        return msg;
      });

      setChatsData(groupedMessages);
    }
  }, [
    receiverUnreadCount,
    chatsData?.length,
    currentReservation?.id,
    isSending,
  ]);

  const iterateMedia = (e) => {
    let _images = [];
    let _documents = [];

    e &&
      e.forEach((chat) => {
        if (chat?.type === "image") {
          _images.push({
            timestamp: new Date(chat?.timestamp),
            url: chat?.attachment?.url,
          });
        } else if (chat?.type === "document") {
          _documents.push({
            name: chat?.attachment?.name,
            timestamp: new Date(chat?.timestamp),
            url: chat?.attachment?.url,
          });
        }
      });

    setChatImages(_images);
    if (_documents.length !== chatDocuments?.length)
      setChatDocuments(_documents);
  };

  const getLatestChats = (chats) => {
    return getLatestBlazeReservationChats({
      reference: currentReservation?.reference,
      user_id: user?.uid,
      doc: chats[chats?.length - 1],
      callback: (e) => {
        iterateMedia([...(chats || []), ...e]);
        setChatsData(groupBlazeMessages([...(chats || []), ...e]));
      },
    });
  };

  const handleSnackClose = () => {
    setOpenSnack(false);
  };

  useEffect(() => {
    setPdfs([]);
    setImages([]);
    setChatText("");
    setChatsData(null);
    setOpenPickers(false);

    let promise = getChatsFn();
    return () => {
      promise.then(unsubscribe => {
        unsubscribe();
      }).catch(console.log)
    }
  }, [currentReservation?.id]);

  const onFocus = () => {
    setIsTabActive(true);
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
    if (currentReservation?.id && currentReservation?.instructor_id) {
      let unsubscribe = getReceiverUnreadCount({
        sessionId: currentReservation?.id,
        receiverId: currentReservation?.instructor_id,
        callback: (count) => setReceiverUnreadCount(count),
      });
      return () => unsubscribe();
    }
  }, [currentReservation?.id]);

  useEffect(() => {
    if (currentSessionUnreadCount > 0 && isTabActive && !openBlazeCall) {
      blazeDecreaseMessageCount(
        currentReservation?.reference,
        currentSessionUnreadCount,
        user?.grade,
        user?.uid,
        user?.is_external_instructor
      );
    }

    if (
      openChat &&
      openBlazeCall &&
      currentSessionUnreadCount > 0 &&
      isTabActive
    ) {
      blazeDecreaseMessageCount(
        currentReservation?.reference,
        currentSessionUnreadCount,
        user?.grade,
        user?.uid,
        user?.is_external_instructor
      );
    }
  }, [currentSessionUnreadCount, isTabActive, openBlazeCall, openChat]);

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
      setOpenPickers(false);
    }
    e.target.value = "";
  };

  const pdfSelectionHandler = (e) => {
    const { files } = e.target;

    let _pdfs = [];

    let _num =
      files.length + pdfs.length > 1
        ? pdfs.length - files.length > 0
          ? pdfs.length - files.length
          : 1
        : files.length;

    if (files.length + pdfs.length > 1) {
      setMessage("Only 1 pdf is allowed at a time");
      setOpenSnack(true);
      setTimeout(() => setOpenSnack(false), 2500);
    }

    if (pdfs.length !== 1) {
      for (let i = 0; i < _num; i++) {
        _pdfs[i] = {
          url: URL.createObjectURL(files[i]),
          ext: files[i].name.split(".").slice(-1)[0],
          name: files[i].name,
          size: parseFloat(files[i].size / 1024 / 1024).toFixed(2),
        };
      }
      setPdfs(pdfs.concat(_pdfs));
    }
    e.target.value = "";
    setOpenPickers(false);
  };

  const handleImageDelete = () => setImages([]);
  const handlePdfDelete = () => setPdfs([]);

  const isChattingDisabled = (status) => status === "completed";

  const titleCase = (str) => {
    var splitStr = str?.toLowerCase().split(" ");
    for (var i = 0; i < splitStr?.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr?.join(" ");
  };

  const getSubtitle = (skill) => {
    if (skill) {
      let splitted = skill.split("_");
      let sub = "";

      if (splitted?.length > 0) {
        sub =
          splitted?.length === 3 ? splitted[2] : getSubject(splitted.slice(3));
      }
      return titleCase(sub === "maths" ? "mathematics" : sub);
    }
  };

  const deleteNotification = async (rtmToken) => {
    const [webToken, androidToken] = await getDeviceTokens({
      studentId: currentReservation?.student_id,
    });
    const today = await fetchIndianTime();
    const sessionId = currentReservation?.session_id;

    const pingData = {
      notification_title: currentReservation?.instructor_name,
      notification_subtitle:
        "PuStack " + getSubtitle(currentReservation?.skill) + " Expert",
      missed_notification_title: "Missed Call",
      missed_notification_subtitle: "Open app to see details ",
      notification_brief: "Brief",
      notification_type: "dismiss_ping",
      instructor_id: user?.uid,
      instructor_name: user?.name,
      instructor_profile_picture: user?.profile_url,
      session_id: currentReservation?.id,
      student_id: currentReservation?.student_id,
      meeting_id: studentActivity?.meetingId,
      notification_id: null,
      deliver_ts: +today,
      rtm_token: rtmToken,
      student_mobile_token: androidToken,
      student_web_token: webToken,
      instructor_avg_rating: currentReservation?.instructor_rating,
    };

      fetch(
        "https://us-central1-avian-display-193502.cloudfunctions.net/acceptBlazeCall",
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            // student_web_token: null,
            // student_android_token: androidToken,
            // ping_data: pingData,
            // context: { auth: !!sessionId },
            ping_data: pingData,
            source_platform: 'web'
          }),
        }
      )
        .then(() => console.log("accepted"))
        .catch((err) => console.log(err));

  };

  const handleHandover = async () => {
    if(!isProTier) {
      const usedMinutes = await usedMinutesForToday(user?.uid);

      if(usedMinutes >= 600) {
        showSnackbar('You have exhausted all the free quota for today.', 'warning');

        // TODO: Refactor the code to rejectCall()
        const sessionId = currentReservation?.id;
        const today = await fetchIndianTime();
        const pingData = {
          session_id: currentReservation?.id,
          meeting_id: studentActivity?.meetingId,
          instructor_id: currentReservation?.instructor_id,
          notification_type: "dismiss_ping",
          deliver_ts: +today,
        };

          fetch(
            "https://us-central1-avian-display-193502.cloudfunctions.net/rejectBlazeCall",
            {
              method: "POST",
              mode: "cors",
              cache: "no-cache",
              credentials: "same-origin",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              referrerPolicy: "no-referrer",
              body: JSON.stringify({
                status: "rejected_by_student",
                student_web_token: null,
                student_mobile_token: pushyData?.student_mobile_token,
                ping_data: pingData,
                context: { auth: !!sessionId },
                source_platform: 'web'
              }),
            }
          )
            .then(() => console.log("rejected"))
            .catch((err) => console.log(err));
        return;
      }
    }

    const callDoc = await getCallDocument({
      sessionId: currentReservation?.id,
      meetingId: studentActivity?.meetingId,
    });

    let response = true;

    if(callDoc.student_platform === 'mobile') {
      response = await startHandoverStudent({
        sessionId: currentReservation?.id,
        meetingId: studentActivity?.meetingId,
        isSmallScreen: isSmallScreen,
      });
    }

    console.log('callDoc.call_start_ts - ', callDoc.call_start_ts);
    setCallStartTs(callDoc.call_start_ts);

    const rtmToken = await getRtmToken({ sessionId: currentReservation?.id });

    if (response && rtmToken) {
      await deleteNotification(rtmToken);
      setPushyData({
        session_id: currentReservation?.id,
        meeting_id: studentActivity?.meetingId,
        instructor_id: currentReservation?.instructor_id,
        rtm_token: rtmToken,
      });

      setOpenBlazeCall(true);
    }
  };

  const getChatsFn = async () => {
    let _data = await getBlazeReservationChats({
      reference: currentReservation?.reference,
      user_id: user?.uid,
    });

    if (_data?.length === 25) {
      setTimeout(() => setMoreChat(true), 500);
    } else {
      setMoreChat(false);
    }

    iterateMedia(_data);
    console.log('getChatsFn _data - ', _data);
    setChatsData(groupBlazeMessages(_data));
    return getLatestChats(_data);
  };

  const getMoreChatsFn = async (
    chats,
    setIsFetching,
    setAutoScroll,
    firstChild,
    fetchedLength
  ) => {
    let _data = await getMoreBlazeReservationChats({
      reference: currentReservation?.reference,
      user_id: user?.uid,
      doc: chats[0],
    });

    if (_data?.length < 10) {
      setMoreChat(false);
    } else {
      setMoreChat(true);
    }
    fetchedLength.current = _data.length;

    let finalData = [..._data, ...chats];

    iterateMedia(finalData);
    firstChild.current.scrollIntoView();

    setChatsData(groupBlazeMessages(finalData));
    setIsFetching(false);
    setTimeout(() => {
      setAutoScroll(true);
    }, 100);
  };

  const handleSessionCompleted = async () => {
    let sessionToSelect = currentReservation?.id;
    if (currentReservation?.session_status === "accepted") {
      setAnchorEl(null);
      setOpenRatingModal(true);

      const instructorRating = await getInstructorRatings({
        instructorId: currentReservation?.instructor_id,
      });

      setRatingModalDetails({
        instructor_id: currentReservation?.instructor_id,
        instructor_name: currentReservation?.instructor_name,
        instructor_profile_pic: currentReservation?.instructor_profile_pic,
        session_id: currentReservation?.id,
        instructor_rating: instructorRating,
        topic: currentReservation?.topic,
        pending: false,
        skill: currentReservation?.skill,
      });
    } else if (currentReservation?.session_status === "outstanding") {
      const today = await fetchIndianTime();
      await endSession({
        sessionId: currentReservation?.id,
        completedTs: +today,
        ratingTs: null,
        rating: null,
        studentId: currentReservation?.student_id,
        instructorId: currentReservation?.instructor_id,
        instructorName: currentReservation?.instructor_Name,
        instructorProfilePic: currentReservation?.instructor_profile_pic,
        skill: currentReservation?.skill,
        topic: currentReservation?.topic,
      });


      // Select the latest session according to the session status.
      if(ongoingSessions.length > 0 && !(ongoingSessions.length === 1 && ongoingSessions[0].id === currentReservation?.id)) {
        if(ongoingSessions[0].id === currentReservation?.id) sessionToSelect = ongoingSessions[1].id;
        else sessionToSelect = ongoingSessions[0].id;
      } else if(requestedSessions.length > 0 && !(requestedSessions.length === 1 && requestedSessions[0].id === currentReservation?.id)) {
        if(requestedSessions[0].id === currentReservation?.id) sessionToSelect = requestedSessions[1].id;
        else sessionToSelect = requestedSessions[0].id;
      }
      history.push('/blaze/chat/' + sessionToSelect);
    }

    // console.log('ongoingSessions, requestedSessions - ', ongoingSessions, requestedSessions);


  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !addBtnRef.current.contains(e.target)
      ) {
        setOpenPickers(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const getTotalCallDuration = () => {
    let totalDuration = currentReservation?.aggregated_duration;

    let duration = Math.round(totalDuration / 60);

    return duration + " minute" + (duration > 1 ? "s" : "");
  };

  return (
    <>
      <div className="blaze__reservation__wrapper blaze-theme-1">
        <div className="reservation__content__wrapper">
          <div className="reservation__chat__wrapper">
            <div className="reservation__bar">
              <div className="reservation__details__bar">
                <div className="reservation__details__backdrop">
                  <div
                    className="reservation__chat__back"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <Link to="/blaze">
                      <ArrowBackIcon />
                    </Link>
                  </div>
                  <div className="reservation__details">
                    <div
                      className="vertical-line"
                      style={{
                        backgroundColor:
                          currentReservation?.subject_color_gradient[0],
                        boxShadow: `2px 0 6px 2px ${currentReservation?.subject_color_gradient[1]}80`,
                      }}
                    />
                    <div className="reservation__name">
                      {currentReservation?.topic}
                    </div>
                    <div className="reservation__details__sm">
                      <div className="instructor-details">
                        <div className="instructor-inner">
                          {currentReservation?.instructor_profile_pic ? (
                            <div className="instructor-img">
                              <img
                                src={currentReservation?.instructor_profile_pic}
                                className="image__instructor"
                                alt="ins"
                                draggable={false}
                              />
                              <img
                                src={verfifiedCheck}
                                alt="v"
                                className="image__verified"
                                draggable={false}
                              />
                            </div>
                          ) : (
                            <div className="instructor-search">
                              <Lottie
                                options={{
                                  animationData: searchInstructor,
                                  loop: true,
                                }}
                              />
                            </div>
                          )}

                          <section>
                            <div>
                              <h4>
                                {currentReservation?.instructor_name
                                  ? currentReservation.instructor_name?.split(
                                      " "
                                    )[0] + " Sir"
                                  : currentReservation?.session_status ===
                                    "completed"
                                  ? "Unassigned"
                                  : "Searching..."}
                              </h4>
                              {instructorRating > 0 && (
                                <StarRatings
                                  name="rating"
                                  numberOfStars={5}
                                  starSpacing="2px"
                                  starDimension="20px"
                                  rating={instructorRating}
                                  svgIconPath={starPath}
                                  starRatedColor="#fec107"
                                  starHoverColor="#fec107"
                                  svgIconViewBox="0 0 207.802 207.748"
                                />
                              )}
                            </div>
                            <h6>
                              PuStack {subjectName(currentReservation?.skill)}{" "}
                              Expert
                            </h6>
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="reservation__options">
                    {studentActivity?.isEngaged &&
                      studentActivity?.sessionId === currentReservation?.id && (
                        <div className="popIn">
                          <button
                            onClick={handleHandover}
                            className="call__btn"
                          >
                            <img
                              src={roundedVideoCamera}
                              alt="vc"
                              draggable={false}
                            />
                            <span>JOIN</span>
                          </button>
                        </div>
                      )}
                    {!isChattingDisabled(
                      currentReservation?.session_status
                    ) && (
                      <MoreVert
                        aria-label="more"
                        aria-haspopup="true"
                        onClick={handleClick}
                        aria-controls="session-menu"
                        className="vert__icon"
                        style={{
                          fill: isDark ? "white" : "black",
                          cursor: "pointer",
                        }}
                      />
                    )}
                    <Menu
                      keepMounted
                      id="session-menu"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: -32,
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                      PaperProps={{
                        style: {
                          maxHeight: 48 * 4.5,
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-text)'
                        },
                      }}
                      className={isDark ? 'dark' : ''}
                    >
                      <MenuItem key={0} onClick={handleSessionCompleted}>
                        {currentReservation?.session_status !== 'accepted' ? 'Withdraw Session' : 'End Session'}
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>
            </div>

            <div className="reservation__chat__inner">
              {chatsData && (
                <ReservationChats
                  chats={chatsData}
                  moreChat={moreChat}
                  key={currentReservation?.id}
                  currentReservation={currentReservation}
                  getMoreChatsFn={getMoreChatsFn}
                />
              )}
            </div>
            <div className="blaze__chat__image__preview fadeOutDown">
              {images.length > 0 &&
                images.map((image, i) => (
                  <div className="image__preview">
                    <CloseIcon
                      onClick={() => handleImageDelete(i)}
                      className="imagePreviewDialog_closeIcon"
                    />
                    <img src={image.url} alt="X" draggable={false} />
                  </div>
                ))}

              {pdfs.length > 0 && (
                <div className="pdf__preview">
                  <CloseIcon
                    onClick={handlePdfDelete}
                    className="imagePreviewDialog_closeIcon"
                  />
                  <img src={pdfIcon} alt="X" draggable={false} />
                  <span>{pdfs[0].size} MB</span>
                </div>
              )}
            </div>

            <div className="user__chat__input">
              <div
                className={openPickers ? "show__pickers" : "close__pickers"}
                ref={pickerRef}
              >
                <label className="blaze__image" htmlFor="blaze-image-picker">
                  <img
                    src={imageGallery}
                    alt="chatImageInput"
                    className="blaze__input__image"
                    draggable={false}
                  />
                </label>
                <input
                  accept="image/*"
                  type="file"
                  id="blaze-image-picker"
                  style={{ display: "none" }}
                  onChange={imageSelectionHandler}
                  disabled={isChattingDisabled(
                    currentReservation?.session_status
                  )}
                />

                <label className="blaze__pdf" htmlFor="blaze-pdf-picker">
                  <PictureAsPdfRoundedIcon />
                </label>
                <input
                  type="file"
                  id="blaze-pdf-picker"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={pdfSelectionHandler}
                  disabled={isChattingDisabled(
                    currentReservation?.session_status
                  )}
                />
              </div>
              <div
                className={isDark ? "blaze__picker dark" : "blaze__picker"}
                onClick={() => {
                  if (
                    !isChattingDisabled(currentReservation?.session_status) &&
                    pdfs.length === 0 &&
                    images.length === 0
                  ) {
                    setOpenPickers(!openPickers);
                  }
                }}
              >
                <AddRoundedIcon
                  className={
                    openPickers ? "rotate__forward" : "rotate__backward"
                  }
                  ref={addBtnRef}
                />
              </div>

              <div className="textarea__wrapper">
                <TextareaAutosize
                  autoFocus
                  value={chatText}
                  rowsMax={chatText === "" ? 1 : 4}
                  className="livesession__commentSectionInput blazeres__input"
                  aria-label="maximum height"
                  placeholder={
                    isChattingDisabled(currentReservation?.session_status)
                      ? "Session has ended."
                      : "Type your doubt here ..."
                  }
                  disabled={
                    isChattingDisabled(currentReservation?.session_status) ||
                    images.length > 0 ||
                    pdfs.length > 0
                  }
                  onChange={(e) => {
                    if(e.target.value.length > 350) return;
                    changeRef.current && setChatText(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (
                      chatText.trim() !== "" ||
                      images.length !== 0 ||
                      pdfs.length !== 0
                    ) {
                      if (e.key === "Enter" && !e.shiftKey) {
                        changeRef.current = false;
                        handleMessageSubmit();
                      } else {
                        changeRef.current = true;
                      }
                    }
                  }}
                />
              </div>
              <button
                onClick={handleMessageSubmit}
                className="livesession__commentSectionButton blazeres__btn"
                disabled={
                  chatText.trim() === "" &&
                  images.length === 0 &&
                  pdfs.length === 0
                }
                aria-label="blazeres__btn"
              >
                {isSending ? (
                  <div className="circular__progress__lottie">
                    <Lottie
                      options={{ loop: true, animationData: circularProgress }}
                    />
                  </div>
                ) : (
                  <SendIcon
                    className="blaze-send-icon"
                    color={
                      chatText.trim() === "" &&
                      images.length === 0 &&
                      pdfs.length === 0
                        ? "grey"
                        : "var(--color-highlight)"
                    }
                  />
                )}
              </button>
            </div>
          </div>

          <div className="reservation__sidebar__wrapper">
            <div className="reservation__sidebar__container">
              <div className="reservation__details__wrapper">
                <div
                  className="reservation__details fadeIn"
                  style={{
                    background: currentReservation?.subject_color_gradient[0],
                  }}
                >
                  <div className="reservation__name">
                    {currentReservation?.topic}
                  </div>
                </div>
              </div>
              <div className="reservation__sidebar__about__wrapper">
                {currentReservation?.instructor_name ? (
                  <div className="reservation__sidebar__header">
                    <h3>Know your Expert</h3>
                    <div className="instructor-details">
                      <div className="instructor-inner">
                        {currentReservation?.instructor_profile_pic && (
                          <div className="instructor-img">
                            <img
                              src={currentReservation?.instructor_profile_pic}
                              className="image__instructor"
                              draggable={false}
                              alt="ins"
                            />
                            <img
                              src={verfifiedCheck}
                              alt="v"
                              className="image__verified"
                              draggable={false}
                            />
                          </div>
                        )}
                        <section>
                          <div>
                            <h4>
                              {currentReservation?.instructor_name
                                ? currentReservation.instructor_name?.split(
                                    " "
                                  )[0] + " Sir"
                                : ""}
                            </h4>
                            {instructorRating > 0 && (
                              <StarRatings
                                name="rating"
                                numberOfStars={5}
                                starSpacing="2px"
                                starDimension="20px"
                                rating={instructorRating}
                                svgIconPath={starPath}
                                starRatedColor="#fec107"
                                starHoverColor="#fec107"
                                svgIconViewBox="0 0 207.802 207.748"
                              />
                            )}
                          </div>
                          <h6>
                            PuStack {subjectName(currentReservation?.skill)}{" "}
                            Expert
                          </h6>
                        </section>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="reservation__sidebar__header">
                    <h3>About</h3>
                    <p>These are some details about this blaze session.</p>
                  </div>
                )}
              </div>
              {currentReservation?.instructor_name && (
                <div className="reservation__sidebar__container">
                  <div className="reservation__sidebar__header ">
                    <h3>This Session</h3>
                    <h6>
                      <img
                        src={roundedVideoCamera}
                        alt="vid"
                        className="video-cam"
                        draggable={false}
                      />
                      <p>{getTotalCallDuration()}</p>
                    </h6>
                  </div>
                </div>
              )}
            </div>

            <div className="reservation__sidebar__container">
              <div className="reservation__sidebar__header">
                <h3>Files</h3>
                <p>Shared here in this conversation.</p>
              </div>

              <div
                className="reservation__sidebar__content"
                style={{
                  overflowY: chatDocuments !== null ? "auto" : "inherit",
                }}
              >
                {(chatDocuments === null || chatDocuments?.length === 0) && (
                  <div className="sidebar__placeholder">
                    <div className="sidebar__placeholder__icon">
                      <img
                        src={noFilesIcon}
                        alt="No Documents | PuStack"
                        draggable={false}
                      />
                    </div>
                    <div className="sidebar__placeholder__text">
                      No documents present.
                    </div>
                  </div>
                )}
                {chatDocuments?.map((chat, index) => (
                  <div className="reservation__sidebar__item__file" key={index}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${chat?.url}`}
                    >
                      <img
                        src={pdfIcon}
                        alt="Pustack Document"
                        className="attachment__icon"
                        draggable={false}
                      />
                      <div className="file__details">
                        <div className="file__name">{chat?.name}</div>
                        <div className="file__date">
                          {chat?.timestamp?.getDate()}{" "}
                          {monthToStrFormat(chat?.timestamp?.getMonth())},{" "}
                          {chat?.timestamp?.getFullYear()}
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="reservation__sidebar__container">
              <div className="reservation__sidebar__header">
                <h3>Media</h3>
                <p>Shared here in this conversation.</p>
              </div>

              <div className="reservation__sidebar__content image__content">
                {(chatImages === null || chatImages?.length === 0) && (
                  <div className="sidebar__placeholder">
                    <div className="sidebar__placeholder__icon">
                      <img
                        src={noImagesIcon}
                        alt="No Documents | PuStack"
                        draggable={false}
                      />
                    </div>
                    <div className="sidebar__placeholder__text">
                      No media present.
                    </div>
                  </div>
                )}
                {chatImages?.map((e, index) => (
                  <div
                    key={index}
                    className="reservation__sidebar__item__img"
                    onClick={() => setisModalOpen(true)}
                  >
                    <img
                      src={e.url}
                      alt="Pustack Document"
                      className="attachment__image"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {chatImages !== null && isModalOpen && (
        <ModalGallery
          body={chatImages.map((e) => e.url)}
          onClose={() => setisModalOpen(false)}
        />
      )}
      <Snackbar
        open={openSnack}
        message={message}
        key={"bottom" + "center"}
        onClose={handleSnackClose}
        TransitionComponent={Fade}
        className={isDark ? "snackbar snackbarDark" : "snackbar"}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      <Modal
        ariaHideApp={false}
        isOpen={openBlazeCall}
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        onRequestClose={handleBlazeCallClose}
        overlayClassName="call-modal-overlay new-post-modal-overlay"
        className={isDark ? "skills__modal dark" : "skills__modal"}
      >
        <BlazeStudentCall
          closeModal={handleBlazeCallClose}
          chatData={chatsData}
          currentReservation={currentReservation}
          moreChat={moreChat}
          getMoreChatsFn={getMoreChatsFn}
        />
      </Modal>
    </>
  );
}
