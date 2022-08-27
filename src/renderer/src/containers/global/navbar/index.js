import React, { useContext, useEffect, useState } from "react";
import {Link, useLocation} from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";
import { useMediaQuery } from "react-responsive";
import MenuItems, {useStylesBootstrap} from "./menu-items";
import LoginBar from "../login-bar";
import PuStackSearch from "./search";
import AccountSettings from "./account-settings";
import MobileMenuItems from "./mobile-menu-items";
import PuStackMobileSearch from "./search-mobile";
import { logo as logoLight, logoDark } from "../../../assets";
import searchIcon from "../../../assets/images/icons/search-icon.png";
import appLogo from "../../../assets/images/icons/pustack_app_logo.svg";
import { proLogo as proLogoLight, proLogoDark } from "../../../assets";
import {UserContext, NavbarContext, ThemeContext, IntroContext} from "../../../context";
import {
  blazeUnreadMesagesNotification,
  unreadAnswerNotification,
} from "../../../database";
import { appGooglePlayLink } from "../../../helpers";
import "./style.scss";
import Tooltip from "@material-ui/core/Tooltip";
import Icon from "@material-ui/core/Icon";
import Lottie from "lottie-react-web";
import glowIndicator from "../../../assets/lottie/glow_indicator.json";
import liveIconSelected2 from "../../../assets/images/icons/live_selected2.svg";
import liveIconSelected from "../../../assets/images/icons/live_selected.svg";
import liveIcon from "../../../assets/images/icons/live.svg";
import homeIconSelected2 from "../../../assets/images/icons/home_selected2.svg";
import homeIconSelected from "../../../assets/images/icons/home_selected.svg";
import homeIcon from "../../../assets/images/icons/home.svg";
import useStandardGrade from "../../../hooks/isStandardGrade";

