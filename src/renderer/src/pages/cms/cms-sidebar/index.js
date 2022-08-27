import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import PustackDarkLogoPro from "../../../assets/images/proLogoDark.png";
import PustackDarkLogo from "../../../assets/images/logoDark.png";
import iphoneImage from "../../../assets/images/iphone-x.png";
import {UserContext} from "../../../context";
import {ArrowRight, CheckCircle} from "@material-ui/icons";
import {OverlayScrollbarsComponent} from "overlayscrollbars-react";
import {PracticeSidebarLectures} from "../../../components";
import SwipeableViews from "react-swipeable-views";
import CMSChapterScreen from "./cms-chapter-screen";
import {db} from "../../../firebase_config";
import HorizontalTabs from "../../../components/global/horizontal-tabs";

const items = [
  'Chapter',
  'In-Chapter Exercises',
  'Back Exercise',
  'Quick Review'
]

const contentItems = [
  'Introduction',
  'Classification of Numbers',
  'Exercise 1.1',
  'Irrational Numbers',
  'Exercise 1.2',
  'Real Numbers & Decimal Points',
  'Exercise 1.3'
];

const DrawerListItem = ({item}) => {
  const [showChild, setShowChild] = useState(false);

  const headerItems = useMemo(() => {
    if(!item?.data?.lecture_header_items) return [];
    return item.data.lecture_header_items.sort((a, b) => a.serial_order - b.serial_order).map(c => ({
      id: c.lecture_header_item_id,
      name: c.lecture_header_item_name
    }))
  }, [item])

  // TODO: Make the child container depends on the count of children items instead of the current css fixed maxHeight solution

  return (
    <>
      <div className="cms-dynamic-content-drawer-list-item" onClick={() => {
        if(item?.isHeader) setShowChild(c => !c);
      }}>
        <CheckCircle style={{fontSize: '18px', marginRight: '10px'}} />
        <span>{item?.name}</span>
        {item?.isHeader && <ArrowRight style={{transform: `rotate(${showChild ? '90' : '0'}deg)`, transition: '.2s ease-out'}}/>}
      </div>
      {item?.isHeader && (
        headerItems.map(item => (
          <div className={"cms-dynamic-content-drawer-list-item-child-container" + (showChild ? ' visible' : '')} style={{
            maxHeight: (showChild ? headerItems.length * 40 : 0) + 'px'
          }}>
            <div className="cms-dynamic-content-drawer-list-item" key={item.id}>
              <CheckCircle style={{fontSize: '18px', marginRight: '10px'}}/>
              <span>{item.name}</span>
            </div>
          </div>
        ))
      )}
    </>
  )
}

