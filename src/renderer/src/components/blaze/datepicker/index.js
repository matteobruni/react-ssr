import React, {useCallback, useContext, useEffect, useState} from "react";

import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import allBookedImage from "../../../assets/blaze/busy.svg";
import { getBlazeDatesAvailability } from "../../../database";
import {UserContext, BookSessionContext, IntroContext} from "../../../context";
import useToday from "../../../hooks/today";

const daysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

export default function BlazeDatePicker({
  setDateAccepted,
  date,
  isDarkTheme,
  changeDate,
  sessionsAvailability,
}) {
  const [user] = useContext(UserContext).user;
  const [subjectSelected] = useContext(BookSessionContext).subjectSelected;
  const [categorySelected] = useContext(BookSessionContext).categorySelected;
  const today = useToday();

  const [blazeDates, setBlazeDates] = useState(null);

  const populateAvailableDates = async () => {
    let _dates = await getBlazeDatesAvailability({
      category: categorySelected,
      subject: subjectSelected,
      grade: user?.grade,
    });

    if (typeof _dates !== "undefined") {
      setBlazeDates(_dates);
    }
  };

  useEffect(() => {
    if (categorySelected !== null && typeof categorySelected !== "undefined") {
      populateAvailableDates();
    }
  }, [categorySelected, subjectSelected]);

  useEffect(() => {
    if (blazeDates === null) sessionsAvailability(false);
    else sessionsAvailability(true);
  }, [blazeDates]);

  const availabilityRenderer = useCallback((date) => {
    // First Month
    if (date.getMonth() === today.getMonth()) {
      if (date.getDate() < today.getDate()) return true;

      if (blazeDates[0] && blazeDates[0][date.getDate() - 1] > 0) return false;
    }
    // Second Month
    else if (blazeDates[1] && blazeDates[1][date.getDate() - 1] > 0) {
      return false;
    }
    return true;
  }, [today]);

  return (
    <div
      className={
        isDarkTheme ? "popup__date__picker dark" : "popup__date__picker"
      }
    >
      {blazeDates === null && (
        <div
          className={
            isDarkTheme
              ? "booking__loader__wrapper dark"
              : "booking__loader__wrapper"
          }
        >
          <img
            src={allBookedImage}
            alt="busy"
            style={{ width: "240px", margin: "auto" }}
          />
          <h3>All sessions have been booked. Please come back later.</h3>
        </div>
      )}

      {blazeDates !== null && (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            disableToolbar
            autoOk
            variant="static"
            onAccept={() => setDateAccepted(true)}
            views={["month", "date"]}
            value={date}
            style={{ width: "100%", minWidth: "100%" }}
            fullWidth={true}
            shouldDisableDate={availabilityRenderer}
            disablePast
            onChange={changeDate}
            maxDate={
              new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                daysInMonth(today.getMonth() + 2, today.getFullYear())
              )
            }
          />
        </MuiPickersUtilsProvider>
      )}
    </div>
  );
}
