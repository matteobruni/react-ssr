import { db, storage } from "../../firebase_config";
import { v4 as uuidv4 } from "uuid";

export const getVisibleGroupsFromDb = (grade) => {
  db.collection("news_feed")
    .doc(grade)
    .collection("news_feed_tags")
    .doc("tags")
    .get()
    .then(function (e) {
      if (typeof e.data().tags === "object") {
        localStorage.setItem("user_group", JSON.stringify(e.data().tags));

        let tags_label = [];
        e.data().tags.map(({ label }) => {
          tags_label.push(label);
        });

        localStorage.setItem("tags_label", JSON.stringify(tags_label));
      }
    })
    .catch((error) => console.error(`Error ${error}`));
};

export const uploadNewsFeedImage = async (file) => {
  let path = `newsfeed/images/${uuidv4()}.${file.ext}`;

  let _url = await storage
    .ref()
    .child(path)
    .put(
      await fetch(file.url)
        .then((r) => r.blob())
        .catch(function (error) {
          console.error(`Error ${error}`);
          // Uh-oh, an error occurred!
        })
    )
    .then(async (snapshot) => {
      return snapshot.ref
        .getDownloadURL()
        .then((url) => url)
        .catch(function (error) {
          console.error(`Error ${error}`);
          // Uh-oh, an error occurred!
        });
    })
    .catch((error) => console.error(`Error ${error}`));

  return _url;
};

export const uploadThumbnail = async (file) => {
  let path = `newsfeed/images/${uuidv4()}.jpg`;

  let _url = await storage
    .ref()
    .child(path)
    .put(
      await fetch(file)
        .then((r) => r.blob())
        .catch(function (error) {
          console.error(`Error ${error}`);
          // Uh-oh, an error occurred!
        })
    )
    .then(async (snapshot) => {
      return snapshot.ref
        .getDownloadURL()
        .then((url) => url)
        .catch((error) => console.error(`Error ${error}`));
    })
    .catch((error) => console.error(`Error ${error}`));

  return _url;
};

export const isPostIdBookmarked = async ({ userId, postId, grade }) => {
  let docRef = db
    .collection("news_feed")
    .doc(grade)
    .collection("bookmarked_news_feed_posts")
    .doc("posts")
    .collection(userId)
    .doc(postId);

  const doc = await docRef.get();
  return doc.exists;
};

// -> Image Url From Files
export const getImageUrlsFromFiles = async (files) => {
  let _images;

  if (files.length === 1) {
    _images = await uploadNewsFeedImage(files[0])
      .then((url) => url)
      .catch((error) => console.error(`Error ${error}`));
  } else {
    let _temp = [];
    for (let i = 0; i < files.length; i++) {
      _temp.push(await uploadNewsFeedImage(files[i]).then((url) => url));
    }

    _images = _temp;
  }


  return _images;
};
