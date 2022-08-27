import { db } from "../../firebase_config";
import {fetchIndianTime} from "../../helpers";

const getDateFromHash = (data) => {
  return new Date(data.year, data.month - 1, data.day, data.hour, data.minute);
};

export const listenForLiveSessions = async ({ grade, callback, isUserPro }) => {
  let today = await fetchIndianTime();

  let month = `${today.getFullYear()}_${today.getMonth() + 1}`; // 2021_6

  await db
    .collection("live_session")
    .doc(grade)
    .collection("calendar_events")
    .doc("calendar_events")
    .collection(month)
    .doc(`${month}_${today.getDate()}`) // 2021_6_5
    .get()
    .then(async (snapshot) => {
      // If any sessions exist for today
      if (snapshot.exists) {
        let _data = snapshot.data();

        // If any sessions exist for today in this document
        if (_data["session_event_list"]?.length > 0) {
          // Get a reference to list
          let _list = _data["session_event_list"];

          for (let iterator = 0; iterator < _list?.length; iterator++) {
            let _session = _list[iterator];

            if (
              _session?.session_status === "live" &&
              today.getTime() >
                getDateFromHash(_session?.air_time).getTime() &&
              (_session?.access_tier === "Free" || isUserPro)
            ) {
              let _sessionID = _session?.live_session_id;

              let _current = await db
                .collection("live_session")
                .doc(grade)
                .collection("sessions")
                .doc(_sessionID)
                .get()
                .then((e) => {
                  let _data = e.data();

                  return _data;
                });

              callback(
                _sessionID,
                _current.video_key,
                getDateFromHash(_session.air_time)
              );
              return;
            }
          }
          callback(null, null, null);
        } else {
          callback(null, null, null);
        }
      } else {
        callback(null, null, null);
      }
    });
};

export const listenForTodayLiveSessions = async ({ grade, isUserPro, callback }) => {
  let today = await fetchIndianTime();
  let month = `${today.getFullYear()}_${today.getMonth() + 1}`;

  return db.collection("live_session")
    .doc(grade)
    .collection("calendar_events")
    .doc("calendar_events")
    .collection(month)
    .doc(`${month}_${today.getDate()}`)
    .onSnapshot(async (snapshot) => {
      // If any sessions exist for today
      if (snapshot.exists) {
        let _data = snapshot.data();

        // If any sessions exist for today in this document
        if (_data["session_event_list"]?.length > 0) {
          // Get a reference to list
          let _list = _data["session_event_list"];

          for (let iterator = 0; iterator < _list?.length; iterator++) {
            let _session = _list[iterator];

            if (
              _session?.session_status === "live" &&
              today.getTime() >
                getDateFromHash(_session?.air_time).getTime() &&
              (_session?.access_tier === "Free" || isUserPro)
            ) {
              return callback(true);
            }
          }
          callback(false);
        }
      }
    });
};
