import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  getBlazeReservationChats,
  handleAcceptSession,
} from "../../../database";
import Modal from "react-modal";
import Linkify from "react-linkify";
import Lottie from "lottie-react-web";
import CancelIcon from "@material-ui/icons/Cancel";
import pdfIcon from "../../../assets/images/pdf.svg";
import { UserContext, ThemeContext } from "../../../context";
import unAssigned from "../../../assets/images/unassigned.png";
import BlazeCardBgDark from "../../../assets/blaze/blazeCardBgDark";
import BlazeCardBgLight from "../../../assets/blaze/blazeCardBgLight";
import circularProgress from "../../../assets/lottie/circularProgress.json";
import roundedVideoCamera from "../../../assets/blaze/rounded_video_camera.svg";
import { showSnackbar } from "../../../components/doubts_forum/snackbar/functions";
import KeyboardArrowDownRoundedIcon from "@material-ui/icons/KeyboardArrowDownRounded";

import "./style.scss";

const getSubject = (arr) => {
  let sub = "";
  arr.map((w) => (sub = sub + " " + w));
  return sub.slice(1);
};

const subjectName = (skill) => {
  let splitted = skill?.split("_");

  if (splitted?.length > 0) {
    return splitted.length === 3 ? splitted[2] : getSubject(splitted.slice(3));
  }
};

