import React, {useCallback, useEffect, useRef, useState} from 'react';
import {OverlayScrollbarsComponent} from "overlayscrollbars-react";

export default function HorizontalTabs({tabItems, tabChangedTo, sliderStyle, value, setValue, onTabClick = () => {}}) {
  const tabContainerRef = useRef(null);
  const [tabs, setTabs] = useState([]);
  const [tabData, setTabData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if(!tabContainerRef.current) return;
    const instance = tabContainerRef.current.osInstance();
    const content = instance.getElements().content;
    const tabItems = content.querySelectorAll('.cms-dynamic-content-drawer-tab-item');
    setTabs(tabItems);
  }, [tabContainerRef.current, tabItems]);

  useEffect(() => {
    let a = [];
    tabs.forEach(tab => {
      a.push({
        left: tab.offsetLeft,
        width: tab.clientWidth
      })
    })
    setTabData(a);
  }, [tabs]);

  const handleTabClick = useCallback((index) => {
    if(!tabContainerRef.current) return;
    const instance = tabContainerRef.current.osInstance();
    setActiveTab(c => {
      let isGoingBack = index < c;
      if(isGoingBack) {
        let d = tabData[index - 1];
        instance.scroll({x: d ? d.left : 0}, 400, {x: 'linear'});
        return index;
      }
      instance.scroll({x: tabData[index]?.left}, 400, {x: 'linear'});
      return index;
    });
    console.log('index - ', index);
    // setActiveSwipeableView(index);
  }, [tabContainerRef.current, tabData]);

  useEffect(() => {
    handleTabClick(value);
  }, [value])

  return (
    <OverlayScrollbarsComponent
      ref={tabContainerRef}
      options={{
        overflowBehavior: {
          x: "scroll",
          y: "hidden"
        },
        className: "cms-dynamic-content-drawer-tab-container os-theme-light",
        resize: "none",
        sizeAutoCapable: true,
        paddingAbsolute: true,
        scrollbars: {
          clickScrolling: true,
          autoHide: 'scroll',
          visibility: 'h'
        },
        nativeScrollbarsOverlaid: {
          showNativeScrollbars: false,
          initialize: true
        }
      }}
    >
      <div className="cms-dynamic-content-drawer-tab-slider" style={{
        left: tabData[activeTab]?.left,
        width: tabData[activeTab]?.width,
        ...sliderStyle
      }}/>
      {tabItems.map((item, index) => (
        <div className="cms-dynamic-content-drawer-tab-item" key={item.id}
             onClick={() => setValue(index)}>
          <p>{item.name}</p>
        </div>
      ))}
    </OverlayScrollbarsComponent>
  )
}
