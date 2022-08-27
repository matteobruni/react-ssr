import React, { useState } from "react";
import "./style.scss";
import LinesEllipsis from "react-lines-ellipsis";

const TextPost = ({ body }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={
        isExpanded ? "post-text-container full" : "post-text-container"
      }
    >
      {/* <LinesEllipsis
        text={body}
        maxLine={!isExpanded ? 5 : 10000}
        ellipsis="...Read More"
        trimRight
        basedOn="letters"
      /> */}
      <div>
        <p>
          {/* {quillToPlainText(desc.length > 238 ? desc.substring(0, 238) : desc)} */}
          {/* {body.length > 238 ? body.substring(0, 238) : body} */}
          {isExpanded ? (
            <p>{body}</p>
          ) : (
            <LinesEllipsis
              text={body}
              maxLine={3}
              ellipsis="...."
              trimRight
              basedOn="letters"
            />
          )}
        </p>

        {!isExpanded ? (
          <div
            className="read-more-bg"
            style={{
              display: body?.length > 90 ? "flex" : "none",
            }}
          >
            <span className="white-gradience-space"></span>
            <span
              onClick={() => {
                setIsExpanded(true);
              }}
              className="button read-more"
            >
              (more)
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default TextPost;
