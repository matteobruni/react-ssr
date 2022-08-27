import { db } from "../../firebase_config";
import { showSnackbar } from "../../helpers";

import firebase from "firebase";
import "firebase/firestore";

const addComment = (
  doubtId,
  new_comment_id,
  updatedCommentCount,
  commentInput,
  user
) => {
  // update comment count in the document
  db.collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .doc(doubtId)
    .update({
      comment_count: firebase.firestore.FieldValue.increment(1),
    });

  // add new comment document
  db.collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .doc(doubtId)
    .collection("comments")
    .doc(new_comment_id)
    .set({
      like_count: 0,
      comment_text: commentInput,
      user_id: user.uid,
      create_ts: Date.now(),
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while adding comment for doubtId: ${doubtId} `
      );
      showSnackbar("Server Error", "server-error");
    });
};

const updateComment = (doubtId, commentInput, commentId, user) => {
  // update comment document
  db.collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .doc(doubtId)
    .collection("comments")
    .doc(commentId)
    .update({
      comment_text: commentInput,
      user_id: user.uid,
      //create_ts: Date.now(),
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while updating comment for doubtId: ${doubtId} `
      );
      showSnackbar("Server Error", "server-error");
    })
    .then(function () {
      showSnackbar("Comment Updated", "success");
    });
};

const deleteComment = (doubt_id, comment_id, comment_count, grade) => {
  // update comment count in the document
  db.collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .doc(doubt_id)
    .update({
      comment_count: firebase.firestore.FieldValue.increment(-1),
    });

  // delete comment documents
  db.collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .doc(doubt_id)
    .collection("comments")
    .doc(comment_id)
    .delete()
    .catch(function (error) {
      console.error(
        `Error ${error} while deleting comment for doubtId: ${doubt_id} `
      );
      showSnackbar("Server Error", "server-error");
    })
    .then(function () {
      showSnackbar("Comment Deleted", "trash");
    });
};

const getMoreComments = async ({ doubtId, last_comment_id, grade }) => {

  let fetched_comments = [];
  let last_visible_comment_doc;

  var citiesRef = db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .doc(doubtId)
    .collection("comments");

  return await citiesRef
    .doc(last_comment_id)
    .get()
    .then(async function (doc) {
      await db
        .collection("doubt_forum")
        .doc(grade)
        .collection("posts")
        .doc(doubtId)
        .collection("comments")
        .orderBy("like_count", "desc")
        .orderBy("create_ts", "desc")
        .startAfter(doc)
        .limit(2)
        .get()
        .then(function (querySnapshot) {
          if (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              fetched_comments.push({ id: doc.id, comment: doc.data() });
              last_visible_comment_doc = doc.data;
            });
          }
        })
        .catch(function (error) {
          console.error(
            `Error ${error} while getting more comments for doubtId: ${doubtId} `
          );
          showSnackbar(`Server Error`, "server-error");
        });

      return [fetched_comments, last_visible_comment_doc];
    });
};

export { addComment, updateComment, deleteComment, getMoreComments };
