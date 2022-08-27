import React, { useContext, useState, useEffect } from "react";
import { logoDark, logoDark2, logoLight2 } from "./../../../assets";
import { ThemeContext } from "./../../../context";
import "./style.scss";

export default function TipCard({ data, tipCode }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDark] = useContext(ThemeContext).theme;

  useEffect(() => {
    const objImg = new Image();
    objImg.src = data?.banner_image;
    objImg.onload = () => setImageLoaded(true);
  }, [data]);

  return (
    <div key={tipCode} className="subject__card">
      <div className="pustack__mark__overlay">
        <h6 className="pustack__mark">
          <img src={logoDark} alt="p" draggable={false} />
        </h6>
        <h6 className="pustack__mark__bg">PuStack</h6>
      </div>
      <div
        className="subject__thumbnail"
        style={{ backgroundColor: isDark ? "#282828" : "#e3e3e3" }}
      >
        <img
          src={
            imageLoaded ? data?.banner_image : isDark ? logoDark2 : logoLight2
          }
          alt={data?.name + " tips"}
          style={{ objectFit: imageLoaded ? "cover" : "contain" }}
        />

        <div className="subject__radial__overlay"></div>
        <div className="subject__overlay"></div>
      </div>
      <div className="subject__details">
        <div className="main__content">
          <h1>{data?.name}</h1>
          <h3>
            {data?.description ? data?.description + ". " : ""}At PuStack we
            believe that it is our responsibility to build quality tools and
            generate flawless content to help students globally.
          </h3>
        </div>
      </div>
      <div className="subject__title">{data?.name}</div>
    </div>
  );
}
