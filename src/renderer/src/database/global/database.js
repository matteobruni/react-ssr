import { v4 as uuidv4 } from "uuid";
import Axios from "axios";
import { firestore, database } from "firebase";
import { version } from "./../../../../../package.json";
import { db, rdb, storage, functions } from "../../firebase_config";
import {fetchIndianTime, firebaseAPiKey} from "../../helpers";
import { loadScript } from "../../helpers/loadScript/index";

const uploadUserInfo = async (
  userId,
  name,
  email,
  avatarUrl,
  isInstructor,
  phoneNumber = null,
  countryCode
) => {
  let time_now = Date.now();

  await db
    .collection("users")
    .doc(userId)
    .set({
      app_rating: null,
      app_rating_history: [],
      email: email,
      grade: null,
      has_rated_app: false,
      is_instructor: isInstructor,
      name: name,
      phone_country_code: countryCode,
      phone_number: phoneNumber ? phoneNumber : null,
      pro_expiration_date: null,
      profile_url: avatarUrl,
      role: isInstructor ? "PuStack Faculty" : "Student", //TODO change as required
      sign_up_ts: time_now,
      tier: "free",
      uid: userId,
      source: "web " + version,
    })
    .then(() => console.log("done1"))
    .catch((err) => console.log(err));

  await db
    .collection("users")
    .doc(userId)
    .collection("meta")
    .doc(userId)
    .set({
      name: name,
      profile_url: avatarUrl,
      role: isInstructor ? "PuStack Faculty" : "Student",
    })
    .then(() => console.log("done2"))
    .catch((err) => console.log(err));

  return time_now;
};

const uploadFinalUserInfo = async (userId, userData) => {
  let flag1 = false;
  let flag2 = false;

  await db
    .collection("users")
    .doc(userId)
    .set(userData, { merge: true })
    .then(() => (flag1 = true))
    .catch((er) => {
      console.log(er);
      flag1 = false;
    });

  await db
    .collection("users")
    .doc(userId)
    .collection("meta")
    .doc(userId)
    .set({
      name: userData.name,
      profile_url: userData.profile_url,
      role: "Student",
    })
    .then(() => (flag2 = true))
    .catch(() => (flag2 = false));

  return flag1 && flag2;
};

const updateUserName = async (userId, name) => {
  return await db
    .collection("users")
    .doc(userId)
    .set(
      {
        name: name,
      },
      { merge: true }
    )
    .then(() => true)
    .catch(() => false);
};

const updateAppRating = async (userId, rating) => {
  return await db
    .collection("users")
    .doc(userId)
    .set(
      {
        app_rating: rating,
        app_rating_history: firestore.FieldValue.arrayUnion({
          rate_ts: new Date(),
          rating: rating,
        }),
        has_rated_app: true,
      },
      { merge: true }
    )
    .then(() => true)
    .catch(() => false);
};

const updateProfileImage = async (file, userId) => {
  let path = `users/user_profile/${userId}/${uuidv4()}.jpg`;
  let _url = null;

  await storage
    .ref()
    .child(path)
    .put(await fetch(file?.url).then((r) => r.blob()))
    .then(async (snapshot) => {
      return snapshot.ref.getDownloadURL().then((url) => (_url = url));
    });

  if (_url || "") {
    return await db
      .collection("users")
      .doc(userId)
      .set(
        {
          profile_url: _url,
        },
        { merge: true }
      )
      .then(() => [_url, true])
      .catch(() => [_url, false]);
  } else return [_url, false];
};

const getDailyEngagement = async (
  userId,
  curYearMonth,
  prevYearMonth,
  isDateLessThan7
) => {
  const currMonthData = await db
    .collection("user_engagement")
    .doc("daily_engagement")
    .collection(userId)
    .doc(curYearMonth)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return doc.data();
      } else return null;
    });

  let prevMonthData = null;

  if (isDateLessThan7) {
    prevMonthData = await db
      .collection("user_engagement")
      .doc("daily_engagement")
      .collection(userId)
      .doc(prevYearMonth)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data();
        } else return null;
      });
  }

  return [currMonthData, prevMonthData];
};

