import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {fetchIndianTime, showSnackbar, starPath} from "../../../helpers";
import StarRatings from "react-star-ratings";
import Close from "@material-ui/icons/Close";
import { UserContext } from "../../../context";
import VideocamRoundedIcon from "@material-ui/icons/VideocamRounded";
import { PingRing, nounBook, verfifiedCheck } from "../../../assets";
import "./style.scss";
import {usedMinutesForToday} from "../../../database/blaze/fetch-data";

const BlazeCallNotification = () => {
  const [user] = useContext(UserContext).user;
  const [isProTier] = useContext(UserContext).tier;
  const [pushyData] = useContext(UserContext).pushyData;
  const [blazeCallAlert, setBlazeCallAlert] =
    useContext(UserContext).blazeCallAlert;
  const [, setOpenBlazeCallModal] = useContext(UserContext).openBlazeCallModal;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const objImg = new Image();
    objImg.src = pushyData?.instructor_profile_picture;
    objImg.onload = () => setImageLoaded(true);
  }, [pushyData]);

  const deleteNotification = async () => {
    const androidToken = pushyData?.student_mobile_token;
    const sessionId = pushyData?.session_id;
    const today = await fetchIndianTime();
    const pingData = {
      ...pushyData,
      notification_type: "dismiss_ping",
      deliver_ts: +today,
    };
      fetch(
        "https://us-central1-avian-display-193502.cloudfunctions.net/acceptBlazeCall",
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            // student_web_token: null,
            // student_android_token: androidToken,
            // ping_data: pingData,
            // context: { auth: !!sessionId },
            ping_data: pingData,
            source_platform: 'web'
          }),
        }
      )
        .then(() => console.log("accepted"))
        .catch((err) => console.log(err));
  };

  const rejectCall = async () => {
    const sessionId = pushyData?.session_id;
    const today = await fetchIndianTime();
    const pingData = {
      ...pushyData,
      notification_type: "dismiss_ping",
      deliver_ts: +today,
    };

    setBlazeCallAlert(false);
    fetch(
      "https://us-central1-avian-display-193502.cloudfunctions.net/rejectBlazeCall",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
          status: "rejected_by_student",
          student_web_token: null,
          student_mobile_token: pushyData?.student_mobile_token,
          ping_data: pingData,
          context: { auth: !!sessionId },
          source_platform: 'web'
        }),
      }
    )
      .then(() => console.log("rejected"))
      .catch((err) => console.log(err));
  };

  const acceptCall = async () => {
    if(!isProTier) {
      const usedMinutes = await usedMinutesForToday(user?.uid);

      if(usedMinutes >= 600) {
        showSnackbar('You have exhausted all the free quota for today.', 'warning')
        await rejectCall();
        return;
      }
    }

    setBlazeCallAlert(false);
    setOpenBlazeCallModal(true);
    deleteNotification();
  };

  return blazeCallAlert ? (
    <div className="blaze__call__wrapper">
      <audio src={PingRing} autoPlay />
      <div className="blaze__call__backdrop"></div>
      <div className="blaze__call__inner__wrapper">
        <div className="blaze__call__inner">
          <div className="blaze__call__head">
            <h1>Incoming Blaze Call</h1>
            <Close onClick={rejectCall} />
          </div>
          <div className="blaze__call__body">
            <div className="blaze__instructor__details">
              <div className="blaze__instructor__meta">
                <div className="blaze__instructor__image">
                  {imageLoaded ? (
                    <img
                      alt="instructor"
                      src={pushyData?.instructor_profile_picture}
                      draggable={false}
                      className="image__main"
                    />
                  ) : (
                    <img
                      alt="instructor"
                      src={nounBook}
                      draggable={false}
                      className="image__main place"
                    />
                  )}
                  <img
                    src={verfifiedCheck}
                    alt="v"
                    className="image__verified"
                  />
                </div>
                <div className="blaze__title">
                  <h1 role="definition">{pushyData?.notification_title}</h1>
                  <p>{pushyData?.notification_subtitle}</p>
                </div>
              </div>
              <div className="blaze__instructor__rating">
                <StarRatings
                  rating={
                    pushyData?.instructor_avg_rating
                      ? Number(pushyData?.instructor_avg_rating)
                      : 4.7
                  }
                  starRatedColor="#e9b022"
                  starHoverColor="#e9b022"
                  numberOfStars={5}
                  starDimension="16px"
                  starSpacing="2px"
                  name="rating"
                  svgIconPath={starPath}
                  svgIconViewBox="0 0 207.802 207.748"
                />
              </div>
            </div>
            <div className="call__actions">
              <button className="reject__btn" onClick={rejectCall}>
                Reject
              </button>
              <Link to={`/blaze/chat/${pushyData?.session_id}`}>
                <button className="accept__btn" onClick={acceptCall}>
                  <VideocamRoundedIcon />
                  Accept
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default BlazeCallNotification;
