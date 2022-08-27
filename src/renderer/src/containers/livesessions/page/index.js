import React, { Component } from "react";
import Lottie from "lottie-react-web";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import CancelIcon from "@material-ui/icons/Cancel";
import {
  LiveSessionsSidebar,
  LiveSessionsArea,
  LiveSessionQuizSidebar,
  LiveSessionCommentsArea,
} from "../../index";
import { fetchSessions } from "../../../database";
import {LiveSessionContext, UserContext} from "../../../context";
import { LiveSessionSidebarShimmer } from "../../../components";

import PuStackLogo from "../../../assets/images/logo.png";
import PuStackWhiteLogo from "../../../assets/images/logoDark.png";
import selfStudyLottie from "../../../assets/lottie/selfstudy.json";
// import AgoraStudentPage from '../agora';
import "../../../assets/bootstrap/bootstrap-grid.css";
import "./style.scss";
import SessionFormArea from "../sessionformarea";
import {
  fetchSessionsForDateByGrade,
  formatDateDoc,
  getCurrentWeek, getDateObj, getDirectionFullSessions,
  isSameDate
} from "../../../database/livesessions/sessions";
import {fetchIndianTime} from "../../../helpers";
import WhiteboardArea from "../whiteboard-area";
import VideoCall from "../whiteboard-area/video_call";
import ChatContainer from "../whiteboard-area/chat_container";
import AgoraClassFormArea from "../agoraclassformarea";
import {getPendulumIndicesOfArray} from "../../../helpers/functions/utils";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

