import React from "react";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

const RichTextEditor = ({ handler, onKeyUp, placeholder, value }) => {
  const richTextHandler = (_content, _delta, _source, editor) => {
    handler(editor);
  };

  var modules = {
    toolbar: [
      ["bold", "italic"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote"],
    ],
  };

  var formats = [
    "size",
    "bold",
    "italic",
    "blockquote",
    "list",
    "bullet",
    "script",
  ];

  return (
    <ReactQuill
      onKeyUp={onKeyUp}
      placeholder={placeholder}
      theme="snow"
      onChange={richTextHandler}
      formats={formats}
      modules={modules}
      defaultValue={value}
    />
  );
};

export default RichTextEditor;
