import React, { useState, useEffect, useRef, useContext } from "react";
import swal from "sweetalert";
import { v4 as uuidv4 } from "uuid";
import Axios from "axios";
import { storage } from "../../../../../firebase_config";
import "firebase/firestore";
import "./style.scss";

import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import Avatar from "@material-ui/core/Avatar";
import CloseIcon from "@material-ui/icons/Close";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Dialog } from "@material-ui/core";
import Resizer from "react-image-file-resizer";

import {
  VideoPost,
  LinkPost,
  YoutubePost,
  RichTextEditor,
} from "../../../../../containers";

import { Youtube, YoutubeDark } from "../../../../../assets";

import {
  uploadImagePost,
  uploadVideoPost,
  uploadYoutubePost,
  uploadPollPost,
  uploadLinkPost,
  uploadRichTextPost,
  updateRichTextPost,
  updateVideoThenPost,
  updateYoutubePost,
  updatePollPost,
  updateLinkPost,
  updateImagePost,
} from "../../../../../database";

import {
  linkParser,
  getYoutubeID,
  removeAtIndex,
  getVideoCover,
  quillToReact,
  isValidYouTubeUrl,
  showSnackbar,
} from "../../../../../helpers";
import { UserContext } from "../../../../../context/global/user-context";
import {
  CreatePostContext,
  NewsFeedContext,
  ThemeContext,
} from "../../../../../context";
import { ThreeDotsLoader } from "../../../../../components";
import ImageView from "./image-view";

function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value);
}

