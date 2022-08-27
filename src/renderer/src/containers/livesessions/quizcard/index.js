import React, { useEffect, useState, useRef, useContext } from "react";
import Confetti from "react-confetti";
import { TweenMax } from "gsap";
import { useMediaQuery } from "react-responsive";
import { putStudentChoice } from "../../../database";
import useWindowSize from "react-use/lib/useWindowSize";
import { LiveSessionPollShimmer } from "../../../components";
import QuizIcon from "../../../assets/images/quiz.svg";
import {
  LiveSessionContext,
  ThemeContext,
  UserContext,
} from "../../../context";
import "./style.scss";
import useTimer from "../../../hooks/timer";

export default function QuizCard() {
  const [, setInter] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentValue, setCurrentValue] = useState(null);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [timer] = useTimer(1000);
  // const [quizList, setQuizList] = useState([]);

  const [user] = useContext(UserContext).user;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [currentSession] = useContext(LiveSessionContext).current;
  const [isLive] = useContext(LiveSessionContext).live;
  const [currentCard, setCurrentCard] =
    useContext(LiveSessionContext).currentCard;
  const [currentSessionDetails] =
    useContext(LiveSessionContext).currentSessionDetails;
  const [playing] = useContext(LiveSessionContext).playing;

  const cardWrapperRef = useRef();

  const { width, height } = useWindowSize();

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  const handleAnswerChange = (value) => {
    setCurrentValue(value);
    setRevealAnswers(true);

    putStudentChoice({
      quiz_id: currentCard.id,
      reference: currentSession.reference,
      user_id: user?.uid,
      user_choice: currentValue,
    });
  };

  // useEffect(() => {
  //   let indianTime = +getIndianTime();

  //   const _quizList = [
  //     {
  //       quiz_id: 0,
  //       answer_index: 1,
  //       option_count: 3,
  //       deploy_ts: indianTime + 1000 * 15,
  //       dispose_ts: indianTime + 1000 * 40,
  //     },
  //     {
  //       quiz_id: 1,
  //       answer_index: 1,
  //       option_count: 3,
  //       deploy_ts: indianTime + 1000 * 685,
  //       dispose_ts: indianTime + 1000 * 725,
  //     },
  //   ];

  //   setQuizList(_quizList);
  // }, []);

  useEffect(() => {
    if (currentSession !== null && currentSessionDetails !== null) {
      const _quizList = currentSessionDetails?.quiz_list;

      if (_quizList === null) {
        return setCurrentCard(null);
      }

      if (_quizList !== null) {
        // Temporary options quizList
        let options = ["A", "B", "C", "D"];


        if (currentCard === null) {
          _quizList.map((item) => {
            if (
              item?.deploy_at <= +timer &&
              item?.dispose_at >= +timer
            ) {
              options.length = item?.option_count;

              const quizDuration = (item?.dispose_at - +timer) / 1000;
              setCurrentCard({ ...item, options, duration: quizDuration });

              setTimeout(() => {
                !isSmallScreen &&
                  TweenMax.to(cardWrapperRef.current, 0.5, { opacity: 0 });

                setTimeout(() => {
                  setCurrentCard(null);
                  setCurrentValue(null);
                  setRevealAnswers(false);

                  !isSmallScreen &&
                    TweenMax.to(cardWrapperRef.current, 0.5, { opacity: 1 });
                }, 500);
              }, quizDuration * 1000);
            }
          });
        }
      }
    }
  }, [currentSession, currentSessionDetails, timer]);

  // function countUp() {
  //   console.log('Quiz card timer -- ');
  //   setElapsedTime((elapsedTime) => elapsedTime + 1);
  // }
  //
  // useEffect(() => {
  //   let _interval = setInterval(() => countUp(), 1000);
  //   setInter(_interval);
  //
  //   return () => clearInterval(_interval);
  // }, []);

  return isSmallScreen ? (
    currentSessionDetails !== null && currentCard !== null && (
      <div className="quizSm fadeIn" style={{ opacity: !playing && 0 }}>
        {currentCard?.answer_index === currentValue && (
          <Confetti
            width={width}
            height={height - 58}
            tweenDuration={2000}
            run={true}
            recycle={false}
            style={{ zIndex: 999 }}
          />
        )}
        <div
          className="answer__feedback"
          style={{ opacity: revealAnswers ? 1 : 0 }}
        >
          {currentValue === currentCard.answer_index ? (
            "Yay! Your answer is correct!"
          ) : (
            <span>🙁 Oops! Your answer is incorrect.</span>
          )}
        </div>
        <div className="quiz__progress__wrapper">
          <div
            className="quiz__progress"
            style={{ animationDuration: `${currentCard?.duration}s` }}
          />
        </div>
        <div className="card__options">
          <div className="quiz__options">
            {currentCard?.options?.map((option, index) => {
              return (
                <button
                  key={index}
                  disabled={currentValue !== null}
                  onClick={() => handleAnswerChange(index)}
                  className={
                    currentValue !== null && index === currentCard.answer_index
                      ? "quiz__option correct"
                      : index === currentValue
                      ? "quiz__option wrong"
                      : `quiz__option ${revealAnswers && "no__borders"}`
                  }
                >
                  <div className="option__value">{option}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )
  ) : currentSessionDetails === null ? (
    <LiveSessionPollShimmer isDarkMode={isSmallScreen ? true : isDarkMode} />
  ) : (
    <div ref={cardWrapperRef}>
      {(currentCard === null || !playing) && (
        <div className="no__quiz__lottie" style={{backgroundColor: isDarkMode ? '#181818' : 'white'}}>
          <img width={"50%"} src={QuizIcon} alt="Quiz Icon" draggable={false} />
          {isLive ? (
            <>
              <div className="no__quiz__lottie__text">
                Quiz will appear here.
              </div>
              <div className="no__quiz__lottie__text second__text">
                All the best!
              </div>
            </>
          ) : (
            <div className="no__quiz__lottie__text">
              Quiz will appear in live sessions.
            </div>
          )}
        </div>
      )}

      {currentCard !== null && playing && (
        <div
          className="quiz__card fadeIn"
          style={{ opacity: !playing && 0}}
          key={currentCard?.quiz_id}
        >
          <div className="quiz__progress__wrapper">
            <div
              className="quiz__progress"
              style={{ animationDuration: `${currentCard?.duration}s` }}
            />
          </div>

          <div
            className="answer__feedback"
            style={{ opacity: revealAnswers ? 1 : 0 }}
          >
            {currentValue === currentCard.answer_index ? (
              "Yay! Your answer is correct!"
            ) : (
              <span>🙁 Oops! Your answer is incorrect.</span>
            )}
          </div>

          <div className="quiz__content">
            {currentCard?.answer_index === currentValue && (
              <Confetti
                width={width}
                height={height}
                tweenDuration={2000}
                run={true}
                recycle={false}
                confettiSource={{ x: 256, y: 0, w: 50, h: 50 }}
              />
            )}

            <div className="card__options">
              <div className="quiz__options">
                {currentCard?.options?.map((option, index) => {
                  return (
                    <button
                      key={index}
                      disabled={currentValue !== null}
                      onClick={() => handleAnswerChange(index)}
                      className={
                        currentValue !== null &&
                        index === currentCard?.answer_index
                          ? "quiz__option correct"
                          : index === currentValue
                          ? "quiz__option wrong"
                          : "quiz__option"
                      }
                    >
                      <div className="option__value">{option}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
