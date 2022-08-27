import React, { useContext } from "react";
import ContentLoader from "react-content-loader";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { ThemeContext } from "../../../context";

function SimilarChaptersLoader(props) {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div
      className={
        isDark
          ? "doubt-page-similar-container dark"
          : "doubt-page-similar-container"
      }
      style={{ marginBottom: "12px", display: "block" }}
    >
      <div className="similar-chapter-top">
        <img
          src="https://avatars3.githubusercontent.com/u/71245791?s=200&v=4"
          className="doubt-page-similar-chapter-icon"
          alt="pustack logo"
        />
        <div className="doubt-page-similar-chapter-label">
          <ContentLoader
            speed={2}
            backgroundColor={isDark ? "#282828" : "#f3f3f3"}
            foregroundColor={isDark ? "#343434" : "#ecebeb"}
            {...props}
          >
            <rect x="10" y="8" rx="0" ry="0" width="180" height="8" />
          </ContentLoader>
        </div>
      </div>
      <div className="menu-wrapper">
        <button className="left-paddle hidden button">
          <NavigateNextIcon />
        </button>
        <ul className="similar-chapter-menu">
          {Array(4)
            .fill(0)
            ?.map(() => (
              <li className="item">
                <div className="subjectTile">
                  <div>
                    <div
                      className="subjectTile__headerColor"
                      style={{
                        backgroundColor: isDark ? "#888888" : "#f3f3f3",
                      }}
                    ></div>
                  </div>
                  <div className="subjectTile__labelContainer">
                    <ContentLoader
                      speed={2}
                      backgroundColor={isDark ? "#282828" : "#f3f3f3"}
                      foregroundColor={isDark ? "#343434" : "#ecebeb"}
                      {...props}
                    >
                      <rect
                        x="110"
                        y="23"
                        rx="0"
                        ry="0"
                        width="80"
                        height="8"
                      />
                    </ContentLoader>
                  </div>
                </div>
              </li>
            ))}
        </ul>

        <button className="right-paddle button">
          <NavigateNextIcon />
        </button>
      </div>
    </div>
  );
}

export default SimilarChaptersLoader;
