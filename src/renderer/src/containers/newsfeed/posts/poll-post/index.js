import React, { useState, useEffect, useContext, useRef } from "react";
import Snackbar from "@material-ui/core/Snackbar";

import {
  undoPollChoice,
  checkAnswersFromDb,
  addPollChoice,
} from "../../../../database";
import { UserContext } from "../../../../context";
import { futureformatTime } from "../../../../helpers";
import { futureTimeFormat } from "../../../../helpers/doubts_forum/utils";
import { db } from "../../../../firebase_config";
import "./style.scss";

const PollPost = ({ id, body }) => {
  const [user] = useContext(UserContext).user;
  const [isEnded, setIsEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [choiceVotes, setChoiceVotes] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [maxVotesOption, setMaxVotesOption] = useState(0);

  const [, setGettingUserChoice] = useState(true);

  const [myChoice, setmyChoice] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [, setisLessThan24Hours] = useState(false);
  const [, setisLessThan1Hours] = useState(false);

  const endCheck = () => {
    let _ended = body.end_ts > Date.now() ? false : true;

    if (!_ended) {
      setIsEnded(false);
    } else {
      setIsEnded(true);
    }
    calcTimeLeft(_ended);
  };

  const calcTimeLeft = (ended) => {
    let diff = body.end_ts - Date.now();

    let diff_as_date = new Date(diff);

    let hours = parseInt(diff / (1000 * 60 * 60));
    let minutes = parseInt((diff - hours * 1000 * 60 * 60) / (1000 * 60));
    let seconds = parseInt(
      (diff - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000
    );

    if (ended) {
      setTimeLeft("Poll has ended");
    } else {
      let [w, d, h, m, s] = futureTimeFormat(body.end_ts);

      if (d === 0) {
        setisLessThan24Hours(true);
      }
      if (h < 24) {
        setisLessThan1Hours(true);
      }
      if (d !== 0) {
        setTimeLeft(`${futureformatTime(body.end_ts)} left`);
      }

      if (d === 0 && h !== 0) {
        setTimeLeft(`${futureformatTime(body.end_ts)} left`);
      }

      if (d === 0 && m !== 0) {
        if (m > 59) {
          setTimeLeft(`${futureformatTime(body.end_ts)} left`);
        } else {
          let fiveMinutes = 60 * m;
          startTimer(fiveMinutes);
          setTimeLeft(`${m}:${s} left`);
        }
      }
    }
  };

  const undoVotes = async () => {
    if (!isUpdating) {
      let _votes = [];
      body.options.forEach((option) => {
        _votes.push(option.vote_count);
      });
      setChoiceVotes(_votes);
      setTotalVotes(totalVotes - 1);
      setIsAnswered(false);
      let _choices = choiceVotes;
      _choices[selectedIndex] = choiceVotes[selectedIndex] - 1;
      setChoiceVotes(_choices);
      setIsUpdating(true);
      await undoPollChoice(id, user.grade, selectedIndex, user.uid).then(() => {
        setIsUpdating(false);
      });
    } else {
      if (isAnswered && isEnded) {
        setIsSnackbarOpen(true);
      }
    }
  };

  useEffect(() => {
    let _votes = [];
    body.options.forEach((option) => {
      _votes.push(option.vote_count);
    });

    setChoiceVotes(_votes);

    setTotalVotes(_votes.reduce((a, b) => a + b, 0));

    endCheck();
    getSetMaxVotesOption();

    if (user) {
      checkAnswers();
      getMyChoice();
    }
  }, []);

  async function checkAnswers() {
    let _answer = await checkAnswersFromDb(id, user.grade, user.uid);

    if (_answer === null) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(_answer);
      setIsAnswered(true);
    }
  }

  const getSetMaxVotesOption = () => {
    let max_votes_local = 0;
    let max_votes_option_local = "";
    for (let i = 0; i < body.options.length; i++) {
      if (body.options[i].vote_count > max_votes_local) {
        max_votes_local = body.options[i].vote_count;

        max_votes_option_local = body.options[i].option;
      }
    }

    setMaxVotesOption(max_votes_option_local);
  };

  const getMyChoice = () => {
    db.collection("news_feed")
      .doc("content")
      .collection("news_feed_posts")
      .doc(id)
      .collection("votes")
      .doc(user.uid)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          setmyChoice(doc.data().options);
          setIsAnswered(true);
        } else {
          // doc.data() will be undefined in this case
        }

        setGettingUserChoice(false);
      });
  };

  function startTimer(duration) {
    let timer = duration,
      minutes,
      seconds;
    setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      //display.textContent = minutes + ":" + seconds;
      setTimeLeft(`${minutes}:${seconds} left`);

      if (--timer < 0) {
        timer = duration;
      }
    }, 1000);
  }

  return (
    <div>
      <div className="poll-post-container">
        <div className="poll-question">{body.question}</div>
        <div className="poll-choices-wrapper">
          {body.options.map((option, index) => {
            return (
              <Choice
                key={index}
                onClick={async () => {
                  if (!isEnded && !isAnswered && !isUpdating) {
                    let _choices = choiceVotes;
                    _choices[index] += 1;
                    setSelectedIndex(index);
                    setIsUpdating(true);

                    setChoiceVotes(_choices);
                    setTotalVotes(totalVotes + 1);
                    setIsAnswered(true);
                    await addPollChoice(id, user.grade, index, user.uid).then(
                      () => {
                        setIsUpdating(false);
                      }
                    );
                  } else {
                    if (!isAnswered && !isEnded) {
                      setIsSnackbarOpen(true);
                    }
                  }
                  if (user) getMyChoice();
                }}
                option={option.option}
                vote_count={isEnded || isAnswered ? choiceVotes[index] : null}
                index={index}
                total={totalVotes}
                isEnded={isEnded}
                isAnswered={isAnswered}
                maxVotesOption={isEnded || isAnswered ? maxVotesOption : ""}
                myChoice={myChoice}
                user={user}
              />
            );
          })}
        </div>

        <div className="poll-bottom-actions">
          <span className="poll-end-status">
            {totalVotes} votes • <p style={{ marginLeft: "4px" }}>{timeLeft}</p>
          </span>
          {isAnswered && !isEnded && (
            <div onClick={undoVotes} className="undo-button">
              Undo
            </div>
          )}
        </div>
      </div>

      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={isSnackbarOpen}
        autoHideDuration={1000}
        onClose={() => setIsSnackbarOpen(false)}
        message="Please Wait"
      />
    </div>
  );
};