export default function Navbar({ setMobileOpen, showMenuItem = true }) {
  const [user] = useContext(UserContext).user;
  const [, setOpenMobileSearch] = useContext(UserContext).openMobileSearch;
  const [isUserProTier] = useContext(UserContext).tier;
  const [showBlazeMain] = useContext(UserContext).showBlazeMain;
  const [, setAnchor] = useContext(IntroContext).anchor;
  const [hasSessions] = useContext(UserContext).hasSessions;
  const isStandardGrade = useStandardGrade();

  const tooltipClasses = useStylesBootstrap();
  const location = useLocation();

  const [, setUnreadAnswerCount] = useContext(UserContext).unreadAnswerCount;
  const [selectedMenuItem, setSelectedMenuItem] =
    useContext(NavbarContext).selectedMenuItem;

  const [isDarkMode] = useContext(ThemeContext).theme;
  const [openSearchBox, setOpenSearchBox] =
    useContext(UserContext).openSearchBox;
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [blazeNewMsg, setBlazeNewMsg] = useState(false);
  const [menuVisibility, setMenuVisibility] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [blazeDarkMode, setBlazeDarkMode] = useState(false);
  const [closeInstallApp, setCloseInstallApp] =
    useContext(UserContext).closeInstallApp;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 720px)" });
  const isSmallScreen2 = useMediaQuery({ query: "(max-width: 500px)" });
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1200px)" });
  const isLargeScreen = useMediaQuery({ query: "(min-width: 720px)" });
  const isAppropriateScreen = useMediaQuery({ query: "(min-width: 769px)" });

  const pathName = window.location.pathname;
  useEffect(() => {
    const menuShownAt = (path) => {
      return (
        (isSmallScreen ? !path.includes("/blaze") : true) &&
        (isSmallScreen ? !path.includes("/doubts") : true) &&
        (isSmallScreen ? !path.includes("/newsfeed") : true) &&
        (isSmallScreen ? !path.includes("/classes") : true)
      );
    };

    const paths = ["/doubts", "/blaze", "/newsfeed", "/classes"];

    const profileShownAt = (path) => {
      return paths.every((item) => !path.includes(item));
    };

    setMenuVisibility(menuShownAt(pathName));
    isSmallScreen && setProfileVisibility(profileShownAt(pathName));
  }, [pathName]);

  useEffect(() => {
    if (isSmallScreen2) {
      if (showBlazeMain && pathName.includes("/blaze")) {
        setBlazeDarkMode(true);
      } else setBlazeDarkMode(false);
    }
  }, [pathName, showBlazeMain, isSmallScreen2]);

  useEffect(() => {
    let unsubscribe = blazeUnreadMesagesNotification({
      grade: user?.grade,
      userId: user?.uid,
      callback: setBlazeNewMsg,
      isExternal: user?.is_external_instructor || false,
    });
    return () => unsubscribe();
  }, [user?.grade, user?.is_external_instructor]);

  useEffect(() => {
    let unsubscribe = unreadAnswerNotification({
      grade: user?.grade,
      userId: user?.uid,
      callback: setUnreadAnswerCount,
    });
    return () => unsubscribe();
  }, [user?.grade]);

  const setMenuItem = (selected_menu_item) => {
    setSelectedMenuItem(selected_menu_item);
  };

  const getClassName = (name) =>
    selectedMenuItem === name
      ? isDarkMode
        ? `navbar-item active ${name} navbar-item-dark`
        : `navbar-item ${name} active`
      : isDarkMode
        ? "navbar-item navbar-item-dark"
        : "navbar-item";

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.startsWith('/classes') && pathname.split('/').length > 2 && isSmallScreen2) {
      setBlazeDarkMode(true);
    }

  }, [location]);

  return (
    <div
      className={
        blazeDarkMode || isDarkMode ? "headerContainer dark" : "headerContainer"
      }
    >
      {!user && <LoginBar />}
      <div
        className={
          showMenuItem || !isSmallScreen
            ? "header"
            : "header liveSessionsHeader"
        }
      >
        <div className="header__left">
          {isTabletScreen && (
            <div>
              <MenuIcon
                onClick={() => setMobileOpen(true)}
                style={{
                  color: "var(--color-text)",
                  cursor: "pointer",
                  visibility: menuVisibility ? "visible" : "hidden",
                }}
              />
            </div>
          )}

          <div
            className={
              menuVisibility
                ? "header__logo"
                : "header__logo header__logo__left"
            }
          >
            <Link to="/">
              {isUserProTier ? (
                <img
                  className="header__leftImage"
                  src={
                    showMenuItem || !isSmallScreen
                      ? blazeDarkMode || isDarkMode
                        ? proLogoDark
                        : proLogoLight
                      : proLogoDark
                  }
                  alt="PuStack"
                />
              ) : (
                <img
                  className="header__leftImage"
                  src={
                    showMenuItem || !isSmallScreen
                      ? blazeDarkMode || isDarkMode
                        ? logoDark
                        : logoLight
                      : logoDark
                  }
                  alt="PuStack"
                />
              )}
            </Link>
          </div>
          <Tooltip title={"Homepage"} classes={tooltipClasses}>
            <Link
              to="/"
              onClick={(e) => {
                setMenuItem("homepage");
                handleClick(e);
              }}
              className={getClassName("homepage")}
              style={{ textDecoration: "inherit" }}
              id="homeIntro"
            >
              <div className="nav__box__wrapper">
                <Icon className="nav__icon">
                  <img
                    className="nav__icon__img"
                    src={
                      selectedMenuItem === "homepage"
                        ? isDarkMode
                          ? homeIconSelected2
                          : homeIconSelected
                        : homeIcon
                    }
                    alt="Home Icon"
                  />
                </Icon>
              </div>
            </Link>
          </Tooltip>
        </div>

        {isLargeScreen && (
          <MenuItems
            setMenuItem={setMenuItem}
            selectedMenuItem={selectedMenuItem}
            blazeNewMsg={blazeNewMsg}
          />
        )}

        <div className="header__right">
          <Tooltip
            title={"Live Classes"}
            style={{ fontSize: "20px" }}
            id="video__tooltip"
            classes={tooltipClasses}
          >
            <Link
              to="/classes"
              style={{ textDecoration: "inherit" }}
              className={getClassName("videos")}
              onClick={(e) => {
                setMenuItem("videos");
                handleClick(e);
              }}
              id="classesIntro"
            >
              <div className="nav__box__wrapper">
                <Icon className="nav__icon">
                  {hasSessions && (
                    <div className="has__sessions">
                      <div class="red__wrapper">
                        <div className="dot__red" />
                        <div className="red__bg">
                          <Lottie
                            options={{ animationData: glowIndicator, loop: true }}
                            speed={1.5}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <img
                    className="nav__icon__img"
                    src={
                      selectedMenuItem === "videos"
                        ? isDarkMode
                          ? liveIconSelected2
                          : liveIconSelected
                        : liveIcon
                    }
                    alt="Live Icon"
                  />
                </Icon>
              </div>
            </Link>
          </Tooltip>
          <div className="header__right-group">
            {isAppropriateScreen && isStandardGrade && (
              <div
                className="pustack-search-wrapper"
                onClick={() => setOpenSearchBox(true)}
              >
                <PuStackSearch
                  setOpenSearchBox={setOpenSearchBox}
                  openSearchBox={openSearchBox}
                />
              </div>
            )}
            {isSmallScreen && isStandardGrade && (
              <div
                className={
                  profileVisibility ? "mobile-search" : "mobile-search shift"
                }
                onClick={() => setOpenMobileSearch(true)}
              >
                <img src={searchIcon} alt="search" />
              </div>
            )}
            {isSmallScreen && isStandardGrade && <PuStackMobileSearch isDark={isDarkMode} />}

            {openSearchBox && !isSmallScreen && isStandardGrade && (
              <div
                onClick={() => setOpenSearchBox(false)}
                className="nav-backdrop"
              />
            )}

            {(openSearchBox || openBackdrop) && !isSmallScreen && isStandardGrade && (
              <div
                className="search-backdrop"
                onClick={() => setOpenSearchBox(false)}
              />
            )}

            <AccountSettings
              setBackdrop={setOpenBackdrop}
              profileVisibility={profileVisibility}
            />
          </div>
        </div>
      </div>
      {isSmallScreen && showMenuItem && (
        <div className="header_mobileMenuItems">
          <MobileMenuItems
            setMenuItem={setMenuItem}
            selectedMenuItem={selectedMenuItem}
            blazeNewMsg={blazeNewMsg}
          />
          {!closeInstallApp && (
            <div className="app-install">
              <h6
                onClick={() => {
                  setCloseInstallApp(true);
                  localStorage.setItem("closeInstallApp", JSON.stringify(true));
                }}
              >
                X
              </h6>
              <img src={appLogo} alt="app" />
              <div>
                <h5>PuStack App</h5>
                <p>Get the best of PuStack Experience</p>
              </div>
              <div className="install-btn">
                <a
                  href={appGooglePlayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setCloseInstallApp(true);
                    localStorage.setItem(
                      "closeInstallApp",
                      JSON.stringify(true)
                    );
                  }}
                >
                  INSTALL APP
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
