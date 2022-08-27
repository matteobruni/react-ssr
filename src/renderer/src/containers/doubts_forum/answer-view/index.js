import React, { useContext } from "react";
import { v1 as uuid } from "uuid";
import "react-quill/dist/quill.snow.css";

import {
  DoubtContext,
  ThemeContext,
  LiveSessionContext,
} from "../../../context";
import { YoutubeEmbed } from "../../../components";
import { isValidYouTubeUrl } from "../../../helpers";
import "./style.scss";

function AnswerView({ answerImages, youtubeId, doubtId }) {
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [isExpanded, setIsExpanded] = useContext(DoubtContext).isExpanded;
  const [, setIsFloatingMute] = useContext(LiveSessionContext).isFloatingMute;

  return (
    <div className="answerView">
      {youtubeId &&
        youtubeId !== "" &&
        isValidYouTubeUrl(`http://youtu.be/${youtubeId}`) && (
          <YoutubeEmbed
            muteFloating={() => setIsFloatingMute(true)}
            style={{ marginTop: "23px" }}
            body={{ video_id: youtubeId, doubtId }}
          />
        )}

      {answerImages && !youtubeId ? (
        !isExpanded && (
          <div
            id={
              isExpanded
                ? "doubtTile__imageContainerExpanded"
                : isDarkMode
                ? "doubtTile__imageContainer__dark"
                : "doubtTile__imageContainer"
            }
          >
            <img
              onClick={() => setIsExpanded(true)}
              id="answer-image-view-0"
              style={{ maxHeight: isExpanded ? "70vh" : "400px" }}
              src={answerImages[0] ? answerImages[0] : ""}
              className="question-image"
              alt=""
            />
          </div>
        )
      ) : (
        <></>
      )}

      {answerImages && answerImages.lenght > 0 ? (
        answerImages.map(({ answerImage }) => (
          <img
            key={uuid()}
            alt=""
            onClick={() => setIsExpanded(true)}
            id={isExpanded ? "doubtTile__imageExpanded" : "doubtTile__image"}
            src={answerImage}
          />
        ))
      ) : (
        <></>
      )}
    </div>
  );
}

export default AnswerView;
