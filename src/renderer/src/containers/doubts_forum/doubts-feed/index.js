import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { v1 as uuid } from "uuid";
import { DoubtTile } from "../../../containers";
import { DoubtLoader } from "../../../components";
import PustackLogo from "../../../assets/images/logo.png";
import { SidebarContext, UserContext, PostsContext } from "../../../context";
import DoubtContextProvider from "../../../context/doubts_forum/DoubtContext";
import {
  fetchMoreDoubts,
  fetchMoreMyDoubts,
  getDoubts,
} from "../../../database";
import "./style.scss";

function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value);
}

export default function DoubtsFeed({
  exceptDoubtId,
  pageName,
  getTopLevel,
  getSelectedSubject,
  getSelectedChapter,
  getIsAnswered,
}) {
  const [user] = useContext(UserContext).user;
  const [posts, setPosts] = useContext(PostsContext);

  const [topLevel] = useContext(SidebarContext).topLevel;
  const [isAnswered] = useContext(SidebarContext).isAnswered;
  const [selectedTopic] = useContext(SidebarContext).selectedTopic;
  const [sortByDBString] = useContext(SidebarContext).sortByDBString;
  const [selectedSubject] = useContext(SidebarContext).selectedSubject;
  const [lastDocument, setLastDocument] =
    useContext(SidebarContext).lastDocument;
  const [, setnoDataFound] = useContext(SidebarContext).noDataFound;
  const [selectedChapter] = useContext(SidebarContext).selectedChapter;
  const [, setIsLoadingFeed] = useContext(SidebarContext).isLoadingFeed;

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreDoubts, setHasMoreDoubts] = useState(true);

  const observer = useRef();
  const similarDoubtsRef = useRef();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    setPosts([]);
    updateFeed(
      getTopLevel,
      getSelectedSubject,
      getSelectedChapter,
      getIsAnswered
    );
  }, [getTopLevel, getSelectedSubject, getSelectedChapter, selectedTopic]);

  useEffect(() => {
    if (typeof similarDoubtsRef.current !== "undefined") {
      setIsMounted(true);
    } else {
      setIsMounted(false);
    }
  });

  useEffect(() => {
    if (posts === null) {
      setHasMoreDoubts(false);
    } else {
      setHasMoreDoubts(true);
    }
  }, [posts]);

  useEffect(() => {
    if (posts?.length < 2) {
      setHasMoreDoubts(false);
    }
  }, [posts]);

  async function updateFeed(
    latestTopLevel,
    latestSubject,
    latestChapter,
    latestIsAnswered
  ) {
    setIsLoadingFeed(true);

    if (
      typeof sortByDBString !== "undefined" &&
      typeof selectedSubject !== "undefined" &&
      typeof latestIsAnswered !== "undefined"
    ) {
      let [_posts, _last] = await getDoubts({
        sortByDBString: sortByDBString,
        topLevel: latestTopLevel,
        selectedSubject: latestSubject,
        chapter: latestChapter,
        isAnswered: latestIsAnswered,
        lastDocument: lastDocument,
        grade: user?.grade,
        similarDoubts: true,
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
              loaded_doubts[loaded_doubts.length - 1].post.doubt_url
            );
          } else {
            console.info(`setPosts Called line:273 sidebar _posts`);
            setPosts(_posts);
          }
        }
      } else {
        setPosts(null);
      }
    }

    setIsLoadingFeed(false);
    window.scrollTo(0, 0);
  }

  const loadMore = async () => {
    if (topLevel === "General" && selectedSubject === "My Doubts") {
      try {
        if (posts) {
          let [_posts, lastDocumentId] = await fetchMoreMyDoubts({
            userID: user.uid,
            lastDocument: posts[posts.length - 1].post.question_create_ts,
            sortByDBString: sortByDBString,
            lastPostId: posts[posts.length - 1].id,
          });
          if (lastDocumentId) setLastDocument(lastDocumentId);
          if (_posts) {
            if (_posts === [] || _posts?.length === 0) {
              if (isMounted) {
                setPosts(null);
              }
            } else {
              if (posts?.length > 0) {
                let temp_doubts_obj = posts;
                _posts.map((doubt) => {
                  temp_doubts_obj.push({ id: doubt.id, post: doubt.post });
                });
                if (isMounted) {
                  setPosts([...uniquePosts(temp_doubts_obj)]);
                  forceUpdate();
                } else {
                  if (posts) forceUpdate();
                  if (posts.length < 3) {
                    setHasMoreDoubts(false);
                  }
                }
              } else {
                if (isMounted) {
                  forceUpdate();
                  setPosts([...uniquePosts(_posts)]);
                }
              }
            }
          } else {
            setHasMoreDoubts(false);
            setnoDataFound(true);
          }
        }
      } catch (error) {
        setHasMoreDoubts(false);
      }
    } else {
      if (
        typeof sortByDBString !== "undefined" &&
        typeof selectedSubject !== "undefined" &&
        typeof isAnswered !== "undefined" &&
        (posts || "") &&
        typeof posts[posts?.length - 1] !== "undefined"
      ) {
        if (posts) {
          let [_posts, _last] = await fetchMoreDoubts({
            sortByDBString: sortByDBString,
            topLevel: topLevel,
            selectedSubject: selectedSubject,
            chapter: selectedChapter,
            isAnswered: isAnswered,
            lastDocument: posts[posts.length - 1],
            lastPostId: posts[posts.length - 1].id,
            grade: user?.grade,
          });

          if (_posts) {
            let temp_doubts_obj = posts;

            _posts.map((doubt) => {
              temp_doubts_obj.push({ id: doubt.id, post: doubt.post });
            });

            setPosts([...new Set(temp_doubts_obj)]);

            if (_last)
              setLastDocument(
                temp_doubts_obj[temp_doubts_obj.length - 1].post.doubt_url
              );
          } else {
            setHasMoreDoubts(false);
          }
        }
      } else {
        setHasMoreDoubts(false);
      }
      if (!posts) {
        setnoDataFound(true);
      }
    }
  };

  const lastDoubtRef = useCallback(function (node) {
    if (node !== null) {
      if (isLoading) {
        return;
      }

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (hasMoreDoubts) {
            loadMore().then(() => {
              setIsLoading(false);
            });
          }
        }
      });
      if (node) observer.current.observe(node);
    }
  });

  const uniquePosts = (posts) => {
    return posts?.filter(
      (post, i, a) => a.findIndex((p) => p.id === post.id) === i
    );
  };

  return (
    <div className="similar-doubts">
      {uniquePosts(posts)?.map(({ id, post }, index) =>
        post?.question_text ? (
          <div
            className="similar-doubtsDiv"
            key={id}
            ref={uniquePosts(posts).length - 1 === index ? lastDoubtRef : null}
            style={{
              display:
                uniquePosts(posts) &&
                uniquePosts(posts)?.length !== 0 &&
                exceptDoubtId !== id
                  ? "flex"
                  : "none",
            }}
          >
            <DoubtContextProvider>
              <DoubtTile
                doubtData={post}
                doubtId={id}
                isDoubtPageFeed={pageName === "doubtPage"}
                key={id}
                setHasMoreDoubts={setHasMoreDoubts}
              />
            </DoubtContextProvider>
          </div>
        ) : (
          <p>{`No ${isAnswered ? "Answered" : "Unanswered"} Doubts Found`}</p>
        )
      )}

      {!isLoading && hasMoreDoubts && (
        <div className="doubt_loader_container">
          <DoubtLoader key={uuid()} />
        </div>
      )}

      {!hasMoreDoubts && uniquePosts(posts)?.length > 0 && (
        <div
          className="powered__by__pustack"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img className="powered__by__icon" src={PustackLogo} />
          <p className="poweredBy">Powered By PuStack Education</p>
        </div>
      )}
    </div>
  );
}
