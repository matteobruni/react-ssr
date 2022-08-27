import React, { useState, useEffect, useContext } from "react";
import LinesEllipsis from "react-lines-ellipsis";
import { Link } from "react-router-dom";

import {
  UserContext,
  ThemeContext,
  SidebarContext,
  PustackProContext,
  AskYourDoubtContext,
} from "../../../context";

import { getDoubts } from "../../../database";
import { TrendingLogo } from "../../../assets";
import { generateUrlFromString } from "../../../helpers";
import "./style.scss";

export default function TrendingBar({ exceptDoubtId }) {
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [, setOpen] = useContext(AskYourDoubtContext).open;
  const [user] = useContext(UserContext).user;
  const [isUserPro] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;

  const [selectedSubject] = useContext(SidebarContext).selectedSubject;
  const [isAnswered] = useContext(SidebarContext).isAnswered;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [topLevel] = useContext(SidebarContext).topLevel;

  useEffect(() => {
    // get document according to the top level subject and other . by most popular

    // selected DB String : vote_count for Most Popular
    // isAnswered : true to only show related question which have been answered

    setRelatedQuestions([]);
    getRelatedQuestion(user?.grade);
    // no arguments to run only once
  }, [user?.grade]);

  const [, setShowCategoriePicker] =
    useContext(AskYourDoubtContext).showCategoriePicker;

  async function getRelatedQuestion(grade) {
    if (
      typeof topLevel !== "undefined" &&
      typeof selectedSubject !== "undefined" &&
      typeof isAnswered !== "undefined"
    ) {
      let [_relatedQuestions, _last] = await getDoubts({
        sortByDBString: "vote_count",
        topLevel: topLevel,
        isAnswered: true,
        grade: grade,
        similarDoubts: true,
      });

      if (_relatedQuestions?.length === 0 || _relatedQuestions === null) {
        setRelatedQuestions([]);
      } else {
        setRelatedQuestions([..._relatedQuestions]);
      }
    }
  }

  return (
    <div className="trending-bar">
      <div style={{ display: relatedQuestions?.length > 1 ? "block" : "none" }}>
        <div className="trending-bar-top">
          <h3 className="trendingbar-heading">Trending Questions</h3>
          <img
            src={TrendingLogo}
            style={{ height: "25px", width: "25px", marginLeft: "6px" }}
            alt=""
          />
        </div>

        <div
          style={{
            borderBottom: `1.5px solid ${isDarkMode ? "#444" : "#ddd"}`,
          }}
        ></div>
        <div className="related-questions">
          {relatedQuestions?.length !== 0 ? (
            relatedQuestions?.slice(0, 6).map(({ id, post }) =>
              id !== exceptDoubtId ? (
                <Link
                  key={id}
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  to={{
                    pathname: `/doubts/${
                      post.doubt_url
                        ? post.doubt_url
                        : generateUrlFromString(post.question_text)
                    }`,
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
                    className="rightbar-heading-tile"
                  />
                </Link>
              ) : (
                <></>
              )
            )
          ) : (
            <></>
          )}
        </div>

        <p
          onClick={() => {
            if (isUserPro) {
              setOpen(true);
              setShowCategoriePicker(true);
            } else {
              setIsSliderOpen(true);
            }
          }}
          className="trending-bar-askabout"
        >
          Ask Question
        </p>
      </div>
    </div>
  );
}
