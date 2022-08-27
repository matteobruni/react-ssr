import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {firestore} from "firebase";
import {ThemeContext} from "../../../../context";
import {db} from "../../../../firebase_config";
import waitingLottie from '../../../../assets/lottie/waiting.json';
import Lottie from "lottie-react-web";
import {showSnackbar} from "../../../../helpers";
import {useMediaQuery} from "react-responsive";
import {toIndianTimeZone} from "../../../../helpers/functions/getIndianTime";

const parseTime = (timeStr) => {
  if(timeStr.split(':').length !== 3) throw new Error('Time should be in form of hh:mm:ss');
  const [hour, minute, second] = timeStr.split(':');
  return {hour: +hour, minute: +minute, second: +second};
}

const addTimeStrToDate = (date1, timeStr) => {
  if(!(date1 instanceof Date)) throw new Error('First parameter expects to be a Date Object');
  const timeObj = parseTime(timeStr);
  let date = new Date(date1);
  date.setHours(date.getHours() + timeObj.hour);
  date.setMinutes(date.getMinutes() + timeObj.minute);
  date.setSeconds(date.getSeconds() + timeObj.second);
  return date;
}

const formatInTwoDigits = (...args) => {
  let str = '';
  args.forEach(num => {
    if (isNaN(num)) {
      str += num;
      return;
    }
    str += +num >= 10 ? +num : '0' + +num
  })
  return str;
}

const timeDiffDateToStr = (start, end) => {
  if(!(start instanceof Date) || !(end instanceof Date)) throw new Error('Both Parameter expects to be a Date Object');
  let diffInSeconds = Math.floor((end - start) / 1000);
  let str = '';
  let hour = diffInSeconds / 3600;
  let minute = diffInSeconds / 60;
  if(hour < 1) {
    str += '00';
  } else {
    minute %= 60;
    str += formatInTwoDigits(Math.floor(hour));
  }

  if(minute < 1) {
    str += ':00:';
  } else {
    str += ':' + formatInTwoDigits(Math.floor(minute)) + ':'
  }

  str += formatInTwoDigits(Math.floor(diffInSeconds % 60))

  return str;
}

const isValidTimeString = (str) => {
  let arr = str.split(':');
  if(arr.length !== 3) return false;
  let [hour, min, sec] = arr;
  function isValidTime(time) {
    if(isNaN(time)) return false;
    return +time < 60 && +time >= 0;
  }
  return isValidTime(hour) && isValidTime(min) && isValidTime(sec);
}

const timeStrToLabel = (str) => {
  let timeObj = parseTime(str);

  function getLabel(time, label) {
    if(time <= 0) return '';
    return time + '' + label; // + (time > 1 ? 's' : '');
  }

  let secondLabel = getLabel(timeObj.second, ' sec');
  let minuteLabel = getLabel(timeObj.minute, secondLabel.length > 0 || timeObj.hour > 0 ? 'm ' : ' min ')

  return getLabel(timeObj.hour, 'h ') + minuteLabel + getLabel(timeObj.second, timeObj.minute > 0 || timeObj.hour > 0 ? 's' : ' sec')
}

