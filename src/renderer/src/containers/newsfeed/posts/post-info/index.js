import React, { useState, useEffect, useContext } from "react";

import Avatar from "@material-ui/core/Avatar";
import { formatTime } from "../../../../helpers";
import { getUserInfoById } from "../../../../database";
import { CreatePostContext } from "../../../../context";

const PostInfo = ({ userId, groups, timestamp }) => {
  //------------------------------------ constants hooks
  const [profileUrl, setProfileUrl] = useState("");
  const [name, setName] = useState("");

  const [isUpdated] = useContext(CreatePostContext).isUpdated;
  const [tempGroups] = useContext(CreatePostContext).tempGroups;

  //------------------------------------ functions
  const getSetUserInfo = async () => {
    let [name, profile_url] = await getUserInfoById(userId);

    setName(name);
    setProfileUrl(profile_url);
  };

  useEffect(() => {
    getSetUserInfo();
  }, []);

  return (
    <div className="post-info">
      <div className="user-details">
        <div className="user-avatar">
          <Avatar
            src={profileUrl}
            className="post-info-avatar"
            style={{ height: "35px", width: "35px" }}
          />
        </div>
        <div className="user-info">
          <h5>{name}</h5>
          {isUpdated ? (
            <p>
              Tags:{" "}
              {tempGroups?.length === 0 ? "General" : tempGroups?.join(", ")}
            </p>
          ) : (
            <p>
              Tags:{" "}
              {groups.length === 0
                ? "General"
                : groups.length <= 2
                ? groups?.slice(0, 2).join(", ")
                : groups?.slice(0, 2).join(", ") + " + more"}
            </p>
          )}
        </div>
      </div>
      <p className="post-timestamp">{formatTime(timestamp)}</p>
    </div>
  );
};

export default PostInfo;
