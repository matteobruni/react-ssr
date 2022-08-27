import React, {Component} from "react";
import Plyr from "plyr";
import {fetchIndianTime} from "../../../helpers/functions/getIndianTime";

export default class LecturePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      isFullScreen: false,
      play: false,
      changeTime: true,
      controls: [
        "play-large",
        "current-time",
        "pip",
        "airplay",
        "mute",
        "fullscreen",
      ],
    };
  }

  componentDidMount() {
    const { video_id, setPlaying, sessionStartTime } = this.props;

    this.player = new Plyr(".youtube-player", {
      controls: this.state.controls,
      autoplay: true,
      invertTime: false,
      toggleInvert: false,
      muted: false,
    });

    this.player.source = {
      type: "video",
      sources: [{ src: video_id, provider: "youtube" }],
    };

    fetchIndianTime()
      .then(ist => {
        if (video_id !== null) {
          this.player.on("ready", () => {
            this.player.currentTime = (+ist - +new Date(sessionStartTime)) / 1000;
          });
          this.player.on("playing", () => setPlaying(true));
          this.player.on("seeking", () => setPlaying(false));
          this.player.on("seeked", () => setPlaying(true));
          this.player.on("pause", () => {
            setPlaying(false);
            this.setState({ changeTime: true });
          });
          this.player.autoplay = true;
          this.player.muted = false;

          this.player.on("enterfullscreen", () =>
            this.setState({ isFullScreen: true })
          );

          this.player.on("exitfullscreen", () =>
            this.setState({ isFullScreen: false })
          );
        }
      })

  }

  componentDidUpdate() {
    fetchIndianTime()
      .then(indianTime => {
        let currTime = +indianTime;
        this.player.muted = false;

        if (this.props.playing && this.state.changeTime) {
          this.player.currentTime =
            (currTime - +new Date(this.props.sessionStartTime)) / 1000;

          this.setState({ changeTime: false });
        }
      })
  }

  render() {
    const { isFullScreen } = this.state;
    const { playing } = this.props;

    return (
      <div
        className={
          isFullScreen
            ? "youtube-player-wrapper full-screen"
            : "youtube-player-wrapper"
        }
      >
        <div className="live-tag">
          <span>LIVE</span>
        </div>
        <div
          className="toggle-play-overlay"
          onClick={() => {
            if (!playing) {
              this.player.play();
            } else {
              this.player.pause();
            }
          }}
        />
        <video className="youtube-player plyr__video-embed" autoPlay></video>
      </div>
    );
  }
}
