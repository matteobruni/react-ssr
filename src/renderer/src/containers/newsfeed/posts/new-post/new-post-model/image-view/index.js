import React from "react";
import CancelIcon from "@material-ui/icons/Cancel";
import "./style.scss";

export default function ImageView({
  isUpdating,
  images,
  newImages,
  forceUpdate,
  callSetImages,
  callSetNewImages,
  removeAtIndex,
}) {
  return (
    <div
      className="new-post-image-preview-container"
      style={{
        marginTop: newImages.length > 0 || images.length > 0 ? "10px" : "",
      }}
    >
      <div className="new-feed-image-preview-container">
        {
          isUpdating ? (
            newImages?.length > 1 ? (
              newImages.map((img, index) => (
                <div key={index} className="image-preview-thumbnail-container">
                  <CancelIcon
                    onClick={() => {
                      const _new_array = removeAtIndex(newImages, index);
                      callSetNewImages(_new_array);
                      forceUpdate();
                    }}
                  />
                  <img
                    className="preview-image-thumbnail"
                    src={img.url}
                    alt="Pustack New Post"
                  />
                </div>
              ))
            ) : newImages?.length === 1 ? (
              <div className="image-preview-thumbnail-container">
                <CancelIcon
                  onClick={() => {
                    callSetNewImages([]);
                    forceUpdate();
                  }}
                />
                <img
                  className="preview-image-thumbnail"
                  src={newImages[0].url}
                  alt="Pustack Old Post"
                />
              </div>
            ) : (
              <div>
                {newImages?.length > 1 &&
                  newImages.map((img, index) => (
                    <div
                      key={index}
                      className="image-preview-thumbnail-container"
                    >
                      <CancelIcon
                        onClick={() => {
                          const _new_array = removeAtIndex(images, index);
                          callSetNewImages(_new_array);
                          forceUpdate();
                        }}
                      />
                      <img
                        className="preview-image-thumbnail"
                        src={img.url}
                        alt="Pustack New Post"
                      />
                    </div>
                  ))}
              </div>
            )
          ) : (
            <></>
          ) // when not updating
        }
        {images.length === 1 && (
          <div className="image-preview-thumbnail-container">
            <CancelIcon
              onClick={() => {
                callSetImages([]);
                forceUpdate();
              }}
            />
            <img
              className="preview-image-thumbnail"
              src={images[0].url}
              alt="Pustack New Post Upload"
            />
          </div>
        )}

        {images.length > 1 &&
          images.map((img, index) => (
            <div key={index} className="image-preview-thumbnail-container">
              <CancelIcon
                onClick={() => {
                  const _new_array = removeAtIndex(images, index);
                  callSetImages(_new_array);
                  forceUpdate();
                }}
              />
              <img
                className="preview-image-thumbnail"
                src={img.url}
                alt="Pustack New Post Upload"
              />
            </div>
          ))}
      </div>
    </div>
  );
}
