import React, { useState, useContext } from "react";
import { Avatar, TextareaAutosize } from "@material-ui/core";

import { showSnackbar, generateRandomString } from "../../../helpers";
import { UserContext, ThemeContext, DoubtContext } from "../../../context";
import { addComment } from "../../../database";
import "./style.scss";

function CommentInput({ doubtCommentCount, doubtId }) {
  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;

  const [visibleCommentsCount, setVisibleCommentsCount] =
    useContext(DoubtContext).visibleCommentsCount;
  const [commentDeleted] = useContext(DoubtContext).commentDeleted;
  const [comments, setComments] = useContext(DoubtContext).comments;
  const [commentAdded, setCommentAdded] = useContext(DoubtContext).commentAdded;

  const [commentInput, setCommentInput] = useState("");

  const addCommentBtnClick = async (event) => {
    let new_comment_id = generateRandomString(20);
    let localCommentAdded = commentAdded;

    event.preventDefault();
    if (commentInput) {
      let comment_text = commentInput;

      setCommentInput("");

      setVisibleCommentsCount(visibleCommentsCount + 1);

      let all_comments = comments;
      all_comments.unshift({
        id: new_comment_id,
        comment: {
          comment_text: commentInput,
          user_id: user.uid,
          create_ts: Date.now(),
        },
      });
      setComments(all_comments);
      // update comment count for doubt page
      setCommentAdded(commentAdded + 1);
      localCommentAdded = localCommentAdded + 1;

      await addComment(
        doubtId,
        new_comment_id,
        doubtCommentCount + localCommentAdded - commentDeleted,
        comment_text,
        user
      );

      showSnackbar("Comment Added", "success");
    }
  };

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
                backgroundColor: commentInput
                  ? isDark
                    ? "#bb281b"
                    : "#891010"
                  : isDark
                  ? "#bb281b47"
                  : "#89101047",
              }}
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
