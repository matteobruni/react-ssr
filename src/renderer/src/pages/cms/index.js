import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/css/OverlayScrollbars.css";
import PustackDarkLogo from '../../assets/images/logoDark.png'
import PustackDarkLogoPro from '../../assets/images/proLogoDark.png'
import {ThemeContext, UserContext} from "../../context";
import "./style.scss";
import CmsModal from "./cms-modal";
import CmsCol, {FolderCMSIcon} from "./cms-col";
import usePath from "../../hooks/cms/usePath";
import CmsGradeForm from "./cms-forms/cms-grade-form";
import CmsCategoryForm from "./cms-forms/cms-category-form";
import CmsInfo from "./cms-info";
import {CmsContext} from "../../context/cms/CmsContext";
import CmsSubjectForm from "./cms-forms/cms-subject-form";
import CmsChapterForm from "./cms-forms/cms-chapter-form";
import CmsTabForm from "./cms-forms/cms-tab-form";
import CmsTipForm from "./cms-forms/cms-tip-form";
import CmsLectureItemForm from "./cms-forms/cms-lecture-item-form";
import CmsLectureHeaderItemForm from "./cms-forms/cms-lecture-header-item-form";
import CmsPracticeForm from "./cms-forms/cms-practice-form";
import CmsExamItemForm from "./cms-forms/cms-exam-item-form";
import CmsExamHeaderItemForm from "./cms-forms/cms-exam-header-item-form";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {useHistory, useLocation} from "react-router-dom";
import CMSLog from "./cms-log";
import CMSSidebar from "./cms-sidebar";

