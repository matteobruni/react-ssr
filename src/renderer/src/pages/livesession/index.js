import React, {useState, useContext, useEffect, useCallback, useMemo} from "react";
import { Helmet } from "react-helmet";
import {useHistory, useLocation} from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Navbar, LiveSessionsPage } from "../../containers";

import {
  UserContext,
  ThemeContext,
  PustackProContext,
  LiveSessionContext,
  NavbarContextProvider, IntroContext,
} from "../../context";
import PuStackCareChat from "./../../containers/global/pustack-care";
import PuStackCareChatPopup from "../../containers/global/pustack-care-chat-popup";
import {getAvailableGrades} from "../../database/home/fetcher";
import {useRouteMatch} from "react-router-dom/cjs/react-router-dom";

export default function LiveSession() {
  const [isMobileOpen, setisMobileOpen] = useState(false);
  const [currentSession, setCurrentSession] =
    useContext(LiveSessionContext).current;
  const [hideNavbar, setHideNavbar] = useState(false);
  const [currentSessionDetails, setCurrentSessionDetails] =
    useContext(LiveSessionContext).currentSessionDetails;
  const [showMenuItem, setShowMenuItem] =
    useContext(LiveSessionContext).showMenuItem;
  const [_, setAvailableGrades] = useContext(IntroContext).availableGrades;
  const [user, setUser] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [isUserPro] = useContext(UserContext).tier;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [openPustackCare] = useContext(UserContext).openPustackCare;
  const [unreadCareMsgCount] = useContext(UserContext).unreadCareMsgCount;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;
  const createSessionMatch = useRouteMatch('/classes/create');
  const createLiveSessionMatch = useRouteMatch('/classes/createLive');
  const [showPlayer, setShowPlayer] = useState(false);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)"});
  const isLandscapeMode = useMediaQuery({query: "(max-width: 900px)", orientation: 'landscape'});

  const location = useLocation();
  const history = useHistory();

  const isCreator = useMemo(() => {
    if(!currentSession || !user || !isInstructor) return false;
    if(!currentSession.is_whiteboard_class) return isInstructor;
    return user.uid === currentSession.instructor_id;
  }, [currentSession, isInstructor, user]);

  useEffect(() => {
    setAvailableGrades(getAvailableGrades(null, process.env.NODE_ENV === "production")
      .map(gradeObj => ({
        grade_id: gradeObj.value,
        grade_name: gradeObj.grade,
        serial_order: gradeObj.grade.split(' ')[1]
      })))
  }, []);

  useEffect(() => {
    setUser(user);

    return () => setShowMenuItem(true);
  }, [user]);

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.split("/").length > 2 && !pathname.split('/')[2].startsWith('create') && !pathname.split('/')[2].startsWith('createLive')) {
      setShowMenuItem(false);
    } else {
      setShowMenuItem(true);
    }

  }, [location]);

  useEffect(() => {
    if(!isSmallScreen) return;
    console.log('location - ', location);
    if(location.pathname === '/classes') setShowPlayer(false);
    else setShowPlayer(true);
  }, [location, isSmallScreen]);

  const showPlayerFn = useCallback(() => {
    setShowPlayer(true);
  }, []);

  const hidePlayerFn = useCallback(() => {
    setShowPlayer(false);
  }, []);

  useEffect(() => {
    if(!currentSession || (!isSmallScreen && !isLandscapeMode) || location.pathname === '/classes' || createSessionMatch || createLiveSessionMatch || !currentSession.is_whiteboard_class) {
      setShowMenuItem(true);
      setHideNavbar(false);
      return;
    }
    setShowMenuItem(false);
    setHideNavbar(true);
  }, [currentSession, isSmallScreen, location, isLandscapeMode]);

  useEffect(() => {
    console.log('currentSession - ', currentSession);
  }, [currentSession]);

  return (
    <div className="live__session">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Live Classes</title>
      </Helmet>
      {((!isSmallScreen || (!showPlayer || (createSessionMatch || createLiveSessionMatch))) && !hideNavbar) && (
        <NavbarContextProvider>
          <Navbar setMobileOpen={setisMobileOpen} showMenuItem={showMenuItem} />
        </NavbarContextProvider>
      )}

      {user !== null && (
        <LiveSessionsPage
          isMobileOpen={isMobileOpen}
          handleDrawerToggle={() => setisMobileOpen(false)}
          currentSession={currentSession}
          setCurrentSessionDetails={setCurrentSessionDetails}
          setCurrentSession={setCurrentSession}
          user={user}
          isDarkMode={isDarkMode}
          history={history}
          isInstructor={isInstructor}
          isCreator={isCreator}
          createSessionMatch={createSessionMatch}
          createLiveSessionMatch={createLiveSessionMatch}
          isUserPro={isUserPro}
          setIsSliderOpen={setIsSliderOpen}
          isSmallScreen={isSmallScreen}
          showPlayer={showPlayer}
          showPlayerFn={showPlayerFn}
          hidePlayerFn={hidePlayerFn}
        />
      )}
      {openPustackCare && (
        <div className="pustack-care-chat">
          <PuStackCareChat />
        </div>
      )}
      {!openPustackCare && unreadCareMsgCount > 0 && <PuStackCareChatPopup />}
    </div>
  );
}
