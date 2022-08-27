import firebase from "firebase/app";
import { db } from "../../firebase_config";
import "firebase/firestore";

export const fetchUserLikedPosts = async ({ userID, grade, lastDocument }) => {
  // -> first lets fetch ids for the posts
  var last_document;
  let _data = [];

  var bookmarked_posts_ref;

  if (lastDocument === null || !lastDocument) {
    bookmarked_posts_ref = db
      .collection("news_feed")
      .doc(grade)
      .collection("bookmarked_news_feed_posts")
      .doc("posts")
      .collection(userID)
      .orderBy("create_ts", "desc")
      .limit(10);
  } else {
    bookmarked_posts_ref = db
      .collection("news_feed")
      .doc(grade)
      .collection("bookmarked_news_feed_posts")
      .doc("posts")
      .collection(userID)
      .orderBy("create_ts", "desc")
      .startAfter(lastDocument)
      .limit(10);
  }

  var _posts = await bookmarked_posts_ref
    .get()
    .then(async (snapshot) => {
      for (var i = 0; i < snapshot.docs.length; i++) {
        // get and set post info

        if (snapshot.docs[i].id !== undefined) {
          await db
            .collection("news_feed")
            .doc(grade)
            .collection("news_feed_posts")
            .doc(snapshot.docs[i].id)
            .get()
            .then(async function (doc) {
              if (doc.exists) {
                _data.push({
                  index: doc.id,
                  id: doc.id,
                  data: doc.data(),
                  likes: null,
                  comments: doc.data().comment_count,
                });

                last_document = doc;
              } else {
                // doc.data() will be undefined in this case
              }
            });

          // if (snapshot.docs.size === 0) {
          //   last_document = null;
          //   _data = null;
          // }
        }
      }

      //return [_data, snapshot.docs[snapshot.docs.length - 1]];
    })
    .catch(function (error) {
      console.error(`Error ${error}`);
      // Uh-oh, an error occurred!
    });
  return [_data, null, last_document];
};

// fetch posts by grade
export const getPostsByGrade = async (group, lastDocument) => {
  // let _grade = group == "Class 9" ? "class_9" : "class_10";
  let _grade = group;


  let _data = [],
    last_document;
  var newsFeedPostsRef = db
    .collection("news_feed")
    // .doc("content")
    .doc(_grade)
    .collection("news_feed_posts")
    .where("is_deleted", "==", false);

  if (lastDocument === null || lastDocument === undefined) {
    await newsFeedPostsRef
      .orderBy("create_ts", "desc")
      // .where("visible_groups", "array-contains", group.trim())
      .where("is_deleted", "==", false)
      .limit(10)
      .get()
      .then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {
          _data.push({
            index: doc.id,
            id: doc.id,
            data: doc.data(),
            // likes: _likes,
            comments: doc.data().comment_count,
          });
        });
        last_document = querySnapshot.docs[querySnapshot.docs.length - 1];

        if (querySnapshot.size === 0) {
          last_document = null;
          _data = null;
        }
      })
      .catch(function (error) {
        console.error(
          `Error ${error} while getPostsByGrade for group: ${group}`
        );
      });
  } else {
    await newsFeedPostsRef
      .orderBy("create_ts", "desc")
      // .where("visible_groups", "array-contains", group)
      .where("is_deleted", "==", false)
      .startAfter(lastDocument)
      .limit(10)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          _data.push({
            index: doc.id,
            id: doc.id,
            data: doc.data(),
            // likes: _likes,
            comments: doc.data().comment_count,
          });
        });
        last_document = querySnapshot.docs[querySnapshot.docs.length - 1];

        if (querySnapshot.size === 0) {
          last_document = null;
          _data = null;
        }
      })
      .catch(function (error) {
        console.error(
          `Error ${error} while getPostsByGrade for group: ${group}`
        );
      });
  }

  return [_data, null, last_document];
};

export const getPostById = async (id, grade) => {
  var postInfo = [];
  await db
    .collection("news_feed")
    // .doc("content")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(id)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        postInfo.push({
          index: doc.id,
          id: doc.id,
          data: doc.data(),
          like_count: doc.data().like_count,
          comment_count: doc.data().comment_count,
        });
      } else {
        // doc.data() will be undefined in this case
        postInfo = null;
      }
    });

  return postInfo;
};

export const getIsPostLiked = async (postID, grade, userId) => {
  let liked;
  var docRef = db
    .collection("news_feed")
    // .doc("content")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(postID)
    .collection("likes")
    .doc(userId);

  await docRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        //setUpvoted(true);
        liked = true;
        return true;
      } else {
        // doc.data() will be undefined in this case

        //setUpvoted(false);
        liked = false;
        return false;
      }
    })
    .catch(function (error) {
      liked = false;
      console.error(
        `Error ${error} while getting is doubt liked for doubtId: ${postID} `
      );
      return false;
    });

  return liked;
};
export const getNewsFeedFilterTabs = async (grade) => {
  let docRef = db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_tags")
    .doc("tags");

  let _tags = [];

  await docRef.get().then((doc) => {
    if (doc.exists) {
      doc.data().tags.forEach((tag) => {
        _tags.push({
          label: tag.label,
          icon: tag.url,
        });
      });
    }
  });

  let tags_label = [];
  _tags.map(({ label }) => {
    tags_label.push(label);
  });

  localStorage.setItem("tags_label", JSON.stringify(tags_label));

  return _tags;
};

// fetch posts by grade
export const getPostsByTags = async ({ group, grade, lastDocument }) => {


  let _data = [],
    last_document;
  var newsFeedPostsRef = db
    .collection("news_feed")
    // .doc("content")
    .doc(grade)
    .collection("news_feed_posts")
    .where("tags", "array-contains", group)
    .where("is_deleted", "==", false);

  if (lastDocument === null || lastDocument === undefined) {
    await newsFeedPostsRef
      .orderBy("create_ts", "desc")
      .where("is_deleted", "==", false)
      .limit(10)
      .get()
      .then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {
          _data.push({
            index: doc.id,
            id: doc.id,
            data: doc.data(),
            // likes: _likes,
            comments: doc.data().comment_count,
          });
        });
        last_document = querySnapshot.docs[querySnapshot.docs.length - 1];

        if (querySnapshot.size === 0) {
          last_document = null;
          _data = null;
        }
      })
      .catch(function (error) {
        console.error(
          `Error ${error} while getPostsByTags for group: ${group}`
        );
      });
  } else {
    await newsFeedPostsRef
      .orderBy("create_ts", "desc")
      // .where("visible_groups", "array-contains", group)
      .where("is_deleted", "==", false)
      .startAfter(lastDocument)
      .limit(10)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          _data.push({
            index: doc.id,
            id: doc.id,
            data: doc.data(),
            // likes: _likes,
            comments: doc.data().comment_count,
          });
        });
        last_document = querySnapshot.docs[querySnapshot.docs.length - 1];

        if (querySnapshot.size === 0) {
          last_document = null;
          _data = null;
        }
      })
      .catch(function (error) {
        console.error(`Error ${error} while getPostsTags for group: ${group}`);
      });
  }

  return [_data, null, last_document];
};
