import React, {useEffect, useState} from 'react';
import {format} from "date-fns";

export default function CMSLogRowItem({log}) {
  const [expand, setExpand] = useState(false);

  return (
    <>
      <tr className={expand ? 'active' : ''} style={{
        cursor: log?.affected_keys ? 'pointer' : 'default'
      }} onClick={() => {
        if(!log?.affected_keys) return;
        setExpand(c => !c)
      }}>
        <td className="log-id">{log.id}</td>
        <td>
          <div>
            <img width={26} height={26} src={log.requested_by.image} alt="Default Picture"/>
            <span>{log.requested_by.name}</span>
          </div>
        </td>
        <td className="log-timestamp">{format(new Date(log.timestamp), 'dd MMMM yyyy, hh:mm b')}</td>
        <td className="log-item_id">
          <p>{log.item_id}</p>
        </td>
        <td className={"log-action " + (log.action.toLowerCase())}>
          <span>{log.action}</span>
        </td>
        <td className="log-info">{log.status}</td>
        <td className="log-level">
          <div>
            <div className={log.level} />
            {/*<span>{log.level}</span>*/}
          </div>
        </td>
      </tr>
      {<tr className={'extra-row ' + (expand ? '' : 'hide')}>
        <td colSpan="7">
          <div className="maxHeight">
            {(log.affected_keys && Object.keys(log.affected_keys).length > 0) && <>
              <h2>Affected Keys:</h2>
              <div className="affected-key-item-container">
                {Object.keys(log.affected_keys).map(key => (
                  <div className="affected-key-item">
                    <div className="affected-key-item-key"><span>{key} : </span></div>
                    <div className="affected-key-item-value">
                      <span className="affected-key-item-value-prev">{JSON.stringify(log.affected_keys[key].prev_value).replaceAll("^\"|\"$", "")}</span>
                      <span className="affected-key-item-value-separator">-></span>
                      <span className="affected-key-item-value-new">{JSON.stringify(log.affected_keys[key].new_value).replaceAll("^\"|\"$", "")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>}
          </div>
        </td>
      </tr>}
    </>
  )
}
