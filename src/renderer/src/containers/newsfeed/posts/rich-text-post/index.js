import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { quillToReact } from "../../../../helpers";
import "./style.scss";

const RichTextPost = ({ text }) => {
  const [isExpanded] = useState(true);

  var richText = text ? quillToReact(text) : "";

  let isMalformed = false;

  var parsedData;

  try {
    parsedData = JSON.parse(richText);
  } catch (e) {
    isMalformed = false;
  }

  return (
    <div className="rich-text-post-container">
      {!isMalformed && (
        <ReactQuill value={parsedData || ""} theme="bubble" readOnly={true} />
      )}

      {isMalformed && (
        <div className="something-went-wrong">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Something went wrong</h3>
        </div>
      )}

      {!isExpanded ? (
        <div
          className="read-more-bg"
          style={{
            display: quillToReact(text).length > 0 ? "flex" : "",
            cursor: "pointer",
          }}
        ></div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RichTextPost;
