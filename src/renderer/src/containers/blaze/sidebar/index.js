import React, { useContext, useEffect, useCallback, useRef } from "react";
import Lottie from "lottie-react-web";
import Particles from "react-tsparticles";
import Tooltip from "@material-ui/core/Tooltip";
import { useMediaQuery } from "react-responsive";
import { makeStyles } from "@material-ui/core/styles";
import CallMadeIcon from "@material-ui/icons/CallMade";
import BlazeStudentCard from "./components/studentCard";

import EmptyBox from "../../../assets/lottie/empty-box.json";
import BlazeIcon from "../../../assets/images/blaze/icon.svg";
import "./style.scss";

import {PustackProContext, ThemeContext, UserContext} from "../../../context";
import AddIcon from "../../../assets/blaze/addIcon";
import Orbit from "../../../assets/blaze/orbit.png";
import Saturn from "../../../assets/images/userMenu/pro_planet_yellow.svg";
import CalendarIcon from "../../../assets/blaze/calendarIcon";
import blazeIcon2 from "../../../assets/images/icons/flash.svg";
import BlazeSidebarSteps from "../../../assets/images/blaze/blazeSidebarSteps";
import BlazeSidebarStepsLight from "./../../../assets/images/blaze/blazeSidebarStepsLight";
import teacher1 from "../../../assets/images/teachers/Divyam Sir.jpg";
import teacher2 from "../../../assets/images/teachers/Himanshu Sir.jpg";
import teacher3 from "../../../assets/images/teachers/Ishita Ma_am.jpg";
import teacher4 from "../../../assets/images/teachers/Manish Sir.jpg";
import teacher5 from "../../../assets/images/teachers/Rupal Ma_am.jpg";
import teacher6 from "../../../assets/images/teachers/Shreya Ma_am.jpg";
import Book from "../../../assets/blaze/calendar.svg";
import Meet from "../../../assets/blaze/video_call.svg";
import Learn from "../../../assets/blaze/learn.png";
import { showSnackbar } from "../../../helpers";
import {getActiveStudentSessions, usedMinutesForToday} from "../../../database/blaze/fetch-data";
import BookSession from "./components/bookSession";
import InfiniteScroll from "../../../components/global/infinite-scroll";

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: { color: theme.palette.common.black },
  tooltip: {
    backgroundColor: "rgba(0,0,0,0.75)",
    color: "rgba(255,255,255,1)",
    maxWidth: 260,
    fontWeight: 400,
    fontSize: theme.typography.pxToRem(13.5),
    padding: ".5rem .75rem",
  },
}));

