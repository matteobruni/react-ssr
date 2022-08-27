import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";

import Lottie from "lottie-react-web";
import animation from "../../../assets/lottie/comments_placeholder.json";

import {
  fetchComments,
  fetchLiveComments,
  fetchMoreComments,
} from "../../../database";

import {
  LiveSessionComment,
  LiveSessionCommentsShimmer,
} from "../../../components";
import { UserContext, LiveSessionContext } from "../../../context";
import "./style.scss";
let subscribed = false;
export default function CommentsWrapper({
  appearHandler,
  isDesktop = false,
  setHasComments,
}) {
  const [comments, setComments] = useState(null);
  const [newComments, setNewComments] = useState(null);
  const [lastDocument, setLastDocument] = useState(null);
  const [moreComments, setMoreComments] = useState(false);

  const quotes = [
    "Motivation is what gets you started. Habit is what keeps you going.",
    "Success is the sum of small efforts, repeated.",
    "The expert in anything was once a beginner.",
    "The only place where success comes before work is in the dictionary.",
    "Excellence is not a skill. It is an attitude.",
    "There is no elevator to success. You have to take the stairs.",
    "The difference between ordinary and extraordinary is that little extra.",
    "A little... little... little...makes a lot. Yeah!",
  ];

  const [user] = useContext(UserContext).user;
  const [isLive] = useContext(LiveSessionContext).live;
  const [currentSession] = useContext(LiveSessionContext).current;
  const observer = useRef();
  const endScroll = useRef();
  const nthLastRef = useRef();

  const commentAnsweredTimer = (i = 0) => {
    setTimeout(() => {
      document.title = "Answer Received";
      appearHandler(true);
      i++;

      if (i === 5) {
        document.title = "Live Classes";
        appearHandler(false);
      }

      if (i < 5) {
        setTimeout(() => {
          document.title = "Live Classes";
          commentAnsweredTimer(i);
        }, 1500);
      }
    }, 1500);
  };

  useEffect(() => {
    let unsubscribe;
    if (user !== null && currentSession !== null && currentSession && !subscribed) {
      unsubscribe = fetchCommentsFn();
    }

    return () => {
      if(typeof unsubscribe === 'function') {
        unsubscribe();
        subscribed = false;
      }
    }
  }, [user, currentSession, isLive]);

  const fetchCommentsFn = () => {
    let callback = (data) => {
      setComments(data);

      endScroll.current &&
        endScroll.current.scrollIntoView({ behavior: "smooth" });
      if (data.length === 15) {
        setTimeout(() => setMoreComments(true), 1000);
      }

      setLastDocument(data[data.length - 1]);
    };
    const unsubscribe = fetchComments(currentSession.reference, isLive, callback);
    if(typeof unsubscribe === 'function') {
      subscribed = true;
    }
    return unsubscribe;
  };

  const fetchMoreCommentsFn = () => {
    let callback = (data) => {
      if (data.length > 0) {
        setMoreComments(false);

        setComments([...data, ...comments]);

        nthLastRef.current && nthLastRef.current.scrollIntoView();

        setTimeout(() => setMoreComments(true), 2000);
      } else {
        setMoreComments(false);
      }
    };

    return fetchMoreComments(currentSession?.reference, comments[0], callback);
  };

  useEffect(() => {
    if (user !== null && currentSession !== null && comments !== null) {
      let unsubscribe = fetchLiveComments(
        currentSession.reference,
        isDesktop,
        lastDocument,
        (e) => {
          setNewComments(e);

          if (e !== null && e.length > 0 && e[e.length - 1].reply) {
            commentAnsweredTimer();
          }
        }
      );
      return () => unsubscribe();
    }
  }, [user, currentSession, lastDocument]);

  useEffect(() => {
    if ((newComments?.length || 0 + comments?.length || 0) > 3) {
      setHasComments(true);
    }

    endScroll.current &&
      endScroll.current.scrollIntoView({ behavior: "smooth" });
  }, [newComments]);

  const lastCommentRef = useCallback((node) => {
    if (node !== null) {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (moreComments && comments) {
            // TODO: Refactor this, in this way its hard to unsubscribe
            fetchMoreCommentsFn();
          }
        }
      });
      if (node) observer.current.observe(node);
    }
  });

  return currentSession === null ? (
    <LiveSessionCommentsShimmer />
  ) : (
    <>
      {(comments === null || comments.length === 0) &&
        (newComments === null || newComments.length === 0) && (
          <div className="comments__placeholder">
            <Lottie options={{ animationData: animation, loop: false }} />
            <h5>
              {currentSession &&
                quotes[(currentSession?.session_id?.charCodeAt() % 100) % 10]}
            </h5>
          </div>
        )}

      <div className="lastCommentRef" ref={lastCommentRef} />

      {comments !== null &&
        comments.length > 0 &&
        comments.map((comment, index) => (
          <div
            className="comments__content"
            key={comment.id}
            id={comment.timestamp?.seconds}
            ref={index === 5 ? nthLastRef : null}
          >
            <LiveSessionComment
              comment={comment.content}
              reply={comment.reply}
              userProfile={comment.user_profile_pic}
              userName={comment.user_name}
              hasPendingWrites={comment.hasPendingWrites}
              timestamp={comment.timestamp}
              startTs={currentSession.start_ts}
              isInstructor={comment?.is_instructor || false}
              commentId={comment.id}
            />
          </div>
        ))}
      <div className="scroll__to__end" ref={endScroll} />
    </>
  );
}
