import React, { useEffect, useContext } from "react";
import { Image1, Image2, Image3, Image4, Image5 } from "./../../../../assets";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import "./style.scss";

// -> components
import { SubjectTile } from "../../../../components";
import { SidebarContext, ThemeContext } from "../../../../context";

import { useHistory } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

function SimilarChapter({
  subjects,
  getSelectedChapter,
  homePage = false,
  subject = "",
}) {
  const [isDark] = useContext(ThemeContext).theme;

  const [topLevel] = useContext(SidebarContext).topLevel;
  const [selectedSubject] = useContext(SidebarContext).selectedSubject;
  const [selectedChapter] = useContext(SidebarContext).selectedChapter;
  const [selectedTopic, setSelectedTopic] =
    useContext(SidebarContext).selectedTopic;
  const [isAnswered, setIsAnswered] = useContext(SidebarContext).isAnswered;

  let history = useHistory();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 550px)" });

  useEffect(() => {
    getScrollValue();
  }, [subjects]);

  function sendToUrl(string) {
    history.push(string);
  }

  const scrollLeft = () => {
    let x = document.getElementsByClassName("similar-chapter-menu")[0];
    let step = window.outerWidth / 1.5;
    x.scrollLeft -= step;
  };

  const scrollRight = () => {
    let x = document.getElementsByClassName("similar-chapter-menu")[0];
    let step = window.outerWidth / 1.5;
    x.scrollLeft += step;
  };

  const getScrollValue = () => {
    setTimeout(() => {
      let x = document.getElementsByClassName("similar-chapter-menu")[0];
      let el = document.getElementsByClassName("left-paddle")[0];
      if (x?.scrollLeft === 0) {
        el.style.display = "none";
      } else {
        el.style.display = "flex";
      }
      let el2 = document.getElementsByClassName("right-paddle")[0];
      let right = x?.scrollWidth - (x?.scrollLeft + x?.clientWidth) + 1;
      if (right <= 2) {
        el2.style.display = "none";
      } else {
        el2.style.display = "flex";
      }
    }, 500);
  };

  const images = [Image1, Image2, Image3, Image4, Image5];

  return (
    <div
      className={
        isDark
          ? "doubt-page-similar-container dark"
          : "doubt-page-similar-container"
      }
      style={{
        marginBottom: "12px",
        display: homePage ? "block" : subjects.length >= 4 ? "block" : "none",
      }}
    >
      <div className="similar-chapter-top">
        <img
          src="https://avatars3.githubusercontent.com/u/71245791?s=200&v=4"
          className="doubt-page-similar-chapter-icon"
          alt="pustack logo"
        />
        <p className="doubt-page-similar-chapter-label">
          {homePage
            ? "Explore " +
              subject +
              (subject?.includes("Chapters") ? "" : " Chapters")
            : "Explore Similar Chapters"}
        </p>
      </div>
      <div className="menu-wrapper" onScroll={getScrollValue}>
        <button className="left-paddle hidden button" onClick={scrollLeft}>
          <NavigateNextIcon />
        </button>
        <div className="similar-chapter-menu">
          {subjects ? (
            subjects?.map((subject, index) => {
              return subject?.chapter_name?.toLocaleLowerCase() !== "all" &&
                subject?.chapter_name !== getSelectedChapter ? (
                <div
                  className="item"
                  key={subject?.chapter_name.replaceAll(" ", "")}
                  onClick={() => {
                    sendToUrl(
                      `/doubts?toplevel=${topLevel}&chapter=${
                        topLevel === "Maths"
                          ? subject?.chapter_name
                          : selectedChapter
                      }&subject=${
                        topLevel === "Maths"
                          ? subject?.chapter_name
                          : selectedSubject
                      }&answered=${isAnswered}`
                    );
                    setIsAnswered(true);
                    setSelectedTopic(subject?.chapter_name);
                  }}
                >
                  <SubjectTile
                    isSelected={selectedTopic === subject?.chapter_name}
                    label={subject?.chapter_name}
                    image={images[index % 5]}
                  />
                </div>
              ) : (
                <></>
              );
            })
          ) : (
            <></>
          )}
        </div>

        <button
          className="right-paddle button"
          style={{
            display:
              subjects.length > (isSmallScreen ? 3 : 4) ? "block" : "none",
          }}
          onClick={scrollRight}
        >
          <NavigateNextIcon />
        </button>
      </div>
    </div>
  );
}

export default SimilarChapter;
