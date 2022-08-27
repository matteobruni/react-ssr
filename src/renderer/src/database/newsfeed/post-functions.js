import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../../firebase_config";
import { getImageUrlsFromFiles } from "./posts-utils-functions";
import { reactToQuill } from "../../helpers";
import { linkParser } from "../../helpers";
import { uploadThumbnail } from "../../database";

// -> Upload Image Post
export const uploadRichTextPost = async (
  user,
  groups,
  plainText,
  json,
  onCreate,
  youtubeID
) => {
  let richTextPostInfo = (create_ts) => {
    let rich_text_post_info;
    rich_text_post_info = {
      rich_text: reactToQuill(json),
      plain_text: plainText,
      type: "rich-text",
      create_user_id: user.uid,
      create_ts: create_ts,
      like_count: 0,
      comment_count: 0,
      is_deleted: false,
      tags: groups.filter((tag) => tag.toLowerCase() !== "all"),
      elastic_search_doc_id: null,
    };

    // if rich text post have video then add.

    return rich_text_post_info;
  };

  let _images;

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .add(richTextPostInfo(Date.now()))
    .then(async (doc) => {
      let _post_create_ts = await db
        .collection("news_feed")
        .doc(user?.grade)
        .collection("news_feed_posts")
        .doc(doc.id)
        .get()
        .then((e) => e.data().create_ts);

      let _data = {
        index: doc.id,
        id: doc.id,
        data: richTextPostInfo(_post_create_ts),
        likes: [],
        comments: 0,
      };

      onCreate(_data);
    })
    .catch((error) =>
      console.error(
        `Error ${error} while uploadRichTextPost for user: ${user}, visible_groups: ${groups}json:${json}, onCreate:${onCreate}`
      )
    );

  return true;
};

// -> Upload Image Post
export const uploadImagePost = async ({
  user,
  groups,
  text,
  files,
  json,
  onCreate,
}) => {
  let _images = await getImageUrlsFromFiles(files);

  const imagePostInfo = (create_ts) => {
    let image_post_info = {
      plain_text: text,
      description: reactToQuill(json),
      type: "image",
      tags: groups.filter((tag) => tag.toLowerCase() !== "all"),
      create_user_id: user.uid,
      create_ts: create_ts,
      like_count: 0,
      comment_count: 0,
      elastic_search_doc_id: null,
      is_deleted: false,
    };

    if (_images) {
      if (files.length === 1) {
        image_post_info.image_urls = [_images];
      } else {
        image_post_info.image_urls = _images;
      }
    }

    return image_post_info;
  };

  if (files.length === 1) {
    await db
      .collection("news_feed")
      .doc(user?.grade)
      .collection("news_feed_posts")
      .add(imagePostInfo(Date.now()))
      .then(async (doc) => {
        let _post_create_ts = await db
          .collection("news_feed")
          .doc(user?.grade)
          .collection("news_feed_posts")
          .doc(doc.id)
          .get()
          .then((e) => e.data().create_ts)
          .catch((error) =>
            console.error(
              `Error ${error} while getting _post_create_ts for doc.id:${doc.id}`
            )
          );
        let _data = {
          index: doc.id,
          id: doc.id,
          data: imagePostInfo(_post_create_ts),
          likes: [],
          comments: 0,
        };

        onCreate(_data);
      });
  } else {
    await db
      .collection("news_feed")
      .doc(user?.grade)
      .collection("news_feed_posts")
      .add(imagePostInfo(Date.now()))
      .then(async (doc) => {
        let _post_create_ts = await db
          .collection("news_feed")
          .doc(user?.grade)
          .collection("news_feed_posts")
          .doc(doc.id)
          .get()
          .then((e) => e.data().create_ts)
          .catch((error) =>
            console.error(
              `Error ${error} while getting _post_create_ts for doc.id:${doc.id}`
            )
          );
        let _data = {
          index: doc.id,
          id: doc.id,
          data: imagePostInfo(_post_create_ts),
          likes: [],
          comments: 0,
        };

        onCreate(_data);
      });
  }

  return true;
};

// -> Upload Video Post
export const uploadVideoPost = async ({
  user,
  groups,
  text,
  json,
  file,
  onCreate,
  video_url,
}) => {
  let thumb_url = await uploadThumbnail(file.thumbnail).then((url) => url);

  let videoPostInfo = (create_ts) => {
    let video_post_info = {
      video_url: video_url,
      thumbnail: thumb_url,
      plain_text: text,
      description: reactToQuill(json),
      type: "video",
      create_user_id: user.uid,
      create_ts: create_ts,
      like_count: 0,
      comment_count: 0,
      is_deleted: false,
      elastic_search_doc_id: null,
      tags: groups.filter((tag) => tag.toLowerCase() !== "all"),
    };

    return video_post_info;
  };

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .add(videoPostInfo(Date.now()))
    .then(async (doc) => {
      let _post_create_ts = await db
        .collection("news_feed")
        .doc(user?.grade)
        .collection("news_feed_posts")
        .doc(doc.id)
        .get()
        .then((e) => e.data().create_ts)
        .catch((error) => console.error(`Error ${error}`));

      let _data = {
        index: doc.id,
        id: doc.id,
        data: videoPostInfo(_post_create_ts),
        likes: [],
        comments: 0,
      };

      onCreate(_data);
    })
    .catch((error) => console.error(`Error ${error} `));

  return true;
};

