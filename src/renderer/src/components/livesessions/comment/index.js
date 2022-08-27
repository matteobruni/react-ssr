import React, { useContext, useState } from "react";
import Menu from "@material-ui/core/Menu";
import { Drawer } from "@material-ui/core";
import { useLongPress } from "use-long-press";
import Lottie from "lottie-react-web";
import { showSnackbar } from "../../../helpers";
import Tooltip from "@material-ui/core/Tooltip";
import { useMediaQuery } from "react-responsive";
import ButtonBase from "@material-ui/core/ButtonBase";
import ReplyIcon from "@material-ui/icons/ReplyRounded";
import MoreVertIcon from "@material-ui/icons/MoreVertRounded";
import PuStackCircleLogo from "../../../assets/images/icons/logo192.png";
import {
  UserContext,
  ThemeContext,
  LiveSessionContext,
} from "../../../context";
import { formatCallDuration } from "../../../helpers";
import { deleteLiveSessionComment } from "../../../database";
import TimerLottie from '../../../assets/lottie/timer.json';
import "./style.scss";

export default function LiveSessionComment({
  comment,
  reply,
  userProfile,
  userName,
  timestamp,
  startTs,
  hasPendingWrites,
  isInstructor,
  commentId,
}) {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const [isInternalInstructor] = useContext(UserContext).isInstructor;
  const [hasSessionEnded] = useContext(LiveSessionContext).ended;
  const [, setReplyingTo] = useContext(LiveSessionContext).replyingTo;
  const [currentSession] = useContext(LiveSessionContext).current;

  const [isDark] = useContext(ThemeContext).theme;
  const [anchorEl, setAnchorEl] = useState(null);

  const getTime = (ts, startTs) =>
    formatCallDuration((ts.seconds * 1000 - +new Date(startTs)) / 1000);

  const bind = useLongPress(() => {
    if (isInternalInstructor && !hasSessionEnded && isSmallScreen) {
      navigator && navigator.vibrate && navigator.vibrate(8);

      setOpenOptions(true);
    }
  });

  const [openOptions, setOpenOptions] = useState(false);

  const deleteComment = () => {
    deleteLiveSessionComment({
      reference: currentSession.reference,
      comment_id: commentId,
    });

    setAnchorEl(null);
    setOpenOptions(false);
  };

  return (
    <>
      {reply !== null && (
        <div className="livesession__reply__wrapper">
          <div className="comment__content">
            <div className="comment__tile">
              <img
                src={isInstructor ? PuStackCircleLogo : userProfile}
                alt="User"
                draggable={false}
              />
            </div>
            <div className="comment__text">
              <div className="comment__details">
                <h2
                  style={{
                    color: isInstructor && "var(--color-comment-title)",
                  }}
                >
                  {isInstructor ? "PuStack Faculty" : userName || "Student"}
                </h2>{" "}
                <p>•</p> <h4>{getTime(timestamp, startTs)}</h4>
              </div>
              <div className="comment__student">{comment}</div>
            </div>
          </div>
          <div className="comment__reply">
            <div className="comment__details">
              <h2>PuStack Faculty</h2>
              <p>{reply}</p>{" "}
            </div>
            <img src={PuStackCircleLogo} alt="pc" draggable={false} />
          </div>
        </div>
      )}

      {reply === null && (
        <div className="livesession__comment__wrapper">
          <div className="comment__tile">
            <img
              src={isInstructor ? PuStackCircleLogo : userProfile}
              alt="User"
              draggable={false}
            />
          </div>
          <div className="comment__content__wrapper">
            <div className="comment__content" {...bind}>
              <div className="comment__details">
                <h2
                  style={{
                    color: isInstructor && "var(--color-comment-title)",
                  }}
                >
                  {isInstructor ? "PuStack Faculty" : userName || "Student"}
                </h2>{" "}
                <p>•</p>
                {hasPendingWrites && !timestamp ? (
                  <div className="comment__timer">
                    <Lottie options={{ animationData: TimerLottie, loop: true }} />
                  </div>
                ) :  <h4>{getTime(timestamp, startTs)}</h4>}
              </div>
              <div className="comment">{comment}</div>
            </div>
            {/*  */}
            {!hasSessionEnded && isInternalInstructor && (
              <div
                className="comment__web__options"
                style={{ display: anchorEl && "flex" }}
              >
                <Tooltip title="Reply" aria-label="reply">
                  <ReplyIcon
                    onClick={() => {
                      setReplyingTo({ commentId, comment, userName });
                    }}
                  />
                </Tooltip>{" "}
                <Tooltip title="More" aria-label="more">
                  <MoreVertIcon onClick={(e) => setAnchorEl(e.currentTarget)} />
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  className={isDark ? "options__menu dark" : "options__menu"}
                >
                  <span onClick={deleteComment}>
                    <i className="fas fa-trash-alt" /> Delete
                  </span>{" "}
                  <span className="separator__" />
                  <span
                    onClick={() => {
                      navigator.clipboard.writeText(comment);
                      setAnchorEl(null);
                      showSnackbar("Comment has been copied", "success");
                    }}
                  >
                    <i className="far fa-copy" /> Copy
                  </span>{" "}
                </Menu>
              </div>
            )}
          </div>
        </div>
      )}

      <Drawer
        variant="temporary"
        open={openOptions}
        anchor="bottom"
        onClose={() => {
          setOpenOptions(false);
          navigator && navigator.vibrate && navigator.vibrate(8);
        }}
        className={"blaze-rating-bottom dark"}
        ModalProps={{ keepMounted: true }}
      >
        <div className="comment__options">
          <div className="comment__options__delete">
            <ButtonBase onClick={deleteComment}>
              <i className="fas fa-trash-alt" />
              <h6>Delete</h6>
            </ButtonBase>
          </div>
          <div
            onClick={() => {
              navigator.clipboard.writeText(comment);
              setOpenOptions(false);
              showSnackbar("Comment has been copied", "success");
            }}
          >
            <ButtonBase>
              <i className="far fa-copy" />
              <h6>Copy</h6>
            </ButtonBase>
          </div>
          <div>
            <ButtonBase
              onClick={() => {
                setReplyingTo({ commentId, comment, userName });
                setOpenOptions(false);
              }}
            >
              <i className="fas fa-edit" /> <h6>Reply</h6>
            </ButtonBase>
          </div>
        </div>
      </Drawer>
    </>
  );
}