const getPustackCareChat = async ({ userId }) => {
  return await db
    .collection("care_internal")
    .doc("collections")
    .collection("student")
    .doc(userId)
    .collection("messages_student")
    .orderBy("sent_on", "desc")
    .limit(21)
    .get()
    .then((snapshot) => {
      let _data = [];
      if (snapshot.docs.length !== 0) {
        snapshot.forEach((doc) => {
          _data.push(doc.data());
        });
      }

      return _data;
    });
};

const getMorePustackCareChat = async ({ userId, doc }) => {
  return await db
    .collection("care_internal")
    .doc("collections")
    .collection("student")
    .doc(userId)
    .collection("messages_student")
    .orderBy("sent_on", "desc")
    .where("sent_on", "<", doc?.sent_on)
    .limit(10)
    .get()
    .then((snapshot) => {
      let _data = [];
      if (snapshot.docs.length !== 0) {
        snapshot.forEach((doc) => {
          _data.push(doc.data());
        });
      }

      return _data;
    })
    .catch(() => []);
};

const getPustackCareNewChat = ({ userId, doc }) => {
  return db
    .collection("care_internal")
    .doc("collections")
    .collection("student")
    .doc(userId)
    .collection("messages_student")
    .orderBy("sent_on", "asc")
    .where("sent_on", ">", doc?.sent_on);
};

const updateCareChat = async ({ body, userId }) => {
  return await db
    .collection("care_internal")
    .doc("collections")
    .collection("student")
    .doc(userId)
    .collection("messages_student")
    .add(body)
    .then(() => true)
    .catch(() => false);
};

const getCareMessageCount = ({ userId, grade }) => {
  return db
    .collection("user_notifications")
    .doc(grade)
    .collection("user_notifications")
    .doc(userId);
};

const updateCareMessageCount = ({ userId, grade }) => {
  db.collection("user_notifications")
    .doc(grade)
    .collection("user_notifications")
    .doc(userId)
    .set(
      {
        unread_care_message_count: 0,
      },
      { merge: true }
    )
    .then(() => {})
    .catch((err) => console.log(err));
};

const deleteUserFromDatabase = (userId) => {
  db.collection("users").doc(userId).delete();
};

const updateUserBlazeAvailability = async ({
  userId,
  sessionId,
  userType,
  callId,
  callStartTs = null,
}) => {
  await rdb
    .ref(`/sessions/${sessionId}/calls/${callId}`)
    .onDisconnect()
    .update({
      call_end_ts: database.ServerValue.TIMESTAMP
    })
  rdb
    .ref(`/sessions/${sessionId}/calls/${callId}/${userType}`)
    .onDisconnect()
    .update({
      uid: userId,
      is_web_online: false,
      platform: 'web',
      last_seen: database.ServerValue.TIMESTAMP,
      offline_ts: database.ServerValue.TIMESTAMP,
    })
    .then(() => {
      if (userType === "instructor" && !callStartTs) {
        rdb.ref(`/sessions/${sessionId}/calls/${callId}`).update({
          call_start_ts: database.ServerValue.TIMESTAMP,
        });
      }
      rdb
        .ref(`/sessions/${sessionId}/calls/${callId}/${userType}`)
        .update({
          uid: userId,
          is_web_online: true,
          platform: 'web',
          last_seen: database.ServerValue.TIMESTAMP,
        })
        .catch((err) => console.log({ err }));
    })
    .catch((err) => console.log(err));
};

const cancelOnDisconnect = ({ sessionId, userType, callId }) => {
  rdb
    .ref(`/sessions/${sessionId}/calls/${callId}/${userType}`)
    .onDisconnect()
    .cancel();
};

const markUserBlazeOffline = ({ userId, sessionId, userType, callId }) => {
  rdb
    .ref(`/sessions/${sessionId}/calls/${callId}/${userType}`)
    .update({
      uid: userId,
      is_web_online: false,
      platform: 'web',
      last_seen: database.ServerValue.TIMESTAMP,
      offline_ts: database.ServerValue.TIMESTAMP,
    })
    .catch((err) => console.log(err));
};

