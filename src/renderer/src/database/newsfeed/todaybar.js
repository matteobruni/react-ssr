import { fetchSessions } from "../index";
import { getIndianTime } from "../../helpers";

/**
 * @deprecated
 * @param grade
 * @returns {Promise<null|*[]>}
 */
export const fetchSessionsToday = async ({ grade }) => {
  let [_sessions] = await fetchSessions(grade);

  _sessions = _sessions.sort((a, b) => a?.air_time?.hour - b?.air_time?.hour);

  let _refactored = [];

  for (let i = 0; i < _sessions?.length; i++) {
    let _tempList = [];
    let _current = _sessions[i].session_event_list;

    for (let j = 0; j < _current?.length; j++) {
      if (
        _current[j].start_ts.getTime() + _current[j].duration * 60 * 1000 <
        getIndianTime().getTime()
      ) {
      } else {
        _tempList.push(_current[j]);
      }
    }

    _refactored.push({
      date: _sessions[i].date,
      session_event_list: _tempList,
    });

    // A Max Of 6 Sessions Should Be Shown
    if (_refactored.length === 6) break;
  }

  if (_refactored.length === 0) return null;

  return _refactored;
};
