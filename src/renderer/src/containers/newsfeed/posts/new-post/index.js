import React, { useState, useContext, useEffect } from "react";
import "./style.scss";

// -> material ui
import Avatar from "@material-ui/core/Avatar";
import NewPostModal from "./new-post-model";
import { UserContext } from "../../../../context/global/user-context";
import { NewsFeedContext, ThemeContext } from "../../../../context";

const NewPost = ({ onCreate }) => {
  //------------------------------------ constants hooks
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [chosenType, setChosenType] = useState(0);
  const [isNewPostModalOpen, setIsNewPostModalOpen] =
    useContext(NewsFeedContext).isNewPostModalOpen;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const openModal = (e) => {
    setChosenType(e);
    setIsNewPostModalOpen(true);
  };
  const closeModal = () => {
    setIsNewPostModalOpen(false);
    setChosenType(0);
  };

  useEffect(() => {
    document.body.style.overflow = isNewPostModalOpen ? "hidden" : "unset";
  }, [isNewPostModalOpen]);


  return user !== null && isInstructor ? (
    <div className="feed-new-post">
      <div className="new-post-top">
        <Avatar src={user.profile_url} />

        <form
          className={
            isDarkMode ? "new-post-form new-post-form-dark" : "new-post-form"
          }
        >
          <textarea
            onClick={() => openModal(0)}
            contentEditable={false}
            readOnly={true}
            cols="1"
            rows="1"
            className="new-post-input"
            placeholder={`What's on your mind, ${user.name.split(" ")[0]}?`}
          />
        </form>
      </div>
      <div className="new-post-separator" />
      <div className="new-post-bottom">
        <div
          onClick={() => openModal(1)}
          className={
            isDarkMode
              ? "new-post-option new-post-option-dark"
              : "new-post-option"
          }
        >
          <div className="option-icon">
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fselect%20image.svg?alt=media&token=72b05f5f-77ec-4fb2-ae40-5aedb9bdc3f2"
              }
              height="20px"
              width="20px"
              alt="img"
            />
          </div>
          Image
        </div>
        <div
          onClick={() => openModal(2)}
          className={
            isDarkMode
              ? "new-post-option new-post-option-dark"
              : "new-post-option"
          }
        >
          <div className="option-icon">
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fvideo-camera.svg?alt=media&token=c4c31826-d9ea-4b7e-9af8-6096318d63e9"
              }
              height="20px"
              width="20px"
              alt="video"
            />
          </div>
          Video
        </div>
        <div
          onClick={() => openModal(3)}
          className={
            isDarkMode
              ? "new-post-option new-post-option-dark"
              : "new-post-option"
          }
        >
          <div className="option-icon">
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fpoll.svg?alt=media&token=8717a17a-0492-43bf-a57c-a27030092c68"
              }
              height="20px"
              width="20px"
              alt="poll"
            />
          </div>
          Poll
        </div>
      </div>

      {isNewPostModalOpen && (
        <NewPostModal
          onCreate={onCreate}
          closeModal={closeModal}
          isOpen={isNewPostModalOpen}
          modalType={chosenType}
        />
      )}
    </div>
  ) : (
    <></>
  );
};

export default NewPost;
