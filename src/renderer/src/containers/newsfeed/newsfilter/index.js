import React, { useEffect, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import vocabIcon from "../../../assets/images/icons/vocab.svg";
import factsIcon from "../../../assets/images/icons/facts.svg";
import mentalHealthIcon from "../../../assets/images/icons/mental_health.svg";
import mathsIcon from "../../../assets/images/icons/maths.svg";
import whyStudyIcon from "../../../assets/images/icons/why_study.svg";
import freePeriodIcon from "../../../assets/images/icons/free_period.svg";
import {
  getPostsByGrade,
  fetchUserLikedPosts,
  getPostsByTags,
} from "./../../../database";
import { UserContext, ThemeContext, NewsFeedContext } from "./../../../context";

import fireIcon from "../../../assets/images/fire.svg";
import ChipLoader from "./../../../components/doubts_forum/chip-loader";
import searchIcon from "../../../assets/images/icons/search-icon.png";

import "./style.scss";

const NewsFilter = () => {
  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;
  const [, setOpenMobileSearch] = useContext(UserContext).openMobileSearch;

  const [selectedFilterOption, setSelectedFilterOption] =
    useContext(NewsFeedContext).selectedFilterOption;
  const [, setIsLoading] = useContext(NewsFeedContext).isLoading;

  const [, setPosts] = useContext(NewsFeedContext).posts;
  const [, setlastDocument] = useContext(NewsFeedContext).lastDocument;
  const [, setMobileOpen] = useContext(NewsFeedContext).mobileOpen;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 430px)" });

  const filterTabs = [
    {
      label: "Vocab",
      icon: vocabIcon,
    },
    {
      label: "Facts",
      icon: factsIcon,
    },
    {
      label: "Mental Health",
      icon: mentalHealthIcon,
    },
    {
      label: "Maths",
      icon: mathsIcon,
    },
    {
      label: "Why Study __?",
      icon: whyStudyIcon,
    },
    {
      label: "Free Period",
      icon: freePeriodIcon,
    },
  ];

  useEffect(() => {
    isSmallScreen && window.addEventListener("scroll", scrollFunction);

    return () => {
      isSmallScreen && window.removeEventListener("scroll", scrollFunction);
    };
  }, [isSmallScreen]);

  function scrollFunction() {
    let scrollTop = this.scrollY;

    if (scrollTop < 108) {
      if (document.getElementById("filterbar")) {
        document.getElementById("filterbar").style.display = "none";
      }
    } else {
      if (document.getElementById("filterbar")) {
        document.getElementById("filterbar").style.display = "block";
      }
    }
  }

  const onSelectedFilterOptionChange = async (selectedOption) => {
    setSelectedFilterOption(selectedOption);

    switch (selectedOption) {
      case "All":
        setMobileOpen(false);
        let [
          examRelatedFeedPosts,
          examRelatedFirstDocument,
          examRelatedFeedLastDocument,
        ] = await getPostsByGrade(user?.grade);

        setPosts(examRelatedFeedPosts);
        setlastDocument(examRelatedFeedLastDocument);
        break;

      case "Trending":
        setMobileOpen(false);
        break;

      case "Bookmarked":
        setMobileOpen(false);
        let [liked_feed_posts, liked_feed_first, liked_feed_last] =
          await fetchUserLikedPosts({
            userID: user.uid,
            grade: user.grade,
            lastDocument: null,
          });
        setPosts(liked_feed_posts);
        setlastDocument(liked_feed_last);
        break;

      default:
        setMobileOpen(false);
        let [tagFeedPosts, tagFirstDocument, tagLastDocument] =
          await getPostsByTags({
            grade: user?.grade,
            group: selectedOption,
          });

        setPosts(tagFeedPosts);
        setlastDocument(tagLastDocument);
        break;
    }
  };

  const getClassName = (label) => {
    let className = "customChip fadeIn";
    if (isDark) className += " customChipDark";
    if (selectedFilterOption === label) className += " selected";

    return className;
  };

  return (
    <div className={isDark ? "newsfeedFilters dark" : "newsfeedFilters"}>
      {filterTabs && (
        <>
          <div
            className="filter__icon"
            onClick={() => {
              navigator && navigator.vibrate && navigator.vibrate(5);
              onSelectedFilterOptionChange(
                selectedFilterOption === "Bookmarked" ? "All" : "Bookmarked"
              );
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            {selectedFilterOption === "Bookmarked" ? (
              <BookmarkIcon />
            ) : (
              <img
                src={
                  "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fbookmark.svg?alt=media&token=135817ce-6b66-408b-856d-97dab1f2095e"
                }
                alt={"b"}
              />
            )}
          </div>
        </>
      )}
      <div id="filterbar">
        <div className={isDark ? "filterbarInner dark" : "filterbarInner"}>
          <div
            className="filter__icon"
            onClick={() => {
              navigator && navigator.vibrate && navigator.vibrate(5);
              onSelectedFilterOptionChange("Bookmarked");
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            {selectedFilterOption === "Bookmarked" ? (
              <BookmarkIcon />
            ) : (
              <img
                src={
                  "https://firebasestorage.googleapis.com/v0/b/avian-display-193502.appspot.com/o/assets%2Fnewsfeed%2Fbookmark.svg?alt=media&token=135817ce-6b66-408b-856d-97dab1f2095e"
                }
                alt={"b"}
              />
            )}
          </div>
          <div className="filters">
            <h6>{selectedFilterOption}</h6>
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
      <div className="subjectsChips">
        {filterTabs ? (
          <>
            <div
              className={getClassName("All")}
              onClick={() => {
                navigator && navigator.vibrate && navigator.vibrate(5);
                onSelectedFilterOptionChange("All");
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
            >
              <p>All</p>
            </div>
            <div
              className={getClassName("Trending")}
              onClick={() => {
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
            >
              <img className="trending" src={fireIcon} alt={"trending"} />
              <p>Trending</p>
            </div>

            {filterTabs?.map(({ icon, label }) => (
              <div
                className={getClassName(label)}
                onClick={() => {
                  navigator && navigator.vibrate && navigator.vibrate(5);
                  onSelectedFilterOptionChange(label);
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 1000);
                }}
              >
                <img src={icon} alt={"."} /> <p>{label}</p>
              </div>
            ))}
            <div style={{ minWidth: "10px" }} />
          </>
        ) : (
          <div className="subjectsChips" style={{ marginTop: "-2.5px" }}>
            {Array(4)
              .fill("")
              .map((_) => (
                <ChipLoader />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFilter;
