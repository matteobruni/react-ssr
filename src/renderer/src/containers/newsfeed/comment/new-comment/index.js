import React, { useState, useRef, useContext } from "react";
import SendIcon from "@material-ui/icons/Send";
import { TextareaAutosize } from "@material-ui/core";
import { postComment } from "../../../../database";
import { UserContext } from "../../../../context/global/user-context";

const NewComment = ({ id, setComments }) => {
  const [user] = useContext(UserContext).user;
  const [commentText, setCommentText] = useState("");
  const inputEl = useRef(null);

  async function submitHandler(e) {
    e.preventDefault();
    if (commentText.trim().length > 0) {
      var _local = commentText;
      setCommentText("");

      await postComment(id, user.grade, {
        comment_text: _local,
        create_ts: Date.now(),
        uid: user.uid,
        like_count: 0,
      });

      setComments({
        comment_text: _local,
        create_ts: Date.now(),
        uid: user.uid,
        like_count: 0,
      });
    }

    inputEl.current.innerText = "";
  }

  return (
    <div>
      <form className="post-new-comment" onSubmit={submitHandler}>
        <div className="user-avatar">
          <img src={user.profile_url} alt={`${user.profile_url}'s Avatar`} />
        </div>

        <div className="user-input-wrapper">
          <div placeholder="Write your comment.." value={commentText}></div>

          <TextareaAutosize
            className="doubtTile__commentSectionInput"
            ref={inputEl}
            rowsMax={4}
            aria-label="maximum height"
            value={commentText}
            placeholder="Add a comment..."
            onChange={(event) => setCommentText(event.target.value)}
          />
        </div>

        <div className="user-comment-submit">
          <button
            onClick={submitHandler}
            type="submit"
            className="user-comment-submit-btn"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewComment;