const Choice = ({
  option,
  vote_count,
  total,
  onClick,
  isEnded,
  isAnswered,
  maxVotesOption,
  myChoice,
  index,
  user,
}) => {
  let progressValue;

  const pollOptionLabelRef = useRef();

  if (total > 0) {
    progressValue = (vote_count * 100) / total;
  } else {
    progressValue = 0;
  }

  return (
    <div onClick={onClick} className="pollChoice" style={{ flex: "1" }}>
      <div className="poll-option-details">
        <div
          className={
            isAnswered
              ? "pollChoice__optionLabelContainer"
              : isEnded
              ? "pollChoice__optionLabelContainer"
              : "pollChoice__optionLabelContainer pollChoice__optionLabelContainerHover"
          }
          style={{
            border:
              vote_count !== null
                ? "1px solid transparent"
                : "1px solid #0A66c2",
            borderRadius: vote_count !== null ? "0" : "30px",
            alignItems: vote_count !== null ? "flex-start" : "center",
          }}
        >
          <div
            ref={pollOptionLabelRef}
            style={{ width: `${progressValue.toFixed(1)}%` }}
            className="pollChoice__optionLabelBg"
          ></div>
          <div
            className="pollChoice__optionLabel"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <div className="poll-choice-option">{`${option}`}</div>

            {myChoice === index && (
              <img
                src={user.profile_url}
                style={{
                  height: "16px",
                  width: "16px",
                  marginLeft: "8px",
                  borderRadius: "20px",
                }}
              />
            )}
          </div>
        </div>
        {vote_count !== null && (
          <div className="poll-choice-votes">{progressValue.toFixed(1)} % </div>
        )}
      </div>
    </div>
  );
};

export default PollPost;
