import React, { useState, useContext, useEffect, useRef } from "react";
import firebase from "firebase/app";
import Lottie from "lottie-react-web";
import Timer from "react-compound-timer";
import { Dialog } from "@material-ui/core";
import PhoneInput from "react-phone-input-2";
import { useHistory } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import { firebaseApp, functions } from "../../../firebase_config";
import { UserContext, IntroContext } from "../../../context";
import { version } from "../../../../../../package.json";
import {
  getUserInfoById,
  uploadUserInfo,
  uploadFinalUserInfo,
  deleteUserFromDatabase,
  rewardProMembership,
} from "../../../database";
import gulu from "../../../assets/onboarding/gulu.svg";
import mars from "../../../assets/onboarding/mars.svg";
import comet from "../../../assets/onboarding/comet.svg";
import phone from "../../../assets/onboarding/phone.svg";
import launch from "../../../assets/onboarding/launch.json";
import planet1 from "../../../assets/onboarding/planet_1.svg";
import planet2 from "../../../assets/onboarding/planet_2.svg";
import planet3 from "../../../assets/onboarding/planet_3.svg";
import planet4 from "../../../assets/onboarding/planet_4.svg";
import planet5 from "../../../assets/onboarding/planet_5.svg";
import planet6 from "../../../assets/onboarding/planet_6.svg";
import PdfPreview from "../../../components/newsfeed/pdf-preview";
import astronaut from "../../../assets/onboarding/astronaut.json";
import planetEarth from "../../../assets/onboarding/planet_earth.svg";
import controlRoom from "../../../assets/onboarding/control_room.svg";
import phoneSocial from "../../../assets/onboarding/phone_social.svg";
import circularProgress from "../../../assets/lottie/circularProgress.json";
import phoneVerification from "../../../assets/onboarding/phone_verification.svg";
import phoneVerificationHand from "../../../assets/onboarding/phone_verification_hand.svg";
import {
  signInWithGoogle,
  submitGoogleEmail,
  signInWithFacebook,
  // signInWithApple,
  signInWithPhone,
  submitPhoneNumberAuthCode,
  submitFacebook,
} from "../../../services/auth";
import {
  Google,
  Facebook,
  Facebook2,
  // Apple,
  logoDark,
} from "../../../assets";
import {
  showSnackbar,
  loadingWrapper,
  privacyPolicy,
  termsOfService,
} from "../../../helpers";

import "react-phone-input-2/lib/style.css";
import "./style.scss";
import {getAvailableGrades} from "../../../database/home/fetcher";

const useForceUpdate = () => {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value); // update the state to force render
};

