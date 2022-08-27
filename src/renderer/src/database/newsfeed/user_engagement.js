import firebase from "firebase/app";
import { db } from "../../firebase_config";
import { getDateInYYYYMMDDFormat } from "../../helpers";

export const setUserEngagement = async (userId, postId, watch_time) => {
  var get_date_now_YYYYMMDD_format = getDateInYYYYMMDDFormat();

  await db
    .collection("user_engagement")
    .doc(userId)
    .collection("news_feed_detailed_engagement")
    .doc(get_date_now_YYYYMMDD_format)
    .set(
      {
        engagement_date: firebase.firestore.FieldValue.serverTimestamp(),
        posts: firebase.firestore.FieldValue.arrayUnion({
          post_id: postId,
          watch_time: watch_time,
        }),
      },
      { merge: true }
    );

  // adding newsfeed post engagement viewed posts
  db.collection("user_engagement")
    .doc(userId)
    .collection("news_feed_post_engagement")
    .doc("viewed_posts")
    .get()
    .then(async (doc) => {
      if (doc.exists) {
        db.collection("user_engagement")
          .doc(userId)
          .collection("news_feed_post_engagement")
          .doc("viewed_posts")
          .update({
            viewed_posts: firebase.firestore.FieldValue.arrayUnion(postId),
          });
      } else {
        // doc.data() will be undefined in this case
        db.collection("user_engagement")
          .doc(userId)
          .collection("news_feed_post_engagement")
          .doc("viewed_posts")
          .set({
            viewed_posts: [postId],
          });
      }
    });

  db.collection("user_engagement")
    .doc(userId)
    .set(
      {
        total_post_engagement_time:
          firebase.firestore.FieldValue.increment(watch_time),
        total_post_view_count: firebase.firestore.FieldValue.increment(1),
      },
      { merge: true }
    );
};
