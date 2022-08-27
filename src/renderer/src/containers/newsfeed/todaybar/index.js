import React, { useState, useContext, useEffect } from "react";

import { Link } from "react-router-dom";
import { UserContext } from "../../../context";

import "./styles.scss";
import {fetchTodaySessions, fetchTodayUpcomingSessions} from "../../../database/livesessions/sessions";
import useToday from "../../../hooks/today";

const timeFormatter = (hour, mins) => {
  if (hour === 12) {
    if (mins < 9) {
      return `12:0${mins} PM`;
    } else {
      return `12:${mins} PM`;
    }
  } else if (hour > 12) {
    if (mins < 9) {
      return `${hour - 12}:0${mins} PM`;
    } else {
      return `${hour - 12}:${mins} PM`;
    }
  } else if (hour < 12) {
    if (mins < 9) {
      return `${hour}:0${mins} AM`;
    } else {
      return `${hour}:${mins} AM`;
    }
  }
};

const dateFormatter = (date) => {
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getMonth()]} ${date.getDate()}`;
};

export default function TodaySessionsBar() {
  const [user] = useContext(UserContext).user;
  const [isUserPro] = useContext(UserContext).tier;
  const today = useToday();

  const [sessionsToday, setSessionsToday] = useState(null);

  const getTodaySessions = async () => {
    let _temp = await fetchTodaySessions(user?.grade, isUserPro);
    setSessionsToday(_temp);
  };

  useEffect(() => {
    getTodaySessions();
  }, []);

  return (
    <>
      {sessionsToday && (
        <div className="sessions-bar">
          <div
            style={{ display: sessionsToday?.length > 0 ? "block" : "none" }}
          >
            <div className="sessions-bar-top">
              <h3 className="sessionsbar-heading fadeIn">{`Upcoming Classes`}</h3>
              <i className="fas fa-calendar"></i>
            </div>

            <div className="hr"></div>

            <div className="today__sessions__list__wrapper">
              {sessionsToday.map((e, j) => {
                if (e?.start_ts?.getDate() === today?.getDate()) {
                  return (
                    <div
                      className="today__session fadeIn"
                      style={{ animationDelay: `${0.1 * (j + 1)}s` }}
                    >
                      <div className="session__time">
                        Today,{" "}
                        {timeFormatter(
                          e?.start_ts?.getHours(),
                          e?.start_ts?.getMinutes()
                        )}
                      </div>

                      <Link to={`/classes/${e?.session_id}`}>
                        <div className="session__title">{e.name}</div>{" "}
                      </Link>
                    </div>
                  );
                } else if (
                  e?.start_ts?.getDate() - 1 ===
                  today?.getDate()
                ) {
                  return (
                    <div className="today__session">
                      <div className="session__time">
                        Tomorrow,{" "}
                        {timeFormatter(
                          e?.start_ts?.getHours(),
                          e?.start_ts?.getMinutes()
                        )}
                      </div>

                      <Link to={`/classes/${e?.session_id}`}>
                        {" "}
                        <div className="session__title">{e.name}</div>{" "}
                      </Link>
                    </div>
                  );
                }
                return (
                  <div className="today__session">
                    <div className="session__time">
                      {dateFormatter(e?.start_ts)},{" "}
                      {timeFormatter(
                        e?.start_ts?.getHours(),
                        e?.start_ts?.getMinutes()
                      )}
                    </div>

                    <Link to={`/classes/${e?.session_id}`}>
                      {" "}
                      <div className="session__title">{e.name}</div>{" "}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
