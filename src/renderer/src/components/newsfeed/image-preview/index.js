import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import CancelIcon from "@material-ui/icons/Cancel";
import "./style.scss";

export default function ImagePreview({ imageUrl, alt }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      setWidth(this.width);
      setHeight(this.height);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className="image-post-single">
      {imageUrl && imageUrl !== "" ? (
        height > width ? (
          <>
            <div
              className="post-image-container-bg"
              style={{
                background: `transparent url(${imageUrl}) no-repeat center`,
                backgroundSize: "cover",
              }}
            ></div>

            <img
              className="post-single-image-height"
              src={imageUrl}
              onClick={handleClickOpen}
              style={{ cursor: "zoom-in" }}
              alt={`${alt}`}
            />
          </>
        ) : (
          <img
            className="post-single-image-width"
            src={imageUrl}
            onClick={handleClickOpen}
            style={{ cursor: "zoom-in" }}
            alt={`${alt}`}
          />
        )
      ) : (
        ""
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
        <div className="doubtTile__imagePreviewDiv">
          <CancelIcon className="close-btn" onClick={handleClose} />
          <img
            src={imageUrl}
            className="imagePreviewDialog_image"
            onClick={handleClose}
            alt="imagePreview"
          />
        </div>
      </Modal>
    </div>
  );
}
