import React, { useState, useContext, useEffect } from "react";
import Lottie from "lottie-react-web";
import List from "@material-ui/core/List";
import Icon from "@material-ui/core/Icon";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { useMediaQuery } from "react-responsive";

import {
  PracticeContext,
  PustackProContext,
  UserContext,
} from "../../../context";

import { getItemDetails } from "../../../database";
import {
  CheckIcon as CheckIconImage,
  CheckIconGreen as CheckIconGreenImage,
  LockIcon as LockedIconImage,
} from "../../../assets";
import NotesSVG from "../../../assets/images/pdf.svg";
import videoPlaying from "../../../assets/lottie/video_playing.json";
import "./style.scss";

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

export default function PracticeSidebarLectures({
  data,
  tabIndex,
  examEngagementStatus,
  subjectId,
  practiceId,
}) {
  const [activeItem, setActiveItem] = useContext(PracticeContext).activeItem;
  const [nextItem, setNextItem] = useContext(PracticeContext).nextItem;
  const [classroomNotes] = useContext(PracticeContext).notesLink;
  const [, setIsNotes] = useContext(PracticeContext).isNotes;
  const [practiceNotes, setPracticeNotes] =
    useContext(PracticeContext).notesLink;
  const [, setActiveTabIndex] = useContext(PracticeContext).activeTabIndex;
  const [playing, setPlaying] = useContext(PracticeContext).playing;
  const [, setPracticeTier] = useContext(PracticeContext).practiceTier;
  const [videoSeeking, setVideoSeeking] =
    useContext(PracticeContext).videoSeeking;

  const [isUserProTier] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;
  const [user] = useContext(UserContext).user;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  const [getNotes, setGetNotes] = useState(false);

  const isCompleted = (examId) => {
    if (examEngagementStatus) {
      return examEngagementStatus[examId]?.is_completed;
    } else return false;
  };

  const isHeaderItemCompleted = (lectureId, subLectureId) => {
    if (examEngagementStatus) {
      return examEngagementStatus[lectureId]?.header_item_status[subLectureId]
        ?.is_completed;
    } else return false;
  };

  const getNotesLinkFn = async (itemId) => {
    const data = await getItemDetails({
      grade: user?.grade,
      subjectId,
      practiceId,
      itemId,
    });

    if (data?.notes_link) {
      setPracticeNotes(data?.notes_link);
    }
  };

  useEffect(() => {
    getNotes && getNotesLinkFn(activeItem?.item);
  }, [getNotes]);

  return (
    <div className="classroom__sidebar__tab dark">
      <List component="nav" aria-labelledby="nested-list-subheader">
        {data?.map((item, index) => {
          if (item?.exam_header_items?.length > 0 && tabIndex === 1)
            return item?.exam_header_items
              .sort((a, b) => a.serial_order - b.serial_order)
              ?.map((d, idx) => (
                <ListItem
                  key={idx}
                  button
                  onClick={() => {
                    if (d?.exam_header_item_id !== activeItem?.item) {
                      if (isUserProTier || d?.tier === "basic") {
                        setPlaying(false);

                        d?.exam_header_item_id !== activeItem?.item &&
                          setVideoSeeking(true);

                        setActiveItem({
                          parent: item?.exam_item_id,
                          item: d?.exam_header_item_id,
                        });

                        if (d?.tier === "pro") {
                          setPracticeTier(true);
                        } else {
                          setPracticeTier(false);
                        }

                        setActiveTabIndex(1);
                      } else {
                        setIsSliderOpen(true);
                      }
                    }
                  }}
                  disabled={d?.exam_header_item_id === activeItem?.item}
                  className={
                    d?.exam_header_item_id === activeItem?.item
                      ? "exam___selected"
                      : ""
                  }
                  style={{
                    background:
                      d?.exam_header_item_id === activeItem?.item
                        ? "rgb(50, 50, 50)"
                        : "none",
                  }}
                >
                  <ListItemIcon className="list__item__icon">
                    {isUserProTier ? (
                      isHeaderItemCompleted(
                        item?.exam_item_id,
                        d?.exam_header_item_id
                      ) ? (
                        <CheckGreenIcon />
                      ) : (
                        <CheckIcon />
                      )
                    ) : d?.tier === "basic" ? (
                      isHeaderItemCompleted(
                        item?.exam_item_id,
                        d?.exam_header_item_id
                      ) ? (
                        <CheckGreenIcon />
                      ) : (
                        <CheckIcon />
                      )
                    ) : (
                      <LockedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={d?.lecture_header_item_name} />
                  {d?.exam_header_item_id === activeItem?.item ? (
                    (classroomNotes || "") && isUserProTier ? (
                      <button
                        className="notes__btn"
                        onClick={() => {
                          setIsNotes(true);
                          setGetNotes(true);
                          isSmallScreen && setPlaying(false);
                        }}
                        aria-label="notes"
                      >
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
                          options={{
                            animationData: videoPlaying,
                            loop: true,
                          }}
                          isPaused={!playing || videoSeeking}
                        />
                      </h5>
                    )
                  ) : (
                    ""
                  )}
                </ListItem>
              ));
          else if (tabIndex === 0)
            return item?.list_items?.map((d) => (
              <ListItem
                onClick={() => {
                  if (d?.exam_item_id !== activeItem?.item) {
                    if (isUserProTier || d?.tier === "basic") {
                      setPlaying(false);

                      if (d?.exam_item_type === "video") {
                        setVideoSeeking(true);
                        setActiveItem({ parent: null, item: d?.exam_item_id });
                        setNextItem({ ...nextItem, examType: "video" });
                      }

                      if (d?.exam_item_type === "note") {
                        getNotesLinkFn(d?.exam_item_id);
                      }

                      if (d?.tier === "pro") {
                        setPracticeTier(true);
                      } else {
                        setPracticeTier(false);
                      }

                      if (d?.exam_item_type === "note") {
                        setIsNotes(true);
                      }

                      setActiveTabIndex(0);
                    } else {
                      setIsSliderOpen(true);
                    }
                  }
                }}
                className={
                  d?.exam_item_id === activeItem?.item ? "exam___selected" : ""
                }
                disabled={d?.exam_item_id === activeItem?.item}
                button
                key={index}
                style={{
                  background:
                    d?.exam_item_id === activeItem?.item
                      ? "rgb(50, 50, 50)"
                      : "none",
                }}
              >
                <ListItemIcon className="list__item__icon">
                  {isUserProTier ? (
                    isCompleted(d?.exam_item_id) ? (
                      <CheckGreenIcon />
                    ) : (
                      <CheckIcon />
                    )
                  ) : d?.tier === "basic" ? (
                    isCompleted(d?.exam_item_id) ? (
                      <CheckGreenIcon />
                    ) : (
                      <CheckIcon />
                    )
                  ) : (
                    <LockedIcon />
                  )}
                </ListItemIcon>

                <ListItemText primary={d?.exam_item_name} />

                {d?.exam_item_id === activeItem?.item && isUserProTier ? (
                  classroomNotes ? (
                    <button
                      className="notes__btn"
                      onClick={() => {
                        setIsNotes(true);
                        setGetNotes(true);
                        isSmallScreen && setPlaying(false);
                      }}
                      aria-label="notes-btn"
                    >
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
                  d?.exam_item_id === activeItem?.item && (
                    <h5 className="video__seeking__lottie">
                      <Lottie
                        options={{ animationData: videoPlaying, loop: true }}
                        isPaused={!playing || videoSeeking}
                      />
                    </h5>
                  )
                )}
              </ListItem>
            ));
        })}
      </List>
    </div>
  );
}
