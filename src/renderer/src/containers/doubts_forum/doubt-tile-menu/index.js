import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "@material-ui/core";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

import { CustomMenuItem } from "../../../components";
import { getFilterData, deleteDoubt } from "../../../database";

import {
  AskYourDoubtContext,
  SidebarContext,
  PostsContext,
  DoubtContext,
  UserContext,
} from "../../../context";

// -> helpers
import { showSnackbar } from "../../../helpers";

let scrollPosition = null;

export default function DoubtTileMenu({
  answerUserId,
  isAnswered,
  getdoubtId,
  category,
  subject,
  chapter,
  title,
  updateIsExpanded,
  defaultQuestionImages,
  getslug,
  askUserId,
  getIsAnswered,
}) {
  //------------------------------------ constants hooks
  const [user] = useContext(UserContext).user;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [anchorEl, setAnchorEl] = useState(null);
  const [, setOpen] = useContext(AskYourDoubtContext).open;
  const [, setChapterSelected] =
    useContext(AskYourDoubtContext).chapterSelected;
  const [, setSubjectSelected] =
    useContext(AskYourDoubtContext).subjectSelected;
  const [categorySelected, setCategorySelected] =
    useContext(AskYourDoubtContext).categorySelected;
  const [, setShowCategoriePicker] =
    useContext(AskYourDoubtContext).showCategoriePicker;
  const [, setSkipSubjects] = useContext(AskYourDoubtContext).skipSubjects;
  const [, setCategories] = useContext(AskYourDoubtContext).categories;
  const [subjects, setSubjects] = useContext(AskYourDoubtContext).subjects;

  const [, setSubjectsSelected] =
    useContext(AskYourDoubtContext).subjectsSelected;
  const [, setUpdating] = useContext(AskYourDoubtContext).updating;
  const [, setDoubtQuestion] = useContext(AskYourDoubtContext).doubtQuestion;
  const [, setUpdatedDoubtQuestion] =
    useContext(AskYourDoubtContext).updatedDoubtQuestion;
  const [, setSlug] = useContext(AskYourDoubtContext).slug;
  const [, setImages] = useContext(AskYourDoubtContext).images;
  const [doubtId, setDoubtId] = useContext(AskYourDoubtContext).doubtId;
  const [, setIsDoubtAnswered] =
    useContext(AskYourDoubtContext).isDoubtAnswered;

  const [posts, setPosts] = useContext(PostsContext);
  const [, setTopLevel] = useContext(SidebarContext).topLevel;
  const [, setIsAnswered] = useContext(SidebarContext).isAnswered;
  const [, setSelectedSubject] = useContext(SidebarContext).selectedSubject;
  const [, setSelectedChapter] = useContext(SidebarContext).selectedChapter;

  const [, setisInstructor] = useState(false);

  //------------------------------------
  // useEffect

  useEffect(() => {
    setisInstructor(localStorage.getItem("isInstructor"));
  });

  useEffect(() => {
    // run after getSetFilterData once subjects updates
    setSubjectsSelected(subjects[categorySelected]);
  }, [subjects]);

  const scrollListener = () => {
    if (scrollPosition !== null) {
      if (scrollPosition !== window.scrollY && anchorEl !== null) {
        setAnchorEl(null);
      }
    } else {
    }
  };

  useEffect(() => {
    if (anchorEl !== null) {
      scrollPosition = window.scrollY;
      document.addEventListener("scroll", scrollListener);
    } else {
      scrollPosition = null;
      document.removeEventListener("scroll", scrollListener);
    }
    // return document.removeEventListener("scroll", scrollListener);
  }, [anchorEl]);

  //----------------------------------- functions

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const [, setAnswering] = useContext(DoubtContext).answering;

  const handleClose = () => {
    setAnchorEl(null);
  };

  async function getSetFilterData(category) {
    let filter_data = await getFilterData(user.grade);
    setSkipSubjects(filter_data.data().skip_subjects);
    setCategories(filter_data.data().categories);
    setSubjects(filter_data.data().subjects);
  }

  const onEditAnswerClick = () => {
    handleClose();
    setAnswering(true);
    updateIsExpanded(true);
  };

  const onDeleteQuestionClick = () => {
    deleteDoubt(getdoubtId, user?.grade);

    if (posts) {
      let new_posts = posts;

      let filtered_posts = new_posts.filter((item) => item.id !== getdoubtId);
      console.info(`setPosts Called line:114 doubt-tile-menu filtered_posts`);
      setPosts(filtered_posts);
    }

    handleClose();
  };

  const onEditQuestionClick = () => {
    setCategorySelected(category);
    setSubjectSelected(subject);
    setChapterSelected(chapter);
    setImages(defaultQuestionImages);
    setDoubtId(getdoubtId);
    setIsDoubtAnswered(getIsAnswered);
    setShowCategoriePicker(false);
    setUpdating(true);
    setSlug(getslug);
    setDoubtQuestion(title);
    setUpdatedDoubtQuestion(title);
    getSetFilterData();
    if (doubtId) setDoubtId(doubtId);
    setOpen(true);
    handleClose();
  };

  const onReportButtonClick = () => {
    showSnackbar("Doubt Reported", "success");
    handleClose();
  };

  return (
    <div className="menu">
      <MoreHorizIcon onClick={handleClick} />
      {isInstructor ? (
        <div>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted={false}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {answerUserId === user.uid || !isAnswered ? (
              <CustomMenuItem
                onClickMenuItem={onEditQuestionClick}
                label="Edit Question"
              />
            ) : (
              <div></div>
            )}

            {askUserId === user.uid &&
              !isAnswered &&
              (posts.length - 1 > 0 ? (
                <CustomMenuItem
                  onClickMenuItem={onDeleteQuestionClick}
                  label="Delete Question"
                />
              ) : (
                <Link
                  to={`/doubts?toplevel=General&chapter=General&subject=General&answered=true`}
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  onClick={() => {
                    setTopLevel("General");
                    setSelectedSubject("General");
                    setSelectedChapter("General");
                    setIsAnswered(true);
                  }}
                >
                  <CustomMenuItem
                    onClickMenuItem={onDeleteQuestionClick}
                    label="Delete Question"
                  />
                </Link>
              ))}

            {answerUserId === user.uid && (
              <CustomMenuItem
                onClickMenuItem={onEditAnswerClick}
                label="Edit Answer"
              />
            )}
            <CustomMenuItem
              onClickMenuItem={onReportButtonClick}
              label="Report"
            />
          </Menu>
        </div>
      ) : (
        <div>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {askUserId === user.uid && !isAnswered ? (
              <CustomMenuItem
                onClickMenuItem={onEditQuestionClick}
                label="Edit Question"
              />
            ) : (
              <div></div>
            )}
            {askUserId === user.uid && !isAnswered ? (
              posts.length - 1 > 0 ? (
                <CustomMenuItem
                  onClickMenuItem={onDeleteQuestionClick}
                  label="Delete Question"
                />
              ) : (
                <Link
                  to={`/doubts?toplevel=General&chapter=General&subject=General&answered=true`}
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  onClick={() => {
                    setTopLevel("General");
                    setSelectedSubject("General");
                    setSelectedChapter("General");
                    setIsAnswered(true);
                  }}
                >
                  <CustomMenuItem
                    onClickMenuItem={onDeleteQuestionClick}
                    label="Delete Question"
                  />
                </Link>
              )
            ) : (
              <div></div>
            )}

            <CustomMenuItem
              onClickMenuItem={onReportButtonClick}
              label="Report"
            />
          </Menu>
        </div>
      )}
    </div>
  );
}
