import React, { useState, useEffect, useContext } from "react";
import { v1 as uuid } from "uuid";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import "./style.scss";

import {
  SectionHeaderLabel,
  CustomChip,
  ChipLoader,
  CategoryTile,
} from "../../../components";

import {
  AskYourDoubtContext,
  PustackProContext,
  SidebarContext,
  PostsContext,
  ThemeContext,
  UserContext,
  PageContext,
} from "../../../context";

import {
  getDoubts,
  getMyDoubts,
  getFilterData,
  resetUnreadMsgCount,
  getInstructorMyDoubts,
} from "../../../database";

import { AskDoubtPopup, SortAndFilter } from "../../../containers";

import {
  SSTSelected,
  MathsSelected,
  ScienceSelected,
  EnglishSelected,
} from "../../../assets";

export default function Sidebar({ setMobileOpen }) {
  const [user] = useContext(UserContext).user;
  const [isUserPro] = useContext(UserContext).tier;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;
  const [unreadAnswerCount] = useContext(UserContext).unreadAnswerCount;

  const [isExpanded] = useState(true);
  const [sstCategories, setSstCategories] = useState([]);
  const [mathCategories, setMathCategories] = useState([]);
  const [generalCategories, setGeneralCategories] = useState([]);
  const [scienceCategories, setScienceCategories] = useState([]);
  const [englishCategories, setEnglishCategories] = useState([]);

  const [updateCategoriesList] =
    useContext(SidebarContext).updateCategoriesList;
  const [sortBy, setSortBy] = useContext(SidebarContext).sortBy;
  const [sortByDBString, setSortByDBString] =
    useContext(SidebarContext).sortByDBString;
  const [isAnswered, setIsAnswered] = useContext(SidebarContext).isAnswered;
  const [showMyDoubts, setShowMyDoubts] =
    useContext(SidebarContext).showMyDoubts;

  const [topLevel, setTopLevel] = useContext(SidebarContext).topLevel;
  const [selectedTopic, setSelectedTopic] =
    useContext(SidebarContext).selectedTopic;
  const [selectedSubject, setSelectedSubject] =
    useContext(SidebarContext).selectedSubject;
  const [selectedChapter, setSelectedChapter] =
    useContext(SidebarContext).selectedChapter;
  const [limitSubjectChips, setLimitSubjectChips] =
    useContext(SidebarContext).limitSubjectChips;
  const [, setIsLoadingFeed] = useContext(SidebarContext).isLoadingFeed;
  const [, setnoDataFound] = useContext(SidebarContext).noDataFound;
  const [wrongGrade] = useContext(SidebarContext).wrongGrade;
  const [lastDocument, setLastDocument] =
    useContext(SidebarContext).lastDocument;

  const [posts, setPosts] = useContext(PostsContext);
  const [pageName, setpageName] = useContext(PageContext).pageName;

  const [, setOpen] = useContext(AskYourDoubtContext).open;

  // -> small screen hooks for just to show update not act on it.
  const [smallScreenTopLevel, setSmallScreenTopLevel] =
    useContext(SidebarContext).smallScreenTopLevel;
  const [smallScreenSelectedSubject, setSmallScreenSelectedSubject] =
    useContext(SidebarContext).smallScreenSelectedSubject;
  const [, setSmallScreenSelectedChapter] =
    useContext(SidebarContext).smallScreenSelectedChapter;

  const [smallScreenIsAnswered, setsmallScreenIsAnswered] =
    useContext(SidebarContext).smallScreenIsAnswered;
  const [smallScreenSortBy, setsmallScreenSortBy] =
    useContext(SidebarContext).smallScreenSortBy;

  const [userGrade, setUserGrade] = useState(user?.grade);

  const [queryParameters] = useContext(SidebarContext).queryParameters;

  let filter_data;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    getSetFilterData();
    if (pageName === "homePage" && (queryParameters?.toplevel || "")) {
      updateFeed(
        queryParameters?.topLevel,
        selectedSubject,
        selectedChapter,
        isAnswered
      );
    }
  }, [user?.grade, queryParameters]);

  useEffect(() => {
    if (pageName === "homePage" && sortByDBString) {
      updateFeed(topLevel, selectedSubject, selectedChapter, isAnswered);
    }
  }, [sortByDBString]);

  useEffect(() => {
    getCategoriesList();
  }, [updateCategoriesList]);

  useEffect(() => {
    if (showMyDoubts) {
      updateFeed(topLevel, selectedSubject, selectedChapter, isAnswered);
    }
  }, [showMyDoubts, selectedTopic]);

  useEffect(() => {
    if (pageName === "homePage" && selectedSubject !== "My Doubts") {
      let _selectedChapter = selectedChapter;
      let _selectedSubject = selectedSubject;

      if (userGrade !== user?.grade) {
        setSelectedChapter("All");
        setSmallScreenSelectedChapter("All");
        setUserGrade(user?.grade);

        _selectedChapter = "All";

        if (topLevel === "Maths") {
          setSelectedSubject("All");
          setSmallScreenSelectedSubject("All");
          _selectedSubject = "All";
        }
      }
      updateFeed(topLevel, _selectedSubject, _selectedChapter, isAnswered);
    }
  }, [topLevel, isAnswered, user?.grade, pageName, selectedTopic]);

  useEffect(() => {
    applySorting();
  }, [sortBy]);

  useEffect(() => {
    setSmallScreenTopLevel(topLevel);
    setSmallScreenSelectedSubject(selectedSubject);
    setsmallScreenIsAnswered(isAnswered);
  }, [topLevel, selectedSubject, isAnswered]);

  useEffect(() => {
    if (selectedSubject === "My Doubts" && unreadAnswerCount > 0) {
      resetUnreadMsgCount({ grade: user?.grade, userId: user?.uid });
    }
  }, [selectedSubject, unreadAnswerCount, user?.grade]);

  const updateSidebarSelectionOnQuestionUpdated = (
    getcategorySelected,
    getsubjectSelected,
    getchapterSelected,
    getisAnswered
  ) => {
    setIsAnswered(getisAnswered);
    if (getcategorySelected !== topLevel) {
      setTopLevel(getcategorySelected);
    }
    if (getsubjectSelected !== selectedSubject) {
      setSelectedSubject(getsubjectSelected);

      if (getchapterSelected !== selectedChapter) {
        setSelectedChapter(getchapterSelected);
      }
    }
  };

  async function getSetFilterData() {
    filter_data = await getFilterData(user.grade);
    if (filter_data) {
      let generalFilters = filter_data.data().subjects.General;
      const myDoubtsIndex = generalFilters.indexOf("My Doubts");

      if (isInstructor) {
        generalFilters[myDoubtsIndex] = "My Answers";
      }
      setGeneralCategories(generalFilters);
      setMathCategories(filter_data.data().subjects.Maths);
      setSstCategories(filter_data.data().subjects.SST);
      setScienceCategories(filter_data.data().subjects.Science);
      setEnglishCategories(filter_data.data().subjects.English);
    }
  }

  function getCategoriesList() {
    if (isSmallScreen) {
      switch (smallScreenTopLevel) {
        case "General":
          return generalCategories;
        case "Maths":
          return mathCategories;
        case "Science":
          return scienceCategories;
        case "SST":
          return sstCategories;
        case "English":
          return englishCategories;
        default:
          return generalCategories;
      }
    } else {
      switch (topLevel) {
        case "General":
          return generalCategories;
        case "Maths":
          return mathCategories;
        case "Science":
          return scienceCategories;
        case "SST":
          return sstCategories;
        case "English":
          return englishCategories;
        default:
          return generalCategories;
      }
    }
  }

  async function updateFeed(
    latestTopLevel,
    latestSubject,
    latestChapter,
    latestIsAnswered
  ) {
    window.scrollTo(0, 0);

    setIsLoadingFeed(true);
    setPosts([]);

    if (showMyDoubts) {
      let [_posts, _last] = isInstructor
        ? await getInstructorMyDoubts({
            userID: user.uid,
            lastDocument: lastDocument,
            grade: user.grade,
          })
        : await getMyDoubts({
            userID: user.uid,
            lastDocument: lastDocument,
            grade: user.grade,
          });

      if (_last) setLastDocument(_last);

      if (_posts) {
        if (_posts === [] || _posts?.length === 0) {
          setPosts(null);
        } else {
          if (posts?.length > 0) {
            let loaded_doubts = _posts;
            setPosts(loaded_doubts);
          } else {
            setPosts(_posts);
          }
        }
      } else {
        setPosts(null);
        setnoDataFound(true);
      }
    } else {
      if (
        typeof sortByDBString !== "undefined" &&
        typeof selectedSubject !== "undefined" &&
        typeof latestIsAnswered !== "undefined"
      ) {
        let [_posts] = await getDoubts({
          sortByDBString: sortByDBString,
          topLevel: latestTopLevel,
          selectedSubject: latestSubject,
          chapter: latestChapter,
          isAnswered: latestIsAnswered,
          lastDocument: lastDocument,
          grade: user.grade,
          selectedTopic,
        });

        if (_posts) {
          if (_posts === [] || _posts.length === 0) {
          } else {
            if (posts?.length > 0) {
              let new_doubts = _posts;
              let loaded_doubts = posts;

              setPosts(new_doubts);
              setLastDocument(
                loaded_doubts[loaded_doubts.length - 1]?.post?.doubt_url
              );
            } else {
              setPosts(_posts);
              setLastDocument(_posts[_posts.length - 1]?.post?.doubt_url);
            }
          }
        } else {
          setPosts(null);
        }
      }
    }

    setIsLoadingFeed(false);
    setShowMyDoubts(false);
  }

  function onCategoryClick(subject) {
    if (isSmallScreen) {
      if (smallScreenTopLevel === subject) {
        setSmallScreenTopLevel("General");
        setSmallScreenSelectedSubject("General");
      } else {
        setSmallScreenTopLevel(subject);
        setSmallScreenSelectedSubject("All");
      }
    } else {
      setSelectedSubject("All");
      setSelectedChapter("All");
      setSmallScreenSelectedChapter("All");
      setSmallScreenSelectedSubject("All");

      /// limiting the subject chips to 3 lines
      setLimitSubjectChips(true);

      if (topLevel === subject) {
        return resetSelection();
      } else {
        setTopLevel(subject);
        setSmallScreenTopLevel(subject);
      }
      updateFeed(subject, "All", "All", isAnswered);
      getCategoriesList();
      setpageName("homePage");
    }

    setSelectedTopic("");
  }

  function onChipClick(category) {
    if (category === selectedSubject) {
      setSelectedSubject("General");
      updateFeed(topLevel, "General", null, isAnswered, 2);
    } else if (category === "My Doubts" || category === "My Answers") {
      setSelectedSubject("My Doubts");
      showMyDoubtsFunc();
    } else if (category === "+ more") {
      setLimitSubjectChips(false);
    } else {
      if (topLevel === "Maths") {
        setSelectedSubject(category);
        setSelectedChapter(category);
        setShowMyDoubts(false);

        updateFeed(topLevel, category, category, isAnswered);
      } else {
        setSelectedSubject(category);
        setSelectedChapter(null);
        setShowMyDoubts(false);

        updateFeed(topLevel, category, null, isAnswered);
      }
    }
  }

  function showMyDoubtsFunc() {
    setShowMyDoubts(true);
  }

  const applySorting = () => {
    if (sortBy === "Recommended") {
      setSortByDBString("recommendation_score");
    } else if (sortBy === "Most popular") {
      setSortByDBString("vote_count");
    } else if (sortBy === "Recent first") {
      setSortByDBString("question_create_ts");
    }
  };

  const resetSelection = () => {
    if (isSmallScreen) {
      setSmallScreenTopLevel("General");
      setSmallScreenSelectedSubject("General");
      setsmallScreenSortBy("Recent first");
      setsmallScreenIsAnswered(isAnswered);
      setSmallScreenSelectedChapter("General");
    } else {
      setPosts([]);
      setSortByDBString("recommendation_score"); //used for firebase database query
      setTopLevel("General");
      setSelectedSubject("General");
      setSortBy("Recommended");
      setSelectedChapter("General");
      setIsAnswered(isAnswered);
      updateFeed("General", "General", "General", isAnswered);
    }
  };

  const applySelection = () => {
    if (smallScreenTopLevel !== topLevel) {
      setTopLevel(smallScreenTopLevel);
      if (smallScreenSelectedSubject !== selectedSubject) {
        setSelectedSubject(smallScreenSelectedSubject);
      } else {
        setSelectedSubject("All");
      }
    }

    if (isAnswered !== smallScreenIsAnswered) {
      setIsAnswered(smallScreenIsAnswered);
    }

    if (smallScreenSelectedSubject === "My Doubts") {
      setShowMyDoubts(true);
    }

    updateFeed(
      smallScreenTopLevel,
      smallScreenSelectedSubject,
      smallScreenTopLevel === "Maths" ? smallScreenSelectedSubject : null,
      smallScreenIsAnswered
    );
    applySorting();

    setMobileOpen(false);
  };

  const isInitialParams = () => {
    if (isSmallScreen) {
      return (
        smallScreenTopLevel === "General" &&
        smallScreenSelectedSubject === "General" &&
        smallScreenSortBy === "Recommended" &&
        smallScreenIsAnswered
      );
    }
    return (
      topLevel === "General" &&
      selectedSubject === "General" &&
      sortBy === "Recommended"
    );
  };

  const initialParamsSlug =
    "/doubts?toplevel=General&chapter=General&subject=General&answered=";

  const initialParamsSlugChip = `/doubts?toplevel=${topLevel}&chapter=All&subject=All&answered=`;

  return (
    <div
      className={
        isDarkMode
          ? `doubts__sidebar doubts__sidebar__dark ${
              wrongGrade ? "greySidebar" : ""
            }`
          : `doubts__sidebar ${wrongGrade ? "greySidebar" : ""}`
      }
    >
      <div className="home__categories">
        <div className="home__top">
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: "700" }}>Doubt Forum</h3>
            {!isInitialParams() && (
              <Link to={`${initialParamsSlug}${!isInstructor}`}>
                <button onClick={resetSelection} className="button">
                  <p
                    className={
                      isDarkMode
                        ? "sidebarResetBtn sidebarResetBtnDark"
                        : "sidebarResetBtn"
                    }
                  >
                    Reset
                  </p>
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="categoriesRow noTextSelection">
          <Link
            to={
              isSmallScreen
                ? "/doubts?toplevel=General&chapter=General&subject=General&answered=true"
                : topLevel !== "Maths"
                ? `/doubts?toplevel=Maths&chapter=All&subject=All&answered=${isAnswered}`
                : `${initialParamsSlug}${isAnswered}`
            }
          >
            <button
              className="button"
              onClick={() => onCategoryClick("Maths")}
              key={"Maths"}
            >
              <CategoryTile
                isSelected={
                  isSmallScreen
                    ? smallScreenTopLevel === "Maths"
                    : topLevel === "Maths"
                }
                imgAsset={MathsSelected}
                label="Maths"
              />
            </button>
          </Link>

          <Link
            to={
              isSmallScreen
                ? "/doubts?toplevel=General&chapter=General&subject=General&answered=true"
                : topLevel !== "Science"
                ? `/doubts?toplevel=Science&chapter=All&subject=All&answered=${isAnswered}`
                : `${initialParamsSlug}${isAnswered}`
            }
          >
            <button
              className="button"
              onClick={() => onCategoryClick("Science")}
              key={"Science"}
            >
              <CategoryTile
                isSelected={
                  isSmallScreen
                    ? smallScreenTopLevel === "Science"
                    : topLevel === "Science"
                }
                imgAsset={ScienceSelected}
                label="Science"
              />
            </button>
          </Link>

          <Link
            to={
              isSmallScreen
                ? "/doubts?toplevel=General&chapter=General&subject=General&answered=true"
                : topLevel !== "SST"
                ? `/doubts?toplevel=SST&chapter=All&subject=All&answered=${isAnswered}`
                : `${initialParamsSlug}${isAnswered}`
            }
          >
            <button
              className="button"
              onClick={() => onCategoryClick("SST")}
              key={"SST"}
            >
              <CategoryTile
                isSelected={
                  isSmallScreen
                    ? smallScreenTopLevel === "SST"
                    : topLevel === "SST"
                }
                imgAsset={SSTSelected}
                label="SST"
              />
            </button>
          </Link>

          <Link
            to={
              isSmallScreen
                ? "/doubts?toplevel=General&chapter=General&subject=General&answered=true"
                : topLevel !== "English"
                ? `/doubts?toplevel=English&chapter=All&subject=All&answered=${isAnswered}`
                : `${initialParamsSlug}${isAnswered}`
            }
          >
            <button
              className="button"
              onClick={() => onCategoryClick("English")}
              key={"English"}
            >
              <CategoryTile
                isSelected={
                  isSmallScreen
                    ? smallScreenTopLevel === "English"
                    : topLevel === "English"
                }
                imgAsset={EnglishSelected}
                label="English"
              />
            </button>
          </Link>
        </div>

        <div style={{ margin: "0px 8px", marginTop: "8px" }}>
          <div
            className="hr"
            style={{
              borderBottom: `1.5px solid ${isDarkMode ? "#444" : "#ddd"}`,
            }}
          ></div>
        </div>

        {/* Categorie Chips */}
        <div className="topics_topBar">
          <SectionHeaderLabel
            isDark={isDarkMode}
            label={
              topLevel === "General"
                ? "Topics"
                : topLevel === "Maths"
                ? "Chapters"
                : "Subjects"
            }
          />
        </div>

        <div className="subjectsChips">
          {getCategoriesList()?.length !== 0 ? (
            isExpanded ? (
              getCategoriesList()
                ?.slice(0, limitSubjectChips ? 6 : getCategoriesList()?.length)
                .map((category) =>
                  category !== "Recommended" ? (
                    <button
                      onClick={() => {
                        onChipClick(category);
                        setSelectedTopic("");
                      }}
                      className="button"
                      key={uuid()}
                    >
                      {isSmallScreen ? (
                        <CustomChip
                          label={category}
                          isDark={isDarkMode}
                          isSelected={
                            isSmallScreen
                              ? smallScreenSelectedSubject === category
                              : selectedSubject === category
                          }
                        />
                      ) : (
                        <Link
                          to={
                            selectedChapter !== category &&
                            selectedSubject !== category
                              ? `/doubts?toplevel=${topLevel}&chapter=${category}&subject=${category}&answered=${isAnswered}`
                              : `${initialParamsSlugChip}${isAnswered}`
                          }
                        >
                          <CustomChip
                            label={category}
                            isDark={isDarkMode}
                            isSelected={
                              isSmallScreen
                                ? smallScreenSelectedSubject === category
                                : selectedSubject === category
                            }
                          />
                        </Link>
                      )}
                    </button>
                  ) : (
                    <></>
                  )
                )
            ) : (
              <></>
            )
          ) : (
            <>
              <div>
                <ChipLoader /> <ChipLoader />
              </div>
            </>
          )}

          {limitSubjectChips ? (
            getCategoriesList().length > 6 ? (
              <button
                onClick={() => onChipClick("+ more")}
                className="button"
                key={uuid()}
              >
                <CustomChip
                  label={"+ more"}
                  isSelected={selectedSubject === "+ more"}
                />
              </button>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
        </div>
        <SortAndFilter applySorting={applySorting} updateFeed={updateFeed} />

        {/* popup */}

        {!isSmallScreen && (
          <div style={{ margin: "auto 20px" }}>
            <button
              onClick={() => {
                if (isUserPro) {
                  setOpen(true);
                } else {
                  setIsSliderOpen(true);
                }
              }}
              className="askDoubtPopup__btn"
            >
              <p>Ask Your Doubt</p>
            </button>
          </div>
        )}
        <AskDoubtPopup
          shouldShowCategoriePicker={true}
          applySelection={applySelection}
          setMobileOpen={setMobileOpen}
          updateSidebarSelectionOnQuestionUpdated={
            updateSidebarSelectionOnQuestionUpdated
          }
        />
      </div>
    </div>
  );
}
