/**
 * @deprecated
 * @returns {Date}
 */
export function getIndianTime() {
  const offset = 5.5;
  // create Date object for current location
  const d = new Date();

  // convert to msec
  // add local time zone offset
  // get UTC time in msec
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset
  const nd = new Date(utc + 3600000 * offset);

  nd.date = nd.getDate();
  nd.month = nd.getMonth();
  nd.year = nd.getFullYear();

  return nd;
}

let ist = {
  timestamp: null,
  updated_ts: null,
  expiration_ts: 5000,
  isExpired: function() {
    let ts_now = new Date().getTime();
    return !this.timestamp || !this.updated_ts || (this.updated_ts + this.expiration_ts) < ts_now;
  },
  update: function(timestamp) {
    this.updated_ts = new Date().getTime();
    this.timestamp = timestamp;
  }
}

/**
 * @description It has some memoization techniques implemented so the calls to the function "getIndianTime" are optimized
 * @param signal
 * @param refreshed
 * @returns {Promise<Date>}
 */
export async function fetchIndianTime(signal = null, refreshed = false) {
  if(!ist.isExpired() && !refreshed) {
    const nd = new Date(ist.timestamp);

    nd.date = nd.getDate();
    nd.month = nd.getMonth();
    nd.year = nd.getFullYear();
    return nd;
  }

  const data = await fetch(
    "https://us-central1-avian-display-193502.cloudfunctions.net/getIndiaTime",
    {
      signal,
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: null,
    })
    .then(r => r.json());

  ist.update(data.timestamp);

  const nd = new Date(ist.timestamp);

  nd.date = nd.getDate();
  nd.month = nd.getMonth();
  nd.year = nd.getFullYear();
  return nd;
}

export function toIndianTimeZone(date) {
  let d = new Date(date);
  let offset = -(d.getTimezoneOffset() + 330) * 60000;
  return new Date(d - offset);
}