export default function Sidebar({
  fetchMoreCompletedSessions,
  moreCompletedSessions,
  setSelectedSessionId,
  initialized,
  setSelectedSession,
  noMoreCompletedSessions,
  targetedItem,
  requestedSessions,
  completedSessions,
  sessionSelected,
  ongoingSessions,
  setIsChatOpen,
  closeDrawer,
  openPopUp,
}) {
  const [isDark] = useContext(ThemeContext).theme;
  const [user] = useContext(UserContext).user;
  const [isProTier] = useContext(UserContext).tier;
  const tooltipClasses = useStylesBootstrap();
  const [_, setShowWarning] = useContext(PustackProContext).warning;
  const targetedRef = useRef(null);

  const [showBlazeMain, setShowBlazeMain] =
    useContext(UserContext).showBlazeMain;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  const observer = useRef();

  const targetRefCB = useCallback((node, sessionId) => {
    if(!targetedItem) targetedRef.current = null;
    if(sessionId === targetedItem) {
      targetedRef.current = node;
    }
  }, [targetedItem])

  return (
    <div
      className={
        isDark
          ? showBlazeMain
            ? "blaze__sidebar dark blazeMain"
            : "blaze__sidebar dark"
          : showBlazeMain
          ? "blaze__sidebar blazeMain"
          : "blaze__sidebar"
      }
    >
      <div
        className={
          isDark
            ? "sidebar__header__wrapper sidebar__header__wrapper__dark"
            : "sidebar__header__wrapper"
        }
        style={{
          backgroundColor: isSmallScreen && showBlazeMain && "transparent",
        }}
      >
        {isSmallScreen && showBlazeMain && (
          <Particles
            height={"calc(100vh - 142px)"}
            width="100%"
            params={{
              particles: {
                number: {
                  value: 400,
                  density: { enable: true, value_area: 600 },
                },
                color: { value: "ffffff" },
                shape: {
                  type: "circle",
                  stroke: { width: 0, color: "#000000" },
                  polygon: { nb_sides: 5 },
                },
                opacity: {
                  value: 0.6,
                  random: false,
                  anim: {
                    enable: true,
                    speed: 0.2,
                    opacity_min: 0,
                    sync: false,
                  },
                },
                size: {
                  value: 3,
                  random: true,
                  anim: { enable: true, speed: 2, size_min: 0, sync: false },
                },
                line_linked: {
                  enable: false,
                  distance: 150,
                  color: "#ffffff",
                  opacity: 0.4,
                  width: 1,
                },
                move: {
                  enable: true,
                  speed: 0.2,
                  direction: "none",
                  random: true,
                  straight: false,
                  out_mode: "out",
                  bounce: false,
                  attract: { enable: false, rotateX: 600, rotateY: 1200 },
                },
              },
              interactivity: {
                detect_on: "canvas",
                events: {
                  onhover: { enable: true, mode: "bubble" },
                  onclick: { enable: true, mode: "push" },
                  resize: true,
                },
                modes: {
                  grab: { distance: 400, line_linked: { opacity: 1 } },
                  bubble: {
                    distance: 83.91608391608392,
                    size: 1,
                    duration: 3,
                    opacity: 1,
                    speed: 3,
                  },
                  repulse: { distance: 200, duration: 0.4 },
                  push: { particles_nb: 4 },
                  remove: { particles_nb: 2 },
                },
              },
              retina_detect: true,
            }}
          />
        )}
        <div className="sidebar__header">
          <h1>Blaze</h1>
          <div className="sidebar__tab">
            {(requestedSessions?.length > 0 ||
              ongoingSessions?.length > 0 ||
              completedSessions?.length > 0) && (
              <Tooltip
                title={!showBlazeMain ? "Blaze" : "Show Blaze Sessions"}
                classes={tooltipClasses}
              >
                <button
                  className="toggle__blaze"
                  onClick={() => {
                    setShowBlazeMain(!showBlazeMain);
                    setSelectedSession(null);
                  }}
                >
                  {!showBlazeMain ? (
                    <img
                      className={isDark ? "blaze__Icon dark" : "blaze__Icon"}
                      src={blazeIcon2}
                      alt="Blaze"
                    />
                  ) : (
                    <CalendarIcon color={isDark ? "white" : "black"} />
                  )}
                </button>
              </Tooltip>
            )}
            <Tooltip title="Request a Session" classes={tooltipClasses}>
              <BookSession openPopUp={openPopUp}>
                <AddIcon
                  className={
                    isDark
                      ? "blaze__addIcon blaze__addIcon__dark"
                      : "blaze__addIcon"
                  }
                  color={"white"}
                />
              </BookSession>
            </Tooltip>
          </div>
        </div>
      </div>

      {showBlazeMain && (
        <div
          className={
            showBlazeMain
              ? "blaze__sidebar__nosessions__wrapper show__tabs fadeIn"
              : "blaze__sidebar__nosessions__wrapper fadeIn"
          }
        >
          {isSmallScreen ? (
            <div className="sidebar-particle-wrapper">
              <div className="text-slideshow">
                <p class="item-1">
                  <span>Wanna learn 1-on-one?</span>
                </p>
                <p class="item-2">
                  <span>Exam coming up?</span>
                </p>
                <p class="item-3">
                  <span>Got a doubt?</span>
                </p>
                <p class="item-4">
                  <span>Need career advice?</span>
                </p>

                <h4>PuStack Teachers can help!</h4>
              </div>

              <div className="blaze__circle">
                <div className="orbits__wrapper">
                  <div className="orbit__3">
                    <div className="orbit__wrapper">
                      <img
                        src={Orbit}
                        alt="Orbit 1"
                        className="orbit__img"
                        draggable={false}
                      />
                      <div className="teacher__wrapper__1">
                        <div className="teacher__content">
                          <img
                            className="teacher__img"
                            src={teacher1}
                            alt="divyam"
                          />
                          <div className="teacher__tooltip">
                            <div className="name">Divyam Sir</div>
                            <div className="teacher__details">
                              <div className="subject">English</div>
                              <div className="rating">
                                <i className="fas fa-star"></i>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="teacher__wrapper__2">
                        <div className="teacher__content">
                          <img
                            className="teacher__img"
                            src={teacher4}
                            alt="teacher"
                          />
                          <div className="teacher__tooltip">
                            <div className="name">Manish Sir</div>
                            <div className="teacher__details">
                              <div className="subject">Science</div>
                              <div className="rating">
                                <i className="fas fa-star"></i>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="teacher__wrapper__2 t3">
                        <div className="teacher__content">
                          <img
                            className="teacher__img"
                            src={teacher3}
                            alt="teacher"
                          />
                          <div className="teacher__tooltip">
                            <div className="name">Ishita Ma'am</div>
                            <div className="teacher__details">
                              <div className="subject">SST</div>
                              <div className="rating">
                                <i className="fas fa-star"></i>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="orbit__2">
                    <div className="orbit__wrapper">
                      <img
                        src={Orbit}
                        alt="Orbit 1"
                        className="orbit__img"
                        draggable={false}
                      />

                      <div className="saturn">
                        <img src={Saturn} alt="saturn" draggable={false} />
                      </div>
                      <div className="teacher__wrapper__2 t4">
                        <div className="teacher__content">
                          <img
                            className="teacher__img"
                            src={teacher6}
                            alt="shreya"
                          />
                          <div className="teacher__tooltip">
                            <div className="name">Shreya Ma'am</div>
                            <div className="teacher__details">
                              <div className="subject">SST</div>
                              <div className="rating">
                                <i className="fas fa-star"></i>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="orbit__1">
                    <div className="orbit__wrapper">
                      <img
                        src={Orbit}
                        alt="Orbit 1"
                        className="orbit__img"
                        draggable={false}
                      />
                      <div className="teacher__wrapper__2 t2">
                        <div className="teacher__content">
                          <img
                            className="teacher__img"
                            src={teacher2}
                            alt="himanshu"
                          />
                          <div className="teacher__tooltip">
                            <div className="name">Himanshu Sir</div>
                            <div className="teacher__details">
                              <div className="subject">Maths</div>
                              <div className="rating">
                                <i className="fas fa-star"></i>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="teacher__wrapper__2 t5">
                        <div className="teacher__content">
                          <img
                            className="teacher__img"
                            src={teacher5}
                            alt="rupal"
                          />
                          <div className="teacher__tooltip">
                            <div className="name">Rupal Ma'am</div>
                            <div className="teacher__details">
                              <div className="subject">Science</div>
                              <div className="rating">
                                <i className="fas fa-star"></i>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <img
                    className="user__img__blaze"
                    src={user?.profile_url}
                    key={user?.profile_url}
                    alt="user"
                  />
                </div>
              </div>
              <div className="bottom-section">
                <div className="book">
                  <img src={Book} alt="Book" draggable={false} />
                  <p>Book</p>
                </div>
                <div className="arrow-right">
                  <CallMadeIcon />
                </div>
                <div className="meet">
                  <img src={Meet} alt="Meet" draggable={false} />
                  <p>Meet</p>
                </div>
                <div className="arrow-right">
                  <CallMadeIcon />
                </div>
                <div className="learn">
                  <img src={Learn} alt="Learn" draggable={false} />
                  <p>Learn</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="blaze__sidebar__nosessions__content">
                <img
                  className="blaze__icon"
                  src={BlazeIcon}
                  alt="PuStack Blaze"
                />

                <div className="sidebar__content__text">
                  Learn from the best teachers in <br />{" "}
                  <span className="highlighted">1-on-1 interaction</span>
                </div>
                <BookSession className="book__now__btn" openPopUp={openPopUp}>
                  Book Now
                </BookSession>
              </div>
              <div className="blaze__sidebar__steps">
                {isDark ? <BlazeSidebarStepsLight /> : <BlazeSidebarSteps />}
              </div>
            </>
          )}
        </div>
      )}

      {requestedSessions === null &&
        ongoingSessions === null &&
        completedSessions === null &&
        !showBlazeMain && (
          <div className="no__sessions">
            <Lottie
              options={{ animationData: EmptyBox, loop: false }}
              speed={0.45}
            />
            <h4 style={{ textAlign: "center" }}>No Blaze Sessions</h4>
          </div>
        )}
      <InfiniteScroll
        initialized={initialized}
        className="blaze__sidebar__content"
        fetchMoreFn={fetchMoreCompletedSessions}
        noMore={noMoreCompletedSessions}
        textStyle={{fontSize: '14px'}}
        targetedRef={targetedRef}
      >
      {/*<div className="blaze__sidebar__content">*/}
        {ongoingSessions !== null &&
          !showBlazeMain &&
          ongoingSessions.map((session) => (
            <BlazeStudentCard
              onClick={() => {
                closeDrawer();
                setIsChatOpen(true);
                setSelectedSession(session);
                setSelectedSessionId(session?.id);
              }}
              type="accepted"
              isSessionSelected={sessionSelected?.id === session?.id}
              sessionId={session?.id}
              key={session?.id}
              topic={session?.topic}
              studentId={session?.student_id}
              instructorImage={session?.instructor_profile_pic}
              skill={session?.skill}
              chapter={session?.chapter}
              rating={session?.instructor_rating}
              instructorName={session?.instructor_name}
              gradient={session?.subject_color_gradient}
              unreadMsgCount={session?.student_unread_count}
            />
          ))}
        {!showBlazeMain &&
          requestedSessions?.map((session) => (
            <BlazeStudentCard
              onClick={() => {
                closeDrawer();
                setIsChatOpen(true);
                setSelectedSession(session);
                setSelectedSessionId(session?.id);
              }}
              isSessionSelected={sessionSelected?.id === session?.id}
              key={session?.id}
              sessionId={session?.id}
              type="requested"
              topic={session?.topic}
              studentId={session?.student_id}
              instructorImage={session?.instructor_profile_pic}
              skill={session?.skill}
              chapter={session?.chapter}
              rating={session?.instructor_rating}
              instructorName={session?.instructor_name}
              gradient={session?.subject_color_gradient}
              unreadMsgCount={session?.student_unread_count}
            />
          ))}
        {completedSessions?.length > 0 && !showBlazeMain && (
          <h4 className="completed__sessions__header">COMPLETED</h4>
        )}
        {completedSessions?.length > 0 &&
          !showBlazeMain &&
          completedSessions.map((session) => (
            <BlazeStudentCard
              onClick={() => {
                closeDrawer();
                setIsChatOpen(true);
                setSelectedSession(session);
                setSelectedSessionId(session?.id);
              }}
              ref={n => targetRefCB(n, session?.id)}
              isSessionSelected={sessionSelected?.id === session?.id}
              sessionId={session?.id}
              key={session?.id}
              type="completed"
              topic={session?.topic}
              studentId={session?.student_id}
              instructorImage={session?.instructor_profile_pic}
              skill={session?.skill}
              chapter={session?.chapter}
              rating={session?.instructor_rating}
              queryToAdd={"completed=true"}
              instructorName={session?.instructor_name}
              gradient={session?.subject_color_gradient}
              unreadMsgCount={session?.student_unread_count}
            />
          ))}
      </InfiniteScroll>
        {/*<div ref={lastCardRef}></div>*/}
      {/*</div>*/}
    </div>
  )
}
