import React, { useContext } from "react";
import Modal from "react-modal";
import { DoubtContext } from "../../../context";
import "./style.scss";

export default function ImagePreview({ imageUrl }) {
  const [open, setOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = useContext(DoubtContext).isExpanded;

  const handleClickOpen = () => {
    if (isExpanded) {
      setOpen(true);
    } else {
      setIsExpanded(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {imageUrl && imageUrl !== "" && (
        <img
          id={isExpanded ? "doubtTile__imageExpanded" : "doubtTile__image"}
          src={imageUrl}
          onClick={handleClickOpen}
          style={{ cursor: isExpanded ? "zoom-in" : "pointer" }}
          alt=""
        />
      )}
      <Modal
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        onRequestClose={handleClose}
        ariaHideApp={false}
        overlayClassName="new-post-modal-overlay"
        isOpen={open}
        className="doubtTile__imagePreviewDiv__wrapper"
        
        
      >
        <div
          style={{ position: "relative" }}
          className="doubtTile__imagePreviewDiv"
        >
          <img
            src={imageUrl}
            className="imagePreviewDialog_image"
            onClick={handleClose}
            alt=""
          />
        </div>
      </Modal>
    </div>
  );
}