// -> Upload Video Post
export const uploadVideoThenPost = async ({
  user,
  groups,
  text,
  json,
  file,
  onCreate,
}) => {
  let path = `newsfeed/videos/${uuidv4()}.${file.ext}`;

  let uploadTask = storage
    .ref()
    .child(path)
    .put(
      await fetch(file.url)
        .then((r) => r.blob())
        .catch((error) => console.error(`Error ${error}`))
    );

  let _url = uploadTask.on(
    "state_changed",
    function (snapshot) {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          break;
      }
    },
    function (error) {
      console.error(`Error ${error}`);
    },
    function () {
      uploadTask.snapshot.ref
        .getDownloadURL()
        .then(function (url) {
          uploadVideoPost({
            user: user,
            groups: groups.filter((tag) => tag.toLowerCase() !== "all"),
            text: text,
            json: json,
            file: file,
            onCreate: onCreate,
            video_url: url,
          });
          //return url;
        })
        .catch((error) => console.error(`Error ${error}`));
    }
  );
};

// -> Upload Link Post
export const uploadLinkPost = async ({
  user,
  groups,
  linkMetadata,
  plainText,
  richText = "",
  onCreate,
}) => {
  let _title = "";

  let _thumb_link =
    linkMetadata.image !== null && linkMetadata.image !== ""
      ? await uploadThumbnail(linkMetadata.image)
          .then((url) => url)
          .catch((error) => console.error(`Error ${error}`))
      : "";

  if (linkMetadata?.page_title !== null && linkMetadata.page_title.length > 0) {
    _title = linkMetadata.page_title;
  }

  let _url = linkMetadata.url.trim();

  if (!_url.includes("http://") && !_url.includes("https://")) {
    _url = `http://${_url}`;
  }

  if (_thumb_link === undefined) {
    if (linkMetadata.image !== undefined) {
      _thumb_link = linkMetadata.image;
    } else {
      _thumb_link = "";
    }
  }

  const linkPostData = (create_ts) => {
    let link_post_data = {
      page_title: _title,
      url: _url,
      thumbnail: _thumb_link,
      plain_text: plainText,
      description: richText.replace(linkMetadata.url, ""),
      type: "link",
      create_user_id: user.uid,
      create_ts: create_ts,
      like_count: 0,
      comment_count: 0,
      is_deleted: false,
      elastic_search_doc_id: null,
      tags: groups.filter((tag) => tag.toLowerCase() !== "all"),
    };

    return link_post_data;
  };

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .add(linkPostData(Date.now()))
    .then(async (doc) => {
      let _post_create_ts = await db
        .collection("news_feed")
        .doc(user?.grade)
        .collection("news_feed_posts")
        .doc(doc.id)
        .get()
        .then((e) => e.data().create_ts)
        .catch((error) => console.error(`Error ${error}`));

      let _data = {
        index: doc.id,
        id: doc.id,
        data: linkPostData(_post_create_ts),
        likes: [],
        comments: 0,
      };

      onCreate(_data);
    })
    .catch((error) => console.error(`Error ${error}`));

  return true;
};

// -> Upload poll Post
export const uploadPollPost = async (
  user,
  groups,
  text,
  options,
  days = 2,
  onCreate
) => {

  let dateObj = new Date(Date.now() + 86400000 * days);

  const pollPostData = (create_ts) => {
    let poll_post_data = {
      total: 0,
      options: options,
      question: text,
      type: "poll",
      end_ts: dateObj.getTime(),
      create_user_id: user.uid,
      create_ts: create_ts,
      like_count: 0,
      comment_count: 0,
      is_deleted: false,
      elastic_search_doc_id: null,
      tags: groups.filter((tag) => tag.toLowerCase() !== "all"),
    };

    return poll_post_data;
  };
  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .add(pollPostData(Date.now()))
    .then(async (doc) => {
      let _post_create_ts = await db
        .collection("news_feed")
        .doc("content")
        .collection("news_feed_posts")
        .doc(doc.id)
        .get()
        .then((e) => e.data().create_ts)
        .catch((error) => console.error(`Error ${error}`));

      let _data = {
        index: doc.id,
        id: doc.id,
        data: pollPostData(_post_create_ts),
        likes: [],
        comments: 0,
      };

      onCreate(_data);
    })
    .catch((error) => console.error(`Error ${error} while uploadPollPost`));

  return true;
};

