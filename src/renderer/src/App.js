import React, { useContext, useEffect, useState } from "react";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
} from "react-router-dom";
import { Snackbar } from "./components";
import { version } from "./../../../package.json";
import { useMediaQuery } from "react-responsive";
import { LastLocationProvider } from "react-router-last-location";
import {
  PustackProSlider,
  BlazeCallNotification,
  FloatingPlayerContainer,
} from "./containers";
import {
  Home,
  About,
  Blaze,
  Sitemap,
  DoubtHome,
  DoubtPage,
  TipsScreen,
  LiveSession,
  NewsFeedHome,
  PustackLanding,
  PracticeScreen,
  ClassroomScreen,
  NewsFeedPostView,
} from "./pages";
import {
  getCareMessageCount,
  userImportantData,
  getCurrentVersion,
  setDeviceToken,
} from "./database";
import {
  UserContext,
  ThemeContext,
  PustackProContext,
  PageContextProvider,
  TipsContextProvider,
  IntroContextProvider,
  SidebarContextProvider,
  PracticeContextProvider,
  ClassroomContextProvider,
  LiveSessionContextProvider,
  SubjectModalContextProvider, BlazeSessionContextProvider,
} from "./context";

import {appGooglePlayLink, privacyPolicy, termsOfService, VAPIDKEY, refundAndCancellationPolicy} from "./helpers";
import {defaultPic, newMsgAudio} from "./assets";
import { messaging, isMessagingSupported } from "./firebase_config";
import "./styles/App.scss";
import ModalContextProvider from "./context/global/ModalContext";
import AppModal from "./components/global/modal";
import ContactUsPage from "./pages/contact_us";
import PdfPage from "./components/pdf_page";
import GetProWarning from "./components/global/get-pro-warning";
import CMSPage from "./pages/cms";
import {CmsContextProvider} from "./context/cms/CmsContext";

