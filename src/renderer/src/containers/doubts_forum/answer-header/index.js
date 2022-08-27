import React, { useState, useEffect, useContext } from "react";
import { getDateStringServ } from "../../../helpers";
import ProfileNameLoader from "../profile-name-loader";
import { getUserMetaInfoById } from "../../../database";
import { UserContext, ThemeContext } from "../../../context";

export default function AnswerHeader({
  answering,
  topLevel,
  answerCreateTimestamp,
  userId,
}) {
  const [user] = useContext(UserContext).user;
  const [isDarkMode] = useContext(ThemeContext).theme;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    getAndSetUserInfo();
  }, [userId, topLevel]);

  const getAndSetUserInfo = async () => {
    if (answering) {
      setName(user?.name);
      setProfileUrl(user?.profile_url);
      setRole(user?.role);
    } else {
      const [instructor_name, full_name, profile_url, department] =
        await getUserMetaInfoById(userId);
        
      if (typeof instructor_name === "undefined" || instructor_name === null) {
        setName("Professor " + full_name?.split(" ")[0]);
      } else {
        setName(instructor_name);
      }

      setProfileUrl(profile_url);
      if (typeof department === "undefined") setRole("PuStack Faculty");
      else setRole(department);
    }
  };

  return (
    <div>
      {profileUrl && name ? (
        <div>
          <div
            className="doubtTile__Answer__Topbar"
            style={{
              paddingLeft: answering ? "8px" : "0px",
              border:
                answering && profileUrl
                  ? isDarkMode
                    ? "1px solid #646464"
                    : "1px solid #bebebe"
                  : "0px",
              borderBottom: 0,
              marginTop: answering ? "8px" : "0px",
            }}
          >
            {profileUrl && (
              <img
                src={profileUrl}
                style={{
                  height: "35px",
                  width: "35px",
                  borderRadius: "50%",
                }}
                alt="pic"
              />
            )}

            <div style={{ marginLeft: "8px" }}>
              {name && (
                <p style={{ fontSize: "15px", fontWeight: "520" }}>{name}</p>
              )}
              {
                <div className="doubtTile__Answer__Topbar__TimeContainer">
                  <p style={{ fontSize: "12px" }}>
                    {role
                      ? role
                      : getDateStringServ(
                          answerCreateTimestamp
                            ? answerCreateTimestamp
                            : Date.now()
                        )}
                  </p>
                  <p style={{ marginLeft: "6px", fontSize: "12px" }}>
                    {" "}
                    • Answer
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      ) : (
        <ProfileNameLoader />
      )}
    </div>
  );
}
