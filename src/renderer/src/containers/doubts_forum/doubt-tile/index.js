import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  lazy,
  Suspense,
} from "react";
import "./style.scss";
import Modal from "react-modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import LinesEllipsis from "react-lines-ellipsis";
import CancelIcon from "@material-ui/icons/Cancel";
import { Link, useHistory } from "react-router-dom";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import UpvoteFilled from "./../../../assets/images/up_vote_filled.svg";
import UpvoteOutline from "./../../../assets/images/up_vote_outline.svg";
import { PdfPreview } from "../../../components";
import { db } from "../../../firebase_config";

import {
  CommentView,
  AnswerView,
  CommentInput,
  DoubtTileMenu,
  AnswerHeader,
  AnswerEditorBody,
} from "../../../containers";

import {
  upvoteDoubt,
  deleteComment,
  getMoreComments,
  getIsUpVoted,
} from "../../../database";

import {
  showSnackbar,
  quillToPlainText,
  quillToReact,
  reactToQuill,
  formatTime,
  splitLongString,
  generateUrlFromString,
} from "../../../helpers";

import {
  SidebarContext,
  AskYourDoubtContext,
  DoubtContext,
  PageContext,
  ThemeContext,
  UserContext,
} from "../../../context";
import CommentLoader from "../comment-loader";