export const LiveSessionQuizCardInstructor = ({sessionStartTime, curSession, quizItem, label}) => {
  const [endTime] = useState(() => {
    if (!quizItem?.dispose_at || !quizItem?.deploy_at) return null;
    return timeDiffDateToStr(sessionStartTime, toIndianTimeZone(quizItem.dispose_at));
  });
  const [startTime] = useState(() => {
    if (!quizItem?.deploy_at) return "00:00:00";
    return timeDiffDateToStr(sessionStartTime, toIndianTimeZone(quizItem.deploy_at));
  });
  const [isDarkMode] = useContext(ThemeContext).theme;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const [deleting, setDeleting] = useState(false);
  const [votes, setVotes] = useState([]);
  const lottieRef = useRef(null);

  const votingPerc = useMemo(() => {
    return votes.reduce((acc, val) => {
      let key = Object.keys(val)[0];
      acc[val[key]].count += 1;
      acc[val[key]].perc = ((acc[val[key]].count / votes.length) * 100).toFixed(0);
      return acc
    }, {0: {count: 0, perc: 0}, 1: {count: 0, perc: 0}, 2: {count: 0, perc: 0}, 3: {count: 0, perc: 0}})
  }, [votes]);

  useEffect(() => {

    let unsubscribe = curSession?.reference
      .collection('in_session_cards')
      .doc(quizItem.quiz_id)
      .collection('votes')
      .doc('array')
      .onSnapshot(snapshot => {
        if(snapshot.exists) {
          setVotes(snapshot.data().uid_option_map_array);
        }
      });

    return () => {
      if(typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [curSession, quizItem])

  useEffect(() => {
    if(lottieRef?.current) {
      lottieRef.current.pause();
    }
  }, [lottieRef])

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await db
        .collection('live_session')
        .doc(curSession.grade.id)
        .collection('sessions')
        .doc(curSession.session_id)
        .set({
          quiz_list: firestore.FieldValue.arrayRemove(quizItem)
        }, {merge: true});

      console.log('Deleted');
    } catch (e) {
      console.error(e);
    }
    setDeleting(false);
  }

  return (
    <div
      className={"quiz__card fadeIn" + (isDarkMode ? ' dark' : '')}
      style={{
        opacity: 1,
        pointerEvents: deleting ? 'none' : 'auto',
        backgroundColor: isDarkMode || isSmallScreen ? '#2D3439' : '#EEF8FF'
      }}
    >
      <div className="quiz__card--close" onClick={handleDelete}>
        <svg height="28" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg">
          <g id="Layer_2" data-name="Layer 2">
            <path d="m12 1a11 11 0 1 0 11 11 11.013 11.013 0 0 0 -11-11zm4.242 13.829a1 1 0 1 1 -1.414 1.414l-2.828-2.829-2.828 2.829a1 1 0 0 1 -1.414-1.414l2.828-2.829-2.828-2.829a1 1 0 1 1 1.414-1.414l2.828 2.829 2.828-2.829a1 1 0 1 1 1.414 1.414l-2.828 2.829z"/>
          </g>
        </svg>
      </div>
      <div className="quiz__content">
        <div className="quiz__content--title">
          <h2>{label || 'Quiz Card'}</h2>
        </div>
        <div className="card__options">
          <div className="quiz__options">
            <div className="quiz__option timeEditor noPadding">
              <div className="quiz__option__label">Start Time</div>
              <input type="text" value={startTime} disabled={true} style={{fontSize: '14px'}}/>
            </div>
            <div className="quiz__option timeEditor noPadding">
              <div className="quiz__option__label">End Time</div>
              <input type="text" value={endTime} disabled={true} style={{fontSize: '14px'}}/>
            </div>
            {['A', 'B', 'C', 'D'].map((option, index) => {
              return (
                <button
                  key={index}
                  disabled={false}
                  className={"quiz__option" + (quizItem?.answer_index === index ? ' correct-instructor' : ' wrong-instructor')}
                >
                  <div className="option__value">
                    <div className="value">{option}</div>
                    <span className="perc">{votingPerc[index]?.perc}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const LiveSessionCreateQuizCard = ({sessionStartTime, expand, curSession, quizItem, label, quizSlots}) => {
  const endTimeRef = useRef(null);
  const startTimeRef = useRef(null);
  const [endTime, setEndTime] = useState(() => {
    if (!quizItem?.dispose_at || !quizItem?.deploy_at) return "00:00:00";
    return timeDiffDateToStr(new Date(quizItem.deploy_at), new Date(quizItem.dispose_at));
  });
  const [startTime, setStartTime] = useState(() => {
    if (!quizItem?.deploy_at) return "00:00:00";
    return timeDiffDateToStr(sessionStartTime, new Date(quizItem.deploy_at));
  });
  const [answerIndex, setAnswerIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(expand || false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const [isDark] = useContext(ThemeContext).theme;

  const reset = useCallback(() => {
    setEndTime("00:00:00");
    setStartTime("00:00:00");
    setAnswerIndex(null);
  }, []);

  const isBetweenSlots = useCallback((time) => quizSlots && quizSlots.some(c => (c.start < time) && (time < c.end)), [quizSlots])

  const isInTheSlots = useCallback((start, end) => {
    if(isBetweenSlots(start) || isBetweenSlots(end)) return true;
    console.log('quizSlots, start, end - ', quizSlots, start.valueOf(), end.valueOf());
    return quizSlots && quizSlots.some(c => (((start < c.start) && (c.start < end)) || ((start.valueOf() === c.start) && (end.valueOf() === c.end))));
  }, [isBetweenSlots, quizSlots]);

  const handleSave = async () => {
    if(!expanded) {
      setExpanded(true);
      return;
    }
    if(!curSession) return;
    if(!sessionStartTime) return;
    try {
      if(!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
        showSnackbar('Please select valid time', 'error');
        return;
      }
      if(startTime >= endTime) {
        showSnackbar('Start time must be less than End time.', 'error');
        return;
      }
      let endTimeSplits = endTime.split(':');
      let isEndTimeOverflowTheSession = (+endTimeSplits[0] * 60) + (+endTimeSplits[1]) + (+endTimeSplits[2] / 60) > curSession.session_length;
      console.log(endTimeSplits, (+endTimeSplits[0] * 60) + (+endTimeSplits[1]) + (+endTimeSplits[2] / 60), curSession.session_length);
      if(isEndTimeOverflowTheSession) {
        showSnackbar('Quiz card time cannot exceed the session length', 'error');
        return;
      }
      const deploy_at = addTimeStrToDate(sessionStartTime, startTime);
      const dispose_at = addTimeStrToDate(sessionStartTime, endTime);
      if(isInTheSlots(deploy_at, dispose_at)) {
        showSnackbar('Your time slots are conflicting with the other quiz card slots.', 'error');
        return;
      }
      if(![0,1,2,3].includes(answerIndex)) {
        showSnackbar('Please select an answer.', 'error');
        return;
      }
      // return;
      setSaving(true);
      const docRef = db.collection('live_session').doc();
      const obj = {
        answer_index: answerIndex,
        deploy_at: deploy_at.valueOf(),
        dispose_at: dispose_at.valueOf(),
        option_count: 4,
        // start_time: startTime,
        // endTime,
        quiz_id: docRef.id
      };
      await db
        .collection('live_session')
        .doc(curSession.grade.id)
        .collection('sessions')
        .doc(curSession.session_id)
        .set({
          quiz_list: firestore.FieldValue.arrayUnion(obj)
        }, {merge: true});

      reset();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
    setSaving(false);
  }

  const handleSelection = (e) => {
    const el = e.target;
    let [h, m, s] = el.value.split(':');
    let dataSet = [{start: 0, end: h.length}, {start: h.length + 1, end: h.length + 1 + m.length}, {start: h.length + 1 + m.length + 1, end: h.length + 1 + m.length + 1 + s.length}];
    const curSelection = dataSet.find(c => (c.start <= el.selectionStart) && (c.end >= el.selectionStart));
    el.setSelectionRange(curSelection.start, curSelection.end, 'forward');
  }

  const handleBlur = (e, setter) => {
    let [h, m, s] = e.target.value.split(':');
    let str = formatInTwoDigits(h, ':', m, ':', s)
    setter(str);
  }

  const onChange = e => {
    let [h, m, s] = e.target.value.split(':');
    let dataSet = [{start: 0, end: h.length}, {start: h.length + 1, end: h.length + 1 + m.length}, {start: h.length + 1 + m.length + 1, end: h.length + 1 + m.length + 1 + s.length}];
    if(e.target.selectionStart === dataSet[2].start + 2 && e.target.selectionEnd === dataSet[2].start + 2) {
      if(+s >= 60) {
        e.target.setSelectionRange(dataSet[2].start, dataSet[2].end, 'forward');
        showSnackbar('Select valid time range 0-59.', 'error');
        return;
      }
      endTimeRef.current.focus();
      return;
    }
    if([dataSet[0].start + 2,dataSet[1].start + 2].includes(e.target.selectionStart)) {
      let curSelection = dataSet.findIndex(c => (c.start <= e.target.selectionStart) && (c.end >= e.target.selectionStart));
      let val = e.target.value.split(':')[curSelection];
      if(+val >= 60) {
        e.target.setSelectionRange(dataSet[curSelection].start, dataSet[curSelection].end, 'forward');
        showSnackbar('Select valid time.', 'error');
        return;
      }
      e.target.setSelectionRange(dataSet[curSelection + 1].start, dataSet[curSelection + 1].end, 'forward');
    }
  }

  function onKeyDownTimeEditor(e) {
    console.log(e.key);
    // if(e.key === 'Backspace' || e.key === 'Delete') {
    //   e.preventDefault();
    // }
    if(e.key === 'Delete') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Tab' || e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Shift") {
      const el = e.target;
      let [h, m, s] = el.value.split(':');
      let dataSet = [{start: 0, end: h.length}, {start: h.length + 1, end: h.length + 1 + m.length}, {start: h.length + 1 + m.length + 1, end: h.length + 1 + m.length + 1 + s.length}];
      let curSelection = dataSet.findIndex(c => (c.start <= el.selectionStart) && (c.end >= el.selectionStart));
      if(e.key === 'Tab' && !e.shiftKey && el.selectionStart >= dataSet[2].start) {
        return;
      }
      e.preventDefault();
      if(e.key === 'ArrowLeft' || (e.shiftKey && e.key === 'Tab')) {
        curSelection -= 1;
        if(curSelection < 0) {
          curSelection = 2;
        }
      } else
      if(e.key === 'ArrowRight' || e.key === 'Tab') {
        curSelection += 1;
        if(curSelection >= 3) {
          curSelection = 0;
        }
      }
      el.setSelectionRange(dataSet[curSelection].start, dataSet[curSelection].end, 'forward');
    } else if (e.target.selectionStart === e.target.selectionEnd) {
      const el = e.target;
      let [h, m, s] = el.value.split(':');
      let dataSet = [{start: 0, end: h.length}, {start: h.length + 1, end: h.length + 1 + m.length}, {start: h.length + 1 + m.length + 1, end: h.length + 1 + m.length + 1 + s.length}];
      let curSelection = dataSet.findIndex(c => (c.start <= el.selectionStart) && (c.end >= el.selectionStart));
      if(dataSet[curSelection].end - dataSet[curSelection].start === 1 || (dataSet[curSelection].end - dataSet[curSelection].start === 0 && e.key !== 'Backspace')) {
        return;
      }
      e.preventDefault();
      el.setSelectionRange(dataSet[curSelection].start, dataSet[curSelection].end, 'forward');
    }
    if (isNaN(+e.key)) {
      e.preventDefault();
    }
  }

  return (
    <div
      className={"quiz__card create fadeIn" + (expanded ? '' : ' not-expanded')}
      style={{ opacity: 1, backgroundColor: isDark || isSmallScreen ? '#29282B' : 'white' }}
    >
      {expanded && !expand && <div className="quiz__card--close" onClick={() => {
        setExpanded(false);
      }}>
        <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="m12 1a11 11 0 1 0 11 11 11.013 11.013 0 0 0 -11-11zm4.242 13.829a1 1 0 1 1 -1.414 1.414l-2.828-2.829-2.828 2.829a1 1 0 0 1 -1.414-1.414l2.828-2.829-2.828-2.829a1 1 0 1 1 1.414-1.414l2.828 2.829 2.828-2.829a1 1 0 1 1 1.414 1.414l-2.828 2.829z"/>
          </g>
        </svg>
      </div>}
      <div className={"quiz__content" + (isSmallScreen ? ' dark' : '')} style={{height: expanded ? '292px' : '45px', overflow: 'hidden'}}>
        {/*style={{height: '81px'}}*/}
        {expanded && <div className="quiz__content--title">
          <h2>{label || 'Quiz Card'}</h2>
        </div>}
        <div className="card__options">
          <div className="quiz__options" style={{paddingBottom: expanded ? '20px' : 0, paddingTop: expanded ? '20px' : 0}}>
            {expanded && (
              <>
                <div className="quiz__option timeEditor noPadding">
                  <div className="quiz__option__label">Start Time</div>
                  <input ref={startTimeRef} tabIndex={1} className="quiz__option" type="text" value={startTime} onChange={e => {
                    setStartTime(e.target.value);
                    onChange(e);
                  }} onClick={handleSelection} onFocus={handleSelection} onBlur={e => handleBlur(e, setStartTime)} onKeyDown={onKeyDownTimeEditor}/>
                </div>
                <div className="quiz__option timeEditor noPadding">
                  <div className="quiz__option__label">End Time</div>
                  <input ref={endTimeRef} onFocus={handleSelection} tabIndex={2} className="quiz__option" type="text" value={endTime} onChange={e => {
                    setEndTime(e.target.value);
                    onChange(e);
                  }} onClick={handleSelection} onBlur={e => handleBlur(e, setEndTime)} onKeyDown={onKeyDownTimeEditor}/>
                </div>
                {['A', 'B', 'C', 'D'].map((option, index) => {
                  return (
                    <button
                      key={index}
                      disabled={false}
                      tabIndex={2 + index + 1}
                      onClick={() => {
                        setAnswerIndex(index)
                      }}
                      className={"quiz__option" + (answerIndex === index ? ' correct-instructor' : '')}
                    >
                      <div className="option__value">{option}</div>
                    </button>
                  );
                })}
              </>
            )}
            <button
              disabled={saving}
              className="quiz__option save"
              onClick={handleSave}
              tabIndex={7}
              style={{gridColumn: '1 / 3'}}
            >
              <div className="option__value" style={{height: '30px'}}>
                {saving ? <Lottie
                  style={{width: '40px', transform: 'scale(3)', marginBottom: '5px'}}
                  options={{animationData: waitingLottie, loop: true}}
                /> :
                  <p>Create Quiz</p>
                }
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
