import { db } from "../../firebase_config";
import { uploadImage } from "../../database";
import {
  reactToQuill,
  youTubeGetID,
  showSnackbar,
  quillToPlainText,
} from "../../helpers";

import firebase from "firebase";
import "firebase/firestore";
import axios from "axios";

const notifyStudentAnswerStatusServiceFn = ({
  uid,
  doubt_id,
  isEdit,
  plainText,
}) => {
  axios
    .post(
      "https://us-central1-avian-display-193502.cloudfunctions.net/notifyStudentAnswerStatus",
      {
        uid: uid,
        doubt_id: doubt_id,
        type: isEdit ? "update" : "new",
        plain_text: plainText,
      }
    )
    .then((_) => null)
    .catch((err) => console.log(err));
};

const upvoteDoubt = (doubt_id, have_updated_already, vote_count, user) => {
  // update the value in the doubt document
  db.collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .doc(doubt_id)
    .update({
      vote_count: have_updated_already
        ? firebase.firestore.FieldValue.increment(-1)
        : firebase.firestore.FieldValue.increment(1),
    });

  if (have_updated_already) {
    db.collection("doubt_forum")
      .doc(user.grade)
      .collection("posts")
      .doc(doubt_id)
      .collection("votes")
      .doc(user.uid)
      .delete();
  } else {
    // add upvote info to upvote collection if not upvoted
    db.collection("doubt_forum")
      .doc(user.grade)
      .collection("posts")
      .doc(doubt_id)
      .collection("votes")
      .doc(user.uid)
      .set({
        voter_id: user.uid,
      });
  }
};

const postAnswer = async (
  doubtId,
  richText,
  files,
  youtubeUrl,
  answerImages,
  isAnswered,
  user,
  askUserId
) => {
  var images_url;
  if (files && files.length > 0) {
    if (files.length === 1) {
      images_url = await uploadImage(files[0]).then((url) => url);
    } else {
      var temp_imges_urls = [];
      for (let i = 0; i < files.length; i++) {
        temp_imges_urls.push(await uploadImage(files[i]).then((url) => url));
      }

      images_url = temp_imges_urls;
    }
  }

  let final_images_url;
  try {
    final_images_url =
      answerImages && answerImages.length > 0
        ? files.length === 1
          ? images_url & (images_url.length > 0)
            ? [images_url, ...answerImages]
            : answerImages
          : [...images_url, ...answerImages]
        : null;
  } catch (error) {}

  db.collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .doc(doubtId)
    .update({
      is_answered: true,
      answer_user_id: user.uid,
      answer_text: richText ? reactToQuill(richText) : null,
      youtube_id: youtubeUrl ? youTubeGetID(youtubeUrl) : null,
      contains_video: youtubeUrl ? true : false,
      answer_create_ts: Date.now(),
      answer_images: answerImages,
    })
    .then(function () {
      showSnackbar(
        `${isAnswered ? "Answer Updated" : "Answer Submitted"}`,
        "success"
      );

      notifyStudentAnswerStatusServiceFn({
        uid: askUserId,
        doubt_id: doubtId,
        isEdit: isAnswered,
        plainText: richText ? quillToPlainText(reactToQuill(richText)) : "",
      });
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while postAnswer for doubtId: ${doubtId} by userUid: ${user.uid}`
      );
      showSnackbar(`Server Error`, "server-error");
    });
};

const unreadAnswerNotification = ({ userId, grade, callback }) => {
  return db.collection("user_notifications")
    .doc(grade)
    .collection("user_notifications")
    .doc(userId)
    .onSnapshot((snapshot) => {
      if (snapshot.exists) {
        let _data = snapshot.data();
        if (_data["unread_answered_doubt_count"] > 0) {
          return callback(_data["unread_answered_doubt_count"]);
        }

        callback(0);
      }
    });
};

const resetUnreadMsgCount = ({ userId, grade }) => {
  db.collection("user_notifications")
    .doc(grade)
    .collection("user_notifications")
    .doc(userId)
    .set(
      {
        unread_answered_doubt_count: 0,
      },
      { merge: true }
    )
    .catch((err) => console.log(err));
};

export {
  upvoteDoubt,
  postAnswer,
  unreadAnswerNotification,
  resetUnreadMsgCount,
};
