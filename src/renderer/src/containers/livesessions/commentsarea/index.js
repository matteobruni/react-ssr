import React, { useState } from "react";
import {
  LiveSessionCommentInput,
  LiveSessionCommentWrapper,
} from "../../index";
import "./style.scss";

export default function CommentsArea() {
  const [shouldAppear, setshouldAppear] = useState(false);
  const [hasComments, setHasComments] = useState(false);

  

  return (
    <div className={ hasComments ? "comments__area" : "comments__area no__comments"}>
      <div className="comments__header">
        COMMENTS {shouldAppear && <div className="red__dot"></div>}
      </div>

      <div className="comments__wrapper">
        <LiveSessionCommentWrapper setHasComments={setHasComments} appearHandler={setshouldAppear} />
      </div>

      <div className="comments__add">
        <LiveSessionCommentInput />
      </div>
    </div>
  );
}
