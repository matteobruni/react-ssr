import React, { useState, useContext, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from "@material-ui/icons/Close";
import SwipeableViews from "react-swipeable-views";
import { BlazeCategorySelector } from "../../index";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import {
  BlazeSessionContext,
  BookSessionContext, PustackProContext,
  ThemeContext,
  UserContext,
} from "../../../context";

import "./style.scss";
import imageGallery from "../../../assets/images/blaze/imageGallery.svg";
import { requestSession } from "../../../database";
import { ThreeDotsLoader } from "../../../components";
import {useHistory} from "react-router-dom";
import {getActiveStudentSessions, usedMinutesForToday} from "../../../database/blaze/fetch-data";
import {showSnackbar} from "../../../helpers";
import {useMediaQuery} from "react-responsive";

const useForceUpdate = () => {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value);
};

export default function BookingPopup({ isOpen = false, handleClose }) {
  const forceUpdate = useForceUpdate();
  const history = useHistory();

  const [isProTier] = useContext(UserContext).tier;
  const [_, setShowWarning] = useContext(PustackProContext).warning;
  const [, setIsOpen] = useContext(PustackProContext).value;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  const [allowNext, setAllowNext] = useContext(BookSessionContext).allowNext;
  const [subjectColors] = useContext(BlazeSessionContext).subjectColors;
  const [studentActivity] = useContext(BlazeSessionContext).studentActivity;
  const [categorySelected, setCategorySelected] =
    useContext(BookSessionContext).categorySelected;
  const [subjectSelected, setSubjectSelected] =
    useContext(BookSessionContext).subjectSelected;
  const [chapterSelected, setChapterSelected] =
    useContext(BookSessionContext).chapterSelected;

  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;

  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [isNextAllowed, setIsNextAllowed] = useState(false);
  const [doubtDetails, setDoubtDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  const handlePopupClose = (e, close) => {
    console.log(!isSubmitting || close);
    if(!isSubmitting || close) {
      setAllowNext(false);
      setCurrentTabIndex(0);
      setSubjectSelected("");
      setChapterSelected("");
      setIsNextAllowed(false);
      setCategorySelected("General");
      setDoubtDetails("");
      handleClose();
      setImages([]);
      setOpenSnack(false);
      setMessage("");
    }
  };

  // useEffect(() => {
  //   if(isSubmitting) document.body.style.pointerEvents = 'none';
  //   else document.body.style.pointerEvents = 'all';
  // }, [isSubmitting])

  useEffect(() => {
    if (currentTabIndex === 0) {
      if (allowNext && (subjectSelected || categorySelected === "Maths")) {
        setIsNextAllowed(true);
      } else {
        setIsNextAllowed(false);
      }
    } else {
      if (doubtDetails?.trim().length > 10 || images.length > 0) {
        setIsNextAllowed(true);
      } else {
        setIsNextAllowed(false);
      }
    }
  }, [
    allowNext,
    currentTabIndex,
    subjectSelected,
    categorySelected,
    doubtDetails,
    images,
  ]);

  const requestSessionFn = async () => {
    if(isSubmitting) return;

    setIsSubmitting(true);

    const activeSessions = await getActiveStudentSessions(user?.uid);
    let availableSessionLength = 1;
    if(isProTier) availableSessionLength = 5;
    if(!isProTier) {
      const usedMinutes = await usedMinutesForToday(user.uid);

      if(usedMinutes >= 480) {
        if(isSmallScreen) {
          setIsOpen(true);
        } else {
          setShowWarning({Content: (
              <>
                <h1>Daily Limit Reached</h1>
                <h2>Join Pro to get unlimited access.</h2>
              </>
            )});
        }
        handlePopupClose(null, true)
        return;
      }
    }

    if(activeSessions.length >= availableSessionLength) {
      if(isProTier) {
        showSnackbar("Please close any existing session before creating a new one.", "warning", "Session limit exceeded!");
        handlePopupClose(null, true);
        return;
      }

      if(isSmallScreen) {
        setIsOpen(true);
      } else {
        setShowWarning({Content: (
            <>
              <h2>Session Limit Reached</h2>
              <p>Join Pro to create more than one session at a time.</p>
            </>
          )});
      }
      handlePopupClose(null, true);
      return;
    }

    let _skillId = "";
    if (categorySelected === "Maths") {
      _skillId = user?.grade + "_maths";
    } else {
      _skillId =
        user?.grade +
        "_" +
        categorySelected.toLowerCase() +
        "_" +
        subjectSelected.replace(" ", "_").toLowerCase();
    }

    let gradient = subjectColors[categorySelected === "Maths" ? categorySelected : subjectSelected];
    if(!gradient) {
      gradient = subjectColors['Exam Prep.'];
    }

    const res = await requestSession({
      skillId: _skillId,
      studentId: user?.uid,
      studentName: user?.name,
      profilePic: user?.profile_url,
      topic: chapterSelected ? chapterSelected : subjectSelected ? subjectSelected : categorySelected === "Maths" ? "Mathematics" : "No Topic",
      doubtDetails,
      images,
      refundCount: studentActivity?.refundCount,
      sessionCount: studentActivity?.sessionCount,
      subject_color_gradient: gradient
    });

    if (res) {
      setIsSubmitting(false);
      handlePopupClose();
      history.push('/blaze/chat/' + res);
    }
  };

  const imageSelectionHandler = (e) => {
    const { files } = e.target;

    let _images = [];

    let _num =
      files.length + images.length > 1
        ? images.length - files.length > 0
          ? images.length - files.length
          : 1
        : files.length;

    if (files.length + images.length > 1) {
      setMessage("Only 1 image is allowed at a time");
      setOpenSnack(true);
      setTimeout(() => setOpenSnack(false), 2500);
    }

    if (images.length !== 1) {
      for (let i = 0; i < _num; i++) {
        _images[i] = {
          url: URL.createObjectURL(files[i]),
          ext: files[i].name.split(".").slice(-1)[0],
          name: files[i].name,
        };
      }
      setImages(images.concat(_images));
    }
    e.target.value = "";
  };

  const handleImageDelete = () => setImages([]);

  const handleDoubtInput = (e) => {
    let value = e.target.value;
    if(value.trim().length > 350) {
      return;
      // value = value.trim().slice(0, 350);
    }
    setDoubtDetails(value);
  }

  return (
    <div className="blaze__book__popup">
      <Dialog
        className={
          isDark
            ? "blaze__book__modal blaze__book__modal__dark"
            : "blaze__book__modal"
        }
        disableBackdropClick={currentTabIndex === 1}
        open={isOpen}
        // open={true}
        onClose={handlePopupClose}
        disableEscapeKeyDown={true}
      >
        <div
          className="popup__title"
          style={{
            position: "relative",
            background: isDark ? "#141414" : "#FFFFFF",
          }}
        >
          {currentTabIndex === 1 && (
            <div
              className="popup-back-button"
              style={{ position: "absolute", top: "1rem", left: ".5rem" }}
            >
              <ArrowBackIosIcon
                onClick={() => {
                  if(!isSubmitting) setCurrentTabIndex(0);
                }}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
          <div
            className="popup-title-label"
            style={{ color: isDark ? "#FFFFFF" : "#891010" }}
          >
            {currentTabIndex === 0 ? "Request Session" : "Add Details"}
          </div>

          <div
            className="popup-close-button"
            style={{ position: "absolute", top: "1rem", right: ".5rem" }}
          >
            <CloseIcon
              onClick={handlePopupClose}
              style={{ cursor: "pointer", height: "20px" }}
            />
          </div>
        </div>

        <SwipeableViews
          axis="x"
          index={currentTabIndex}
          scrolling={"false"}
          containerStyle={{
            background: isDark ? "#141414" : "var(--color-primary)",
          }}
          style={{
            background: isDark ? "#141414" : "var(--color-primary)",
          }}
          slideStyle={{
            background: isDark ? "#141414" : "var(--color-primary)",
          }}
          disabled={true}
          ignoreNativeScroll={true}
        >
          <div
            className={
              isDark ? "blaze__popup__content dark" : "blaze__popup__content"
            }
            style={{ background: isDark ? "#141414" : "#FFFFFF" }}
          >
            <div className="popup__category__picker">
              <BlazeCategorySelector
                forceUpdate={forceUpdate}
                isDark={isDark}
              />
            </div>
          </div>
          <div
            className={
              isDark ? "blaze__popup__content dark" : "blaze__popup__content"
            }
            style={{ background: isDark ? "#141414" : "#FFFFFF" }}
          >
            <div className="popup__category__picker">
              <p
                className={
                  isDark
                    ? "doubtTile__topLevel doubtTile__topLevel__dark"
                    : "doubtTile__topLevel"
                }
                style={{ paddingLeft: "15px" }}
              >
                {categorySelected}
                {subjectSelected ? (
                  <span
                    className={
                      isDark
                        ? "doubtTile__subject doubtTile__subject__dark"
                        : "doubtTile__subject"
                    }
                    style={{ marginLeft: "2px" }}
                  >{` •  ${subjectSelected}`}</span>
                ) : (
                  <></>
                )}
                {chapterSelected ? (
                  <span
                    style={{
                      marginLeft: "2px",
                      color: isDark ? "white" : "black",
                    }}
                  >{` •  ${chapterSelected}`}</span>
                ) : (
                  <></>
                )}
              </p>
              <textarea
                rows="6"
                placeholder="What is your doubt?"
                autoComplete={false}
                autoFocus
                name="details"
                value={doubtDetails}
                // disabled={images.length > 0 || isSubmitting}
                disabled={isSubmitting}
                onChange={handleDoubtInput}
                className="doubt__details__input"
              />
              <div className="image__picker">
                <p style={{ paddingLeft: "15px" }}>
                  <label htmlFor="image-picker">
                    <div>
                      <img
                        className="image__picker__label"
                        src={imageGallery}
                      />
                    </div>
                  </label>
                  <input
                    className="booking__image__picker"
                    accept="image/*"
                    disabled={isSubmitting}
                    type="file"
                    style={{ display: "none" }}
                    id="image-picker"
                    onChange={imageSelectionHandler}
                  />
                </p>
                <p className="character__count">{doubtDetails.trim().length} / 350</p>
              </div>
            </div>
            <div className="blaze__chat__image__preview fadeOutDown">
              {images.length > 0 &&
                images.map((image) => (
                  <div className="image__preview">
                    <CloseIcon
                      onClick={handleImageDelete}
                      className="imagePreviewDialog_closeIcon"
                    />
                    <img src={image.url} alt="X" draggable={false} />
                  </div>
                ))}
            </div>
            {openSnack && <div className="booking__warnings">{message}</div>}
          </div>
        </SwipeableViews>
        {currentTabIndex === 0 && (
          <div
            className="blaze__popup__action"
            style={{ background: isDark ? "#141414" : "#FFFFFF" }}
          >
            <button
              disabled={!isNextAllowed}
              onClick={() => setCurrentTabIndex(1)}
              className={
                isDark ? "blaze__popup__button dark" : "blaze__popup__button"
              }
              aria-label="blaze__popup__button"
            >
              Add Details
            </button>
          </div>
        )}
        {currentTabIndex === 1 && (
          <div
            className="blaze__popup__action"
            style={{ background: isDark ? "#141414" : "#FFFFFF" }}
          >
            <button
              disabled={!isNextAllowed}
              onClick={requestSessionFn}
              className={
                isDark ? "blaze__popup__button dark" : "blaze__popup__button"
              }
              aria-label="blaze__popup__button"
            >
              {isSubmitting ? <ThreeDotsLoader /> : "Submit Request"}
            </button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
