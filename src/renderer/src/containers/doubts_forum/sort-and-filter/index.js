import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { PostsContext, ThemeContext } from "../../../context";
import { CustomRadioBtn, SectionHeaderLabel } from "../../../components";
import { SidebarContext } from "../../../context/doubts_forum/SidebarContext";
import "./style.scss";

export default function SortAndFilter({ updateFeed }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const [isDark] = useContext(ThemeContext).theme;
  
  const [, setPosts] = useContext(PostsContext);
  const [topLevel] = useContext(SidebarContext).topLevel;
  const [sortBy, setSortBy] = useContext(SidebarContext).sortBy;
  const [selectedSubject] = useContext(SidebarContext).selectedSubject;
  const [selectedChapter] = useContext(SidebarContext).selectedChapter;
  const [isAnswered, setIsAnswered] = useContext(SidebarContext).isAnswered;


  const onAnswerStatusClick = (status) => {
    setIsAnswered(status);
    updateFeed(topLevel, selectedSubject, selectedChapter, status);
  };

  const handleSortOptionClick = (value) => {
    setIsAnswered(isAnswered);
    setSortBy(value);
    updateFeed(topLevel, selectedSubject, selectedChapter, isAnswered);
  };

  return (
    <div>
      <div className="sortAndFilter__middle">
        <div style={{ marginBottom: "12px", margin: "6px 13px" }}>
          <SectionHeaderLabel label="Answer Status" isDark={isDark} />
        </div>
        <div>
          <div className="slider__selection">
            <div className="tabs">
              {isAnswered ? (
                <input type="radio" checked="checked" id="r1" name="t" />
              ) : (
                <input type="radio" id="r1" name="t" value="Unanswered" />
              )}

              <Link
                to={`/doubts?toplevel=${topLevel}&chapter=${selectedChapter}&subject=${selectedSubject}&answered=${true}`}
              >
                <label
                  className="tabs__label"
                  style={{ color: isAnswered ? "white" : "" }}
                  htmlFor="r1"
                  onClick={() =>
                    selectedSubject !== "My Doubts" && onAnswerStatusClick(true)
                  }
                >
                  Answered
                </label>
              </Link>

              {!isAnswered ? (
                <input type="radio" checked="checked" id="r2" name="t" />
              ) : (
                <input type="radio" id="r2" name="t" />
              )}

              <Link
                to={`/doubts?toplevel=${topLevel}&chapter=${selectedChapter}&subject=${selectedSubject}&answered=${false}`}
              >
                <label
                  className="tabs__label"
                  htmlFor="r2"
                  style={{ color: !isAnswered ? "white" : "" }}
                  onClick={() => {
                    if (selectedSubject !== "My Doubts") {
                      setPosts([]);
                      onAnswerStatusClick(false);
                    }
                  }}
                >
                  Unanswered
                </label>
              </Link>

              <div
                id={isDark ? "sliderDark" : "slider"}
                className={isAnswered ? "hasbeenanswered" : "unanswered"}
              />
            </div>
          </div>
        </div>

        <div
          className="hr"
          style={{
            borderBottom: `1.5px solid ${isDark ? "#444" : "#ddd"}`,
            marginTop: "10px",
          }}
        ></div>

        <div className="sortAndFilter__SortList">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={
              isDark
                ? "sortAndFilter__SortList__TopBar sortAndFilter__SortList__TopBar__dark"
                : "sortAndFilter__SortList__TopBar"
            }
          >
            <SectionHeaderLabel label="Sort by" isDark={isDark} />
            {isExpanded ? (
              <ExpandLessIcon style={{ color: isDark ? "white" : "black" }} />
            ) : (
              <ExpandMoreIcon style={{ color: isDark ? "white" : "black" }} />
            )}
          </div>

          {isExpanded ? (
            <div>
              <Link
                to={`/doubts?toplevel=${topLevel}&chapter=${selectedChapter}&subject=${selectedSubject}&answered=${isAnswered}`}
                style={{
                  color: isDark ? "white" : "inherit",
                  textDecoration: "inherit",
                }}
              >
                <div
                  onClick={() => handleSortOptionClick("Recommended")}
                  className={
                    isDark
                      ? "sortAndFilter__middleListItem sortAndFilter__middleListItem__dark"
                      : "sortAndFilter__middleListItem"
                  }
                  style={{ fontSize: "16px", marginTop: "0px" }}
                >
                  <p style={{ fontSize: "16px" }}>Recommended</p>

                  <CustomRadioBtn
                    checked={sortBy === "Recommended"}
                    onChange={() => handleSortOptionClick("Recommended")}
                    value="Recommended"
                    color="default"
                    name="radio-button-demo"
                    inputProps={{ "aria-label": "E" }}
                  />
                </div>
              </Link>

              <Link
                to={`/doubts?toplevel=${topLevel}&chapter=${selectedChapter}&subject=${selectedSubject}&answered=${isAnswered}`}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <div
                  onClick={() => handleSortOptionClick("Most popular")}
                  className={
                    isDark
                      ? "sortAndFilter__middleListItem sortAndFilter__middleListItem__dark"
                      : "sortAndFilter__middleListItem"
                  }
                >
                  <p style={{ fontSize: "16px" }}>Most popular</p>

                  <CustomRadioBtn
                    checked={sortBy === "Most popular"}
                    onChange={() => handleSortOptionClick("Most popular")}
                    value="Most popular"
                    color="default"
                    name="radio-button-demo"
                    inputProps={{ "aria-label": "E" }}
                  />
                </div>
              </Link>

              <Link
                to={`/doubts?toplevel=${topLevel}&chapter=${selectedChapter}&subject=${selectedSubject}&answered=${isAnswered}`}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <div
                  onClick={() => handleSortOptionClick("Recent first")}
                  className={
                    isDark
                      ? "sortAndFilter__middleListItem sortAndFilter__middleListItem__dark"
                      : "sortAndFilter__middleListItem"
                  }
                >
                  <p style={{ fontSize: "16px" }}>Recent first</p>

                  <CustomRadioBtn
                    checked={sortBy === "Recent first"}
                    onChange={() => handleSortOptionClick("Recent first")}
                    value="Recent first"
                    color="default"
                    name="radio-button-demo"
                    inputProps={{ "aria-label": "E" }}
                  />
                </div>
              </Link>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