export default function App() {
  const [checkedLoggedInStatus, setCheckedLoggedInStatus] = useState(false);

  const [user, setUser] = useContext(UserContext).user;
  const [, setPushyData] = useContext(UserContext).pushyData;
  const [, setIsUserProTier] = useContext(UserContext).tier;
  const [isInstructor, setIsInstructor] = useContext(UserContext).isInstructor;
  const [isDarkMode, setIsDarkMode] = useContext(ThemeContext).theme;
  const [, setBlazeCallAlert] = useContext(UserContext).blazeCallAlert;
  const [, setIsExternal] = useContext(UserContext).isExternal;
  const [isSliderOpen, setIsSliderOpen] = useContext(PustackProContext).value;
  const [, setUnreadCareMsgCount] = useContext(UserContext).unreadCareMsgCount;
  const [closeInstallApp, setCloseInstallApp] =
    useContext(UserContext).closeInstallApp;
  const [openPustackCare, setOpenPustackCare] =
    useContext(UserContext).openPustackCare;

  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  useEffect(() => {
    isSmallScreen &&
      window.addEventListener("beforeinstallprompt", (e) => e.preventDefault());
  }, [isSmallScreen]);

  useEffect(() => {
    try {
      if (user?.uid && isMessagingSupported) {
        messaging
          .getToken({ vapidKey: VAPIDKEY })
          .then((token) => {
            if (token) {
              const localToken = localStorage.getItem("fcmToken");

              if (localToken && localToken === token) {
                // console.log(localToken);
              } else {
                setDeviceTokenFn(token);
                localStorage.setItem("fcmToken", token);
              }
            } else console.log("No registration token available");
          })
          .catch((err) => console.log(err));

        messaging.onMessage((payload) => {
          let data = payload.data;
          console.log({ payload: payload.data });

          if (data?.notification_type === "session_ping") {
            setPushyData(data);
            setBlazeCallAlert(true);
          } else {
            setBlazeCallAlert(false);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [user?.uid]);

  useEffect(() => {
    getRelatedAppsFn();
  }, [user]);

  const getRelatedAppsFn = async () => {
    try {
      const relatedApps = await navigator.getInstalledRelatedApps();
      relatedApps.forEach(() => {
        // user.uid === "ZVKaCvui8gauClweVWPUAqaq3Ht2" && alert(app.platform);
        // console.log(app.id, app.platform, app.url);
      });
    } catch (er) {
      console.log(er);
    }
  };

  useEffect(() => {
    let path = window.location.pathname;

    if (path === "/app") {
      return (window.location.href = appGooglePlayLink);
    }

    if (localStorage.getItem("user")) {
      const _user = JSON.parse(localStorage.getItem("user"));
      setUser(_user);

      if (_user) {
        try {
          setUserImportantDataFn(_user.uid);
          setUnreadMsgCountFn(_user);
        } catch (error) {
          setUser(null);
        }
      }

      if (localStorage.getItem("pustack-dark-theme") === "true") {
        try {
          setIsDarkMode(true);
        } catch (error) {
          setIsDarkMode(false);
        }
      }

      if (localStorage.getItem("closeInstallApp")) {
        setCloseInstallApp(true);
      }

      if (localStorage.getItem("isUserPro")) {
        setIsUserProTier(localStorage.getItem("isUserPro") === "true");
      }

      if (localStorage.getItem("isInstructor")) {
        setIsInstructor(localStorage.getItem("isInstructor") === "true");
      }

      if (localStorage.getItem("isExternalInstructor")) {
        setIsExternal(localStorage.getItem("isExternalInstructor") === "true");
      }
    }

    setCheckedLoggedInStatus(true);
  }, []);

  const setUserImportantDataFn = (uid) => {
    const res = userImportantData(uid);

    res.onSnapshot((snapshot) => {
      // console.log('user - ', user);
      // console.log('user?.has_rated_app, snapshot.data()?.has_rated_app - ', user?.has_rated_app, snapshot.data()?.has_rated_app)
      // if(user?.has_rated_app !== undefined && snapshot.data()?.has_rated_app !== user?.has_rated_app) return;
      if (snapshot.data() || "") {
        setIsUserProTier(snapshot.data()?.tier === "pro");
        setIsInstructor(snapshot.data()?.is_instructor);
        setIsExternal(snapshot.data()?.is_external_instructor || false);

        let _user = JSON.parse(localStorage.getItem("user"));

        _user = { ..._user, ...snapshot.data() };

        if(!_user.profile_url) _user.profile_url = defaultPic;
        setUser(_user);

        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: _user?.uid,
            grade: _user?.grade,
            name: _user?.name,
            profile_url: _user?.profile_url,
          })
        );

        localStorage.setItem(
          "isUserPro",
          JSON.stringify(snapshot.data()?.tier === "pro")
        );
        localStorage.setItem(
          "isInstructor",
          JSON.stringify(snapshot.data()?.is_instructor)
        );
        localStorage.setItem(
          "isExternalInstructor",
          JSON.stringify(snapshot.data()?.is_external_instructor || false)
        );
      } else {
        if (navigator.onLine) {
          setUser(null);
          setIsUserProTier(false);
          setIsInstructor(false);
          localStorage.clear();
          localStorage.setItem("hideCookie", true);
          window.location = "/";
        }
      }
    });
  };

  const setUnreadMsgCountFn = (_user) => {
    getCareMessageCount({ userId: _user?.uid, grade: _user?.grade }).onSnapshot(
      (snapshot) => {
        const count = snapshot.data()?.unread_care_message_count;

        setUnreadCareMsgCount(count);

        if (count > 0) {
          !isSmallScreen && setOpenPustackCare(true);
          if (!openPustackCare) {
            let audio = new Audio(newMsgAudio);
            audio.play();
          }
        }
      },
      (error) => console.log(error)
    );
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "production") getCurrentVersionFn();
  }, []);

  const getCurrentVersionFn = async () => {
    const currentVersion = await getCurrentVersion();
    if (version !== currentVersion.version) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
      window.location.reload();
      console.log("not latest version");
    } else {
      console.log("latest version deployed");
    }
  };

  const setDeviceTokenFn = (token) => {
    if (user?.uid) setDeviceToken(token, user?.uid);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.style.background = "rgb(16, 16, 16)";
    } else document.body.style.background = "#fff";

    if (!user) {
      if (window.location.pathname === "/") {
        document.body.style.background = "rgb(16, 16, 16)";
      } else {
        document.body.style.background = "#fff";
      }

      document.body.classList.add("landing__scrollbar");
    } else {
      document.body.classList.remove("landing__scrollbar");
    }
  }, [isDarkMode, checkedLoggedInStatus]);

  return (
    <Router>
      <LastLocationProvider>
        <div
          className={
            isDarkMode
              ? `app dark${
                  isSmallScreen && !closeInstallApp ? " closePopup" : ""
                }`
              : `app${isSmallScreen && !closeInstallApp ? " closePopup" : ""}`
          }
        >
          <Snackbar />
          <GetProWarning />
          <BlazeCallNotification />
          <ModalContextProvider>
            <IntroContextProvider>
              <ClassroomContextProvider>
                {!user && checkedLoggedInStatus && (
                  <Switch>
                    <Route path={"/sitemap"}>
                      <Sitemap />
                    </Route>
                    <Route path={"/about"}>
                      <About loggedIn={false} />
                    </Route>
                    <Route exact path="/contact">
                      <ContactUsPage />
                    </Route>
                    <Route exact path="/privacy_policy">
                      <PdfPage pdfLink={privacyPolicy} />
                    </Route>
                    <Route exact path="/terms_of_service">
                      <PdfPage pdfLink={termsOfService} />
                    </Route>
                    <Route exact path="/cancellation_policy">
                      <PdfPage pdfLink={refundAndCancellationPolicy} />
                    </Route>
                    <Route exact path="/classroom">
                      <ClassroomScreen />
                    </Route>
                    <Route path={["/", "/referrals/?q=:id"]}>
                      <PustackLanding
                        checkedLoggedInStatus={checkedLoggedInStatus}
                      />
                    </Route>
                  </Switch>
                )}

                {user && checkedLoggedInStatus && (
                  <SidebarContextProvider>
                    <TipsContextProvider>
                      <CmsContextProvider>
                        <PracticeContextProvider>
                          <PageContextProvider>
                            <LiveSessionContextProvider>
                              <SubjectModalContextProvider>
                                <BlazeSessionContextProvider>
                                  <Switch>
                                    <Route
                                      exact
                                      path={["/", "/successfull-referral"]}
                                    >
                                      <Home />
                                    </Route>
                                    <Route path={"/sitemap"}>
                                      <Sitemap />
                                    </Route>
                                    <Route path={"/about"}>
                                      <About loggedIn={true} />
                                    </Route>
                                    {isInstructor && <Route path={"/cms"}>
                                      <CMSPage loggedIn={true}/>
                                    </Route>}
                                    <Route exact path="/tips">
                                      <TipsScreen />
                                    </Route>
                                    <Route exact path="/classroom">
                                      <ClassroomScreen />
                                    </Route>
                                    <Route exact path="/practice">
                                      <PracticeScreen />
                                    </Route>
                                    {/*<Route exact path="/doubts">*/}
                                    {/*  <DoubtHome />*/}
                                    {/*</Route>*/}
                                    {/*<Route path="/doubts/:id">*/}
                                    {/*  <DoubtPage />*/}
                                    {/*</Route>*/}
                                    <Route exact path={["/classes", "/classes/:id"]}>
                                      <LiveSession />
                                    </Route>
                                    {/*<Route exact path="/newsfeed">*/}
                                    {/*  <NewsFeedHome />*/}
                                    {/*</Route>*/}
                                    {/*<Route path="/newsfeed/:id">*/}
                                    {/*  <NewsFeedPostView />*/}
                                    {/*</Route>*/}
                                    <Route exact path={["/blaze", "/blaze/chat/:id"]}>
                                      <Blaze />
                                    </Route>
                                    <Redirect to="/" />
                                  </Switch>
                                  <AppModal />
                                  <FloatingPlayerContainer />
                                </BlazeSessionContextProvider>
                              </SubjectModalContextProvider>
                            </LiveSessionContextProvider>
                          </PageContextProvider>
                        </PracticeContextProvider>
                      </CmsContextProvider>
                    </TipsContextProvider>
                  </SidebarContextProvider>
                )}
                <PustackProSlider
                  isOpen={isSliderOpen}
                  handleClose={() => setIsSliderOpen(!isSliderOpen)}
                />
              </ClassroomContextProvider>
            </IntroContextProvider>
          </ModalContextProvider>
        </div>
      </LastLocationProvider>
    </Router>
  );
}
