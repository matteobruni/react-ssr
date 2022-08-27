import React, { useEffect, useState, useContext, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { useMediaQuery } from "react-responsive";
import {
  SidebarContext,
  AskYourDoubtContext,
  ThemeContext,
  PageContext,
  UserContext,
  PustackProContext,
} from "../../../context";
import DoubtFilter from "../doubt-filter";
import PuStackCareChat from "../../../containers/global/pustack-care";
import PuStackCareChatPopup from "../../global/pustack-care-chat-popup";

const DoubtsHomeFeed = lazy(() =>
  import(`../../../containers/doubts_forum/doubts-home-feed`)
);
const TrendingBar = lazy(() =>
  import(`../../../containers/doubts_forum/trending-bar`)
);

export default function HomePageContent() {
  const [doubtInfo] = useState([]);
  const [pageName, setpageName] = useContext(PageContext).pageName;
  const [, setOpen] = useContext(AskYourDoubtContext).open;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [openPustackCare] = useContext(UserContext).openPustackCare;
  const [isUserPro] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;

  const [unreadCareMsgCount] = useContext(UserContext).unreadCareMsgCount;

  const [, setTopLevel] = useContext(SidebarContext).topLevel;
  const [, setWrongGrade] = useContext(SidebarContext).wrongGrade;
  const [, setSelectedSubject] = useContext(SidebarContext).selectedSubject;
  const [, setSelectedChapter] = useContext(SidebarContext).selectedChapter;
  const [, setQueryParameters] = useContext(SidebarContext).queryParameters;
  const [isAnswered, setIsAnswered] = useContext(SidebarContext).isAnswered;
  const [, setShowMyDoubts] = useContext(SidebarContext).showMyDoubts;

  let location = useLocation();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    setWrongGrade(false);
    setpageName("homePage");
    getAndSetUrlQueryParameters(true);
  }, []);

  useEffect(() => {
    // runs on location, i.e. route, change

    getAndSetUrlQueryParameters(true);
  }, [location]);

  //------------------------------------ functions

  const getAndSetUrlQueryParameters = (setHooks) => {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var toplevel = url.searchParams.get("toplevel");
    var subject = url.searchParams.get("subject");
    var chapter = url.searchParams.get("chapter");
    var answered = url.searchParams.get("answered");

    let parameters = {
      toplevel: toplevel,
      subject: subject,
      chapter: chapter,
      answered: answered,
    };

    if (toplevel !== null) {
      setQueryParameters(parameters);

      // set hooks
      if (setHooks) {
        setTopLevel(toplevel);
        setSelectedSubject(subject);
        setSelectedChapter(toplevel === "Maths" ? subject : chapter);

        if (subject === "My Doubts") {
          setShowMyDoubts(true);
        }

        setIsAnswered(answered === "true");
      }
    } else {
      if (setHooks) {
        setTopLevel("General");
        setSelectedSubject("General");
        setSelectedChapter("General");

        if (subject === "My Doubts") {
          setShowMyDoubts(true);
        }

        answered === null ? setIsAnswered(isAnswered) : setIsAnswered(answered);
      }
    }

    return toplevel !== null ? parameters : null;
  };

  return (
    <div className="doubt-page">
      <div className="doubt-page-center">
        {isSmallScreen && <DoubtFilter />}
        <Suspense fallback={<></>}>
          <DoubtsHomeFeed
            pageName={pageName}
            exceptDoubtId={
              doubtInfo[0]?.id ? doubtInfo[0].id : location?.state?.doubtId
            }
          />
        </Suspense>
      </div>
      <div className="doubt-page-rightbar">
        <Suspense fallback={<></>}>
          <TrendingBar />
        </Suspense>
      </div>
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

      {/* <SideIllustration /> */}
      {openPustackCare && (
        <div className="pustack-care-chat">
          <PuStackCareChat />
        </div>
      )}

      {!openPustackCare && unreadCareMsgCount > 0 && <PuStackCareChatPopup />}
    </div>
  );
}