// -> Upload Youtube Post
export const uploadYoutubePost = async (
  user,
  groups,
  text = "",
  json,
  youtubeID,
  onCreate
) => {
  let _text = text;
  if (linkParser.test(text)) {
    let _link = linkParser.exec(text)[0];
    _text.replace(_link, "");
  }

  const youtubeVideoPostInfo = (create_ts) => {
    let youtube_video_post_info = {
      youtube_id: youtubeID.trim(),
      plain_text: _text,
      type: "youtube",
      create_user_id: user.uid,
      description: _text,
      create_ts: create_ts,
      like_count: 0,
      comment_count: 0,
      is_deleted: false,
      elastic_search_doc_id: null,
      tags: groups.filter((tag) => tag.toLowerCase() !== "all"),
    };

    // if rich text post have files then add.
    if (json) {
      youtube_video_post_info.description = reactToQuill(json);
    }

    return youtube_video_post_info;
  };

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .add(youtubeVideoPostInfo(Date.now()))
    .then(async (doc) => {
      let _post_create_ts = await db
        .collection("news_feed")
        .doc(user?.grade)
        .collection("news_feed_posts")
        .doc(doc.id)
        .get()
        .then((e) => e.data().create_ts)
        .catch((error) => console.error(`Error ${error}`));

      let _data = {
        index: doc.id,
        id: doc.id,
        data: youtubeVideoPostInfo(_post_create_ts),
        likes: [],
        comments: 0,
      };

      onCreate(_data);
    })
    .catch((error) => console.error(`Error ${error}`));

  return true;
};

//------------------------------------ update

// -> Fetch Posts
export const fetchPosts = async ({ userID, grade, lastDocument }) => {
  if (lastDocument === null || lastDocument === undefined) {
    let _posts = await db
      .collection("news_feed")
      .doc(grade)
      .collection("news_feed_posts")
      .orderBy("create_ts", "desc")
      .where("is_deleted", "==", false)
      .limit(10)
      .get()
      .then(async (snapshot) => {
        let _data = [];

        for (let i = 0; i < snapshot.docs.length; i++) {
          _data.push({
            index: snapshot.docs[i].id,
            id: snapshot.docs[i].id,
            data: snapshot.docs[i].data(),
            like_count: snapshot.docs[i].data().like_count,
            comment_count: snapshot.docs[i].data().comment_count,
          });
        }
        return [
          _data,
          snapshot.docs[0],
          snapshot.docs[snapshot.docs.length - 1],
        ];
      })
      .catch(function (error) {
        console.error(`Error ${error}`);
      });

    return _posts;
  } else {
    let _posts = await db
      .collection("news_feed")
      .doc(grade)
      .collection("news_feed_posts")
      .orderBy("create_ts", "desc")
      .where("is_deleted", "==", false)
      .startAfter(lastDocument)
      .limit(10)
      .get()
      .then(async (snapshot) => {
        let _data = [];

        for (let i = 0; i < snapshot.docs.length; i++) {
          let _tempLikes = await db
            .collection("news_feed")
            .doc("content")
            .collection("news_feed_posts")
            .doc(snapshot.docs[i].id)
            .collection("likes")
            .doc(userID)
            .get();
          let _likes = [];
          if (_tempLikes.exists) {
            _likes.push(userID);
            for (let j = 1; j < snapshot.docs[i].data["like_count"]; i++) {
              _likes.push(j);
            }
          } else {
            for (let j = 0; j < snapshot.docs[i].data["like_count"]; i++) {
              _likes.push(j);
            }
          }

          _data.push({
            index: snapshot.docs[i].id,
            id: snapshot.docs[i].id,
            data: snapshot.docs[i].data(),
            likes: _likes,
            comments: snapshot.docs[i].data().comment_count,
          });
        }
        return [
          _data,
          snapshot.docs[0],
          snapshot.docs[snapshot.docs.length - 1],
        ];
      })
      .catch((error) => console.error(`Error ${error}`));

    return _posts;
  }
};

// -> Get New Posts
export const getNewPosts = async (firstDocument, grade, userID) => {
  return await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .where("is_deleted", "==", false)
    .orderBy("create_ts", "desc")
    .endBefore(firstDocument)
    .get()
    .then(async (snapshot) => {
      let _data = [];

      for (let i = 0; i < snapshot.docs.length; i++) {
        let _tempLikes = await db
          .collection("news_feed")
          .doc("content")
          .collection("news_feed_posts")
          .doc(snapshot.docs[i].id)
          .collection("likes")
          .doc(userID)
          .get();
        let _likes = [];
        if (_tempLikes.exists) {
          _likes.push(userID);
          for (let j = 1; j < snapshot.docs[i].data["like_count"]; i++) {
            _likes.push(j);
          }
        } else {
          for (let j = 0; j < snapshot.docs[i].data["like_count"]; i++) {
            _likes.push(j);
          }
        }

        _data.push({
          index: snapshot.docs[i].id,
          id: snapshot.docs[i].id,
          data: snapshot.docs[i].data(),
          likes: _likes,
          comments: snapshot.docs[i].data().comment_count,
        });
      }

      if (_data.length > 0) {
        return { documents: _data, first: snapshot.docs[0] };
      }

      return { documents: [], first: null };
    })
    .catch((error) => console.error(`Error ${error}`));
};

// -> Delete Post
export const deletePost = async (docID, grade) => {
  await db
    .collection("news_feed")
    .doc(grade)
    .collection("news_feed_posts")
    .doc(docID)
    .update({ is_deleted: true });
};
