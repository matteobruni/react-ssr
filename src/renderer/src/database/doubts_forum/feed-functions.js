import { db } from "../../firebase_config";

async function fetchMoreDoubts({
  sortByDBString,
  topLevel,
  selectedSubject,
  chapter,
  isAnswered,
  lastDocument,
  lastPostId,
  grade,
  selectedTopic,
}) {
  let _data = [],
    lastDocumentId;

  var doubtsRef = db.collection("doubt_forum").doc(grade).collection("posts");

  if (topLevel === "General") {
    if (
      selectedSubject &&
      selectedSubject !== "All" &&
      selectedSubject !== "" &&
      selectedSubject !== "General"
    ) {
      await doubtsRef
        .doc(lastPostId)
        .get()
        .then(async function (doc) {
          await doubtsRef
            .where("top_level", "==", topLevel)
            .where("subject", "==", selectedSubject)
            .where("is_deleted", "==", false)
            .where("is_answered", "==", isAnswered)
            .orderBy(sortByDBString, "desc")
            .startAfter(doc)
            .limit(3)
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach(function (doc) {
                _data.push({ id: doc.id, post: doc.data() });
              });

              if (querySnapshot.size === 0) {
                lastDocumentId = null;
                _data = null;
              }
            })
            .catch((error) => console.error(error));
        });

      return [_data, lastDocumentId];
    } else {
      await doubtsRef
        .doc(lastPostId)
        .get()
        .then(async function (doc) {
          await doubtsRef
            .where("is_deleted", "==", false)
            .where("is_answered", "==", isAnswered)
            .orderBy(sortByDBString, "desc")
            .startAfter(doc)
            .limit(3)
            .get()
            .then(function (querySnapshot) {
              querySnapshot.forEach(function (doc) {
                _data.push({ id: doc.id, post: doc.data() });
              });
              lastDocumentId =
                querySnapshot.docs[querySnapshot.docs.length - 1];
              if (querySnapshot.size === 0) {
                lastDocumentId = null;
                _data = null;
              }
            })
            .catch((error) => console.error(error));
        });
      return [_data, lastDocumentId];
    }
  } else {
    if (
      selectedSubject &&
      selectedSubject !== "All" &&
      selectedSubject !== ""
    ) {
      var doubtQuery = doubtsRef.where(
        topLevel === "Maths" ? "chapter" : "subject",
        "==",
        topLevel === "Maths" ? chapter : selectedSubject
      );

      if (selectedTopic) {
        doubtQuery = doubtsRef
          .where(
            topLevel === "Maths" ? "chapter" : "subject",
            "==",
            topLevel === "Maths" ? chapter : selectedSubject
          )
          .where("chapter", "==", selectedTopic);
      }

      await doubtQuery
        .where("is_deleted", "==", false)
        .where("is_answered", "==", isAnswered)
        .orderBy(sortByDBString, "desc")
        .startAfter(lastDocument.post.question_create_ts)
        .limit(3)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            _data.push({ id: doc.id, post: doc.data() });
          });
          lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
      return [_data, lastDocumentId];
    } else if (selectedSubject === "All" && topLevel) {
      await doubtsRef
        .where("is_deleted", "==", false)
        .where("top_level", "==", topLevel)
        .where("is_answered", "==", isAnswered)
        .orderBy(sortByDBString, "desc")
        .startAfter(lastDocument.post.question_create_ts)
        .limit(3)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            _data.push({ id: doc.id, post: doc.data() });
          });
          lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
      return [_data, lastDocumentId];
    } else {
      await doubtsRef
        .where("is_deleted", "==", false)
        .where("is_answered", "==", isAnswered)
        .orderBy(sortByDBString, "desc")
        .startAfter(lastDocument.post.question_create_ts)
        .limit(3)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            _data.push({ id: doc.id, post: doc.data() });
          });
          lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
      return [_data, lastDocumentId];
    }
  }
}

// Fecthing My Doubts
async function getMyDoubts({ userID, grade }) {
  let _data = [],
    lastDocumentId;

  await db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .where("ask_user_id", "==", userID)
    .where("is_deleted", "==", false)
    .orderBy("question_create_ts", "desc")
    .limit(7)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        _data.push({ id: doc.id, post: doc.data() });
      });

      if (querySnapshot.size === 0) {
        lastDocumentId = null;
        _data = null;
      }
    })
    .catch((error) => console.error(error));

  return [_data, lastDocumentId];
}

// Fecthing My More Doubts
async function fetchMoreMyDoubts({
  userID,
  sortByDBString,
  lastPostId,
  grade,
}) {
  let doubtsRef = db.collection("doubt_forum").doc(grade).collection("posts");

  let _data = [],
    lastDocumentId;

  await doubtsRef
    .doc(lastPostId)
    .get()
    .then(async function (document) {
      await doubtsRef
        .where("ask_user_id", "==", userID)
        .where("is_deleted", "==", false)
        .orderBy(sortByDBString, "desc")
        .startAfter(document)
        .limit(3)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            _data.push({ id: doc.id, post: doc.data() });
          });

          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
    });

  return [_data, lastDocumentId];
}

// Fecthing Instructor MyDoubts
async function getInstructorMyDoubts({ userID, grade }) {
  let _data = [],
    lastDocumentId;
  await db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .where("answer_user_id", "==", userID)
    .where("is_deleted", "==", false)
    .orderBy("question_create_ts", "desc")
    .limit(7)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        _data.push({ id: doc.id, post: doc.data() });
      });

      if (querySnapshot.size === 0) {
        lastDocumentId = null;
        _data = null;
      }
    })
    .catch((error) => console.error(error));

  return [_data, lastDocumentId];
}

