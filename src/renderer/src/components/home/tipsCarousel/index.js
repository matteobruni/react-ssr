import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import { getTipsMeta } from "../../../database";
import { UserContext } from "./../../../context";
import SubjectCardShimmer from "../subjectCardShimmer";
import "./style.scss";
import TipCard from "../tipCard";

export default function TipsCarousel({ title, code }) {
  const [tipData, setTipData] = useState(null);
  const [visibility, setVisibility] = useState(false);
  const [user] = useContext(UserContext).user;
  const [isUserPro] = useContext(UserContext).tier;

  const getTipData = async () => {
    let _data = await getTipsMeta({ subjectCode: code, grade: user?.grade });

    setTipData(_data);
  };

  useEffect(() => {
    getTipData();
  }, [user?.grade]);

  useEffect(() => {
    getScrollValue();
  }, [tipData]);

  const scrollLeft = () => {
    let x = document.getElementsByClassName(`tips__wrapper${code}`)[0];
    let step = window.outerWidth / 1.3;
    x.scrollLeft -= step;
  };

  const scrollRight = () => {
    let x = document.getElementsByClassName(`tips__wrapper${code}`)[0];
    let step = window.outerWidth / 1.3;
    x.scrollLeft += step;
  };
  const getScrollValue = () => {
    setTimeout(() => {
      let x = document.getElementsByClassName(`tips__wrapper${code}`)[0];
      let el = document.getElementsByClassName(`l_arrow_tips${code}`)[0];
      if (x?.scrollLeft === 0) {
        el.style.display = "none";
      } else {
        el.style.display = "flex";
      }
      let el2 = document.getElementsByClassName(`r_arrow_tips${code}`)[0];
      let right = x?.scrollWidth - (x?.scrollLeft + x?.clientWidth) + 1;
      if (right <= 2) {
        el2.style.display = "none";
      } else {
        el2.style.display = "flex";
      }
    }, 500);
  };

  return (
    <div
      className="subjects__carousel"
      style={{ overflow: visibility ? "visible" : "hidden" }}
    >
      <div className="home__section__header">{title}</div>

      <div
        className={`subject__carousel__wrapper tips__wrapper${code}`}
        onScroll={getScrollValue}
      >
        <div className="dummy-carousel-placeholder"></div>
        {tipData !== null
          ? tipData.map(
              (tip, index) =>
                (tip.tier === "basic" || isUserPro) && (
                  <Link
                    to={`/tips?subject=${user?.grade}_tips_${code}&tip=${tip.tip_id}`}
                    key={code + index}
                    onMouseEnter={() => setVisibility(true)}
                    onMouseLeave={() => setVisibility(false)}
                  >
                    <TipCard key={code + index} data={tip} tipCode={code} />
                  </Link>
                )
            )
          : Array(4)
              .fill(0)
              .map((_, i) => (
                <Link to="#" key={i}>
                  <SubjectCardShimmer key={i} />
                </Link>
              ))}

        <div className="space"></div>
        <div
          className={`left_arrow l_arrow_tips${code} scroll_button`}
          onClick={scrollLeft}
        >
          <i className="arrow left">
            <svg className="arrow__svg" viewBox="137.718 -1.001 366.563 644">
              <path d="M428.36 12.5c16.67-16.67 43.76-16.67 60.42 0 16.67 16.67 16.67 43.76 0 60.42L241.7 320c148.25 148.24 230.61 230.6 247.08 247.08 16.67 16.66 16.67 43.75 0 60.42-16.67 16.66-43.76 16.67-60.42 0-27.72-27.71-249.45-249.37-277.16-277.08a42.308 42.308 0 0 1-12.48-30.34c0-11.1 4.1-22.05 12.48-30.42C206.63 234.23 400.64 40.21 428.36 12.5z" />
            </svg>
          </i>
        </div>
        <div
          className={`right_arrow r_arrow_tips${code} scroll_button`}
          onClick={scrollRight}
        >
          <i className="arrow right">
            <svg className="arrow__svg" viewBox="0 0 238.003 238.003">
              <path d="M181.776 107.719L78.705 4.648c-6.198-6.198-16.273-6.198-22.47 0s-6.198 16.273 0 22.47l91.883 91.883-91.883 91.883c-6.198 6.198-6.198 16.273 0 22.47s16.273 6.198 22.47 0l103.071-103.039a15.741 15.741 0 0 0 4.64-11.283c0-4.13-1.526-8.199-4.64-11.313z" />
            </svg>
          </i>
        </div>
      </div>
    </div>
  );
}
