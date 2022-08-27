import React, { useEffect, useState, useContext } from "react";
import { logoDark2, logoLight2 } from "../../../../../assets";
import { ThemeContext } from "../../../../../context";
import { shadeColor } from "../../../../../helpers";
import { Link } from "react-router-dom";

import "./style.scss";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const titleCase = (str) => {
  var splitStr = str?.toLowerCase().split(" ");
  for (var i = 0; i < splitStr?.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }

  return splitStr?.join(" ");
};

const getSubject = (arr) => {
  let sub = "";
  arr.map((w) => (sub = sub + " " + w));
  return sub.slice(1);
};

export default function BlazeCard({
  topic,
  skill,
  chapter,
  onClick,
  sessionId,
  type = null,
  chaptersMeta,
  unreadMsgCount,
  instructorPhoto,
  isSessionSelected,
}) {
  const [chatMeta, setChatMeta] = useState(null);
  const [subject, setSubject] = useState(null);
  const [grade, setGrade] = useState(null);
  const [isDark] = useContext(ThemeContext).theme;

  useEffect(() => {
    let splitted = skill?.split("_");

    if (splitted.length > 0) {
      splitted.length === 3
        ? setSubject(splitted[2])
        : setSubject(getSubject(splitted.slice(3)));

      setGrade(splitted[0] + " " + splitted[1]);
    }
    if (chaptersMeta) {
      if (subject?.toLowerCase() !== "general") {
        setChatMeta(
          chaptersMeta[titleCase(subject)]?.filter(
            (item) => item?.chapter_name?.toLowerCase() === topic?.toLowerCase()
          )[0]
        );
      } else {
        setChatMeta(
          chaptersMeta["Others"]?.filter(
            (item) => item?.chapter_name?.toLowerCase() === topic?.toLowerCase()
          )[0]
        );
      }
    }
  }, [chaptersMeta]);

  const placeHolder = isDark ? logoDark2 : logoLight2;

  return (
    <Link
      to={`/blaze/chat/${sessionId}`}
      className={type === "completed" ? "session__completed" : ""}
    >
      <div
        className={
          isSessionSelected
            ? "blaze__card fadeIn"
            : "blaze__card fadeIn session__not__selected"
        }
        onClick={onClick}
        style={{
          backgroundColor: chatMeta
            ? chatMeta?.hex_color
              ? chatMeta?.hex_color
              : "rgb(240, 213, 204)"
            : "rgb(240, 213, 204)",
        }}
      >
        <div className="blaze__card__hero">
          <img
            src={
              chatMeta
                ? chatMeta?.image_url
                  ? chatMeta?.image_url
                  : placeHolder
                : placeHolder
            }
            alt={chapter}
            className="blaze__card__image"
          />
          <div
            className="blaze__hero__overlay"
            style={{
              background:
                chatMeta?.hex_color &&
                `linear-gradient(to bottom, ${
                  chatMeta?.hex_color
                }00 0%, ${shadeColor(chatMeta?.hex_color, -30)} 100%)`,
            }}
          ></div>
        </div>
        <div className="blaze__card__content">
          <div className="blaze__session__head__wrapper">
            <div className="blaze__session__title">{topic}</div>
          </div>
          <div className="blaze__session__schedule">
            <div className="blaze__session__detail1">
              {grade} • {subject}
            </div>
            {type === "accepted" && (
              <div className="blaze__session__detail2">
                <CheckCircleIcon />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
