import React, { lazy, Suspense, useState } from "react";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import InstagramIcon from "@material-ui/icons/Instagram";
import EmailRoundedIcon from "@material-ui/icons/MailRounded";
import logowhite from "../../assets/images/logo-white.png";
import {
  termsOfService,
  privacyPolicy,
  appGooglePlayLink,
  googlePlayBadge,
} from "../../helpers";
import "./style.scss";
import {Link} from "react-router-dom";
import YouTubeIcon from "@material-ui/icons/YouTube";
import {Helmet} from "react-helmet";

const OnBoarding = lazy(() => import("../../containers/landing/onboarding"));

export default function About({ loggedIn }) {
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const GooglePlay = () => (
    <a target="_blank" rel="noopener noreferrer" href={appGooglePlayLink}>
      <img alt="Get it on Google Play" src={googlePlayBadge} />
    </a>
  );
  
  return (
    <div className="about__page">
      <Helmet>
        <title>About</title>
      </Helmet>
      <section className="landing__section">
        <nav className="nav__wrapper">
          <span className="nav__logo">
            <a href="/">
              <img
                src={logowhite}
                alt="Pustack Logo"
                draggable={false}
                className="nav__logo__img"
              />
            </a>
          </span>

          {!loggedIn && (
            <span className="nav__links">
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
          )}
        </nav>

        <div className="landing__wrapper">
          <video
            muted
            playsInline
            loop
            autoPlay
            className="mac__desktop"
            src="https://d1kjns6e6wnqfd.cloudfront.net/danceVideo.mp4"
          />
          <div className="desktop__overlay" />
          <div className="about__us__text">
            <h1>About Us</h1>
            <p>
              At PuStack we believe that it is our responsibility to build
              quality tools and generate flawless content to help students
              globally. We are humbled by the response we got on our YouTube
              channel and are happy to see students coming on board with our
              vision.
            </p>

            <p>
              This Platform is built to serve our students in ways we could not
              previously. From providing solutions to the back exercises, to
              providing quality notes - our team is working hard to make it
              easier for students to access quality education.
            </p>
          </div>
        </div>
      </section>
      <footer className="desktop__landing__footer">
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
