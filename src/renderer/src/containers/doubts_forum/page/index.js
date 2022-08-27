import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import { useMediaQuery } from "react-responsive";

import { Sidebar } from "../../../containers";
import "./style.scss";

export default function Page(props) {
  const { setMobileOpen, isOpen, handleDrawerToggle } = props;
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1200px)" });
 
  

  return (
    <>
      <div className={`doubt-page-container`}>
        {!isTabletScreen && (
          <Sidebar key={1} setMobileOpen={() => setMobileOpen(false)} />
        )}
        {props.children}
      </div>
      <Hidden xlUp implementation="js">
        <Drawer
          variant="temporary"
          open={isOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
        >
          <Sidebar
            key={2}
            setMobileOpen={() => setMobileOpen(false)}
            sidebarOpen={isOpen}
          />
        </Drawer>
      </Hidden>
    </>
  );
}
