import React, { useState, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../../context";

const BlazeRating = ({ sessionName }) => {
  const [isDark] = useContext(ThemeContext).theme;
  const [openRatingModal, setOpenRatingModal] = useState(false);

  return (
    <Modal
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={() => setOpenRatingModal(false)}
      ariaHideApp={false}
      overlayClassName="new-post-modal-overlay"
      isOpen={openRatingModal}
      className={isDark ? "rate__session dark" : "rate__session"}
    >
      <div>
        <h1>Rate Session</h1>
        <h4>{sessionName}</h4>
        <div></div>
      </div>
    </Modal>
  );
};

export default BlazeRating;