export default function CMSSidebar({path, pathItems}) {
  const [isUserPro] = useContext(UserContext).tier;
  const [user] = useContext(UserContext).user;
  const [activeTab, setActiveTab] = useState(0);
  const [activeSwipeableView, setActiveSwipeableView] = useState(0);
  const [chapterItems, setChapterItems] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedLectureItem, setSelectedLectureItem] = useState(null);
  const [gradients, setGradients] = useState(null);

  useEffect(() => {
    db.collection('blaze_dev/collections/hierarchy')
      .get()
      .then(querySnapshot => {
        console.log('querySnapshot - ', querySnapshot);
        const obj = {};
        querySnapshot.docs.forEach((snapshot) => {
          obj[snapshot.id] = snapshot.data();
        })
        setGradients(obj);
      })
  }, [])

  useEffect(() => {
    console.log('gradients - ', gradients);
  }, [gradients])

  useEffect(() => {
    console.log('pathItems = ', pathItems);
    if(pathItems.every(c => c.id !== 'grade')) return;

    const gradeData = pathItems.find(c => c.id === 'grade');
    if(!gradeData) return;
    const isGradeSelected = path.find(c => c.type === 'grade');
    let _selectedGrade;
    if(isGradeSelected) {
      _selectedGrade = gradeData.items.find(a => a.id === isGradeSelected.path);
    } else return;
    setSelectedGrade(_selectedGrade);

    if(pathItems.every(c => c.id !== 'scope')) return;

    const scopeData = pathItems.find(c => c.id === 'scope');
    if(!scopeData) return;
    const isScopeSelected = path.find(c => c.type === 'scope');
    let _selectedScope;
    if(isScopeSelected) {
      _selectedScope = scopeData.items.find(a => a.id === isScopeSelected.path);
    } else return;
    setSelectedScope(_selectedScope);

    if(pathItems.every(c => c.id !== 'category')) {
      setSelectedCategory(null);
      setSelectedSubject(null);
      setSelectedChapter(null);
      setSelectedTab(null);
      setSelectedLectureItem(null);
      return
    }

    const categoryData = pathItems.find(c => c.id === 'category');
    if(!categoryData) return;
    const isCategorySelected = path.find(c => c.type === 'category');
    let _selectedCategory;
    if(isCategorySelected) {
      _selectedCategory = categoryData.items.find(a => a.id === isCategorySelected.path);
    } else return;
    setSelectedCategory(_selectedCategory);

    if(pathItems.every(c => c.id !== 'subject')) {
      setSelectedSubject(null);
      setSelectedChapter(null);
      setSelectedTab(null);
      setSelectedLectureItem(null);
      return
    }

    const subjectData = pathItems.find(c => c.id === 'subject');
    if(!subjectData) return;
    const isSubjectSelected = path.find(c => c.type === 'subject');
    let _selectedSubject;
    if(isSubjectSelected) {
      _selectedSubject = subjectData.items.find(a => a.id === isSubjectSelected.path);
    } else return;
    setSelectedSubject(_selectedSubject);

    if(pathItems.every(c => c.id !== 'chapter')) {
      setSelectedChapter(null);
      setSelectedTab(null);
      setSelectedLectureItem(null);
      return
    }


    const chapterData = pathItems.find(c => c.id === 'chapter');
    if(!chapterData) return;
    setChapterItems(chapterData.items);
    const isChapterSelected = path.find(c => c.type === 'chapter');
    let _selectedChapter;
    if(isChapterSelected) {
      _selectedChapter = chapterData.items.find(a => a.id === isChapterSelected.path);
    } else return;
    setSelectedChapter(_selectedChapter);


    const tabData = pathItems.find(c => c.id === 'tab');
    if(!tabData) return;

    const isTabSelected = path.find(c => c.type === 'tab');
    let _selectedTab = tabData.items[0];
    if(isTabSelected) {
      _selectedTab = tabData.items.find(a => a.id === isTabSelected.path);
    }
    setSelectedTab(_selectedTab);

    const lectureItemData = pathItems.find(c => c.id === 'lecture_item');
    if(!lectureItemData) return;

    const isLectureItemSelected = path.find(c => c.type === 'lecture_item');
    if(!isLectureItemSelected) {
      if(lectureItemData.items.length > 0) setSelectedLectureItem(lectureItemData.items[0]);
      return;
    }
    setSelectedLectureItem(lectureItemData.items.find(a => a.id === isLectureItemSelected.path))

  }, [pathItems, path]);

  const tabItems = useMemo(() => {
    // return [];
    if(!selectedChapter || !selectedChapter._meta) return [];
    const items = [...selectedChapter._meta];
    return items.sort((a, b) => a.serial_order - b.serial_order).map(item => ({
      id: item.tab_id,
      name: item.tab_name,
      data: {...item}
    }))
  }, [selectedChapter]);

  const lectureItems = useMemo(() => {
    if(!tabItems || !selectedTab) return [];
    return tabItems.map(curTab => {
      if(!curTab.data.lecture_items) return [];
      return curTab.data.lecture_items.sort((a, b) => a.serial_order - b.serial_order).map(item => ({
        id: item.lecture_item_id,
        name: item.lecture_item_name,
        isHeader: item.lecture_item_type === 'header',
        data: {...item}
      }))
    })
  }, [tabItems, selectedTab]);

  useEffect(() => {
    console.log('selectedTab, tabItems - ', selectedTab, tabItems);
    if(!selectedTab || !(tabItems.length > 0)) return;
    let index = tabItems.findIndex(c => c.id === selectedTab.id);
    console.log('index - ', index)
    setActiveTab(index);
  }, [selectedTab, tabItems]);

  return (
    <section className="cms-sidebar dark">
      <div className="cms-sidebar-header">
        <img src={isUserPro ? PustackDarkLogoPro : PustackDarkLogo} alt=""/>
        <div className="cms-sidebar-header-user-image">
          <img src={user.profile_url} alt=""/>
        </div>
      </div>
      <div className="cms-sidebar-content">
        <div className="cms-sidebar-content-image">
          <img src={iphoneImage} alt="Iphone"/>
          <div className="cms-dynamic-content-container">
            {(!selectedChapter) ? <CMSChapterScreen gradients={gradients} selectedGrade={selectedGrade} selectedScope={selectedScope} selectedCategory={selectedCategory} selectedSubject={selectedSubject} chapterItems={chapterItems} tabSelected={0}/> :
              <>
                <div className="cms-dynamic-content-video-container">
                  <img src={isUserPro ? PustackDarkLogoPro : PustackDarkLogo} alt=""/>
                </div>
                <div className="cms-dynamic-content-video-info">
                  <h3>{selectedChapter?.chapter_name}</h3>
                  <h1>{selectedLectureItem?.lecture_item_name}</h1>
                </div>
                {tabItems?.length > 0 && (
                  <div className="cms-dynamic-content-drawer">
                    <HorizontalTabs tabItems={tabItems} value={activeTab} setValue={setActiveTab} onTabClick={setActiveSwipeableView} />
                    <SwipeableViews
                      axis={"x"}
                      index={activeTab}
                      onChangeIndex={c => setActiveTab(c)}
                      scrolling={"false"}
                      // containerStyle={{ background: "#161616" }}
                      className="swipeable-container"
                      // style={{ background: "#161616" }}
                      // slideStyle={{ background: "#161616" }}
                    >
                      {lectureItems.map(item => (
                        <OverlayScrollbarsComponent
                          options={{
                            overflowBehavior: {
                              x: "scroll",
                              y: "hidden"
                            },
                            className: "cms-dynamic-content-drawer-list os-theme-light",
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
                          {item.map(item => (
                            <DrawerListItem key={item.id} item={item}/>
                          ))}
                        </OverlayScrollbarsComponent>
                      ))}
                    </SwipeableViews>
                  </div>
                )}
              </>}
          </div>
        </div>
      </div>
    </section>
  )
}
