import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Fade from "@material-ui/core/Fade";
import Resizer from "react-image-file-resizer";
import ImageIcon from "@material-ui/icons/Image";
import CloseIcon from "@material-ui/icons/Close";
import Snackbar from "@material-ui/core/Snackbar";
import CancelIcon from "@material-ui/icons/Cancel";
import { Dialog, Hidden } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import { DoubtAndImages } from "./doubt-and-images";
import { CategorySelection } from "./categorie-selection";

import { ThreeDotsLoader } from "../../../components";
import { generateUrlFromString, removeAtIndex } from "../../../helpers";
import { askDoubt, getClassChapters, updateDoubt } from "../../../database";

import {
  AskYourDoubtContext,
  SidebarContext,
  ThemeContext,
  UserContext,
} from "../../../context";

import "./style.scss";

function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value);
}

export default function AskDoubtPopup({
  applySelection,
  setMobileOpen,
  updateSidebarSelectionOnQuestionUpdated,
}) {
  const [sortBy] = useContext(SidebarContext).sortBy;
  const [selectedSubject, setSelectedSubject] =
    useContext(SidebarContext).selectedSubject;
  const [isAnswered] = useContext(SidebarContext).isAnswered;
  const [, setShowMyDoubts] = useContext(SidebarContext).showMyDoubts;
  const [topLevel, setTopLevel] = useContext(SidebarContext).topLevel;
  const [selectedChapter] = useContext(SidebarContext).selectedChapter;
  const [, setSortByDBString] = useContext(SidebarContext).sortByDBString;
  const [, setUpdateCategoriesList] =
    useContext(SidebarContext).updateCategoriesList;

  const [smallScreenTopLevel] = useContext(SidebarContext).smallScreenTopLevel;
  const [smallScreenSelectedSubject] =
    useContext(SidebarContext).smallScreenSelectedSubject;
  const [smallScreenSelectedChapter] =
    useContext(SidebarContext).smallScreenSelectedChapter;

  const [smallScreenIsAnswered] =
    useContext(SidebarContext).smallScreenIsAnswered;
  const [smallScreenSortBy] = useContext(SidebarContext).smallScreenSortBy;

  const [user] = useContext(UserContext).user;
  const [isDarkMode] = useContext(ThemeContext).theme;

  const [chapterSelected, setChapterSelected] =
    useContext(AskYourDoubtContext).chapterSelected;
  const [subjectSelected, setSubjectSelected] =
    useContext(AskYourDoubtContext).subjectSelected;
  const [categorySelected, setCategorySelected] =
    useContext(AskYourDoubtContext).categorySelected;
  const [doubtQuestion, setDoubtQuestion] =
    useContext(AskYourDoubtContext).doubtQuestion;
  const [updatedDoubtQuestion] =
    useContext(AskYourDoubtContext).updatedDoubtQuestion;
  const [images, setImages] = useContext(AskYourDoubtContext).images;
  const [updating, setUpdating] = useContext(AskYourDoubtContext).updating;
  const [newImages, setNewImages] = useContext(AskYourDoubtContext).newImages;
  const [showCategoriePicker, setShowCategoriePicker] =
    useContext(AskYourDoubtContext).showCategoriePicker;
  const [doubtId] = useContext(AskYourDoubtContext).doubtId;
  const [isLoading, setIsLoading] = useContext(AskYourDoubtContext).isLoading;

  const [slug] = useContext(AskYourDoubtContext).slug;
  const [, setOnBack] = useContext(AskYourDoubtContext).onBack;
  const [open, setOpen] = useContext(AskYourDoubtContext).open;
  const [, setChapters] = useContext(AskYourDoubtContext).chapters;
  const [isDoubtAnswered] = useContext(AskYourDoubtContext).isDoubtAnswered;
  const [allowNext, setAllowNext] = useContext(AskYourDoubtContext).allowNext;

  const [, setShowClose] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [chaptersLoading, setChaptersLoading] = useState(false);

  let history = useHistory();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    forceUpdate();
  }, [doubtQuestion]);

  function sendToUrl(string) {
    history.push(string);
  }

  const handleClose = () => {
    if (!isLoading) {
      setOpen(false);
      settingShowCategoriePicker();
      setOnBack(false);

      setUpdating(false);
      setImages([]);
      setNewImages([]);
    }
  };

  const handleSnackClose = () => {
    setOpenSnack(false);
  };

  function settingShowCategoriePicker() {
    setChapterSelected("");
    setCategorySelected("");
    setSubjectSelected("");
    setShowClose(true);
    setDoubtQuestion("");
    setShowCategoriePicker(true);
  }

  const resizeDoubtPhoto = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        "JPEG",
        75,
        0,
        (uri) => resolve(uri),
        "file"
      );
    });

  // Handling Image Selection
  const imageSelectionHandler = async (e) => {
    let _images = [];
    const isExceeding =
      e.target.files.length + (newImages?.length + images?.length) > 1;

    let _num = isExceeding
      ? images.length - e.target.files.length > 0
        ? images.length - e.target.files.length
        : 1
      : e.target.files.length;

    if (!isExceeding) {
      for (let i = 0; i < _num; i++) {
        let doubtPhoto = await resizeDoubtPhoto(e.target.files[i]);

        _images[i] = {
          url: URL.createObjectURL(doubtPhoto),
          ext: doubtPhoto.name.split(".").slice(-1)[0],
        };
      }

      return updating
        ? setNewImages(newImages.concat(_images))
        : setImages(images.concat(_images));
    } else {
      setOpenSnack(true);
      setSnackMessage("A maximum of 1 image is allowed in a single post");
      setTimeout(() => setOpenSnack(false), 2500);
    }
  };

  const onNextButtonClick = () => {
    if (categorySelected) {
      setShowCategoriePicker(false);
    }
  };

  const onPostButtonClick = async () => {
    const question = updating ? updatedDoubtQuestion : doubtQuestion;

    if (question.length >= 25) {
      setIsLoading(true);

      if (updating) {
        let doubtUrl;
        if (doubtQuestion === updatedDoubtQuestion) {
          doubtUrl = slug;
        } else {
          doubtUrl = `${generateUrlFromString(
            updatedDoubtQuestion
          )}-${Math.floor(Math.random() * 1000 + 1)}`;
        }

        setIsLoading(true);
        await updateDoubt({
          categorySelected: categorySelected,
          chapterSelected: chapterSelected,
          subjectSelected:
            categorySelected === "Maths" ? null : subjectSelected,
          doubt_question: updatedDoubtQuestion,
          files: newImages,
          doubtId: doubtId,
          imagesFromBeforeUrl: images,
          doubt_url: doubtUrl,
          user: user,
        });

        handleClose();
        setIsLoading(false);

        if (updating) {
          window.location = `/doubts/${doubtUrl}`;
        } else {
          sendToUrl(`/doubts/${doubtUrl}`);
        }

        updateSidebarSelectionOnQuestionUpdated(
          categorySelected,
          subjectSelected,
          chapterSelected,
          isDoubtAnswered
        );
      } else {
        setIsLoading(true);

        let generated_doubt_url = await askDoubt(
          categorySelected,
          chapterSelected,
          subjectSelected,
          doubtQuestion,
          images,
          user
        );

        setIsLoading(false);
        handleClose();
        sendToUrl(
          `/doubts?toplevel=General&chapter=General&subject=General&answered=true`
        );
        setTopLevel("General");
        setUpdateCategoriesList(true);
        setSelectedSubject("My Doubts");
        setSortByDBString("recommendation_score");
        setShowMyDoubts(true);
      }
    } else {
      setOpenSnack(true);
      setSnackMessage(
        "Question should have atleast 25 characters and at most 350 characters"
      );
    }
  };

  const getComputedColor = () => {
    if (showCategoriePicker) {
      if (allowNext) {
        return "#fff";
      } else {
        return "#bcc0c4";
      }
    } else {
      if (updating) {
        if (updatedDoubtQuestion.length <= 350) {
          return "#fff";
        } else {
          return "#bcc0c4";
        }
      } else {
        if (doubtQuestion.length && !isLoading <= 350) {
          return "#fff";
        } else {
          return "#bcc0c4";
        }
      }
    }
  };

  const getComputedBackgroundColor = () => {
    if (showCategoriePicker) {
      if (allowNext) {
        return isDarkMode ? "#bb281b" : "#891010";
      } else {
        return isDarkMode ? "#484848" : "#e3e6ea";
      }
    } else {
      if (updating) {
        if (
          updatedDoubtQuestion.length <= 350 &&
          updatedDoubtQuestion.length > 25
        ) {
          return isDarkMode ? "#bb281b" : "#891010";
        } else {
          return isDarkMode ? "#484848" : "#e3e6ea";
        }
      } else {
        if (
          doubtQuestion.length <= 350 &&
          doubtQuestion.length >= 25 &&
          !isLoading
        ) {
          return isDarkMode ? "#bb281b" : "#891010";
        } else {
          return isDarkMode ? "#484848" : "#e3e6ea";
        }
      }
    }
  };

  useEffect(() => {
    if (updating) {
      setChaptersLoading(true);
      getChapters();
    }
  }, [updating]);

  useEffect(() => {
    const question = updating ? updatedDoubtQuestion : doubtQuestion;

    if (question.length < 25 || question.length > 350) {
      setAllowNext(false);
    } else {
      setAllowNext(true);
    }
  }, [doubtQuestion, updatedDoubtQuestion, updating]);

  async function getChapters() {
    let chapters = await getClassChapters(user?.grade);
    setChapters(chapters);
    setChaptersLoading(false);
  }

  const showApplyButton = () => {
    if (
      smallScreenTopLevel !== topLevel ||
      smallScreenSelectedSubject !== selectedSubject ||
      smallScreenSelectedChapter !== selectedChapter ||
      smallScreenIsAnswered !== isAnswered ||
      smallScreenSortBy !== sortBy
    )
      return true;
    return false;
  };

  return (
    <div>
      <div className="askDoubtPopup">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Hidden smUp implementation="js">
            {showApplyButton() && (
              <button
                onClick={() => {
                  setMobileOpen();
                  applySelection();
                }}
                className="askDoubtPopup__apply_btn"
              >
                <p>
                  <CheckCircleIcon /> Apply
                </p>
              </button>
            )}
          </Hidden>
        </div>
        <Dialog
          className={isDarkMode ? "new-post-modal dark" : "new-post-modal"}
          disableBackdropClick
          open={open}
          onClose={handleClose}
        >
          <div
            className={
              isDarkMode
                ? "ask-doubt-popoup-content ask-doubt-popoup-content-dark"
                : "ask-doubt-popoup-content"
            }
          >
            <div className="ask-doubt-popoup-loading-container">
              {isLoading ? (
                <div style={{ marginTop: "35px", marginLeft: "42.7%" }}>
                  <ThreeDotsLoader />
                </div>
              ) : (
                <></>
              )}
              <p
                className="ask-doubt-popoup-loading-label"
                style={{
                  display: isLoading ? "block" : "none",
                  color: isDarkMode ? "white" : "black",
                }}
              >
                {updating ? "Updating" : "Posting"}
              </p>
            </div>

            <div>
              <div
                className={
                  isDarkMode
                    ? "popup-title-label popup-title-label-dark"
                    : "popup-title-label"
                }
                style={{ opacity: isLoading ? 0.3 : 1 }}
              >
                <p>{updating ? "Edit Your Doubt" : "Ask Your Doubt"}</p>
              </div>
              <div
                className="askDoubtPopup__Top"
                style={{ opacity: isLoading ? 0.3 : 1 }}
              >
                <div
                  className={
                    isDarkMode
                      ? "askDoubtPopup__TopLeft left__popup__Dark"
                      : "askDoubtPopup__TopLeft"
                  }
                >
                  {!showCategoriePicker ? (
                    <ArrowBackIosIcon
                      onClick={() => {
                        if (!isLoading && !chaptersLoading) {
                          setShowCategoriePicker(true);
                          setChapterSelected(chapterSelected);
                          updating && setAllowNext(true);
                          setOnBack(true);
                        }
                      }}
                      style={{
                        color: isDarkMode ? "white" : "black",
                        cursor: isLoading ? "default" : "pointer",
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </div>

                <div
                  className={
                    isDarkMode
                      ? "askDoubtPopup__TopRight right__popup__Dark"
                      : "askDoubtPopup__TopRight"
                  }
                >
                  <CloseIcon
                    onClick={handleClose}
                    style={{
                      color: isDarkMode ? "white" : "black",
                      cursor: isLoading ? "default" : "pointer",
                      height: "20px",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="hr"
              style={{
                marginTop: "10px",
                borderBottom: `1.5px solid ${
                  isDarkMode ? "#44444450" : "#ddd"
                }`,
              }}
            ></div>
            <div
              className={"ask-your-doubt-popup"}
              style={{ opacity: isLoading ? 0.3 : 1 }}
            >
              {showCategoriePicker ? (
                <CategorySelection
                  forceUpdate={forceUpdate}
                  isDark={isDarkMode}
                />
              ) : (
                <div>
                  <DoubtAndImages forceUpdate={forceUpdate} />
                  {showCategoriePicker ? (
                    <></>
                  ) : (
                    <div className="new-doubt-image-preview-container">
                      {updating ? (
                        newImages?.length === 1 ? (
                          <div className="image-preview-thumbnail-container">
                            <CancelIcon onClick={() => setNewImages([])} />
                            <img
                              className="preview-image-thumbnail"
                              src={newImages[0]?.url}
                              alt="Pustack new img"
                            />
                          </div>
                        ) : (
                          <div>
                            {newImages?.length > 1 &&
                              newImages?.map((img, index) => (
                                <div
                                  key={index}
                                  className="image-preview-thumbnail-container"
                                >
                                  <CancelIcon
                                    onClick={() => {
                                      const _new_array = removeAtIndex(
                                        images,
                                        index
                                      );
                                      setImages(_new_array);
                                      forceUpdate();
                                    }}
                                  />
                                  <img
                                    className="preview-image-thumbnail"
                                    src={img.url}
                                    alt="Pustack New Post"
                                  />
                                </div>
                              ))}
                          </div>
                        )
                      ) : (
                        <></>
                      )}

                      {images?.length > 1 ? (
                        images?.map((img, index) => (
                          <div
                            key={index}
                            className="image-preview-thumbnail-container"
                          >
                            <CancelIcon
                              onClick={() => {
                                var _new_array = removeAtIndex(images, index);
                                setImages(_new_array);
                                forceUpdate();
                              }}
                            />
                            <img
                              className="preview-image-thumbnail"
                              src={updating ? img : img.url}
                              alt="Pustack New Post"
                            />
                          </div>
                        ))
                      ) : images?.length === 1 ? (
                        <div className="image-preview-thumbnail-container">
                          <CancelIcon onClick={() => setImages([])} />
                          <img
                            className="preview-image-thumbnail"
                            src={updating ? images[0] : images[0].url}
                            alt="Pustack Old Post"
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}

                  {showCategoriePicker ? (
                    <></>
                  ) : (
                    <div
                      className={
                        isDarkMode
                          ? "askYourDoubt__AddToDoubt__Wrapper darkWrapper"
                          : "askYourDoubt__AddToDoubt__Wrapper"
                      }
                    >
                      <div
                        className={
                          isDarkMode
                            ? "askYourDoubt__AddToDoubt__dark askYourDoubt__AddToDoubt"
                            : "askYourDoubt__AddToDoubt"
                        }
                        style={{ visibility: isLoading ? "hidden" : "visible" }}
                      >
                        <p className="askYourDoubt__AddToDoubt__label">
                          <label htmlFor="file-input">Add to Your Doubt</label>
                        </p>
                        <div className="askDoubtQuestion__bottom">
                          <div className="image-upload-answer">
                            <label htmlFor="file-input">
                              <ImageIcon
                                className="askDoubtQuestion__bottom_add__image__icon"
                                style={{
                                  height: "26px",
                                  width: "26px",
                                  color: isDarkMode ? "#bb281b" : "#891010",
                                }}
                              />
                            </label>
                            <input
                              id="file-input"
                              type="file"
                              accept="image/*"
                              multiple="multiple"
                              onChange={imageSelectionHandler}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="ask-doubt-bottom-bar"
              style={{
                marginTop: showCategoriePicker ? "16px" : "0px",
                background: isDarkMode
                  ? "rgba(20, 20, 20, 0.75)"
                  : "rgba(255, 255, 255, 0.75)",
              }}
            >
              <button
                disabled={!allowNext}
                onClick={() => {
                  if (allowNext) {
                    if (!isLoading)
                      if (showCategoriePicker) {
                        onNextButtonClick();
                      } else if (
                        updating
                          ? updatedDoubtQuestion.length <= 350
                          : doubtQuestion.length <= 350
                      ) {
                        onPostButtonClick();
                      }
                  }
                }}
                className="askDoubtPopup__primary"
                style={{
                  backgroundColor: getComputedBackgroundColor(),
                  color: getComputedColor(),
                }}
              >
                <p>
                  {showCategoriePicker
                    ? "Next"
                    : updating
                    ? isLoading
                      ? "Updating"
                      : "Update"
                    : isLoading
                    ? "Posting"
                    : "Post"}
                </p>
              </button>
            </div>
          </div>
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={openSnack}
            onClose={handleSnackClose}
            message={snackMessage}
            key={"bottom" + "center"}
            TransitionComponent={Fade}
            className={isDarkMode ? "snackbar snackbarDark" : "snackbar"}
          />
        </Dialog>
      </div>
    </div>
  );
}
