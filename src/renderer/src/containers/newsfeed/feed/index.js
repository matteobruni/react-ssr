import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { UserContext, ThemeContext, NewsFeedContext } from "../../../context";
import EmptyBox from "../../../assets/lottie/empty-box.json";
import { useMediaQuery } from "react-responsive";
import Post from "../posts/post";
import NewPost from "../posts/new-post";
import PustackLogo from "../../../assets/images/logo.png";

import { FeedLoader } from "../../../components";

import {
  fetchPosts,
  getPostsByGrade,
  fetchUserLikedPosts,
} from "../../../database";
import PostContextProvider from "../../../context/newsfeed/PostContext";
import Lottie from "lottie-react-web";
import NewsFilter from "../newsfilter";
import "./style.scss";

export default function NewsFeed() {
  const [user] = useContext(UserContext).user;
  const [posts, setPosts] = useContext(NewsFeedContext).posts;
  const [lastDocument, setlastDocument] =
    useContext(NewsFeedContext).lastDocument;
  const [, setfirstDocument] = useState(null);
  const [hasMore, setHasmore] = useState(true);

  const [isLoading, setIsLoading] = useContext(NewsFeedContext).isLoading;

  const [selectedFilterOption] =
    useContext(NewsFeedContext).selectedFilterOption;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const observer = useRef();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 430px)" });

  useEffect(() => {
    window.scrollTo(0, 0);
    setPosts([]);
    setIsLoading(true);
    setHasmore(true);
    loadMore();
  }, [user?.grade]);

  const loadMore = async () => {
    let feed_first = null,
      feed_last = null,
      feedposts = null;

    if (lastDocument !== null) {
      feed_last = lastDocument;
    }

    switch (selectedFilterOption) {
      case "All":
        let [all_feed_posts, all_feed_first, all_feed_last] = await fetchPosts({
          userID: user?.uid,
          grade: user?.grade,
          lastDocument: posts?.length > 0 ? lastDocument : null,
        });
        feedposts = all_feed_posts;
        feed_first = all_feed_first;
        feed_last = all_feed_last;
        break;
      case "Trending":
        let [trending_feed_posts, trending_feed_first, trending_feed_last] =
          await fetchPosts({
            userID: user?.uid,
            grade: user?.grade,
            lastDocument: posts?.length > 0 ? lastDocument : null,
          });
        feedposts = trending_feed_posts;
        feed_first = trending_feed_first;
        feed_last = trending_feed_last;
        break;
      case "Exam Related":
        let [
          examrelated_feed_posts,
          examrelated_feed_first,
          examrelated_feed_last,
        ] = await fetchPosts({
          userID: user?.uid,
          grade: user?.grade,
          lastDocument: posts?.length > 0 ? lastDocument : null,
        });
        feedposts = examrelated_feed_posts;
        feed_first = examrelated_feed_first;
        feed_last = examrelated_feed_last;
        break;

      case "Class 9th":
        let [class9_feed_posts, class9_feed_first, class9_feed_last] =
          await getPostsByGrade("Class 9", lastDocument);
        feedposts = class9_feed_posts;
        feed_first = class9_feed_first;
        feed_last = class9_feed_last;
        break;
      case "Class 10th":
        let [class10_feed_posts, class10_feed_first, class10_feed_last] =
          await getPostsByGrade("Class 10", lastDocument);
        feedposts = class10_feed_posts;
        feed_first = class10_feed_first;
        feed_last = class10_feed_last;
        break;
      case "Bookmarked":
        let [liked_feed_posts, liked_feed_first, liked_feed_last] =
          await fetchUserLikedPosts({
            userID: user?.uid,
            grade: user?.grade,
            lastDocument: posts?.length > 0 ? lastDocument : null,
          });
        feedposts = liked_feed_posts;
        feed_first = liked_feed_first;
        feed_last = liked_feed_last;
        break;

      default:
        let [default_feed_posts, default_feed_first, default_feed_last] =
          await fetchPosts({
            userID: user?.uid,
            grade: user?.grade,
            lastDocument: posts?.length > 0 ? lastDocument : null,
          });
        feedposts = default_feed_posts;
        feed_first = default_feed_first;
        feed_last = default_feed_last;
        break;
    }

    if (feedposts?.length === 0) {
      setHasmore(false);
    } else {
      if (posts?.length !== 0 && posts !== null) {
        setfirstDocument(feed_first);
        setPosts([...posts, ...feedposts]);
      } else {
        setPosts([...feedposts]);
      }
    }
    setlastDocument(feed_last);
    setIsLoading(false);
  };

  const addNewPost = (json) => {
    setPosts([json, ...posts]);
  };

  const deletePost = (docID) => {
    let _temp = posts;
    _temp = _temp.filter((_) => _.id !== docID);

    setPosts(_temp);
  };

  const lastPostRef = useCallback(function (node) {
    if (node !== null) {
      if (isLoading) {
        return;
      }
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (hasMore) {
            setIsLoading(true);
            loadMore().then(() => {
              setIsLoading(false);
            });
          }
        }
      });
      if (node) observer.current.observe(node);
    }
  });

  return (
    <div className="newsfeed-feed">
      {isSmallScreen && <NewsFilter />}
      {selectedFilterOption === "All" && (
        <NewPost onCreate={(_) => addNewPost(_)} />
      )}
      {(posts || "") &&
        posts?.length === 0 &&
        selectedFilterOption !== "Bookmarked" &&
        isLoading && (
          <div className="feed-loader-column">
            <FeedLoader />
            <FeedLoader />
          </div>
        )}
      {(posts || "") &&
        posts?.map((post, index) => {
          return (
            <div ref={posts.length - 2 === index ? lastPostRef : null}>
              <PostContextProvider>
                <Post
                  onDelete={(e) => deletePost(e)}
                  index={post.index}
                  key={post.id}
                  type={post.data.type}
                  body={post}
                />
              </PostContextProvider>
            </div>
          );
        })}
      {!isLoading && (!(posts || "") || posts?.length === 0) && (
        <div
          className={isDarkMode ? "newsfeed-no-post dark" : "newsfeed-no-post"}
        >
          <Lottie
            options={{
              animationData: EmptyBox,
              loop: false,
            }}
            speed={0.55}
          />
          <h4>No {selectedFilterOption} posts</h4>
          <h6>Explore the world of PuStack News.</h6>
        </div>
      )}

      {isLoading && (
        <div className="doubt_loader_container">
          <FeedLoader />
        </div>
      )}

      {!hasMore && posts?.length > 0 && (
        <div className="powered__by">
          <img className="powered__by__icon" src={PustackLogo} />
          <p className="poweredBy">Powered By PuStack Education</p>
        </div>
      )}
    </div>
  );
}
