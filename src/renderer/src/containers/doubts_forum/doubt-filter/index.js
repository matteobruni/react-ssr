import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { KeyboardArrowDown } from "@material-ui/icons";
import { SwipeableDrawer } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckIcon from "@material-ui/icons/Check";
import { useMediaQuery } from "react-responsive";
import {
  SidebarContext,
  PageContext,
  PostsContext,
  UserContext,
  ThemeContext,
} from "./../../../context";
import CategoryTile from "./../../../components/doubts_forum/category-tile";
import {
  MathsSelected,
  ScienceSelected,
  SSTSelected,
  EnglishSelected,
} from "../../../assets";
import "./style.scss";
import {
  getFilterData,
  getDoubts,
  getMyDoubts,
  getInstructorMyDoubts,
  resetUnreadMsgCount,
} from "../../../database";
import starIcon from "../../../assets/images/star.svg";
import fireIcon from "../../../assets/images/fire.svg";
import clockIcon from "../../../assets/images/time.svg";
import filterIcon from "../../../assets/images/filter.png";
import searchIcon from "../../../assets/images/icons/search-icon.png";
import ChipLoader from "./../../../components/doubts_forum/chip-loader";
import CustomChip from "./../../../components/doubts_forum/custom-chip";

const DoubtFilter = () => {
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
  const [, setLimitSubjectChips] = useContext(SidebarContext).limitSubjectChips;
  const [sortByDBString, setSortByDBString] =
    useContext(SidebarContext).sortByDBString;
  const [sortBy, setSortBy] = useContext(SidebarContext).sortBy;
  const [posts, setPosts] = useContext(PostsContext);
  const [, setpageName] = useContext(PageContext).pageName;
  const [, setIsLoadingFeed] = useContext(SidebarContext).isLoadingFeed;
  const [lastDocument, setLastDocument] =
    useContext(SidebarContext).lastDocument;
  const [, setnoDataFound] = useContext(SidebarContext).noDataFound;

  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [unreadAnswerCount] = useContext(UserContext).unreadAnswerCount;
  const [, setOpenMobileSearch] = useContext(UserContext).openMobileSearch;

  const [openSortAndFilter, setOpenSortAndFilter] = useState(false);
  const [generalCategories, setGeneralCategories] = useState([]);
  const [scienceCategories, setScienceCategories] = useState([]);
  const [englishCategories, setEnglishCategories] = useState([]);
  const [mathCategories, setMathCategories] = useState([]);
  const [sstCategories, setSstCategories] = useState([]);

  const [answered, setAnswered] = useState(isAnswered);
  const [sortOrder, setSortOrder] = useState(sortBy);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    getSetFilterData();
  }, []);

  useEffect(() => {
    isSmallScreen && window.addEventListener("scroll", scrollFunction);

    return () => {
      isSmallScreen && window.removeEventListener("scroll", scrollFunction);
    };
  }, [isSmallScreen]);

  useEffect(() => {
    if (selectedSubject === "My Doubts" && unreadAnswerCount > 0) {
      resetUnreadMsgCount({ grade: user?.grade, userId: user?.uid });
    }
  }, [selectedSubject, unreadAnswerCount, user?.grade]);

  function scrollFunction() {
    let scrollTop = this.scrollY;

    if (scrollTop < 208) {
      if (document.getElementById("filterbar")) {
        document.getElementById("filterbar").style.display = "none";
      }
    } else {
      if (document.getElementById("filterbar")) {
        document.getElementById("filterbar").style.display = "block";
      }
    }
  }

  function onCategoryClick(subject) {
    setSelectedSubject("All");
    setSelectedChapter("All");
    setLimitSubjectChips(true);

    if (topLevel === subject) {
      return resetSelection();
    } else {
      setTopLevel(subject);
    }
    getCategoriesList();
    setpageName("homePage");
    setSelectedTopic("");
  }

  function onChipClick(category) {
    if (category === selectedSubject) {
      setSelectedSubject("General");
      updateFeed(topLevel, "General", null, isAnswered, 2);
    } else if (category === "My Doubts" || category === "My Answers") {
      setSelectedSubject("My Doubts");
      setShowMyDoubts(true);
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

  const resetSelection = () => {
    setPosts([]);
    setSortByDBString("recommendation_score");
    setTopLevel("General");
    setSelectedSubject("General");
    setSortBy("Recommended");
    setSelectedChapter("General");
    setIsAnswered(isAnswered);
    updateFeed("General", "General", "General", isAnswered);
  };

  function getCategoriesList() {
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

  async function getSetFilterData() {
    let filter_data = await getFilterData(user.grade);

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

  const initialParamsSlug =
    "/doubts?toplevel=General&chapter=General&subject=General&answered=";

  const initialParamsSlugChip = `/doubts?toplevel=${topLevel}&chapter=All&subject=All&answered=`;

  const onApplyBtnClick = () => {
    setIsAnswered(answered);
    setSortBy(sortOrder);
    setOpenSortAndFilter(false);
    navigator && navigator.vibrate && navigator.vibrate(5);
  };

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

  return (
    <div className="filter__categories">
      {getCategoriesList()?.length !== 0 && (
        <div
          className="filter__icon"
          onClick={() => {
            setOpenSortAndFilter(true);
            navigator && navigator.vibrate && navigator.vibrate(5);
          }}
        >
          <img src={filterIcon} alt="filter" draggable={false} />
        </div>
      )}

      <div id="filterbar">
        <div className={isDark ? "filterbarInner dark" : "filterbarInner"}>
          <div
            className="filter__icon"
            onClick={() => {
              setOpenSortAndFilter(true);
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
          >
            <img src={filterIcon} alt="filter" />
          </div>
          <div className="filters">
            <h6>
              {topLevel} • {sortBy} • {isAnswered ? "Answered" : "Unanswered"}
            </h6>
          </div>
          <div className="search__icon">
            <img
              src={searchIcon}
              alt="search"
              onClick={() => setOpenMobileSearch(true)}
            />
          </div>
        </div>
      </div>
      <div className="categoriesRow noTextSelection">
        <Link
          to={
            topLevel !== "Maths"
              ? `/doubts?toplevel=Maths&chapter=All&subject=All&answered=${isAnswered}`
              : `${initialParamsSlug}${isAnswered}`
          }
        >
          <button
            className={
              !["General", "Maths"].includes(topLevel)
                ? "button btn-not-selected"
                : "button"
            }
            onClick={() => {
              onCategoryClick("Maths");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
            key={"Maths"}
          >
            <CategoryTile
              isSelected={topLevel === "Maths"}
              imgAsset={MathsSelected}
              label="Maths"
            />
          </button>
        </Link>

        <Link
          to={
            topLevel !== "Science"
              ? `/doubts?toplevel=Science&chapter=All&subject=All&answered=${isAnswered}`
              : `${initialParamsSlug}${isAnswered}`
          }
        >
          <button
            className={
              !["General", "Science"].includes(topLevel)
                ? "button btn-not-selected"
                : "button"
            }
            onClick={() => {
              onCategoryClick("Science");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
            key={"Science"}
          >
            <CategoryTile
              isSelected={topLevel === "Science"}
              imgAsset={ScienceSelected}
              label="Science"
            />
          </button>
        </Link>

        <Link
          to={
            topLevel !== "SST"
              ? `/doubts?toplevel=SST&chapter=All&subject=All&answered=${isAnswered}`
              : `${initialParamsSlug}${isAnswered}`
          }
        >
          <button
            className={
              !["General", "SST"].includes(topLevel)
                ? "button btn-not-selected"
                : "button"
            }
            onClick={() => {
              onCategoryClick("SST");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
            key={"SST"}
          >
            <CategoryTile
              isSelected={topLevel === "SST"}
              imgAsset={SSTSelected}
              label="SST"
            />
          </button>
        </Link>

        <Link
          to={
            topLevel !== "English"
              ? `/doubts?toplevel=English&chapter=All&subject=All&answered=${isAnswered}`
              : `${initialParamsSlug}${isAnswered}`
          }
        >
          <button
            className={
              !["General", "English"].includes(topLevel)
                ? "button btn-not-selected"
                : "button"
            }
            onClick={() => {
              onCategoryClick("English");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
            key={"English"}
          >
            <CategoryTile
              isSelected={topLevel === "English"}
              imgAsset={EnglishSelected}
              label="English"
            />
          </button>
        </Link>
      </div>
      <div className="subjectsChips">
        {getCategoriesList()?.length !== 0 && topLevel === "General" && (
          <div
            className={
              isDark ? "customChip customChipDark fadeIn" : "customChip fadeIn"
            }
            onClick={() => {
              setOpenSortAndFilter(true);
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
          >
            <p>{sortBy} &nbsp;| </p>
            <KeyboardArrowDown />
          </div>
        )}
        {getCategoriesList()?.length !== 0 ? (
          getCategoriesList()?.map(
            (category, i) =>
              category !== "Recommended" && (
                <button
                  onClick={() => {
                    onChipClick(category);
                    navigator && navigator.vibrate && navigator.vibrate(5);
                    setSelectedTopic("");
                  }}
                  className="button fadeIn"
                  style={{ animationDelay: `${0.05 * (i + 1)}s` }}
                  key={category}
                >
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
                      isDark={isDark}
                      isSelected={selectedSubject === category}
                    />
                  </Link>
                </button>
              )
          )
        ) : (
          <div className="subjectsChips" style={{ marginTop: "-2.5px" }}>
            {Array(4)
              .fill("")
              .map((_) => (
                <ChipLoader />
              ))}
          </div>
        )}
        {getCategoriesList()?.length !== 0 && (
          <div style={{ minWidth: "10px" }} />
        )}
      </div>

      <SwipeableDrawer
        variant="temporary"
        open={openSortAndFilter}
        anchor={"bottom"}
        onClose={() => {
          setOpenSortAndFilter(false);
          setAnswered(isAnswered);
          setSortOrder(sortBy);
          navigator && navigator.vibrate && navigator.vibrate(5);
        }}
        className={isDark ? "sortAndFilter dark" : "sortAndFilter"}
        ModalProps={{ keepMounted: true }}
      >
        <div className="sortAndFilterHead">
          {answered !== isAnswered ||
            (sortOrder !== sortBy && (
              <h6
                onClick={() => {
                  setAnswered(isAnswered);
                  setSortOrder(sortBy);
                  navigator && navigator.vibrate && navigator.vibrate(5);
                }}
              >
                Reset
              </h6>
            ))}
          <h1>Sort and Filter</h1>
          <CancelIcon
            onClick={() => {
              setOpenSortAndFilter(false);
              setAnswered(isAnswered);
              setSortOrder(sortBy);
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
          />
        </div>
        <div className="answerStatus">
          <h2>Answer Status</h2>
          <div>
            <button
              className={answered ? "selected" : "not-selected"}
              onClick={() => {
                setAnswered(true);
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
            >
              Answered
            </button>
            <button
              className={!answered ? "selected" : "not-selected"}
              onClick={() => {
                setAnswered(false);
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
            >
              Unanswered
            </button>
          </div>
        </div>
        <div className="sort">
          <h2>Sort</h2>
          <div
            className="sortItem"
            onClick={() => {
              setSortOrder("Recommended");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
          >
            <img src={starIcon} alt="star" />
            <h4>Recommended</h4>
            {sortOrder === "Recommended" && <CheckIcon />}
          </div>
          <div
            className="sortItem"
            onClick={() => {
              setSortOrder("Most popular");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
          >
            <img src={fireIcon} alt="fire" />
            <h4>Most popular</h4>
            {sortOrder === "Most popular" && <CheckIcon />}
          </div>
          <div
            className="sortItem"
            onClick={() => {
              setSortOrder("Recent first");
              navigator && navigator.vibrate && navigator.vibrate(5);
            }}
          >
            <img src={clockIcon} alt="clock" />
            <h4>Recent first</h4>
            {sortOrder === "Recent first" && <CheckIcon />}
          </div>
        </div>
        <button className="applyButton" onClick={onApplyBtnClick}>
          Apply
        </button>
      </SwipeableDrawer>
    </div>
  );
};

export default DoubtFilter;
