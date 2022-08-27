import React from "react";
import "./style.scss";

import { getIndianTime } from "../../../../../helpers";

/**
 * @deprecated
 * @returns {JSX.Element}
 * @constructor
 */
export default function Month() {
  var date = getIndianTime();
  var month = date.getMonth();
  var disMonths = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "Septemeber",
    9: "October",
    10: "November",
    11: "December",
  };
  return (
    <div className="Month">
      {disMonths[month]}, {date.getFullYear()}
    </div>
  );
}
