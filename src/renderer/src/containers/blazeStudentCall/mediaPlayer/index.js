import React, { useRef, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

const MediaPlayer = ({ videoTrack, audioTrack, type, platform }) => {
  const container = useRef();

  const [newHeight, setNewHeight] = useState(undefined);
  const [newWidth, setNewWidth] = useState(undefined);

  const isDesktop = useMediaQuery({ query: "(min-width: 501px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    if (!container.current) return;

    if(videoTrack) {
      videoTrack.play(container.current);
    }
    console.log('videoTrack - ', videoTrack);

    // try {
    //   videoTrack.play(container.current);
    // } catch (err) {
    //   console.log(err);
    // }

    return () => videoTrack?.stop();
  }, [container, videoTrack]);

  useEffect(() => {
    if (type === "main") {
      if (platform === "web") {
        if (isMobile) {
          setNewHeight("60vw");
          setNewWidth("100vw");
        } else {
          setNewHeight("calc(100vh - 140px");
          setNewWidth("calc(100vw - 80px)");
        }
      } else if (platform === "mweb") {
        if (isMobile) {
          setNewHeight("100vh");
          setNewWidth("100vw");
        } else if (isDesktop) {
          setNewHeight("calc(100vh - 140px");
          setNewWidth("calc(75vh - 105px");
        }
      } else if (platform === "mobile") {
        if (isMobile) {
          setNewHeight("100vh");
          setNewWidth("100vw");
        } else if (isDesktop) {
          setNewHeight("calc(100vh - 140px");
          setNewWidth("calc(74vh - 100px");
        }
      }
    } else {
      if (isMobile) {
        setNewHeight("230px");
        setNewWidth("130px");
      }
    }
  }, [platform, container, videoTrack, type]);

  useEffect(() => {
    try {
      audioTrack.play();
    } catch (err) {}

    return () => audioTrack?.stop();
  }, [audioTrack]);

  return (
    <div
      ref={container}
      style={{ width: newWidth, height: newHeight }}
      className={`video-player ${type} fadeIn`}
    />
  );
};

export default MediaPlayer;