const ImagePreview = lazy(() =>
  import("../../../components/doubts_forum/image-preview")
);
export default function DoubtTile({
  doubtData,
  isDoubtPageFeed,
  shouldExpandDoubtTile,
  doubtId,
  isDoubtPage,
  setHasMoreDoubts,
  index,
}) {
  const {
    ask_user_id,
    answer_user_id,
    top_level,
    subject,
    chapter,
    question_text,
    answer_text,
    vote_count,
    comment_count,
    question_images,
    question_edit_ts,
    question_create_ts,
    is_answered,
    youtube_id,
    answer_images,
    answer_create_ts,
    doubt_url,
  } = doubtData;

  const [doubtAnswerUserId, setDoubtAnswerUserId] =
    useContext(DoubtContext).doubtAnswerUserId;
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [upvoted, setUpvoted] = useState();
  const [upVoteChanged, setUpVoteChanged] = useState(false);
  // Limit of max 5 upvote change.
  const [upvoteChange, setUpvoteChange] = useState(0);
  const [commenting, setCommenting] = useState(false);

  const [isExpanded, setIsExpanded] = useContext(DoubtContext).isExpanded;
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentLoadingFirstTime, setCommentLoadingFirstTime] = useState(true);

  // -> SidebarContext
  const [, setSelectedSubject] = useContext(SidebarContext).selectedSubject;
  const [mathSelected, setMathSelected] =
    useContext(SidebarContext).mathSelected;
  const [scienceSelected, setScienceSelected] =
    useContext(SidebarContext).scienceSelected;
  const [sstSelected, setSstSelected] = useContext(SidebarContext).sstSelected;
  const [englishSelected, setEnglishSelected] =
    useContext(SidebarContext).englishSelected;
  const [, setGeneralSelected] = useContext(SidebarContext).generalSelected;
  const [, setLimitSubjectChips] = useContext(SidebarContext).limitSubjectChips;
  const [, setSelectedChapter] = useContext(SidebarContext).selectedChapter;
  const [, setTopLevel] = useContext(SidebarContext).topLevel;
  const [isDarkMode] = useContext(ThemeContext).theme;

  // -> DoubtContext
  const [answering, setAnswering] = useContext(DoubtContext).answering;
  const [comments, setComments] = useContext(DoubtContext).comments;
  const [visibleCommentsCount, setVisibleCommentsCount] =
    useContext(DoubtContext).visibleCommentsCount;
  const [richText] = useContext(DoubtContext).richText;
  const [answerUpdated, setAnswerUpdated] =
    useContext(DoubtContext).answerUpdated;
  const [, setyoutubeUrl] = useContext(DoubtContext).youtubeUrl;
  const [commentAdded] = useContext(DoubtContext).commentAdded;
  const [commentDeleted, setCommentDeleted] =
    useContext(DoubtContext).commentDeleted;
  const [isAnswered, setIsAnswered] = useContext(DoubtContext).isAnswered;

  const [open, setOpen] = useState(false);
  const [clickedImageUrl, setClickedImageUrl] = useState("");

  let history = useHistory();

  // -> AskYourContext
  const [, setUpdatedDoubtQuestion] =
    useContext(AskYourDoubtContext).updatedDoubtQuestion;

  // -> PageContext
  const [pageName] = useContext(PageContext).pageName;

  // -> pdf view
  const [isOpen, setIsOpen] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const [pdfUrl, setpdfUrl] = useState("");

  //------------------------------------ variables

  let last_visible_comment_doc; // use for comments pagination
  const isSmallScreen = document.documentElement.clientWidth < 500;

  const tempEditorRef = useRef();
  const commentViewRef = useRef(null);

  //------------------------------------ useEffect

  const getSetUpvoted = async () => {
    if (user !== null)
      setUpvoted(await getIsUpVoted(doubtId, user.uid, user.grade));
  };

  useEffect(() => {
    // get if user have upvoted or not
    getSetUpvoted();

    // update the sidebar selection if isDoubtPage
    if (isDoubtPage) onSubjectClick();

    // set limitSubject Chips to false for doubtpage so that the subject/chapter selection of the doubt is visible
    if (isDoubtPage || isDoubtPageFeed) setLimitSubjectChips(false);

    setAnswerUpdated(false);

    // setting youtube url initial value
    if (youtube_id) setyoutubeUrl(`http://youtu.be/${youtube_id}`);

    // update value for expanded if in doubt page
    if (shouldExpandDoubtTile) setIsExpanded(shouldExpandDoubtTile);

    // set if is answered or not
    setIsAnswered(is_answered);

    setDoubtAnswerUserId(answer_user_id);

    LitenForChangesInScreenSize();
  }, [youtube_id]);

  useEffect(() => {
    // for full screen image view
    if (isExpanded)
      try {
        tempEditorRef.current
          .querySelector(".quill > .ql-container > .ql-editor")
          .querySelectorAll("p > img")
          .forEach((e) => {
            e.classList.add("modal-image");
            e.style.cursor = "zoom-in";
            e.addEventListener("click", () => {
              setClickedImageUrl(e.src);
              handleClickOpen();
            });
          });
      } catch (e) {
        // console.info(`NO EDITOR : ${e}`);
      }

    //
    if (isExpanded && !answering)
      try {
        tempEditorRef.current
          .querySelector(".quill > .ql-container > .ql-editor")
          .querySelectorAll("p > a")
          .forEach((e) => {
            if (e.href.includes(".pdf")) {
              let pdfUrlLocal = e.href;

              e.addEventListener("click", () => {
                setpdfUrl(pdfUrlLocal);
                setIsOpen(true);
                setShowPdf(true);
              });

              e.href = `#`;
              e.target = "_self";
              e.tabindex = "0";
            }
          });
      } catch (e) {
        // console.info(`NO EDITOR : ${e}`);
      }
  });

  useEffect(() => {
    setAnswerUpdated(false);

    if (isDoubtPage) setUpdatedDoubtQuestion(question_text);
    //if (isDoubtPageFeed) window.scrollTo(0, 0);
    setComments([]);
    setCommenting(false);
    setVisibleCommentsCount(0);
  }, [question_text]);

  useEffect(() => {
    if (commenting)
      commentViewRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
  }, [commenting]);

  const LitenForChangesInScreenSize = () => {
    window.addEventListener("resize", function () {
      // check width
      setIsOpen(false);
      setIsOpen(true);
    });
  };

  const getUpvoteCount = () => {
    if (upvoted) {
      return upVoteChanged ? vote_count + 1 : vote_count;
    } else {
      return upVoteChanged ? vote_count - 1 : vote_count;
    }
  };

  const getCommentCount = () => {
    return comment_count + commentAdded - commentDeleted;
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowPdf(false);
  };

  async function getComments(limit, grade) {
    setCommentLoadingFirstTime(true);
    let fetched_comments = [];
    await db
      .collection("doubt_forum")
      .doc(grade)
      .collection("posts")
      .doc(doubtId)
      .collection("comments")
      .orderBy("like_count", "desc")
      .orderBy("create_ts", "desc")
      .limit(limit)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          fetched_comments.push({ id: doc.id, comment: doc.data() });
          last_visible_comment_doc = doc.data;
        });

        setComments(fetched_comments);
        setCommentLoadingFirstTime(false);
      })
      .catch(function (error) {
        showSnackbar(`Server Error`, "server-error");
      });
  }

  const load2Comments = async () => {
    if (
      comments[comments.length - 1] &&
      comments[comments.length - 1] !== null
    ) {
      // show loading animations
      setCommentLoading(true);

      // get more comments from firestore
      let [fetched_comments, get_last_visible_comment_doc] =
        await getMoreComments({
          doubtId: doubtId,
          last_comment_id: comments[comments.length - 1].id,
          grade: user.grade,
        });

      last_visible_comment_doc = get_last_visible_comment_doc;

      let temp_comments_obj = comments;

      fetched_comments.map((comment) => {
        temp_comments_obj.push({ id: comment.id, comment: comment.comment });
      });

      setComments(temp_comments_obj);
      setCommentLoading(false);

      // updating visible comment count
      setVisibleCommentsCount(visibleCommentsCount + 2);
    } else {
      getComments(2, user.grade);
    }
  };

  function answerBtnClick() {
    setAnswering(!answering);
    setIsExpanded(true);
  }

  function commentBtnClick() {
    setCommenting(!commenting);

    if (!comments || comments.length === 0 || comments === null) {
      getComments(2, user.grade);

      setVisibleCommentsCount(2);
    } else {
      getComments(comments.length, user.grade);
      setVisibleCommentsCount(comments.length);
    }
  }

  const updateIsExpanded = (isExpanded) => {
    setIsExpanded(isExpanded);
  };

  function onCategoriClick(subject) {
    // limiting the subject chips to 3 lines
    setLimitSubjectChips(true);

    if (isCategorieSelected(subject)) {
      // onSelectedCategorieClick();
    } else {
      deselectAppCategorie();
      if (subject === "Maths") {
        setMathSelected(true);
        setTopLevel("Maths");
      } else if (subject === "Science") {
        setScienceSelected(true);
        setTopLevel("Science");
      } else if (subject === "SST") {
        setSstSelected(true);
        setTopLevel("SST");
      } else if (subject === "English") {
        setEnglishSelected(true);
        setTopLevel("English");
      } else {
      }
      setGeneralSelected(false);
    }
  }

  const isCategorieSelected = (subject) => {
    switch (subject) {
      case "Maths":
        if (mathSelected) return true;
        break;
      case "Science":
        if (scienceSelected) return true;
        break;
      case "SST":
        if (sstSelected) return true;
        break;
      case "English":
        if (englishSelected) return true;
        break;
      default:
        return false;
    }
  };

  function deselectAppCategorie() {
    // making all other deselected
    setMathSelected(false);
    setScienceSelected(false);
    setSstSelected(false);
    setEnglishSelected(false);
  }

  const onTopLevelClick = () => {
    if (top_level === "General") {
      setGeneralSelected(true);
      // making all other deselected
      setMathSelected(false);
      setScienceSelected(false);
      setSstSelected(false);
      setEnglishSelected(false);
    } else {
      onCategoriClick(`${top_level}`);
    }
  };

  const onSubjectClick = () => {
    setTopLevel(top_level);
    onTopLevelClick();

    if (top_level !== "Maths") {
      setSelectedSubject(subject);
      setSelectedChapter(chapter);
    } else {
      setSelectedSubject(chapter);
    }
  };

  const TryJSONQuillToReact = (desc) => {
    try {
      return JSON.parse(quillToReact(desc));
    } catch (error) {
      return desc;
    }
  };

  function sendToUrl(string) {
    history.push(string);
  }

  const copyToClipBoard = (str) => {
    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  const shareBtnClick = () => {
    // generate url
    var url = window.location.origin;
    var postUrl = `${url}/doubts/${doubt_url}`;

    // copy to clipboard
    copyToClipBoard(postUrl);

    // show snackbar
    showSnackbar("Copied to clipboard", "success");
  };

  return upvoted !== undefined ? (
    <div
      className="doubtTile"
      key={doubtId}
      id={index === 0 ? "firstDoubt" : index}
    >
      {showPdf && (
        <Modal
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => {
            setIsOpen(false);
            setShowPdf(false);
            var url = window.location.origin;
            var doubtUrlSnippet = window.location.href
              .replace(`${url}/doubts/`, "")
              .replace("#", "");
            sendToUrl(`${doubtUrlSnippet}`);
          }}
          ariaHideApp={false}
          className="new-post-modal pdf-preview-modal"
          overlayClassName="new-post-modal-overlay"
          isOpen={isOpen}
        >
          <PdfPreview
            pdf={
              pdfUrl ||
              "https://test-sgupta-bucket.s3.ap-south-1.amazonaws.com/Math-2018-2019.pdf"
            }
            onClose={() => {
              setIsOpen(false);
              setShowPdf(false);
              var url = window.location.origin;
              var doubtUrlSnippet = window.location.href
                .replace(`${url}/doubts/`, "")
                .replace("#", "");
              sendToUrl(`${doubtUrlSnippet}`);
            }}
          />
        </Modal>
      )}

      <Modal
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        onRequestClose={handleClose}
        ariaHideApp={false}
        overlayClassName="new-post-modal-overlay"
        isOpen={open}
        className="doubtTile__imagePreviewDiv__wrapper"
      >
        <div className="doubtTile__imagePreviewDiv">
          <CancelIcon className="close-btn" onClick={handleClose} />
          <img
            src={clickedImageUrl}
            className="imagePreviewDialog_image"
            onClick={handleClose}
            alt="imagePreview"
          />
        </div>
      </Modal>

      <div className="doubtTile__card">
        <div className="doubtTile__top">
          <div style={{ display: "flex" }}>
            <p className="doubtTile__topLevel">{top_level}</p>

            {subject ? (
              <p
                className="doubtTile__subject"
                style={{ marginLeft: "6px" }}
              >{`•  ${subject}`}</p>
            ) : (
              <></>
            )}

            {chapter && top_level !== "General" ? (
              <p style={{ marginLeft: "6px" }}>{`•  ${
                isSmallScreen
                  ? chapter?.length > 15
                    ? chapter.substring(0, 14) + "..."
                    : chapter
                  : chapter
              }`}</p>
            ) : (
              <></>
            )}
          </div>
          <p>{formatTime(question_create_ts)}</p>
        </div>

        <div className="doubtTile__center">
          {isDoubtPage ? (
            <div style={{ textDecoration: "none" }}>
              <h4 className="doubtTile__center-title-doubt-page">
                {splitLongString(question_text, 40)}
              </h4>
            </div>
          ) : isSmallScreen ? (
            <LinesEllipsis
              text={splitLongString(question_text, 40)}
              maxLine="2"
              ellipsis="..."
              style={{
                fontSize: isDoubtPage ? "21px" : "16px",
                lineHeight: isDoubtPage ? "16px" : "22px",
                lineClamp: isDoubtPage ? "20" : "3",
              }}
              basedOn="letters"
              className="doubtTile__center-title"
              onClick={() => setIsExpanded(true)}
            />
          ) : (
            <Link
              target={pageName === "homePage" ? "_blank" : ""}
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "inherit" }}
              to={{
                pathname: `/doubts/${
                  doubt_url ? doubt_url : generateUrlFromString(question_text)
                }`,
                state: {
                  ask_user_id,
                  answer_user_id,
                  top_level,
                  subject,
                  chapter,
                  question_text,
                  answer_text,
                  vote_count,
                  comment_count: comment_count + commentAdded - commentDeleted,
                  question_images: question_images ? question_images : [],
                  doubtId,
                  question_edit_ts,
                  question_create_ts,
                  is_answered: isAnswered,
                  youtube_id,
                  answer_images,
                  answer_create_ts,
                  doubt_url,
                  isUpvoted: upvoted,
                },
              }}
            >
              <LinesEllipsis
                text={splitLongString(question_text, 40)}
                maxLine="2"
                ellipsis="..."
                style={{
                  fontSize: isDoubtPage ? "21px" : "16px",
                  lineHeight: isDoubtPage ? "16px" : "22px",
                  lineClamp: isDoubtPage ? "20" : "3",
                }}
                basedOn="letters"
                className="doubtTile__center-title"
                onClick={() => {
                  if (pageName === "doubtPage") {
                    setHasMoreDoubts(true);
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  }
                }}
              />
            </Link>
          )}

          {question_images !== null && question_images?.length !== 0 ? (
            <div
              onClick={() => setIsExpanded(true)}
              id={
                isExpanded
                  ? "doubtTile__imageContainerExpanded"
                  : isDarkMode
                  ? "doubtTile__imageContainer__dark"
                  : "doubtTile__imageContainer"
              }
              style={{
                marginTop:
                  question_images?.length !== 0 && !youtube_id && !answer_images
                    ? "10px"
                    : "0px",
                marginBottom:
                  question_images?.length !== 0 && !youtube_id && !answer_images
                    ? "10px"
                    : "0px",
              }}
            >
              <div>
                {(isDoubtPage || isExpanded) && question_images[0] ? (
                  <Suspense fallback={<></>}>
                    <ImagePreview
                      imageUrl={question_images[0] ? question_images[0] : ""}
                    />
                  </Suspense>
                ) : (
                  <></>
                )}
                {question_images && question_images[1] && isExpanded ? (
                  <Suspense fallback={<></>}>
                    <ImagePreview
                      imageUrl={question_images[1] ? question_images[1] : ""}
                    />
                  </Suspense>
                ) : (
                  <></>
                )}

                {question_images && question_images[2] && isExpanded ? (
                  <Suspense fallback={<></>}>
                    <ImagePreview
                      imageUrl={question_images[2] ? question_images[2] : ""}
                    />
                  </Suspense>
                ) : (
                  <></>
                )}
              </div>
            </div>
          ) : (
            <></>
          )}

          {(isExpanded && isAnswered) || answering ? (
            <AnswerHeader
              answering={answering}
              topLevel={top_level}
              answerCreateTimestamp={answer_create_ts}
              userId={answer_user_id}
            />
          ) : (
            <></>
          )}

          <div
            ref={tempEditorRef}
            className="rich-text-container"
            style={{ display: isAnswered || answering ? "flex" : "none" }}
            onClick={() => isSmallScreen && setIsExpanded(true)}
          >
            {isExpanded ? (
              answering ? (
                <AnswerEditorBody
                  doubtId={doubtId}
                  answerUpdated={answerUpdated}
                  answerText={answer_text}
                  isDoubtPage={isDoubtPage}
                  isDoubtPageFeed={isDoubtPageFeed}
                  answerImages={answer_images}
                  isAnswered={isAnswered}
                  youtubeVideoId={youtube_id}
                  askUserId={ask_user_id}
                />
              ) : (
                <ReactQuill
                  style={{ flex: "1" }}
                  readOnly={true}
                  theme="bubble"
                  value={TryJSONQuillToReact(
                    answerUpdated ? reactToQuill(richText) : answer_text
                  )}
                />
              )
            ) : answer_text ? (
              <div>
                <p className="doubtTile__desc">
                  {quillToPlainText(answer_text).length > 238
                    ? quillToPlainText(answer_text).substring(0, 238)
                    : quillToPlainText(answer_text)}
                </p>

                {!isExpanded ? (
                  <div
                    className="read-more-bg"
                    style={{
                      display:
                        quillToPlainText(answer_text).length > 90
                          ? "flex"
                          : "none",
                    }}
                  >
                    <span
                      onClick={() => setIsExpanded(true)}
                      className={
                        isDarkMode
                          ? "button read-more dark"
                          : "button read-more"
                      }
                    >
                      (more)
                    </span>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>

          {answer_images || youtube_id ? (
            <AnswerView
              youtubeId={youtube_id}
              youtubeURL={youtube_id ? `http://youtu.be/${youtube_id}` : ""}
              desc={answer_text}
              answerImages={answer_images}
              doubtId={doubtId}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* Bottom */}

      <div
        className={
          isExpanded
            ? "doubtTile__bottom doubtTile__bottomExpanded"
            : "doubtTile__bottom"
        }
        style={{ paddingTop: "0px" }}
      >
        <div className="doubtTile__bottomActions">
          {/* Upvote Action */}
          <button
            className="button"
            onClick={() => {
              if (upvoteChange < 5) {
                upvoteDoubt(doubtId, upvoted, vote_count, user);
                setUpvoteChange(upvoteChange + 1);
                setUpVoteChanged(!upVoteChanged);
                setUpvoted(!upvoted);
              } else {
                // show snackbar Reached max of vote interactions.

                showSnackbar("Reached max of vote interactions", "warning");
              }
            }}
          >
            <div className="doubtTile__bottomAction">
              <img
                className={`doubtTile__bottomActionIcon${
                  isDarkMode ? " dark" : ""
                }`}
                src={upvoted ? UpvoteFilled : UpvoteOutline}
                alt="upvote"
                height="17px"
                width="17px"
              />
              <p className="doubtTile__bottomActionLabel">
                {getUpvoteCount() > 999 ? "1k+" : getUpvoteCount()}
              </p>
            </div>
          </button>

          {/* Comment Action */}
          <button
            className="button doubtTile__bottomActionIcon-comment-icon"
            onClick={commentBtnClick}
          >
            <div className="doubtTile__bottomAction">
              <img
                src={
                  "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fcomment.svg?alt=media&token=89eab4a3-b9d6-49e1-b9a0-ee77a3755c88"
                }
                height="17px"
                width="17px"
                alt="comment"
              />

              <p className="doubtTile__bottomActionLabel">
                {getCommentCount() > 999 ? "1k+" : getCommentCount()}
              </p>
            </div>
          </button>
          {/* Answer Action */}

          <div
            onClick={shareBtnClick}
            className="doubtTile__bottomAction"
            style={{ marginLeft: "10px" }}
          >
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fshare.svg?alt=media&token=72424489-baba-4814-9d33-9209861fd29a"
              }
              height="17px"
              width="17px"
              alt="comment"
            />
          </div>

          {isAnswered ? (
            <></>
          ) : isInstructor && !answering ? (
            <button
              className="button doubtTile__bottomAction-answer-icon"
              style={{
                backgroundColor:
                  isDoubtPage && !isAnswered
                    ? "var(--color-highlight)"
                    : "var(--color-primary)",
                borderRadius: isDoubtPage && !isAnswered ? "24px" : "0px",
                padding: isDoubtPage && !isAnswered ? "0px 8px" : "0px",
              }}
              onClick={() => {
                answerBtnClick();
              }}
            >
              <div
                className={
                  isDoubtPage && !isAnswered
                    ? "doubtTile__bottomAction-no-hover"
                    : "doubtTile__bottomAction"
                }
              >
                <svg width="20px" height="20px" viewBox="0 0 24 24">
                  <g
                    id="answer"
                    transform="translate(2.500000, 3.500000)"
                    stroke="none"
                    strokeWidth="1.5"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="pen"
                      transform="translate(9.000000, 9.000000) rotate(-315.000000) translate(-9.000000, -9.000000) translate(7.000000, -1.000000)"
                    >
                      <path
                        d="M2,8.8817842e-16 L2,8.8817842e-16 L2,8.8817842e-16 C3.1045695,6.85269983e-16 4,0.8954305 4,2 L4,16 L2.00256278,20 L0,16 L0,2 L0,2 C-1.35267774e-16,0.8954305 0.8954305,1.09108686e-15 2,8.8817842e-16 Z"
                        id="pen_body"
                        className="icon_svg-stroke"
                        stroke={isDoubtPage && !isAnswered ? "#fff" : "#666"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <polygon
                        id="pen_tip"
                        className="icon_svg-fill_as_stroke"
                        fill={isDoubtPage && !isAnswered ? "#fff" : "#666"}
                        transform="translate(2.000000, 18.750000) scale(1, -1) translate(-2.000000, -18.750000) "
                        points="2 17.5 3.25 20 0.75 20"
                      ></polygon>
                    </g>
                    <path
                      d="M12,16 L17,16 L17,11 M7,1 L2,1 L2,6"
                      id="bg"
                      className="icon_svg-stroke"
                      stroke={isDoubtPage && !isAnswered ? "#fff" : "#666"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </g>
                </svg>

                <p
                  style={{
                    color: isDarkMode
                      ? "#fff"
                      : isDoubtPage && !isAnswered
                      ? "#fff"
                      : "#666",
                    fontWeight: isDoubtPage && !isAnswered ? "600" : "400",
                  }}
                  className={"doubtTile__bottomActionLabel"}
                >
                  Answer
                </p>
              </div>
            </button>
          ) : (
            <></>
          )}
        </div>

        <DoubtTileMenu
          answerUserId={doubtAnswerUserId}
          isAnswered={isAnswered}
          getdoubtId={doubtId}
          category={top_level}
          subject={subject}
          chapter={chapter}
          title={question_text}
          updateIsExpanded={updateIsExpanded}
          defaultQuestionImages={question_images}
          getslug={doubt_url}
          askUserId={ask_user_id}
          getIsAnswered={is_answered}
        />
      </div>

      {/* Comment Section */}

      <form>
        {commenting ? (
          <CommentInput doubtCommentCount={comment_count} doubtId={doubtId} />
        ) : (
          <></>
        )}
      </form>

      {/* Comments */}
      <div ref={commentViewRef}>
        {commenting ? (
          commentLoadingFirstTime ? (
            <div style={{ padding: "16px 16px" }}>
              <CommentLoader />
            </div>
          ) : (
            <div
              className={comments.length > 0 ? "doubtTile__commentsView" : ""}
            >
              {comments.slice(0, visibleCommentsCount).map((comment, index) =>
                comment?.comment?.comment_text ? (
                  <CommentView
                    deleteComment={() => {
                      deleteComment(
                        doubtId,
                        comment.id,
                        comment_count + commentAdded - commentDeleted,
                        user.grade
                      );
                      //remove comment from comments

                      let filtered_comments = comments.filter(
                        (item) => item.id !== comment.id
                      );

                      setComments(filtered_comments);

                      // update comment count for doubt page
                      setCommentDeleted(commentDeleted + 1);
                    }}
                    getCommentLikesCount={comment.comment.like_count}
                    key={comment.id}
                    commentText={comment.comment.comment_text}
                    userId={comment.comment.user_id}
                    time={formatTime(comment.comment.create_ts)}
                    doubtId={doubtId}
                    commentId={comment.id}
                    index={index}
                  />
                ) : (
                  <></>
                )
              )}
            </div>
          )
        ) : (
          <></>
        )}
      </div>

      {/* Load More Comments */}
      {commenting ? (
        visibleCommentsCount < comment_count && !commentLoadingFirstTime ? (
          commentLoading ? (
            <div style={{ padding: "16px 16px" }}>
              <CommentLoader />
            </div>
          ) : (
            <div style={{ display: "flex" }}>
              <button
                className="doubts__loadMoreCommentsButton"
                onClick={load2Comments}
              >
                <div className="doubts__loadMoreComments">
                  <p
                    style={{
                      fontWeight: "500",
                      fontSize: "13px",
                      lineHeight: "18px",
                      color: "#636466",
                    }}
                  >
                    View More Comments
                  </p>
                  <ExpandMoreIcon
                    style={{
                      height: "20px",
                      width: "20px",
                      color: "#636466",
                      marginLeft: "4px",
                    }}
                  />
                </div>
              </button>
            </div>
          )
        ) : (
          <></>
        )
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
}
