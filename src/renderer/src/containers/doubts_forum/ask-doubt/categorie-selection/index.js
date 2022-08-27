import React, { useState, useEffect, useContext } from "react";
import { v1 as uuid } from "uuid";
import { FormControl, MenuItem, Select } from "@material-ui/core";

// -> components
import {
  SectionHeaderLabel,
  CustomChip,
  ChipLoader,
} from "../../../../components";

import {
  PustackLogoSVG as GeneralIcon,
  MathsSelected as MathsIcon,
  Science as ScienceIcon,
  SSTSelected as SSTIcon,
  EnglishSelected as EnglishIcon,
} from "../../../../assets";

// -> context
import { AskYourDoubtContext, UserContext } from "../../../../context";
import { getFilterData, getClassChapters } from "../../../../database";

export const CategorySelection = ({ isDark }) => {
  //------------------------------------ constants hooks

  const [categories, setCategories] =
    useContext(AskYourDoubtContext).categories;
  const [user] = useContext(UserContext).user;
  const [categorySelected, setCategorySelected] =
    useContext(AskYourDoubtContext).categorySelected;
  const [skipSubjects, setSkipSubjects] =
    useContext(AskYourDoubtContext).skipSubjects;
  const [chapterSelected, setChapterSelected] =
    useContext(AskYourDoubtContext).chapterSelected;
  const [subjectSelected, setSubjectSelected] =
    useContext(AskYourDoubtContext).subjectSelected;
  const [chaptersSelected, setChaptersSelected] =
    useContext(AskYourDoubtContext).chaptersSelected;
  const [subjectsSelected, setSubjectsSelected] =
    useContext(AskYourDoubtContext).subjectsSelected;

  const [onBack] = useContext(AskYourDoubtContext).onBack;
  const [onBackNext, setonBackNext] = useState(false);
  const [updating] = useContext(AskYourDoubtContext).updating;

  const [subjects, setSubjects] = useContext(AskYourDoubtContext).subjects;
  const [chapters, setChapters] = useContext(AskYourDoubtContext).chapters;

  const [, setAllowNext] = useContext(AskYourDoubtContext).allowNext;

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

  //------------------------------------ useEffect

  useEffect(() => {
    // setSelectedSubject(categorie);
    if (!onBack || updating || onBackNext) {
      getSubjectArray();
      getChapterArray();
    }
    if (onBack) {
      getSubjectArray();
      getChapterArray();
    }
  }, [categorySelected]);

  useEffect(() => {
    if (!onBack || onBackNext) {
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
    checkAllowNext();
  }, [chapterSelected]);

  useEffect(() => {
    getSetFilterData();
    getChapters();
  }, []);

  //------------------------------------ functions

  const checkAllowNext = () => {
    // for general don't check chapter exists and allownext
    if (categorySelected && subjectSelected && categorySelected === "General") {
    
      setAllowNext(true);
      return;
    }

    // first check if category selected
    if (categorySelected) {
      // check if subjects available
      if (categories.indexOf(`${categorySelected}`)) {
        // subjects exists
        if (subjectSelected || chaptersSelected) {
          // check if chapter exists
          if (chaptersSelected) {
            setAllowNext(chapterSelected ? true : false);
          } else {
            setAllowNext(false);
          }
        } else {
          setAllowNext(false);
        }
      } else {
        // check if chapter exists
        if (chaptersSelected) {
          if (chaptersSelected[0]) setAllowNext(chapterSelected ? true : false);
        } else {
          setAllowNext(true);
        }
      }
    } else {
      // don't allow
      setAllowNext(false);
    }
  };

  async function getSetFilterData() {
    let filter_data = await getFilterData(user.grade);
    if (filter_data) {
      setSkipSubjects(filter_data.data().skip_subjects);
      setCategories(filter_data.data().categories);
      if (subjects) {
        setSubjects(filter_data.data().subjects);
      }
      if (!subjectsSelected) {
        setSubjects(filter_data.data().subjects);
        setSubjectsSelected(filter_data.data().subjects.General);
      }
    }

    // getChapterArray();
  }

  async function getChapters() {
    let chapters = await getClassChapters(user.grade);
    setChapters(chapters);
  }

  function onSubjectChipClick(subject) {
    setSubjectSelected(subject);
  }

  function getSubjectArray() {
    if (categorySelected) {
      setSubjectsSelected(subjects[categorySelected]);
    }
  }

  function getChapterArray() {
    if (categorySelected) {
      if (subjectSelected) {
        setChaptersSelected(chapters[subjectSelected]);
      } else {
        setChaptersSelected(chapters[categorySelected]);
      }
    }
  }

  const handleChange = (chapter) => {
    setChapterSelected(chapter.target.value);
  };

  function onCategorieChipClick(category) {
    checkAllowNext();
    // before getting the subject array lets get rid of the subjectSelected Value
    setSubjectSelected("");

    //setSubjectSelected(categorie);
    setCategorySelected(category);
  }
  //------------------------------------ rendering JSX

  return (
    <div>
      <div className="askDoubtPopup__categoriePicker">
        <div style={{ marginBottom: "14px" }}>
          <SectionHeaderLabel label="Select Category:" isDark={isDark} />
        </div>
        <div className="askDoubtPopup__chips">
          {categories.length !== 0 ? (
            categories.map((category) => (
              <button
                onClick={() => onCategorieChipClick(category)}
                className="button"
                key={uuid()}
              >
                <CustomChip
                  label={category}
                  isSelected={categorySelected === category}
                  isDark={isDark}
                  leading={categoryIconGenerator(category)}
                />
              </button>
            ))
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
          <div style={{ margin: "14px 0" }}>
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
                      checkAllowNext();
                    }}
                    className="button"
                    key={uuid()}
                  >
                    <CustomChip
                      label={
                        subject.length > 15
                          ? subject.substring(0, 13) + ".."
                          : subject
                      }
                      isSelected={subjectSelected === subject}
                      isDark={isDark}
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
            <FormControl
              className={
                isDark
                  ? "askDoubtPopup__formControl__dark"
                  : "askDoubtPopup__formControl"
              }
            >
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
                {chaptersSelected?.map((chapter, i) => (
                  <MenuItem
                    className={
                      isDark
                        ? `select__menu__Item__dark ${
                            i === chaptersSelected?.length - 1
                              ? "last__Item"
                              : ""
                          }`
                        : ""
                    }
                    key={uuid()}
                    value={chapter.chapter_name}
                  >
                    {chapter.chapter_name}
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
