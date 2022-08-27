import React, { useEffect, useContext, useState, useRef, useMemo } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { usePageVisibility } from "react-page-visibility";
import { Helmet } from "react-helmet";
import TopBarProgress from "react-topbar-progress-indicator";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import PdfPreview from "./../../components/newsfeed/pdf-preview/index";

import {
  ClassroomNavbar,
  ClassroomPlayer,
  ClassroomSidebar,
} from "../../components";
import {
  changeUserGrade,
  getLectureItemsForChapter,
  getUserDailyEngagement,
  userEngagementChapterData,
  userEngagementMapData,
} from "../../database";
import { ClassroomContext, UserContext } from "../../context";
import { proLogoDark } from "../../assets";

import "./style.scss";
import {AppValidate, getYoutubeID} from "../../helpers";
import useQuery from "../../hooks/query/useQuery";
import {db} from "../../firebase_config";
import axios from "axios";

TopBarProgress.config({
  barColors: {
    0: "#bb281b",
    "1.0": "#bb281b",
  },
  shadowBlur: 5,
});

const schemaMarkUp = {
  "@context": "https://schema.org",
  "@type": ["VideoObject", "LearningResource"],
  "name": "An introduction to Genetics",
  "description": "Explanation of the basics of Genetics for beginners.",
  "learningResourceType": "Concept Overview",
  "educationalLevel": "Grade 8 (US)",
  "contentUrl": "https://www.example.com/video/123/file.mp4",
  "thumbnailUrl": [
    "https://example.com/photos/1x1/photo.jpg",
    "https://example.com/photos/4x3/photo.jpg",
    "https://example.com/photos/16x9/photo.jpg"
  ],
  "uploadDate": "2016-03-31T08:00:00+08:00"
}

let id = 'class_10_learn_science_physics_lightreflectionrefraction_chapter_reflectionoflight';

let headerItemId = 'class_10_learn_science_physics_lightreflectionrefraction_chapter_refractionoflight_convexlensuses';

/**
 * grade = class_10
 * scope = learn
 * category = science
 * subject = physics
 * chapter = lightreflectionrefraction
 * tab = chapter
 * lecture_item = reflectionoflight
 * @returns {JSX.Element}
 * @constructor
 */

const getReferenceOfTheLectureItemById = async (id) => {
  let items = id.split('_');
  if(items[0] !== 'class') return null;
  const grade = items[0] + '_' + items[1];
  items = items.slice(2);
  let steps = ['scope', 'category', 'subject', 'chapter', 'tab', 'lecture_item', 'lecture_header_item'];
  let {ref, skippable} = await getReferenceOfTheChapterById(id);
  for(let i = 4; i < steps.length; i++) {
    let itemId = grade + '_' + items.slice(0, i+1).join('_');
    if(skippable) {
      itemId = grade + '_' + items.slice(0, i).join('_');
    }
    console.log('itemId = ', steps[i], itemId);
    ref = ref.collection(steps[i])
      .doc(itemId);
  }

  console.log('ref = ', ref);

  return ref;
}

const getReferenceOfTheChapterById = async (id) => {
  let items = id.split('_');
  if(items[0] !== 'class') return null;
  const grade = items[0] + '_' + items[1];
  items = items.slice(2);
  let steps = ['scope', 'category', 'subject', 'chapter', 'tab', 'lecture_item', 'lecture_header_item'];
  let ref = db.collection('cms_data')
    .doc(grade);

  let categoryRef = db.collection('cms_data')
    .doc(grade);

  for(let i = 0; i < 2; i++) {
    const itemId = grade + '_' + items.slice(0, i + 1).join('_');
    categoryRef = categoryRef.collection(steps[i])
      .doc(itemId);
  }

  let skippable = false;
  const snapshot = await categoryRef.get();
  if(!snapshot.exists) return;

  const data = snapshot.data();

  if(data.skippable) {
    skippable = true;
  }

  for(let i = 0; i < 4; i++) {
    let itemId = grade + '_' + items.slice(0, i + 1).join('_');
    if(skippable && i === 2) {
      itemId = grade + '_' + items.slice(0, 2).join('_');
    }
    if(skippable && i > 2) {
      itemId = grade + '_' + items.slice(0, i).join('_');
    }
    ref = ref.collection(steps[i])
      .doc(itemId);
  }
  return {ref, skippable};
}

const getYoutubeThumbnailUrls = (videoId) => {
  return [
    'https://img.youtube.com/vi/' + videoId + '/0.jpg',
    'https://img.youtube.com/vi/' + videoId + '/1.jpg',
    'https://img.youtube.com/vi/' + videoId + '/2.jpg',
    'https://img.youtube.com/vi/' + videoId + '/3.jpg',
  ]
}

