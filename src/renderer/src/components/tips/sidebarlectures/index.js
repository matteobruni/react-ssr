import React, { useContext } from "react";
import Lottie from "lottie-react-web";
import { Link } from "react-router-dom";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Icon from "@material-ui/core/Icon";

import { TipsContext, PustackProContext, UserContext } from "../../../context";
import {
  CheckIcon as CheckIconImage,
  CheckIconGreen as CheckIconGreenImage,
  LockIcon as LockedIconImage,
} from "../../../assets";

import videoPlaying from "../../../assets/lottie/video_playing.json";
import NotesSVG from "../../../assets/images/pdf.svg";

const CheckIcon = () => (
  <Icon>
    <img
      src={CheckIconImage}
      alt="Check Icon"
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

const CheckGreenIcon = () => (
  <Icon>
    <img
      src={CheckIconGreenImage}
      alt="Check Icon"
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

const LockedIcon = () => (
  <Icon>
    <img
      src={LockedIconImage}
      alt="Lock Icon"
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

export default function TipsSidebarLectures({ data }) {
  const [activeItem, setActiveItem] = useContext(TipsContext).activeItem;
  const [videoSeeking, setVideoSeeking] = useContext(TipsContext).videoSeeking;
  const [tipsEngagement] = useContext(TipsContext).tipsEngagement;
  const [notesLink] = useContext(TipsContext).notesLink;
  const [, setIsNotes] = useContext(TipsContext).isNotes;
  const [playing, setPlaying] = useContext(TipsContext).playing;
  const [isUserProTier] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;
  const [, setTipTier] = useContext(TipsContext).tipTier;

  const isCompleted = (tipId) => {
    const statusData = tipsEngagement;

    if (typeof statusData !== "undefined" && tipId && statusData) {
      return statusData[tipId]?.is_completed;
    } else return false;
  };

  return (
    <div className="classroom__sidebar__tab dark">
      <List component="nav" aria-labelledby="nested-list-subheader">
        {data
          ?.sort((a, b) => a.serial_order - b.serial_order)
          ?.map((item, index) => (
            <Link
              to={`/tips?subject=${item?.tip_id
                .split("_")
                .slice(0, 4)
                .join("_")}&tip=${item?.tip_id}`}
              style={{ textDecoration: "none" }}
            >
              <ListItem
                onClick={() => {
                  if (item?.tip_id !== activeItem?.item) {
                    if (isUserProTier || item?.tier === "basic") {
                      setPlaying(false);
                      setVideoSeeking(true);
                      setActiveItem({ item: item?.tip_id });

                      setTipTier(item?.tier === "pro");
                    } else {
                      setIsSliderOpen(true);
                    }
                  }
                }}
                className={
                  item?.tip_id === activeItem?.item ? "tip__selected" : ""
                }
                disabled={item?.tip_id === activeItem?.item}
                button
                key={index}
                style={{
                  background:
                    item?.tip_id === activeItem?.item
                      ? "rgb(50, 50, 50)"
                      : "none",
                }}
              >
                <ListItemIcon className="list__item__icon">
                  {isUserProTier ? (
                    isCompleted(item?.tip_id) ? (
                      <CheckGreenIcon />
                    ) : (
                      <CheckIcon />
                    )
                  ) : item?.tier === "basic" ? (
                    isCompleted(item?.tip_id) ? (
                      <CheckGreenIcon />
                    ) : (
                      <CheckIcon />
                    )
                  ) : (
                    <LockedIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={item?.tip_name} />
                {item?.tip_id === activeItem?.item && isUserProTier ? (
                  notesLink ? (
                    <button onClick={() => setIsNotes(true)}>
                      <img
                        className="notes__svg"
                        alt="PuStack Notes"
                        src={NotesSVG}
                        draggable={false}
                      />
                    </button>
                  ) : (
                    <h5 className="video__seeking__lottie">
                      <Lottie
                        options={{ animationData: videoPlaying, loop: true }}
                        isPaused={!playing || videoSeeking}
                      />
                    </h5>
                  )
                ) : (
                  item?.tip_id === activeItem?.item && (
                    <h5 className="video__seeking__lottie">
                      <Lottie
                        options={{ animationData: videoPlaying, loop: true }}
                        isPaused={!playing || videoSeeking}
                      />
                    </h5>
                  )
                )}
              </ListItem>
            </Link>
          ))}
      </List>
    </div>
  );
}
