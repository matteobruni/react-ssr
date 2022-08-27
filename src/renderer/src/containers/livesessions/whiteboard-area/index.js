import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {ApplianceNames, DefaultHotKeys, DeviceType, ScreenType, ViewMode, WhiteWebSdk} from "white-web-sdk";
import {Upload} from "antd";
import Tooltip from '@material-ui/core/Tooltip';
import {v4} from 'uuid';
import {LiveSessionContext, UserContext} from "../../../context";
import PreviewController from "@netless/preview-controller";
import ZoomController from "@netless/zoom-controller";
import RedoUndo from "@netless/redo-undo";
import DocsCenter from "@netless/docs-center";
import "./style.scss";
import ToolBox from "./src";
import VideoCall from "./video_call";
import ChatContainer from "./chat_container";
import {WHITEBOARConfig} from "../../../database/agora/config";
import useTimer from "../../../hooks/timer";
import {getCurrentSessionDetails, getDateFromHash} from "../../../database/livesessions/sessions";
import {ModalContext} from "../../../context/global/ModalContext";
import {DeleteSessionConfirmationContent, RouteConfirmationContent} from "../sessionarea";
import BusinessMeeting from '../../../assets/lottie/business-meeting.json';
import {
  createRoom,
  fileConversionAgora,
  getRoomToken,
  getTaskToken,
  uploadFileToS3
} from "../../../database/agora/agora-functions";
import PreSessionPlaceHolder from "../presessionplaceholder";
import {LiveSessionLectureShimmer} from "../../../components";
import {LiveSessionCommentsArea, LiveSessionQuizSidebar} from "../../index";
import Lottie from "lottie-react-web";
import {TimeSlotNotAvailable} from "../../../assets";

const region = 'cn-hz';

let webSdk = new WhiteWebSdk({
  appIdentifier: WHITEBOARConfig.appIdentifier,
  region,
  deviceType: DeviceType.Desktop,
  screenType: ScreenType.Desktop
});

