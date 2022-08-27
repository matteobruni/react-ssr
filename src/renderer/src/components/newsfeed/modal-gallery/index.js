import React, { useState, useRef, useEffect } from "react";
import Lightbox from "react-image-lightbox";
import CancelIcon from "@material-ui/icons/Cancel";
import "react-image-lightbox/style.css";
import "./style.scss";

const ModalGallery = ({ body, onClose }) => {
  const [index, setIndex] = useState(0);
  const [closeList, setCloseList] = useState(false);

  const closeModal = () => {
    setTimeout(onClose, 500);
    setCloseList(true);
  };
  const imageRef = useRef();

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [index]);

  return (
    <>
      <Lightbox
        mainSrc={body[index]}
        nextSrc={body[(index + 1) % body.length]}
        prevSrc={body[(index + body.length - 1) % body.length]}
        onCloseRequest={closeModal}
        onMovePrevRequest={() =>
          setIndex((index + body.length - 1) % body.length)
        }
        onMoveNextRequest={() => setIndex((index + 1) % body.length)}
        enableZoom={false}
        clickOutsideToClose={true}
      />

      <div className={closeList ? "closeList slideOut" : "closeList slideIn"}>
        <CancelIcon onClick={closeModal} />
      </div>

      <div
        className={closeList ? "imagesList slideDown" : "imagesList slideUp"}
      >
        {body.map((item, i) => (
          <img
            src={item}
            alt={`img${i}`}
            draggable={false}
            onClick={() => setIndex(i)}
            className={index === i ? "selected" : ""}
            ref={index === i ? imageRef : null}
            
          />
        ))}
      </div>
    </>
  );
};
export default ModalGallery;
