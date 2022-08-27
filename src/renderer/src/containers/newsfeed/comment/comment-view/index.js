import React, { useState, useContext, useEffect } from "react";
import { Avatar, TextareaAutosize } from "@material-ui/core";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { Menu } from "@material-ui/core";
import LinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC";

import { formatTime } from "../../../../helpers";

// -> components
import { CustomMenuItem } from "../../../../components";
import { editComment, getUserInfoById } from "../../../../database";
import { UserContext, ThemeContext } from "../../../../context";
import { splitLongString, showSnackbar } from "../../../../helpers";
import { db } from "../../../../firebase_config";
import { PostContext } from "../../../../context/newsfeed/PostContext";
import { CommentLoader } from "../../..";
import { deleteNewsFeedComment } from "../../../../database";
import "./style.scss";

export default function CommentView({
  deleteComment,
  userId,
  commentText,
  time,
  postId,
  commentId,
  getCommentLikesCount,
}) {
  //------------------------------------ constants hooks
  // -> limit of max 5 upvote change.
  const [likeChangeCount, setLikeChangeCount] = useState(0);
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [updating, setUpdating] = useState(false);
  const [updatedComment, setUpdatedComment] = useState(commentText);
  const [updated, setUpdated] = useState(false);
  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [commentLikesCount, setCommentLikesCount] = useState(
    getCommentLikesCount || 0
  );

  // -> context/doubtcontext
  const [comments] = useContext(PostContext).comments;
  const [isDark] = useContext(ThemeContext).theme;
  const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

  //------------------------------------ useEffect

  useEffect(() => {
    getAndSetUserInfo();
    getIsCommentLiked();
  }, [userId]);

  const getAndSetUserInfo = async () => {
    let [name, profile_url] = await getUserInfoById(userId);
    setName(name);
    setProfileUrl(profile_url);
  };

  //------------------------------------ functions

  const getIsCommentLiked = async () => {
    var docRef = db
      .collection("news_feed")
      .doc("content")
      .collection("news_feed_posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .collection("likes")
      .doc(user.uid);

    await docRef
      .get()
      .then((doc) => setIsCommentLiked(doc.exists))
      .catch((error) => {
        console.error(`Error ${error} for commentId: ${commentId} `);
      });
  };

  const likeUnlikeComment = async () => {
    if (likeChangeCount < 5) {
      setLikeChangeCount(likeChangeCount + 1);

      let docRef = db
        .collection("news_feed")
        .doc("content")
        .collection("news_feed_posts")
        .doc(postId)
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
          .then(() => {
            //showSnackbar("Comment Like Posted", "success");
          })
          .catch((error) => {
            console.error(
              `Error ${error} while adding comment like info for commentId: ${commentId} `
            );
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
    editComment(postId, user.grade, commentId, updatedComment);
    // clearing the comment input
    //setUpdatedComment("");
    setUpdating(false);

    // update that particular comment
    // let recent_feched_comments = comments;
    // recent_feched_comments[index.js].comment.comment_text = updatedComment;
    // setComments(recent_feched_comments);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //------------------------------------ rendering JSX

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
                // backgroundColor: updating ? "#ffffff" : "#f0f2f5",
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
                      <p className="doubtTileComment__time">{` •  ${formatTime(
                        time
                      )}`}</p>
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
                <div className="doubtTileComment__commentText longwrap">
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <LinesEllipsis
                      text={
                        updated
                          ? splitLongString(updatedComment, 30)
                          : splitLongString(commentText, 30)
                      }
                      maxLine={!isExpanded ? 3 : 10000}
                      ellipsis="...."
                      trimRight
                      basedOn="letters"
                    />

                    {!isExpanded ? (
                      <div
                        className="read-more-comment-bg"
                        style={{
                          display: updated
                            ? splitLongString(updatedComment).length
                            : splitLongString(commentText).length > 90
                            ? "flex"
                            : "none",
                        }}
                      >
                        <span className="grey-gradience-space"></span>
                        <span
                          onClick={() => {
                            setIsExpanded(true);
                          }}
                          className="button read-more-comment"
                        >
                          (more)
                        </span>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>

                  {/* <p>
                    {}
                  </p> */}
                </div>
              )}
            </div>
          </div>
          {/* { ( */}
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
                  backgroundColor: isCommentLiked ? "brown" : "grey",
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
          {/* ) : (
            <div
              onClick={() => likeUnlikeComment()}
              className="doubtTile__commentLikeBtnIconZeroDiv"
              style={{
                backgroundColor: isCommentLiked ? "brown" : "grey",
              }}
            >
              <i
                style={{
                  height: "10px",
                  width: "10px",
                }}
                class={"fa fa-thumbs-up doubtTile__commentLikeBtnIcon"}
                aria-hidden="true"
              ></i>
            </div>
          )} */}
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
                  deleteNewsFeedComment(postId, user.grade, commentId);
                  deleteComment(commentId);
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
