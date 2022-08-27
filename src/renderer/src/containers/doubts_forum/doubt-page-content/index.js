import React, { useEffect, useState, useContext, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import Lottie from "lottie-react-web";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

import SimilarChapter from "./similar-chapter";
import { DoubtLoader } from "../../../components";
import { DoubtTile, DoubtsFeed } from "../../../containers";
import confusedGrade from "../../../assets/lottie/confusedGrade.json";
import PuStackCareChat from "../../../containers/global/pustack-care";
import PuStackCareChatPopup from "../../global/pustack-care-chat-popup";
import { generateUrlFromString, quillToPlainText } from "../../../helpers";
import SimilarChaptersLoader from "../../../components/doubts_forum/similar-chapter-loader";

import {
  getFilterData,
  getClassChapters,
  getDoubtInfoByURL,
} from "../../../database";

import {
  PageContext,
  SidebarContext,
  UserContext,
  ThemeContext,
  AskYourDoubtContext,
  PustackProContext,
} from "../../../context";
import "./style.scss";

const Rightbar = lazy(() =>
  import("../../../containers/doubts_forum/right-bar")
);
const TrendingBar = lazy(() =>
  import("../../../containers/doubts_forum/trending-bar")
);

export default function DoubtPageContent() {
  const [subjects, setSubjects] = useState(null);
  const [doubtInfo, setdoubtInfo] = useState([]);
  const [, setHasMoreDoubts] = useState(true);
  const [user] = useContext(UserContext).user;
  const [openPustackCare] = useContext(UserContext).openPustackCare;
  const [isUserPro] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;
  const [, setOpenMenu] = useContext(UserContext).openMenu;

  const [, setOpenMenuSettings] = useContext(UserContext).openMenuSettings;
  const [unreadCareMsgCount] = useContext(UserContext).unreadCareMsgCount;

  const [pageName, setpageName] = useContext(PageContext).pageName;
  const [topLevel, setTopLevel] = useContext(SidebarContext).topLevel;
  const [selectedSubject] = useContext(SidebarContext).selectedSubject;
  const [, setOpen] = useContext(AskYourDoubtContext).open;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [wrongGrade, setWrongGrade] = useContext(SidebarContext).wrongGrade;

  let location = useLocation();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    setWrongGrade(false);
    setpageName("doubtPage");
    window.scrollTo(0, 0);
    getDoubtInfo();
  }, [user?.grade, topLevel]);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const getSetFilterData = async () => {
    let filter_data = await getFilterData(user?.grade);
    let chapter_data = await getClassChapters(user?.grade);

    if (doubtInfo[0]) {
      let subject_string = doubtInfo[0]?.post?.subject
        ? doubtInfo[0].post.subject
        : location?.state?.subject;

      let chapter_string;
      if (topLevel !== "Maths") {
        try {
          chapter_string = doubtInfo[0]?.post?.chapter
            ? doubtInfo[0].post.chapter
            : location.state.chapter;
        } catch (error) {
          chapter_string = "";
        }
      }

      if (topLevel === "Maths" || topLevel === "English") {
        let subjects_array =
          filter_data?.data().subject_chapter_map[
            doubtInfo[0]?.post?.subject !== null
              ? doubtInfo[0]?.post?.subject
              : doubtInfo[0]?.post?.top_level
          ];

        setSubjects(subjects_array);
      } else {
        let new_subjects_array = chapter_data[subject_string];
        // check if the are more than 20 if not continue load more

        let selected_chapter_data = [];
        for (let j = 0; j < chapter_data[selectedSubject]?.length; j++) {
          //new_subjects_array.push(chapter_data[selectedSubject][j]);
          selected_chapter_data.push(chapter_data[selectedSubject][j]);
        }

        setSubjects(new_subjects_array);
      }
    }
  };

  useEffect(() => {
    getDoubtInfo();
  }, [doubtInfo[0]?.post?.question_text, location?.state?.title, user?.grade]);

  const getDoubtInfo = async () => {
    var url = window.location.origin;
    var doubtUrlSnippet = window.location.pathname
      .split("/")[2]
      .replace("#", "");

    let doubt_info = await getDoubtInfoByURL(doubtUrlSnippet, user.grade);

    if (doubt_info.length === 0) {
      setWrongGrade(true);
    } else {
      setWrongGrade(false);
    }

    setdoubtInfo(doubt_info);
    try {
      setTopLevel(doubt_info[0].post.top_level);
    } catch (error) {
      try {
        setTopLevel(location.state.top_level);
      } catch (error) {}
    }

    try {
      if (topLevel !== "General")
        getSetFilterData(
          doubt_info[0]?.post?.top_level
            ? doubt_info[0].post.top_level
            : location.state.top_level
        );
    } catch (error) {}
  };

  const getTitle = (pathname) => {
    let path = pathname.split("/")[2];
    let slashedpath = path.replace(/-/g, " ");
    return slashedpath.charAt(0).toUpperCase() + slashedpath.slice(1);
  };

  return (
    <div className="doubt-page">
      {location?.state?.question_text ? (
        <Helmet>
          <meta charSet="utf-8" />
          <title>{location?.state.question_text}</title>
          {location?.state.is_answered && (
            <meta
              name="description"
              content={`${quillToPlainText(
                location.state.answer_text !== null
                  ? location.state.answer_text
                  : ""
              )}`}
            />
          )}
          <link
            rel="canonical"
            href={`http://pustack.com/doubts/${generateUrlFromString(
              location.state.question_text
            )}`}
          />
        </Helmet>
      ) : (
        <Helmet>
          <meta charSet="utf-8" />
          <title>{getTitle(location?.pathname)}</title>
          {location?.state?.is_answered && (
            <meta
              name="description"
              content={`${quillToPlainText(
                location?.state?.answer_text !== null
                  ? location?.state?.answer_text
                  : ""
              )}`}
            />
          )}
          <link
            rel="canonical"
            href={`http://pustack.com${location.pathname}`}
          />
        </Helmet>
      )}
      <div className="doubt-page-center">
        {wrongGrade && (
          <div
            className={
              isDarkMode
                ? "wrong-grade-doubt fadeIn dark"
                : "wrong-grade-doubt fadeIn"
            }
          >
            <Lottie options={{ animationData: confusedGrade, loop: true }} />
            <h4>Uh-oh... You Sure?!</h4>
            <h6>
              This doubt does not belong to Class {user?.grade?.split("_")[1]}
            </h6>
            <button
              onClick={() => {
                setOpenMenu(true);
                setOpenMenuSettings(true);
              }}
              className="askDoubtPopup__btn"
            >
              Change Class
            </button>
          </div>
        )}
        {!wrongGrade && (
          <div className="doubt-page-content">
            {!location?.state?.question_text ? (
              doubtInfo[0]?.post?.question_text ? (
                <DoubtTile
                  doubtData={doubtInfo[0].post}
                  doubtId={doubtInfo[0].id}
                  shouldExpandDoubtTile={true}
                  isDoubtPage={true}
                  index={0}
                  setHasMoreDoubts={setHasMoreDoubts}
                />
              ) : (
                <DoubtLoader />
              )
            ) : (
              <DoubtTile
                doubtData={location.state}
                doubtId={location.state.doubtId}
                shouldExpandDoubtTile={true}
                isDoubtPage={true}
                index={0}
                setHasMoreDoubts={setHasMoreDoubts}
              />
            )}
          </div>
        )}

        {!wrongGrade ? (
          subjects && doubtInfo[0] && topLevel !== "General" ? (
            <SimilarChapter
              subjects={subjects.slice(0, 20)}
              getSelectedChapter={doubtInfo[0].post.chapter}
            />
          ) : (
            !(doubtInfo[0] || "") && <SimilarChaptersLoader />
          )
        ) : (
          ""
        )}

        {!wrongGrade &&
          (!location?.state?.question_text ? (
            doubtInfo[0]?.post?.top_level && (subjects || "") ? (
              <Suspense fallback={<></>}>
                <DoubtsFeed
                  pageName={pageName}
                  getTopLevel={doubtInfo[0].post.top_level}
                  getSelectedSubject={doubtInfo[0].post.subject}
                  getSelectedChapter={doubtInfo[0].post.chapter}
                  getIsAnswered={doubtInfo[0].post.is_answered}
                  exceptDoubtId={
                    doubtInfo[0]?.id
                      ? doubtInfo[0].id
                      : location?.state?.doubtId
                  }
                />
              </Suspense>
            ) : (
              <></>
            )
          ) : (
            <Suspense fallback={<></>}>
              <DoubtsFeed
                pageName={pageName}
                getTopLevel={location.state.top_level}
                getSelectedSubject={location.state.subject}
                getSelectedChapter={location.state.chapter}
                getIsAnswered={true}
                exceptDoubtId={
                  doubtInfo[0]?.id ? doubtInfo[0].id : location?.state?.doubtId
                }
              />
            </Suspense>
          ))}
      </div>
      <div className="doubt-page-rightbar">
        {pageName === "doubtPage" ? (
          !location?.state?.question_text ? (
            doubtInfo[0]?.post?.top_level ? (
              <Suspense fallback={<></>}>
                <Rightbar
                  scrollToTop={scrollToTop}
                  getTopLevel={doubtInfo[0].post.top_level}
                  subject={doubtInfo[0].post.subject}
                  chapter={doubtInfo[0].post.chapter}
                  isAnswered={doubtInfo[0].post.is_answered}
                  exceptDoubtId={doubtInfo[0].id}
                />
              </Suspense>
            ) : (
              <></>
            )
          ) : (
            <Suspense fallback={<></>}>
              <Rightbar
                scrollToTop={scrollToTop}
                getTopLevel={location.state.top_level}
                subject={location.state.subject}
                chapter={location.state.chapter}
                isAnswered={location.state.is_answered}
                exceptDoubtId={location.state.doubtId}
              />
            </Suspense>
          )
        ) : (
          <Suspense fallback={<></>}>
            <TrendingBar />
          </Suspense>
        )}
      </div>
      {/* <SideIllustration /> */}
      {openPustackCare && (
        <div className="pustack-care-chat">
          <PuStackCareChat />
        </div>
      )}

      {!openPustackCare && unreadCareMsgCount > 0 && <PuStackCareChatPopup />}

      {isSmallScreen && (
        <Fab
          className={
            isDarkMode ? "fab-add-doubt fab-add-doubt-dark" : "fab-add-doubt"
          }
          onClick={() => {
            if (isUserPro) {
              setOpen(true);
            } else {
              setIsSliderOpen(true);
            }
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </div>
  );
}