export const ChevronRight = (props) => {
  return (
    <svg
      width={6}
      height={10}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m1 1 4 4-4 4"
        stroke="#D7D7D7"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const CMSPage = () => {
  const [opacity, setOpacity] = useState(0);
  const scrollRef = useRef(null);
  const [infoData, setInfoData] = useContext(CmsContext).infoData;
  const [activeItemInColumn, setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const {path, setPath, pathItems, parsedPath, setPathItems, handleItemClick} = usePath();
  const [isDark] = useContext(ThemeContext).theme;
  const pathItemRef = useRef(null);
  const colContainerRef = useRef(null);
  const history = useHistory();
  const location = useLocation();

  const isLog = useMemo(() => {
    return location.pathname === '/cms/log';
  }, [location])

  const [open, setOpen] = useState(false);

  const scrollToEnd = () => {
    const instance = colContainerRef.current.osInstance();
    const instanceItem = pathItemRef.current.osInstance();

    if(instance) {
      instance.scroll({x: '100%'}, 450);
    }

    if(instanceItem) {
      instanceItem.scroll({x: '100%'}, 450);
    }
    // scrollRef.current.scrollTo({
    //   top: 0,
    //   left: scrollRef.current.scrollWidth,
    //   behavior: 'smooth'
    // });
  }

  useEffect(() => {
    // console.log('scrollRef.current - ', scrollRef.current);
    if(!colContainerRef.current || !pathItemRef.current) return;
    setTimeout(() => {
      scrollToEnd();
    }, 100);

    // setOpacity((colContainerRef.current.scrollWidth - colContainerRef.current.offsetWidth - colContainerRef.current.scrollLeft) / 100);
    // console.log('pathItems - ', pathItems);
  }, [pathItems, colContainerRef.current, pathItemRef.current])

  const handleScroll = (e) => {
    setOpacity((e.target.scrollWidth - e.target.offsetWidth - e.target.scrollLeft) / 100)
  }

  useEffect(() => {
    if(!activeItemInColumn) return;
    let itemsList = pathItems.find(c => c.id === activeItemInColumn.type);
    const pathIndex = path.findIndex(c => c.type === activeItemInColumn.type);
    if(!itemsList) return;
    const item = itemsList.items.find(c => c.id === activeItemInColumn.id);
    if(!item) {
      setActiveItemInColumn(null);
      return
    }
    handleItemClick(item.docData, item.id, item.typeof, item.fileType, item.skippable, item.headerData, pathIndex < 0 ? path.length : pathIndex, true, item.ref);
    setActiveItemInColumn(null);
  }, [activeItemInColumn, pathItems, path]);

  const getHeader = useCallback((type) => {
    let item = pathItems.find(c => c.id === type);
    if(!item) return null;
    return item.header
  }, [pathItems]);

  const handleAfterDeleteItem = useCallback((type, id) => {
    const itemObjIndex = pathItems.findIndex(c => c.id === type);
    if(itemObjIndex < 0) return;
    const itemObj = pathItems[itemObjIndex];
    let newItemArr = itemObj.items?.filter(c => c.id !== id);
    if(newItemArr.length === 0) {
      if(itemObjIndex === 0) return;
      const prevItem = pathItems[itemObjIndex - 1];
      // console.log('Active item in column - ', {id: prevItem.items[0].id, type: prevItem.id});
      setActiveItemInColumn({id: prevItem.items[0].id, type: prevItem.id});
      return;
    }
    setActiveItemInColumn({id: newItemArr[0].id, type: itemObj.id});
  }, [path, pathItems]);


  return (
    <div className="cms-page">
      <CMSSidebar path={path} pathItems={pathItems} />
      <section className={"cms-content" + (isLog ? ' log' : '')}>
        { !isLog ?
          <>
            <div className="cms-content-header">
              <div>
                <ArrowBackIcon onClick={() => history.push('/')} />
                <h2>Content Management System</h2>
              </div>
              <button onClick={() => {
                history.push('/cms/log');
              }}>
                <svg
                  height={17}
                  viewBox="0 0 56 60"
                  width={17}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 60h40a4 4 0 0 0 4-4V10.83a2.984 2.984 0 0 0-.255-1.2.459.459 0 0 0-.033-.062 2.975 2.975 0 0 0-.592-.861L47.294.88a2.975 2.975 0 0 0-.861-.592.459.459 0 0 0-.062-.033A2.984 2.984 0 0 0 45.17 0H12a4 4 0 0 0-4 4v28H2a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h6v2a4 4 0 0 0 4 4zM52.586 9H49.88A2.883 2.883 0 0 1 47 6.12V3.414zM10 4a2 2 0 0 1 2-2h33v4.12A4.885 4.885 0 0 0 49.88 11H54v45a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2v-2h24a2 2 0 0 0 2-2V34a2 2 0 0 0-2-2H10zM2 34h32v18H2z" />
                  <path d="M15 9h24a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM15 14h24a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM15 19h34a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM15 24h34a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM50 28a1 1 0 0 0-1-1H15a1 1 0 0 0 0 2h34a1 1 0 0 0 1-1zM49 32h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 37h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 42h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 47h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 52h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM17 49a4 4 0 0 0 4-4v-4a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4zm-2-8a2 2 0 1 1 4 0v4a2 2 0 1 1-4 0zM12 48a1 1 0 0 0-1-1H7v-9a1 1 0 0 0-2 0v9a2 2 0 0 0 2 2h4a1 1 0 0 0 1-1zM27 49a4 4 0 0 0 4-4v-1a1 1 0 0 0-1-1h-2a1 1 0 0 0 0 2h1a2 2 0 1 1-4 0v-4a2 2 0 0 1 3.887-.667 1 1 0 0 0 1.884-.666A4 4 0 0 0 23 41v4a4 4 0 0 0 4 4z" />
                </svg>
                <h4>Activity Log</h4>
              </button>
            </div>
            <div className="cms-content-section">
              <section className="cms-content-section-container">
                <div className="cms-content-section-container-scroll" style={{opacity}} />
                <OverlayScrollbarsComponent
                  ref={pathItemRef}
                  style={{
                    maxWidth: '100%',
                    // display: 'flex',
                    // flexDirection: 'column',
                    // alignItems: 'center'
                  }}
                  options={{
                    // scrollbars: { autoHide: "scroll" },
                    overflowBehavior : {
                      x : "scroll",
                      y : "hidden"
                    },
                    className       : "cms-content-section-path " + (isDark ? "os-theme-light" : "os-theme-dark"),
                    resize          : "none",
                    sizeAutoCapable : true,
                    paddingAbsolute : true,
                    scrollbars : {
                      clickScrolling : true,
                      autoHide: 'scroll'
                    },
                    nativeScrollbarsOverlaid : {
                      showNativeScrollbars   : false,
                      initialize             : true
                    },
                  }}
                >
                  {/*<div className="cms-content-section-path">*/}
                  <FolderCMSIcon />
                  {path.map((c, index) => c.name && (
                    <>
                      <ChevronRight />
                      <span onClick={() => {
                        setActiveItemInColumn({id: c.path, type: c.type});
                      }}>{c.name}</span>
                    </>
                  ))}
                  {/*</div>*/}
                </OverlayScrollbarsComponent>
                <OverlayScrollbarsComponent
                  ref={colContainerRef}
                  style={{
                    maxWidth: '100%',
                    // display: 'flex',
                    // flexDirection: 'column',
                    // alignItems: 'center'
                  }}
                  options={{
                    // scrollbars: { autoHide: "scroll" },
                    overflowBehavior : {
                      x : "scroll",
                      y : "hidden"
                    },
                    className       : "cms-content-main " + (isDark ? "os-theme-light" : "os-theme-dark"),
                    resize          : "none",
                    sizeAutoCapable : true,
                    paddingAbsolute : true,
                    scrollbars : {
                      clickScrolling : true,
                      autoHide: 'scroll'
                    },
                    nativeScrollbarsOverlaid : {
                      showNativeScrollbars   : false,
                      initialize             : true
                    },
                    callbacks: {
                      onScroll: handleScroll
                    }
                  }}
                >
                  <div />
                  {pathItems.map((pathItem, index) => {
                    return (
                      pathItem && (pathItem.loader ? <CmsCol loader /> : <CmsCol
                        type={path[index - 1]?.childType}
                        key={pathItem.header}
                        handleItemClick={(...c) => handleItemClick(...c, index)}
                        header={pathItem.header}
                        keys={parsedPath}
                        items={pathItem.items}
                        dirRef={pathItem.ref}
                        setPath={setPath}
                        path={path}
                      />)
                    )
                  })}
                </OverlayScrollbarsComponent>
                {/*<section className="cms-content-main" onScroll={handleScroll} ref={scrollRef}>*/}
                {/*  {pathItems.map((pathItem, index) => {*/}
                {/*    return (*/}
                {/*      pathItem && (pathItem.loader ? <CmsCol loader /> : <CmsCol*/}
                {/*        type={path[index - 1]?.childType}*/}
                {/*        key={pathItem.header}*/}
                {/*        handleItemClick={(...c) => handleItemClick(...c, index)}*/}
                {/*        header={pathItem.header}*/}
                {/*        keys={parsedPath}*/}
                {/*        items={pathItem.items}*/}
                {/*        setPath={setPath}*/}
                {/*        path={path}*/}
                {/*      />)*/}
                {/*    )*/}
                {/*  })}*/}
                {/*</section>*/}
              </section>
              <OverlayScrollbarsComponent
                // ref={colContainerRef}
                style={{
                  // maxWidth: '100%',
                  // display: 'flex',
                  // flexDirection: 'column',
                  // alignItems: 'center'
                }}
                options={{
                  // scrollbars: { autoHide: "scroll" },
                  overflowBehavior : {
                    x : "hidden",
                    y : "scroll"
                  },
                  className       : "cms-content-info " + (isDark ? "os-theme-light" : "os-theme-dark"),
                  resize          : "none",
                  sizeAutoCapable : true,
                  paddingAbsolute : true,
                  scrollbars : {
                    clickScrolling : true,
                    autoHide: 'scroll'
                  },
                  nativeScrollbarsOverlaid : {
                    showNativeScrollbars   : false,
                    initialize             : true
                  }
                }}
              >
                {/*<section className="cms-content-info">*/}
                {typeof infoData === 'object' && infoData && <CmsInfo handleAfterDeleteItem={handleAfterDeleteItem} header={getHeader(path.at(-1)?.type)} infoData={infoData} type={path.at(-1)?.type} keys={parsedPath}/>}
                {infoData === 'grade' && <CmsGradeForm allGrades={pathItems[0]?.items} />}
                {infoData === 'category' && <CmsCategoryForm allCategories={pathItems[2]?.items} keys={parsedPath} />}
                {infoData === 'subject' && <CmsSubjectForm allSubjects={pathItems[3]?.items} keys={parsedPath} />}
                {infoData === 'practice' && <CmsPracticeForm allPractices={pathItems[3]?.items} keys={parsedPath} />}
                {infoData === 'chapter' && <CmsChapterForm allChapters={parsedPath.subject_id === parsedPath.category_id ? pathItems[3]?.items : pathItems[4]?.items} keys={parsedPath} />}
                {infoData === 'tab' && <CmsTabForm allTabs={parsedPath.subject_id === parsedPath.category_id ? pathItems[4]?.items : pathItems[5]?.items} keys={parsedPath} />}
                {infoData === 'tip' && <CmsTipForm allTips={pathItems[3]?.items} keys={parsedPath} />}
                {infoData === 'lecture_item' && <CmsLectureItemForm allLectureItems={parsedPath.subject_id === parsedPath.category_id ? pathItems[5]?.items : pathItems[6]?.items} keys={parsedPath} path={path} />}
                {infoData === 'lecture_header_item' && <CmsLectureHeaderItemForm allLectureItems={parsedPath.subject_id === parsedPath.category_id ? pathItems[6]?.items : pathItems[7]?.items} keys={parsedPath} path={path} />}
                {infoData === 'exam_item' && <CmsExamItemForm allExamItems={pathItems[4]?.items} keys={parsedPath} path={path} />}
                {infoData === 'exam_header_item' && <CmsExamHeaderItemForm allExamItems={pathItems[5]?.items} keys={parsedPath} path={path} />}
                {/*</section>*/}
              </OverlayScrollbarsComponent>

            </div>
          </> : <CMSLog />
        }
      </section>
      <CmsModal open={open} setOpen={setOpen} />
    </div>
  )
}

export default CMSPage;
