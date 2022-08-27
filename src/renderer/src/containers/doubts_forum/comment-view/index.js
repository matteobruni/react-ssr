import React, { useState, useContext, useEffect } from "react";
import { Menu } from "@material-ui/core";
import LinesEllipsis from "react-lines-ellipsis";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { Avatar, TextareaAutosize } from "@material-ui/core";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC";

import { CommentLoader } from "../..";
import { db } from "../../../firebase_config";
import { CustomMenuItem } from "../../../components";
import { splitLongString, showSnackbar } from "../../../helpers";
import { updateComment, getUserInfoById } from "../../../database";
import { UserContext, ThemeContext, DoubtContext } from "../../../context";
import "./style.scss";

export default function CommentView({
  deleteComment,
  userId,
  commentText,
  time,
  doubtId,
  commentId,
  getCommentLikesCount,
  index,
}) {
  // -> limit of max 5 upvote change.
  const [likeChangeCount, setLikeChangeCount] = useState(0);
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [updating, setUpdating] = useState(false);
  const [updatedComment, setUpdatedComment] = useState(commentText);
  const [comments, setComments] = useContext(DoubtContext).comments;
  const [updated, setUpdated] = useState(false);
  const [isDark] = useContext(ThemeContext).theme;
  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  const [isExpanded, setIsExpanded] = useState(false);

  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [commentLikesCount, setCommentLikesCount] = useState(
    getCommentLikesCount || 0
  );

  const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

  useEffect(() => {
    getAndSetUserInfo();
    getIsCommentLiked();
    // getCommentLikesCount()
  }, []);

  const getAndSetUserInfo = async () => {
    let [name, profile_url] = await getUserInfoById(userId);
    setName(name);
    setProfileUrl(profile_url);
  };

  const getIsCommentLiked = async () => {
    var docRef = db
      .collection("doubt_forum")
      .doc("class_9")
      .collection("posts")
      .doc(doubtId)
      .collection("comments")
      .doc(commentId)
      .collection("likes")
      .doc(user.uid);

    await docRef
      .get()
      .then(function (doc) {
        if (doc.exists) {
          setIsCommentLiked(true);
        } else {
          // doc.data() will be undefined in this case
          setIsCommentLiked(false);
        }
      })
      .catch(function (error) {
        console.error(
          `Error ${error} while checking is comment liked for commentId: ${commentId} `
        );
      });
  };

  const likeUnlikeComment = async () => {
    if (likeChangeCount < 5) {
      setLikeChangeCount(likeChangeCount + 1);

      var docRef = db
        .collection("doubt_forum")
        .doc("class_9")
        .collection("posts")
        .doc(doubtId)
        .collection("comments")
        .doc(commentId);

      if (isCommentLiked) {
        // decrease comment likes count

        setCommentLikesCount(commentLikesCount - 1);
        setIsCommentLiked(false);
        await docRef.update({
          like_count: commentLikesCount - 1,
        });
      } else {
        // increase comment likes count

        setCommentLikesCount(commentLikesCount + 1);
        setIsCommentLiked(true);
        await docRef.update({
          like_count: commentLikesCount + 1,
        });
      }

      if (isCommentLiked) {
        // delete comment like info
        await docRef.collection("likes").doc(user.uid).delete();
      } else {
        // add comment like info
        await docRef
          .collection("likes")
          .doc(user.uid)
          .set({
            create_ts: Date.now(),
            user_id: user.uid,
            user_role: isInstructor ? "instructor" : "student",
          })
          .then(function (docRef) {
            //showSnackbar("Comment Like Posted", "success");
          })
          .catch(function (error) {
            showSnackbar("Server Error", "server-error");
          });
      }
    } else {
      // show snackbar Reached max of like interactions.

      showSnackbar("Reached max of like interactions", "warning");
    }
  };

  const onReportButtonClick = () => {
    showSnackbar("Comment Reported", "success");
    handleClose();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onUpdateClick = () => {
    // update the comment
    setUpdated(true);
    updateComment(doubtId, updatedComment, commentId, user);
    // clearing the comment input
    //setUpdatedComment("");
    setUpdating(false);

    // update that particular comment
    let recent_fetched_comments = comments;
    recent_fetched_comments[index].comment.comment_text = updatedComment;
    setComments(recent_fetched_comments);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="doubtTileComment">
      {name ? (
        <div
          className="doubtTileComment__commentContainerOuterDiv"
          style={{ width: updating ? "100%" : "" }}
        >
          <div className="doubtTileComment__commentContainerDiv">
            <Avatar style={{ height: "32px", width: "32px" }} src={profileUrl}>
              {name}
            </Avatar>
            <div
              className="doubtTileComment__commentContainer"
              style={{
                backgroundColor: updating
                  ? isDark
                    ? "#484848"
                    : "#ffffff"
                  : isDark
                  ? "#484848"
                  : "#f0f2f5",
                padding: updating ? "" : "8px 12px",
              }}
            >
              {!updating && (
                <div className="comment-top-bar">
                  <div className="doubtTileComment__nameAndTime">
                    <p className="doubtTileComment__name">{name}</p>

                    {time ? (
                      <p className="doubtTileComment__time">{` •  ${time}`}</p>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              )}

              {updating ? (
                <div>
                  <div className="doubtTile__comment-edit">
                    <TextareaAutosize
                      className="doubtTile__comment-edit-input"
                      rowsMax={4}
                      aria-label="maximum height"
                      value={updatedComment}
                      placeholder="Add a comment..."
                      onChange={(event) =>
                        setUpdatedComment(event.target.value)
                      }
                    />
                  </div>
                  <div className="doubtTile__comment-edit-options">
                    <button
                      className="doubtTile__comment-cancel-button"
                      onClick={() => {
                        setUpdating(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="doubtTile__comment-update"
                      onClick={onUpdateClick}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="doubtTileComment__commentText">
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <LinesEllipsis
                      text={
                        updated
                          ? splitLongString(updatedComment)
                          : splitLongString(commentText)
                      }
                      maxLine={!isExpanded ? 3 : 10000}
                      ellipsis="...Read More"
                      trimRight
                      basedOn="letters"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {!updating && (
            <div
              className={
                commentLikesCount > 0 ? "doubtTile__commentLikeBtn" : ""
              }
              onClick={() => likeUnlikeComment()}
            >
              <div
                className={
                  commentLikesCount > 0
                    ? "doubtTile__commentLikeBtnIconDiv"
                    : "doubtTile__commentLikeBtnIconZeroDiv"
                }
                style={{
                  backgroundColor: isCommentLiked
                    ? isDark
                      ? "#bb281b"
                      : "#891010"
                    : "grey",
                }}
              >
                <i
                  style={{
                    height: "10px",
                    width: "10px",
                  }}
                  className={"fa fa-thumbs-up doubtTile__commentLikeBtnIcon"}
                  aria-hidden="true"
                ></i>
              </div>
              {commentLikesCount > 0 ? commentLikesCount : ""}
            </div>
          )}
        </div>
      ) : (
        <CommentLoader />
      )}

      {!updating && (
        <div className="doubtTileComment__menu">
          <MoreHorizIcon
            onClick={handleClick}
            style={{ height: "28px", width: "28px", padding: "4px" }}
          />

          {userId === user.uid ? (
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <CustomMenuItem
                onClickMenuItem={() => {
                  setUpdating(true);
                  handleClose();
                }}
                label="Edit Comment"
              />
              <CustomMenuItem
                onClickMenuItem={() => {
                  deleteComment();
                  handleClose();
                }}
                label="Delete"
              />
            </Menu>
          ) : (
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <CustomMenuItem
                onClickMenuItem={onReportButtonClick}
                label="Report"
              />
            </Menu>
          )}
        </div>
      )}
    </div>
  );
}
