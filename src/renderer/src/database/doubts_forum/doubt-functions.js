import { db } from "../../firebase_config";
import { uploadImage, checkIfUrlExists } from "../../database";
import { generateUrlFromString, showSnackbar } from "../../helpers";
import firebase from "firebase/app";

const askDoubt = async (
  categorySelected,
  chapterSelected,
  subjectSelected,
  doubt_question,
  files,
  user
) => {
  var _imagesUrl;
  if (files && files.length > 0) {
    if (files.length === 1) {
      _imagesUrl = await uploadImage(files[0]).then((url) => url);
    } else {
      var _temp = [];
      for (let i = 0; i < files.length; i++) {
        _temp.push(await uploadImage(files[i]).then((url) => url));
      }

      _imagesUrl = _temp;
    }
  }

  let generated_doubt_url = generateUrlFromString(doubt_question);
  let generated_doubt_url_exists = await checkIfUrlExists(
    generated_doubt_url,
    user.grade
  );

  while (generated_doubt_url_exists === true) {
    generated_doubt_url = `${generated_doubt_url}-${Math.floor(
      Math.random() * 1000 + 1
    )}`;
    generated_doubt_url_exists = await checkIfUrlExists(
      generated_doubt_url,
      user.grade
    );
  }

  await db
    .collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .add({
      answer_create_ts: null,
      answer_images: null,
      answer_text: null,
      doubt_grade: user.grade,
      answer_user_id: null,
      contains_video: false,
      ask_user_id: user.uid,
      chapter: chapterSelected,
      comment_count: 0,
      is_answered: false,
      is_deleted: false,
      question_create_ts: Date.now(),
      question_images:
        files && files.length > 0
          ? files.length === 1
            ? [_imagesUrl]
            : _imagesUrl
          : null,
      question_text: doubt_question,
      doubt_url: generated_doubt_url,
      recommendation_score: 0,
      subject: categorySelected === "Maths" ? null : subjectSelected,
      top_level: categorySelected,
      vote_count: 0,
      youtube_id: null,
    })
    .then(function (docRef) {
      showSnackbar("Doubt Posted", "success");
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while asking doubt for doubt_question: ${doubt_question}, subjectSelected:${subjectSelected} `
      );
      showSnackbar("Server Error", "server-error");
    });

  return generated_doubt_url;
};

const getDoubtInfoByURL = async (url, grade) => {
  let my_doubts = [];
  await db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .where("doubt_url", "==", url)
    .where("is_deleted", "==", false)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        my_doubts.push({ id: doc.id, post: doc.data() });
      });
    })
    .catch(function (error) {
      console.error(`Error ${error} while getDoubtInfoByURL for url: ${url}`);
    });
  return my_doubts;
};

const getDoubtInfoByDoubtId = async (id, grade) => {
  let my_doubts = [];
  await db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .where(firebase.firestore.FieldPath.documentId(), "==", id)
    .where("is_deleted", "==", false)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        my_doubts.push({ id: doc.id, post: doc.data() });
      });
    })
    .catch(function (error) {
      console.error(`Error ${error} while getDoubtInfoByDoubtId for id: ${id}`);
    });
  return my_doubts;
};

const updateDoubt = async ({
  categorySelected,
  chapterSelected,
  subjectSelected,
  doubt_question,
  imagesFromBeforeUrl,
  files,
  doubtId,
  doubt_url,
  user,
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


  const getFinalImagesUrl = () => {
    let final_images_url = [];

    // add images from before
    if (imagesFromBeforeUrl && imagesFromBeforeUrl.length > 0) {
      if (final_images_url && final_images_url !== null) {
        imagesFromBeforeUrl.map((imageUrl) => {
          final_images_url.push(imageUrl);
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

    return final_images_url;
  };

  await db
    .collection("doubt_forum")
    .doc(user.grade)
    .collection("posts")
    .doc(doubtId)
    .update({
      question_images: getFinalImagesUrl() ? getFinalImagesUrl() : null,
      question_text: doubt_question,
      doubt_url: doubt_url,
      subject: subjectSelected,
      chapter: chapterSelected,
      top_level: categorySelected,
    })
    .then(function () {
      showSnackbar("Doubt Updated", "success");
    })
    .catch(function (error) {
      showSnackbar("Server Error", "server-error");
      console.error(
        `Error ${error} while updating doubt for doubtId: ${doubtId}`
      );
    });
};

const deleteDoubt = (doubtId, grade) => {
  db.collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .doc(doubtId)
    .update({
      is_deleted: true,
    })
    .then(function () {
      // deleted successfully
      showSnackbar("Doubt Deleted", "trash");
    })
    .catch(function (error) {
      // error caused while delting
      showSnackbar("Server Error", "server-error");
      console.error(
        `Error ${error} while deleting doubt for doubtId: ${doubtId}`
      );
    });
};

const getIsUpVoted = async (doubtID, userId, grade) => {
  let upvoted;
  var docRef = db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .doc(doubtID)
    .collection("votes")
    .doc(userId);

  await docRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        //setUpvoted(true);
        upvoted = true;

        return true;
      } else {
        // doc.data() will be undefined in this case

        //setUpvoted(false);
        upvoted = false;

        return false;
      }
    })
    .catch(function (error) {
      upvoted = false;
      return false;
    });

  return upvoted;
};

export {
  askDoubt,
  getDoubtInfoByURL,
  getDoubtInfoByDoubtId,
  updateDoubt,
  deleteDoubt,
  getIsUpVoted,
};
