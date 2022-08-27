import React, { useContext, useState, useEffect } from "react";
import { logoDark, logoDark2, logoLight2 } from "./../../../assets";
import { SubjectModalContext, ThemeContext } from "../../../context";
import "./style.scss";

export default function SubjectCard({ data, subjectCode }) {
  const [isDark] = useContext(ThemeContext).theme;
  const [, setChaptersData] = useContext(SubjectModalContext).data;
  const [, setSubjectCode] = useContext(SubjectModalContext).subjectCode;

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const objImg = new Image();
    objImg.src = data?.illustration_art;
    objImg.onload = () => setImageLoaded(true);
  }, [data]);

  return (
    <div
      onClick={() => {
        setChaptersData(data);
        setSubjectCode(subjectCode);
      }}
      key={data?.hex_color}
      className="subject__card"
    >
      <div className="pustack__mark__overlay">
        <h6 className="pustack__mark">
          <img src={logoDark} alt="p" draggable={false} />
        </h6>
        <h6 className="pustack__mark__bg">PuStack</h6>
      </div>
      <div
        className="subject__thumbnail"
        style={{ backgroundColor: data?.hex_color }}
      >
        <img
          src={imageLoaded ? data?.illustration_art : isDark ? logoDark2 : logoLight2}
          alt={data?.name + " Subject"}
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

          <h4>{data?.chapters?.length} chapters</h4>
        </div>
      </div>
      <div className="subject__title">{data?.name}</div>
    </div>
  );
}
