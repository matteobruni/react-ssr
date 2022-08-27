import React, {useCallback, useContext, useEffect, useRef, useState,} from "react";
import {Menu} from "@material-ui/core";
import {AutoFontSize} from "auto-fontsize";
import {useMediaQuery} from "react-responsive";
import {Link, useHistory, useLocation} from "react-router-dom";
import VisibilitySensor from "react-visibility-sensor";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import AddIcon from '@material-ui/icons/Add';
import {LiveSessionContext, ThemeContext, UserContext,} from "../../../context";

import {fetchIndianTime, monthToStrFormat, showSnackbar} from "../../../helpers";
import "./style.scss";
import useCalendar from "../../../hooks/calendar";
import {CustomMenuItem} from "../../../components";
import {
  fetchSessionsForDateByGrade, formatDateDoc,
  getDirectionFullSessions, isSameDate
} from "../../../database/livesessions/sessions";
import ContentLoader from "react-content-loader";
import useTimer from "../../../hooks/timer";
import useToday from "../../../hooks/today";
import {DeleteSessionConfirmationContent, RouteConfirmationContent} from "../sessionarea";
import {ModalContext} from "../../../context/global/ModalContext";
import PustackContextMenu, {PustackContextMenuItem} from "../../../components/global/context-menu";
import ExpandLess from "@material-ui/icons/ExpandLess";
import {ExpandLessRounded} from "@material-ui/icons";
import {getAvailableGrades} from "../../../database/home/fetcher";

const grades = getAvailableGrades(true);
let switchIndex = 0;

function TimeLineShimmer({isSmallScreen, isDarkTheme}) {
  const [isDark] = useContext(ThemeContext).theme;
  return (
    <ContentLoader
      width={isSmallScreen ? "100vw" : 344}
      style={{transform: 'translateY(-100px)', background: 'var(--color-primary)'}}
      height={"calc(100vh - 140px)"}
      backgroundColor={isDark ? "#282828" : "#f5f5f5"}
      foregroundColor={isDark ? "#343434" : "#dbdbdb"}
    >
      <rect
        x="12"
        y="119"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="184"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="249"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="314"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="379"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="444"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="509"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="574"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="639"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="704"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="769"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="834"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="899"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
      <rect
        x="12"
        y="964"
        rx="3"
        ry="3"
        width={isSmallScreen ? "94vw" : "320"}
        height="5"
      />
    </ContentLoader>
  )
}

