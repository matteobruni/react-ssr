import React, { useState, useEffect } from "react";
import "./style.scss";
import Modal from "react-modal";
import { Shimmer, Image } from "react-shimmer";
import { PdfPreview } from "../../../../components";
var psl = require("psl");

const LinkPost = ({ url, title, thumbnail }) => {
  var parsed = psl.parse(url.replace("https://", "").replace("http://", ""));

  const pdfURL = `https://us-central1-avian-display-193502.cloudfunctions.net/newsfeed/proxy/${url.replace(
    "https://",
    ""
  )}`;

  const [isOpen, setIsOpen] = useState(false);

  // is important
  const [showPdf, setShowPdf] = useState(false);

  const openURL = (link) => {
    if (link?.includes(".pdf")) {
      setIsOpen(true);
      setShowPdf(true);
    } else {
      window.open(link, "_blank");
    }
  };

  if (parsed?.error?.code === "LABEL_INVALID_CHARS") {
    parsed = { domain: url.replace("https://", "").replace("http://", "") };
  }

  //------------------------------------ useEffect

  useEffect(() => {
    LitenForChangesInScreenSize();
  }, []);

  const LitenForChangesInScreenSize = () => {
    window.addEventListener("resize", function () {
      // check width
      setIsOpen(false);
      setIsOpen(true);
    });
  };

  return (
    <>
      {showPdf && (
        <Modal
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => {
            setIsOpen(false);
            setShowPdf(false);
          }}
          ariaHideApp={false}
          className="new-post-modal pdf-preview-modal"
          overlayClassName="new-post-modal-overlay"
          isOpen={isOpen}
        >
          <PdfPreview
            pdf={pdfURL}
            onClose={() => {
              setIsOpen(false);
              setShowPdf(false);
            }}
          />
        </Modal>
      )}
      <div className="post-link-container" onClick={() => openURL(url)}>
        {thumbnail !== null && thumbnail !== "" && thumbnail.length > 0 && (
          <div className="link-image">
            <Image
              src={thumbnail}
              alt="Pustack Newsfeed"
              fallback={<Shimmer width={550} height={240} />}
            />
          </div>
        )}

        <div className="link-info-container">
          <div className="link-info">
            <div className="link-title">{title}</div>
            <div className="link-tld">{parsed?.domain?.substring(0, 45)}</div>
          </div>
          <div className="learn-more-btn">Learn More</div>
        </div>
      </div>
    </>
  );
};

export default LinkPost;
