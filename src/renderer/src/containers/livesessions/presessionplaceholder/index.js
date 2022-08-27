import React, {useState, useEffect, useContext, useMemo, useCallback} from "react";

import placeholder from "../../../assets/images/pustack_live_white_logo.png";

import "./style.scss";
import useTimer from "../../../hooks/timer";

export default function PreSessionPlaceHolder({ start_time }) {
  const [hours, sethours] = useState(0);
  const [minutes, setminutes] = useState(0);
  const [timer] = useTimer(60000);

  useEffect(() => {
    if(!start_time) return;
    if(timer) {
      let _hour = Math.abs(timer - start_time) / 36e5;
      let _minute = (_hour - Math.floor(_hour)) * 60;
      sethours(Math.floor(_hour));
      setminutes(Math.floor(_minute));
    }
  }, [timer, start_time])

  return (
    <div className="presession__placeholder">
      {timer && (
        <>
          <img src={placeholder} alt="PuStack Logo" className="placeholder__logo" />
          {start_time === null && (
            <div className="placeholder__content">
              <h2/>
              {hours > 0 && <div className="countdown__placeholder"> </div>}
              {hours === 0 && <div className="countdown__placeholder"> </div>}
            </div>
          )}
          {start_time !== null && start_time >= +timer ? (
            <>
              {hours < 24 && (
                <div className="placeholder__content">
                  <h2>Lecture starts within</h2>
                  {hours > 0 && (
                    <div className="countdown__placeholder">{`${hours} hour${
                      hours > 1 ? "s" : ""
                    } ${minutes} minute${minutes > 1 ? "s" : ""}`}</div>
                  )}
                  {hours === 0 && (
                    <div className="countdown__placeholder">{`${minutes} minute${
                      minutes > 1 ? "s" : ""
                    }`}</div>
                  )}
                </div>
              )}

              {hours >= 48 && (
                <div className="placeholder__content">
                  <h2>Lecture starts within</h2>

                  <div className="countdown__placeholder">{`${Math.floor(
                    hours / 24
                  )} days`}</div>
                </div>
              )}

              {hours < 48 && hours >= 24 && (
                <div className="placeholder__content">
                  <h2>Lecture starts in</h2>

                  <div className="countdown__placeholder">
                    <div> {`${Math.floor(hours / 24)} day`}</div>
                    {hours - 24 > 0 && (
                      <div>{`${hours - 24} hour${hours - 24 > 1 ? "s" : ""}`}</div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            start_time !== null && (
              <div className="placeholder__content">
                <h2>Lecture starts soon</h2>

                <div className="countdown__placeholder">
                  <div>Stay tuned!</div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
