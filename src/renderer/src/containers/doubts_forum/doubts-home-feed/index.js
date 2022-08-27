import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { v1 as uuid } from "uuid";
import Lottie from "lottie-react-web";

import { DoubtTile } from "../..";
import { DoubtLoader } from "../../../components";
import PustackLogo from "../../../assets/images/logo.png";
import EmptyBox from "../../../assets/lottie/empty-box.json";
import SimilarChapter from "./../doubt-page-content/similar-chapter";
import DoubtContextProvider from "../../../context/doubts_forum/DoubtContext";
import {
  fetchMoreDoubts,
  fetchMoreMyDoubts,
  getFilterData,
} from "../../../database";
import {
  AskYourDoubtContext,
  ThemeContext,
  UserContext,
  PustackProContext,
  SidebarContext,
  PostsContext,
} from "./../../../context";
import "./style.scss";

function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value);
}

export default function DoubtsHomeFeed({ exceptDoubtId, pageName }) {
  const [user] = useContext(UserContext).user;
  const [isDark] = useContext(ThemeContext).theme;
  const [isUserPro] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;

  const [posts, setPosts] = useContext(PostsContext);
  const [isAnswered] = useContext(SidebarContext).isAnswered;
  const [selectedSubject] = useContext(SidebarContext).selectedSubject;
  const [selectedTopic, setSelectedTopic] =
    useContext(SidebarContext).selectedTopic;
  const [, setOpen] = useContext(AskYourDoubtContext).open;
  const [topLevel] = useContext(SidebarContext).topLevel;
  const [, setnoDataFound] = useContext(SidebarContext).noDataFound;
  const [sortByDBString] = useContext(SidebarContext).sortByDBString;
  const [, setLastDocument] = useContext(SidebarContext).lastDocument;
  const [selectedChapter] = useContext(SidebarContext).selectedChapter;

  const [hasMoreDoubts, setHasMoreDoubts] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState(null);

  const forceUpdate = useForceUpdate();
  const similarDoubtsRef = useRef();
  const observer = useRef();

  useEffect(() => {
    if (typeof similarDoubtsRef.current !== "undefined") setIsMounted(true);
    else setIsMounted(false);
  });

  useEffect(() => {
    if (posts) {
      setHasMoreDoubts(true);
      setnoDataFound(false);
    } else {
      setHasMoreDoubts(false);
      setnoDataFound(true);
    }
  }, [posts]);

  useEffect(() => {
    if (posts?.length < 7) setHasMoreDoubts(false);
  });

  const loadMore = async () => {
    if (!isLoading) {
      if (topLevel === "General" && selectedSubject === "My Doubts") {
        //my doubts
        try {
          if (posts) {
            let [_posts, _last] = await fetchMoreMyDoubts({
              userID: user?.uid,
              lastDocument: posts[posts.length - 1].post.question_create_ts,
              sortByDBString: sortByDBString,
              grade: user?.grade,
            });
            if (_last) setLastDocument(_last);
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
                    setPosts([...new Set(temp_doubts_obj)]);
                    forceUpdate();
                  } else {
                    if (posts) forceUpdate();
                    if (posts.length < 3) setHasMoreDoubts(false);
                  }
                } else {
                  if (isMounted) {
                    forceUpdate();
                    setPosts([...new Set(_posts)]);
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
          posts !== null &&
          posts &&
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
              selectedTopic,
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
            } else setHasMoreDoubts(false);
          }
        } else setHasMoreDoubts(false);

        if (!posts) setnoDataFound(true);
      }
    }
  };

  const lastDoubtRef = useCallback(function (node) {
    if (node !== null) {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore().then(() => {
            setIsLoading(false);
          });
        }
      });
      if (node) observer.current.observe(node);
    }
  });

  const uniquePosts = (posts) => {
    const _posts = posts?.filter(
      (post, i, a) => a.findIndex((p) => p.id === post.id) === i
    );

    if (selectedTopic) {
      return _posts?.filter((p) => p.post.chapter === selectedTopic);
    }

    return _posts;
  };

  useEffect(() => {
    getFilterDataFn();
  }, [selectedChapter]);

  useEffect(() => {
    if (topLevel === "General") setSelectedTopic("");
  }, [topLevel]);

  const getFilterDataFn = async () => {
    let filter_data = await getFilterData(user?.grade);

    setSubjects(filter_data?.data().subject_chapter_map[selectedChapter]);
  };

  return (
    <>
      <div className="similar-doubts">
        {uniquePosts(posts) ? (
          uniquePosts(posts)?.map(
            ({ id, post }, idx) =>
              exceptDoubtId !== id && (
                <div
                  className="similar-doubtsDiv"
                  key={id}
                  ref={
                    uniquePosts(posts).length - 1 === idx ? lastDoubtRef : null
                  }
                >
                  <DoubtContextProvider>
                    <DoubtTile
                      key={id}
                      doubtData={post}
                      doubtId={id}
                      isDoubtPageFeed={pageName === "doubtPage"}
                      setHasMoreDoubts={setHasMoreDoubts}
                      index={idx}
                    />
                  </DoubtContextProvider>
                  {idx === 0 &&
                    subjects &&
                    selectedChapter !== "All" &&
                    topLevel !== "General" &&
                    topLevel !== "Maths" && (
                      <SimilarChapter
                        subjects={subjects.slice(0, 20)}
                        getSelectedChapter={""}
                        homePage={true}
                        subject={selectedChapter}
                      />
                    )}
                </div>
              )
          )
        ) : (
          <div
            className={isDark ? "no__doubts__found dark" : "no__doubts__found"}
            style={{ textAlign: "center" }}
          >
            <Lottie
              options={{ animationData: EmptyBox, loop: false }}
              speed={0.45}
            />
            <h3>No {isAnswered ? "Answered" : "Unanswered"} Doubts Found</h3>
            <h5>You can still go ahead and ask your doubts.</h5>
            <h5>Stay curious and keep learning!</h5>
            <button
              className="askDoubtPopup__btn"
              style={{ width: "300px" }}
              onClick={() => {
                if (isUserPro) setOpen(true);
                else setIsSliderOpen(true);
              }}
            >
              Ask Your Doubt
            </button>
          </div>
        )}

        {hasMoreDoubts && (
          <div className="doubt_loader_container">
            <DoubtLoader key={uuid()} />
          </div>
        )}

        {!hasMoreDoubts && uniquePosts(posts)?.length > 6 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img className="powered__by__icon" src={PustackLogo} alt="logo" />
            <p className="poweredBy">Powered By PuStack Education</p>
          </div>
        )}
      </div>
    </>
  );
}
