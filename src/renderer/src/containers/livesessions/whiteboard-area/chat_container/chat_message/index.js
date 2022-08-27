import UserImage from "../../../../../assets/images/userMenu/customer_service.svg";
import React, {useEffect, useMemo, useState} from "react";
import useToday from "../../../../../hooks/today";
import {fetchIndianTime} from "../../../../../helpers";

const formatAMPM = (date) => {
  if(!date || !(date instanceof Date)) return;
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, '0');
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export default function ChatMessage({messages, time, obj}) {
  const today = useToday(messages);

  const timeToDisplay = useMemo(() => {
    // If time else today {as it is async} till then we show current device date.
    if(!time) {
      // console.log(messages);
      console.log('obj - ', obj)
      obj.setTime(today ?? new Date());
    }
    return formatAMPM(time ? new Date(time) : today ?? new Date());
  }, [time, today]);

  return (
    <div className={"chat_message" + (obj.isInstructor === '1' ? ' is_instructor' : '')}>
      <div className="chat_message-header">
        <img src={messages[0].image ?? UserImage} width={25} height={25} alt=""/>
        <div className="chat_message-metadata">
          <span className="chat_message-metadata-title">
            <span className="text-ellipsis">{messages[0].name ?? 'User name'}</span>
            {obj.isInstructor === '1' && <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 409.6 409.6"
              width={15}
              height={15}
              style={{
                enableBackground: "new 0 0 409.6 409.6",
              }}
              xmlSpace="preserve"
            >
              <path
                d="M204.8 20.48c-11.315 0-20.48 9.165-20.48 20.48 0 11.315 9.165 20.48 20.48 20.48s20.48-9.165 20.48-20.48c0-11.315-9.165-20.48-20.48-20.48zM40.96 348.16h327.68v40.96H40.96zM349.082 147.098c12.595 7.168 21.146 20.531 21.146 36.045 0 22.989-18.637 41.626-41.626 41.626-15.462 0-28.518-8.704-35.686-21.248 8.192-2.662 14.234-10.138 14.234-19.2 0-11.315-9.165-20.48-20.48-20.48s-20.48 9.165-20.48 20.48c0 8.653 5.427 15.974 13.056 18.995-4.096 1.382-8.448 2.202-13.056 2.202-22.989 0-41.626-18.637-41.626-41.626 0-19.712 13.722-36.096 32.051-40.448L204.8 61.44l-51.866 61.952c18.381 4.352 32.051 20.736 32.051 40.448 0 22.989-18.637 41.626-41.626 41.626-4.557 0-8.96-.819-13.056-2.202 7.629-2.97 13.056-10.291 13.056-18.995 0-11.315-9.165-20.48-20.48-20.48-11.315 0-20.48 9.165-20.48 20.48 0 9.114 6.042 16.538 14.234 19.2-7.168 12.544-20.224 21.248-35.686 21.248-22.989 0-41.626-18.637-41.626-41.626 0-15.514 8.602-28.877 21.146-36.045L0 122.88 40.96 307.2h327.68l40.96-184.32-60.518 24.218zM204.8 286.72l-41.062-41.062 41.062-41.062 41.062 41.062L204.8 286.72z"/>
            </svg>}
          </span>
          <span className="chat_message-metadata-time">{timeToDisplay}</span>
        </div>
      </div>
      <div className={"chat_message-content"}>
        {messages.map(({text, id}) => (
          <p key={id}>{text ?? ''}</p>
        ))}
      </div>
    </div>
  )
}
