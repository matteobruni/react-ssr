import React, { useState, useEffect, useContext } from "react";

// -> material ui
import Menu from "@material-ui/core/Menu";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  toggleLikeOnDb,
  toogleBookmarked,
  isPostIdBookmarked,
} from "../../../../database";

// -> database
import { getComments, deletePost, getIsPostLiked } from "../../../../database";

// -> containers
import {
  NewsFeedCommentInput,
  NewsFeedCommentView,
} from "../../../../containers";

// -> components
import { UserContext } from "../../../../context/global/user-context";
import CommentLoader from "../../../doubts_forum/comment-loader";

import { CommentIcon, LikeOutline } from "../../../../assets";
import { PostContext } from "../../../../context/newsfeed/PostContext";
import { CustomMenuItem } from "../../../../components";
import { showSnackbar } from "../../../../helpers";
import { NewsFeedContext, CreatePostContext } from "../../../../context";

function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value); // update the state to force render
}

let scrollPosition = null;

const PostControls = ({ onDelete, body, fetchCommentsAlready }) => {
  //------------------------------------ constants hooks
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;

  const [liked, setLiked] = useState(false);
  const [likeChangeCount, setLikeChangeCount] = useState(0);
  const [bookmarked, setbookmarked] = useState(false);
  const [postLikes, setPostLikes] = useState(body.data.like_count);
  const [showComments, setShowComments] = useState(false);
  const [lastComment, setLastComment] = useState(null);
  const [commentsCount, setCommentsCount] = useState(body.data.comment_count);
  const [comments, setComments] = useContext(PostContext).comments;
  const [commentAdded] = useContext(PostContext).commentAdded;
  const [commentDeleted, setCommentDeleted] =
    useContext(PostContext).commentDeleted;
  const forceUpdate = useForceUpdate();
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [, setHideViewMore] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [allowCommenting, setAllowCommenting] = useState(false);

  // -> to open the modal for editing post
  const [, setIsNewPostModalOpen] =
    useContext(NewsFeedContext).isNewPostModalOpen;

  // -> create post context
  const [, setIsGeneratingMetadata] =
    useContext(CreatePostContext).isGeneratingMetadata;
  const [, setCurrentLink] = useContext(CreatePostContext).currentLink;
  const [, setendTs] = useContext(CreatePostContext).endTs;
  const [, setaddYoutubeUrl] = useContext(CreatePostContext).addYoutubeUrl;
  const [, setLinkMetadata] = useContext(CreatePostContext).linkMetadata;
  const [, setPollDays] = useContext(CreatePostContext).pollDays;
  const [, setPlainText] = useContext(CreatePostContext).plainText;
  const [, setPollOptions] = useContext(CreatePostContext).pollOptions;
  const [, setIsPoll] = useContext(CreatePostContext).isPoll;
  const [, setYoutubeID] = useContext(CreatePostContext).youtubeID;
  const [, setyoutubeUrl] = useContext(CreatePostContext).youtubeUrl;
  const [, setType] = useContext(CreatePostContext).type;
  const [, setRichText] = useContext(CreatePostContext).richText;
  const [, setIsUpdating] = useContext(CreatePostContext).isUpdating;
  const [, setSelectedGroups] = useContext(CreatePostContext).selectedGroups;
  const [, settempGroups] = useContext(CreatePostContext).tempGroups;
  const [, setpostId] = useContext(CreatePostContext).postId;
  const [, setVideo] = useContext(CreatePostContext).video;
  const [, setNewImages] = useContext(CreatePostContext).newImages;
  const [, setPostInfo] = useContext(CreatePostContext).postInfo;

  //------------------------------------ useEffect
  useEffect(() => {
    if (user) {
      getSetPostLiked();
      getAndSetIfBookmarked();
    }

    if (fetchCommentsAlready) {
      toggleComments(3);
    }

    if (anchorEl !== null) {
      scrollPosition = window.scrollY;
      document.addEventListener("scroll", scrollListener);
    } else {
      scrollPosition = null;
      document.removeEventListener("scroll", scrollListener);
    }
  }, [setLiked, setPostLikes, body, anchorEl]);

  async function getAndSetIfBookmarked() {
    let _bookmarked = false;

    _bookmarked = await isPostIdBookmarked({
      userId: user.uid,
      postId: body.id,
      grade: user.grade,
    });

    if (!isInstructor) setbookmarked(_bookmarked);
  }

  //------------------------------------ functions
  const getSetPostLiked = async () => {
    setLiked(await getIsPostLiked(body.id, user.grade, user.uid));
  };

  const getCommentCount = () => {
    if (body.data.comment_count + commentAdded - commentDeleted) {
      return body.data.comment_count + commentAdded - commentDeleted;
    } else {
      return 0;
    }
  };

  const getLikesCount = () => {
    if (postLikes) {
      if (postLikes > 999) {
        return "1k+";
      } else {
        return postLikes;
      }
    } else {
      return 0;
    }
  };

  const toggleLike = () => {
    if (likeChangeCount < 5) {
      setLikeChangeCount(likeChangeCount + 1);

      if (liked) {
        setPostLikes(postLikes - 1);
      } else {
        setPostLikes(postLikes + 1);
      }
      toggleLikeOnDb(body.id, user.grade, user.uid, liked);
      setLiked(!liked);
    } else {
      // show snackbar Reached max of like interactions.

      showSnackbar("Reached max of like interactions", "warning");
    }
  };

  const toggleComments = async (count) => {
    setAllowCommenting(!allowCommenting);
    setShowComments(!showComments);
    setComments([]);
    setLastComment(null);

    if (commentsCount > 0) {
      setIsLoadingComments(true);
      try {
        const [_, _ld] = await getComments(
          body.id,
          user?.grade,
          lastComment,
          count | 2
        );
        setComments([..._]);
        setLastComment(_ld);
        setIsLoadingComments(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCommentsLocal = async () => {
    if (comments.length + 2 === commentsCount) {
      setHideViewMore(true);
    }
    setIsLoadingComments(true);

    const [moreComments, _ld] = await getComments(
      body.id,
      user?.grade,
      lastComment
    );

    setComments([...comments, ...moreComments]);
    setIsLoadingComments(false);
    setLastComment(_ld);
  };

  const deleteComments = (comment) => {
    const updatedComments = comments.filter((c) => c.id !== comment.id);

    setCommentsCount(commentsCount > 0 ? commentsCount - 1 : 0);
    setCommentDeleted(commentDeleted >= 0 ? commentDeleted + 1 : 0);
    setComments(updatedComments);
    forceUpdate();
  };

  const handleDelete = () => {
    deletePost(body.id, user?.grade);
    setAnchorEl(null);
    onDelete(body.id);
  };

  const editPost = () => {
    setPostInfo(body);
    setpostId(body.id);
    setRichText(body.data.description);
    setIsUpdating(true);
    setSelectedGroups(body.data.tags);
    settempGroups(body.data.tags);
    setType(body.data.type);
    setIsNewPostModalOpen(true);

    if (body.data.type === "rich-text") {
      setRichText(body.data.rich_text);
    }

    if (body.data.type === "youtube") {
      setyoutubeUrl(`https://youtu.be/${body.data.youtube_id}`);
      setYoutubeID(`${body.data.youtube_id}`);
      setaddYoutubeUrl(true);
    }

    if (body.data.type === "image") {
      if (typeof body.data.image_urls === "object") {
        let preselected_image_urls = [];
        body.data.image_urls.map((image_url) =>
          preselected_image_urls.push({
            url: image_url,
          })
        );

        setNewImages([...preselected_image_urls]);
      }
    }

    if (body.data.type === "poll") {
      setendTs(body.data.end_ts);
      setIsPoll(true);
      setPollOptions(body.data.options);
      setPlainText(body.data.question);
      setPollDays(
        Math.round(
          (body.data.end_ts - body.data.create_ts) / (1000 * 60 * 60 * 24)
        )
      );
    }

    if (body.data.type === "link") {
      // setLinkMetadata
      setIsGeneratingMetadata(false);
      setLinkMetadata({
        url: body.data.url,
        image: body.data.thumbnail,
        page_title: body.data.page_title,
      });
      setCurrentLink(body.data.url);
    }

    if (body.data.type === "video") {
      setVideo({
        url: body.data.video_url,
      });
    }
    // close the menu
    setAnchorEl(null);
  };

  const scrollListener = () => {
    if (scrollPosition !== null) {
      if (scrollPosition !== window.scrollY && anchorEl !== null) {
        setAnchorEl(null);
      }
    } else {
    }
  };

  const copyToClipBoard = (str) => {
    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  const shareBtnClick = () => {
    // generate url
    let url = window.location.origin;
    let postUrl = `${url}/newsfeed/${body.id}`;

    // copy to clipboard
    copyToClipBoard(postUrl);

    // show snackbar
    showSnackbar("Copied to clipboard", "success");
  };

  //------------------------------------ render JSX
  return (
    <>
      <div className="post-controls">
        <div className="post-interactions">
          <div onClick={toggleLike} className="doubtTile__bottomAction">
            <img
              src={
                liked
                  ? "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Flike_filled_dark.svg?alt=media&token=4c95ae2d-a2d3-41e7-9d7f-1f32693ccd11"
                  : LikeOutline
              }
              height="17px"
              style={{ filter: "none" }}
              width="17px"
              alt="comment"
            />
            <p className="doubtTile__bottomActionLabel">{getLikesCount()}</p>
          </div>

          <div
            onClick={toggleComments}
            className="doubtTile__bottomAction"
            style={{ marginLeft: "10px" }}
          >
            <img src={CommentIcon} height="17px" width="17px" alt="comment" />
            <p className="doubtTile__bottomActionLabel">
              {getCommentCount() > 999 ? "1k+" : getCommentCount()}
            </p>
          </div>

          <div
            onClick={shareBtnClick}
            className="doubtTile__bottomAction"
            style={{ marginLeft: "10px" }}
          >
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fshare.svg?alt=media&token=72424489-baba-4814-9d33-9209861fd29a"
              }
              height="17px"
              width="17px"
              alt="comment"
            />
          </div>
        </div>

        {/* Menu for Instructor Only */}

        {isInstructor ? (
          <div className="post-more-options">
            <div
              className="post-more-icon"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreHorizIcon />
            </div>
            {body.data.create_user_id === user.uid ? (
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <CustomMenuItem label={"Edit"} onClickMenuItem={editPost} />
                <CustomMenuItem
                  label={"Delete"}
                  onClickMenuItem={handleDelete}
                />
              </Menu>
            ) : (
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <CustomMenuItem
                  label="Report"
                  onClickMenuItem={() => {
                    showSnackbar("Comment Reported", "success");
                    setAnchorEl(null);
                  }}
                />
              </Menu>
            )}
          </div>
        ) : (
          <div>
            <img
              alt="bookmark icon"
              onClick={() => {
                setbookmarked(!bookmarked);
                toogleBookmarked({
                  isBookmarked: !bookmarked,
                  userID: user.uid,
                  grade: user.grade,
                  docID: body.id,
                });
              }}
              src={
                bookmarked
                  ? "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fbookmark-solid.svg?alt=media&token=3dc81aa6-61b5-4650-8e06-f3b96a464913"
                  : "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fbookmark.svg?alt=media&token=135817ce-6b66-408b-856d-97dab1f2095e"
              }
              style={{
                height: "20px",
                width: "20px",
                color: liked ? "#891010" : "grey",
              }}
            />
          </div>
        )}
      </div>
      {allowCommenting && (
        <div
          className="post-comments"
          style={{
            maxHeight: showComments ? "5000px" : 0,
            paddingBottom: comments.length > 0 ? "14px" : "0px",
          }}
        >
          <NewsFeedCommentInput
            doubtCommentCount={comments.length}
            postId={body.id}
          />
          {comments !== null &&
            comments.map(({ id, comment }, index) => (
              <NewsFeedCommentView
                deleteComment={() => {
                  deleteComments(comments[index]);
                }}
                userId={comment.user_id}
                time={comment.create_ts}
                commentText={comment.comment_text}
                postId={body.id}
                commentId={id}
                getCommentLikesCount={comment.like_count}
              />
            ))}

          {isLoadingComments && <CommentLoader />}
          {isLoadingComments && comments.length === 0 && commentsCount > 1 && (
            <CommentLoader />
          )}
          {commentsCount > 2 &&
            comments.length < commentsCount &&
            comments.length >= 2 && (
              <div style={{ display: "flex" }}>
                <button
                  className="doubts__loadMoreCommentsButton"
                  onClick={getCommentsLocal}
                >
                  <div className="doubts__loadMoreComments">
                    <p
                      style={{
                        fontWeight: "500",
                        fontSize: "13px",
                        lineHeight: "18px",
                        color: "#636466",
                      }}
                    >
                      View More Comments
                    </p>
                    <ExpandMoreIcon
                      style={{
                        height: "20px",
                        width: "20px",
                        color: "#636466",
                        marginLeft: "4px",
                      }}
                    />
                  </div>
                </button>
              </div>
            )}
        </div>
      )}
    </>
  );
};

export default PostControls;
