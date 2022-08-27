import { db } from "../../firebase_config";

export const getComments = async (docID, grade, lastDocument, count) => {
  let fetched_comments = [];
  let last_visible_comment_doc;

  if (lastDocument === null || lastDocument === undefined) {
    await db
      .collection("news_feed")
      .doc(grade)
      .collection("news_feed_posts")
      .doc(docID)
      .collection("comments")
      .limit(count)
      .orderBy("like_count", "desc")
      .orderBy("create_ts", "desc")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc) => {
            fetched_comments.push({ id: doc.id, comment: doc.data() });
            last_visible_comment_doc = doc;
          });
        }
      })
      .catch((error) => console.error(`Error ${error}`));
  } else {
    await db
      .collection("news_feed")
      .doc(grade)
      .collection("news_feed_posts")
      .doc(docID)
      .collection("comments")
      .orderBy("like_count", "desc")
      .orderBy("create_ts", "desc")
      .startAfter(lastDocument)
      .limit(2)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc) => {
            fetched_comments.push({ id: doc.id, comment: doc.data() });
            last_visible_comment_doc = doc;
          });
        }
      })
      .catch((error) => console.error(`Error ${error}`));
  }
  return [fetched_comments, last_visible_comment_doc];
};
