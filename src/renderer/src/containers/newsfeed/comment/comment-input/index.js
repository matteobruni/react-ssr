import React, { useState, useContext } from "react";
import "./style.scss";
import { Avatar, TextareaAutosize } from "@material-ui/core";

// -> helpers
import { showSnackbar } from "../../../../helpers";

// -> context
import { PostContext } from "../../../../context/newsfeed/PostContext";
import { UserContext } from "../../../../context/global/user-context";
import { postComment } from "../../../../database";

function CommentInput({ postId }) {
  //------------------------------------ constants hooks
  const [user] = useContext(UserContext).user;
  const [commentInput, setCommentInput] = useState("");
  const [visibleCommentsCount, setVisibleCommentsCount] = useContext(
    PostContext
  ).visibleCommentsCount;
  const [comments, setComments] = useContext(PostContext).comments;
  const [commentAdded, setCommentAdded] = useContext(PostContext).commentAdded;

  //------------------------------------ functions

  const addCommentBtnClick = async (event) => {
    let localCommentAdded = commentAdded;
    // this will fire off when we click the button
    event.preventDefault();
    if (commentInput) {
      let comment_text = commentInput;

      setCommentInput("");
      let _id = await postComment(postId, user.grade, {
        comment_text: comment_text,
        create_ts: Date.now(),
        user_id: user.uid,
      });
      setComments([
        ...comments,
        {
          comment: {
            comment_id: _id,
            comment_text: comment_text,
            create_ts: Date.now(),
            user_id: user.uid,
            like_count: 0,
          },
          id: _id,
        },
      ]);

      setCommentAdded(commentAdded + 1);
      setVisibleCommentsCount(visibleCommentsCount + 1);

      setCommentAdded(commentAdded + 1);
      localCommentAdded = localCommentAdded + 1;

      showSnackbar("Comment Added", "success");
    }
  };

  //----------------------------------- rendering JSX

  return (
    <div>
      {user && (
        <div className="commentInput">
          <div className="doubtTile__commentSection">
            <Avatar
              style={{ height: "32px", width: "32px" }}
              src={user.profile_url}
            />

            <TextareaAutosize
              className="doubtTile__commentSectionInput"
              rowsMax={4}
              aria-label="maximum height"
              value={commentInput}
              placeholder="Add a comment..."
              onChange={(event) => setCommentInput(event.target.value)}
            />

            <button
              style={{
                backgroundColor:
                  commentInput?.trim()?.length > 0 ? "#a52a2a" : "#a52a2a45",
              }}
              disabled={commentInput?.trim()?.length === 0 || commentInput === ""}
              onClick={addCommentBtnClick}
              className="doubtTile__commentSectionButton"
            >
              Add Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentInput;
