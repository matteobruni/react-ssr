import { db, storage } from "../../firebase_config";
import { v4 as uuidv4 } from "uuid";
import { generateUrlFromString } from "../../helpers";

const uploadImage = async (file) => {
  // var path = `doubts/images/${uuidv4()}${file.ext}`;
  var path = `doubts/images/${uuidv4()}.png`;
  var _url = await storage
    .ref()
    .child(path)
    .put(await fetch(file.url).then((r) => r.blob()))
    .then(async (snapshot) => {
      return snapshot.ref.getDownloadURL().then((url) => url);
    });

  return _url;
};

const uploadBase64urlImage = async (file, path) => {
  var _url = await storage
    .ref()
    .child(path)
    .put(file)
    .then(async (snapshot) => {
      return snapshot.ref.getDownloadURL().then((url) => url);
    });
  // Create file metadata to update
  var newMetadata = {
    cacheControl: "public,max-age=300",
    contentType: `image/png`,
  };

  // updating MEME TYPE
  await storage
    .ref()
    .child(path)
    .updateMetadata(newMetadata)
    .then(function (metadata) {
      // Updated metadata for 'images/forest.jpg' is returned in the Promise
    })
    .catch(function (error) {
      // Uh-oh, an error occurred!
      console.error(
        `Error ${error} while uploading base64urlImage for path: ${path}`
      );
    });

  return _url;
};

const generateNewUrl = async (doubt_question, grade) => {
  let generated_doubt_url = generateUrlFromString(doubt_question);
  let generated_doubt_url_exists = await checkIfUrlExists(
    generated_doubt_url,
    grade
  );

  while (generated_doubt_url_exists === true) {
    generated_doubt_url = `${generated_doubt_url}-${Math.floor(
      Math.random() * 1000 + 1
    )}`;
  }

  return generated_doubt_url;
};

const checkIfUrlExists = async (url, grade) => {
  let doubtDocumentSnapshotExists;
  await db
    .collection("doubt_forum")
    .doc(grade)
    .collection("posts")
    .where("doubt_url", "==", url)
    .get()
    .then(function (documentSnapshot) {
      doubtDocumentSnapshotExists = documentSnapshot.docs.length > 0;
    })
    .catch(function (error) {
      console.error(
        `Error ${error} while checking if the url exists for url: ${url}`
      );
    });

  return doubtDocumentSnapshotExists;
};

const getUserInfoById = async (getUserId) => {
  let name,
    profile_url,
    role,
    email,
    isInstructor,
    sign_up_ts,
    phone_number,
    has_rated_app,
    app_rating,
    pro_expiration_date,
    tier,
    grade,
    phone_country_code;

  await db
    .collection("users")
    .doc(getUserId)
    .get()
    .then(async (doc) => {
      if (doc.exists) {
        name = doc.data().name;
        grade = doc.data().grade;
        profile_url = doc.data().profile_url;
        role = doc.data().role;
        email = doc.data().email;
        isInstructor = doc.data().is_instructor;
        sign_up_ts = doc.data().sign_up_ts;
        phone_number = doc.data().phone_number;
        phone_country_code = doc.data().phone_country_code;
        has_rated_app = doc.data().has_rated_app;
        app_rating = doc.data().app_rating;
        pro_expiration_date = doc.data().pro_expiration_date;
        tier = doc.data().tier;
      } else {
        console.log("No user found");
      }
    })
    .catch((er) => {
      // console.log(er);
      name = null;
      grade = null;
      profile_url = null;
      role = null;
      email = null;
      isInstructor = null;
      sign_up_ts = null;
      phone_number = null;
      phone_country_code = null;
      has_rated_app = null;
      app_rating = null;
      pro_expiration_date = null;
      tier = null;
    });

  return [
    name,
    profile_url,
    role,
    email,
    isInstructor,
    sign_up_ts,
    phone_number,
    has_rated_app,
    app_rating,
    pro_expiration_date,
    tier,
    grade,
    phone_country_code,
  ];
};

const getUserMetaInfoById = async (userId) => {
  let instructor_name, full_name, profile_url, department;

  await db
    .collection("users")
    .doc(userId)
    .collection("meta")
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        instructor_name = doc.data().instructor_name;
        full_name = doc.data().full_name;
        profile_url = doc.data().profile_url;
        department = doc.data().department;
      } else console.log("No user found");
    });

  return [instructor_name, full_name, profile_url, department];
};

const changeUserGrade = async (userId, grade) => {
  return await db
    .collection("users")
    .doc(userId)
    .set({ grade: grade }, { merge: true })
    .then(() => true)
    .catch(() => false);
};

export {
  uploadImage,
  uploadBase64urlImage,
  generateNewUrl,
  checkIfUrlExists,
  getUserInfoById,
  getUserMetaInfoById,
  changeUserGrade,
};
