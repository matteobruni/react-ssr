import React, { useState, useEffect, useContext } from "react";
import Lottie from "lottie-react-web";

import {
  allBookedImage,
  circularProgress,
  TimeSlotNotAvailable,
} from "../../../assets";
import { SectionHeaderLabel, CustomChip } from "../../index";
import { UserContext, BookSessionContext } from "../../../context";
import { hourToStrFormat, monthToStrFormat } from "../../../helpers";
import { checkPriorBookingSlots, getBlazeTimeSlots } from "../../../database";

const dayToStringFormatter = (day) => {
  switch (day) {
    case -1:
      return "Sunday";
    case 0:
      return "Monday";
    case 1:
      return "Tuesdat";
    case 2:
      return "Wednesday";
    case 3:
      return "Thursday";
    case 4:
      return "Friday";
    case 5:
      return "Saturday";
    default:
      return "";
  }
};

export default function BlazeTimePicker({
  date,
  setselectedTimeSlot,
  selectedTimeSlot,
  isDarkTheme,
  isTimeSlotAvailable,
}) {
  const [user] = useContext(UserContext).user;
  const [categorySelected] = useContext(BookSessionContext).categorySelected;
  const [chapterSelected] = useContext(BookSessionContext).chapterSelected;
  const [subjectSelected] = useContext(BookSessionContext).subjectSelected;
  const [timeSlots, setTimeSlots] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const populateTimeSlots = async () => {
    // Skip subject check in maths
    if (
      date !== null &&
      user?.grade &&
      (categorySelected !== null) & (typeof categorySelected !== "undefined") &&
      categorySelected === "Maths"
    ) {
      const _slots = await getBlazeTimeSlots({
        date: date,
        grade: user.grade,
        category: categorySelected,
        subject: subjectSelected,
      });

      let _checked = await checkPriorBookingSlots({
        userid: user.uid,
        timeslots: _slots,
        date: date,
        grade: user.grade,
      });
      setTimeSlots(_checked);
    }
    if (
      date !== null &&
      user?.grade &&
      categorySelected !== null &&
      categorySelected !== "" &&
      typeof categorySelected !== "undefined" &&
      subjectSelected !== null &&
      subjectSelected !== "" &&
      typeof subjectSelected !== "undefined"
    ) {
      const _slots = await getBlazeTimeSlots({
        date: date,
        grade: user.grade,
        category: categorySelected,
        subject: subjectSelected,
      });

      let _checked = await checkPriorBookingSlots({
        userid: user.uid,
        timeslots: _slots,
        date: date,
        grade: user.grade,
      });
      setTimeSlots(_checked);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (date !== null && typeof date !== "undefined") populateTimeSlots();
  }, [date, isTimeSlotAvailable, categorySelected, subjectSelected]);

  return (
    <div className="blaze__popup__time__wrapper">
      {!isLoading && timeSlots === null && (
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
      {isLoading && timeSlots !== null && (
        <div
          className={
            isDarkTheme
              ? "booking__loader__wrapper dark"
              : "booking__loader__wrapper"
          }
        >
          <div className="circular__progress__lottie">
            <Lottie
              options={{
                animationData: circularProgress,
                loop: true,
              }}
            />
          </div>
          <h3>Fetching availability</h3>
        </div>
      )}
      {timeSlots !== null && (
        <>
          <div className="time__toolbar">
            <h3>
              {categorySelected !== null &&
                categorySelected !== "" &&
                ` ${categorySelected} `}
              {subjectSelected !== "" &&
                subjectSelected !== null &&
                `• ${subjectSelected} `}
              {chapterSelected !== null && chapterSelected !== "" && (
                <span>• {chapterSelected}</span>
              )}

              {(categorySelected === null || categorySelected === "") &&
                (subjectSelected === "" || subjectSelected === null) &&
                (chapterSelected === null || chapterSelected === "") &&
                "."}
            </h3>
            <h1>
              {dayToStringFormatter(date.getDay() - 1)},{" "}
              {monthToStrFormat(date.getMonth())} {date.getDate()}
            </h1>
          </div>

          {!isTimeSlotAvailable ? (
            <div
              className={
                isDarkTheme
                  ? "slot__not__available__lottie dark"
                  : "slot__not__available__lottie"
              }
            >
              <Lottie
                options={{
                  animationData: TimeSlotNotAvailable,
                  loop: true,
                }}
              />
              <h6>
                Oops... {hourToStrFormat(Number(selectedTimeSlot))} is no longer
                available.
              </h6>
              <h6>Please, pick a different time slot.</h6>
            </div>
          ) : (
            ""
          )}

          <SectionHeaderLabel label="Select Time Slot :" isDark={isDarkTheme} />
          <div className="blaze__time__chips">
            {timeSlots?.map((slot, index) => (
              <button
                onClick={() => setselectedTimeSlot(slot)}
                className="chip__button"
                key={index}
              >
                <CustomChip
                  isDark={isDarkTheme}
                  label={hourToStrFormat(Number(slot))}
                  isSelected={slot === selectedTimeSlot}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
