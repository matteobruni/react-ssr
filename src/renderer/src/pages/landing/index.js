import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from "react";
import { UserContext } from "../../context";
import { useMediaQuery } from "react-responsive";
import { privacyPolicy, termsOfService } from "../../helpers";
import { DesktopLanding, MobileLanding } from "../../containers";
import "./style.scss";
import initialize from "../../animations";
import {Helmet} from "react-helmet";

export default function PustackLanding({ checkedLoggedInStatus }) {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const isTabletScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isiPadProScreen = useMediaQuery({ query: "(max-width: 1024px)" });
  const isDesktopScreen = useMediaQuery({ query: "(max-width: 1440px)" });
  const [hideCookieBanner, setHideCookieBanner] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [resetHeight, setResetHeight] = useState(false);
  const [user] = useContext(UserContext).user;
  const [referrerId, setReferrerId] = useContext(UserContext).referrerId;

  const [oldWidth, setOldWidth] = useState(window.innerWidth);

  const hasOpened = useRef();

  useEffect(() => {
    if (localStorage.getItem("hideCookie")) {
      setHideCookieBanner(true);
    }
  }, []);

  useEffect(() => {
    console.log('initialize - ');
    initialize();
  }, []);

  // useLayoutEffect(() => {
  //   if(!reloaded) {
  //     window.location.reload();
  //   }
  //   reloaded = false;
  // }, [])

  // useEffect(() => {
  //   const newWidth = window.innerWidth;
  //
  //   if (oldWidth !== newWidth) {
  //     setOldWidth(newWidth);
  //     if (!isSmallScreen) {
  //       window.location.reload();
  //     }
  //   }
  // }, [isSmallScreen, isTabletScreen, isiPadProScreen, isDesktopScreen]);

  useEffect(() => {
    if (!user && checkedLoggedInStatus) {
      let path = window.location.pathname;


      if (path === "/classroom" || path === "/tips" || path === "/practice") {
        return setTimeout(() => setIsSliderOpen(true), 1000)
      }

      if (
        path !== "/" &&
        !path.includes("/referrals/") &&
        path !== "/sitemap"
      ) {
        window.location = "/";
      } else if (path.includes("/referrals/")) {
        const url = new URL(window.location);
        setReferrerId(url.searchParams.get("q"));

        hasOpened.current = false;
      }
    }
  }, [user, checkedLoggedInStatus]);

  const hideCookieFn = () => {
    setResetHeight(true);
    setTimeout(() => {
      setHideCookieBanner(true);
      localStorage.setItem("hideCookie", true);
    }, 500);
  };


  useEffect(() => {
    let observer = new MutationObserver((mutations) =>
      mutations.forEach((mutation) => {
        if (
          mutation.target.style.display === "none" &&
          referrerId &&
          !hasOpened.current
        ) {
          setTimeout(() => {
            hasOpened.current = true;
            setIsSliderOpen(true);
          }, 1000);
        }
      })
    );

    observer.observe(document.querySelector(".loading__wrapper"), {
      attributes: true,
      childList: true,
    });
  }, [referrerId]);

  return (
    <div>
      <Helmet>
        <title>PuStack</title>
        <meta name="title" content="PuStack Education" />
        <meta
          name="description"
          content="Platform for Success. Personalized. At PuStack we believe that it is our responsibility to build quality tools and generate flawless content to help students globally."
        />
        <meta
          name="keywords"
          content="pustack, education, classes, live, cbse, doubts, blaze, pro, learn, tips, practice, classroom, science, english, maths, mathematics, technology, school, teacher, students"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.pustack.com" />
        <meta property="og:title" content="Pustack Education" />
        <meta
          property="og:description"
          content="Platform for Success. Personalized. At PuStack we believe that it is our responsibility to build quality tools and generate flawless content to help students globally."
        />
        <meta property="og:image" content="https://www.pustack.com/facebook.png" />

        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.pustack.com" />
        <meta property="twitter:title" content="PuStack Education" />
        <meta
          property="twitter:description"
          content="Platform for Success. Personalized. At PuStack we believe that it is our responsibility to build quality tools and generate flawless content to help students globally."
        />
        <meta
          property="twitter:image"
          content="https://www.pustack.com/twitter.png"
        />
      </Helmet>
      {isSmallScreen ? (
        <MobileLanding
          isSliderOpen={isSliderOpen}
          setIsSliderOpen={setIsSliderOpen}
        />
      ) : (
        <DesktopLanding
          isSliderOpen={isSliderOpen}
          setIsSliderOpen={setIsSliderOpen}
        />
      )}
      {!hideCookieBanner && (
        <div
          className={resetHeight ? "cookie-popup reset-height" : "cookie-popup"}
        >
          <h6>
            This site uses cookies. By continuing to use this website, you agree
            to our{" "}
            <a target="_blank" href={"/terms_of_service"} rel="noopener noreferrer">Terms of Service</a>
            {" "}
            and{" "}
            <a target="_blank" href={"/privacy_policy"} rel="noopener noreferrer">Privacy Policy</a>
            .
          </h6>
          <button onClick={hideCookieFn}>Agree</button>
        </div>
      )}
    </div>
  );
}
