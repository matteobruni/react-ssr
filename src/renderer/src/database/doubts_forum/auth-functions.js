import { db } from "../../firebase_config";

const getUserInfo = (userUid) => {
  db.collection("users")
    .doc(userUid)
    .get()
    .then(function (doc) {
      if (doc.exists) {
      } else {
        // doc.data() will be undefined in this case
      }
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while getting user info for userUid: ${userUid} `
      );
    });
};

export { getUserInfo };