// Fecthing My More Doubt
async function fetchMoreInstructorMyDoubts({
  userID,
  sortByDBString,
  lastPostId,
  grade,
}) {
  let doubtsRef = db.collection("doubt_forum").doc(grade).collection("posts");

  let _data = [],
    lastDocumentId;

  await doubtsRef
    .doc(lastPostId)
    .get()
    .then(async (document) => {
      await doubtsRef
        .where("ask_user_id", "==", userID)
        .where("is_deleted", "==", false)
        .orderBy(sortByDBString, "desc")
        .startAfter(document)
        .limit(3)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            _data.push({ id: doc.id, post: doc.data() });
          });

          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
    });

  return [_data, lastDocumentId];
}

// Fetching Doubt Questions Based On User Selection
async function getDoubts({
  sortByDBString,
  topLevel,
  selectedSubject,
  chapter,
  isAnswered,
  grade,
  similarDoubts = false,
  selectedTopic = "",
}) {
  if (!(topLevel || "")) return [[], null];

  let _data = [],
    lastDocumentId;

  let doubtsRef = db.collection("doubt_forum").doc(grade).collection("posts");

  if (topLevel === "General" && selectedSubject) {
    if (
      (selectedSubject || "") &&
      selectedSubject !== "All" &&
      selectedSubject !== "General"
    ) {
      await doubtsRef
        .where("top_level", "==", topLevel)
        .where("subject", "==", selectedSubject)
        .where("is_deleted", "==", false)
        .where("is_answered", "==", isAnswered)
        .orderBy(sortByDBString, "desc")
        .limit(7)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(function (doc) {
            _data.push({ id: doc.id, post: doc.data() });
          });
          lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
      return [_data, lastDocumentId];
    } else {
      await doubtsRef
        .where("is_deleted", "==", false)
        .where("is_answered", "==", isAnswered)
        .orderBy(sortByDBString, "desc")
        .limit(7)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(function (doc) {
            _data.push({ id: doc.id, post: doc.data() });
          });
          lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
          if (querySnapshot.size === 0) {
            lastDocumentId = null;
            _data = null;
          }
        })
        .catch((error) => console.error(error));
      return [_data, lastDocumentId];
    }
  } else {
    switch (true) {
      // #1-------------------------
      case ((selectedSubject || "") && selectedSubject !== "All") ||
        ((chapter || "") && chapter !== "All"):
        let doubtQuery = doubtsRef.where(
          topLevel === "Maths" ? "chapter" : "subject",
          "==",
          topLevel === "Maths" ? chapter : selectedSubject
        );

        if (similarDoubts) {
          doubtQuery = doubtsRef.where("chapter", "==", chapter);
        }

        if (selectedTopic) {
          doubtQuery = doubtsRef
            .where(
              topLevel === "Maths" ? "chapter" : "subject",
              "==",
              topLevel === "Maths" ? chapter : selectedSubject
            )
            .where("chapter", "==", selectedTopic);
        }

        await doubtQuery
          .where("is_deleted", "==", false)
          .where("is_answered", "==", isAnswered)
          .orderBy(
            sortByDBString ? sortByDBString : "recommendation_score",
            "desc"
          )
          .limit(7)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              _data.push({ id: doc.id, post: doc.data() });
            });

            lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (querySnapshot.size === 0) {
              lastDocumentId = null;
              _data = null;
            }
          })
          .catch((error) => console.error(error));
        return [_data, lastDocumentId];
      // #2-------------------------
      case selectedSubject === "All":
        await doubtsRef
          .where("is_deleted", "==", false)
          .where("top_level", "==", topLevel)
          .where("is_answered", "==", isAnswered)
          .orderBy(sortByDBString, "desc")
          .limit(7)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              _data.push({ id: doc.id, post: doc.data() });
            });
            lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (querySnapshot.size === 0) {
              lastDocumentId = null;
              _data = null;
            }
          })
          .catch((error) => console.error(error));
        return [_data, lastDocumentId];

      default:
        await doubtsRef
          .where("is_deleted", "==", false)
          .where("is_answered", "==", isAnswered)
          .orderBy(
            sortByDBString ? sortByDBString : "recommendation_score",
            "desc"
          )
          .limit(7)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach(function (doc) {
              _data.push({ id: doc.id, post: doc.data() });
            });
            lastDocumentId = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (querySnapshot.size === 0) {
              lastDocumentId = null;
              _data = null;
            }
          })
          .catch((error) => console.error(error));
        return [_data, lastDocumentId];
    }
  }
}

/// AskDoubtPopup.js
async function getFilterData(grade) {
  let filter_info_doc;
  var docRef = db.collection(`blaze/${grade}/hierarchy`).doc(grade);

  await docRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        filter_info_doc = doc;
      } else {
        filter_info_doc = null;
      }
    })
    .catch((error) => console.error(error));

  return filter_info_doc;
}

const getClassChapters = async (grade) => {
  let chapters;
  var docRef2 = db.collection(`blaze/${grade}/hierarchy`).doc(grade);

  await docRef2
    .get()
    .then((doc) => {
      if (doc.exists) {
        chapters = doc.data().subject_chapter_map;
      } else {
        chapters = null;
      }
    })
    .catch((error) => console.error(error));

  return chapters;
};

export {
  getDoubts,
  getMyDoubts,
  getInstructorMyDoubts,
  getFilterData,
  getClassChapters,
  fetchMoreDoubts,
  fetchMoreInstructorMyDoubts,
  fetchMoreMyDoubts,
};
