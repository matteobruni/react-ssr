import React, { useState, useRef, useEffect, useContext } from "react";
import VisibilitySensor from "react-visibility-sensor";
import { LiveSessionContext } from "../../../../context";
import Plyr from "plyr";
import "react-visibility-sensor";
import "./style.scss";

const VideoPost = ({ body, postId }) => {
  const [isPlayed, setIsPlayed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [isFloatingMute, setIsFloatingMute] =
    useContext(LiveSessionContext).isFloatingMute;

  Plyr.setup("video");
  const currentPlayer = useRef();

  useEffect(() => {
    const domelem = async (thumb) => {
      const element = await document
        .getElementById(`player${postId}`)
        .getElementsByClassName("plyr__video-wrapper");

      if (element[0]) {
        element[0].style.background = `transparent url(${thumb}) no-repeat center`;
        element[0].style.backgroundSize = "cover";
      }
    };

    domelem(body.thumbnail);
  }, []);

  useEffect(() => {
    if (playing && !isFloatingMute) setIsFloatingMute(true);
  }, [playing]);

  return (
    <div className="post-video-container">
      <div
        className="video-player"
        id={`player${postId}`}
        style={{ height: "360px" }}
      >
        <VisibilitySensor
          onChange={(visible) => {
            if (visible && isPlayed) {
              currentPlayer.current.volume = 0;
              currentPlayer.current.play();
              setPlaying(true);
            } else {
              currentPlayer.current.pause();
              setPlaying(false);
            }
          }}
        >
          <video
            onPlay={(e) => {
              if (!isFloatingMute) setIsFloatingMute(true);
              setIsPlayed(true);
              setPlaying(true);
              var _videos = document.querySelectorAll("video");
              _videos.forEach((video) => {
                if (
                  video.getAttribute("poster") !==
                  e.currentTarget.getAttribute("poster")
                ) {
                  video.pause();
                }
              });

              const _youtube = Array.from(
                document.querySelectorAll(
                  `.plyr > .plyr__controls > [data-plyr="play"]`
                )
              ).map((p) => p);

              _youtube.forEach((e) => {
                if (e.classList.contains("plyr__control--pressed")) {
                  e.click();
                }
              });

              currentPlayer.current.volume = 1;
            }}
            ref={currentPlayer}
            style={{
              maxWidth: "100%",
              backdropFilter: "blur(15px) brightness(0.9)",
            }}
            id={`player${postId}`}
            playsInline
            controls
          >
            <source src={body.video_url} type="video/mp4" />
          </video>
        </VisibilitySensor>
      </div>
    </div>
  );
};

export default VideoPost;