export default function BlazeRequestCard({
                                           topic,
                                           skill,
                                           gradient,
                                           sessionId,
                                           reference,
                                           studentName,
                                           studentImage,
                                           sessionData,
                                           isSessionSelected,
                                           setSessionSelected,
                                         }) {
  const [chats, setChats] = useState(null);
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const [dialogImage, setDialogImage] = useState("");
  const [imagePreview, setimagePreview] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;

  useEffect(() => {
    if (expanded) {
      user?.uid && getBlazeReservationChatsFn();
    }
  }, [user?.uid, expanded]);

  // useEffect(() => {
  //   if (isSessionSelected) {
  //     setExpanded(true);
  //   } else {
  //     setExpanded(false);
  //   }
  // }, [isSessionSelected]);

  const getBlazeReservationChatsFn = async () => {
    setChats(
      await getBlazeReservationChats({
        reference,
        user_id: user?.uid,
        limit: 3,
      })
    );
  };

  const handleClose = () => {
    setimagePreview(false);
  };

  const handleAccept = async () => {
    setIsAccepting(true);

    const msg = await handleAcceptSession({
      studentId: sessionData?.student_id,
      instructorId: user?.uid,
      sessionId: sessionData?.id,
      instructorName: user?.name,
      instructorPhoto: user?.profile_url,
      reference: sessionData?.ref,
    });

    setIsAccepting(false);

    if (msg !== "updated") {
      return showSnackbar(msg, "info");
    } else {
      history.push(`/blaze/chat/${sessionData?.id}`);
    }
  };

  return (
    <div
      className={`blaze-requested-card${expanded ? " expanded" : ""} fadeIn`}
      key={sessionId}
      onClick={() => setSessionSelected(sessionId)}
    >
      <div className="blaze-card-bg">
        {isDark ? (
          <BlazeCardBgDark
            color1={gradient[1]}
            color2={gradient[0]}
            key={topic}
            sessionId={sessionId}
          />
        ) : (
          <BlazeCardBgLight
            color1={gradient[1]}
            color2={gradient[0]}
            key={topic}
            sessionId={sessionId}
          />
        )}
      </div>
      <div className={"blaze-card-content"}>
        <div
          className="card-outstanding"
          style={{
            backgroundColor: gradient?.length && gradient[0],
            boxShadow: `4px 0 14px 3px ${gradient?.length && gradient[1]}90`,
          }}
        ></div>
        <div className="blaze-card-inner">
          <div className="blaze-card-details">
            <div className="blaze-topic" onClick={() => history.push('/blaze/chat/' + sessionId)}>
              <img
                src={roundedVideoCamera}
                alt="vid"
                className="video-cam"
                draggable={false}
              />{" "}
              <div>
                <h2>{topic}</h2>
                <h5>
                  Class {skill?.split("_")[1]}th{" "}
                  {subjectName(skill) === "maths"
                    ? "Mathematics"
                    : subjectName(skill)}
                </h5>
              </div>
            </div>

            <button
              className={expanded ? "expand-btn rotateDown" : "expand-btn"}
              onClick={() => {
                history.push('/blaze/chat/' + sessionId);
                return;
                // setExpanded(!expanded)
              }}
            >
              <KeyboardArrowDownRoundedIcon />
            </button>

            <div
              className={expanded ? "card-divider fadeIn" : "card-divider"}
            />
            <div
              className={
                expanded ? "student-details fadeIn" : "student-details"
              }
            >
              <div className="student-inner">
                <div className="student-identity">
                  {studentImage ? (
                    <div className="student-img">
                      <img
                        src={studentImage}
                        className="image-student"
                        draggable={false}
                        alt="ins"
                      />
                    </div>
                  ) : (
                    <div className="student-img">
                      <img
                        src={unAssigned}
                        className="image-student"
                        alt="un"
                        draggable={false}
                      />
                    </div>
                  )}
                  <section>
                    <div>
                      <h4>{studentName ? studentName : "Student"}</h4>
                    </div>
                    <h6>Class {skill?.split("_")[1]}th Student</h6>
                  </section>
                </div>
                <div className="student-activity">
                  <h4>
                    <svg
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-uqopch"
                      focusable="false"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      data-testid="VideoCameraFrontRoundedIcon"
                    >
                      <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l3.15 3.13c.31.32.85.09.85-.35V7.7c0-.44-.54-.67-.85-.35L18 10.48zM10 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H6v-.57c0-.81.48-1.53 1.22-1.85.85-.37 1.79-.58 2.78-.58.99 0 1.93.21 2.78.58.74.32 1.22 1.04 1.22 1.85V16z" />
                    </svg>{" "}
                    <p>{sessionData?.student_session_count} Sessions</p>
                  </h4>
                </div>
              </div>
            </div>

            <div className="student-doubt">
              {chats?.map((chat, index) => {
                if (chat?.type === "text") {
                  return (
                    <div
                      key={chat?.sent_on}
                      className="reservation-comment-wrapper"
                    >
                      <div className="comment-content">
                        <Linkify
                          componentDecorator={(
                            decoratedHref,
                            decoratedText,
                            key
                          ) => (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={decoratedHref}
                              key={key}
                            >
                              {decoratedText}
                            </a>
                          )}
                        >
                          {chat.message}
                        </Linkify>
                      </div>
                    </div>
                  );
                } else if (chat?.type === "document") {
                  return (
                    <div
                      key={chat?.sent_on}
                      className="reservation-comment-wrapper"
                    >
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={chat?.attachment?.url ?? "#"}
                      >
                        <div className="comment-content attachment">
                          <img
                            src={pdfIcon}
                            alt="PustackDocument"
                            className="attachment-icon"
                          />
                          <div className="file-name">Show PDF</div>
                        </div>
                      </a>
                    </div>
                  );
                } else if (chat?.type === "image") {
                  return (
                    <div
                      className="reservation-comment-wrapper"
                      key={chat?.sent_on}
                    >
                      <div key={index} className="comment-content image">
                        <img
                          src={chat?.attachment?.url}
                          alt="PBA"
                          className="comment-image"
                          onClick={() => {
                            setimagePreview(true);
                            setDialogImage(chat?.attachment?.url);
                          }}
                        />
                      </div>

                      <Modal
                        shouldCloseOnEsc={true}
                        shouldCloseOnOverlayClick={true}
                        onRequestClose={handleClose}
                        ariaHideApp={false}
                        overlayClassName="new-post-modal-overlay"
                        isOpen={imagePreview}
                        className="doubtTile__imagePreviewDiv__wrapper"
                      >
                        <div className="doubtTile__imagePreviewDiv">
                          <CancelIcon
                            onClick={handleClose}
                            className="close-btn"
                          />
                          <img
                            src={dialogImage}
                            className="imagePreviewDialog_image"
                            onClick={handleClose}
                            alt={`${chat?.attachment?.url}`}
                            key={chat?.attachment?.url}
                          />
                        </div>
                      </Modal>
                    </div>
                  );
                }
              })}
            </div>
            {expanded && (
              <div className="accept-btn" onClick={handleAccept}>
                {isAccepting ? (
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                ) : (
                  <span>Accept</span>
                )}
              </div>
            )}
            {expanded && chats?.length > 1 && (
              <div className="more-msgs fadeIn" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
