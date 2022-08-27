import React, { useState, useContext, useEffect } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import SwipeableViews from "react-swipeable-views";
import { PracticeSidebarLectures } from "../../index";
import { PracticeContext } from "../../../context";
import "./style.scss";

export default function PracticeSidebar({
  examEngagementStatus,
  subjectId,
  practiceId,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeTabIndex, setActiveTabIndex] =
    useContext(PracticeContext).activeTabIndex;
  const [practiceTabs] = useContext(PracticeContext).practiceTabs;

  const handleTabChange = (_, value) => {
    setActiveTab(value);
  };
  useEffect(() => {
    setActiveTab(activeTabIndex);
  }, [practiceTabs, activeTabIndex]);

  return (
    <div className="classroom__sidebar">
      <div className="classroom__tabs dark">
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          scrollButtons={"auto"}
          variant="scrollable"
        >
          {practiceTabs?.map(({ tab_id, tab_name }) => (
            <Tab
              key={tab_id}
              disableRipple
              disableFocusRipple
              disableTouchRipple
              style={{ minWidth: 42 }}
              label={tab_name}
              onClick={() => setActiveTabIndex(tab_id)}
            />
          ))}
        </Tabs>
      </div>

      <div className="classroom__tabs__wrapper">
        {practiceTabs && (
          <SwipeableViews
            axis={"x"}
            index={activeTab}
            onChangeIndex={(e) => setActiveTab(e)}
            scrolling={"false"}
            containerStyle={{ background: "#161616" }}
            className="swipeable-container"
            style={{ background: "#161616" }}
            slideStyle={{ background: "#161616" }}
          >
            {[0, 1].map((tab) => (
              <div className="classroom__sidebar__tab">
                <PracticeSidebarLectures
                  data={practiceTabs}
                  tabIndex={tab}
                  examEngagementStatus={examEngagementStatus}
                  subjectId={subjectId}
                  practiceId={practiceId}
                />
              </div>
            ))}
          </SwipeableViews>
        )}
      </div>
    </div>
  );
}
