import React, { useState, useEffect, useContext } from "react";
import { v1 as uuid } from "uuid";
import { FormControl, MenuItem, Select } from "@material-ui/core";

import {
  SectionHeaderLabel,
  CustomChip,
  ChipLoader,
} from "../../../components";

import { BookSessionContext, UserContext } from "../../../context";
import {
  getBlazeClassChapters as getClassChapters,
  getBlazeFilterData as getFilterData,
} from "../../../database";

import {
  PustackLogoSVG as GeneralIcon,
  MathsSelected as MathsIcon,
  Science as ScienceIcon,
  SSTSelected as SSTIcon,
  EnglishSelected as EnglishIcon,
} from "../../../assets";

export const CategorySelection = ({ isDark }) => {
  const [categories, setCategories] = useContext(BookSessionContext).categories;
  const [categorySelected, setCategorySelected] =
    useContext(BookSessionContext).categorySelected;
  const [skipSubjects, setSkipSubjects] =
    useContext(BookSessionContext).skipSubjects;
  const [chapterSelected, setChapterSelected] =
    useContext(BookSessionContext).chapterSelected;
  const [subjectSelected, setSubjectSelected] =
    useContext(BookSessionContext).subjectSelected;
  const [chaptersSelected, setChaptersSelected] =
    useContext(BookSessionContext).chaptersSelected;
  const [subjectsSelected, setSubjectsSelected] =
    useContext(BookSessionContext).subjectsSelected;
  const [currentUser] = useContext(UserContext).user;

  const [onBack] = useContext(BookSessionContext).onBack;
  const [onBackNext, setonBackNext] = useState(false);
  const [updating] = useContext(BookSessionContext).updating;

  const [subjects, setSubjects] = useContext(BookSessionContext).subjects;
  const [chapters, setChapters] = useContext(BookSessionContext).chapters;

  const [, setAllowNext] = useContext(BookSessionContext).allowNext;

  useEffect(() => {
    setCategories([]);
    setCategorySelected(null);
  }, [])

  const categoryIconGenerator = (name) => {
    switch (name) {
      case "Maths":
        return MathsIcon;

      case "Science":
        return ScienceIcon;

      case "SST":
        return SSTIcon;

      case "General":
        return GeneralIcon;

      case "English":
        return EnglishIcon;

      default:
        return null;
    }
  };

  useEffect(() => {
    if (!onBack || updating || onBackNext) {
      getSubjectArray();
      getChapterArray();
    }
    if (onBack) {
      getSubjectArray();
      getChapterArray();
    }

    // setAllowNext(false);
  }, [categorySelected]);

  useEffect(() => {
    if (!onBack || updating || onBackNext) {
      setChapterSelected("");
      getChapterArray();
    }
    if (onBack) {
      getSubjectArray();
      getChapterArray();
      setonBackNext(true);
    }
  }, [subjectSelected]);

  useEffect(() => {
    if (updating) {
      if (chaptersSelected) {
        setChapterSelected(chaptersSelected[0]);
      }
    }
  }, [chaptersSelected]);

  useEffect(() => {
    checkAllowNext();
  }, [chapterSelected, chaptersSelected]);

  useEffect(() => {
    getSetFilterData();
    getChapters();
  }, []);

  const checkAllowNext = (subject, category) => {
    const curCategory = category || categorySelected;
    const curSubject = subject || subjectSelected;
    const curChapter = chapterSelected;
    const chapterList = chaptersSelected;

    // Checking if the categoryList or the selectedCategory exists
    // If not, then the further validation is point less.
    if(!curCategory || !categories) return setAllowNext(false);

    // Checking for the chapter validation here
    function checkForTheChapters() {
      // If chapter list is not present or the selected Chapter is present, allowing the user
      if(!chapterList || curChapter) return setAllowNext(true);
      // else preventing the user to go forward
      return setAllowNext(false);
    }

    // Checking if the subjects (i.e, the subject list) does not exist OR
    // the selectedCategory is marked as skip_subjects to true
    if(!subjects || skipSubjects[categories.indexOf(curCategory)] >= 0) return checkForTheChapters();

    // Here on, the subjects should be selected cause the list is present and the skipping is not marked.
    // So, the chapter is mandatory
    // And allowing as per the validation
    if(!curSubject) return setAllowNext(false);
    return checkForTheChapters();

    // let curCategory = category ?? categorySelected;
    // if(!subject) subject = subjectSelected;
    // // for general don't check chapter exists and allownext
    // console.log('Checking allow next - ', curCategory, subject);
    // if (curCategory && subject && curCategory === "General") {
    //   setAllowNext(true);
    //   return;
    // }
    //
    // // first check if category selected
    // if (curCategory) {
    //   // check if subjects available
    //   if (categories.indexOf(`${curCategory}`) >= 0) {
    //     // subjects exists
    //     if (subject || chaptersSelected) {
    //       // check if chapter exists
    //       if(!chapters || chapters.length === 0) {
    //         setAllowNext(true);
    //       } else if (chaptersSelected && chaptersSelected[0]) {
    //         setAllowNext(chapterSelected ? true : false);
    //       } else {
    //         setAllowNext(false);
    //       }
    //     } else {
    //       if(!chapters || chapters.length === 0) {
    //         setAllowNext(true);
    //       } else {
    //         setAllowNext(false);
    //       }
    //     }
    //   } else {
    //     // check if chapter exists
    //     if (chaptersSelected) {
    //       if (chaptersSelected[0]) setAllowNext(chapterSelected ? true : false);
    //     } else {
    //       setAllowNext(true);
    //     }
    //   }
    // } else setAllowNext(false);
  };

  async function getSetFilterData() {
    let filter_data = await getFilterData(currentUser?.grade);
    if (filter_data) {
      // console.log('filter_data - ', filter_data);
      setSkipSubjects(filter_data.data().skip_subjects);
      setCategories(filter_data.data().categories);
      if (subjects) {
        setSubjects(filter_data.data().subjects);
      }
      if (subjectsSelected?.length === 0) {
        setSubjects(filter_data.data().subjects);
        setSubjectsSelected(filter_data.data().subjects.General);
      }
    }
  }

  async function getChapters() {
    let chapters = await getClassChapters(currentUser?.grade);
    setChapters(chapters);
  }

  function getSubjectArray() {
    if (categorySelected) {
      setSubjectsSelected(subjects[categorySelected]);
    }
  }

  function getChapterArray() {
    if (categorySelected && chapters) {
      if (subjectSelected) {
        setChaptersSelected(chapters[subjectSelected]);
      } else {
        setChaptersSelected(chapters[categorySelected]);
      }
    } else {
       setChaptersSelected(null);
    }
  }

  const handleChange = (event) => {
    setChapterSelected(event.target.value);
  };

  function onCategorieChipClick(categorie) {
    // before getting the subject array lets get rid of the subjectSelected Value
    setSubjectSelected("");

    //setSubjectSelected(categorie);
    setCategorySelected(categorie);
    checkAllowNext(null, categorie);
  }

  return (
    <div>
      <div className="askDoubtPopup__categoriePicker">
        <div style={{ marginBottom: "16px" }}>
          <SectionHeaderLabel label="Select Category:" isDark={isDark} />
        </div>
        <div className="askDoubtPopup__chips">
          {categories.length !== 0 ? (
            categories.map((category) => {
              return (
                <button
                  onClick={() => onCategorieChipClick(category)}
                  className="button"
                  key={category}
                >
                  <CustomChip
                    isDark={isDark}
                    leading={categoryIconGenerator(category)}
                    label={category}
                    isSelected={categorySelected === category}
                  />
                </button>
              )
            })
          ) : (
            <>
              <div>
                <ChipLoader /> <ChipLoader />
              </div>
            </>
          )}
        </div>
        {categorySelected &&
        !skipSubjects[categories.indexOf(`${categorySelected}`)] ? (
          <div
            style={{
              margin: "16px 0",
            }}
          >
            <SectionHeaderLabel label="Select Subject:" isDark={isDark} />
          </div>
        ) : (
          <></>
        )}
        <div className="askDoubtPopup__chips">
          {categorySelected &&
          !skipSubjects[categories.indexOf(`${categorySelected}`)] ? (
            subjectsSelected ? (
              subjectsSelected.map((subject) =>
                subject !== "Recommended" &&
                subject !== "My Doubts" &&
                subject !== "All" ? (
                  <button
                    onClick={() => {
                      setSubjectSelected(subject);
                      checkAllowNext(subject);
                    }}
                    className="button"
                    key={subject}
                  >
                    <CustomChip
                      isDark={isDark}
                      label={subject}
                      isSelected={subjectSelected === subject}
                    />
                  </button>
                ) : (
                  <></>
                )
              )
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
        </div>
        <div
          className="askDoubtPopup__bottom"
          style={{ display: categorySelected !== "General" ? "flex" : "none" }}
        >
          {categorySelected && chaptersSelected ? (
            <div style={{ marginBottom: "14px" }}>
              <SectionHeaderLabel label="Select Chapter:" isDark={isDark} />
            </div>
          ) : (
            <></>
          )}
          {categorySelected && chaptersSelected ? (
            <FormControl className="askDoubtPopup__formControl">
              <Select
                value={chapterSelected}
                onChange={handleChange}
                className="askDoubtPopup__select"
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem
                  className={isDark ? "select__menu__Item__dark" : ""}
                  value=""
                  disabled
                >
                  Please specify a chapter
                </MenuItem>
                {chaptersSelected.map((chapter, i) => (
                  <MenuItem
                    className={
                      isDark
                        ? `select__menu__Item__dark ${
                            i === chaptersSelected.length - 1
                              ? "last__Item"
                              : ""
                          }`
                        : ""
                    }
                    key={chapter}
                    value={chapter}
                  >
                    {chapter}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
