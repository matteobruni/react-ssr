import React, { useContext, useEffect } from "react";
import { Page, DoubtPageContent, Navbar } from "../../containers";
import {
  DoubtContextProvider,
  PostsContextProvider,
  NavbarContextProvider,
  AskYourDoubtContextProvider,
  PageContext,
} from "../../context";

export default function DoubtPage() {
  const [, setpageName] = useContext(PageContext).pageName;

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    setpageName("doubtPage");
  }, []);

  return (
    <>
      <NavbarContextProvider>
        <Navbar setMobileOpen={setMobileOpen} />
      </NavbarContextProvider>
      <div>
        <DoubtContextProvider>
          <PostsContextProvider>
            <AskYourDoubtContextProvider>
              <Page
                isOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                handleDrawerToggle={handleDrawerToggle}
              >
                <DoubtPageContent />
              </Page>
            </AskYourDoubtContextProvider>
          </PostsContextProvider>
        </DoubtContextProvider>
      </div>
    </>
  );
}
