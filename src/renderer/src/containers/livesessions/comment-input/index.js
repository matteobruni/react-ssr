import React, {useState, useContext, useEffect, useMemo} from "react";
import CancelIcon from "@material-ui/icons/Cancel";
import { Avatar, TextareaAutosize } from "@material-ui/core";
import { showSnackbar } from "../../../helpers";
import { UserContext, LiveSessionContext } from "../../../context";
import {
  postLiveComment,
  getCurrentSessionDetails,
  replyingToComment,
} from "../../../database";
import "./style.scss";
import useToday from "../../../hooks/today";
import useTimer from "../../../hooks/timer";

function CommentInput() {
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [activeSession] = useContext(LiveSessionContext).current;
  const [hasSessionEnded] = useContext(LiveSessionContext).ended;
  const [replyingTo, setReplyingTo] = useContext(LiveSessionContext).replyingTo;
  const [timer] = useTimer(10000);

  const [sessionID, setSessionID] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const today = useToday();

  useEffect(() => {
    if (activeSession && activeSession !== null) {
      let unsubscribe = getCurrentSessionDetails(activeSession.reference, (e) => {
        setCurrentSession(e);
      });
      return () => unsubscribe();
    }
  }, [activeSession]);

  const isLive = useMemo(() => {
    if(!activeSession || !timer) return;

    const indianTime = +timer;
    const isBeforeTime = +new Date(activeSession?.start_ts) >= indianTime;
    // console.log('isBeforeTime - ', +new Date(activeSession?.start_ts), indianTime);

    const sessionLength =
      activeSession?.video_length > 0
        ? Number(activeSession?.video_length) * 1000
        : Number(activeSession?.duration) * 60 * 1000;
    // console.log('activeSession - ', activeSession)

    const isAfterTime =
      +new Date(activeSession?.start_ts) + sessionLength <= indianTime;
    // console.log('isAfterTime - ', +new Date(activeSession?.start_ts) + sessionLength, indianTime);

    return !isBeforeTime && !isAfterTime;
  }, [timer, activeSession]);

  useEffect(() => {
    if (currentSession !== null) setSessionID(currentSession.session_id);
  }, [currentSession]);

  const addCommentBtnClick = async (event) => {
    event.preventDefault();
    if (commentInput) {
      let comment_text = commentInput;
      setCommentInput("");

      if (replyingTo) {
        replyingToComment({
          reference: currentSession.reference,
          comment_id: replyingTo.commentId,
          user_content: comment_text,
          user_id: user.uid,
        });

        setReplyingTo(null);
      } else {
        postLiveComment({
          reference: currentSession.reference,
          session_id: currentSession.session_id,
          user_profile_pic: user.profile_url,
          user_email: user.email,
          user_id: user.uid,
          user_name: user?.name,
          user_content: comment_text,
          is_instructor: isInstructor,
        });
      }
    }
  };

  return (
    <div>
      {user && currentSession !== null && (
        <>
          {replyingTo && (
            <div className="replying__comment">
              <div className="replying__comment__inner">
                <div>
                  <h4>Replying to {replyingTo.userName}</h4>
                  <CancelIcon onClick={() => setReplyingTo(null)} />
                </div>
                <p>{replyingTo.comment}</p>
              </div>
            </div>
          )}
          <div
            className="commentInput"
            onClick={
              hasSessionEnded
                ? () => showSnackbar("The live session has ended.", "info")
                : null
            }
          >
            {isLive && (
                <div className="livesession__commentSection">
                  <Avatar
                    style={{ height: "28px", width: "28px" }}
                    src={user.profile_url}
                  />

                  <TextareaAutosize
                    className="livesession__commentSectionInput"
                    rowsMax={4}
                    aria-label="maximum height"
                    value={commentInput}
                    placeholder={
                      hasSessionEnded
                        ? "Live Session has ended"
                        : replyingTo !== null
                        ? "Reply"
                        : "Ask anything..."
                    }
                    onChange={(event) => setCommentInput(event.target.value)}
                    disabled={sessionID === null || hasSessionEnded}
                    autoFocus={replyingTo !== null}
                    key={String(replyingTo?.commentId)}
                  />
                  <button
                    disabled={
                      sessionID === null || hasSessionEnded || !commentInput
                    }
                    onClick={addCommentBtnClick}
                    className="livesession__commentSectionButton"
                  >
                    Send
                  </button>
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

export default CommentInput;
