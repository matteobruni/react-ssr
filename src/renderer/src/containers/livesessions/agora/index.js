import React, { useEffect, useContext, useRef } from "react";
// import { AgoraEduSDK } from "agora-classroom-sdk";
// import { UserContext } from "../../../context";
import "./style.scss";

const AgoraStudentPage = () => {
//   const [user] = useContext(UserContext).user;
  const agoraRef = useRef();

//   const setupClassroom = () => {
//     AgoraEduSDK.config({
//       appId: "21d0412895ff46f2998e52c36404ba85",
//     });

//     AgoraEduSDK.launch(agoraRef.current, {
//       rtmToken:
//         "00621d0412895ff46f2998e52c36404ba85IABMLI51tVahBDbCyz/Fg7PmjZkOGr/q2KbCvWQYTZZRq1AfYa0AAAAAEAAdH+tZgs0AYQEA6AOCzQBh",
//       userUuid: "pustack",
//       userName: user?.name.split(" ")[0],
//       roomUuid: `hdh2`,
//       roomName: "Session Test",
//       roleType: 2,
//       roomType: 2,
//       pretest: false,
//       language: "en",
//       startTime: new Date().getTime(),
//       duration: 60 * 60,
//       courseWareList: [],
//       listener: (evt) => console.log(evt),
//     });
//   };

//   useEffect(() => {
//     try {
//       let placeholderInput = document.getElementsByClassName(
//         "chat-texting-message"
//       );
//       console.log({ placeholderInput });
//       placeholderInput[0].placeholder = "Comment";
//     } catch (err) {
//       console.log({ err });
//     }
//   });

//   useEffect(() => {
//     user?.email && setupClassroom();
//   }, [user?.email]);

//   useEffect(() => {
//     return () => agoraRef.current !== null && (agoraRef.current = null);
//   }, []);

  return <div id="agora5" ref={agoraRef} />;
};

export default AgoraStudentPage;

// token: f2d57f649d584feba96fc798f05b0c82
