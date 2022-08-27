import { db } from "../../firebase_config";
import firebase from "firebase/app";
import "firebase/firestore";
import { showSnackbar } from "./../../components/doubts_forum/snackbar/functions";

export const toggleLikeOnDb = (docID, grade, userID, isLiked) => {
  if (isLiked) {
    // UNLIKE
    db.collection("news_feed")
      .doc(grade)
      .collection("news_feed_posts")
      .doc(docID)
      .collection("likes")
      .doc(userID)
      .delete()

      .then(() => {
        db.collection("news_feed")
          .doc(grade)
          .collection("news_feed_posts")
          .doc(docID)
          .update({ like_count: firebase.firestore.FieldValue.increment(-1) });
      });
  } else {
    // LIKE
    db.collection("news_feed")
      .doc(grade)
      .collection("news_feed_posts")
      .doc(docID)
      .collection("likes")
      .doc(userID)
      .set({ like_user_id: userID })
      .then(() => {
        db.collection("news_feed")
          .doc(grade)
          .collection("news_feed_posts")
          .doc(docID)
          .update({ like_count: firebase.firestore.FieldValue.increment(1) });
      });
  }
};

export const toogleBookmarked = ({ userID, docID, grade, isBookmarked }) => {
  if (isBookmarked) {
    // add to firestore
    db.collection("news_feed")
      .doc(grade)
      .collection("bookmarked_news_feed_posts")
      .doc("posts")
      .collection(userID)
      .doc(docID)
      .set({
        create_ts: Date.now(),
      });
  } else {
    // remove from firestore
    db.collection("news_feed")
      .doc(grade)
      .collection("bookmarked_news_feed_posts")
      .doc("posts")
      .collection(userID)
      .doc(docID)
      .delete();
  }
};

export const postComment = async (docID, grade, comment) => {
  let _id;

  let _docID = await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .collection("comments")
    .add({
      //create_ts: firebase.firestore.Timestamp.now().toMillis(),
      comment_text: comment.comment_text,
      create_ts: Date.now(),
      user_id: comment.user_id,

      like_count: 0,
    })
    .then(async (__) => {
      _id = __.id;

      await db
        .collection("news_feed")
        .doc(grade)
        .collection("news_feed_posts")
        .doc(docID)
        .update({
          comment_count: firebase.firestore.FieldValue.increment(1),
        });
    })
    .then((_) => _id);

  return _docID;
};

export const deleteNewsFeedComment = async (docID, grade, commentID) => {
  await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .collection("comments")
    .doc(commentID)
    .delete()
    .then(async () => {
      await db
        .collection("news_feed")
        .doc(grade)
        .collection("news_feed_posts")
        .doc(docID)
        .update({ comment_count: firebase.firestore.FieldValue.increment(-1) });
    });
};

export const editComment = (docID, grade, commentID, text) => {
  db.collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .collection("comments")
    .doc(commentID)
    .update({ comment_text: text })
    .then(() => showSnackbar("Comment Updated", "success"))
    .catch(() => showSnackbar("Server Error", "server-error"));
};

export const addPollChoice = async (docID, grade, choiceIndex, userID) => {
  let _temp = await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .get()
    .then((_) => _.data());

  let _choices = _temp["options"];
  let choices = [];

  for (let i = 0; i < _choices.length; i++) {
    if (i === choiceIndex) {
      choices.push({
        option: _choices[i].option,
        vote_count: _choices[i].vote_count + 1,
      });
    } else {
      choices.push(_choices[i]);
    }
  }

  await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .update({
      total: firebase.firestore.FieldValue.increment(1),
      options: choices,
    });

  await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .collection("votes")
    .doc(userID)
    .set({
      option: choiceIndex,
    });

  return true;
};

export const checkAnswersFromDb = async (docID, grade, userID) => {
  let answer = await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .collection("votes")
    .doc(userID)
    .get();

  if (answer.exists) {
    // return answer.data().choice;
    return answer.data().option;
  }

  return null;
};

export const undoPollChoice = async (docID, grade, choiceIndex, userID) => {
  let _temp = await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .get()
    .then((_) => _.data());

  let _choices = _temp["options"];
  let choices = [];

  for (let i = 0; i < _choices.length; i++) {
    if (i === choiceIndex) {
      choices.push({
        option: _choices[i].option,
        vote_count: _choices[i].vote_count - 1,
      });
    } else {
      choices.push(_choices[i]);
    }
  }

  await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .update({
      total: firebase.firestore.FieldValue.increment(-1),
      options: choices,
    });
  await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .collection("votes")
    .doc(userID)
    .delete();

  return true;
};
