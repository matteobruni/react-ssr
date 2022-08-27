import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {CheckCircle} from "@material-ui/icons";
import {subjectImageData} from "../../../../components/home/learn-section";
import "./style.scss";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {OverlayScrollbarsComponent} from "overlayscrollbars-react";
import SwipeableViews from "react-swipeable-views/lib/SwipeableViews";
import HorizontalTabs from "../../../../components/global/horizontal-tabs";
import PustackDarkLogoPro from "../../../../assets/images/proLogoDark.png";
import PustackDarkLogo from "../../../../assets/images/logoDark.png";
import {UserContext} from "../../../../context";


const AntTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    minWidth: 90.5,
    minHeight: 30,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: 0,
    color: 'rgba(var(--color-text-rgb), .7)',
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    pointerEvents: 'none',
    '&:hover': {
      color: 'var(--color-text)',
      opacity: 1,
    },
    '&$selected': {
      color: 'var(--color-text)',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: 'var(--color-text)',
    },
  },
  selected: {},
}))((props) => <Tab disableRipple {...props} />);


const exceptions = ['literature', 'grammar'];

export default function CMSChapterScreen({gradients, selectedScope, selectedCategory, selectedGrade, selectedSubject: selectedSubjectProp, setSelectedSubject}) {
  const [value, setValue] = React.useState(0);
  const [isUserPro] = useContext(UserContext).tier;

  const tabItems = useMemo(() => {
    if(!selectedCategory || !selectedCategory._meta) return [];
    let arr = [{id: 'learn', name: 'Learn'}];
    if(exceptions.includes(selectedCategory.generic_name)) {
      arr = selectedCategory._meta.sort((a, b) => a.serial_order - b.serial_order).map(subject => ({
        id: subject.subject_id,
        name: subject.subject_name
      }))
    }
    arr.push({id: 'tips', name: 'Tips'}, {id: 'practice', name: 'Practice'});
    return arr;
  }, [selectedCategory]);

  useEffect(() => {
    if(!selectedScope) return;
    let index = 0;
    if(selectedScope.id.includes('learn')) index = tabItems.findIndex(c => c.id === 'learn');
    if(selectedScope.id.includes('tips')) index = tabItems.findIndex(c => c.id === 'tips');
    if(selectedScope.id.includes('practice')) index = tabItems.findIndex(c => c.id === 'practice');
    if(index < 0) index = 0;
    setValue(index);
  }, [selectedScope, tabItems]);

  const nameKey = useMemo(() => {
    if(!selectedScope) return 'subject_name';
    if(selectedScope.id.includes('learn')) return 'subject_name';
    if(selectedScope.id.includes('tips')) return 'tip_name';
    if(selectedScope.id.includes('practice')) return 'exam_name';
  }, [selectedScope]);

  const selectedSubject = useMemo(() => {
    console.log('selectedCategory, selectedSubjectProp - ', selectedCategory, selectedSubjectProp);
    if(!selectedCategory) return null;

    if(exceptions.includes(selectedCategory.generic_name)) {
      return {
        ...selectedCategory,
        subject_name: selectedCategory.category_name,
        subject_id: selectedCategory.id
      }
    }

    if(!selectedCategory._meta) return null;
    if(selectedCategory.skippable) return selectedCategory._meta[0];

    if(!selectedSubjectProp) return null;
    return selectedCategory._meta.find(c => c.subject_id === selectedSubjectProp.id);
  }, [selectedSubjectProp, selectedCategory]);

  const currentSubject = useMemo(() => {
    if(!selectedSubject) return 'maths';
    return selectedSubject.generic_name ?? selectedSubject.subject_name.toLowerCase();
  }, [selectedSubject]);

  const chapterItems = useMemo(() => {
    if(!selectedCategory) return null;
    if(nameKey === 'tip_name' || nameKey === 'exam_name') {
      return selectedCategory._meta.sort((a, b) => a.serial_order - b.serial_order);
    }
    if(!selectedSubject) return null;
    if(!selectedSubject.chapters) {
      const tab = tabItems[value];
      let subject = selectedCategory._meta.find(c => c.subject_id === tab.id);
      if(selectedSubjectProp) {
        subject = selectedCategory._meta.find(c => c.subject_id === selectedSubjectProp.id);
        const newTabValue = tabItems.findIndex(c => c.id === selectedSubjectProp.id);
        setValue(newTabValue);
      }
      return subject.chapters.sort((a, b) => a.serial_order - b.serial_order);
    }
    return selectedSubject.chapters.sort((a, b) => a.serial_order - b.serial_order);
  }, [selectedSubject, selectedCategory, tabItems, value, selectedSubjectProp, nameKey]);

  const tabViewItems = useMemo(() => {
    if(!selectedCategory) return [];
    if(!exceptions.includes(selectedCategory.generic_name)) {
      if(nameKey === 'tip_name') {
        return [[], chapterItems];
      }
      if(nameKey === 'exam_name') {
        return [[], [], chapterItems];
      }
      return [chapterItems]
    };
    let tabs = tabItems.slice(0, -2);
    return tabs.map(tab => selectedCategory._meta.find(c => c.subject_id === tab.id).chapters.sort((a, b) => a.serial_order - b.serial_order));
  }, [tabItems, selectedCategory, selectedSubject, nameKey]);

  const curGradient = useMemo(() => {
    if(!selectedSubject || !selectedGrade || !gradients) return ['#de85ff', '#f3c2ff'];
    let gradient = gradients[selectedGrade.id].subject_color_map[selectedSubject.subject_name];
    if(gradient) return gradient;
    return gradients[selectedGrade.id].subject_color_map['Other'];
  }, [selectedSubject, selectedGrade, gradients]);

  return (
    <div className="cms-chapter-screen">
      {!selectedSubject ?
        <div className="phone-logo-holder">
          <img src={isUserPro ? PustackDarkLogoPro : PustackDarkLogo} alt=""/>
        </div> :
      <>
        <div className="cms-chapter-screen-header">
          <div className="cms-chapter-screen-header-svg">
            <div className={"cms-chapter-screen-header-svg-bg " + (currentSubject)}
                 style={{
                   background: `linear-gradient(to top, ${curGradient[0]}, ${curGradient[1]})`
                 }}
            />
            <img src={subjectImageData[currentSubject]} alt=""/>
          </div>
          <div className="cms-chapter-screen-header-info">
            <h1 className={currentSubject} style={{
              background: `linear-gradient(
              to left,
              ${curGradient[0]} 5%,
              ${curGradient[1]} 30%,
              ${curGradient[0]} 50%,
              ${curGradient[1]} 70%,
              ${curGradient[0]} 95%
            )`,
              backgroundClip: 'text',
              backgroundSize: '200% auto'
            }}>{selectedSubject?.name || selectedSubject?.subject_name || 'Subject Name'}</h1>
            <div className="cms-chapter-screen-header-info-description">
              <CheckCircle style={{fontSize: '13px', color: 'green', marginRight: '5px', marginTop: '-2px'}} />
              <span>PuStack</span>
              <span className="cms-chapter-screen-header-info-description-separator" />
              <span>Updated 10 months ago</span>
            </div>
          </div>
        </div>
        <HorizontalTabs sliderStyle={{background: `linear-gradient(to top, ${curGradient[0]}, ${curGradient[1]})`}} tabItems={tabItems} value={value} setValue={setValue} />
        {/*<div>*/}
        {/*  <Tabs*/}
        {/*    value={value}*/}
        {/*    indicatorColor="primary"*/}
        {/*    textColor="primary"*/}
        {/*    onChange={handleChange}*/}
        {/*    TabIndicatorProps={{className: currentSubject, style: {background: `linear-gradient(to top, ${curGradient[0]}, ${curGradient[1]})`}}}*/}
        {/*  >*/}
        {/*    <AntTab label="Learn" />*/}
        {/*    <AntTab label="Tips" />*/}
        {/*    <AntTab label="Practice" />*/}
        {/*    <AntTab label="Practice 1" />*/}
        {/*    <AntTab label="Practice 2" />*/}
        {/*  </Tabs>*/}
        {/*</div>*/}
        <SwipeableViews
          axis={"x"}
          index={value}
          onChangeIndex={c => setValue(c)}
          scrolling={"false"}
          // containerStyle={{ background: "#161616" }}
          className="swipeable-container"
          containerStyle={{
            transition: 'transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s'
          }}
          // style={{ background: "#161616" }}
          // slideStyle={{ background: "#161616" }}
        >
          {tabViewItems.map(viewItem => (
            <OverlayScrollbarsComponent
              options={{
                overflowBehavior: {
                  x: "scroll",
                  y: "hidden"
                },
                className: "cms-chapter-screen-tab os-theme-light",
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
              {viewItem?.map(item => (
                <div className="cms-chapter-screen-tab-item">
                  <div className="cms-chapter-screen-tab-item-image" style={{backgroundColor: item.hex_color}}>
                    <img src={item.illustration_art ?? item.banner_image ?? item.mini_thumbnail_url} alt=""/>
                  </div>
                  <div className="cms-chapter-screen-tab-item-content">
                    <h2>{item[nameKey]}</h2>
                    <p>{item.description}</p>
                    {nameKey !== 'tip_name' && <span>{item.lecture_item_count ?? (item.exam_item_count ? item.exam_item_count - 2 : null) ?? 0} {nameKey === 'chapter_name' ? 'Lectures' : 'Questions'}</span>}
                  </div>
                </div>
              ))}
            </OverlayScrollbarsComponent>
          ))}
        </SwipeableViews>
      </>}
    </div>
  )
}