const wait = (time) => new Promise((res) => setTimeout(res, time));
export default function WhiteboardArea({isCreator}) {
  const whiteboardLayerDownRef = useRef(null);

  const [isInst] = useContext(UserContext).isInstructor;
  const [curSession] = useContext(LiveSessionContext).current;
  const [_, setCurrentDetails] = useContext(LiveSessionContext).currentSessionDetails;
  const [user] = useContext(UserContext).user;
  const [, setConfirmationModalData] = useContext(ModalContext).state;

  const [timer] = useTimer(10000);

  const [loadNow, setLoadNow]= useState(false);
  const [room, setRoom] = useState(null);
  const [progressReq, setProgressReq] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState(null);
  const [sessionObject, setSessionObject] = useState(null);
  const [prevSessionId, setPrevSessionId] = useState(null);
  const [token, setToken] = useState(null);

  const isInstructor = useMemo(() => {
    // console.log('user - sessionObject - ', user, sessionObject);
    if(!user || !sessionObject) return;
    return isInst && (sessionObject.instructor_info?.uid ? user.uid === sessionObject.instructor_info?.uid : user.uid === sessionObject.created_by_employee_id)
  }, [isInst, user, sessionObject]);

  const initWhiteboard = useCallback(async () => {
    try {
      if(!curSession || !user) return;
      // if(isInstructor === undefined) return;
      // if(curSession.grade.id !== 'class_2') return;
      if(prevSessionId === curSession.session_id) return;
      setPrevSessionId(curSession.session_id);
      setSessionObject(null);
      setLoadNow(false);
      let sessionObj = await curSession.reference.get()
        .then(snapshot => {
          if(snapshot.exists) {
            return snapshot.data();
          }
          return null;
        })
      if(!sessionObj) throw new Error('Session data was not found');
      setSessionObject(sessionObj);
      console.log('curSession?.grade, isInstructor - ', curSession?.grade, isInstructor);
      const isCreator = user.uid === sessionObj.instructor_info?.uid;
      if(!isCreator) return;
      if(!sessionObj.room_id) {
        // if(!sessionObj.room_id || !sessionObj.rtc_channel || !sessionObj.rtm_channel) {
        //   if(!isInstructor) return;
        // await curSession.reference.
        // Create Room Id
        // const {data} = await axios.post('http://localhost:3500/create-room');
        const { data } = await createRoom(true);
        // const {data} = await axios.post('http://localhost:3500/create-room');
        console.log('data - ')
        if(!data.ok) throw new Error('Room creation failed');
        const roomId = data.uuid;
        const rtc_channel = v4();
        const rtm_channel = v4();
        await curSession.reference.set({
          room_id: roomId, rtc_channel, rtm_channel
        }, {merge: true});
        // setCurSession(c => ({...c, room_id: roomId}));
        setSessionObject({...sessionObj, room_id: roomId, rtc_channel, rtm_channel});
        await joinWhiteboardRoom(roomId, isCreator);
        // setCurSession(c => ({...c, room_id: roomId, rtc_channel, rtm_channel}));
        // const res = await axios.post('http://localhost:3500/get-room-token', {
        //   roomId,
        //   isInstructor
        // });
        // console.log('res - ', res)
        // if(!res.data.ok) throw new Error('Room token generation failed')
        // return startJoinRoom(roomId, res.data.token);
      } else {
        await joinWhiteboardRoom(sessionObj.room_id, isCreator);
      }
    } catch(e) {
      console.log('Whiteboard init error - ', e);
    }
  }, [curSession, user, prevSessionId]);

  useEffect(() => {
    if(!curSession) return;
    const unsubscribe = getCurrentSessionDetails(curSession.reference, e => {
      setCurrentDetails(e);
    })

    return () => typeof unsubscribe === 'function' && unsubscribe();
  }, [curSession]);

  const joinWhiteboardRoom = useCallback(async (roomId, isInstructor) => {
    console.log('isCreator - ', isInstructor);
    const res = await getRoomToken(true, isInstructor, roomId);
    // const res = await axios.post('http://localhost:3500/get-room-token', {
    //   roomId,
    //   isInstructor
    // });
    if(!res.data.ok) throw new Error('Room token generation failed')
    // setRtcChannel(sessionObj.rtc_channel);
    // setRtmChannel(sessionObj.rtm_channel);
    setLoadNow(true);
    setToken(res.data.token);
    startJoinRoom(roomId, res.data.token, isInstructor);
  }, [])

  useEffect(() => {
    // If the session is live, and we have all info about the channels, then start the joining room
    initWhiteboard();
    console.log('Initiititiit - s');
    // If the instructor
    // startJoinRoom();
    return () => {

      // try {
      //   room && room.disconnect && room.disconnect();
      // } catch (e) {
      //   console.log(e.message);
      // }
    }
  }, [initWhiteboard])

  useEffect(() => {
    console.log('curSession .. . . . . . . . . . - - -- -- -- - - -- -- - ');
  }, [])

  const isBeforeTime = useMemo(() => {
    if(!sessionObject || !timer) return null;
    // if(sessionObject.rtc_channel && sessionObject.rtm_channel) {
    //   setRtcChannel(sessionObject.rtc_channel);
    //   setRtmChannel(sessionObject.rtm_channel);
    //   clearTimer();
    //   return;
    // }
    const indianTime = +timer;
    const start_ts = getDateFromHash(sessionObject?.air_time);
    // const sessionLength =
    //   sessionObject?.session_length > 0
    //     ? Number(sessionObject?.session_length) * 60 * 1000
    //     : Number(sessionObject?.duration) * 60 * 1000;
    //
    // const isAfterTime =
    //   +new Date(start_ts) + sessionLength <= indianTime;
    //
    // const isCoolDownOver =
    //   +new Date(start_ts) + sessionLength + 5 * 60 * 1000 <=
    //   indianTime;
    //
    // const _isCoolDownPeriod = isAfterTime && !isCoolDownOver;

    // console.log('isBeforeTime, isAfterTime - ', isBeforeTime, isAfterTime)

    console.log('isBeforeTime - ', +new Date(start_ts) >= indianTime);
    return +new Date(start_ts) >= indianTime;
  }, [timer, sessionObject])

  const isAirTime = useMemo(() => {
    if(!sessionObject || !timer || !sessionObject.room_id) return false;
    // if(sessionObject.rtc_channel && sessionObject.rtm_channel) {
    //   setRtcChannel(sessionObject.rtc_channel);
    //   setRtmChannel(sessionObject.rtm_channel);
    //   clearTimer();
    //   return;
    // }
    const indianTime = +timer;
    const start_ts = getDateFromHash(sessionObject?.air_time);
    const isBeforeTime = +new Date(start_ts) >= indianTime;

    const sessionLength =
      sessionObject?.session_length > 0
        ? Number(sessionObject?.session_length) * 60 * 1000
        : Number(sessionObject?.duration) * 60 * 1000;

    const isAfterTime =
      +new Date(start_ts) + sessionLength <= indianTime;

    const isCoolDownOver =
      +new Date(start_ts) + sessionLength + 5 * 60 * 1000 <=
      indianTime;

    const _isCoolDownPeriod = isAfterTime && !isCoolDownOver;

    // console.log('isBeforeTime, isAfterTime - ', isBeforeTime, isAfterTime)

    return !isBeforeTime && !isAfterTime;
  }, [timer, sessionObject])

  useEffect(() => {
    console.log('isAirTime - ', isAirTime);
    if(!isAirTime || isInstructor || !sessionObject) return;
    if(!sessionObject.room_id) {
      curSession.reference.get()
        .then(snapshot => {
          if(snapshot.exists) {
            return snapshot.data();
          }
          return null;
        })
        .then(sessionObj => {
          if(!sessionObj) throw new Error('Session data was not found');
          setSessionObject(sessionObj);
          joinWhiteboardRoom(sessionObj.room_id, false).then();
        })
    } else {
      joinWhiteboardRoom(sessionObject.room_id, false).then();
    }
  }, [isAirTime, sessionObject, isInstructor])

  // const token = useMemo(() => {
  //   if (isInstructor) return TOKEN.teacher;
  //   return TOKEN.student;
  // }, [isInstructor])

  /**
   *
   * @param data{Object|undefined|null}
   * @returns {Promise<void>}
   */
  const fetchProgress = useCallback(async (data) => {
    if (!progressReq && !data) return;
    let obj = data ?? progressReq;
    // Refactor to axios
    const taskProgressResponse = await fetch(`https://api.netless.link/v5/services/conversion/tasks/${obj.taskId}?type=static`, {
      method: 'GET',
      headers: {
        token: obj.token,
        region
      }
    }).then(c => c.json());

    console.log(taskProgressResponse);
    return taskProgressResponse;
  }, [progressReq])

  const uploadPdf = useCallback(async (file) => {
    if (isInstructor) {

      // Upload the file to google cloud storage
      const formData = new FormData();
      formData.append('file', file);
      setFileUploadStatus('Uploading');
      const response = await uploadFileToS3(true, formData);
      // const response = await fetch('http://localhost:3500/upload', {
      //   method: 'POST',
      //   body: formData
      // }).then(c => c.json());
      const url = response.data.Location;

      setFileUploadStatus('Initializing File Conversion');

      // Send url to cloud function or the app server
      const data = await fileConversionAgora(true, url);
      // const data = await fetch('http://localhost:3500/file-conversion-agora', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     url
      //   })
      // }).then(c => c.json());

      console.log('data - ', data);
      setFileUploadStatus('File Conversion Initialized');

      // Get the task id from cloud function response
      const taskId = data.data.uuid;

      // Generate the task token from the app server
      const taskTokenResponse = await getTaskToken(true, taskId).then(res => res.data);

      setProgressReq({token: taskTokenResponse, taskId});
      // Query the task progress by task id
      let progress = await fetchProgress({token: taskTokenResponse, taskId});
      setFileUploadStatus(progress.status);

      let doneWithLoop = false;
      let maxCount = 0;
      while (true) {
        await new Promise((res) => setTimeout(res, 2000));
        progress = await fetchProgress({token: taskTokenResponse, taskId});
        setFileUploadStatus(progress.status === 'Converting' ? (progress.status + ' ' + progress.progress.convertedPercentage + '%') : progress.status);
        switch (progress.status) {
          case 'Waiting':
            break;
          case 'Converting':
            break;
          case 'Finished':
            doneWithLoop = true;
            break;
          default:
            console.log(progress);
            throw new Error('File conversion failed');
        }
        if (doneWithLoop) break;
        // break;
        maxCount++;
        if (maxCount >= 100) {
          throw new Error('Timed out...');
        }
      }

      setFileUploadStatus(null);
      const fileList = progress.progress.convertedFileList;

      // let url = URL.createObjectURL(file);

      // const width = 1280;
      // const height = 720;
      // const imageURLs = [
      //   // url,
      //   "https://www.zohowebstatic.com/sites/default/files/show/import-banner-mobile.jpg"
      // ];

      const scenes = fileList.map(function (file, index) {
        return {
          name: "" + (index + 1),
          ppt: {
            src: file.conversionFileUrl,
            width: file.width,
            height: file.height,
          },
        };
      });
      //
      const newDocId = v4();
      window.room = room;

      room.putScenes("/" + room.uuid + "/" + newDocId, scenes);
      //
      // Switch to the first newly inserted scene.
      room.setScenePath("/" + room.uuid + "/" + newDocId + "/1");

      // room.setMemberState({
      //   currentApplianceName: ApplianceNames.pencil,
      //   strokeColor: [255, 182, 193],
      //   strokeWidth: 12,
      // });

      await wait(1000);

      setRoom((room) => {

        let docs = room.state.globalState.docs ?? [];

        // Add the scenes to a specified scene directory.
        room.setGlobalState({
          docs: [
            ...docs,
            {
              name: file.name,
              id: newDocId,
              pptType: 'static',
              active: true
            }
          ]
        })

        return room;
      });
    }
  }, [fetchProgress, room, token]);

  function startJoinRoom(roomId, token, isInstructor) {

    // webSdk.replayRoom({
    //   room: 'aa259e408a3311ec90e795a10b25d456',
    //   roomToken: TOKEN.teacher,
    //   slice: '09oWAI2DEeyp9hEQFPIROQ'
    // }).then(player => {
    //   player.play();
    //   console.log('player - ', player);
    // }).catch(c => {
    //   console.log('error in player - ', c);
    // })

    // return;
    webSdk.joinRoom({
        // uuid: '103ab0f088b611ec95503f2e5d6e6464',
        // uid,
        // // uid: 'dndeveloper-6789876',
        // // roomToken: 'NETLESSROOM_YWs9WlQ1Z2psNXo0R3J1enJMRSZub25jZT0xNjQ0MDQwOTExNDE2MDAmcm9sZT0wJnNpZz0yNTY2OGRlNWNlYzcwM2FhY2JiZGIxMDhiMGJkZjQ1M2ZhMjEzMjdjNmNjZTBkMGU3ZmJhMjc3MjFmOTljMTg2JnV1aWQ9NzdmMDBhMzA4NjQ4MTFlYzgzMGM2MzE5NDFjNDRjODE',
        // roomToken: token,
        isWritable: isCreator,
        uid: user.uid,
        uuid: roomId,
        roomToken: token,
        // cursorAdapter: cursorAdapter,
        userPayload: {
          userId: user.uid,
          cursorName: 'cursorName',
          // theme: "mellow",
          // cursorBackgroundColor: "#FDBA74",
          // cursorTextColor: "#323233",
          // cursorTagName: "讲师",
          // cursorTagBackgroundColor: "#E5A869",
        },
        disableNewPencil: false,
        // floatBar: true,
        hotKeys: {
          ...DefaultHotKeys,
          changeToSelector: "s",
          changeToLaserPointer: "z",
          changeToPencil: "p",
          changeToRectangle: "r",
          changeToEllipse: "c",
          changeToEraser: "e",
          changeToText: "t",
          changeToStraight: "l",
          changeToArrow: "a",
          changeToHand: "h",
        },
      },
      {
        onPhaseChanged: phase => {
          // this.setState({phase: phase});
        },
        onRoomStateChanged: (modifyState) => {
          if (modifyState.broadcastState) {
            // this.setState({mode: modifyState.broadcastState.mode});
          }
        },
        onDisconnectWithError: error => {
          console.error(error);
        },
        onKickedWithReason: reason => {
          console.error("kicked with reason: " + reason);
        }
      }
    ).then(async (roomRes) => {
      console.log('room - ', roomRes);
      setRoom(roomRes);
      roomRes.bindHtmlElement(document.getElementById('dnd-whiteboard'));

      if(!isInstructor) {
        roomRes.setViewMode(ViewMode.Follower);
        roomRes.disableCameraTransform = true;
      } else {
        roomRes.setViewMode(ViewMode.Broadcaster);
      }

    }).catch(e => {
      console.log('error - ', e);
    })
  }

  const handleSlides = (direction = 1) => {
    if(!room) return
    const sceneState = room.getCurrentSceneState();
    const curSceneIndex = sceneState.index;
    let denyCondition = (curSceneIndex === 0 && direction ===  -1) || (curSceneIndex === sceneState.scenes.length - 1 && direction === 1)
    if(denyCondition) return;
    room.setSceneIndex(curSceneIndex + direction);
    setRoom(c => room);
  }

  // const renderSlideIndex = () => {
  //   const sceneState = room.getCurrentSceneState();
  //
  //   return <span>{sceneState.index + 1}/{sceneState.scenes.length}</span>
  // }

  return (
    loadNow ? (
      <>
        <div className={"whiteboard_container"} style={{position: 'relative', overflow: 'hidden', gridRow: '1 / 3'}}>
          {!room ? (
            <div className="whiteboard_loader">
              <p>Please wait while we are preparing whiteboard for you.</p>
            </div>
            ) :
            <div className="realtime-box">
              { isInstructor &&
                <>
                  <div style={{
                    fontFamily: 'PingFangSC-Light, PingFang SC, serif',
                    padding: '10px',
                    position: 'fixed',
                    top: '80px',
                    left: '50%',
                    whiteSpace: 'nowrap',
                    borderRadius: '4px',
                    boxShadow: '0 8px 24px 0 rgb(0 0 0 / 10%)',
                    backgroundColor: 'white',
                    opacity: fileUploadStatus ? 1 : 0,
                    transform: `translateY(${fileUploadStatus ? 0 : '-10px'})`,
                    transition: 'all .2s ease-in-out'
                  }}>
                    {fileUploadStatus}
                  </div>
                  {/*<div className="logo-box">*/}
                  {/*    <img src={logo} alt={"logo"}/>*/}
                  {/*</div>*/}
                  <div className="tool-box-out">
                    <ToolBox room={room} setRoom={setRoom} hotkeys={{
                      arrow: "A",
                      clear: "",
                      clicker: "",
                      ellipse: "C",
                      eraser: "E",
                      hand: "H",
                      laserPointer: "Z",
                      pencil: "P",
                      rectangle: "R",
                      selector: "S",
                      shape: "",
                      straight: "L",
                      text: "T"
                    }} customerComponent={[
                      <Upload
                        key="upload-pdf"
                        accept={"application/pdf"}
                        showUploadList={false}
                        customRequest={(e) => {
                          uploadPdf(e.file).then();
                        }}>
                        <Tooltip placement={"right"} key="clean" title={'Upload PDF'}>
                          <div className="tool-box-cell-box-left">
                            <div className="tool-box-cell">
                              <svg width="22px" height="22px" viewBox="0 0 22 22" version="1.1"
                                   xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                <g id="页面-4" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                  <g id="Whiteboard-Guidelines" transform="translate(-24.000000, -795.000000)">
                                    <g id="img" transform="translate(24.000000, 795.000000)">
                                      <g id="undo备份-5">
                                        <rect id="矩形备份-19" fill="#FFFFFF" opacity="0.01" x="0" y="0" width="22" height="22"/>
                                        <rect id="矩形" stroke="#444E60" strokeLinecap="round" strokeLinejoin="round" x="5" y="5"
                                              width="12" height="12" rx="2"/>
                                        <circle id="椭圆形备份" fill="#444E60" cx="13" cy="8" r="1"/>
                                      </g>
                                      <path
                                        d="M5,14 L7.58578644,11.4142136 C8.36683502,10.633165 9.63316498,10.633165 10.4142136,11.4142136 L12,13 L12,13 L12.5857864,12.4142136 C13.366835,11.633165 14.633165,11.633165 15.4142136,12.4142136 L17,14 L17,14"
                                        id="路径-21备份" stroke="#444E60" strokeLinecap="round" strokeLinejoin="round"/>
                                    </g>
                                  </g>
                                </g>
                              </svg>
                            </div>
                          </div>
                        </Tooltip>
                      </Upload>
                    ]}/>
                  </div>
                  <div className="redo-undo-box">
                    <RedoUndo room={room} redoSteps={20} undoSteps={20}/>
                  </div>
                  <div className="zoom-controller-box">
                    <ZoomController room={room}/>
                  </div>
                  <div className="room-controller-box">
                    <div className="page-controller-mid-box">
                      <Tooltip placement="bottom" title={"Docs center"}>
                        <div className="page-preview-cell"
                             onClick={() => setIsFileOpen(e => !e)}>
                          <svg width="28px" height="28px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"
                               xmlnsXlink="http://www.w3.org/1999/xlink">
                            <g id="页面-4" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                              <g id="Whiteboard-Guidelines" transform="translate(-664.000000, -374.000000)">
                                <g id="folder" transform="translate(664.000000, 374.000000)">
                                  <rect id="矩形备份-25" fill="#FFFFFF" opacity="0.01" x="0" y="0" width="32" height="32"/>
                                  <path
                                    d="M10,11 C10,10.4477153 10.4477153,10 11,10 L14.4384472,10 C15.3561825,10 16.1561487,10.6245947 16.3787322,11.5149287 L16.5,12 L20,12 C21.1045695,12 22,12.8954305 22,14 L22,20 C22,21.1045695 21.1045695,22 20,22 L12,22 C10.8954305,22 10,21.1045695 10,20 L10,11 Z"
                                    id="形状结合" stroke="#212324" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="10" y1="14" x2="22" y2="14" id="路径-6" stroke="#212324" strokeLinecap="round"
                                        strokeLinejoin="round"/>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="page-controller-box">
                    <div className="page-controller-mid-box">
                      <Tooltip placement="bottom" title={"Page preview"}>
                        <div className="page-preview-cell" onClick={() => setIsMenuVisible(true)}>
                          <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
                               xmlnsXlink="http://www.w3.org/1999/xlink">
                            <title>page</title>
                            <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round"
                               strokeLinejoin="round">
                              <g id="切图" transform="translate(-88.000000, -260.000000)" stroke="#444E60">
                                <rect id="矩形" x="94" y="268" width="10" height="10" rx="2"/>
                                <path d="M98,266 L104,266 C105.104569,266 106,266.895431 106,268 L106,274" id="矩形备份-3"/>
                              </g>
                            </g>
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="delete-session-box">
                    <div className="page-controller-mid-box">
                      <Tooltip placement="bottom" title={"Delete Session"}>
                        <div className="page-preview-cell" onClick={() => {
                          setConfirmationModalData({open: true, Children: <DeleteSessionConfirmationContent />});
                        }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width={15}
                          >
                            <path d="M21 4h-3.1A5.009 5.009 0 0 0 13 0h-2a5.009 5.009 0 0 0-4.9 4H3a1 1 0 0 0 0 2h1v13a5.006 5.006 0 0 0 5 5h6a5.006 5.006 0 0 0 5-5V6h1a1 1 0 0 0 0-2ZM11 2h2a3.006 3.006 0 0 1 2.829 2H8.171A3.006 3.006 0 0 1 11 2Zm7 17a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6h12Z" />
                            <path d="M10 18a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1ZM14 18a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1Z" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="edit-session-box">
                    <div className="page-controller-mid-box">
                      <Tooltip placement="bottom" title={"Edit Session"}>
                        <div className="page-preview-cell"
                          onClick={() => {
                           setConfirmationModalData({
                             open: true,
                             Children: <RouteConfirmationContent
                               title="Edit Session"
                               description="Are you sure you want to edit this session?"
                               route="/classes/createLive?edit=true"
                             />
                            })
                          }}
                        >

                          <svg
                            height="15"
                            viewBox="-15 -15 484 484"
                            width="15"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M401.648 18.234c-24.394-24.351-63.898-24.351-88.293 0l-22.101 22.223-235.27 235.145-.5.503c-.12.122-.12.25-.25.25-.25.375-.625.747-.87 1.122 0 .125-.13.125-.13.25-.25.375-.37.625-.625 1-.12.125-.12.246-.246.375-.125.375-.25.625-.379 1 0 .12-.12.12-.12.25L.663 437.32a12.288 12.288 0 0 0 2.996 12.735 12.564 12.564 0 0 0 8.867 3.625c1.356-.024 2.7-.235 3.996-.625l156.848-52.325c.121 0 .121 0 .25-.12a4.523 4.523 0 0 0 1.121-.505.443.443 0 0 0 .254-.12c.371-.25.871-.505 1.246-.755.371-.246.75-.62 1.125-.87.125-.13.246-.13.246-.25.13-.126.38-.247.504-.5l257.371-257.372c24.352-24.394 24.352-63.898 0-88.289zM169.375 371.383l-86.914-86.91L299.996 66.938l86.914 86.91zm-99.156-63.809 75.93 75.926-114.016 37.96zm347.664-184.82-13.238 13.363L317.727 49.2l13.367-13.36c14.62-14.609 38.32-14.609 52.945 0l33.965 33.966c14.512 14.687 14.457 38.332-.121 52.949zm0 0" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <PreviewController handlePreviewState={e => setIsMenuVisible(e)} isVisible={isMenuVisible}
                                     room={room}/>
                  <DocsCenter handleDocCenterState={e => setIsFileOpen(e)}
                              isFileOpen={isFileOpen}
                              room={room}/>
                  <div className="previous-slide-box">
                    <div className="page-controller-mid-box">
                      <Tooltip placement="bottom" title={"Previous Slide"}>
                        <div className="page-preview-cell" onClick={() => {
                          handleSlides(-1);
                          // setConfirmationModalData({open: true, Children: <DeleteSessionConfirmationContent />});
                        }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width={13}
                          >
                            <path d="M17.17 24a1 1 0 0 1-.71-.29l-8.17-8.17a5 5 0 0 1 0-7.08L16.46.29a1 1 0 1 1 1.42 1.42L9.71 9.88a3 3 0 0 0 0 4.24l8.17 8.17a1 1 0 0 1 0 1.42 1 1 0 0 1-.71.29Z" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  {/*<div className="slide-count-box">*/}
                  {/*  <div className="page-controller-mid-box">*/}
                  {/*    <Tooltip placement="bottom" title={"Next Slide"}>*/}
                  {/*      <div className="page-preview-cell">*/}
                  {/*        {renderSlideIndex()}*/}
                  {/*      </div>*/}
                  {/*    </Tooltip>*/}
                  {/*  </div>*/}
                  {/*</div>*/}
                  <div className="next-slide-box">
                    <div className="page-controller-mid-box">
                      <Tooltip placement="bottom" title={"Next Slide"}>
                        <div className="page-preview-cell" onClick={() => {
                          handleSlides(1);
                          // setConfirmationModalData({open: true, Children: <DeleteSessionConfirmationContent />});
                        }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width={13}
                          >
                            <path d="M7 24a1 1 0 0 1-.71-.29 1 1 0 0 1 0-1.42l8.17-8.17a3 3 0 0 0 0-4.24L6.29 1.71A1 1 0 0 1 7.71.29l8.17 8.17a5 5 0 0 1 0 7.08l-8.17 8.17A1 1 0 0 1 7 24Z" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </>
              }
              <div
                id="dnd-whiteboard"
                ref={whiteboardLayerDownRef}
                className="whiteboard-box"/>
            </div>}
        </div>
        {isAirTime && sessionObject && sessionObject.rtc_channel && <VideoCall {...{rtcChannel: sessionObject.rtc_channel, isInstructor}} />}
        {isAirTime && sessionObject && sessionObject.rtm_channel && <ChatContainer {...{rtmChannel: sessionObject.rtm_channel, isInstructor}} />}
      </>
    ) : (
      (!isInstructor && isBeforeTime) ? (
        <div className="session-container" style={{gridTemplateRows: '1fr 3fr', padding: 0, height: '100%'}}>
          <div className="session__area--holder">
            <div className="session__area">
              <PreSessionPlaceHolder start_time={curSession?.start_ts} />
            </div>
          </div>
          <LiveSessionQuizSidebar isCreator={isInstructor}/>
          <div id="comments__card__wrapper"><LiveSessionCommentsArea/></div>
        </div>
      ) : (!isAirTime && isBeforeTime === false) ? <div className="whiteboard_loader">
        <Lottie options={{
          animationData: BusinessMeeting,
          loop: true,
        }} style={{maxHeight: '300px'}} />
        <h3>Session has been ended.</h3>
      </div> : (
        <div className="whiteboard_loader">
          <p>Please wait while we are preparing whiteboard for you.</p>
        </div>
      )
    )
  )
}
