import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import { useMediaQuery } from "react-responsive";
import "./style.scss";

// -> containers
import { NewsFeedSidebar } from "../../../containers";

export default function Page(props) {
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1200px)" });

  return (
    <>
      <div className={"newsfed-page-container"}>
        {!isTabletScreen && <NewsFeedSidebar key={"newsfeedsidebar"} />}
        {props.children}
      </div>
      <Hidden xlUp implementation="js">
        <Drawer
          variant="temporary"
          open={props.isOpen}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <NewsFeedSidebar
            isOpen={props.isOpen}
            handleDrawerToggle={props.handleDrawerToggle}
          />
        </Drawer>
      </Hidden>
    </>
  );
}