export default class LiveSessionsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataMap: {},
      month: "",
      screenWidth: null,
      loading: true,
      dateSelected: new Date(),
      // showPlayer: false,
      activeTab: 0,
      openModal: true,
      _mounted: false
    };
    this.dateClicked = this.dateClicked.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  static contextType = LiveSessionContext;

  componentDidMount() {
    if(this?.props?.user?.email) {
      this.loadMore();
    }
    fetchIndianTime().then(ist => this.setState({dateSelected: ist, _mounted: true}))
    window.addEventListener("resize", this.updateWindowDimensions());
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.user !== this.props.user) {
      this.setState({ ...this.state, mounted: true, loading: true, data: [] })
      console.log('Running from here - the updated ones');
      this.loadMore();
    }
  }

  componentWillUnmount() {
    this.setState({_mounted: false});
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  dateClicked(i) {
    this.setState({ ...this.state, dateSelected: i });
  }

  updateWindowDimensions() {
    this.setState({ ...this.state, screenWidth: window.innerWidth });
  }

  async loadMore() {
    let months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    // Resetting the last session to show the shimmer
    this.props.setCurrentSession(null);
    this.props.setCurrentSessionDetails(null);
    console.log('Load more function is running now - ')

    let d = await fetchIndianTime();
    let monthName = months[d.getMonth()];

    const [collectionMap] = await fetchSessions(
      this?.props?.user?.grade,
      this?.props?.isInstructor
    );

    this.setState({dateSelected: d});

    let _currentURL = new URL(window.location.href);

    let currentSession = null;
    let todaySessions = collectionMap[formatDateDoc(d)].session_event_list;
    for(let i = 0; i < todaySessions.length; i++) {
      let curSession = todaySessions[i];
      if (
        (curSession.start_ts >=
          +d - curSession.duration * 60 * 1000 ||
          i === todaySessions.length - 1) &&
        isSameDate(d, curSession.start_ts)
      ) {
        currentSession = curSession;
        break;
      }
    }

    const paths = _currentURL.pathname.split("/");
    let _id = paths[2];

    if (paths.length === 3) {

      let match = false;

      console.log('collectionMap - ', collectionMap, _id);
      for (let i = 0; i < Object.keys(collectionMap).length; i++) {
        for (let j = 0; j < collectionMap[Object.keys(collectionMap)[i]]?.session_event_list?.length; j++) {
          if (collectionMap[Object.keys(collectionMap)[i]]?.session_event_list[j]?.session_id === _id) {
            // console.log('found - ', Object.keys(collectionMap)[i]?.session_event_list[j]);
            this.props.setCurrentSession( c => c?.session_id === _id ? c :
              collectionMap[Object.keys(collectionMap)[i]]?.session_event_list[j]
            );
            let obj = {...collectionMap[Object.keys(collectionMap)[i]]}
            delete obj.session_event_list;
            this.dateClicked(obj);
            match = true;
            break;
          }
        }

        if (match) break;
      }

      if (match === false) {
        console.log('found - ', currentSession);
        this.props.setCurrentSession(c => c?.session_id === _id ? c : currentSession);
      }
    } else {
      this.props.setCurrentSession(c => {
        // This check is redundant as the currentSession is being set null in the start of this function <loadMore>
        // But kept that for future just to be sure.
        return c && c.session_id === _id ? c : currentSession
      });
    }

    this.setState({ ...this.state, dataMap: collectionMap, month: monthName, loading: false }, () => {

      if(!this?.props?.isInstructor) {
        getCurrentWeek(d)
          .then(dates => {
            console.log('cloning again - ');
            // console.log('dates - ', dates);
            let baseIndex = dates.findIndex(c => c.getDate() === d.getDate());
            let indices = getPendulumIndicesOfArray(dates, baseIndex);
            // console.log('indices - ' , indices, d);
            indices.forEach(dateIndex => {
              fetchSessionsForDateByGrade(this?.props?.user?.grade, getDateObj(dates[dateIndex]))
                .then(sessionResult => {
                  // console.log('this.state - ', this.state);
                  if(!this.state._mounted) return;
                  let _sessions = [];
                  _sessions.push(...sessionResult[0]);
                  const list = getDirectionFullSessions(_sessions);

                  const dateObj = getDateObj(dates[dateIndex])
                  let cloneDataMap = {...this.state.dataMap};
                  cloneDataMap[formatDateDoc(dateObj)] = {
                    ...dateObj,
                    session_event_list: list
                  }
                  // console.log('cloneDataMap - ', cloneDataMap);
                  this.setState({dataMap: cloneDataMap});
                })
            })
          })
      }
    });

  }

  render() {
    const { loading, dataMap, month, dateSelected, activeTab } = this.state;
    const {showPlayerFn, hidePlayerFn, showPlayer, isSmallScreen} = this.props;

    const condForStyle = isSmallScreen && (!(this.props.createSessionMatch?.isExact || this.props.createLiveSessionMatch?.isExact) && !this.props?.currentSession?.is_whiteboard_class)

    const sessionContainerStyle = condForStyle ? {height: '100vh', paddingBottom: 0} : {};

    // const showPlayerFn = () => {
    //   this.setState({ showPlayer: true });
    // };
    //
    // const hidePlayerFn = () => {
    //   this.setState({ showPlayer: false });
    // };

    const setOpenModal = (val) => this.setState({ openModal: true });

    return (
      <>
        <section className="livesessions__page" style={sessionContainerStyle}>
          {showPlayer && isSmallScreen && <div className="livesessions__page-arrow-back-icon" onClick={() => this.props.history.goBack()}>
            <ArrowBackIcon/>
          </div>}
          {!showPlayer && (
            <Hidden smUp implementation="js">
              {loading ? (
                <LiveSessionSidebarShimmer showPlayer={showPlayerFn} />
              ) : (
                <LiveSessionsSidebar
                  dateChangeHandler={this.dateClicked}
                  bodyMap={dataMap}
                  month={month}
                  state={'Hidden'}
                  dateSelected={dateSelected}
                  setCurrentSession={this.props.setCurrentSession}
                  showPlayer={showPlayerFn}
                  hidePlayer={hidePlayerFn}
                  key={1}
                  setOpenModal={setOpenModal}
                />
              )}
            </Hidden>
          )}
          <div className={"row livediv" + (isSmallScreen ? ' dark' : '')}>
            <div className="live">
              {loading ? (
                <LiveSessionSidebarShimmer showPlayer={showPlayerFn} />
              ) : (
                <LiveSessionsSidebar
                  dateChangeHandler={this.dateClicked}
                  bodyMap={dataMap}
                  month={month}
                  state={'Main'}
                  dateSelected={dateSelected}
                  setCurrentSession={this.props.setCurrentSession}
                  showPlayer={showPlayerFn}
                  hidePlayer={hidePlayerFn}
                  key={2}
                  setOpenModal={setOpenModal}
                />
              )}
            </div>

            {!loading && Object.keys(dataMap)?.length === 0 && (
              <div
                className="col-lg-12 col-md-12 col-xs-12 livesession__placeholder livesession__self__study"
                id="livesession__content"
              >
                <Lottie
                  options={{
                    animationData: selfStudyLottie,
                    loop: true,
                  }}
                />

                <div className="self__study__text">
                  <h3>Self Study Day!</h3>
                  <p>
                    Revise concepts, practice questions and eat well. <br />
                    Make it count!
                  </p>
                </div>
              </div>
            )}

            {(loading || (!loading && Object.keys(dataMap)?.length > 0)) && (
              <div
                className="col-lg-12 col-md-12 col-xs-12"
                id="livesession__content"
              >
                {!this.props.isUserPro &&
                  this.props?.currentSession?.tier === "Paid" && (
                    <div className="free__user__restainer">
                      {this.state.openModal && (
                        <div className="restainer__modal">
                          <CancelIcon
                            onClick={() => this.setState({ openModal: false })}
                          />
                          <img
                            src={
                              this.props.isDarkMode
                                ? PuStackWhiteLogo
                                : PuStackLogo
                            }
                            alt="PuStack Logo"
                            className="modal__logo"
                          />

                          <div className="restainer__content">
                            <h2>
                              This session is only available for pro users
                            </h2>
                            To continue your learning journey, Join Pustack
                            Today!
                          </div>
                          <button
                            onClick={() => this.props.setIsSliderOpen(true)}
                            className="join__now"
                          >
                            Subscribe Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                {showPlayer &&
                  (this.props.isUserPro ||
                    this.props?.currentSession?.tier === "Free" ||
                    this.props?.currentSession === null) && (
                    <div style={sessionContainerStyle} className={"session-container" + (this.props?.currentSession?.is_whiteboard_class ? ' whiteboard' : '') + ((this.props.createSessionMatch || this.props.createLiveSessionMatch) && this.props.isInstructor ? ' create' : '') + (this.props.isCreator ? '' : ' student')}>
                      {(this.props.createSessionMatch?.isExact || this.props.createLiveSessionMatch?.isExact) && this.props.isInstructor ?
                        this.props.createLiveSessionMatch?.isExact ? <AgoraClassFormArea /> : <SessionFormArea /> :
                        this.props?.currentSession?.is_whiteboard_class ? <WhiteboardArea isCreator={this.props.isCreator} /> : (
                          <>
                            <LiveSessionsArea hidePlayer={hidePlayerFn} />
                            <LiveSessionQuizSidebar/>
                            <div id="comments__card__wrapper"><LiveSessionCommentsArea/></div>
                          </>
                        )
                        // <LiveSessionsArea hidePlayer={hidePlayerFn} />
                        // (
                        //   <>
                        //     <WhiteboardArea />
                        //     {/*<VideoCall />*/}
                        //     {/*<ChatContainer />*/}
                        //   </>
                        // )
                      }
                    </div>
                  )}
              </div>
            )}
          </div>
        </section>

        <Hidden xlUp implementation="js">
          <Drawer
            variant="temporary"
            open={this.props.isMobileOpen}
            onClose={this.props.handleDrawerToggle}
            // ModalProps={{ keepMounted: true }}
          >
            <LiveSessionsSidebar
              dateChangeHandler={this.dateClicked}
              bodyMap={dataMap}
              month={month}
              state={'Drawer'}
              dateSelected={dateSelected}
              setCurrentSession={this.props.setCurrentSession}
              showPlayer={showPlayerFn}
              hidePlayer={hidePlayerFn}
              key={3}
              setOpenModal={setOpenModal}
            />
          </Drawer>
        </Hidden>
      </>
    );
  }
}
