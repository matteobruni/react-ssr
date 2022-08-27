import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import LinesEllipsis from "react-lines-ellipsis";

import {
  AskYourDoubtContext,
  SidebarContext,
  UserContext,
  ThemeContext,
  PustackProContext,
} from "../../../context";

import { getDoubts } from "../../../database";
import { generateUrlFromString } from "../../../helpers";
import "./style.scss";

export default function Rightbar({
  scrollToTop,
  getTopLevel,
  exceptDoubtId,
  subject,
  chapter,
}) {
  const [user] = useContext(UserContext).user;
  const [isUserPro] = useContext(UserContext).tier;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [, setOpen] = useContext(AskYourDoubtContext).open;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;

  const [selectedSubject, setSelectedSubject] =
    useContext(SidebarContext).selectedSubject;
  const [isAnswered] = useContext(SidebarContext).isAnswered;

  const [mathSelected, setMathSelected] =
    useContext(SidebarContext).mathSelected;
  const [scienceSelected, setScienceSelected] =
    useContext(SidebarContext).scienceSelected;
  const [englishSelected, setEnglishSelected] =
    useContext(SidebarContext).englishSelected;
  const [topLevel, setTopLevel] = useContext(SidebarContext).topLevel;
  const [, setGeneralSelected] = useContext(SidebarContext).generalSelected;
  const [sstSelected, setSstSelected] = useContext(SidebarContext).sstSelected;

  const [, setShowCategoriePicker] =
    useContext(AskYourDoubtContext).showCategoriePicker;

  const [relatedQuestions, setRelatedQuestions] = useState(null);
  const [trendingQuestions, setTrendingQuestions] = useState([]);
  useEffect(() => {
    getRelatedQuestion();
  }, [user?.grade]);

  const onSubjectClick = (doubtSubject, top_level) => {
    onCategoriClick(top_level);
    onTopLevelClick();
    setSelectedSubject(doubtSubject);
  };

  const onTopLevelClick = () => {
    if (topLevel === "General") {
      setGeneralSelected(true);
      setMathSelected(false);
      setScienceSelected(false);
      setSstSelected(false);
      setEnglishSelected(false);
    } else {
      onCategoriClick(`${topLevel}`);
    }
  };

  function onCategoriClick(subject) {
    if (isCategorieSelected(subject)) {
      onSelectedCategorieClick();
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

  function onSelectedCategorieClick() {
    // do nothing
  }

  function deselectAppCategorie() {
    setMathSelected(false);
    setScienceSelected(false);
    setSstSelected(false);
    setEnglishSelected(false);
  }

  const getTrendingQuestion = async () => {
    let [_trendingQuestions, _last] = await getDoubts({
      sortByDBString: "vote_count",
      topLevel: getTopLevel,
      chapter: null,
      selectedSubject: getTopLevel === "Maths" ? "All" : selectedSubject,
      isAnswered: true,
      grade: user.grade,
    });

    if (_trendingQuestions || "") {
      setTrendingQuestions(_trendingQuestions);
    }
  };

  const getRelatedQuestion = async () => {
    if (typeof topLevel !== "undefined" && typeof isAnswered !== "undefined") {
      if (topLevel === "Maths") subject = chapter;

      let [_relatedQuestions, _last] = await getDoubts({
        sortByDBString: "vote_count",
        topLevel: topLevel,
        selectedSubject: subject,
        chapter: chapter,
        isAnswered: true,
        grade: user.grade,
        similarDoubts: true,
      });

      if (_relatedQuestions || "") {
        setRelatedQuestions(_relatedQuestions);

        if (_relatedQuestions.length <= 2) {
          getTrendingQuestion();
        }
      }
    }
  };

  return (
    <div className="right-bar">
      <div className="right-bar-top">
        {relatedQuestions && relatedQuestions.length > 1 && (
          <h3 className="rightbar-heading">Related Questions</h3>
        )}
      </div>

      <div
        style={{
          borderBottom: `1.5px solid ${isDarkMode ? "#444" : "#ddd"}`,
        }}
      ></div>
      <div className="related-questions">
        {relatedQuestions && relatedQuestions.length > 1 ? (
          relatedQuestions.slice(0, 6).map(({ id, post }) =>
            id !== exceptDoubtId ? (
              <Link
                key={id}
                style={{ color: "inherit", textDecoration: "inherit" }}
                to={{
                  pathname: `/doubts/${generateUrlFromString(
                    post.doubt_url ? post.doubt_url : post.question_text
                  )}`,
                  state: {
                    topLevel: post.top_level,
                    subject: post.subject,
                    chapter: post.chapter,
                    title: post.question_text,
                    desc: post.answer_text,
                    doubtVoteCount: post.vote_count,
                    doubtCommentCount: post.comment_count,
                    images: post.question_images ? post.question_images : [],
                    doubtId: id,
                    questionEditTs: post.question_edit_ts,
                    questionCreateTs: post.question_create_ts,
                    isAnswered: post.is_answered,
                    youtubeVideoId: post.youtube_id,
                    answerImages: post.answer_images,
                    answerCreateTimestamp: post.answer_create_ts,
                    doubt_url: post.doubt_url,
                  },
                }}
              >
                <LinesEllipsis
                  text={post.question_text}
                  maxLine="2"
                  ellipsis="..."
                  basedOn="letters"
                  key={id}
                  className="rightbar-heading-tile"
                  onClick={() => scrollToTop()}
                />
              </Link>
            ) : (
              <></>
            )
          )
        ) : trendingQuestions.length !== 0 ? (
          trendingQuestions?.slice(0, 6).map(({ id, post }) =>
            id !== exceptDoubtId ? (
              <Link
                key={id}
                style={{ color: "inherit", textDecoration: "inherit" }}
                to={{
                  pathname: `/doubts/${generateUrlFromString(
                    post.doubt_url ? post.doubt_url : post.question_text
                  )}`,
                  state: {
                    topLevel: post.top_level,
                    subject: post.subject,
                    chapter: post.chapter,
                    title: post.question_text,
                    desc: post.answer_text,
                    doubtVoteCount: post.vote_count,
                    doubtCommentCount: post.comment_count,
                    images: post.question_images ? post.question_images : [],
                    doubtId: id,
                    questionEditTs: post.question_edit_ts,
                    questionCreateTs: post.question_create_ts,
                    isAnswered: post.is_answered,
                    youtubeVideoId: post.youtube_id,
                    answerImages: post.answer_images,
                    answerCreateTimestamp: post.answer_create_ts,
                    doubt_url: post.doubt_url,
                  },
                }}
              >
                <p
                  onClick={() => {
                    scrollToTop();
                    onSubjectClick(post.subject ? post.subject : post.chapter);
                  }}
                  key={id}
                  className="rightbar-heading-tile"
                >
                  {post.question_text.length > 88
                    ? post.question_text.substring(0, 85) + "..."
                    : post.question_text}
                </p>
              </Link>
            ) : (
              <></>
            )
          )
        ) : (
          <></>
        )}
      </div>

      {relatedQuestions && relatedQuestions.length > 1 && (
        <p
          onClick={() => {
            if (isUserPro) {
              setOpen(true);
              setShowCategoriePicker(true);
            } else {
              setIsSliderOpen(true);
            }
          }}
          className="right-bar-askabout"
        >
          Ask Question
        </p>
      )}
    </div>
  );
}
