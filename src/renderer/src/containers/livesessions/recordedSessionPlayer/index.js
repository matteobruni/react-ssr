import React, { Component } from "react";
import Plyr from "plyr";

export default class RecordedPlayer extends Component {
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
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "pip",
        "airplay",
        "settings",
        "fullscreen",
      ],
    };
  }

  componentDidMount() {
    const { video_id, setPlaying } = this.props;

    this.player = new Plyr(".youtube-player", {
      controls: this.state.controls,
      autoplay: !this.props.isInstructor,
      invertTime: false,
      toggleInvert: false,
      muted: false,
    });

    this.player.source = {
      type: "video",
      sources: [{ src: video_id, provider: "youtube" }],
    };

    if (video_id !== null) {
      this.player.on("playing", () => {
        setPlaying(true)
      });
      this.player.on("seeking", () => setPlaying(false));
      this.player.on("seeked", () => {
        // console.log('Setting playing - true');
        // setPlaying(true);
        this.player.muted = false;
      });
      this.player.on("pause", () => setPlaying(false));
      this.player.autoplay = !this.props.isInstructor;
      this.player.on("ready", () => (this.player.currentTime = 0));
      this.player.muted = false;

      this.player.on("enterfullscreen", () =>
        this.setState({ isFullScreen: true })
      );

      this.player.on("exitfullscreen", () =>
        this.setState({ isFullScreen: false })
      );
    }
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
        <div
          className="toggle-play-overlay"
          onClick={() => {
            return (!playing ? this.player.play() : this.player.pause())
          }}
        />
        <video className="youtube-player plyr__video-embed" autoPlay={!this.props.isInstructor} />
      </div>
    );
  }
}
