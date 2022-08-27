import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Steps } from "intro.js-react";
import { Page, HomePageContent, Navbar } from "../../containers";

import {
  PostsContextProvider,
  AskYourDoubtContextProvider,
  NavbarContextProvider,
  PageContext,
} from "../../context";

export default function DoubtHome() {
  const [, setpageName] = useContext(PageContext).pageName;
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const introSteps = [
    {
      element: ".home__categories",
      intro: "You can sort and filter your doubts here",
      position: "right",
    },
    {
      element: ".askDoubtPopup__btn",
      intro: "Got a doubt, ask here.",
      position: "right",
    },
    {
      element: "#firstDoubt",
      intro: "Your doubts will get answered by our best teachers.",
      position: "right",
    },
    {
      element: ".trending-bar",
      intro: "Some trending questions",
      position: "left",
    },
    {
      element: "#blazeIntro",
      intro:
        "You still have doubts, get 1 to 1 with our teachers on PuStack Blaze.",
      position: "right",
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    setpageName("homePage");
  });

  useEffect(() => {
    setTimeout(() => setStepsEnabled(false), 4000);
  }, []);

  const onExit = () => {
    setStepsEnabled(false);
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Doubt Forum</title>
      </Helmet>
      <NavbarContextProvider>
        <Navbar setMobileOpen={setMobileOpen} />
      </NavbarContextProvider>
      <div>
        <PostsContextProvider>
          <AskYourDoubtContextProvider>
            <Steps
              enabled={stepsEnabled}
              steps={introSteps}
              initialStep={0}
              onExit={onExit}
              options={{ hideNext: false, disableInteraction: true }}
            />
            <Page
              setMobileOpen={setMobileOpen}
              isOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
            >
              <HomePageContent />
            </Page>
          </AskYourDoubtContextProvider>
        </PostsContextProvider>
      </div>
    </>
  );
}
