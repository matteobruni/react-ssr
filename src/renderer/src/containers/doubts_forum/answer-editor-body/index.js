import React, { useState, useContext, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from "@material-ui/icons/Close";

import { DoubtContext, ThemeContext, UserContext } from "../../../context";
import { RichTextEditor } from "../../../components";

import {
  quillToReact,
  reactToQuill,
  isValidYouTubeUrl,
} from "../../../helpers";

import { Youtube, YoutubeDark } from "../../../assets";
import { postAnswer, deleteImageByUrl } from "../../../database";

import "./style.scss";

export default function AnswerEditorBody({
  doubtId,
  answerText,
  isDoubtPage,
  isDoubtPageFeed,
  answerImages,
  youtubeVideoId,
  askUserId,
}) {
  const [images] = useState([]);
  const [answerPosted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isValid, setisValid] = useState(false);
  const [addYoutubeUrl, setaddYoutubeUrl] = useState(false);
  const [richTextNonStringify, setRichTextNonStringify] = useState("");

  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;
  const [richText, setRichText] = useContext(DoubtContext).richText;
  const [answering, setAnswering] = useContext(DoubtContext).answering;
  const [youtubeUrl, setyoutubeUrl] = useContext(DoubtContext).youtubeUrl;
  const [isAnswered, setIsAnswered] = useContext(DoubtContext).isAnswered;
  const [, setDoubtAnswerUserId] = useContext(DoubtContext).doubtAnswerUserId;
  const [answerUpdated, setAnswerUpdated] =
    useContext(DoubtContext).answerUpdated;

  let clicked_image_url = "";

  useEffect(() => {
    if (answerText && !richText) setRichText(answerText);

    // for quill editor image preview
    for (let i = 0; i < 10; i++) {
      try {
        document.querySelector(
          `div.ql-editor > p:nth-child(${i}) > img`
        ).onclick = function () {
          clicked_image_url = document.querySelector(
            `div.ql-editor > p:nth-child(${i}) > img`
          ).src;

          handleClickOpen();
        };
      } catch (error) {}
    }
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const TryJSONQuillToReact = (answerText) => {
    try {
      return JSON.parse(quillToReact(answerText));
    } catch (error) {
      return answerText;
    }
  };

  const getText = (_editor) => {
    if (!isValid && _editor.getText().trim().length > 0) {
      setisValid(true);
    } else if (isValid && _editor.getText().trim().length === 0) {
      setisValid(false);
    }

    setRichText(JSON.stringify(_editor.getContents().ops));
    setRichTextNonStringify(_editor.getContents().ops);
    //setPlainText(_editor.getText());
  };

  return !answerPosted ? (
    <div className={isDark ? "answer dark" : "answer"} style={{ flex: "1" }}>
      <div
        className="edit-rich-text-container"
        style={{
          marginBottom: answering ? "0px" : "8px",
        }}
      >
        <Dialog
          maxWidth="lg"
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <div style={{ position: "relative" }}>
            <CloseIcon
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "8px",
                right: "16px",
                backgroundColor: "#FFFFFF40",
                height: "38px",
                width: "38px",
                padding: "7px",
                borderRadius: "24px",
                color: "#ffffff",
              }}
            />
            <img
              src={clicked_image_url}
              style={{
                cursor: "zoom-out",
                maxWidth: "70vw",
                maxHeight: "90vh",
                marginBottom: "0px",
              }}
              onClick={handleClose}
            />
          </div>
        </Dialog>
        <RichTextEditor
          value={TryJSONQuillToReact(
            answerUpdated ? reactToQuill(richText) : answerText
          )}
          handler={getText}
          placeholder="Write your answer"
          style={{ flex: "1", padding: "16px" }}
          isDoubtPage={isDoubtPage}
          isDoubtPageFeed={isDoubtPageFeed}
        />
        <div>
          <div className="answers__bottom">
            <div className="answers__bottom__left">
              <button
                onClick={() => {
                  if (isValid) {
                    //check if answer images are deleted

                    /// answerImages before answerImages
                    let updated_answer_images = richText.match(
                      /\bhttps?:\/\/firebase\S+/gi
                    );

                    if (updated_answer_images) {
                      // null check if there is any image left in the rich text
                      // removing all text after " to get the correct url
                      updated_answer_images.forEach(function (
                        part,
                        index,
                        theArray
                      ) {
                        updated_answer_images[index] =
                          updated_answer_images[index].split('"')[0];
                      });

                      if (answerImages) {
                        for (let i = 0; i < answerImages.length; i++) {
                          if (
                            updated_answer_images.indexOf(answerImages[i]) > -1
                          ) {
                            //In the array! no change
                          } else {
                            //Not in the array delete from storage

                            deleteImageByUrl(answerImages[i]);
                          }
                        }
                      }
                    } else {
                      // No image is left in the rich text so remove all the images which were there (if any).
                      if (answerImages)
                        for (let i = 0; i < answerImages.length; i++) {
                          deleteImageByUrl(answerImages[i]);
                        }
                    }

                    //   if (isAnswered) setAnswerUpdated(true);

                    postAnswer(
                      doubtId,
                      reactToQuill(richText),
                      images,
                      youtubeUrl,
                      updated_answer_images,
                      isAnswered,
                      user,
                      askUserId
                    );

                    // updating doubt answer id to give instructor edit answer options.
                    setDoubtAnswerUserId(user.uid);
                    setAnswerUpdated(true);
                    setIsAnswered(true);
                    setAnswering(false);
                  } else {
                  }
                }}
                className="answers__bottomButton"
              >
                {isAnswered ? "Update" : "Submit"}
              </button>
              <button
                className="edit-answer-cancel-button"
                onClick={() => {
                  if (isValidYouTubeUrl(youtubeVideoId) && answerUpdated) {
                    setyoutubeUrl(`http://youtu.be/${youtubeVideoId}`);
                  } else {
                    setyoutubeUrl(null);
                  }

                  // check if additional images uploaded and delete if any

                  // get all the slected images from the rich text

                  let updated_answer_images = [];
                  for (let i = 0; i < richTextNonStringify.length; i++) {
                    if (richTextNonStringify[i].insert.image) {
                      updated_answer_images.push(
                        richTextNonStringify[i].insert.image
                      );
                    }
                  }

                  if (updated_answer_images) {
                    // get all the answer images already selected in firestore
                    // check which images in rich text are not in answer images and delete them.

                    if (answerImages) {
                      for (let i = 0; i < updated_answer_images.length; i++) {
                        if (answerImages.includes(updated_answer_images[i])) {
                          //in the array! no change
                        } else {
                          //not in the array delete from storage
                          deleteImageByUrl(updated_answer_images[i]);
                        }
                      }
                    } else if (updated_answer_images.length > 0) {
                      // Rich Text have Images but Answer Images have none for cancel delete all the images from firestore.
                      for (let i = 0; i < updated_answer_images.length; i++) {
                        deleteImageByUrl(updated_answer_images[i]);
                      }
                    }
                  }

                  setAnswering(false);
                }}
              >
                Cancel
              </button>
            </div>

            <div
              className="answers__youtube__section"
              style={{ display: "flex" }}
            >
              {addYoutubeUrl ? (
                <div
                  style={{
                    display: "flex",
                    flex: "1",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <textarea
                    rows="1"
                    className="answers__textarea"
                    onChange={(e) => {
                      setyoutubeUrl(e.target.value);
                    }}
                    value={youtubeUrl ? youtubeUrl : ""}
                    placeholder="Enter Youtube Link..."
                    style={{ resize: "none" }}
                  ></textarea>
                  {youtubeUrl && youtubeUrl !== "" ? (
                    <CloseIcon
                      onClick={() => setyoutubeUrl("")}
                      style={{
                        height: "20px",
                        width: "20px",
                        marginRight: "8px",
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <></>
              )}

              <img
                onClick={() => setaddYoutubeUrl(!addYoutubeUrl)}
                className="answer__youtube_icon"
                style={{ height: "30px", width: "30px" }}
                src={
                  youtubeUrl
                    ? isValidYouTubeUrl(youtubeUrl)
                      ? Youtube
                      : YoutubeDark
                    : YoutubeDark
                }
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
