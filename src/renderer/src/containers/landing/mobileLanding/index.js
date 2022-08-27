import React, { useEffect, useState } from "react";
import StarRatings from "react-star-ratings";
import { appGooglePlayLink, starPath } from "../../../helpers";
import OnBoardingMobile from "../onboardingMobile";
import appLogo from "../../../assets/images/icons/pustack_app_logo.svg";
import "./style.scss";

export default function MobileLanding() {
  const [closeInstallApp, setCloseInstallApp] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("closeInstallApp")) {
      const _closeInstallApp = localStorage.getItem("closeInstallApp");

      if (_closeInstallApp === "true") {
        setCloseInstallApp(true);
      }
    }
  }, []);
  
  return (
    <div>
      <div className="mobile__noscroll__wrapper">
        <OnBoardingMobile setCloseInstallApp={setCloseInstallApp} />
        {!closeInstallApp && (
          <div className="app-install-landing">
            <h6
              onClick={() => {
                setCloseInstallApp(true);
                localStorage.setItem("closeInstallApp", JSON.stringify(true));
              }}
            >
              ✕
            </h6>
            <img src={appLogo} alt="app" />
            <div className="app-name">
              <h5>PuStack - Learning App for Success</h5>
              <p>PuStack Technologies, Inc.</p>
              <h3>
                <StarRatings
                  name="rating"
                  numberOfStars={5}
                  starSpacing="1px"
                  starDimension="10px"
                  rating={4}
                  svgIconPath={starPath}
                  starRatedColor="#fec107"
                  starHoverColor="#fec107"
                  svgIconViewBox="0 0 207.802 207.748"
                />
                {" (1,540)"}
              </h3>
            </div>
            <div className="install-btn">
              <a
                href={appGooglePlayLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setCloseInstallApp(true);
                  localStorage.setItem("closeInstallApp", JSON.stringify(true));
                }}
              >
                INSTALL
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
