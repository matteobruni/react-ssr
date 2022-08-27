import React, { useState } from "react";
import Modal from "react-modal";
import { PdfPreview } from "./../../../components";
import NotesSVG from "./../../../assets/images/pdf.svg";
import YoutubeEmbed from "./../../../components/doubts_forum/youtube-embed";
import "./style.scss";

const LectureSearchTile = ({
  video_id,
  doubtId,
  title,
  subject,
  chapter,
  pdfUrl,
}) => {
  const [showPdf, setShowPdf] = useState(false);

  return (
    <div className="lecture-search-tile">
      <h6 className="lecture-details">
        <span>{subject}</span> • <span>{chapter}</span>
      </h6>
      <div className="video-wrapper">
        <YoutubeEmbed body={{ video_id, doubtId }} />
      </div>
      <div className="lecture-title">
        <h6>{title}</h6>
        {pdfUrl && (
          <button onClick={() => setShowPdf(true)}>
            <img className="notes__svg" alt="PuStack Notes" src={NotesSVG} />
          </button>
        )}
      </div>

      <Modal
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        onRequestClose={() => setShowPdf(false)}
        ariaHideApp={false}
        className="new-post-modal pdf-preview-modal"
        overlayClassName="new-post-modal-overlay"
        isOpen={showPdf}
      >
        <PdfPreview pdf={pdfUrl} onClose={() => setShowPdf(false)} />
      </Modal>
    </div>
  );
};

export default LectureSearchTile;
