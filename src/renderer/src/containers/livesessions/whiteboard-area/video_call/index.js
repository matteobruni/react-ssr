import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import AgoraRTC from "agora-rtc-sdk-ng";
import {LiveSessionContext, UserContext} from "../../../../context";
import axios from "axios";
import {RTCConfig} from "../../../../database/agora/config";
import {getRTCToken} from "../../../../database/agora/agora-functions";
import NoCamImage from '../../../../assets/images/icons/no_cam.png';
import CamImage from '../../../../assets/images/icons/cam.png';
import NoMicImage from '../../../../assets/images/icons/no_mic.png';
import MicImage from '../../../../assets/images/icons/mic.png';

const client = AgoraRTC.createClient({
  codec: 'vp8',
  mode: 'live'
});

export default function VideoCall({rtcChannel: rt, isInstructor}) {
  const [user] = useContext(UserContext).user;
  // const [isInstructor] = useContext(UserContext).isInstructor;
  const videoContainerRef = useRef(null);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [tracks, setTracks] = useState(null);
  // TODO: Turn the video on by default in production
  const [videoOff, setVideoOff] = useState(true);
  const [audioOff, setAudioOff] = useState(true);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [changing, setChanging] = useState(false);

  const rtcChannel = useMemo(() => {
    return rt;
  }, [rt])

  useEffect(() => {
    if(!videoContainerRef.current) return;
    const el = videoContainerRef.current;
    const container = document.querySelector('.session-container.whiteboard');
    // const {top, left} = container.getBoundingClientRect();
    let isDown = false;
    let localLeft = left, localTop = top;
    let layerX = 0, layerY = 0, startX = 0, startY = 0;
    function handleMouseDown(e) {
      if(e.which !== 1) return;
      let onSvg = e.composedPath().some(c => c.nodeName === 'IMG');
      if(onSvg) return;
      isDown = true;
      layerX = e.pageX;
      layerY = e.pageY;
      startX = localLeft;
      startY = localTop;
      console.log('e - ', e);
    }
    function handleMouseUp(e) {
      isDown = false;
      // startX = localLeft;
      // startY = localTop;
      // layerX = 0;
      // layerY = 0;
    }
    function handleMouseMove(e) {
      if(!isDown) return
      localLeft = e.pageX - layerX + startX;
      localTop = e.pageY - layerY + startY;
      setLeft(e.pageX - layerX + startX);
      setTop(e.pageY - layerY + startY);
    }

    function handleTouchStart(e) {
      // console.log('handleTouchStart - ', e)
      let onSvg = e.composedPath().some(c => c.nodeName === 'IMG');
      if(onSvg || e.touches.length > 1) return;
      isDown = true;
      layerX = e.touches[0].pageX;
      layerY = e.touches[0].pageY;
      startX = localLeft;
      startY = localTop;
    }

    function handeTouchMove(e) {
      // console.log('handleTouchMove - ', e);
      if(!isDown) return
      localLeft = e.touches[0].pageX - layerX + startX;
      localTop = e.touches[0].pageY - layerY + startY;
      setLeft(e.touches[0].pageX - layerX + startX);
      setTop(e.touches[0].pageY - layerY + startY);
    }

    function handleTouchEnd(e) {
      isDown = false;
    }

    function handleResize(e) {
      console.log(e);
      localLeft = 0; localTop = 0;
      layerX = 0; layerY = 0; startX = 0; startY = 0;
      setTop(0);
      setLeft(0);
    }

    window.screen.orientation.onchange = handleResize;

    el.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handeTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    document.addEventListener('touchcancel', handleTouchEnd, false);
    document.addEventListener('resize', handleResize);
    el.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      el.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchmove', handeTouchMove, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
      document.removeEventListener('touchcancel', handleTouchEnd, false);
      el.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      // document.removeEventListener('resize', handleResize);
    }
  }, [videoContainerRef.current]);

  useEffect(() => {
    if(!tracks || tracks.length !== 2) {
      client.unpublish().then();
      return;
    }
    setChanging(true);
    tracks[1].setEnabled(!videoOff).then(() => {
      setChanging(false);
    }).catch(() => {
      setChanging(false);
    })
  }, [videoOff, tracks])

  useEffect(() => {
    if(!tracks || tracks.length < 1) {
      client.unpublish().then();
      return;
    }
    setChanging(true);
    tracks[0].setEnabled(!audioOff).then(() => {
      setChanging(false);
    }).catch(() => {
      setChanging(false);
    })
  }, [audioOff, tracks])

  const setupClient = useCallback(async () => {
    if(!rtcChannel || !user) return;
    // if(tracks && tracks.length === 2) {
    //   console.log('tracks = ', tracks)
    //   if(tracks[0]._enabled) await tracks[0]?.setEnabled(false);
    //   if(tracks[1]._enabled) await tracks[1]?.setEnabled(false);
    //   // await tracks[0]?.setEnabled(false);
    //   // await tracks[1]?.setEnabled(false);
    // }
    await client.leave();
    console.log('rtcChannel - ', rtcChannel, client);
    const data = await getRTCToken(true, user.uid, rtcChannel);
    // const data = await axios.get(`http://localhost:3500/get-rtc-token?account=${user.uid}&channelName=${rtcChannel}`);
    const token = data.data.key;
    await client.join(RTCConfig.appId, rtcChannel, token, user.uid);
    await client.setClientRole(isInstructor ? 'host' : 'audience');
    console.log('RTC - settingup client - ');

    if(isInstructor) {
      const t = await AgoraRTC.createMicrophoneAndCameraTracks();
      await client.publish(t);
      await t[0].setEnabled(false);
      await t[1].setEnabled(false);
      setTracks(t);
      // tracks[0].play();
      setIsVideoVisible(true);
      if(document.getElementById('video_container')) t[1].play(document.getElementById('video_container'));
    }

    client.on('user-unpublished', async (user, mediaType) => {
      console.log('User Unpublished -- - - --- -- -- -- -- -- - --- -- -- -- - -', user, mediaType);
      setIsVideoVisible(user.hasVideo);
    })

    client.on("user-published", async (user, mediaType) => {
      // Initiate the subscription
      await client.subscribe(user, mediaType);

      const audioTrack = user.audioTrack;
      // Play the audio
      if(audioTrack) {
        audioTrack.play();
      }

      // If the subscribed track is an audio track
      // if (mediaType === "audio") {
      //   const audioTrack = user.audioTrack;
      //   // Play the audio
      //   audioTrack.play();
      // } else {
      //   const videoTrack = user.videoTrack;
      //   // Play the video
      //   videoTrack.play(document.getElementById('video_container'));
      // }
      const videoTrack = user.videoTrack;
      // Play the video
      console.log('videoTrack, mediaType - ', videoTrack, mediaType);
      if(videoTrack) {
        setIsVideoVisible(true);
        videoTrack.play(document.getElementById('video_container'));
      }
    });
    return client;
  }, [isInstructor, rtcChannel, user]);

  useEffect(() => {
    let a = setupClient();

    return () => {
      a.then(c => {
        if(c && typeof c.leave === 'function') {
          c.unpublish().then();
          c.leave().then()
        }
      })
    }
  }, [setupClient]);

  useEffect(() => {

    return () => {
      if(tracks && tracks[0]) tracks[0].close();
      if(tracks && tracks[1]) tracks[1].close();
    }
  }, [tracks])

  function handleToggle(cb) {
    if(changing) return;
    cb(c => !c);
  }

  return (
      <div id="video_container" style={{transform: `translate(${left}px, ${top}px)`}} ref={videoContainerRef}>
        {isVideoVisible && isInstructor && <div className={"video_container-controls" + (videoOff || audioOff ? ' video_off' : '')}>
          <img src={audioOff ? NoMicImage : MicImage} onClick={() => handleToggle(setAudioOff)} width={30} height={30} alt=""/>
          <img src={videoOff ? NoCamImage : CamImage} onClick={() => handleToggle(setVideoOff)} width={30} height={30} alt=""/>
        </div>}
      </div>
  )
}
