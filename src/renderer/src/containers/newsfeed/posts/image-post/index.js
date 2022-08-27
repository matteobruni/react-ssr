import React, { useState } from "react";
import "./style.scss";

import {
  TwoImagesGrid,
  ThreeImagesGrid,
  ModalGallery,
  NewsFeedImagePreview,
} from "../../../../components";

const ImagePost = ({ body }) => {
  const [isOpen, setisOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => {
          if (typeof body.image_urls === "object" && body.image_urls.length > 1)
            setisOpen(true);
        }}
        className="post-image-container"
      >
        {typeof body.image_urls === "object" &&
          body.image_urls.length === 1 && (
            <NewsFeedImagePreview
              imageUrl={body.image_urls[0]}
              alt="Pustack Newsfeed"
            />
          )}

        {typeof body.image_urls === "object" &&
          body.image_urls.length === 2 && (
            <TwoImagesGrid body={body.image_urls} />
          )}

        {typeof body.image_urls === "object" && body.image_urls.length > 2 && (
          <ThreeImagesGrid body={body.image_urls} />
        )}
      </div>

      {isOpen && (
        <ModalGallery body={body.image_urls} onClose={() => setisOpen(false)} />
      )}
    </>
  );
};

export default ImagePost;