export default function ClassroomScreen() {
  const location = useLocation();
  const history = useHistory();
  const search = useQuery();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isMobileScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const isTabletScreen = useMediaQuery({ query: "(max-width: 1367px)" });

  const [classroomVideoID, setClassRoomVideoID] =
    useContext(ClassroomContext).videoID;
  const [classroomTabsData, setClassroomTabsData] =
    useContext(ClassroomContext).tabsData;
  const [classroomData, setClassroomData] =
    useContext(ClassroomContext).classroomData;
  const [classroomSubject, setClassroomSubject] =
    useContext(ClassroomContext).classroomSubject;
  const [classroomChapter, setClassroomChapter] =
    useContext(ClassroomContext).classroomChapter;
  const [activeItem, setActiveItem] = useContext(ClassroomContext).activeItem;
  const [classroomNotes] = useContext(ClassroomContext).notesLink;
  const [isNotes, setIsNotes] = useContext(ClassroomContext).isNotes;
  const [nextItem, setNextItem] = useContext(ClassroomContext).nextItem;
  const [, setLectureItems] = useContext(ClassroomContext).lectureItems;
  const [activeTabId, setActiveTabId] = useContext(ClassroomContext).tabId;
  const [beaconBody, setBeaconBody] = useContext(ClassroomContext).beaconBody;
  const [activeTabIndex, setActiveTabIndex] =
    useContext(ClassroomContext).activeTabIndex;
  const [chapterEngagement, setChapterEngagement] =
    useContext(ClassroomContext).chapterEngagement;
  const [chapterEngagementMap, setChapterEngagementMap] =
    useContext(ClassroomContext).chapterEngagementMap;
  const [lastEngagement, setLastEngagement] =
    useContext(ClassroomContext).lastEngagement;
  const [playing, setPlaying] = useContext(ClassroomContext).playing;
  const [videoSeeking, setVideoSeeking] =
    useContext(ClassroomContext).videoSeeking;
  const [, setLectureTier] = useContext(ClassroomContext).lectureTier;
  const [completionStatusByChapter] =
    useContext(ClassroomContext).completionStatusByChapter;
  const [userLatestEngagement, setUserLatestEngagement] =
    useContext(ClassroomContext).userLatestEngagement;
  const [showOnlyLogo] = useContext(ClassroomContext).showOnlyLogo;
  const [user, setUser] = useContext(UserContext).user;
  const [isUserProTier] = useContext(UserContext).tier;
  const [videoId, setVideoId] = useState(null);

  const [lastActivityMap, setLastActivityMap] =
    useContext(ClassroomContext).lastActivityMap;
  const [userDailyEngagement, setUserDailyEngagement] = useState(null);
  const [dailyEngagementInside, setDailyEngagementInside] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  // const [lastElapsedTime, setLastElapsedTime] = useState(0);
  const [totalSpentTime, setTotalSpentTime] = useState(0);
  const [totalLecturesWatched, setTotalLecturesWatched] = useState(0);
  const [isLastEngagementSent, setIsLastEngagementSent] = useState(false);
  const [interval, setInter] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [elapsedPercentage, setElapsedPercentage] = useState(0);
  const [lectureItem, setLectureItem] = useState(null);
  const [chapterData, setChapterData] = useState(null);

  const [linkGrade, setLinkGrade] = useState(null);

  const beaconRef = useRef(beaconBody);

  const getClassName = (grade) => {
    const splitted = grade.split("_");

    return (
      splitted[0].charAt(0).toUpperCase() +
      splitted[0].slice(1) +
      " " +
      splitted[1]
    );
  };


  useEffect(() => {
    const itemId = search.get('item_id');

    if(!itemId) return;
    getReferenceOfTheLectureItemById(itemId)
      .then(ref => {
        getReferenceOfTheChapterById(itemId)
          .then(({ref: chapterRef, skippable}) => {
            if(!ref || !chapterRef) return;

            chapterRef.get()
              .then(chapterSnapshot => {
                console.log('chapterSnapshot - ', chapterSnapshot);
                if(!chapterSnapshot.exists) return;
                const chapterItem = chapterSnapshot.data();
                setChapterData(chapterItem);

                ref.get()
                  .then(async (snapshot) => {

                    if(!snapshot.exists) return;
                    const data = snapshot.data();

                    console.log('data - ', data, chapterItem);
                    setLectureItem(data);

                    const structuredDataText = {...schemaMarkUp};

                    let [_data, _tabs] = await getLectureItemsForChapter({
                      grade: data.grade_name.split(' ').join('_').toLowerCase(),
                      chapter_id: chapterRef.id,
                    });

                    setClassroomData(_data);
                    setClassroomTabsData(_tabs);

                    const youtubeUrl = data.youtube_url;
                    const youtubeId = getYoutubeID(youtubeUrl);

                    setVideoId(youtubeId);
                    setPlaying(true);

                    structuredDataText.contentUrl = 'https://www.youtube.com/watch?v=' + youtubeId;
                    structuredDataText.name = data.lecture_header_item_name ?? data.lecture_item_name;
                    structuredDataText.thumbnailUrl = getYoutubeThumbnailUrls(youtubeId);
                    structuredDataText.description = chapterItem.description;
                    structuredDataText.learningResourceType = 'Lecture';
                    structuredDataText.educationalLevel = data.grade_name;
                    structuredDataText.uploadDate = new Date(2018, 10, 10).toISOString();

                    const script = document.createElement('script');
                    script.setAttribute('type', 'application/ld+json');
                    script.textContent = JSON.stringify(structuredDataText);
                    document.head.appendChild(script);

                    const title = document.createElement('title');
                    title.textContent = `${data.lecture_header_item_name ? (data.lecture_header_item_name + ' | ' + data.lecture_item_name) : data.lecture_item_name} | ${data.chapter_name}`;
                    document.head.appendChild(title);

                    const metaTitle = document.createElement('meta');
                    metaTitle.setAttribute('name', 'title');
                    metaTitle.setAttribute('content', (data.lecture_header_item_name ? (data.lecture_header_item_name + ' | ' + data.lecture_item_name) : data.lecture_item_name) + '|' + (data.chapter_name));
                    document.head.appendChild(metaTitle);

                    const metaDesc = document.createElement('meta');
                    metaDesc.setAttribute('name', 'description');
                    metaDesc.setAttribute('content', chapterItem.description);
                    document.head.appendChild(metaDesc);
                  })
              })
          })
      })

  }, [search]);

  useEffect(() => {
    if(!user) return;
    let _currentURL = new URL(window.location.href);

    if (
      _currentURL.searchParams.has("subject") &&
      _currentURL.searchParams.has("chapter")
    ) {
      setClassroomSubject(_currentURL.searchParams.get("subject"));

      const _chapter = _currentURL.searchParams.get("chapter");
      setClassroomChapter(_chapter);

      const splitted = _chapter.split("_");

      const grade = {
        id: splitted[0] + "_" + splitted[1],
        name: getClassName(_chapter),
      };

      setLinkGrade(grade);
    } else if(
      _currentURL.searchParams.has("item_id")
    ) {
      const itemId = _currentURL.searchParams.get("item_id");
      const itemIdArr = itemId.split('_');
      setClassroomSubject(itemIdArr[4]);

      const _chapter = itemIdArr.slice(0, 6).join('_');
      setClassroomChapter(_chapter);

      const splitted = _chapter.split("_");

      const grade = {
        id: splitted[0] + "_" + splitted[1],
        name: getClassName(_chapter),
      };

      setLinkGrade(grade);
    } else {
      history.push("/");
    }
  }, [location, user]);

  useEffect(() => {
    window.addEventListener("pagehide", updateUserEngagmentonPageHide);

    // For unmounting component
    return () => {
      window.removeEventListener("pagehide", updateUserEngagmentonPageHide);
    };
  });

  useEffect(() => {
    return () => {
      setActiveItem(null);
      setNextItem(null);
      setActiveTabId(null);
      setActiveTabIndex(0);
      setClassRoomVideoID(null);
      setClassroomData(null);
      setLectureItems(null);
      setClassroomTabsData(null);
      setLastEngagement(null);
      setChapterEngagement(null);
      setElapsedTime(0);
      setElapsedPercentage(0);
      setIsLastEngagementSent(false);
      setUserDailyEngagement(null);
      setUserLatestEngagement(null);
      setLastActivityMap(null);
      setPlaying(false);
      setVideoSeeking(true);
    };
  }, []);

  const populateClassroomData = async () => {
    try {
      let [_data, _tabs] = await getLectureItemsForChapter({
        grade: user?.grade,
        subject: classroomSubject,
        chapter_id: classroomChapter,
      });

      setClassroomData(_data);
      setClassroomTabsData(_tabs);
    } catch (err) {
      console.log(err);
    }
  };

  const userEngagementChapterDataFn = async () => {
    const res = await userEngagementChapterData({
      userId: user?.uid,
      grade: user?.grade,
      chapter_id: classroomChapter,
    });

    setChapterEngagement(res);
  };

  const userEngagementMapDataFn = async () => {
    const res = await userEngagementMapData({
      userId: user?.uid,
      grade: user?.grade,
      chapter_id: classroomChapter,
    });

    setChapterEngagementMap(res);
  };

  const getUserDailyEngagementFn = async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const yearMonth = `${year}_${month}`;

    const res = await getUserDailyEngagement({
      grade: user?.grade,
      userId: user?.uid,
      yearMonth,
    });

    setUserDailyEngagement(res);
  };

  const containsObject = (obj, list) => {
    if (typeof list !== "undefined" && list !== null) {
      for (let i = 0; i < list.length; i++) {
        if (list[i]?.chapter_id === obj?.chapter_id) {
          return [true, i];
        }
      }
    }

    return [false, -1];
  };

  useEffect(() => {
    if(!user) return;
    if (classroomSubject !== null && classroomChapter !== null)
      populateClassroomData();

    userEngagementChapterDataFn();
    userEngagementMapDataFn();
    getUserDailyEngagementFn();
  }, [classroomSubject, classroomChapter, user?.grade, user]);

  const updateLectureEngagementElapsedTimeAfterThreshold = () => {
    if (elapsedPercentage < 22) {
      return chapterEngagementMap;
    }

    let lecEngageStat = {};
    let allLecturesEngagementStatus =
      chapterEngagementMap?.lecture_engagement_status;

    if (typeof allLecturesEngagementStatus !== "undefined") {
      if (activeItem?.parent === null) {
        lecEngageStat = allLecturesEngagementStatus[activeItem?.item];
      } else {
        lecEngageStat = allLecturesEngagementStatus[activeItem?.parent];
      }
    }

    if (activeItem?.parent === null) {
      lecEngageStat = {
        ...lecEngageStat,
        last_viewed_timestamp: elapsedTime,
        total_viewed_duration: playing
          ? lecEngageStat?.total_viewed_duration + 1
          : lecEngageStat?.total_viewed_duration,
      };
    } else {
      let headerItem = lecEngageStat?.header_item_status[activeItem?.item];
      lecEngageStat = {
        header_item_status: {
          ...lecEngageStat?.header_item_status,
          [activeItem?.item]: {
            completed_count: headerItem?.completed_count,
            is_completed: true,
            last_viewed_timestamp: elapsedTime,
            total_viewed_duration: playing
              ? headerItem?.total_viewed_duration + 1
              : headerItem?.total_viewed_duration,
            type: "header_video",
          },
        },
      };
    }

    const _chapterEngagementMap = {
      ...chapterEngagementMap,
      lecture_engagement_status: {
        ...chapterEngagementMap?.lecture_engagement_status,
        [activeItem?.parent === null ? activeItem?.item : activeItem?.parent]:
          lecEngageStat,
      },
    };

    return _chapterEngagementMap;
  };

  const updateDailyEngagementMap = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const date = new Date().getDate();
    const yearMonth = `${year}_${month}`;
    const yearMonthDate = `${year}_${month}_${date}`;

    const total_spent_time =
      userDailyEngagement !== null
        ? typeof userDailyEngagement?.daily_engagement !== "undefined"
          ? typeof userDailyEngagement?.daily_engagement[yearMonthDate] !==
            "undefined"
            ? userDailyEngagement?.daily_engagement[yearMonthDate]
                ?.total_spent_time + totalSpentTime
            : totalSpentTime
          : totalSpentTime
        : totalSpentTime;

    const total_watched_lecture_count =
      userDailyEngagement !== null
        ? typeof userDailyEngagement?.daily_engagement !== "undefined"
          ? typeof userDailyEngagement?.daily_engagement[yearMonthDate] !==
            "undefined"
            ? userDailyEngagement?.daily_engagement[yearMonthDate]
                .total_watched_lecture_count + totalLecturesWatched
            : totalLecturesWatched
          : totalLecturesWatched
        : totalLecturesWatched;

    let dailyEngagement = {
      [yearMonthDate]: {
        total_spent_time:
          elapsedPercentage > 20
            ? total_spent_time + elapsedTime
            : total_spent_time,
        total_watched_lecture_count,
      },
    };

    setDailyEngagementInside(dailyEngagement);

    return [dailyEngagement, yearMonth];
  };

  const updateDailyEngagementMapAfterThreshold = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const date = new Date().getDate();
    const yearMonth = `${year}_${month}`;
    const yearMonthDate = `${year}_${month}_${date}`;

    if (elapsedPercentage < 22) {
      return [dailyEngagementInside, yearMonth];
    }

    const total_spent_time =
      userDailyEngagement !== null
        ? typeof userDailyEngagement?.daily_engagement !== "undefined"
          ? typeof userDailyEngagement?.daily_engagement[yearMonthDate] !==
            "undefined"
            ? userDailyEngagement?.daily_engagement[yearMonthDate]
                ?.total_spent_time + 1
            : elapsedTime
          : elapsedTime
        : elapsedTime;

    const total_watched_lecture_count =
      userDailyEngagement !== null
        ? typeof userDailyEngagement?.daily_engagement !== "undefined"
          ? typeof userDailyEngagement?.daily_engagement[yearMonthDate] !==
            "undefined"
            ? userDailyEngagement?.daily_engagement[yearMonthDate]
                ?.total_watched_lecture_count
            : totalLecturesWatched
          : totalLecturesWatched
        : totalLecturesWatched;

    let dailyEngagement = {
      [yearMonthDate]: {
        total_spent_time:
          elapsedPercentage > 20
            ? total_spent_time + elapsedTime
            : total_spent_time,
        total_watched_lecture_count,
      },
    };

    return [dailyEngagement, yearMonth];
  };

  const updateUserEngagmentonPageHide = () => {
    if (beaconRef.current) {

      // Keys must present and are not null/undefined
      if(beaconRef.current.latestEngagement) {
        const requiredKeys = ['category_id', 'chapter_description', 'chapter_hex_color', 'chapter_id', 'chapter_illustration_art', 'chapter_name', 'completed_lecture_count', 'subject_id', 'total_lecture_count']
        const isValidObj = AppValidate.requiredAll(beaconRef.current.latestEngagement, requiredKeys);

        if(!isValidObj) {
          beaconRef.current.latestEngagement = null;
        }
      }

      const response = navigator.sendBeacon(
        "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserEngementData",
        JSON.stringify(beaconRef.current)
      );

      if (response) {
        setActiveItem(null);
        setNextItem(null);
        setActiveTabId(null);
        setActiveTabIndex(0);
        setClassRoomVideoID(null);
        setClassroomData(null);
        setLectureItems(null);
        setClassroomTabsData(null);
        setLastEngagement(null);
        setChapterEngagement(null);
        setElapsedTime(0);
        setElapsedPercentage(0);
        setIsLastEngagementSent(false);
      }
    }
  };

  const isVisible = usePageVisibility();

  useEffect(() => {
    if(!user) return;
    const _lastActivityMap = {
      header_item_id:
        lastEngagement?.lecture_header_item_index === -1
          ? null
          : activeItem?.item,
      item_id:
        lastEngagement?.lecture_header_item_index === -1
          ? activeItem?.item
          : activeItem?.parent,
      lecture_header_item_index: lastEngagement?.lecture_header_item_index,
      lecture_item_index: lastEngagement?.lecture_item_index,
      lecture_type: lastEngagement?.lecture_type,
      tab_index: lastEngagement?.tab_index,
    };

    setLastActivityMap(_lastActivityMap);

    let body = null;

    // Visiting chapter for first time

    let tab_completion_count = {};
    let tab_total_count = {};
    let restEngagementMapData = null;
    let completionStatusByChapter = null;

    // Triggers the cloud function when the tab is minimised or another tab is selected

    if (!isVisible && typeof _lastActivityMap?.header_item_id !== "undefined") {
      if (userLatestEngagement !== null) {
        let [dailyEngagement, yearMonth] = updateDailyEngagementMap();

        if (totalLecturesWatched > 0) {
          const _chapterEngagementMap = chapterEngagementMap;

          body = {
            lastActivityMap: _lastActivityMap,
            latestEngagement: userLatestEngagement,
            dailyEngagement: dailyEngagement,
            yearMonth: yearMonth,
            completionStatusByChapter:
              chapterEngagement?.completion_status_by_chapter,
            restEngagementMapData: _chapterEngagementMap,
            chapterId: classroomChapter,
            user: user,
            context: { auth: !!user?.uid },
          };
        } else {
          const meta = classroomData?._meta;

          if (typeof chapterEngagementMap === "undefined") {
            if (meta) {
              meta.map((item) => {
                tab_total_count[item?.tab_id] = getTotalLecturesCount(
                  item?.lecture_items
                );
              });

              meta.map((item) => {
                tab_completion_count[item?.tab_id] = 0;
              });
            }

            restEngagementMapData = {
              last_activity_map: _lastActivityMap,
              lecture_engagement_status: {},
              tab_completion_count,
              tab_total_count,
            };
          }

          if (
            typeof chapterEngagement?.completion_status_by_chapter ===
              "undefined" ||
            typeof chapterEngagement?.completion_status_by_chapter[
              classroomChapter
            ] === "undefined"
          ) {
            let totalCount = 0;

            if (meta) {
              meta.map((item) => {
                totalCount += getTotalLecturesCount(item?.lecture_items);
              });
            }
            completionStatusByChapter = {
              ...chapterEngagement?.completion_status_by_chapter,
              [classroomChapter]: {
                completed_lecture_count: 0,
                total_lecture_count: totalCount,
              },
            };
          }

          body = {
            lastActivityMap: _lastActivityMap,
            latestEngagement: userLatestEngagement,
            dailyEngagement: null,
            yearMonth: null,
            completionStatusByChapter: completionStatusByChapter,
            restEngagementMapData: restEngagementMapData,
            chapterId: classroomChapter,
            user: user,
            context: { auth: !!user?.uid },
          };
        }
        // Keys must present and are not null/undefined
        if(body.latestEngagement) {
          const requiredKeys = ['category_id', 'chapter_description', 'chapter_hex_color', 'chapter_id', 'chapter_illustration_art', 'chapter_name', 'completed_lecture_count', 'subject_id', 'total_lecture_count']
          const isValidObj = AppValidate.requiredAll(body.latestEngagement, requiredKeys);

          if(!isValidObj) {
            body.latestEngagement = null;
          }
        }

        navigator.sendBeacon(
          "https://us-central1-avian-display-193502.cloudfunctions.net/updateUserEngementData",
          JSON.stringify(body)
        );
      }
    }
  }, [lastEngagement, activeItem, isVisible, userLatestEngagement, user]);

  const getTotalLecturesCount = (lectureItems) => {
    let count = 0;
    lectureItems.map((item) => {
      if (item.lecture_header_items.length > 0)
        count += item.lecture_header_items.length;
      else count++;
    });

    return count;
  };

  // Counter
  function countUp() {
    setElapsedTime((elapsedTime) => elapsedTime + 1);
  }

  useEffect(() => {
    if (!playing || videoSeeking || classroomVideoID === null) {
      clearInterval(interval);
      setInter(null);
    } else if (playing) {
      let interval = setInterval(() => countUp(), 1000);
      setInter(interval);
    }
  }, [playing, videoSeeking, activeItem]);

  useEffect(() => {
    if (elapsedPercentage > 20) setTotalSpentTime(totalSpentTime + elapsedTime);
    setElapsedTime(0);
    setElapsedPercentage(0);
    setIsLastEngagementSent(false);
  }, [activeItem]);

  const getCompletedHeadersLength = (headers) => {
    let count = 0;
    for (let item in headers) {
      if (headers[item]?.is_completed) count++;
    }

    return count;
  };

  useEffect(() => {
    if(!user) return;
    if (classroomChapter) {
      updateUserLatestEngagement();
    }
  }, [classroomChapter, videoDuration, user]);

  useEffect(() => {
    if (videoDuration > 0)
      setElapsedPercentage((elapsedTime / videoDuration) * 100);

    let lecEngageStat = {};
    let tabCompletionCount = chapterEngagementMap?.tab_completion_count;
    let completedLecCount =
      chapterEngagement?.completion_status_by_chapter[classroomChapter]
        ?.completed_lecture_count;

    const meta = classroomData?._meta;
    let tab_total_count = {};
    let totalLecturesCount = 0;

    if (meta) {
      meta.map((item) => {
        totalLecturesCount += getTotalLecturesCount(item?.lecture_items);
        tab_total_count[item?.tab_id] = getTotalLecturesCount(
          item?.lecture_items
        );
      });
      if (typeof tabCompletionCount === "undefined") {
        tabCompletionCount = {};
        meta.map((item) => {
          tabCompletionCount[item?.tab_id] = 0;
        });
      }
    }

    if (elapsedPercentage > 20 && !isLastEngagementSent) {
      let allLecturesEngagementStatus =
        chapterEngagementMap?.lecture_engagement_status;

      if (typeof allLecturesEngagementStatus !== "undefined") {
        if (activeItem?.parent === null) {
          lecEngageStat = allLecturesEngagementStatus[activeItem?.item];
        } else {
          lecEngageStat = allLecturesEngagementStatus[activeItem?.parent];
        }
      } else {
        lecEngageStat = allLecturesEngagementStatus;
      }

      if (typeof completedLecCount === "undefined") completedLecCount = 0;

      if (typeof lecEngageStat === "undefined") {
        if (activeItem?.parent === null) {
          lecEngageStat = {
            completed_count: 1,
            is_completed: true,
            last_viewed_timestamp: elapsedTime,
            total_viewed_duration: elapsedTime,
            type: "video",
          };
        } else {
          lecEngageStat = {
            header_item_status: {
              [activeItem?.item]: {
                completed_count: 1,
                is_completed: true,
                last_viewed_timestamp: elapsedTime,
                total_viewed_duration: elapsedTime,
                type: "header_video",
              },
            },
            is_completed: false,
            type: "header",
          };
        }

        completedLecCount++;

        tabCompletionCount = {
          ...tabCompletionCount,
          [activeTabId]: tabCompletionCount[activeTabId] + 1,
        };
      } else {
        if (activeItem?.parent === null) {
          lecEngageStat = {
            ...lecEngageStat,
            completed_count: lecEngageStat?.completed_count + 1,
            is_completed: true,
            last_viewed_timestamp: elapsedTime,
            total_viewed_duration:
              lecEngageStat?.total_viewed_duration + elapsedTime,
          };
        } else {
          let headerItem = lecEngageStat?.header_item_status[activeItem?.item];

          if (typeof headerItem === "undefined") {
            lecEngageStat = {
              header_item_status: {
                ...lecEngageStat?.header_item_status,
                [activeItem?.item]: {
                  completed_count: 1,
                  is_completed: true,
                  last_viewed_timestamp: elapsedTime,
                  total_viewed_duration: elapsedTime,
                  type: "header_video",
                },
              },
              is_completed:
                1 +
                  getCompletedHeadersLength(
                    lecEngageStat?.header_item_status
                  ) >=
                classroomTabsData[activeTabIndex]?.lecture_items[
                  lastEngagement?.lecture_item_index
                ]?.lecture_header_items.length,
              type: "header",
            };

            tabCompletionCount = {
              ...tabCompletionCount,
              [activeTabId]: tabCompletionCount[activeTabId] + 1,
            };
            completedLecCount++;
          } else {
            lecEngageStat = {
              header_item_status: {
                ...lecEngageStat?.header_item_status,
                [activeItem?.item]: {
                  completed_count: headerItem?.completed_count + 1,
                  is_completed: true,
                  last_viewed_timestamp: elapsedTime,
                  total_viewed_duration:
                    headerItem?.total_viewed_duration + elapsedTime,
                  type: "header_video",
                },
              },
              is_completed:
                getCompletedHeadersLength(lecEngageStat?.header_item_status) >=
                classroomTabsData[activeTabIndex]?.lecture_items[
                  lastEngagement?.lecture_item_index
                ]?.lecture_header_items.length,
              type: "header",
            };
          }
        }
      }

      const _chapterCompletionStatus = {
        completion_status_by_chapter: {
          ...chapterEngagement?.completion_status_by_chapter,
          [classroomChapter]: {
            completed_lecture_count: !(completedLecCount || "")
              ? 1
              : completedLecCount,
            total_lecture_count: totalLecturesCount,
          },
        },
      };

      setTotalLecturesWatched(totalLecturesWatched + 1);

      setChapterEngagement(_chapterCompletionStatus);

      const _chapterEngagementMap = {
        ...chapterEngagementMap,
        last_activity_map: lastActivityMap,
        lecture_engagement_status:
          activeItem?.parent === null
            ? {
                ...chapterEngagementMap?.lecture_engagement_status,
                [activeItem?.item]: lecEngageStat,
              }
            : {
                ...chapterEngagementMap?.lecture_engagement_status,
                [activeItem?.parent]: lecEngageStat,
              },
        tab_completion_count: tabCompletionCount,
        tab_total_count: tab_total_count,
      };

      setChapterEngagementMap(_chapterEngagementMap);

      const _userLatestEngagement = userLatestEngagement;
      _userLatestEngagement[0].completed_lecture_count = !(
        completedLecCount || ""
      )
        ? 1
        : completedLecCount;

      setUserLatestEngagement(_userLatestEngagement);

      // setLastElapsedTime(elapsedTime);
      setIsLastEngagementSent(true);
    }
  }, [elapsedTime, videoDuration]);

  const updateUserLatestEngagement = () => {
    let _userLatestEngagement = userLatestEngagement;

    const chapter_id = classroomChapter;

    const category = chapter_id.split("_")[3];
    const subject = chapter_id.split("_")[4];

    let subject_id = `${user?.grade}_learn_${category}_${subject}`;
    if (category === "maths") subject_id = `${user?.grade}_learn_${category}`;

    const category_id = `${user?.grade}_learn_${category}`;
    const latestEngagementObject = {
      category_id: category_id,
      chapter_hex_color: classroomData?.hex_color,
      chapter_id: chapter_id,
      chapter_illustration_art: classroomData?.illustration_art,
      chapter_name: classroomData?.chapter_name,
      chapter_description: classroomData?.description,
      completed_lecture_count:
        typeof completionStatusByChapter?.completed_lecture_count ===
        "undefined"
          ? 0
          : completionStatusByChapter?.completed_lecture_count,
      subject_id: subject_id,
      total_lecture_count: classroomData?.lecture_item_count,
    };

    if (!(_userLatestEngagement || "")) {
      return setUserLatestEngagement([latestEngagementObject]);
    }

    const [containsLastEngagementObject, idx] = containsObject(
      latestEngagementObject,
      _userLatestEngagement
    );

    let newArr = [];
    if (!containsLastEngagementObject) {
      newArr = _userLatestEngagement;
      newArr.unshift(latestEngagementObject);
    } else {
      let obj = _userLatestEngagement[idx];

      newArr = [
        ..._userLatestEngagement.filter(
          (item) => item.chapter_id !== chapter_id
        ),
      ];

      newArr.unshift(obj);
    }
    setUserLatestEngagement(newArr.slice(0, 10));
  };

  useEffect(() => {
    if (autoPlay && (isUserProTier || nextItem?.tier === "basic")) {
      setActiveItem({
        parent: nextItem?.parent,
        item: nextItem?.item,
      });
      if (nextItem?.tier === "pro") {
        setLectureTier(true);
      } else {
        setLectureTier(false);
      }

      setLastEngagement({
        lecture_type: nextItem?.lectureType,
        lecture_header_item_index: nextItem?.headerItemIndex,
        lecture_item_index: nextItem?.itemIndex,
        tab_index: nextItem?.tabIndex,
      });

      setVideoSeeking(true);
      setPlaying(false);
      setAutoPlay(false);
    }

    if (!(isUserProTier || nextItem?.tier === "basic")) {
      setAutoPlay(false);
    }
  }, [autoPlay]);

  useMemo(() => {
    if(!user) return;
    let body = null;

    if ((userLatestEngagement || "") && (lastActivityMap || "")) {
      let tab_completion_count = {};
      let tab_total_count = {};
      let restEngagementMapData = null;
      let completionStatusByChapter = null;

      const meta = classroomData?._meta;
      if (typeof chapterEngagementMap === "undefined") {
        if (meta) {
          meta.map(
            (item) =>
              (tab_total_count[item?.tab_id] = getTotalLecturesCount(
                item?.lecture_items
              ))
          );

          meta.map((item) => (tab_completion_count[item?.tab_id] = 0));
        }

        restEngagementMapData = {
          last_activity_map: lastActivityMap,
          lecture_engagement_status: {},
          tab_completion_count,
          tab_total_count,
        };
      }

      if (
        typeof chapterEngagement?.completion_status_by_chapter ===
          "undefined" ||
        typeof chapterEngagement?.completion_status_by_chapter[
          classroomChapter
        ] === "undefined"
      ) {
        let totalCount = 0;

        if (meta) {
          meta.map((item) => {
            totalCount += getTotalLecturesCount(item?.lecture_items);
          });
        }
        completionStatusByChapter = {
          ...chapterEngagement?.completion_status_by_chapter,
          [classroomChapter]: {
            completed_lecture_count: 0,
            total_lecture_count: totalCount,
          },
        };
      }

      body = {
        latestEngagement: userLatestEngagement,
        lastActivityMap: lastActivityMap,
        dailyEngagement: null,
        yearMonth: null,
        completionStatusByChapter: completionStatusByChapter,
        restEngagementMapData: restEngagementMapData,
        chapterId: classroomChapter,
        user: user,
        context: { auth: !!user?.uid },
      };
      if (totalLecturesWatched > 0 || elapsedPercentage > 21) {
        const [dailyEngagement, yearMonth] =
          updateDailyEngagementMapAfterThreshold();
        setDailyEngagementInside(dailyEngagement);

        const _chapterEngagementMap =
          updateLectureEngagementElapsedTimeAfterThreshold();
        setChapterEngagementMap(_chapterEngagementMap);

        body = {
          latestEngagement: userLatestEngagement,
          lastActivityMap: lastActivityMap,
          dailyEngagement: dailyEngagement,
          yearMonth: yearMonth,
          completionStatusByChapter:
            chapterEngagement?.completion_status_by_chapter,
          restEngagementMapData: _chapterEngagementMap,
          chapterId: classroomChapter,
          user: user,
          context: { auth: !!user?.uid },
        };
      }
    }

    setBeaconBody(body);
    beaconRef.current = body;

    if (body) {
      localStorage.setItem("beaconBody", JSON.stringify(body));
    }
  }, [elapsedTime, lastActivityMap, user]);

  const handleGradeChange = async (grade) => {
    const prevGrade = user?.grade;

    const updatedUser = { ...user, grade };
    setUser(updatedUser);

    let res = await changeUserGrade(user?.uid, grade);
    if (res) {
      // window.location.reload();
    } else {
      const updatedUser = { ...user, grade: prevGrade };
      setUser(updatedUser);
    }
  };

  return (
    <div className="classroom__screen__wrapper">
      <div className="classroom__topbar">
        {videoSeeking && !showOnlyLogo && <TopBarProgress />}
      </div>
      {typeof classroomData?.chapter_name === "undefined" ? (
        <Helmet>
          <meta charSet="utf-8" />
        </Helmet>
      ) : (
        <Helmet>
          <meta charSet="utf-8" />
          <title>{classroomData?.chapter_name + " | PuStack"}</title>
        </Helmet>
      )}
      {!isMobileScreen && <ClassroomNavbar
        title={classroomData?.chapter_name}
        chapterID={classroomChapter}
      />}
      {(lectureItem && chapterData) && <>
        <meta name="keywords" content={lectureItem.generated_tags.join(', ')}/>
        <meta name="og:site_name" content="Pustack"/>
        <meta name="og:url" content={"https://www.youtube.com/embed/" + videoId}/>
        <meta name="og:title" content={lectureItem.lecture_header_item_name ?? lectureItem.lecture_item_name}/>
        <meta name="og:image" content={"https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg"}/>
        <meta name="og:image:width" content={"1280"}/>
        <meta name="og:image:height" content={"720"}/>
        <meta name="og:description"
              content={chapterData.description}/>
        <meta name="og:video:url" content={"https://www.youtube.com/embed/" + videoId}/>
        <meta name="og:video:secure_url" content={"https://www.youtube.com/embed/" + videoId}/>
        <meta name="og:video:type" content={"text/html"}/>
        <meta name="og:video:width" content={"1280"}/>
        <meta name="og:video:height" content={"720"}/>
        <link itemProp='url' href={"https://www.youtube.com/watch?v=" + videoId}/>
        <meta itemProp='name' content={lectureItem.lecture_header_item_name ?? lectureItem.lecture_item_name}/>
        <meta itemProp='description'
              content={chapterData.description}/>
        <meta itemProp='videoId' content={videoId}/>
        <meta itemProp='duration' content={'PT2M5S'}/>
        <link itemProp="thumbnailUrl" href={"https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg"}/>
        <link itemProp="embedUrl" href={"https://www.youtube.com/embed/" + videoId}/>
        <meta itemProp="playerType" content="HTML5 Flash"/>
        <span itemProp="thumbnail" itemScope="" itemType="http://schema.org/ImageObject">
            <link itemProp="url" href={"https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg"}/>
            <meta itemProp="width" content="1280"/>
            <meta itemProp="height" content="720"/>
          </span>
      </>}
      <div className="classroom__screen">
        <div className="classroom__content">
          <div className="back__library">
            <Link to="/">
              <ChevronLeftIcon /> <span>Back to Library</span>
            </Link>
          </div>
          {(classroomVideoID || videoId) ? (
            <>
              <ClassroomPlayer
                video_id={classroomVideoID ?? videoId}
                playing={playing}
                setPlaying={setPlaying}
                nextItem={nextItem}
                setActiveItem={setActiveItem}
                setLectureTier={setLectureTier}
                setVideoDuration={setVideoDuration}
                setLastEngagement={setLastEngagement}
                isUserProTier={isUserProTier}
                videoSeeking={videoSeeking}
                setVideoSeeking={setVideoSeeking}
                isSmallScreen={isSmallScreen}
                isTabletScreen={isTabletScreen}
                setAutoPlay={setAutoPlay}
                showOnlyLogo={showOnlyLogo}
                isLoggedOutUser={Boolean(user)}
              />
              <div className="classroom__breadcrumb">
                <h1>{lectureItem.lecture_header_item_name ? (lectureItem.lecture_header_item_name + ' | ' + lectureItem.lecture_item_name) : lectureItem.lecture_item_name } | {lectureItem.chapter_name}</h1>
                <p>{chapterData?.description ?? ''}</p>
              </div>
            </>
          ) : (
            <div className="classroom-player-wrapper">
              <div className="classroom__video__seeking other__grade">
                <div className="classroom__no__video">
                  <img
                    src={proLogoDark}
                    alt={(lectureItem?.lecture_header_item_name ? (lectureItem.lecture_header_item_name + ' | ' + lectureItem.lecture_item_name) : lectureItem?.lecture_item_name) || 'Pustack Lecture'}
                    className="no__video"
                    draggable={false}
                  />
                  {(user && user?.grade !== linkGrade?.id) && (
                    <div className="different__grade">
                      <h4>This content is from {linkGrade?.name}.</h4>
                      <h5>
                        Do you wish to change your grade from{" "}
                        <span>{getClassName(user?.grade)}</span> to{" "}
                        <span>{linkGrade?.name}</span> ?
                      </h5>
                      <div>
                        <button
                          className="yes__btn"
                          onClick={() => handleGradeChange(linkGrade?.id)}
                        >
                          Yes
                        </button>
                        <button
                          className="no__btn"
                          onClick={() => (window.location = "/")}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <ClassroomSidebar
          subject={classroomSubject}
          chapterID={classroomChapter}
          setVideoSeeking={setVideoSeeking}
          videoSeeking={videoSeeking}
          isLoggedOutUser={!user}
        />

        {isNotes && (
          <PdfPreview
            pdf={classroomNotes}
            onClose={() => {
              setIsNotes(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
