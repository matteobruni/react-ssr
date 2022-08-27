import firebase from "firebase/app";
import { db, storage } from "../../firebase_config";
import { reactToQuill } from "../../helpers";
import { linkParser } from "../../helpers";
import { v4 as uuidv4 } from "uuid";
import { uploadThumbnail } from "../../database";
import { uploadImage } from "../doubts_forum/doubt-utils-functions";

// -> Upload Rich Text
export const updateRichTextPost = async ({
  postId,
  body,
  user,
  groups,
  json,
  onUpdate,
}) => {
  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .update({
      rich_text: reactToQuill(json),
      type: "rich-text",
      tags: groups,
      create_user_id: user.uid,
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while uploadRichTextPost for user: ${user}, tags: ${groups}json:${json},`
      );
      // Uh-oh, an error occurred!
    });

  let _post_create_ts = await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .get()
    .then((e) => e.data().create_ts);

  let _data = {
    index: postId,
    id: postId,
    data: {
      rich_text: reactToQuill(json),
      type: "rich-text",
      tags: groups,
      create_user_id: user.uid,
      create_ts: body.data.create_ts,
      like_count: body.data.like_count,
      comment_count: body.data.comment_count,
      is_deleted: false,
    },
    // likes: [],
    // comments: 0,
  };

  onUpdate(_data);

  return true;
};

// -> Upload Image Post
export const updateImagePost = async ({
  postId,
  body,
  user,
  groups,
  text,
  imagesFromBeforeUrl,
  files,
  json,
  onUpdate,
}) => {
  var _imagesUrl;
  if (files && files.length > 0) {
    if (files.length === 1) {
      _imagesUrl = [await uploadImage(files[0]).then((url) => url)];
    } else {
      var _temp = [];
      for (let i = 0; i < files.length; i++) {
        _temp.push(await uploadImage(files[i]).then((url) => url));
      }

      _imagesUrl = _temp;
    }
  }
  let final_images_url = [];

  // add images from before
  if (imagesFromBeforeUrl && imagesFromBeforeUrl.length > 0) {
    if (final_images_url && final_images_url !== null) {
      imagesFromBeforeUrl.map((imageUrl) => {
        final_images_url.push(imageUrl.url);
      });
    } else {
      final_images_url = imagesFromBeforeUrl;
    }
  }

  // add images selected while editing
  if (files && files.length > 0) {
    _imagesUrl.map((imageUrl) => {
      final_images_url.push(imageUrl);
    });
  }

  const imagePostInfo = () => {
    var image_post_info = {
      plain_text: text,
      description: reactToQuill(json),
      type: "image",
      tags: groups,
      create_user_id: user.uid,
      create_ts: body.data.create_ts,
      like_count: body.data.like_count,
      comment_count: body.data.comment_count,
      is_deleted: false,
    };

    if (final_images_url ? final_images_url : null) {
      if (final_images_url.length === 1) {
        image_post_info.image_urls = [final_images_url];
      } else {
        image_post_info.image_urls = final_images_url;
      }
    }

    return image_post_info;
  };

  const imagePostUpdatedInfo = () => {
    var image_post_updated_info = {
      plain_text: text,
      description: reactToQuill(json),
      type: "image",
      tags: groups,
    };

    if (final_images_url) {
      if (final_images_url.length === 1) {
        image_post_updated_info.image_urls = final_images_url;
      } else {
        image_post_updated_info.image_urls = final_images_url;
      }
    }


    return image_post_updated_info;
  };

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .update(imagePostUpdatedInfo());

  let _post_create_ts = await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .get()
    .then((e) => e.data().create_ts)
    .catch(function (error) {
      console.error(
        `Error ${error} while getting _post_create_ts for doc.id:${postId}`
      );
    });
  let _data = {
    index: postId,
    id: postId,
    data: imagePostInfo(_post_create_ts),
    likes: [],
    comments: 0,
  };
  onUpdate(_data);
  return true;
};

// -> Upload Video Post
export const updateVideoPost = async ({
  postId,
  body,
  user,
  groups,
  text,
  json,
  file,
  onUpdate,
  video_url,
}) => {
  let thumb_url = await uploadThumbnail(file.thumb).then((url) => url);

  var videoPostInfo = () => {
    var video_post_info = {
      video_url: video_url,
      thumbnail: thumb_url,
      plain_text: text,
      description: reactToQuill(json),
      type: "video",
      tags: groups,
      create_user_id: user.uid,
      create_ts: body.data.create_ts,
      like_count: body.data.like_count,
      comment_count: body.data.comment_count,
      is_deleted: false,
    };

    return video_post_info;
  };

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .update({
      video_url: video_url,
      thumbnail: thumb_url,
      plain_text: text,
      description: reactToQuill(json),
      type: "video",
      tags: groups,
    })
    .catch(function (error) {
      console.error(`Error ${error} `);
      // Uh-oh, an error occurred!
    });

  let _post_create_ts = await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .get()
    .then((e) => e.data().create_ts)
    .catch(function (error) {
      console.error(`Error ${error}`);
      // Uh-oh, an error occurred!
    });
  let _data = {
    index: postId,
    id: postId,
    data: videoPostInfo(_post_create_ts),
    likes: [],
    comments: 0,
  };

  onUpdate(_data);
  return true;
};

// -> Upload Video Post
export const updateVideoThenPost = async ({
  postId,
  body,
  user,
  groups,
  text,
  json,
  file,
  onUpdate,
}) => {
  var path = `newsfeed/videos/${uuidv4()}.${file.ext}`;

  var uploadTask = storage
    .ref()
    .child(path)
    .put(
      await fetch(file.url)
        .then((r) => r.blob())
        .catch(function (error) {
          console.error(`Error ${error}`);
          // Uh-oh, an error occurred!
        })
    );
  var _url = uploadTask.on(
    "state_changed",
    function (snapshot) {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          break;
        default:
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
          updateVideoPost({
            postId: postId,
            body: body,
            user: user,
            groups: groups,
            text: text,
            json: json,
            file: file,
            onUpdate: onUpdate,
            video_url: url,
          });
        })
        .catch(function (error) {
          console.error(`Error ${error}`);
          // Uh-oh, an error occurred!
        });
    }
  );
};

// -> Upload Link Post
export const updateLinkPost = async ({
  postId,
  body,
  user,
  groups,
  linkMetadata,
  plainText,
  richText = "",
  onUpdate,
}) => {
  let _title = "";
  let _thumb_link =
    linkMetadata.image !== null && linkMetadata.image !== ""
      ? await uploadThumbnail(linkMetadata.image)
          .then(function (url) {
            return url;
          })
          .catch(function (error) {
            console.error(`Error ${error}`);
            // Uh-oh, an error occurred!
          })
      : "";
  if (linkMetadata?.page_title !== null && linkMetadata.page_title.length > 0) {
    _title = linkMetadata.page_title;
  }

  let _url = linkMetadata.url.trim();

  if (
    _url.includes("http://") === false &&
    _url.includes("https://") === false
  ) {
    _url = `http://${_url}`;
  }

  if (_thumb_link === undefined) {
    if (linkMetadata.image !== undefined) {
      _thumb_link = linkMetadata.image;
    } else {
      _thumb_link = "";
    }
  }

  const linkPostData = () => {
    var link_post_data = {
      page_title: _title,
      url: _url,
      thumbnail: _thumb_link,
      plain_text: plainText,
      description: richText.replace(linkMetadata.url, ""),
      type: "link",
      tags: groups,
      create_user_id: user.uid,
      create_ts: body.data.create_ts,
      like_count: body.data.like_count,
      comment_count: body.data.comment_count,
      is_deleted: false,
    };

    return link_post_data;
  };

  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .update(linkPostData(Date.now()))
    .catch(function (error) {
      console.error(`Error ${error}`);
      // Uh-oh, an error occurred!
    });

  let _post_create_ts = await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .get()
    .then((e) => e.data().create_ts)
    .catch(function (error) {
      console.error(`Error ${error}`);
      // Uh-oh, an error occurred!
    });
  let _data = {
    index: postId,
    id: postId,
    data: linkPostData(_post_create_ts),
    likes: [],
    comments: 0,
  };

  onUpdate(_data);

  return true;
};

// -> Upload poll Post
export const updatePollPost = async ({
  postId,
  body,
  user,
  groups,
  text,
  options,
  days = 1,
  onUpdate,
  defaultEndTs,
}) => {
  var dateObj = new Date(defaultEndTs + 86400000 * days);

  const pollPostData = () => {
    var poll_post_data = {
      total: 0,
      options: options,
      question: text,
      type: "poll",
      end_ts: dateObj.getTime(),
      tags: groups,
      create_user_id: user.uid,
      create_ts: body.data.create_ts,
      like_count: body.data.like_count,
      comment_count: body.data.comment_count,
      is_deleted: false,
    };

    return poll_post_data;
  };
  await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .update(pollPostData(Date.now()))
    .catch(function (error) {
      console.error(`Error ${error} while uploadPollPost`);
      // Uh-oh, an error occurred!
    });

  let _post_create_ts = await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .get()
    .then((e) => e.data().create_ts)
    .catch(function (error) {
      console.error(`Error ${error}`);
      // Uh-oh, an error occurred!
    });

  let _data = {
    index: postId,
    id: postId,
    data: pollPostData(_post_create_ts),
    likes: [],
    comments: 0,
  };

  onUpdate(_data);

  return true;
};

// -> Upload Youtube Post
export const updateYoutubePost = async ({
  postId,
  body,
  user,
  groups,
  text = "",
  json,
  youtubeID,
  onUpdate,
}) => {
  var _text = text;
  if (linkParser.test(text)) {
    let _link = linkParser.exec(text)[0];
    _text.replace(_link, "");
  }

  const youtubeVideoPostInfo = () => {
    var youtube_video_post_info = {
      youtube_id: youtubeID.trim(),
      plain_text: _text,
      type: "youtube",
      tags: groups,
      create_user_id: user.uid,
      create_ts: body.data.create_ts,
      like_count: body.data.like_count,
      comment_count: body.data.comment_count,
      is_deleted: false,
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
    .doc(postId)
    .update({
      youtube_id: youtubeID.trim(),
      description: reactToQuill(json),
      plain_text: _text,
      type: "youtube",
      tags: groups,
    })
    .catch(function (error) {
      console.error(`Error ${error}`);
      // Uh-oh, an error occurred!
    });

  let _post_create_ts = await db
    .collection("news_feed")
    .doc(user?.grade)
    .collection("news_feed_posts")
    .doc(postId)
    .get()
    .then((e) => e.data().create_ts)
    .catch(function (error) {
      console.error(`Error ${error}`);
    });
  let _data = {
    index: postId,
    id: postId,
    data: youtubeVideoPostInfo(_post_create_ts),
    likes: [],
    comments: 0,
  };

  onUpdate(_data);

  return true;
};
