import React, { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import { AskYourDoubtContext, ThemeContext } from "../../../../context";
import { showSnackbar } from "../../../../helpers";

export const DoubtAndImages = () => {
  const [categorySelected] = useContext(AskYourDoubtContext).categorySelected;
  const [subjectSelected] = useContext(AskYourDoubtContext).subjectSelected;
  const [chapterSelected] = useContext(AskYourDoubtContext).chapterSelected;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [doubtQuestion, setDoubtQuestion] =
    useContext(AskYourDoubtContext).doubtQuestion;
  const [updatedDoubtQuestion, setUpdatedDoubtQuestion] =
    useContext(AskYourDoubtContext).updatedDoubtQuestion;
  const [isLoading] = useContext(AskYourDoubtContext).isLoading;
  const [updating] = useContext(AskYourDoubtContext).updating;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  return (
    <div className="askDoubtPopup__PostDoubt">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="askDoubtPopup__top" id="askDoubtPopup__top">
          <div style={{ display: isSmallScreen ? "block" : "flex" }}>
            <p
              className={
                isDarkMode
                  ? "doubtTile__topLevel doubtTile__topLevel__dark"
                  : "doubtTile__topLevel"
              }
            >
              {categorySelected}
              {subjectSelected ? (
                <span
                  className={
                    isDarkMode
                      ? "doubtTile__subject doubtTile__subject__dark"
                      : "doubtTile__subject"
                  }
                  style={{ marginLeft: "2px" }}
                >{` •  ${subjectSelected}`}</span>
              ) : (
                <></>
              )}
              {chapterSelected ? (
                <span
                  style={{
                    marginLeft: "2px",
                    color: isDarkMode ? "white" : "black",
                  }}
                >{` •  ${chapterSelected}`}</span>
              ) : (
                <></>
              )}
            </p>
          </div>
        </div>

        <div className="askDoubtPopup__textareaContainer">
          <textarea
            className={
              isDarkMode
                ? "askDoubtPopup__textarea askDoubtPopup__textarea__dark"
                : "askDoubtPopup__textarea"
            }
            rows="6"
            value={updating ? updatedDoubtQuestion : doubtQuestion}
            placeholder="Ask your doubt here..."
            onChange={(e) => {
              if (!e.target.value.match(/\bhttps?:\/\/\S+/gi)) {
                //only update if it does not contain link
                if (!isLoading) {
                  if (updating) {
                    setUpdatedDoubtQuestion(e.target.value);
                  } else {
                    setDoubtQuestion(e.target.value);
                  }
                }
              } else {
                showSnackbar("Doubt can not contain links", "error");
              }
            }}
            style={{ resize: "none", lineHeight: "20px" }}
          />

          <p
            className="askDoubtPopup__characterCount"
            style={{
              color: updating
                ? updatedDoubtQuestion.length > 350
                : doubtQuestion.length > 350
                ? "#cb4b10"
                : "#80808080",
            }}
          >
            {`${
              updating ? updatedDoubtQuestion.length : doubtQuestion.length
            } / 350`}
          </p>
        </div>
      </div>
    </div>
  );
};
