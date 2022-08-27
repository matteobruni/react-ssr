import React from "react";
import VisibilitySensor from "react-visibility-sensor";
import Plyr from "plyr";

import "react-visibility-sensor";

class YoutubePost extends React.Component {
  componentDidMount() {
    this.player = new Plyr(".youtube-player", {});
    this.player.source = {
      type: "video",
      sources: [
        {
          src: this.props.body.youtube_id,
          provider: "youtube",
        },
      ],
    };
    this.player.on("play", () => {
      var _videos = document.querySelectorAll("video");
      _videos.forEach((vid) => vid.pause());

      const _youtube = Array.from(
        document.querySelectorAll(`.plyr--youtube`)
      ).map((p) => p);

      _youtube.forEach((e) => {
        var _btn = e.querySelector('.plyr__controls > [data-plyr="play"]');
        if (
          _btn?.classList?.contains("plyr__control--pressed") &&
          !(
            e.querySelector(".plyr__poster").getAttribute("style") ===
              `background-image: url("https://i.ytimg.com/vi/${this.props.body.youtube_id}/maxresdefault.jpg");` ||
            e.querySelector(".plyr__poster").getAttribute("style") ===
              `background-image: url("https://i.ytimg.com/vi/${this.props.body.youtube_id}/sddefault.jpg");`
          )
        ) {
          _btn.click();
        }
      });
    });

    this._ismounted = true;
  }

  componentWillUnmount() {
    this.player.destroy();
    this._ismounted = false;
  }

  render() {
    return (
      <VisibilitySensor
        onChange={(visible) => {
          if (!visible) setTimeout(() => this.player.pause());
        }}
      >
        <div className="youtube-player-wrapper">
          <video className="youtube-player plyr__video-embed" />
        </div>
      </VisibilitySensor>
    );
  }
}

export default YoutubePost;
