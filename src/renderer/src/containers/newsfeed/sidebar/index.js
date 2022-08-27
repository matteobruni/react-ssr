import React, { useEffect, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import FilterOption from "./filter-option";
import { NewsFeedContext, UserContext, ThemeContext } from "../../../context";
import allIcon from "../../../assets/images/icons/globe.png";
import bookmarkIcon from "../../../assets/images/icons/bookmark.png";
import vocabIcon from "../../../assets/images/icons/vocab.svg";
import factsIcon from "../../../assets/images/icons/facts.svg";
import mentalHealthIcon from "../../../assets/images/icons/mental_health.svg";
import mathsIcon from "../../../assets/images/icons/maths.svg";
import whyStudyIcon from "../../../assets/images/icons/why_study.svg";
import freePeriodIcon from "../../../assets/images/icons/free_period.svg";
import {
  fetchUserLikedPosts,
  getPostsByGrade,
  getPostsByTags,
} from "../../../database";
import "./style.scss";

export default function Sidebar({ handleDrawerToggle }) {
  const [user] = useContext(UserContext).user;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [, setPosts] = useContext(NewsFeedContext).posts;
  const [, setIsLoading] = useContext(NewsFeedContext).isLoading;
  const [, setlastDocument] = useContext(NewsFeedContext).lastDocument;
  const [, setMobileOpen] = useContext(NewsFeedContext).mobileOpen;
  const [selectedFilterOption, setSelectedFilterOption] =
    useContext(NewsFeedContext).selectedFilterOption;
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

  const isTabletScreen = useMediaQuery({ query: "(max-width: 1200px)" });

  const onSelectedFilterOptionChange = async (selectedOption) => {
    setSelectedFilterOption(selectedOption);

    switch (selectedOption) {
      case "All":
        // getPostsByGrade({ group: "Exam Related" });
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

  return (
    <div
      className={
        isDarkMode ? "newsfeedSidebar newsfeedSidebarDark" : "newsfeedSidebar"
      }
    >
      <div className="newsfeedSidebar_header">
        <h3>News Feed</h3>
      </div>
      <div className="newsfeedSidebar_filterOptions">
        {filterTabs !== null && (
          <>
            <FilterOption
              onClick={() => {
                onSelectedFilterOptionChange("All");
                isTabletScreen && handleDrawerToggle();
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              imgSrc={allIcon}
              label={"All"}
              selectedFilterOption={selectedFilterOption}
              delay={1}
            />
            <FilterOption
              onClick={() => {
                onSelectedFilterOptionChange("Bookmarked");
                isTabletScreen && handleDrawerToggle();
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              imgSrc={bookmarkIcon}
              label={"Bookmarked"}
              selectedFilterOption={selectedFilterOption}
              delay={2}
            />
          </>
        )}
        {filterTabs !== null &&
          filterTabs?.map((tab, i) => {
            return (
              <FilterOption
                onClick={() => {
                  onSelectedFilterOptionChange(tab?.label);
                  isTabletScreen && handleDrawerToggle();
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 1000);
                }}
                imgSrc={tab.icon}
                label={tab.label}
                selectedFilterOption={selectedFilterOption}
                delay={i + 3}
              />
            );
          })}
      </div>
    </div>
  );
}
