import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback, Fragment,
} from "react";
import Modal from "react-modal";
import { format } from "date-fns";
import Linkify from "react-linkify";
import CancelIcon from "@material-ui/icons/Cancel";
import DoneIcon from "@material-ui/icons/DoneRounded";
import DoneAllIcon from "@material-ui/icons/DoneAllRounded";
import CallRoundedIcon from "@material-ui/icons/CallRounded";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";
import MissedVideoCallRoundedIcon from "@material-ui/icons/MissedVideoCallRounded";
import { UserContext } from "../../../context";
import pdfIcon from "../../../assets/images/pdf.svg";

export default function ReservationChats({ chats, moreChat, getMoreChatsFn, currentReservation }) {
  const [user] = useContext(UserContext).user;
  const [imagePreview, setimagePreview] = useState(false);
  const [dialogImage, setDialogImage] = useState("");
  const [timeId, setTimeId] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const endScroll = useRef();
  const observer = useRef();
  const firstChild = useRef();
  const fetchedLength = useRef();

  const handleClose = () => {
    setimagePreview(false);
  };

  useEffect(() => {
    autoScroll && endScroll.current.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const lastChatRef = useCallback(function (node) {
    if (node !== null) {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (moreChat && autoScroll && !isFetching) {
            setIsFetching(true);
            setAutoScroll(false);

            if (chats[0]) {
              getMoreChatsFn(
                chats,
                setIsFetching,
                setAutoScroll,
                firstChild,
                fetchedLength
              );
            } else setIsFetching(false);
          }
        }
      });
      if (node) observer.current.observe(node);
    }
  });

  const formattedDate = (timestamp) => {
    if (timestamp !== null && typeof timestamp !== "undefined") {
      const _chatDate = +new Date(timestamp).getDate();

      const _date = +new Date().getDate();
      const _weekDiff = differenceInCalendarWeeks(
        new Date(),
        new Date(timestamp)
      );

      if (_chatDate === _date) {
        return (
          format(new Date(timestamp), "h") +
          ":" +
          format(new Date(timestamp), "mm") +
          " " +
          format(new Date(timestamp), "aaa")
        );
      } else if (_chatDate < _date || _weekDiff === 0) {
        return (
          format(new Date(timestamp), "cccc") +
          ", " +
          format(new Date(timestamp), "h") +
          ":" +
          format(new Date(timestamp), "mm") +
          " " +
          format(new Date(timestamp), "aaa")
        );
      } else if (_weekDiff > 0) {
        return (
          format(new Date(timestamp), "MMMM") +
          " " +
          _chatDate +
          ", " +
          format(new Date(timestamp), "yyyy") +
          " at " +
          format(new Date(timestamp), "h") +
          ":" +
          format(new Date(timestamp), "mm") +
          String(format(new Date(timestamp), "aaa")).toLowerCase()
        );
      } else {
        return (
          format(new Date(timestamp), "h") +
          ":" +
          format(new Date(timestamp), "mm") +
          " " +
          format(new Date(timestamp), "aaa")
        );
      }
    } else {
      return (
        format(new Date(), "h") +
        ":" +
        format(new Date(), "mm") +
        " " +
        format(new Date(), "aaa")
      );
    }
  };

  const showProfileImage = (position) =>
    position === "bottom" || position === "none";

  return (
    <div className="user__chat__window">
      <div className="lastChatRef" ref={lastChatRef}></div>
      {chats.map((chat, index) => {
        if (chat?.type === "text") {
          return (
            <Fragment key={chat?.timestamp}>
              {timeId === chat?.timestamp && (
                <h6 className="reservation__timestamp">
                  {formattedDate(chat?.timestamp)}
                </h6>
              )}
              {index === fetchedLength?.current && (
                <div
                  ref={firstChild}
                  style={{ marginBottom: !autoScroll ? "15px" : "0px" }}
                />
              )}
              <div
                key={chat?.sent_on}
                className={
                  chat?.isByUser
                    ? "reservation__comment__wrapper receiver"
                    : "reservation__comment__wrapper sender"
                }
              >
                <div
                  className="comment__tile"
                  style={{ opacity: showProfileImage(chat?.position) ? 1 : 0 }}
                >
                  <img
                    src={chat?.isByUser ? user?.profile_url || currentReservation.student_profile_pic : chat?.sender_pic}
                    alt="Pustack User"
                  />
                </div>

                <div
                  className={`comment__content ${chat?.position}`}
                  onClick={() =>
                    setTimeId(
                      timeId === chat?.timestamp ? null : chat?.timestamp
                    )
                  }
                >
                  <Linkify
                    componentDecorator={(decoratedHref, decoratedText, key) => (
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
                  {chat?.isByUser && (
                    <div className="received__check">
                      {chat?.hasRead ? (
                        <DoneAllIcon className="received-check" />
                      ) : (
                        <DoneIcon className="sent-check" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Fragment>
          );
        } else if (chat?.type === "document") {
          return (
            <>
              {timeId === chat?.timestamp && (
                <h6 className="reservation__timestamp">
                  {formattedDate(chat?.timestamp)}
                </h6>
              )}
              {index === fetchedLength?.current && <div ref={firstChild} />}
              <div
                key={chat?.sent_on}
                className={
                  chat?.isByUser
                    ? "reservation__comment__wrapper receiver"
                    : "reservation__comment__wrapper sender"
                }
              >
                <div
                  className="comment__tile"
                  style={{ opacity: showProfileImage(chat?.position) ? 1 : 0 }}
                >
                  <img
                    src={chat?.isByUser ? user?.profile_url : chat?.sender_pic}
                    alt="PustackUser"
                  />
                </div>

                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={chat?.attachment?.url ?? "#"}
                >
                  <div
                    className={`comment__content attachment ${chat?.position}`}
                    onClick={() =>
                      setTimeId(
                        timeId === chat?.timestamp ? null : chat?.timestamp
                      )
                    }
                  >
                    <img
                      src={pdfIcon}
                      alt="PustackDocument"
                      className="attachment__icon"
                    />
                    <div className="file__name">{chat?.attachment?.name}</div>
                    {chat?.isByUser && (
                      <div className="received__check">
                        {chat?.hasRead ? (
                          <DoneAllIcon className="received-check" />
                        ) : (
                          <DoneIcon className="sent-check" />
                        )}
                      </div>
                    )}
                  </div>
                </a>
              </div>
            </>
          );
        } else if (chat?.type === "call_event") {
          return (
            <>
              {timeId === chat?.timestamp && (
                <h6 className="reservation__timestamp">
                  {formattedDate(chat?.timestamp)}
                </h6>
              )}
              {index === fetchedLength?.current && <div ref={firstChild} />}
              <div
                key={chat?.sent_on}
                className="reservation__comment__wrapper call__detail"
                onClick={() =>
                  setTimeId(timeId === chat?.timestamp ? null : chat?.timestamp)
                }
              >
                {chat?.event_type === "completed" ? (
                  <div className="call__duration">
                    <span>
                      <CallRoundedIcon />
                      {chat?.message}
                    </span>
                  </div>
                ) : (
                  <div className="missed__call">
                    <span>
                      <MissedVideoCallRoundedIcon />
                      {chat?.message} • {format(new Date(chat?.timestamp), "p")}
                    </span>
                  </div>
                )}
              </div>
            </>
          );
        } else if (chat?.type === "image") {
          return (
            <>
              {timeId === chat?.timestamp && (
                <h6 className="reservation__timestamp">
                  {formattedDate(chat?.timestamp)}
                </h6>
              )}
              {index === fetchedLength?.current && <div ref={firstChild} />}
              <div
                className={`reservation__comment__wrapper ${
                  chat?.isByUser ? "receiver" : "sender"
                }`}
                key={chat?.sent_on}
              >
                <div
                  className="comment__tile"
                  style={{ opacity: showProfileImage(chat?.position) ? 1 : 0 }}
                >
                  <img
                    src={chat?.isByUser ? user?.profile_url : chat?.sender_pic}
                    alt="PustackUser"
                  />
                </div>

                <div
                  key={index}
                  className={`comment__content image ${chat?.position}`}
                  onClick={() =>
                    setTimeId(
                      timeId === chat?.timestamp ? null : chat?.timestamp
                    )
                  }
                >
                  <img
                    src={chat?.attachment?.url}
                    alt="PBA"
                    className="comment__image"
                    onClick={() => {
                      setimagePreview(true);
                      setDialogImage(chat?.attachment?.url);
                    }}
                  />
                  {chat?.isByUser && (
                    <div className="received__check">
                      {chat?.hasRead ? (
                        <DoneAllIcon className="received-check fadeIn" />
                      ) : (
                        <DoneIcon className="sent-check fadeIn" />
                      )}
                    </div>
                  )}
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
                    <CancelIcon onClick={handleClose} className="close-btn" />
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
            </>
          );
        }
      })}

      <div className="scroll__to__end" ref={endScroll}></div>
    </div>
  );
}
