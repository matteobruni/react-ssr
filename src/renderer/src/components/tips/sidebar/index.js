import React, { useContext } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { TipsContext } from "../../../context";
import { TipsSidebarLectures } from "../../index";
import "./style.scss";

export default function TipsSidebar() {
  const [tipsData] = useContext(TipsContext).tipsData;

  return (
    <div className="classroom__sidebar">
      <div className="classroom__tabs dark">
        <Tabs
          value={0}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons={"auto"}
          variant="scrollable"
        >
          <Tab
            disableRipple
            disableFocusRipple
            disableTouchRipple
            style={{ minWidth: 42 }}
            label={"Tips"}
          />
        </Tabs>
      </div>
      <div className="classroom__tabs__wrapper tips">
        <div className="classroom__sidebar__tab">
          <TipsSidebarLectures data={tipsData?._meta} />
        </div>
      </div>
    </div>
  );
}
