import React, { Component } from "react";
import Plyr from "plyr";
import Lottie from "lottie-react-web";
import { Link } from "react-router-dom";
import { circularProgress } from "../../../assets";
import "./style.scss";
import {fetchIndianTime} from "../../../helpers";

export default class FloatingPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      isFullScreen: false,
      play: true,
      enabled: true,
      translatePlayer: false,
      ready: false,
    };
    this.startPlaying = this.startPlaying.bind(this);
  }

  componentDidMount() {
    const { video_id } = this.props;

    if (video_id !== null) this.startPlaying();
  }

  startPlaying() {
    const { video_id, sessionStartTime } = this.props;

    this.player = new Plyr(".floating__youtube__player", {
      controls: this.state.controls,
      autoplay: true,
    });

    this.player.source = {
      type: "video",
      sources: [{ src: video_id, provider: "youtube" }],
    };

    this.player.on("ready", async () => {
      let today = await fetchIndianTime();
      this.player.currentTime =
        (today - +new Date(sessionStartTime)) / 1000;
    });
    this.player.on("playing", () =>
      setTimeout(() => this.setState({ ready: true }), 3500)
    );

    this.player.autoplay = true;
    this.player.muted = this.props.isMute;

    this.player.play();
  }

  componentDidUpdate(prevProps) {
    this.player.muted = this.props.isMute;

    if (
      prevProps.openPustackCare !== this.props.openPustackCare &&
      this.props.openPustackCare
    ) {
      this.setState({ translatePlayer: true });
    }
  }

  render() {
    const { translatePlayer } = this.state;

    return (
      <>
        <div
          className={
            this.props.openPustackCare
              ? `floating__video__player__wrapper ${
                  translatePlayer && "float__left"
                }`
              : `floating__video__player__wrapper ${
                  translatePlayer && "float__right"
                }`
          }
        >
          <div className="floating__player__content">
            <div className="live__tag">
              <span>LIVE</span>
            </div>

            <video className="floating__youtube__player" autoPlay></video>
            {!this.state.ready && (
              <div className="floating__controls">
                <div className="ready__player">
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                </div>
              </div>
            )}

            <div className="floating__controls">
              <div className="top__control">
                <i
                  className="fas fa-times-circle"
                  onClick={this.props.dismiss}
                />
              </div>
              <Link to={`/classes/${this.props.sessionID}`}>
                <div className="main__control">
                  <i className="fas fa-external-link-alt" />
                  Open in Live Sessions
                </div>
              </Link>
              <div className="bottom__controls">
                <div
                  className="mute__btn"
                  onClick={() => this.props.handleMute()}
                >
                  <i
                    className={
                      this.props.isMute
                        ? "fas fa-volume-mute"
                        : "fas fa-volume-up"
                    }
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
