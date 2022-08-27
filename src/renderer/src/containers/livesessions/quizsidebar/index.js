import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import "./style.scss";
import {LiveSessionCreateQuizCard, LiveSessionQuizCardInstructor} from "../quizcard/quizcard-instructor";
import {LiveSessionContext, ThemeContext, UserContext} from "../../../context";
import {getDateFromHash} from "../../../database/livesessions/sessions";
import {useMediaQuery} from "react-responsive";
import Lottie from "lottie-react-web";
import waitingLottie from "../../../assets/lottie/waiting.json";
import {ModalContext} from "../../../context/global/ModalContext";
import {LiveSessionQuizCard} from "../../index";
import {LiveSessionPollShimmer} from "../../../components";

export default function QuizSidebar({isCreator}) {
  const [curSession] = useContext(LiveSessionContext).current;
  const [,setModalData] = useContext(ModalContext).state;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [quizList, setQuizList] = useState(null);
  const isMobileScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const isSmallScreen = useMediaQuery({ query: "(max-width: 900px)" });
  const [currentSessionDetails] =
    useContext(LiveSessionContext).currentSessionDetails;
  const [isDark] = useContext(ThemeContext).theme;

  const sessionStartTime = useMemo(() => {
    if(!curSession || !curSession?.air_time) return null;
    return getDateFromHash(curSession.air_time);
  }, [curSession]);

  const quizSlots = useMemo(() => {
    if(!quizList) return null;
    return quizList.map(quizItem => ({start: quizItem.deploy_at, end: quizItem.dispose_at}));
  }, [quizList]);

  useEffect(() => {
    let unsubscribe = curSession?.reference
      .onSnapshot((snapshot) => {
        if(snapshot.exists) {
          // Sorting by the start time of the quiz
          let sortedList = snapshot.data().quiz_list?.sort((a, b) => {
            if(a.deploy_at < b.deploy_at) return -1;
            if(a.deploy_at > b.deploy_at) return 1;
            return 0;
          })
          setQuizList(sortedList || null);
        }
      });

    return () => {
      if(typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [curSession]);

  return (
    <div className="quiz__sidebar">
      {currentSessionDetails === null && (
        <LiveSessionPollShimmer isDarkMode={isMobileScreen ? true : isDark} />
      )}
      {isSmallScreen && (isCreator ?? isInstructor) && currentSessionDetails !== null &&
      <div
        className={"quiz__card create fadeIn not-expanded"}
        style={{ opacity: 1, margin: '0 auto 10px' }}
        onClick={() => {
          setModalData({
            open: true,
            Children: (
              <LiveSessionCreateQuizCard
                expand={true}
                curSession={curSession}
                sessionStartTime={sessionStartTime}
                quizItem={null}
                editor={true}
                quizSlots={quizSlots}
                label={"Create Quiz Card"}
              />
            )
          })
        }}
      >
        <div className="quiz__content" style={{height: '45px', overflow: 'hidden'}}>
          <div className="card__options">
            <div className="quiz__options" style={{paddingBottom: 0, paddingTop: 0}}>
              <button
                disabled={false}
                className="quiz__option save"
                onClick={() => {}}
                tabIndex={7}
                style={{gridColumn: '1 / 3'}}
              >
                <div className="option__value" style={{height: '30px'}}>
                    <p>Create Quiz</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>}
      { currentSessionDetails !== null &&
        <div className="quiz__sidebar__scrollable">
          {/*<LiveSessionQuizCard />*/}
          {!(isCreator ?? isInstructor) && <LiveSessionQuizCard />}
          {!isSmallScreen && (isCreator ?? isInstructor) && <LiveSessionCreateQuizCard
            curSession={curSession}
            sessionStartTime={sessionStartTime}
            quizItem={null}
            editor={true}
            quizSlots={quizSlots}
            label={"Create Quiz Card"}
          />}
          {quizList && (isCreator ?? isInstructor) && quizList.map((quizItem, index) => (
            <LiveSessionQuizCardInstructor
              key={quizItem.quiz_id}
              curSession={curSession}
              sessionStartTime={sessionStartTime}
              quizItem={quizItem}
              label={'Quiz Card ' + (index + 1)}
            />
          ))}
        </div>
      }
    </div>
  );
}