const OnBoardingMobile = ({ setCloseInstallApp }) => {
  const forceUpdate = useForceUpdate();
  const [activeTab, setActiveTab] = useState(0);
  const [lastInput, setLastInput] = useState(10);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [tempUserData, setTempUserData] = useState(null);
  const [tempEmailUserData, setTempEmailUserData] = useState(null);
  const [tempPhoneUserData, setTempPhoneUserData] = useState(null);
  const [otpCode, setOtpCode] = useState(Array(6).fill(""));
  const [plural, setPlural] = useState(true);
  const [spaceKey, setSpaceKey] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState(false);
  const [allowNext, setAllowNext] = useState(false);
  const [resendCode, setResendCode] = useState(true);
  const [phoneRoute, setPhoneRoute] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [checkingOtp, setCheckingOtp] = useState(false);
  const [animateHand, setAnimateHand] = useState(true);
  const [processStarted, setProcessStarted] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [socialProcessStarted, setSocialProcessStarted] = useState([
    false,
    false,
    false,
  ]);
  const [showPDF, setShowPDF] = useState(false);
  const [pushDown, setPushDown] = useState(false);
  const [documentToShow, setDocumentToShow] = useState("");
  const [launchRocket, setLaunchRocket] = useState(false);
  const [existingPhone, setExistingPhone] = useState("");
  const [existingAccountError, setExistingAccountError] = useState(null);
  const [phoneExists, setPhoneExists] = useState(false);
  const [gmailExists, setGmailExists] = useState(false);
  const [googleMailAddress, setGoogleMailAddress] = useState("");
  const [facebookPendingCredentials, setFacebookPendingCredentials] =
    useState("");

  let recaptchaRef = useRef();
  let phoneRouteRef = useRef(phoneRoute);

  const [, setUser] = useContext(UserContext).user;
  const [, setOpenFreeTrial] = useContext(IntroContext).openFreeTrial;
  const [, setTrialType] = useContext(IntroContext).trialType;
  const [, setIsUserProTier] = useContext(UserContext).tier;
  const [, setIsInstructor] = useContext(UserContext).isInstructor;
  const [referrerId] = useContext(UserContext).referrerId;

  const handMovementClasses = [
    " zero",
    " one",
    " two",
    " three",
    " four",
    " five",
    " six",
    " seven",
    " eight",
    " nine",
    "",
  ];

  const planetsArray = [planet1, planet2, planet3, planet4, planet5, planet6];

  let history = useHistory();

  function sendToUrl(string) {
    history.push(string);
  }

  useEffect(() => {
    setTimeout(() => {
      document.querySelector(".loading__wrapper").style.display = "none";
    }, 2000);

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      `recaptcha-container`,
      {
        size: "invisible",
        callback: (response) => {
          console.log({ response });
        },
        "expired-callback": () => window.recaptchaVerifier.clear(),
      },
      firebaseApp
    );
  }, []);

  const handleSliderClose = () => {
    setTimeout(() => {
      setActiveTab(0);
      setSendingOtp(false);
      setPhoneRoute(true);
      setProcessStarted(false);
      setPhoneNumber("+91");
      setOtpCode(Array(6).fill(""));
      setOtpErrorMsg("");
      setTempEmailUserData(null);
      setTempPhoneUserData(null);
      setOtpError(false);
      setSocialProcessStarted([false, false, false]);
      setPhoneNumberError(null);
      setPhoneExists(false);
      setExistingAccountError(null);
      setEmailError(null);
      setFacebookPendingCredentials("");
      setGoogleMailAddress("");
      setGmailExists(false);
    }, 500);
  };

  const handleOTPChange = async (e, i) => {
    const { maxLength, value } = e.target;
    forceUpdate();

    if (animateHand) {
      setLastInput(value);
      setTimeout(() => setLastInput(10), 250);

      if (value.length >= maxLength && i < 5) {
        const nextField = document.querySelector(
          `div > input[name=input${i + 1}]`
        );
        if (nextField !== null) nextField.focus();
      }
    }

    if (!spaceKey) {
      otpCode[i] = value;
      setOtpCode(otpCode);

      const code = otpCode?.join("");

      if (code.length === 6) {
        setCheckingOtp(true);

        let user, res, errorCode;
        try {
          [user, res, errorCode] = await submitPhoneNumberAuthCode(
            code,
            facebookPendingCredentials,
            googleMailAddress,
            false
          );
        } catch (err) {
          return;
        }

        setTempPhoneUserData(user);
        setCheckingOtp(false);
        if (res) {
          setOtpError(false);

          let [
            name,
            profile_url,
            role,
            email,
            is_instructor,
            sign_up_ts,
            phone_number,
            has_rated_app,
            app_rating,
            pro_expiration_date,
            tier,
            grade,
            phone_country_code,
          ] = await getUserInfoById(user.uid);

          if (!email || !phone_number) {
            setActiveTab(activeTab + 1);
          } else {
            const data = {
              email: email,
              uid: user.uid,
              name: name,
              grade: grade,
              is_instructor: is_instructor,
              phone_country_code: phone_country_code,
              phone_number: phone_number,
              profile_url: profile_url,
              role: role,
              sign_up_ts: sign_up_ts,
              has_rated_app: has_rated_app ? has_rated_app : false,
              app_rating: app_rating ? app_rating : 0,
              pro_expiration_date: pro_expiration_date,
            };

            setLaunchRocket(true);

            setTimeout(() => {
              localStorage.setItem(
                "user",
                JSON.stringify({
                  uid: data?.uid,
                  grade: data?.grade,
                  name: data?.name,
                  profile_url: data?.profile_url,
                })
              );
              localStorage.setItem(
                "isInstructor",
                JSON.stringify(is_instructor)
              );
              localStorage.setItem(
                "isUserPro",
                JSON.stringify(tier !== "free")
              );
              setUser(data);
              setIsUserProTier(tier !== "free");
              setIsInstructor(is_instructor);
              loadingWrapper();
              sendToUrl("/");
            }, 2000);
            return setTimeout(handleSliderClose, 1500);
          }

          setAllowNext(true);
        } else {
          setOtpError(true);
          setOtpErrorMsg(errorCode);
        }
      } else {
        setOtpError(false);
        setAllowNext(false);
      }
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === " ") {
      setSpaceKey(true);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      setAnimateHand(false);
      forceUpdate();

      if (otpCode[i]?.length === 0 && i > 0 && i <= 5) {
        const prevField = document.querySelector(
          `div > input[name=input${i - 1}]`
        );
        if (prevField !== null) prevField.focus();
      }
    } else {
      setAnimateHand(true);
      setSpaceKey(false);
    }
  };

  const onSignInWithFacebookBtnClick = async () => {
    setProcessStarted(true);

    const user = await signInWithFacebook(
      setSocialProcessStarted,
      setGmailExists,
      setGoogleMailAddress,
      setFacebookPendingCredentials
    );

    if (user) {
      setData(user);
    } else {
      setSocialProcessStarted([false, false, false]);
    }
  };

  const onSignInWithGoogleBtnClick = async () => {
    setProcessStarted(true);

    const user = await signInWithGoogle(
      facebookPendingCredentials,
      googleMailAddress
    );

    if (user) {
      setData(user);
    } else {
      setSocialProcessStarted([false, false, false]);
    }
  };

  const setData = async (user) => {
    let data = {};

    if (user?.email) {
      let [
        name,
        profile_url,
        role,
        email,
        is_instructor,
        sign_up_ts,
        phone_number,
        has_rated_app,
        app_rating,
        pro_expiration_date,
        tier,
        grade,
        phone_country_code,
      ] = await getUserInfoById(user?.uid);

      if (!email || !phone_number) {
        let time_now = await uploadUserInfo(
          user?.uid,
          user?.displayName,
          user?.email,
          user?.photoURL,
          false, // setting user as student
          phoneNumber?.slice(countryCode?.length + 1),
          countryCode
        );

        if (time_now) {
          data = {
            app_rating: null,
            app_rating_history: [],
            email: user?.email,
            grade: null,
            has_rated_app: false,
            is_instructor: false,
            name: user?.displayName,
            phone_country_code: countryCode,
            phone_number: phoneNumber.slice(countryCode.length + 1),
            pro_expiration_date: null,
            profile_url: user?.photoURL,
            role: "Student",
            sign_up_ts: time_now,
            tier: "free",
            uid: user?.uid,
          };

          setTempUserData({ ...data });
          setTempEmailUserData(user);
          setProcessStarted(false);

          setTimeout(() => setActiveTab(activeTab + 1), 250);

          setSocialProcessStarted([false, false, false]);
        }
      } else {
        data = {
          email: email,
          uid: user?.uid,
          name: name,
          grade: grade,
          is_instructor: is_instructor,
          phone_country_code: phone_country_code,
          phone_number: phone_number,
          profile_url: profile_url,
          role: role,
          sign_up_ts: sign_up_ts,
          has_rated_app: has_rated_app ? has_rated_app : false,
          app_rating: app_rating ? app_rating : 0,
          pro_expiration_date: pro_expiration_date,
          tier: tier,
        };

        const _existingPhone = "+" + phone_country_code + phone_number;
        setExistingPhone(phone_country_code + phone_number);

        if (phoneRouteRef.current && _existingPhone !== phoneNumber) {
          setPhoneExists(true);
          setOtpCode(Array(6).fill(""));
          await signInExistingPhoneFn(1, _existingPhone, null);
        } else {
          setPhoneExists(false);
          await signInExistingPhoneFn(2, _existingPhone, null);
        }
      }
    } else {
      setEmailError("The facebook account doesn't have an email");
      setTimeout(() => {
        setEmailError(null);
        submitGoogleEmail(
          user,
          setActiveTab,
          -1,
          setTempUserData,
          setPhoneNumberError,
          setSocialProcessStarted,
          setExistingAccountError,
          setProcessStarted
        );
      }, 2000);

      setPhoneRoute(false);

      setSocialProcessStarted([false, false, false]);

      setTempEmailUserData(user);
    }
  };

  const setUserGrade = async (value) => {
    let _user = {
      ...tempUserData,
      grade: value,
      phone_number: phoneNumber.replace("+", "").slice(countryCode?.length),
      phone_country_code: countryCode,
      source: "web " + version,
    };

    let updated = await uploadFinalUserInfo(_user?.uid, _user);

    if (updated) {
      try {
        if (referrerId) {
          const handleAppReferrals =
            functions.httpsCallable("handleAppReferrals");

          await handleAppReferrals({
            referrer_id: referrerId,
            referred_id: _user?.uid,
          });

          setTrialType("referrred");
          setIsUserProTier(true);
        } else {
          const hasBeenRewarded = await rewardProMembership(_user?.uid, 7);
          if (hasBeenRewarded) {
            setTrialType("not-referred");
            setIsUserProTier(true);
          }
        }
      } catch (err) {
        console.log(err);
        setTrialType(null);
        setIsUserProTier(false);
      }

      handleSliderClose();
      setTimeout(() => loadingWrapper(), 1000);

      setTimeout(() => {
        setUser(_user);

        setIsInstructor(false);
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: _user?.uid,
            grade: _user?.grade,
            name: _user?.name,
            profile_url: _user?.profile_url,
          })
        );
        localStorage.setItem("isInstructor", JSON.stringify(false));
        localStorage.setItem("isUserPro", JSON.stringify(false));
      }, 2000);

      setTimeout(() => setOpenFreeTrial(true), 6000);
    } else {
      showSnackbar("Some error occured, please try again", "error");
    }
  };

  const signInExistingPhoneFn = async (
    nextTab,
    phone_number,
    phone_country_code
  ) => {
    if (phone_number.length > 5) {
      await signInWithPhone(
        phone_number,
        phone_country_code,
        setActiveTab,
        nextTab,
        setSendingOtp,
        setPhoneNumberError,
        tempEmailUserData,
        setTempEmailUserData,
        setPhoneRoute,
        setPhoneExists
      );
      setExistingPhone(phone_number);
      setTimeout(() => setSocialProcessStarted([false, false, false]), 3000);
    } else {
      setPhoneNumberError("Invalid phone number");
      setSocialProcessStarted([false, false, false]);

      setTimeout(() => setPhoneNumberError(""), 6000);
    }
  };

  const signInPhoneFn = async (nextTab) => {
    if (phoneNumber.length > 6) {
      setSendingOtp(true);
      setExistingPhone(phoneNumber);
      await signInWithPhone(
        phoneNumber,
        countryCode,
        setActiveTab,
        nextTab,
        setSendingOtp,
        setPhoneNumberError,
        tempEmailUserData,
        setTempEmailUserData,
        setPhoneRoute,
        setPhoneExists
      );
    } else {
      setPhoneNumberError("Invalid phone number");
      setSocialProcessStarted([false, false, false]);

      setTimeout(() => setPhoneNumberError(""), 6000);
    }
  };

  useEffect(() => {
    if (processStarted) {
      navigator.vibrate(10);
    }
  }, [activeTab]);

  useEffect(() => {
    if (existingAccountError) {
      setOtpCode(Array(6).fill(""));
      setOtpError(false);
      setOtpErrorMsg("");

      onSignInWithGoogleBtnClick();
    }
  }, [existingAccountError]);

  useEffect(() => {
    if (gmailExists && googleMailAddress && facebookPendingCredentials) {
      setEmailError(
        "The credentials are already linked with your other account"
      );
      setTimeout(() => {
        setEmailError("");
        setPhoneNumberError("");
        facebookPendingCredentials === "no-credentials"
          ? onSignInWithFacebookBtnClick()
          : onSignInWithGoogleBtnClick();
      }, 4000);
    }
  }, [gmailExists, googleMailAddress, facebookPendingCredentials]);

  // When user has taken phone route, and links facebook with the phone number, the fb account doesn't has an email associated with it, then trigger this function

  const submitGoogleEmailFn = () => {
    submitGoogleEmail(
      tempPhoneUserData,
      setActiveTab,
      activeTab,
      setTempUserData,
      setPhoneNumberError,
      setSocialProcessStarted,
      setExistingAccountError,
      setProcessStarted
    );
  };

  return (
    <SwipeableViews
      axis={"x"}
      index={activeTab}
      onChangeIndex={(e) => setActiveTab(e)}
      scrolling={"false"}
      className="swipeable__onboarding"
      containerStyle={{ background: "#161616", width: "700px" }}
      style={{ background: "#161616" }}
      slideStyle={{ background: "#161616" }}
      disabled={true}
      ignoreNativeScroll={true}
    >
      {/* page 0*/}

      <div className="slide__page">
        <div className="first__page__inner">
          <div className="top__area" />
          <div className="plan__success">
            <img src={logoDark} alt="logo" />
            <h6>
              Learning made simple. <span>Aasaan hai!</span>
            </h6>
          </div>
          <video
            src="https://d1kjns6e6wnqfd.cloudfront.net/snippet2.mp4"
            autoPlay={activeTab === 0}
            loop={activeTab === 0}
            playsInline
            muted
            className="snippet__video"
          />
          <div className="registration__page">
            <div className="phone__number">
              <div ref={(ref) => (recaptchaRef = ref)}>
                <div id="recaptcha-container" className="recaptcha" />
              </div>

              <div
                onMouseLeave={() => {
                  !localStorage.getItem("closeInstallApp") &&
                    setCloseInstallApp(false);
                  setPushDown(false);
                }}
              >
                <PhoneInput
                  country="in"
                  value={phoneNumber}
                  isValid={(_, country) => {
                    setCountryCode(country.dialCode);
                    return true;
                  }}
                  onChange={(phone) => {
                    setPhoneNumber("+" + phone);
                    setPhoneNumberError("");
                  }}
                  placeholder="+91 XXXXX-XXXXX"
                  preferredCountries={["us", "ae", "sg", "my", "in"]}
                  inputProps={{ autoFocus: true }}
                  onClick={() => {
                    setCloseInstallApp(true);
                    setPushDown(true);
                  }}
                  onEnterKeyPress={() => {
                    if (!sendingOtp) {
                      setPhoneRoute(true);
                      signInPhoneFn(1);
                    }
                  }}
                />

                {phoneNumberError && (
                  <div className="phone__error__message">
                    <ErrorOutlineIcon />
                    {phoneNumberError}
                  </div>
                )}
              </div>
              <button
                id="sign-in-with-phone"
                onClick={() => {
                  if (!sendingOtp) {
                    setPhoneRoute(true);
                    signInPhoneFn(1);
                  }
                }}
              >
                {sendingOtp ? (
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
            <div className="or__line" style={{ display: pushDown && "none" }}>
              <h6></h6>
              <h5>OR</h5>
              <h6></h6>
            </div>
            <div
              className="social__buttons"
              style={{ display: pushDown && "none" }}
            >
              <button
                className="facebook"
                onClick={() => {
                  if (socialProcessStarted.every((item) => !item)) {
                    setPhoneRoute(false);
                    phoneRouteRef.current = false;
                    setSocialProcessStarted([true, false, false]);
                    onSignInWithFacebookBtnClick();
                  } else {
                    setEmailError("One Process has already started");
                    setTimeout(() => setEmailError(""), 4000);
                  }
                }}
              >
                <img src={Facebook2} draggable={false} alt="facebook icon" />
                {socialProcessStarted[0] ? (
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                ) : (
                  <h6>Facebook</h6>
                )}
              </button>
              <button
                className="google"
                onClick={() => {
                  if (socialProcessStarted.every((item) => !item)) {
                    setPhoneRoute(false);
                    phoneRouteRef.current = false;
                    setSocialProcessStarted([false, true, false]);
                    onSignInWithGoogleBtnClick();
                  } else {
                    setEmailError("One Process has already started");
                    setTimeout(() => setEmailError(""), 4000);
                  }
                }}
              >
                <img src={Google} draggable={false} alt="google icon" />
                {socialProcessStarted[1] ? (
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                ) : (
                  <h6>Google</h6>
                )}
              </button>
            </div>
            {/* <div className="signin__apple">
                <button
                  onClick={() => {
                    if (socialProcessStarted.every((item) => !item)) {
                      setPhoneRoute(false);
                      setSocialProcessStarted([false, false, true]);
                      signInWithApple();
                    } else {
                      setEmailError("One Process has already started");
                      setTimeout(() => setEmailError(""), 4000);
                    }
                  }}
                >
                  <img src={Apple} draggable={false} alt="apple icon" />
                  <h6>Continue with Apple</h6>
                </button>
              </div> */}
            <div className="agreements" style={{ display: pushDown && "none" }}>
              <h6>Having trouble?</h6>
              <div>
                <h5>
                  Reach us at{" "}
                  <a
                    href="mailto:help@pustack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    help@pustack.com
                  </a>
                </h5>
              </div>
            </div>
          </div>

          {emailError && (
            <div className="error__message fadeIn">{emailError}</div>
          )}

          <Dialog
            open={showPDF}
            onClose={() => {
              setShowPDF(false);
            }}
          >
            {showPDF && (
              <PdfPreview
                pdf={documentToShow}
                onClose={() => {
                  setShowPDF(false);
                }}
              />
            )}
          </Dialog>
        </div>
      </div>

      {/* page 1*/}
      {phoneRoute ? (
        <div className="slide__page">
          <div className="second__page__inner">
            <div className="top__area">
              <div>
                <button
                  onClick={() => {
                    setTimeout(() => setActiveTab(0), 250);
                    setOtpCode(Array(6).fill(""));
                    setOtpError(false);
                    setOtpErrorMsg("");
                    setSocialProcessStarted([false, false, false]);
                    setPhoneNumber("+91");
                    setExistingPhone("");
                    setPhoneExists(false);
                  }}
                >
                  <ArrowBackIosIcon />
                </button>
                <h6>My OTP is</h6>
              </div>
              {launchRocket && (
                <div className="launch__lottie">
                  <Lottie options={{ loop: true, animationData: launch }} />
                </div>
              )}
              <button className="checking__otp">
                {!launchRocket && checkingOtp && (
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                )}
              </button>
              {allowNext && (
                <button onClick={() => setTimeout(() => setActiveTab(2), 250)}>
                  <ArrowForwardIcon />
                </button>
              )}
            </div>

            <div className={otpError ? "otp__input otp__error" : "otp__input"}>
              {phoneExists && (
                <h5 className="already__exists">Account already exists.</h5>
              )}
              {existingPhone.length > 6 && (
                <h5 className="sent__to">
                  Verification code sent to{" "}
                  {"X".repeat(existingPhone.length - 5) +
                    existingPhone.slice(
                      existingPhone.length - 4,
                      existingPhone.length
                    )}
                </h5>
              )}
              <div>
                <div>
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <input
                          name={`input${i}`}
                          type="tel"
                          value={otpCode[i]}
                          maxLength={1}
                          autoFocus={i === 0 && activeTab === 1}
                          autoComplete="off"
                          onChange={(e) => handleOTPChange(e, i)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                        />
                      </div>
                    ))}
                </div>
              </div>
              <h6>
                <WarningRoundedIcon /> {otpErrorMsg}
              </h6>
            </div>
            <div className="planets__wrapper">
              {planetsArray.map((planet, i) => (
                <img
                  key={i}
                  alt={`planet${i + 1}`}
                  className={`planet${i + 1}${
                    otpCode[i]?.length > 0 ? handMovementClasses[i + 1] : ""
                  }`}
                  src={planet}
                  draggable={false}
                />
              ))}
            </div>
            <div className="enter__code">
              <img
                alt="code-vault"
                className="code"
                src={phoneVerification}
                draggable={false}
              />
              <h6 className={`tapBg ${handMovementClasses[lastInput]}`}></h6>
              <img
                alt="phoneVerificationHand"
                className={`hand ${handMovementClasses[lastInput]}`}
                src={phoneVerificationHand}
                draggable={false}
              />

              <img
                src={planetEarth}
                className="earth"
                alt="planetEarth"
                draggable={false}
              />

              <div
                className={resendCode ? "resend__code grey" : "resend__code"}
              >
                {activeTab === 1 && (
                  <Timer
                    initialTime={30100}
                    direction="backward"
                    checkpoints={[
                      { time: 1500, callback: () => setPlural(false) },
                      { time: 1100, callback: () => setResendCode(false) },
                    ]}
                  >
                    {({ start, reset }) => (
                      <>
                        <h4
                          onClick={() => {
                            if (!resendCode) {
                              setPlural(true);
                              reset();
                              start();
                              setResendCode(true);
                              signInPhoneFn(1);
                            }
                          }}
                        >
                          Resend Code{resendCode ? "?" : ""}
                        </h4>

                        {resendCode ? (
                          <h6>
                            Tap resend in <Timer.Seconds />{" "}
                            {plural ? "seconds" : "second"}
                          </h6>
                        ) : (
                          <h6
                            onClick={() => {
                              if (!resendCode) {
                                setPlural(true);
                                reset();
                                start();
                                setResendCode(true);
                                signInPhoneFn(1);
                              }
                            }}
                          >
                            Tap here
                          </h6>
                        )}
                      </>
                    )}
                  </Timer>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        !processStarted && (
          <div className="slide__page">
            <div className="third__page__inner">
              <div className="stars__background">
                <div className="stars" />
                <div className="twinkling" />
              </div>
              <div className="top__area">
                <div>
                  <button
                    onClick={() => {
                      setActiveTab(0);
                      setOtpCode(Array(6).fill(""));
                      setOtpError(false);
                      setOtpErrorMsg("");
                      setSocialProcessStarted([false, false, false]);
                      setPhoneNumber("+91");
                      setExistingPhone("");
                      setPhoneExists(false);

                      if (tempEmailUserData) {
                        tempEmailUserData.delete();
                        deleteUserFromDatabase(tempEmailUserData?.uid);
                      }
                      setTempEmailUserData(null);
                    }}
                  >
                    <ArrowBackIosIcon />
                  </button>
                  <h6>My phone number is</h6>
                </div>

                {sendingOtp ? (
                  <button className="sending__otp">
                    <Lottie
                      options={{
                        animationData: circularProgress,
                        loop: true,
                      }}
                    />
                  </button>
                ) : (
                  <button onClick={() => !sendingOtp && signInPhoneFn(2)}>
                    <ArrowForwardIcon />
                  </button>
                )}
              </div>
              <div className="phone__input">
                <div ref={(ref) => (recaptchaRef = ref)}>
                  <div id="recaptcha-container" className="recaptcha" />
                </div>

                <div>
                  <PhoneInput
                    country="in"
                    value={phoneNumber}
                    isValid={(_, country) => {
                      setCountryCode(country.dialCode);
                      return true;
                    }}
                    onChange={(phone) => {
                      setPhoneNumber("+" + phone);
                      setPhoneNumberError("");
                    }}
                    placeholder="Enter your phone number here"
                    preferredCountries={["us", "ae", "sg", "my", "in"]}
                    inputProps={{ autoFocus: true }}
                  />
                  <h6>We will send a text with verification code.</h6>
                  <h6>Message or data rates may apply.</h6>
                </div>
              </div>
              <div className="astronaut__lottie">
                <Lottie options={{ loop: true, animationData: astronaut }} />
              </div>
              <img src={phone} alt="phone" className="phone__social" />

              {phoneNumberError && (
                <div className="error__message fadeIn">{phoneNumberError}</div>
              )}

              <div className="agreements">
                <h6>By continuing, you agree to our</h6>
                <div>
                  <h5
                    onClick={() => {
                      setDocumentToShow(termsOfService);
                      setShowPDF(true);
                    }}
                  >
                    Terms of Service
                  </h5>{" "}
                  <h5
                    onClick={() => {
                      setDocumentToShow(privacyPolicy);
                      setShowPDF(true);
                    }}
                  >
                    Privacy Policy
                  </h5>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* page 2*/}
      {phoneRoute ? (
        <div className="slide__page">
          <div className="third__page__inner">
            <div className="stars__background">
              <div className="stars" />
              <div className="twinkling" />
            </div>
            <div className="top__area third__page">
              <button
                onClick={() =>
                  setTimeout(() => {
                    setActiveTab(0);
                    setOtpCode(Array(6).fill(""));
                    setOtpError(false);
                    setOtpErrorMsg("");
                    setSocialProcessStarted([false, false, false]);
                    tempPhoneUserData && tempPhoneUserData.delete();
                    setTempPhoneUserData(null);
                  })
                }
              >
                <ArrowBackIosIcon />
              </button>
              <h6>I want to connect my</h6>
            </div>
            <div className="social__accounts">
              <button
                className="google"
                onClick={() => {
                  if (socialProcessStarted.every((k) => k === false)) {
                    setSocialProcessStarted([false, true, false]);
                    submitGoogleEmail(
                      tempPhoneUserData,
                      setActiveTab,
                      activeTab,
                      setTempUserData,
                      setPhoneNumberError,
                      setSocialProcessStarted,
                      setExistingAccountError,
                      setProcessStarted
                    );
                  } else {
                    setEmailError("One Process has already started");
                    setTimeout(() => setEmailError(""), 4000);
                  }
                }}
              >
                <img src={Google} draggable={false} alt="g" />
                <h6>
                  CONTINUE WITH GOOGLE{" "}
                  {socialProcessStarted[1] && (
                    <Lottie
                      options={{
                        animationData: circularProgress,
                        loop: true,
                      }}
                    />
                  )}
                </h6>
              </button>
              <button
                className="facebook"
                onClick={() => {
                  if (socialProcessStarted.every((item) => item === false)) {
                    setSocialProcessStarted([true, false, false]);
                    submitFacebook(
                      tempPhoneUserData,
                      setActiveTab,
                      activeTab,
                      setTempUserData,
                      setPhoneNumberError,
                      setSocialProcessStarted,
                      setGmailExists,
                      setGoogleMailAddress,
                      setFacebookPendingCredentials,
                      submitGoogleEmailFn
                    );
                  } else {
                    setEmailError("One Process has already started");
                    setTimeout(() => setEmailError(""), 4000);
                  }
                }}
              >
                <img src={Facebook} draggable={false} alt="fb" />
                <h6>
                  CONTINUE WITH FACEBOOK
                  {socialProcessStarted[0] && (
                    <Lottie
                      options={{
                        animationData: circularProgress,
                        loop: true,
                      }}
                    />
                  )}
                </h6>
              </button>
            </div>
            <div className="astronaut__lottie">
              <Lottie options={{ loop: true, animationData: astronaut }} />
            </div>
            <img
              src={phoneSocial}
              alt="phoneSocial"
              className="phone__social"
            />
            {phoneNumberError && (
              <div className="error__message fadeIn">{phoneNumberError}</div>
            )}

            <div className="agreements">
              <h6>By continuing, you agree to our</h6>
              <div>
                <h5
                  onClick={() => {
                    setDocumentToShow(termsOfService);
                    setShowPDF(true);
                  }}
                >
                  Terms of Service
                </h5>{" "}
                <h5
                  onClick={() => {
                    setDocumentToShow(privacyPolicy);
                    setShowPDF(true);
                  }}
                >
                  Privacy Policy
                </h5>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="slide__page">
          <div
            className={`second__page__inner ${!phoneRoute && "slideInLeft"}`}
          >
            <div className="top__area">
              <div>
                <button
                  onClick={() => {
                    setActiveTab(0);
                    setOtpCode(Array(6).fill(""));
                    setOtpError(false);
                    setOtpErrorMsg("");
                    setSocialProcessStarted([false, false, false]);
                    setPhoneNumber("+91");
                    setExistingPhone("");
                    setPhoneExists(false);
                  }}
                >
                  <ArrowBackIosIcon />
                </button>
                <h6>My OTP is</h6>
              </div>

              <button className="checking__otp">
                {checkingOtp && (
                  <Lottie
                    options={{ animationData: circularProgress, loop: true }}
                  />
                )}
              </button>
            </div>

            <div className={otpError ? "otp__input otp__error" : "otp__input"}>
              {phoneExists && (
                <h5 className="already__exists">Account already exists.</h5>
              )}
              {existingPhone.length > 5 && (
                <h5 className="sent__to">
                  Verification code sent to{" "}
                  {"X".repeat(existingPhone.length - 4) +
                    existingPhone.slice(
                      existingPhone.length - 4,
                      existingPhone.length
                    )}
                </h5>
              )}

              <div>
                <div>
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <input
                          name={`input${i}`}
                          type="tel"
                          value={otpCode[i]}
                          maxLength={1}
                          autoFocus={i === 0 && activeTab === 1}
                          autoComplete="off"
                          onChange={(e) => handleOTPChange(e, i)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                        />
                      </div>
                    ))}
                </div>
              </div>
              <h6>
                <WarningRoundedIcon /> {otpErrorMsg}
              </h6>
            </div>
            <div className="planets__wrapper">
              {planetsArray.map((planet, i) => (
                <img
                  key={i}
                  alt={`planet${i + 1}`}
                  className={`planet${i + 1}${
                    otpCode[i]?.length > 0 ? handMovementClasses[i + 1] : ""
                  }`}
                  src={planet}
                  draggable={false}
                />
              ))}
            </div>
            <div className="enter__code">
              <img
                alt="code-vault"
                className="code"
                src={phoneVerification}
                draggable={false}
              />
              <h6 className={`tapBg ${handMovementClasses[lastInput]}`}></h6>
              <img
                alt="phoneVerificationHand"
                className={`hand ${handMovementClasses[lastInput]}`}
                src={phoneVerificationHand}
                draggable={false}
              />

              <img
                src={planetEarth}
                className="earth"
                alt="planetEarth"
                draggable={false}
              />

              <div
                className={resendCode ? "resend__code grey" : "resend__code"}
              >
                {activeTab === 2 && (
                  <Timer
                    initialTime={30100}
                    direction="backward"
                    checkpoints={[
                      { time: 1500, callback: () => setPlural(false) },
                      { time: 1100, callback: () => setResendCode(false) },
                    ]}
                  >
                    {({ start, reset }) => (
                      <>
                        <h4
                          onClick={() => {
                            if (!resendCode) {
                              setPlural(true);
                              reset();
                              start();
                              setResendCode(true);
                              signInPhoneFn(2);
                            }
                          }}
                        >
                          Resend Code{resendCode ? "?" : ""}
                        </h4>

                        {resendCode ? (
                          <h6>
                            Tap resend in <Timer.Seconds />{" "}
                            {plural ? "seconds" : "second"}
                          </h6>
                        ) : (
                          <h6
                            onClick={() => {
                              if (!resendCode) {
                                setPlural(true);
                                reset();
                                start();
                                setResendCode(true);
                                signInPhoneFn(2);
                              }
                            }}
                          >
                            Tap here
                          </h6>
                        )}
                      </>
                    )}
                  </Timer>
                )}
              </div>
            </div>
            {phoneNumberError && (
              <div className="error__message fadeIn">{phoneNumberError}</div>
            )}
          </div>
        </div>
      )}
      {/* page 3*/}
      <div className="slide__page">
        <div className="fourth__page__inner">
          <div className="stars__background">
            <div className="stars"></div>
            <div className="twinkling"></div>
          </div>

          <div className="top__area">
            <h6>I Study in</h6>
          </div>
          <div className="select__classes">
            {getAvailableGrades(null, true).map(({ planet, grade, value }) => (
              <div className="class__item" key={value}>
                <img src={planet} alt="planet2" draggable={false} />
                <h6 onClick={() => setUserGrade(value)}>{grade}</h6>
              </div>
            ))}
            {/*[*/}
            {/*// { planet: planet1, grade: "Class 2", value: "class_2" },*/}
            {/*{ planet: planet4, grade: "Class 9", value: "class_9" },*/}
            {/*{ planet: planet6, grade: "Class 10", value: "class_10" },*/}
            {/*]*/}
          </div>

          <img src={comet} alt="comet" className="comet" />
          <img src={comet} alt="comet2" className="comet2" />

          <img src={gulu} alt="gulu" className="gulu" draggable={false} />
          <img src={mars} alt="mars" className="mars" draggable={false} />
          <img
            src={controlRoom}
            alt="control"
            className="control"
            draggable={false}
          />
        </div>
      </div>
    </SwipeableViews>
  );
};

export default OnBoardingMobile;