const rewardProMembership = async (uid, days) => {
  try {
    const userDocRef = db.collection("users").doc(uid);
    const userDocQuery = await userDocRef.get();
    const userData = userDocQuery.data();
    const hasProPlan = userData["tier"] === "pro";

    if (hasProPlan) {
      const _proExpirationDate = userData["pro_expiration_date"];

      return await userDocRef
        .set(
          {
            pro_expiration_date: _proExpirationDate.toDate().addDays(days),
          },
          { merge: true }
        )
        .then(() => true)
        .catch(() => false);
    } else {
      console.log("first time user");

      let _proExpirationDate = new Date();
      _proExpirationDate.setDate(_proExpirationDate.getDate() + 7);

      return await userDocRef
        .set(
          {
            tier: "pro",
            pro_expiration_date: _proExpirationDate,
          },
          { merge: true }
        )
        .then(() => true)
        .catch(() => false);
    }
  } catch (e) {
    return "Error in rewardProMembership " + e;
  }
};

const generateInvitationLink = async (uid) => {
  return await Axios.post(
    `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${firebaseAPiKey}`,
    {
      dynamicLinkInfo: {
        domainUriPrefix: "https://pustack.page.link",
        link: `https://pustack.com/referrals/?q=${uid}`,
        androidInfo: {
          androidPackageName: "com.pustack.android.pustack",
          androidMinPackageVersionCode: "1",
        },
        socialMetaTagInfo: {
          socialTitle: "PuStack Pro Invitation",
          socialDescription:
            "Get 30 days of PuStack Pro membership when you signup using this link",
          socialImageLink: "https://www.pustack.com/facebook.png",
        },
        navigationInfo: {
          enableForcedRedirect: true,
        },
      },
    }
  )
    .then((res) => res?.data)
    .catch((err) => err);
};

const getReferredUserList = async (uid) => {
  return await db
    .collection("referrals")
    .doc(uid)
    .get()
    .then((doc) => doc.data().referred_user_list)
    .catch(() => []);
};

export const createWalletRefillOrder = async ({
  amount,
  userId,
  userGrade,
}) => {
  const createWalletRefillOrderFunction = functions.httpsCallable(
    "createWalletRefillOrder"
  );

  const response = await createWalletRefillOrderFunction({
    amount: amount,
    user_id: userId,
    user_grade: userGrade,
  });

  return response?.data;
};

const refillPayment = async ({
  refillAmount,
  user,
  setOrderId,
  setProcessingOrder,
  setProcessingRefill,
}) => {
  const _orderData = await createWalletRefillOrder({
    amount: refillAmount,
    userId: user?.uid,
    userGrade: user?.grade,
  });

  setOrderId(_orderData?.order_id);

  let res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

  if (!res) {
    // RazorPay SDK Failed To Load
    console.error("RazorPay SDK Failed To Load");
  } else {
    const _orderId = _orderData?.order_id;
    const _price = Number(_orderData?.amount);
    const _orderDescription = "Refill PuStack Wallet Balance";

    let paymentOptions = {
      key: "rzp_test_DtDgmVmIj5dm2Y",
      amount: _price * 100,
      name: "PuStack Pro",
      order_id: _orderId,
      description: _orderDescription,
      handler: function () {},
      modal: {
        ondismiss: function () {
          setProcessingRefill(false);
          setProcessingOrder(false);
        },
      },
      prefill: {
        name: user?.name,
        contact: user?.phone_number,
        email: user?.email,
      },
      notes: {
        user_id: user?.uid,
        product_name: "pustack_balance",
      },
    };

    console.info("242", paymentOptions);

    let rzr_checkout = new window.Razorpay(paymentOptions);

    rzr_checkout.on("payment.failed", () => {
      console.log({ payment: "failed" });
      setProcessingOrder(false);
    });

    rzr_checkout.open();
  }
};

export {
  updateUserName,
  uploadUserInfo,
  updateCareChat,
  updateAppRating,
  updateProfileImage,
  getDailyEngagement,
  getPustackCareChat,
  uploadFinalUserInfo,
  getCareMessageCount,
  rewardProMembership,
  getReferredUserList,
  getPustackCareNewChat,
  getMorePustackCareChat,
  updateCareMessageCount,
  deleteUserFromDatabase,
  updateUserBlazeAvailability,
  cancelOnDisconnect,
  markUserBlazeOffline,
  generateInvitationLink,
  refillPayment,
};
