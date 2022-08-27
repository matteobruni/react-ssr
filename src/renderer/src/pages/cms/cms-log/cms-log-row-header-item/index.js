import React, {useState} from 'react';
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import {ArrowUpward} from "@material-ui/icons";

export default function CMSLogRowHeaderItem({children, colKey, sortData, setSortData, disabled}) {
  const [isAsc, setIsAsc] = useState(sortData.asc);

  return (
    <td onClick={() => {
      if(disabled) return;
      setIsAsc(c => {
        setSortData({key: colKey, asc: !c});
        return !c
      });
    }}>
      <div>
        <span>{children}</span>
        {sortData && sortData.key === colKey && (isAsc ? <ArrowDownwardIcon/> : <ArrowUpward />)}
      </div>
    </td>
  )
}