export default function Sidebar({
                                  dateChangeHandler,
                                  dateSelected,
                                  showPlayer = null,
                                  hidePlayer = null,
                                  setOpenModal,
                                  ...props // It has bodyMap as a property
                                }) {
  const history = useHistory();
  const location = useLocation();
  const autoScrollingRef = useRef();
  const [timer] = useTimer(60000);
  const today = useToday();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeDate, setActive] = useState(dateSelected);
  const [bodyMap, setBodyMap] = useState(props.bodyMap);
  const [curDateSessions, setCurDateSessions] = useContext(LiveSessionContext).curDateSessions;
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [clickedDate, setClick] = useState(null);
  const {current, jumpTo, next, prev, dates, currDate, monthView, setMonthView} = useCalendar(null);
  const [currentSeekTime, setCurrentSeekTime] = useState(0);
  const [currentSession, setCurrentSession] = useContext(LiveSessionContext).current;
  const [, setConfirmationModalData] = useContext(ModalContext).state;
  const [currentSessionDetails, setCurrentSessionDetails] = useContext(LiveSessionContext).currentSessionDetails;
  const [isVisible, setIsVisible] = useState(true);
  const [isVisible2, setIsVisible2] = useState(true);
  const [hasNoSessions, setHasNoSessions] = useState(false);
  const [state, setState] = React.useState({sessionId: null, sessionLive: null, sessionGrade: null, mouseX: null, mouseY: null});


  const [, setIsSessionLive] = useContext(LiveSessionContext).live;
  const [redirectState, setRedirectState] = useContext(LiveSessionContext).redirectState;
  const [isDarkTheme] = useContext(ThemeContext).theme;
  const [isUserPro] = useContext(UserContext).tier;
  const [isInstructor] = useContext(UserContext).isInstructor;

  const [, setPlaying] = useContext(LiveSessionContext).playing;

  const isTabletScreen = useMediaQuery({query: "(max-width: 1200px)"});
  const isSmallScreen = useMediaQuery({query: "(max-width: 430px)"});

  const visibility = useRef();
  const visibility2 = useRef();

  const handleContextMenu = (event, {id, grade, isWhiteboardClass}) => {
    if(!isInstructor) return;
    event.preventDefault();
    setState({
      sessionId: id,
      sessionGrade: grade,
      sessionLive: isWhiteboardClass,
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => {
    setState({sessionId: null, sessionGrade: null, sessionLive: null, mouseX: null, mouseY: null});
  };

  const visibilityRef = useCallback(
    function (node) {
      if (
        node !== null &&
        curDateSessions.length > 0
      ) {
        if (visibility.current) visibility.current.disconnect();

        visibility.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
        if (node) visibility.current.observe(node);
      }
    },
    [curDateSessions]
  );

  const visibilityRef2 = useCallback(
    function (node) {
      if (
        node !== null &&
        curDateSessions.length > 0
      ) {
        if (visibility2.current) visibility2.current.disconnect();

        visibility2.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible2(true);
          } else {
            setIsVisible2(false);
          }
        });
        if (node) visibility2.current.observe(node);
      }
    },
    [curDateSessions]
  );

  useEffect(() => {
    if(!redirectState) return;
    let controller = new AbortController();
    if(redirectState) {
      let signal = controller.signal;
      setCurrentSession(null);
      setCurrentSessionDetails(null);
      fetchIndianTime(signal)
        .then(indianTime => {
          const timelineDate = redirectState?.timelineDate;
          const clearDateSessionData = redirectState?.clearDateSessionData;
          if(clearDateSessionData) {
            let {date, month, year} = clearDateSessionData;
            setBodyMap(bodyMap => ({...bodyMap, [`${year}_${+month + 1}_${date}`]: undefined}));
          }
          handleClick(timelineDate, timelineDate, true).then(c => {
            // Show the latest one
            if(redirectState?.showLatest) {
              for(let i = 0; i < c.length; i++) {
                let curSession = c[i];
                if (
                  (curSession.start_ts >=
                    +indianTime - curSession.duration * 60 * 1000 ||
                    i === c.length - 1) &&
                  isSameDate(indianTime, curSession.start_ts)
                ) {
                  setCurrentSession(curSession);
                  break;
                }
              }
            } else {
              let curSession = c.find(c => c.session_id === location.pathname.split('/').pop());
              if(!curSession) {
                return;
              }
              setCurrentSession(curSession);
            }

            showPlayer && showPlayer();
            setOpenModal && setOpenModal();
            setPlaying(false);
            setIsSessionLive(false);
            setRedirectState(null);
          })
        })
    }
    return () => controller.abort();
  }, [redirectState]);

  useEffect(() => {
    if (!isSmallScreen) {
      showPlayer();
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const pathname = history.location.pathname;
    const splitted = pathname.split("/");

    if (splitted.length === 3) {
      isSmallScreen && showPlayer();
    } else {
      isSmallScreen && hidePlayer();
    }
  }, [history]);


  useEffect(() => {
    let flag = !Boolean(curDateSessions.length);
    setHasNoSessions(flag);
  }, [curDateSessions]);

  useEffect(() => {
    if(!redirectState?.timelineDate) {
      if(currDate) {
        const list = getDirectionFullSessions(bodyMap[formatDateDoc(currDate)]?.session_event_list || []);
        setCurDateSessions(list || []);
      }

      setClick(currDate);
    }
  }, [currDate]);

  // const calcCurrentSeek = () => {
  //   setCurrentSeekTime(
  //     new getIndianTime().getHours() - 8 + new getIndianTime().getMinutes() / 60
  //   );
  // };

  const handleClick = async (item, item2, fetchIt) => {
    // fetchIt - fetch the newly clicked date'
    console.log('handleClick - ', item, item2, bodyMap);
    switchIndex += 1;
    if (isSameDate(item, item2)) {
      setClick(item);
      setActive(item);
      // Jumping to today [for the calendar]
      if(monthView) {
        jumpTo(item.month, item.year);
      }
    } else {
      setClick(item2);
      setActive(item);
    }

    async function getSessionsForMonthView() {
      if(!isInstructor) return;
      let oldIndex = switchIndex;
      setIsSessionsLoading(true);
      setCurDateSessions([]);
      if (!item) return;
      const _sessions = [];
      let latestSessions = [];
      for (let i = 0; i < grades.length; i++) {
        const grade = grades[i];
        let session = await fetchSessionsForDateByGrade(grade, item);
        _sessions.push(...session[0]);
        latestSessions.push(session[1]);
      }
      _sessions.sort(
        (a, b) => {
          if (a?.air_time.hour - b?.air_time.hour === 0) {
            return a?.air_time.minute - b?.air_time.minute
          }
          return a?.air_time.hour - b?.air_time.hour;
        }
      )
      const list = getDirectionFullSessions(_sessions);
      if(switchIndex === oldIndex || fetchIt) {
        setCurDateSessions(list || []);
        setIsSessionsLoading(false);
      }
      setBodyMap(bodyMap => {
        bodyMap[formatDateDoc(item)] = {...item, session_event_list: list};
        return bodyMap;
      })
      return list;
    }

    if(fetchIt) {
      return await getSessionsForMonthView();
    }

    // if (!monthView) {
    //   const list = bodyMap[formatDateDoc(item)]?.session_event_list || [];
    //   setIsSessionsLoading(false);
    //   setCurDateSessions(list || []);
    // } else {
    dateChangeHandler(item);
    if(bodyMap[formatDateDoc(item)]) {
      setIsSessionsLoading(false);
      setCurDateSessions(bodyMap[formatDateDoc(item)]?.session_event_list || []);
      return;
    }
    await getSessionsForMonthView();
    // }
  };

  useEffect(() => {
    if(!autoScrollingRef?.current || !today) return
    autoScrollingRef.current.scrollTop =
      (today.getHours() -
        8 +
        today.getMinutes() / 60) *
      63 -
      75;
  }, [autoScrollingRef, today])

  useEffect(() => {
    if(!timer) return;
    setCurrentSeekTime(
      timer.getHours() - 8 + timer.getMinutes() / 60
    );
    // After Every Minute
    // setInterval(calcCurrentSeek, 60000);
  }, [timer]);

  useEffect(() => {
    setBodyMap(props.bodyMap);
  }, [props.bodyMap]);

  const list_of_days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const times = [
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
    "12 AM",
  ];

  return (
    <div
      className={
        (isDarkTheme ? "live__sessions__sidebar dark" : "live__sessions__sidebar") + " " + props.state
      }
      style={{
        minHeight: isTabletScreen ? "100vh" : "none",
        background: isTabletScreen ? "var(--color-primary)" : "none",
      }}
    >
      <div className="liveMain">
        <div className="live__main__controls"
             style={{height: dates.length === 6 ? '401px' : dates.length === 5 ? '354px' : '146px'}}>
          <div className="sidebar__controls__header">
            <h1>Live Classes </h1>
            {!isInstructor ?
              <div
                className="sidebar__reset"
                style={{opacity: isSameDate(currDate, clickedDate) ? 0 : 1}}
                onClick={() => handleClick(currDate, currDate)}
              >
                Today
              </div> :
              <div>
                <div
                  className={"sidebar__create__btn" + (anchorEl ? ' active' : '')}
                  id="basic-button"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  aria-controls={Boolean(anchorEl) ? 'basic-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                >
                  <AddIcon/>
                </div>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => {
                    // setMonthView(false);
                    setAnchorEl(null)
                  }}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                  anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom'
                  }}
                  transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                  }}
                  getContentAnchorEl={null}
                  PopoverClasses={{paper: 'sidebar__add__button' + (isDarkTheme ? ' dark' : '')}}
                  anchorReference={'anchorEl'}
                >
                  <CustomMenuItem
                    label="Create New Session"
                    isDark={isDarkTheme}
                    onClickMenuItem={() => {
                      // showSnackbar("Comment Reported", "success");
                      history.push('/classes/create');
                      setAnchorEl(null);
                    }}
                  />
                  <CustomMenuItem
                    label="Copy Previous Session"
                    isDark={isDarkTheme}
                    onClickMenuItem={() => {
                      setMonthView(true);
                      // showSnackbar("Comment Reported", "success");
                      setAnchorEl(null);
                    }}
                  />
                  <CustomMenuItem
                    label="Schedule Live Class"
                    isDark={isDarkTheme}
                    onClickMenuItem={() => {
                      // showSnackbar("Comment Reported", "success");
                      history.push('/classes/createLive');
                      setAnchorEl(null);
                    }}
                  />
                </Menu>
              </div>
            }
          </div>
          <div className="calendar">
            <table>
              <tbody>
              {monthView &&
                <tr className="calendar__header">
                  <td>
                    <div className="calendar__caret" onClick={prev}>
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M0.340979 6.54986L5.82298 11.3459C6.46898 11.9119 7.48098 11.4519 7.48098 10.5929V1.00086C7.48114 0.808614 7.42589 0.620396 7.32184 0.458746C7.21779 0.297096 7.06934 0.168865 6.89429 0.0894087C6.71923 0.00995282 6.52498 -0.0173596 6.3348 0.0107422C6.14462 0.0388441 5.96657 0.121169 5.82198 0.247858L0.34198 5.04386C0.23457 5.13772 0.148484 5.25347 0.0895 5.38335C0.0305162 5.51322 0 5.65422 0 5.79686C0 5.9395 0.0305162 6.08049 0.0895 6.21037C0.148484 6.34024 0.23457 6.456 0.34198 6.54986H0.340979Z"
                          fill="white"/>
                      </svg>
                    </div>
                    <div className="calendar__header__label">
                      {`${monthToStrFormat(current.month).match(/.{1,3}/g)[0]}, ${current.year}`}
                    </div>
                    <div className="calendar__caret" onClick={next}>
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7.14 6.54986L1.658 11.3459C1.012 11.9119 3.67706e-07 11.4519 3.67706e-07 10.5929V1.00086C-0.000164459 0.808614 0.0550878 0.620396 0.159141 0.458746C0.263194 0.297096 0.411637 0.168865 0.586693 0.0894087C0.761749 0.00995282 0.955998 -0.0173596 1.14618 0.0107422C1.33636 0.0388441 1.51441 0.121169 1.659 0.247858L7.139 5.04386C7.24641 5.13772 7.3325 5.25347 7.39148 5.38335C7.45046 5.51322 7.48098 5.65422 7.48098 5.79686C7.48098 5.9395 7.45046 6.08049 7.39148 6.21037C7.3325 6.34024 7.24641 6.456 7.139 6.54986H7.14Z"
                          fill="white"/>
                      </svg>
                    </div>
                  </td>
                  <td>
                    <div
                      className="sidebar__reset"
                      style={{opacity: isSameDate(currDate, clickedDate) ? 0 : 1}}
                      onClick={() => handleClick(currDate, currDate)}
                    >
                      Today
                    </div>
                    <div
                      className="sidebar__reset"
                      style={{opacity: 1, background: '#eee'}}
                      onClick={() => {
                        setMonthView(false);
                      }}
                    >
                      <ExpandLessRounded fill="lightgrey" />
                    </div>
                  </td>
                </tr>
              }
              {dates?.map((dateDateArr, ind) => {
                return (
                  <tr className="Dates">
                    {dateDateArr?.map(({date, day, isCurMonth, month, year}) => {
                      return (
                        <td
                          onClick={() => handleClick({date, month, year}, {date, month, year})}
                          key={date + '' + month + '' + year}
                          className={
                            isSameDate(activeDate, {date, month, year})
                              ? "date__button active"
                              : isSameDate(currDate, {date, month, year})
                                ? "date__button current"
                                : "date__button"
                          }
                        >
                          {ind === 0 &&
                            <div className="day__name">
                              {list_of_days[day].match(/.{1,3}/g)[0]}
                            </div>
                          }
                          <div style={{opacity: isCurMonth ? 1 : 0.45}}>{date}</div>
                          {!isInstructor &&
                            <div className="session__indicators">
                              {bodyMap[formatDateDoc({date, month, year})]?.session_event_list.map((_) => (
                                <p className="session__indicator"/>
                              ))}
                              {/*{bodyMap[formatDateDoc({date, month, year})]?.session_event_list.length}*/}
                            </div>
                          }
                        </td>
                      );
                    })}
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>


        {(isSessionsLoading) ? <TimeLineShimmer/> : (
          <div className="fixed__timeline">
            <div ref={autoScrollingRef} className="sessions__list__wrapper"
                 style={{height: dates.length === 6 ? 'calc(100vh - 477px)' : dates.length === 5 ? 'calc(100vh - 430px)' : 'calc(100vh - 222px)'}}>
              <div className="sessions__timeline__wrapper">
                {times.map((time) => (
                  <div
                    className="timeline__line__wrapper"
                    ref={time === "12 AM" ? visibilityRef2 : null}
                  >
                    <div className="timeline__line__time">{time}</div>
                    <hr className="timeline__line"/>
                  </div>
                ))}

                <div className="timeline__line__wrapper" id="ist__asterik">
                  <div className="ist__asterik">
                    * Time listed in Indian Standard Time (IST)
                  </div>
                </div>
              </div>
              <div className="sessions__cards__wrapper">
                {curDateSessions.map((e, index) => {
                  return (
                    <VisibilitySensor key={index} partialVisibility={true}>
                      <Link to={`/classes/${e?.session_id}`}>
                        <div
                          className={
                            (currentSession?.session_id === e?.session_id
                              ? "session__card focused"
                              : "session__card") + (
                                state.sessionId === e?.session_id ? ' isActive' : ''
                            )
                          }
                          onClick={() => {
                            showPlayer && showPlayer();
                            if(currentSession?.session_id === e?.session_id) return;
                            setCurrentSessionDetails(null);
                            setCurrentSession(e);
                            setOpenModal && setOpenModal();
                            setPlaying(false);
                            setIsSessionLive(false);
                          }}
                          onContextMenu={(event) => handleContextMenu(event, {id: e?.session_id, grade: e?.grade.id, isWhiteboardClass: e?.is_whiteboard_class})}
                          key={e.session_id + index}
                          ref={
                            index ===
                            curDateSessions.length -
                            1
                              ? visibilityRef
                              : null
                          }
                          style={{
                            top: `${
                              (e?.start_ts?.getHours() -
                                7.91 +
                                e?.start_ts?.getMinutes() / 60) *
                              61.25
                            }px`,
                            left: `calc(4.25rem + ${e?.left}px)`,
                            width: `${e?.width}px`,
                            height: `${(e?.duration / 60) * 61.25}px`,
                            background: `linear-gradient(315deg, ${e.gradient_end} 0%, ${e.gradient_start} 74%)`,
                          }}
                        >
                          <div className="session__card__decor"></div>
                          <div className="session__card__wrapper">
                            <h3 className="session__card__title">{e?.category} </h3>
                            <p className="session__card__desc" style={{fontSize: `${e?.groupSize === 1 ? 14 : 12}px`}}>
                              {e?.name}
                            </p>
                            {/*<AutoFontSize*/}
                            {/*  text={e?.name}*/}
                            {/*  textSize={e?.groupSize === 1 ? 14 : 12}*/}
                            {/*  textSizeStep={2}*/}
                            {/*  targetLines={e?.duration / 60 > 1 ? 2 : 1}*/}
                            {/*  ellipsisOverflow={true}*/}
                            {/*  style={{color: 'red'}}*/}
                            {/*/>*/}
                          </div>
                          {e?.tier === "Free" && !isUserPro && (
                            <div className="free__label"></div>
                          )}
                        </div>
                      </Link>
                    </VisibilitySensor>
                  );
                })}

                {/*<Menu*/}
                {/*  keepMounted*/}
                {/*  open={state.mouseY !== null}*/}
                {/*  onClose={handleClose}*/}
                {/*  autoFocus={false}*/}
                {/*  disableAutoFocusItem={true}*/}
                {/*  anchorReference="anchorPosition"*/}
                {/*  anchorPosition={*/}
                {/*    state.mouseY !== null && state.mouseX !== null*/}
                {/*      ? { top: state.mouseY, left: state.mouseX }*/}
                {/*      : undefined*/}
                {/*  }*/}
                {/*>*/}
                {/*  <CustomMenuItem*/}
                {/*    label="Edit"*/}
                {/*    isDark={isDarkTheme}*/}
                {/*    onClickMenuItem={() => {*/}
                {/*      console.log('curSession', currentSession);*/}
                {/*      setConfirmationModalData({*/}
                {/*        open: true,*/}
                {/*        Children: <RouteConfirmationContent*/}
                {/*          title="Edit Session"*/}
                {/*          description="Are you sure you want to edit this session?"*/}
                {/*          route={"/classes/create" + (state.sessionLive ? 'Live' : '' ) + "?edit=true&sessionId=" + state.sessionId + "&grade=" + state.sessionGrade}*/}
                {/*        />*/}
                {/*      })*/}
                {/*      handleClose();*/}
                {/*    }}*/}
                {/*  />*/}
                {/*  <CustomMenuItem*/}
                {/*    label="Delete"*/}
                {/*    isDark={isDarkTheme}*/}
                {/*    onClickMenuItem={() => {*/}
                {/*      // console.log('This feature is coming soon.');*/}
                {/*      // showSnackbar('This Feature is coming soon');*/}
                {/*      // return;*/}
                {/*      const sessionId = state.sessionId;*/}
                {/*      const sessionData = curDateSessions.find(c => c.session_id === sessionId);*/}
                {/*      setConfirmationModalData({open: true, Children: <DeleteSessionConfirmationContent sessionObj={sessionData.sessionObj} />});*/}
                {/*      handleClose();*/}
                {/*    }}*/}
                {/*  />*/}
                {/*  <CustomMenuItem*/}
                {/*    label="Duplicate"*/}
                {/*    isDark={isDarkTheme}*/}
                {/*    onClickMenuItem={() => {*/}
                {/*      setConfirmationModalData({*/}
                {/*        open: true,*/}
                {/*        Children: <RouteConfirmationContent*/}
                {/*          title="Copy Session"*/}
                {/*          description="Are you sure you want to copy this session?"*/}
                {/*          route={"/classes/create" + (state.sessionLive ? 'Live' : '' ) + "?edit=true&duplicate=true&sessionId=" + state.sessionId + "&grade=" + state.sessionGrade}*/}
                {/*        />*/}
                {/*      })*/}
                {/*      handleClose();*/}
                {/*    }}*/}
                {/*  />*/}
                {/*</Menu>*/}
                <div
                  className="current__seek"
                  style={{
                    opacity: isSameDate(timer, clickedDate) ? 1 : 0,
                    top: `${1 * currentSeekTime * 61.25 + 6}px`,
                  }}
                />
              </div>
            </div>

            <div
              className="down__indicator"
              style={{
                opacity: isVisible || isVisible2 || hasNoSessions ? 0 : 1,
                pointerEvents: isVisible || isVisible2 || hasNoSessions ? 'none' : 'all',
              }}
              onClick={() => {
                autoScrollingRef.current.scrollTop =
                  autoScrollingRef.current.scrollHeight;
              }}
            >
              <ArrowDownwardIcon
                style={{color: "white", height: "18px", width: "18px"}}
              />
              More Sessions
            </div>

            <PustackContextMenu autoScrollRef={autoScrollingRef} posX={state.mouseX} posY={state.mouseY} handleClose={handleClose}>
              <PustackContextMenuItem
                label="Edit"
                onItemClick={() => {
                  console.log('curSession', currentSession);
                  setConfirmationModalData({
                    open: true,
                    Children: <RouteConfirmationContent
                      title="Edit Session"
                      description="Are you sure you want to edit this session?"
                      route={"/classes/create" + (state.sessionLive ? 'Live' : '' ) + "?edit=true&sessionId=" + state.sessionId + "&grade=" + state.sessionGrade}
                    />
                  })
                  handleClose();
                }}
              />
              <PustackContextMenuItem
                label="Delete"
                onItemClick={() => {
                  // console.log('This feature is coming soon.');
                  // showSnackbar('This Feature is coming soon');
                  // return;
                  const sessionId = state.sessionId;
                  const sessionData = curDateSessions.find(c => c.session_id === sessionId);
                  setConfirmationModalData({open: true, Children: <DeleteSessionConfirmationContent sessionObj={sessionData.sessionObj} />});
                  handleClose();
                }}
              />
              <PustackContextMenuItem
                label="Duplicate"
                onItemClick={() => {
                  setConfirmationModalData({
                    open: true,
                    Children: <RouteConfirmationContent
                      title="Copy Session"
                      description="Are you sure you want to copy this session?"
                      route={"/classes/create" + (state.sessionLive ? 'Live' : '' ) + "?edit=true&duplicate=true&sessionId=" + state.sessionId + "&grade=" + state.sessionGrade}
                    />
                  })
                  handleClose();
                }}
              />
            </PustackContextMenu>
          </div>
        )}
      </div>
    </div>
  );
}
