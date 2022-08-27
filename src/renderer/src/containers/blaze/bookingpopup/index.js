import React, { useState, useContext, useEffect } from "react";
import Lottie from "lottie-react-web";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from "@material-ui/icons/Close";
import SwipeableViews from "react-swipeable-views";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

import { BlazeCategorySelector } from "../../index";
import { CircularProgress } from "@material-ui/core";

import { db } from "../../../firebase_config";
import { BlazeDatePicker, BlazeTimePicker } from "../../../components";
import {
  BookSessionContext,
  ThemeContext,
  UserContext,
} from "../../../context";

import failureLottie from "../../../assets/lottie/fail.json";
import warningLottie from "../../../assets/lottie/warning.json";
import confirmedLottie from "../../../assets/lottie/confirm.json";
import circularProgress from "../../../assets/lottie/circularProgress.json";
import "./style.scss";

import {
  loadScript,
  createBlazeOrder,
  hourToStrFormat,
  monthToStrFormat,
  rescheduleBlazeReservationByUser,
} from "../../../helpers";
import { checkPriorBookingSlots } from "../../../database";

const useForceUpdate = () => {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value); // update the state to force render
};

export default function BookingPopup({
  isOpen = false,
  handleClose,
  handleTryAgain,
}) {
  const forceUpdate = useForceUpdate();

  const [allowNext, setAllowNext] = useContext(BookSessionContext).allowNext;
  const [categorySelected, setCategorySelected] =
    useContext(BookSessionContext).categorySelected;
  const [subjectSelected, setSubjectSelected] =
    useContext(BookSessionContext).subjectSelected;
  const [chapterSelected, setChapterSelected] =
    useContext(BookSessionContext).chapterSelected;

  const [user] = useContext(UserContext).user;
  const [isDarkTheme] = useContext(ThemeContext).theme;

  const [amount, setAmount] = useState(0);
  const [date, changeDate] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [dateAccepted, setDateAccepted] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [currentTabIndex, setcurrentTabIndex] = useState(3);
  const [isNextAllowed, setIsNextAllowed] = useState(false);
  const [selectedTimeSlot, setselectedTimeSlot] = useState(null);
  const [openWarningPopup, setOpenWarningPopup] = useState(false);
  const [isSessionAvailable, setIsSessionAvailable] = useState(true);
  const [isTimeSlotAvailable, setIsTimeSlotAvailable] = useState(true);
  const [isPaymentProcessing, setisPaymentProcessing] = useState(false);
  const [differentDateSelection, setDifferentDateSelection] = useState(false);
  const [loadingText, setLoadingText] = useState(
    "Hang on, Booking your session"
  );

  const handlePopupClose = () => {
    setDateAccepted(false);
    setIsNextAllowed(false);
    setselectedTimeSlot(null);
    setisPaymentProcessing(false);
    setcurrentTabIndex(0);
    setCategorySelected("General");
    setSubjectSelected("");
    setChapterSelected("");
    setAllowNext(false);
    setIsTimeSlotAvailable(true);

    handleClose();
  };

  const handlePopUpsClose = () => {
    setOpenWarningPopup(false);
    handlePopupClose();
  };

  useEffect(() => {
    setcurrentTabIndex(0);
  }, [isOpen]);

  useEffect(() => {
    // For Category Selector Tab
    if (currentTabIndex === 0) {
      if (allowNext && (subjectSelected || categorySelected === "Maths")) {
        setIsNextAllowed(true);
      } else {
        setIsNextAllowed(false);
      }
    }

    // For Date Picker Tab
    else if (currentTabIndex === 1) {
      if (changeDate !== null && !isNextAllowed) setIsNextAllowed(true);
      else if (changeDate === null && isNextAllowed) setIsNextAllowed(false);
    }

    // For Time Slots Picker Tab
    else if (currentTabIndex === 2) {
      if (selectedTimeSlot !== null && !isNextAllowed) setIsNextAllowed(true);
      else if (selectedTimeSlot === null && isNextAllowed)
        setIsNextAllowed(false);
    }
  }, [
    allowNext,
    dateAccepted,
    selectedTimeSlot,
    currentTabIndex,
    subjectSelected,
    categorySelected,
  ]);

  useEffect(() => {
    if (isPaymentProcessing) {
      window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        return (ev.returnValue = "Changes you made may not be saved.");
      });
    }

    const orderReservationListener = () => {
      if (reservationId !== null) {
        const doc = db
          .collection("blaze")
          .doc(user.grade)
          .collection("blaze_reservations")
          .doc(user.uid)
          .collection("reservations")
          .doc(reservationId);

        return doc.onSnapshot((docSnapshot) => {
          const { payment_status, pick_instructor_status, order_id } =
            docSnapshot.data();
          setOrderId(order_id);
          if (
            payment_status === "authorization_failed" ||
            payment_status === "payment_capture_failed"
          ) {
            // payment failure, money is not deducted from user, show error screen
            setcurrentTabIndex(4);
            setisPaymentProcessing(false);
          }
          if (pick_instructor_status === "success") {
            // payment success, money is deducted from user and instructor is assigned, show success screen
            setcurrentTabIndex(3);
            setisPaymentProcessing(false);
          }

          if (pick_instructor_status === "failure") {
            // payment success, money is deducted from user but instructor is not assigned, show reschedule screen
            setIsTimeSlotAvailable(false);
            setIsNextAllowed(false);
            setisPaymentProcessing(false);
            setselectedTimeSlot(null);
            setcurrentTabIndex(2);
          }
        });
      }
      return () => {};
    };

    const unsubscribe = orderReservationListener();
    return () => unsubscribe();
  }, [reservationId]);

  const rescheduleBlazeReservation = async () => {
    setisPaymentProcessing(true);
    setcurrentTabIndex(6);

    const _check = await checkPriorBookingSlots({
      date: date,
      timeslots: [selectedTimeSlot],
      grade: user?.grade,
      userid: user?.uid,
    });

    if (_check.length > 0) {
      const _orderData = await rescheduleBlazeReservationByUser({
        order_id: orderId,
        amount: amount,
        userId: user?.uid,
        grade: user?.grade,
        reservationId: reservationId,
        category: categorySelected,
        subject: subjectSelected,
        chapter: chapterSelected,
        date: date,
        timeslot: selectedTimeSlot,
      });

      if (_orderData.code === 200) {
        setcurrentTabIndex(3);
        setisPaymentProcessing(false);
        setIsTimeSlotAvailable(true);
      } else {
        setcurrentTabIndex(4);
        setisPaymentProcessing(false);
        setIsTimeSlotAvailable(true);
      }
    }
  };

  const initPayment = async () => {
    setisPaymentProcessing(true);
    if (currentTabIndex !== 2) setcurrentTabIndex(2);

    let _check = await checkPriorBookingSlots({
      date: date,
      timeslots: [selectedTimeSlot],
      grade: user?.grade,
      userid: user?.uid,
    });

    if (_check.length > 0) {
      let _orderData = await createBlazeOrder({
        userGrade: user.grade,
        userId: user?.uid,
        date: date,
        timeslot: selectedTimeSlot,
        category: categorySelected,
        subject: subjectSelected,
        chapter: chapterSelected,
      });

      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
        // RazorPay SDK Failed To Load
        console.error("RazorPay SDK Failed To Load");
      } else {
        let orderDescription = categorySelected;
        orderDescription +=
          subjectSelected === null ? "" : ` • ${subjectSelected}`;
        orderDescription +=
          chapterSelected === null ? "" : ` • ${chapterSelected}`;

        let paymentOptions = {
          key: "rzp_test_DtDgmVmIj5dm2Y",
          amount: _orderData.amount * 100, //in the smallest currency sub-unit.
          name: "PuStack Blaze",
          order_id: _orderData?.order_id, // Generate order_id using Orders API
          description: orderDescription,
          handler: function () {
            document.querySelector(".MuiDialog-root").style.display = "block";
            // setisPaymentProcessing(false);
            setcurrentTabIndex(6);
          },
          modal: {
            ondismiss: function () {
              document.querySelector(".MuiDialog-root").style.display = "block";
              setisPaymentProcessing(false);
              setcurrentTabIndex(4);
            },
          },
          prefill: {
            name: user?.name,
            contact: user?.phone_number,
            email: user?.email,
          },
          notes: {
            reservation_id: _orderData.reservation_id,
            user_id: user?.uid,
            user_grade: user?.grade,
            product_name: _orderData.product_name,
          },
        };

        console.info("242", paymentOptions);

        setReservationId(_orderData.reservation_id);
        setAmount(_orderData.amount * 100);

        let rzr_checkout = new window.Razorpay(paymentOptions);

        rzr_checkout.on("payment.failed", function (response) {
          // document.querySelector(".MuiDialog-root").style.display = "block";
          // setisPaymentProcessing(false);
          // setcurrentTabIndex(4);
          console.log({ payment: "failed" });
        });

        // Hide Modal Before Payment Starts
        document.querySelector(".MuiDialog-root").style.display = "none";
        rzr_checkout.open();
      }
    }
  };

  return (
    <div className="blaze__book__popup">
      <Dialog
        className={
          isDarkTheme
            ? "blaze__book__modal blaze__book__modal__dark"
            : "blaze__book__modal"
        }
        disableBackdropClick={currentTabIndex !== 3 && currentTabIndex !== 4}
        open={isOpen}
        onClose={handlePopupClose}
      >
        <div
          className="popup__title"
          style={{
            position: "relative",
            background: isDarkTheme ? "#141414" : "#FFFFFF",
          }}
        >
          <div
            className="popup-title-label"
            style={{ color: isDarkTheme ? "#FFFFFF" : "#891010" }}
          >
            {currentTabIndex < 3 ? "Book Your Session" : "Booking Status"}
          </div>

          {currentTabIndex > 0 && !isPaymentProcessing && currentTabIndex < 3 && (
            <div
              className="popup-back-button"
              style={{ position: "absolute", top: "1rem", left: ".5rem" }}
            >
              <ArrowBackIosIcon
                onClick={() => {
                  if (isTimeSlotAvailable && !differentDateSelection) {
                    setcurrentTabIndex(currentTabIndex - 1);
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
          {!isPaymentProcessing && (
            <div
              className="popup-close-button"
              style={{ position: "absolute", top: "1rem", right: ".5rem" }}
            >
              <CloseIcon
                onClick={() => {
                  const dontClosePopupindices = [2, 6];

                  if (dontClosePopupindices.includes(currentTabIndex)) {
                    setOpenWarningPopup(true);
                  } else {
                    handlePopupClose();
                  }
                }}
                style={{
                  cursor: "pointer",
                  height: "20px",
                }}
              />
            </div>
          )}
        </div>

        <SwipeableViews
          axis="x"
          index={currentTabIndex}
          scrolling={"false"}
          containerStyle={{
            background: isDarkTheme ? "#141414" : "var(--color-primary)",
          }}
          style={{
            background: isDarkTheme ? "#141414" : "var(--color-primary)",
          }}
          slideStyle={{
            background: isDarkTheme ? "#141414" : "var(--color-primary)",
          }}
          disabled={true}
          ignoreNativeScroll={true}
        >
          {/* Tab 1 */}
          <div
            className={
              isDarkTheme
                ? "blaze__popup__content dark"
                : "blaze__popup__content"
            }
            style={{
              background: isDarkTheme ? "#141414" : "#FFFFFF",
            }}
          >
            <div className="popup__category__picker">
              <BlazeCategorySelector
                forceUpdate={forceUpdate}
                isDark={isDarkTheme}
              />
            </div>
          </div>

          {/* Tab 2 */}
          <div
            className={
              isDarkTheme
                ? "blaze__popup__content dark"
                : "blaze__popup__content"
            }
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            <BlazeDatePicker
              changeDate={changeDate}
              date={date}
              setDateAccepted={setDateAccepted}
              isDarkTheme={isDarkTheme}
              sessionsAvailability={setIsSessionAvailable}
            />
          </div>

          {/* Tab 3 */}

          <div
            className={
              isDarkTheme
                ? "blaze__popup__content dark"
                : "blaze__popup__content"
            }
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            <BlazeTimePicker
              date={date}
              isDarkTheme={isDarkTheme}
              selectedTimeSlot={selectedTimeSlot}
              setselectedTimeSlot={(slot) => setselectedTimeSlot(slot)}
              isTimeSlotAvailable={isTimeSlotAvailable}
              currentTab={currentTabIndex}
            />
          </div>

          {/* Tab 4 */}
          <div
            className={
              isDarkTheme
                ? "blaze__popup__content dark"
                : "blaze__popup__content"
            }
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            {!isPaymentProcessing && (
              <div
                className={
                  isDarkTheme
                    ? "booking__info__wrapper dark"
                    : "booking__info__wrapper"
                }
              >
                <div className="booking__status__toolbar">
                  <div className="booking__status__text">
                    <h1>Blaze Session Booked</h1>
                  </div>
                  <div className="booking_status__lottie">
                    <Lottie
                      options={{ animationData: confirmedLottie, loop: false }}
                    />
                  </div>
                </div>

                <div className="booking__status__content">
                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Topic</h5>
                      <h3>
                        {chapterSelected !== null &&
                          chapterSelected !== "" &&
                          `${chapterSelected}`}

                        {(categorySelected === null ||
                          categorySelected === "") &&
                          (subjectSelected === "" ||
                            subjectSelected === null) &&
                          (chapterSelected === null ||
                            chapterSelected === "") &&
                          "."}
                      </h3>
                    </div>
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Date and Time</h5>
                      <h3>
                        {`${monthToStrFormat(
                          date?.getMonth()
                        )} ${date?.getDate()} `}{" "}
                        <span className="non-highlight"> at</span>{" "}
                        {`${hourToStrFormat(selectedTimeSlot)}`}{" "}
                      </h3>
                    </div>
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Duration</h5>
                      <h3>1 hour</h3>
                    </div>
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Amount Paid</h5>
                      <h3>₹ 1.00</h3>
                    </div>
                  </div>

                  <div className="booking__post__text">
                    <i className="fas fa-info-circle"></i>
                    <p>
                      Confirmation email will be sent to the email address
                      provided to PuStack soon.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab 5 */}
          <div
            className="blaze__popup__content"
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            {!isPaymentProcessing && (
              <div
                className={
                  isDarkTheme
                    ? "booking__info__wrapper dark"
                    : "booking__info__wrapper"
                }
              >
                <div className="booking__status__toolbar">
                  <div className="booking__status__text">
                    <h1>Transaction Failed</h1>
                  </div>
                  <div className="booking_status__lottie" id="failure-lottie">
                    <Lottie
                      options={{
                        animationData: failureLottie,
                        loop: false,
                      }}
                    />
                  </div>
                </div>

                <div className="booking__status__content">
                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Topic</h5>
                      <h3>
                        {chapterSelected !== null &&
                          chapterSelected !== "" &&
                          `${chapterSelected}`}

                        {(categorySelected === null ||
                          categorySelected === "") &&
                          (subjectSelected === "" ||
                            subjectSelected === null) &&
                          (chapterSelected === null ||
                            chapterSelected === "") &&
                          "."}
                      </h3>
                    </div>
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Date and Time</h5>
                      <h3>
                        {`${monthToStrFormat(
                          date?.getMonth()
                        )} ${date?.getDate()} `}{" "}
                        <span className="non-highlight"> at</span>{" "}
                        {`${hourToStrFormat(selectedTimeSlot)}`}{" "}
                      </h3>
                    </div>
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Duration</h5>
                      <h3>1 hour</h3>
                    </div>
                  </div>
                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Amount to be paid</h5>
                      <h3>₹ 1.00 </h3>
                    </div>
                  </div>

                  <div className="booking__post__text">
                    <i className="fas fa-info-circle"></i>
                    <p>
                      We were unable to get transaction details from your bank,
                      you can try opting for other payment options.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isPaymentProcessing && (
              <div
                className={
                  isDarkTheme
                    ? "booking__loader__wrapper dark"
                    : "booking__loader__wrapper"
                }
              >
                <CircularProgress thickness={4} />
                <h3>Hang on, booking your session</h3>
              </div>
            )}
          </div>

          {/* Tab 6 */}
          <div
            className="blaze__popup__content"
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            {!isPaymentProcessing && (
              <div
                className={
                  isDarkTheme
                    ? "booking__info__wrapper dark"
                    : "booking__info__wrapper"
                }
              >
                <div className="booking__status__toolbar">
                  <div className="booking__status__text">
                    <h1>Pending</h1>
                  </div>
                  <div className="booking_status__lottie">
                    <Lottie
                      options={{
                        animationData: warningLottie,
                        loop: false,
                      }}
                    />
                  </div>
                </div>

                <div className="booking__status__content">
                  <div className="booking__topic">
                    {subjectSelected !== "" &&
                      subjectSelected !== null &&
                      `• ${subjectSelected} `}
                    {chapterSelected !== null &&
                      chapterSelected !== "" &&
                      `• ${chapterSelected}`}

                    {(categorySelected === null || categorySelected === "") &&
                      (subjectSelected === "" || subjectSelected === null) &&
                      (chapterSelected === null || chapterSelected === "") &&
                      "."}
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat">
                      <h5>Date and Time</h5>
                      <h3>
                        {`${date?.getDate()} ${monthToStrFormat(
                          date?.getMonth()
                        )}`}
                        <span className="non-highlight"> at</span>{" "}
                        {`${hourToStrFormat(selectedTimeSlot)}`}{" "}
                      </h3>
                    </div>

                    <div className="booking__stat">
                      <h5>Duration</h5>
                      <h3>1 hour</h3>
                    </div>
                  </div>

                  <div className="booking__duration__row">
                    <div className="booking__stat" id="transaction__left">
                      <h5>Transaction ID</h5>
                      <h3>727e2b38d951ec9</h3>
                    </div>
                  </div>

                  <div className="booking__post__text">
                    <i className="fas fa-info-circle"></i>
                    <p>
                      Booking your session is taking longer than expected. Our
                      team is looking into this, we'll send you a confirmation
                      email soon!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab 7 */}
          <div>
            {isPaymentProcessing && (
              <div
                className={
                  isDarkTheme
                    ? "booking__loader__wrapper dark"
                    : "booking__loader__wrapper"
                }
              >
                <div className="circular__progress__lottie">
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                </div>
                <h3>{loadingText}</h3>
              </div>
            )}
          </div>
        </SwipeableViews>

        {currentTabIndex === 0 && (
          <div
            className="blaze__popup__action"
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            <button
              disabled={!isNextAllowed}
              onClick={() => setcurrentTabIndex(currentTabIndex + 1)}
              className={
                isDarkTheme
                  ? "blaze__popup__button dark"
                  : "blaze__popup__button"
              }
              aria-label="blaze__popup__button"
            >
              Pick a date
            </button>
          </div>
        )}
        {currentTabIndex === 1 && (
          <div
            className="blaze__popup__action"
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            <button
              disabled={!isSessionAvailable}
              onClick={() => {
                if (currentTabIndex === 1)
                  setcurrentTabIndex(currentTabIndex + 1);
                else if (currentTabIndex === 2) initPayment();
              }}
              className={
                isDarkTheme
                  ? "blaze__popup__button dark"
                  : "blaze__popup__button"
              }
              aria-label="blaze__popup__button"
            >
              Choose a time slot
            </button>
          </div>
        )}
        {currentTabIndex === 2 && (
          <div
            className="blaze__popup__action"
            style={{ background: isDarkTheme ? "#141414" : "#FFFFFF" }}
          >
            {!isTimeSlotAvailable ? (
              <>
                <button
                  disabled={!isNextAllowed}
                  onClick={rescheduleBlazeReservation}
                  className={
                    isDarkTheme
                      ? "blaze__popup__button dark"
                      : "blaze__popup__button"
                  }
                  aria-label="blaze__popup__button"
                >
                  {!isPaymentProcessing ? (
                    "Book"
                  ) : (
                    <div className="lds-ellipsis">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  )}
                </button>
                <button
                  className={
                    isDarkTheme
                      ? "blaze__popup__button select__date dark"
                      : "blaze__popup__button select__date"
                  }
                  onClick={() => {
                    setcurrentTabIndex(1);
                    setIsTimeSlotAvailable(true);
                    setselectedTimeSlot(null);
                    setDifferentDateSelection(true);
                  }}
                  aria-label="blaze__popup__button"
                >
                  Select different date
                </button>
              </>
            ) : (
              <button
                disabled={!isNextAllowed || isPaymentProcessing}
                onClick={() => {
                  if (currentTabIndex < 2) {
                    setcurrentTabIndex(currentTabIndex + 1);
                  } else if (currentTabIndex === 2) {
                    if (differentDateSelection) {
                      rescheduleBlazeReservation();
                    } else initPayment();
                  }
                }}
                className={
                  isDarkTheme
                    ? "blaze__popup__button dark"
                    : "blaze__popup__button"
                }
                aria-label="blaze__popup__button"
              >
                {!isPaymentProcessing ? (
                  "Proceed To Pay"
                ) : (
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                )}
              </button>
            )}
          </div>
        )}

        {currentTabIndex === 3 && (
          <div
            className={
              isDarkTheme
                ? "blaze__popup__action multi__buttons dark"
                : "blaze__popup__action multi__buttons"
            }
            style={{
              background: isDarkTheme ? "#141414" : "#FFFFFF",
            }}
          >
            <button
              onClick={() => {
                setcurrentTabIndex(currentTabIndex + 1);
              }}
              style={{ opacity: isPaymentProcessing ? 0 : 1 }}
              id="book_another"
              className={
                isDarkTheme
                  ? "blaze__popup__button dark"
                  : "blaze__popup__button"
              }
              aria-label="debug"
            >
              "Debug : See Failed Page"
            </button>

            <button
              disabled={!isNextAllowed}
              onClick={handlePopupClose}
              style={{ opacity: isPaymentProcessing ? 0 : 1 }}
              id="done"
              className="blaze__popup__button"
              aria-label="done"
            >
              Done
            </button>
          </div>
        )}

        {currentTabIndex === 4 && (
          <div
            className={
              isDarkTheme ? "blaze__popup__action dark" : "blaze__popup__action"
            }
            style={{
              background: isDarkTheme ? "#141414" : "#FFFFFF",
            }}
          >
            <button
              onClick={() => {
                handlePopupClose();
                handleTryAgain();
                setcurrentTabIndex(0);
              }}
              style={{ opacity: isPaymentProcessing ? 0 : 1 }}
              id="try-again"
              className="blaze__popup__button"
              aria-label="try-again"
            >
              Try again
            </button>
          </div>
        )}

        {currentTabIndex === 5 && (
          <div
            className={
              isDarkTheme
                ? "blaze__popup__action multi__buttons dark"
                : "blaze__popup__action multi__buttons"
            }
            style={{
              background: isDarkTheme ? "#141414" : "#FFFFFF",
            }}
          >
            <button
              onClick={() => {
                setcurrentTabIndex(currentTabIndex + 1);
              }}
              id="book_another"
              style={{ opacity: isPaymentProcessing ? 0 : 1 }}
              className="blaze__popup__button"
              aria-label="book-another"
            >
              Book another session
            </button>

            <button
              disabled={!isNextAllowed}
              style={{ opacity: isPaymentProcessing ? 0 : 1 }}
              onClick={handlePopupClose}
              id="done"
              className="blaze__popup__button"
              aria-label="done"
            >
              Done
            </button>
          </div>
        )}
      </Dialog>
      <Dialog
        className={
          isDarkTheme
            ? "blaze__book__modal blaze__book__modal__dark"
            : "blaze__book__modal"
        }
        disableBackdropClick={true}
        open={openWarningPopup}
        onClose={() => setOpenWarningPopup(false)}
      >
        <div className="blaze__cancel__booking__process">
          <h3>Do you really wish to cancel the ongoing process?</h3>
          <button onClick={handlePopUpsClose}>Yes</button>
          <button onClick={() => setOpenWarningPopup(false)}>No</button>
        </div>
      </Dialog>
    </div>
  );
}
