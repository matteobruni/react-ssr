import React, { lazy, Suspense } from "react";
import Typewriter from "typewriter-effect";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import InstagramIcon from "@material-ui/icons/Instagram";
import EmailRoundedIcon from "@material-ui/icons/MailRounded";
import { iPhone2, appLive, appDoubts } from "../../../assets";
import logowhite from "../../../assets/images/logo-white.png";
import {
  termsOfService,
  privacyPolicy,
  appGooglePlayLink,
  googlePlayBadge,
} from "../../../helpers";

import "./style.scss";
import {refundAndCancellationPolicy} from "../../../helpers/links";
import {Link} from "react-router-dom";

const OnBoarding = lazy(() => import("../onboarding"));

export default function DesktopLanding({ isSliderOpen, setIsSliderOpen }) {
  const GooglePlay = () => (
    <a target="_blank" rel="noopener noreferrer" href={appGooglePlayLink}>
      <img alt="Get it on Google Play" src={googlePlayBadge} />
    </a>
  );

  return (
    <div>
      <section className="landing__section">
        <nav className="nav__wrapper">
          <span className="nav__logo">
            <img
              src={logowhite}
              alt="Pustack Logo"
              draggable={false}
              className="nav__logo__img"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          </span>

          <span className="nav__links">
            {/*<a href="https://tutor.pustack.com">Tutor Login</a>*/}
            <span
              className="nav__link signup__btn"
              onClick={() => {
                setIsSliderOpen(true);
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
            >
              Sign In
            </span>
          </span>
        </nav>

        <div className="steps__circle">
          <div id="circle1" />
          <div id="circle2" />
          <div id="circle3" />
          <div id="circle4" />
          {/*<div id="circle5" />*/}
          <div id="circle6" />
        </div>

        <div className="landing__wrapper">
          <div className="mobile__hero">
            <div className="phones__wrapper">
              <div id="content">
                <div className="bleeding-bg" />
                <div className="backdrop" />

                <div className="app__wrapper">
                  <img className="iphone__chassis" src={iPhone2} alt="iphone" />
                  <div className="app__splash">
                    <video
                      muted
                      playsInline
                      loop
                      autoPlay
                      className="mac__desktop"
                      src="https://d1kjns6e6wnqfd.cloudfront.net/danceVideo.mp4"
                    />
                    <div className="desktop__overlay" />
                  </div>
                  <div id="homescreen">
                    <div className="hide__bar" />
                    <img
                      src={
                        "https://d1kjns6e6wnqfd.cloudfront.net/liveclass.webp"
                      }
                      alt="PuStack Home"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  <div id="livescreen">
                    <img
                      src={appLive}
                      alt="PuStack Live"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  <div id="livescreen2">
                    <div className="hide__bar" />
                    <div className="live__tag">LIVE</div>
                    <img
                      src="https://d1kjns6e6wnqfd.cloudfront.net/liveclassvideo.webp"
                      alt="PuStack Live Video"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  {/*<div id="doubtscreen">*/}
                  {/*  <img*/}
                  {/*    src={appDoubts}*/}
                  {/*    alt="PuStack Doubts"*/}
                  {/*    draggable={false}*/}
                  {/*    loading="lazy"*/}
                  {/*  />*/}
                  {/*</div>*/}
                  <div id="searchscreen">
                    <img
                      src="https://d1kjns6e6wnqfd.cloudfront.net/snap.webp"
                      alt="PuStack Search"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <div id="descriptions">
                <div id="homedesc">
                  <h1>Comprehensive Learning</h1>
                  <p id="home1">Every topic. Every concept. Every question.</p>
                  <p id="home2">
                    India's most driven teachers have covered it all!
                  </p>
                </div>
                <div id="livedesc">
                  <h1>Daily Live Classes</h1>
                  <p id="live1">Being consistent is the key to success.</p>
                  <p id="live2">So we come live EVERYDAY!</p>
                </div>
                <div id="livedesc2">
                  <h1>Interactive Classes</h1>
                  <p id="live21">Chat with our teachers, take a quiz, learn!</p>
                  <p id="live22">Your learning style is ours too.</p>
                </div>
                {/*<div id="doubtdesc">*/}
                {/*  <h1>Doubt Forum</h1>*/}
                {/*  <p id="doubt1">Got something on your mind? Ask us!</p>*/}
                {/*  <p id="doubt2">Our network of teachers is eager to help.</p>*/}
                {/*</div>*/}
                <div id="searchdesc">
                  <h1>Snap &amp; Learn</h1>
                  <p id="search1">This is something out of a sci-fi movie!</p>
                  <p id="search2">
                    Snap and that's it, we will solve your doubts.
                  </p>
                </div>
                <div>
                  <section className="play-button">
                    <GooglePlay />
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div className="mac__text">
            <h2>Learning should be</h2>
            <h1>
              {isSliderOpen ? (
                "fun"
              ) : (
                <Typewriter
                  options={{
                    strings: ["intuitive", "fun", "accessible", "affordable"],
                    autoStart: true,
                    loop: true,
                    delay: 45,
                  }}
                />
              )}
            </h1>
            <div className="call__to__action">
              <button
                className="start__learning__btn"
                onClick={() => {
                  setIsSliderOpen(true);
                  navigator && navigator.vibrate && navigator.vibrate(5);
                }}
              >
                Start Learning
              </button>
            </div>

            <div className="down__scroll__indicator">
              <a id="scrollindicator">
                <span></span>
                <span></span>
                <span></span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="desktop__landing__footer">
        <div className="footer__wrapper">
          <h6>© {new Date().getFullYear()} PuStack Technologies, Inc.</h6>

          <div>
            <a
              href="https://www.instagram.com/pustack_app"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram__icon"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/pustack.official"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.youtube.com/pustack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <YouTubeIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/pustack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon />
            </a>

            <a
              href="mailto:contact@pustack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <EmailRoundedIcon />
            </a>
          </div>
        </div>
        <div className="final__footer">
          <h6 className="copyright">
            © {new Date().getFullYear()} PuStack Technologies, Inc.
          </h6>
          <div className="company__details">
            <h1>COMPANY</h1>
            <div>
              <h6>
                <Link to="/about">
                  About Us
                </Link>
              </h6>
              <h6>
                {/*<Link to={"/privacy_policy"} />*/}
                <a target="_blank" href={"/privacy_policy"}>Privacy Policy</a>
              </h6>
              <h6>
                <a target="_blank" href={"/terms_of_service"}>Terms of Service</a>
              </h6>
            </div>
          </div>
          <div className="other__links">
            <h1>OTHER LINKS</h1>
            <div>
              <h6>
                <Link to="/sitemap">
                  Site Map
                </Link>
                {/*<a href="/sitemap">Site Map</a>*/}
              </h6>
            </div>
            <div>
              <h6>
                <a target="_blank" href={"/cancellation_policy"} >Refund & Cancellation Policy</a>
              </h6>
            </div>
            <div>
              <h6>
                <Link to="/contact">
                  Contact Us
                </Link>
                {/*<a href="/contact" >Contact Us</a>*/}
              </h6>
            </div>
          </div>
          <div className="app__links">
            <h1>STUDENT APP</h1>
            <div className="play-button">
              <GooglePlay />
            </div>
          </div>
          <div>
            <a
              href="https://www.instagram.com/pustack_app"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram__icon"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/pustack.official"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.youtube.com/pustack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <YouTubeIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/pustack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon />
            </a>

            <a
              href="mailto:contact@pustack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <EmailRoundedIcon />
            </a>
          </div>
        </div>
      </footer>
      <Suspense fallback={<></>}>
        <OnBoarding
          isOpen={isSliderOpen}
          handleClose={() => setIsSliderOpen(!isSliderOpen)}
        />
      </Suspense>
    </div>
  );
}