const NewPostModal = ({ isOpen, closeModal, modalType, onCreate }) => {
  const [isValid, setisValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChoosingGroups, setIsChoosingGroups] = useState(false);
  const availableGroups = [
    "Vocab",
    "Facts",
    "Mental Health",
    "Maths",
    "Why Study __?",
    "Free Period",
  ];

  const forceUpdate = useForceUpdate();

  const [user] = useContext(UserContext).user;

  const [posts, setPosts] = useContext(NewsFeedContext).posts;

  const [endTs] = useContext(CreatePostContext).endTs;
  const [currentLink, setCurrentLink] =
    useContext(CreatePostContext).currentLink;
  const [postId] = useContext(CreatePostContext).postId;
  const [postInfo] = useContext(CreatePostContext).postInfo;
  const [, setUpdatedRichText] = useContext(CreatePostContext).richText;
  const [, setIsGeneratingMetadata] =
    useContext(CreatePostContext).isGeneratingMetadata;
  const [linkMetadata, setLinkMetadata] =
    useContext(CreatePostContext).linkMetadata;
  const [pollDays, setPollDays] = useContext(CreatePostContext).pollDays;
  const [plainText, setPlainText] = useContext(CreatePostContext).plainText;
  const [pollOptions, setPollOptions] =
    useContext(CreatePostContext).pollOptions;
  const [addYoutubeUrl, setaddYoutubeUrl] =
    useContext(CreatePostContext).addYoutubeUrl;
  const [isPoll, setIsPoll] = useContext(CreatePostContext).isPoll;
  const [youtubeID, setYoutubeID] = useContext(CreatePostContext).youtubeID;
  const [, setType] = useContext(CreatePostContext).type;
  const [richText, setRichText] = useContext(CreatePostContext).richText;
  const [isUpdating, setIsUpdating] = useContext(CreatePostContext).isUpdating;
  const [selectedGroups, setSelectedGroups] =
    useContext(CreatePostContext).selectedGroups;
  const [tempGroups, setTempGroups] = useContext(CreatePostContext).tempGroups;
  const [youtubeUrl, setyoutubeUrl] = useContext(CreatePostContext).youtubeUrl;
  const [, setIsUpdated] = useContext(CreatePostContext).isUpdated;
  const [images, setImages] = useContext(CreatePostContext).images;
  const [newImages, setNewImages] = useContext(CreatePostContext).newImages;
  const [video, setVideo] = useContext(CreatePostContext).video;

  const [isDarkMode] = useContext(ThemeContext).theme;

  const imagePicker = useRef();
  const videoPicker = useRef();

  const [percentageUploaded, setPercentageUploaded] = useState(0);

  let timeout = null;
  let example_options = ["11", "12", "15", "8"];

  const postButtonDisabled =
    isLoading ||
    plainText?.trim()?.length === 0 ||
    (isPoll && (pollOptions[0].option === "" || pollOptions[1].option === ""));

  useEffect(() => {
    if (modalType === 1) {
      setTimeout(() => imagePicker.current.click());
    }
    if (modalType === 2) {
      setTimeout(() => videoPicker.current.click());
    }
    if (modalType === 3) {
      setTimeout(() => setIsPoll(true));
    }

    if (!isUpdating) {
      const tagsLabel = JSON.parse(localStorage.getItem("tags_label"));

      setType(modalType);
    }
  }, []);

  const TryJSONQuillToReact = (answerText) => {
    try {
      return JSON.parse(quillToReact(answerText));
    } catch (error) {
      return answerText;
    }
  };

  const getText = (editor) => {
    if (!isValid && editor.getText().trim().length > 0) {
      if (isPoll) {
        let _valid = true;

        pollOptions.forEach((option) => {
          if (option.option === "") {
            _valid = false;
          }
        });

        if (_valid) {
          setisValid(true);
        }
      } else {
        setisValid(true);
      }
    } else if (isValid && editor.getText().trim().length === 0) {
      setisValid(false);
    }
    setUpdatedRichText(JSON.stringify(editor.getContents().ops));
    setRichText(JSON.stringify(editor.getContents().ops));
    setPlainText(editor.getText());
    checkLinksOnStoppedTyping();
  };

  const getMetadata = (link) => {
    setIsGeneratingMetadata(true);
    forceUpdate();

    const _url = link.replace("https://", "").replace("http://", "");
    Axios.post(
      "https://us-central1-avian-display-193502.cloudfunctions.net/newsfeed/metadata",
      { url: _url }
    )
      .then((e) => {
        setLinkMetadata(e.data);
        setIsGeneratingMetadata(false);
        forceUpdate();
      })
      .catch((e) => {
        console.error(e);
        setIsGeneratingMetadata(false);
        forceUpdate();
      });
  };

  const checkLinksOnStoppedTyping = () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      if (linkParser.test(plainText)) {
        let _link = linkParser.exec(plainText)[0];

        if (currentLink !== _link) {
          setCurrentLink(_link);

          if (_link?.includes(".pdf")) {
            setLinkMetadata({
              url: _link,
              image: "",
              page_title: null,
            });
          } else if (getYoutubeID(_link) !== false) {
            setYoutubeID(getYoutubeID(_link));
          } else {
            getMetadata(_link);
          }
        }
      }
    }, 0);
  };

  const close = () => {
    if (isUpdating) {
      setIsUpdating(false);
    } else {
      setUpdatedRichText("");
    }

    setNewImages([]);
    setIsLoading(false);
    setIsPoll(false);
    setPlainText("");
    setPollOptions([{ option: "" }, { option: "" }]);
    setPollDays(1);
    setVideo("");
    setCurrentLink(null);
    setImages([]);
    setYoutubeID(null);
    setRichText("");
    setIsUpdating(false);
    setSelectedGroups([]);
    setaddYoutubeUrl(false);
    setYoutubeID(null);
    setyoutubeUrl("");
    closeModal();
  };

  const removeOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(removeAtIndex(pollOptions, index));
      forceUpdate();
    }
  };

  const pollOptionHandler = (e, index) => {
    let _temp = pollOptions;

    _temp[index] = {
      option: e.target.value,
    };

    let _valid = true;

    _temp.forEach((option) => {
      if (option.option === "") {
        _valid = false;
      }
    });

    if (_valid && richText !== "") {
      setisValid(true);
    } else if (isValid) {
      setisValid(false);
    }

    setPollOptions(_temp);
    forceUpdate();
  };

  const onUpdate = (getPostInfo) => {
    //TODO
    // remove post from feed
    let _temp = posts;

    let postIndex = 0;
    _temp = _temp.filter(function (_, index) {
      postIndex = index;
      return _.id !== getPostInfo.id;
    });

    // add to the feed
    setPosts(_temp);
    setPosts([getPostInfo, ..._temp]);
  };

  const uploadVideoThenPost = async ({
    user,
    groups,
    text,
    json,
    file,
    onCreate,
  }) => {
    let path = `newsfeed/videos/${uuidv4()}.${file.ext}`;

    let uploadTask = storage
      .ref()
      .child(path)
      .put(
        await fetch(file.url)
          .then((r) => r.blob())
          .catch((error) => console.error(`Error ${error}`))
      );

    let _url = uploadTask.on(
      "state_changed",
      function (snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentageUploaded(parseInt(progress));
        switch (
          snapshot.state
          // case firestore.storage.TaskState.PAUSED: // or 'paused'
          //   console.log("Upload is paused");
          //   break;
          // case firebase.storage.TaskState.RUNNING: // or 'running'
          //   console.log("Upload is running");
          //   break;
        ) {
        }
      },
      function (error) {
        console.error(`Error ${error}`);
      },
      function () {
        uploadTask.snapshot.ref
          .getDownloadURL()
          .then(function (url) {
            uploadVideoPost({
              user: user,
              groups: groups,
              text: text,
              json: json,
              file: file,
              onCreate: onCreate,
              video_url: url,
            }).then(() => close());
          })
          .catch((error) => console.error(`Error ${error}`));
      }
    );
  };

  const updatePost = async () => {
    setIsLoading(true);
    if (images.length > 0) {
      await updateImagePost({
        postId: postId,
        body: postInfo,
        user: user,
        groups: selectedGroups,
        text: plainText,
        imagesFromBeforeUrl: newImages,
        files: images,
        json: richText,
        onUpdate: onUpdate,
      }).then(() => close());
    } else if (video !== "") {
      await updateVideoThenPost({
        postId: postId,
        body: postInfo,
        user: user,
        groups: selectedGroups,
        text: plainText,
        json: richText,
        file: video,
        onUpdate: onUpdate,
      }).then(() => close());
    } else if (youtubeID !== null) {
      await updateYoutubePost({
        postId: postId,
        body: postInfo,
        user: user,
        groups: selectedGroups,
        text: plainText.replace(currentLink, ""),
        json: richText,
        youtubeID: youtubeID,
        onUpdate: onUpdate,
      }).then(() => close());
    } else if (isPoll) {
      let _options = [];

      pollOptions.forEach((o) =>
        _options.push({
          vote_count: 0,
          option: o.option,
        })
      );

      await updatePollPost({
        postId: postId,
        body: postInfo,
        user: user,
        groups: selectedGroups,
        text: plainText,
        options: _options,
        days: pollDays,
        onUpdate: onUpdate,
        defaultEndTs: endTs,
      }).then(() => close());
    } else if (linkMetadata !== null) {
      await updateLinkPost({
        postId: postId,
        body: postInfo,
        user: user,
        groups: selectedGroups,
        linkMetadata: linkMetadata,
        plainText: plainText,
        richText: richText,
        onUpdate: onUpdate,
      }).then(() => close());
    } else {
      await updateRichTextPost({
        postId: postId,
        body: postInfo,
        user: user,
        groups: selectedGroups,
        json: richText,
        onUpdate: onUpdate,
      }).then(() => close());
    }

    setIsUpdated(true);

    if (richText) {
      setUpdatedRichText(richText);
      setRichText(richText);
    }
  };

  const uploadPost = async () => {
    setIsLoading(true);
    if (images.length > 0) {
      await uploadImagePost({
        user: user,
        groups: selectedGroups,
        text: plainText,
        files: images,
        json: richText,
        onCreate: onCreate,
      }).then(() => close());
    } else if (video !== "") {
      await uploadVideoThenPost({
        user: user,
        groups: selectedGroups,
        text: plainText,
        json: richText,
        file: video,
        onCreate: onCreate,
      });
    } else if (youtubeID !== null) {
      await uploadYoutubePost(
        user,
        selectedGroups,
        plainText.replace(currentLink, ""),
        richText,
        youtubeID,
        onCreate
      ).then(() => close());
    } else if (isPoll) {
      let _options = [];

      pollOptions.forEach((o) => {
        if (o.option) {
          _options.push({
            vote_count: 0,
            option: o.option,
          });
        }
      });

      if (plainText && pollOptions.length >= 2) {
        await uploadPollPost(
          user,
          selectedGroups,
          plainText,
          _options,
          pollDays,
          onCreate
        ).then(() => close());
      } else {
        showSnackbar("Please Add Poll Question and 2 Options", "error");
        setIsLoading(false);
      }
    } else if (linkMetadata !== null) {
      await uploadLinkPost({
        user: user,
        groups: selectedGroups,
        linkMetadata: linkMetadata,
        plainText: plainText,
        richText: richText,
        onCreate: onCreate,
      }).then(() => close());
    } else {
      await uploadRichTextPost(
        user,
        selectedGroups,
        plainText,
        richText,
        onCreate,
        images,
        youtubeID
      ).then(() => close());
    }
  };

  const resizePicture = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        "JPEG",
        80,
        0,
        (uri) => resolve(uri),
        "file"
      );
    });

  const imageSelectionHandler = async (e) => {
    setYoutubeID(null);
    setCurrentLink(null);
    setIsPoll(false);
    setVideo("");
    const { files } = e.target;

    let _images = [];

    let _num =
      files.length + images.length > 10
        ? images.length - files.length > 0
          ? images.length - files.length
          : 10
        : files.length;

    if (files.length + images.length > 10) {
      swal({
        title: "Max Images Limit Exceeded",
        text: "A maximum of 10 images are allowed in a single post. ",
        icon: "warning",
      });
    }

    if (images.length !== 10) {
      for (let i = 0; i < _num; i++) {
        const compressedImage = await resizePicture(files[i]);
        _images[i] = {
          url: URL.createObjectURL(compressedImage),
          ext: compressedImage.name.split(".").slice(-1)[0],
        };
      }
      setImages(images.concat(_images));
    }
  };

  const videoSelectionHandler = async (e) => {
    setIsPoll(false);

    if (e.target.files.length > 0) {
      setImages([]);
      setYoutubeID(null);
      setaddYoutubeUrl(false);
      setCurrentLink(null);
      setVideo("");
      let _file = e.target.files[0];
      let _url = URL.createObjectURL(e.target.files[0]);
      let _thumb = await getVideoCover(_url);

      if (_thumb === false || _thumb === null) {
        swal({
          title: "Unsupported",
          text: "The video you're trying to upload appears to be corrupted or encoded in a format that we do not currently support.",
          icon: "error",
        });
      } else {
        setVideo({
          ext: _file.name.split(".").slice(-1)[0],
          thumbnail: URL.createObjectURL(_thumb),
          url: _url,
        });
      }
    }
  };

  const groupSelectionHandler = (group) => {
    // REMOVE GROUP
    if (tempGroups?.includes(group)) {
      let _temp = tempGroups.filter((i) => i !== group);

      if (_temp?.includes("All")) {
        _temp = _temp.filter((i) => i !== "All");
      }

      setTempGroups(_temp);
    }
    // ADD GROUP
    else {
      let _temp = tempGroups;
      _temp = _temp.concat([`${group}`]);

      if (_temp.length === availableGroups.length) {
        _temp = _temp.concat(["All"]);
      }

      setTempGroups(_temp);
    }
  };

  return user !== null ? (
    <div>
      <Dialog
        ariaHideApp={false}
        className={isDarkMode ? "new-post-modal dark" : "new-post-modal"}
        open={isOpen}
        onClose={close}
        disableBackdropClick
      >
        <div
          className={
            isDarkMode ? "newPostModel dark-new-post-modal" : "newPostModel"
          }
        >
          {isChoosingGroups && (
            <>
              <div
                className={
                  isDarkMode
                    ? "create-post-head create-post-head-dark"
                    : "create-post-head"
                }
              >
                Select Privacy
              </div>

              <div
                className={
                  isDarkMode
                    ? "select-groups-wrapper-dark"
                    : "select-groups-wrapper"
                }
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="Everyone"
                        onChange={() => setTempGroups([])}
                        disabled={tempGroups.length === 0}
                        checked={tempGroups.length === 0}
                        name="Everyone"
                      />
                    }
                    label="Everyone"
                  />

                  {availableGroups.map((group, index) => {
                    return group !== "All" ? (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            value={group}
                            onChange={() => groupSelectionHandler(group)}
                            checked={
                              tempGroups?.includes(group) ||
                              tempGroups.length === 0
                            }
                            name={group}
                          />
                        }
                        label={group}
                      />
                    ) : (
                      <></>
                    );
                  })}
                </FormGroup>

                <div className="new-post-post-button">
                  <button
                    onClick={() => {
                      setSelectedGroups(tempGroups);
                      setIsChoosingGroups(false);
                    }}
                    className="btn"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          )}

          {!isChoosingGroups && (
            <div>
              <div className="ask-doubt-popoup-loading-container">
                {isLoading ? (
                  <div className="three-dots-loader">
                    <ThreeDotsLoader />
                  </div>
                ) : (
                  <></>
                )}

                <h6
                  className="ask-doubt-popoup-loading-label"
                  style={{
                    display: isLoading ? "block" : "none",
                    color: isDarkMode ? "white" : "black",
                  }}
                >
                  {isUpdating
                    ? "Updating"
                    : video !== ""
                    ? `Uploading video ${percentageUploaded}%...`
                    : "Posting"}
                </h6>
              </div>

              <div>
                <div
                  className={
                    isDarkMode
                      ? "create-post-head create-post-head-dark"
                      : "create-post-head"
                  }
                  style={{ opacity: isLoading ? 0.3 : 1 }}
                >
                  {isUpdating
                    ? isPoll
                      ? `Update Poll`
                      : `Update Post`
                    : isPoll
                    ? `Create Poll`
                    : `Create Post`}
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
                    {isPoll && (
                      <ArrowBackIosIcon
                        onClick={() => {
                          setIsPoll(false);
                          setIsChoosingGroups(false);
                        }}
                        style={{
                          cursor: isLoading ? "default" : "pointer",
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
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
                      onClick={close}
                      style={{
                        cursor: isLoading ? "default" : "pointer",
                        height: "20px",
                        color: isDarkMode ? "white" : "black",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="new-post-user"
                style={{ opacity: isLoading ? 0.3 : 1 }}
              >
                <div className="user-avatar">
                  <Avatar src={user.profile_url} className="post-info-avatar" />
                </div>
                <div className="user-info">
                  <p
                    className="userInfo__name"
                    style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      lineHeight: "20px",
                      color: isDarkMode ? "#fff" : "#050505",
                    }}
                  >
                    {user.name}
                  </p>
                  <div
                    onClick={() => {
                      setIsChoosingGroups(true);
                      setTempGroups(selectedGroups);
                    }}
                    className={
                      isDarkMode ? "user-group user-group-dark" : "user-group"
                    }
                  >
                    <p>
                      {selectedGroups?.length === 0
                        ? "General"
                        : selectedGroups?.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="new-post-content"
                style={{
                  opacity: isLoading ? 0.3 : 1,
                  marginLeft: isPoll ? "0px" : "16px",
                  marginRight: isPoll ? "0px" : "16px",
                }}
              >
                {!isPoll && (
                  <div
                    className={
                      isDarkMode
                        ? !images.length && !video
                          ? isPoll
                            ? "new-post-editor-dark poll-size"
                            : "new-post-editor-dark"
                          : "new-post-editor-dark small"
                        : !images.length && !video
                        ? isPoll
                          ? "new-post-editor poll-size"
                          : "new-post-editor"
                        : "new-post-editor small"
                    }
                  >
                    <RichTextEditor
                      onKeyUp={checkLinksOnStoppedTyping}
                      placeholder={
                        isPoll
                          ? `What' your question for the poll?`
                          : `What's on your mind, ${user.name.split(" ")[0]}?`
                      }
                      handler={getText}
                      value={TryJSONQuillToReact(richText)}
                    />
                    <div className="new-post-content__youtubeSection">
                      {addYoutubeUrl ? (
                        <div className="new-post-content__youtubeSectionContainer">
                          <input
                            className={
                              isDarkMode
                                ? "answers__textarea answers__textarea__dark"
                                : "answers__textarea"
                            }
                            onChange={(e) => {
                              setyoutubeUrl(e.target.value);
                              setVideo("");
                              if (getYoutubeID(e.target.value) !== false) {
                                setYoutubeID(getYoutubeID(e.target.value));
                              }
                            }}
                            value={youtubeUrl ? youtubeUrl : ""}
                            placeholder="Enter Youtube Link..."
                            style={{ resize: "none" }}
                          />
                          {youtubeUrl && youtubeUrl !== "" ? (
                            <CloseIcon
                              onClick={() => setyoutubeUrl("")}
                              style={{
                                height: "20px",
                                width: "20px",
                                marginRight: "8px",
                                cursor: "pointer",
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
                        onClick={() =>
                          (video === "" || video === null) &&
                          setaddYoutubeUrl(!addYoutubeUrl)
                        }
                        className="answer__youtube_icon"
                        style={{
                          height: "30px",
                          width: "30px",
                          filter:
                            isDarkMode && !isValidYouTubeUrl(youtubeUrl)
                              ? "invert(1)"
                              : "",
                        }}
                        src={
                          youtubeUrl
                            ? isValidYouTubeUrl(youtubeUrl)
                              ? Youtube
                              : YoutubeDark
                            : YoutubeDark
                        }
                        alt="youtubeLink"
                      />
                    </div>
                  </div>
                )}

                {isPoll && (
                  <div className="poll-post-container">
                    <div className="poll-option" key={uuidv4}>
                      <div
                        className={
                          isDarkMode
                            ? "poll-option-header poll-option-header-dark"
                            : "poll-option-header"
                        }
                      >
                        <p>Question*</p>
                      </div>
                      <textarea
                        className={
                          isDarkMode
                            ? "poll-option-input poll-option-input-dark"
                            : "poll-option-input"
                        }
                        style={{ minHeight: "60px", resize: "vertical" }}
                        placeholder={`E.g, How many planets are there in the solar system`}
                        value={plainText}
                        onChange={(e) => {
                          //do something
                          if (e.target.value.length < 141) {
                            setPlainText(e.target.value);
                          }
                        }}
                      />
                      <div
                        className={
                          isDarkMode
                            ? "poll-option-footer poll-option-footer-dark"
                            : "poll-option-footer"
                        }
                      >
                        <p>{plainText.length}/140</p>
                      </div>
                    </div>

                    <div className="poll-options-container">
                      {pollOptions.map((option, index) => {
                        return (
                          <div className="poll-option" key={index}>
                            <div
                              className={
                                isDarkMode
                                  ? "poll-option-header poll-option-header-dark"
                                  : "poll-option-header"
                              }
                            >
                              <p>{`Option ${index + 1}${
                                index <= 1 ? "*" : ""
                              }`}</p>
                              {index > 1 && !isUpdating ? (
                                <button onClick={() => removeOption(index)}>
                                  <p>Remove</p>
                                </button>
                              ) : (
                                <></>
                              )}
                            </div>
                            <input
                              className={
                                isDarkMode
                                  ? "poll-option-input poll-option-input-dark"
                                  : "poll-option-input"
                              }
                              placeholder={`E.g, ${example_options[index]}`}
                              value={option.option}
                              onChange={(e) => {
                                if (e.target.value.length < 31) {
                                  pollOptionHandler(e, index);
                                }
                              }}
                            ></input>
                            <div
                              className={
                                isDarkMode
                                  ? "poll-option-footer poll-option-footer-dark"
                                  : "poll-option-footer"
                              }
                            >
                              <p>{option?.option?.length}/30</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className={
                        isDarkMode
                          ? "poll-actions-container poll-actions-container-dark"
                          : "poll-actions-container"
                      }
                    >
                      {pollOptions.length < 4 && !isUpdating ? (
                        <button
                          //disabled={ true : false}
                          onClick={() => {
                            if (isValid) {
                              setisValid(false);
                            }
                            setPollOptions(pollOptions.concat({ option: "" }));
                          }}
                          className="poll-btn"
                        >
                          + Add option
                        </button>
                      ) : (
                        <></>
                      )}
                      <p className="poll-actions-container-title">
                        {isUpdating ? "Extend Poll duration" : "Poll duration"}
                      </p>
                      <select
                        onChange={(e) => setPollDays(e.target.value)}
                        value={pollDays}
                        className="poll-select poll-duration-option"
                      >
                        <option value="1">1 day</option>
                        <option value="2">2 days</option>
                        <option value="3">3 days</option>
                        <option value="4">4 days</option>
                        <option value="5">5 days</option>
                        <option value="6">6 days</option>
                        <option value="7">7 days</option>
                      </select>
                    </div>
                  </div>
                )}

                <ImageView
                  isUpdating={isUpdating}
                  images={images}
                  newImages={newImages}
                  forceUpdate={forceUpdate}
                  callSetImages={setImages}
                  callSetNewImages={setNewImages}
                  removeAtIndex={removeAtIndex}
                />
                {video !== "" && video !== null && (
                  <div className="closeIcon__container">
                    <button
                      className="removevideo__button"
                      onClick={() => setVideo("")}
                    >
                      <i className="fas fa-times" />
                      {/* <p style={{ marginLeft: "6px" }}>Remove Video</p> */}
                    </button>
                  </div>
                )}

                {video !== "" && video !== null && (
                  <div
                    className="new-post-video-preview-container"
                    style={{ opacity: isLoading ? "0.3" : "1" }}
                  >
                    <VideoPost
                      body={{
                        thumbnail: video.thumbnail,
                        video_url: video.url,
                      }}
                    />
                  </div>
                )}

                {currentLink !== null &&
                  linkMetadata !== null &&
                  youtubeID === null && (
                    <LinkPost
                      url={currentLink}
                      thumbnail={linkMetadata.image}
                      title={linkMetadata.page_title}
                    />
                  )}

                {youtubeID !== null && (
                  <div className="new-post-video-preview-container">
                    <div className="closeIcon__container">
                      <button
                        className="removeyoutube__button"
                        onClick={() => setYoutubeID(null)}
                      >
                        <i className="fas fa-times" />
                        {/* <p style={{ marginLeft: "6px" }}>Remove Video</p> */}
                      </button>
                    </div>
                    <YoutubePost
                      body={{
                        youtube_id: youtubeID,
                      }}
                    />
                  </div>
                )}
              </div>

              {!isPoll && (
                <div
                  className="newPostToolbarWrapper"
                  style={{ background: isDarkMode ? "#171718" : "white" }}
                >
                  <div
                    className={
                      isDarkMode
                        ? "newPostToolbar newPostToolbarDark"
                        : "newPostToolbar"
                    }
                    style={{ opacity: isLoading ? 0.3 : 1 }}
                  >
                    <div className="newPostToolbar__AddToPostLabel">
                      Add to Your Post
                    </div>
                    <div className="toolbar-icon-buttons">
                      <div>
                        <label htmlFor="image-picker">
                          <div>
                            <i
                              className="fas fa-image"
                              style={{ color: "rgb(68, 189, 96)" }}
                            ></i>
                          </div>
                        </label>
                        <input
                          ref={imagePicker}
                          accept="image/*"
                          type="file"
                          id="image-picker"
                          style={{ display: "none" }}
                          onChange={imageSelectionHandler}
                          multiple
                        />
                      </div>
                      <div style={{ marginLeft: "16px" }}>
                        <label htmlFor="video-picker">
                          <div>
                            <i
                              className="fas fa-video"
                              style={{
                                color:
                                  youtubeUrl.length > 0
                                    ? "grey"
                                    : "rgb(255, 136, 50)",
                              }}
                            />
                          </div>
                        </label>
                        <input
                          disabled={youtubeUrl.length > 0}
                          ref={videoPicker}
                          accept="video/*"
                          type="file"
                          id="video-picker"
                          style={{ display: "none" }}
                          onChange={videoSelectionHandler}
                          multiple={false}
                        />
                      </div>
                      <div style={{ marginLeft: "16px", cursor: "pointer" }}>
                        <div
                          onClick={() => {
                            setVideo("");
                            setImages([]);
                            setYoutubeID(null);
                            setCurrentLink(null);
                            setIsPoll(false);
                            setIsPoll(true);
                          }}
                        >
                          <i
                            className="fas fa-poll"
                            style={{ color: "rgb(26, 119, 240)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="newPostModal__bottomBar"
                style={{ opacity: isLoading ? 0.3 : 1 }}
              >
                <button
                  disabled={postButtonDisabled}
                  onClick={isUpdating ? updatePost : uploadPost}
                  style={{
                    backgroundColor: postButtonDisabled
                      ? "grey"
                      : isDarkMode
                      ? "rgb(187, 40, 27)"
                      : "#891010",
                    color: "#fff",
                  }}
                  className="newPostModal__bottomBarLabel"
                >
                  <p>{isUpdating ? `Update` : `Post`}</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  ) : (
    <></>
  );
};

export { NewPostModal as default };
