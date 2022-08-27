import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "../../containers";
import { BlazePage } from "../../containers";
import {
  NavbarContextProvider,
  BookSessionContextProvider,
  BlazeSessionContextProvider,
} from "../../context";

export default function BlazeScreen() {
  const [isMobileOpen, setisMobileOpen] = useState(false);
  const [showMenuItem, setShowMenuItem] = useState(false);

  const showMenuItemFn = (flag) => setShowMenuItem(!flag);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Blaze</title>
      </Helmet>
      <NavbarContextProvider>
        <Navbar setMobileOpen={setisMobileOpen} showMenuItem={showMenuItem} />
      </NavbarContextProvider>
      <div className="blaze">
        <BookSessionContextProvider>
            <BlazePage
              isMobileOpen={isMobileOpen}
              handleDrawerToggle={() => setisMobileOpen(false)}
              showMenuItem={showMenuItemFn}
            />
        </BookSessionContextProvider>
      </div>
    </>
  );
}
