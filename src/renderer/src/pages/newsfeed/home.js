import React, { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import { NewsFeed, Navbar } from "../../containers";
import { UserContext } from "../../context/global/user-context";
import { NewsFeedPage, NewsFeedTodaySessionsBar } from "../../containers";
import PuStackCareChat from "./../../containers/global/pustack-care";
import {
  NavbarContextProvider,
  NewsFeedContextProvider,
  CreatePostContextProvider,
} from "../../context";
import "./style.scss";
import PuStackCareChatPopup from "../../containers/global/pustack-care-chat-popup";

export default function NewsFeedHome() {
  const [user] = useContext(UserContext).user;
  const [openPustackCare] = useContext(UserContext).openPustackCare;
  const [unreadCareMsgCount] = useContext(UserContext).unreadCareMsgCount;

  const [isMobileOpen, setisMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setisMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>News Feed</title>
      </Helmet>
      <NavbarContextProvider>
        <Navbar setMobileOpen={handleDrawerToggle} />
      </NavbarContextProvider>

      <div className="newsfeed-body">
        <NewsFeedContextProvider>
          <CreatePostContextProvider>
            <NewsFeedPage
              handleDrawerToggle={handleDrawerToggle}
              isOpen={isMobileOpen}
            >
              <div className="doubt-page">
                <div className="doubt-page-center">
                  <NewsFeed userID={user ? user.uid : null} />
                </div>

                <div className="doubt-page-rightbar">
                  <NewsFeedTodaySessionsBar />
                </div>
                {/* <SideIllustration /> */}

                {openPustackCare && (
                  <div className="pustack-care-chat">
                    <PuStackCareChat />
                  </div>
                )}
                {!openPustackCare && unreadCareMsgCount > 0 && (
                  <PuStackCareChatPopup />
                )}
              </div>
            </NewsFeedPage>
          </CreatePostContextProvider>
        </NewsFeedContextProvider>
      </div>
    </>
  );
}
