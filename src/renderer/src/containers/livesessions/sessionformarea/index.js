import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import "./style.scss";
import DateFnsUtils from "@date-io/date-fns";
import {SessionFormInput, SessionFormSelect} from "../../../components/livesessions/sessionform-input";
import {IntroContext, LiveSessionContext, ThemeContext, UserContext} from "../../../context";
import {DatePicker, MuiPickersUtilsProvider, TimePicker} from "@material-ui/pickers";
import TimerIcon from '@material-ui/icons/Timer';
import DateRangeIcon from '@material-ui/icons/DateRange';
import {getSubjectCodes} from "../../../database/home/fetcher";
import useForm, {Validators} from "../../../hooks/form";
import PdfImage from '../../../assets/blaze/pdf 2.svg';
import {useHistory} from "react-router-dom";
import {convertDateToHash, fetchSessionByIdAndGrade, Session} from "../../../database/livesessions/sessions";
import YouTube from "react-youtube";
import YoutubeIcon from "../../../assets/images/icons/youtube-icon.svg";
import {ChipLoader} from "../../../components";
import {showSnackbar} from "../../../helpers";
import circularProgress from "../../../assets/lottie/circularProgress.json";
import uploadingLottie from '../../../assets/lottie/uploading.json';
import waveLottie from '../../../assets/lottie/wave.json';
import waitingLottie from '../../../assets/lottie/waiting.json';
import successTickLottie from '../../../assets/lottie/success.json';
import Lottie from "lottie-react-web";
import useQuery from "../../../hooks/query/useQuery";
import {useMediaQuery} from "react-responsive";
import {Tooltip} from "@material-ui/core";
import {db} from "../../../firebase_config";
import {useIsMounted} from "../../../hooks/isMounted";
import useInstructors from "../../../hooks/instructors";

const tierItems = [
  {id: 1, label: 'Pro', value: 'Pro'},
  {id: 2, label: 'Free', value: 'Free'},
];

const defaultSessionLengths = [
  {id: 1, label: '60 min', value: 60},
  {id: 2, label: '90 min', value: 90},
  {id: 3, label: '120 min', value: 120},
  {id: 4, label: '180 min', value: 180},
]

function getPdfPageCount(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onloadend = function () {
      const count = reader.result.match(/\/Type[\s]*\/Page[^s]/g)?.length;
      res(count || null);
    }
    reader.onerror = function (e) {
      rej(e);
    };
  })
}

function hexToRGBAList(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  return [r,g,b,alpha];
}

function getColorGradient(start, end) {
  return {
    start: hexToRGBAList(start),
    end: hexToRGBAList(end)
  }
}

function getColorGradientForSubject(subjectName) {
  switch (subjectName.toLowerCase()) {
    case "maths":
      return getColorGradient("#fb8b23", "#ffdd00");
    case "physics":
      return getColorGradient("#ED82C1", "#F9C6D7");
    case "chemistry":
      return getColorGradient("#FF571F", "#FF8A5C");
    case "biology":
      return getColorGradient("#0AC2A6", "#51F6F0");
    case "history":
      return getColorGradient("#999CFF", "#99C3FF");
    case "civics":
      return getColorGradient("#85C445", "#c3db9f");
    case "geography":
      return getColorGradient("#FF7F5C", "#FFC5AD");
    case "economics":
      return getColorGradient("#EFBD81", "#F6E8A2");
    case "literature":
      return getColorGradient("#FF4B33", "#F78978");
    case "writing":
      return getColorGradient("#00B899", "#58E0BB");
    case "grammar":
      return getColorGradient("#DE85FF", "#F3C2FF");
    case "reading":
      return getColorGradient("#E9275B", "#F07F8C");
    default:
      return getColorGradient("#3b5998", "#000000");
  }
}

function SessionFormArea() {
  const history = useHistory();
  const query = useQuery();
  const [isDark] = useContext(ThemeContext).theme;
  const [user] = useContext(UserContext).user;
  const [date, handleDate] = useState(null);
  const [time, handleTime] = useState(null);
  const [availableGrades] = useContext(IntroContext).availableGrades;
  const [curSession] = useContext(LiveSessionContext).current;
  const [_, setRedirectState] = useContext(LiveSessionContext).redirectState;
  const [curSessionDetails] = useContext(LiveSessionContext).currentSessionDetails;
  const [curDateSessions] = useContext(LiveSessionContext).curDateSessions;
  const [categories, setCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [fetchingCategory, setFetchingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  // const [instructors, setInstructors] = useState(null);
  const instructors = useInstructors();
  const [fetchedSessionObj, setFetchedSessionObj] = useState(null);

  // Custom hooks
  const {register, form, handleChange} = useForm({
    session_name: ['', [Validators.req()]],
    instructor_name: ['', [Validators.req()]],
    access_tier: ['', [Validators.req()]],
    video_link: ['', [Validators.req()]],
    session_length: ['', [Validators.req()]],
    grade: ['', [Validators.req()]],
    chapter: ['', [Validators.req()]],
    instructor: [null, [Validators.req()]],
    video_length: [null, [Validators.req()]]
  });
  const isMounted = useIsMounted();

  const [fileData, setFileData] = useState(null);
  const [youtubeVideoId, setYoutubeId] = useState(null);
  const [showError, setShowError] = useState(false);

  function isFormValid() {
    console.log('form - ', form);
    if(form._invalid) return false;
    return !(!selectedCategory || !selectedSubject);
  }

  // status: {label, info}

  const handleSubmit = async () => {
    if(status) return;
    if (!isFormValid()) {
      showSnackbar('Please fill the form first.', 'error');
      return;
    }
    if(time.getHours() < 6) {
      showSnackbar('Session cannot be created prior to 6 AM', 'error');
      return;
    }
    setShowError(true);

    console.log('selectedSubject - ', selectedSubject);

    const gradient = getColorGradientForSubject(selectedSubject?.generic_name);

    const chapterObj = selectedSubject?.chapters.find(c => c.chapter_id === form.get('chapter').value);
    const gradeObj = availableGrades.find(c => c.grade_id === form.get('grade').value);
    const instructorInfo = instructors.find(c => c.id === form.get('instructor').value);

    const obj = {
      access_tier: form.get('access_tier').value,
      air_time: {
        ...convertDateToHash(date),
        ...convertDateToHash(time, {onlyTime: true})
      },
      category: {
        category_name: selectedCategory.category_name,
        id: selectedCategory.id,
        serial_order: selectedCategory.serial_order,
        skippable: selectedCategory.skippable
      },
      chapter: {
        id: chapterObj.chapter_id,
        chapter_name: chapterObj.chapter_name,
        chapter_number: chapterObj.chapter_number,
        serial_order: chapterObj.serial_order
      },
      created_at: convertDateToHash(new Date(), {both: true}),
      display_name: form.get('session_name').value,
      end_color_list: gradient.end,
      grade: {
        id: gradeObj.grade_id,
        grade_name: gradeObj.grade_name,
        serial_order: gradeObj.serial_order,
        grade_number: gradeObj.serial_order
      },
      instructor_name: form.get('instructor_name').value,
      session_length: form.get('session_length').value,
      created_by_employee_id: user.uid,
      // show_linked_chapter
      start_color_list: gradient.start,
      subject: {
        id: selectedSubject.subject_id,
        serial_order: selectedSubject.serial_order,
        subject_name: selectedSubject.subject_name
      },
      video_host: 'Youtube',
      instructor_info: {
        uid: instructorInfo.id,
        name: instructorInfo.label,
        profile_url: instructorInfo.image
      },
      video_key: 'https://youtu.be/' + youtubeVideoId,
      video_length: form.get('video_length').value
    }
    // Handle
    console.log(obj);

    try {
      if(fileData?.value && fileData.value instanceof File) {
        setStatus('uploading');
      } else if(doEdit && !doClone) {
        setStatus('editting');
      } else if (doClone && fileData?.value) {
        setStatus('cloning');
      } else {
        setProgress(100);
        setStatus('submitting');
      }
      let docId = null, toDeleteObj = null, cloneId = null;
      if(doEdit && !doClone) {
        docId = curSession.session_id;
        toDeleteObj = curSession.sessionObj;
      }
      if(doClone) {
        cloneId = {
          id: curSession.session_id,
          progressCB: function({progress}) {
            setProgress(progress);
          },
          completeCB: function() {
            setStatus('uploading');
          }
        };
      }
      // return;
      let oldObj = curSession;
      let moreDetails = {...curSession, ...curSessionDetails};
      if(gradeInUrl && sessionIdInUrl) {
        oldObj = curDateSessions.find(c => c.sessionObj.live_session_id === sessionIdInUrl);
        moreDetails = {
          session_id: fetchedSessionObj.obj.live_session_id,
          quiz_list: fetchedSessionObj.obj.quiz_list,
          air_time: fetchedSessionObj.obj.air_time,
        }
      }
      const sessionCRUD = Session(obj, fileData?.value, oldObj.sessionObj, moreDetails, ({progress, bytesTransferred, totalBytes}) => {
        setProgress(progress);
      }, () => {
        if(doEdit && !doClone) {
          setStatus('editting');
          return;
        }
        setStatus('submitting');
      });

      let sessionId;
      if(doEdit && !doClone) {
        sessionId = await sessionCRUD.editSession();
      } else if(doClone) {
        sessionId = await sessionCRUD.cloneSession(({progress}) => setProgress(progress), () => setStatus('uploading'));
      } else {
        sessionId = await sessionCRUD.createSession();
      }
      // const sessionId = await createSession(obj, fileData?.value, docId, toDeleteObj, {...curSession, ...curSessionDetails}, ({progress, bytesTransferred, totalBytes}) => {
      //   setProgress(progress);
      // }, () => {
      //   if(doEdit && !doClone) {
      //     setStatus('editting');
      //     return;
      //   }
      //   setStatus('submitting');
      // }, cloneId);


      // console.log('sessionId - ', sessionId);
      // if (fileData) {
      //   await uploadSessionNotes(fileData.value, sessionId, gradeObj.grade_id);
      // }
      setStatus('done');
      setTimeout(() => {
        const air_time = obj.air_time;
        history.push('/classes/' + sessionId);
        let state = {
          timelineDate: {...air_time, month: air_time.month - 1, date: air_time.day},
          clearDateSessionData: doEdit && !doClone ? {...curSession.sessionObj.air_time, month: curSession.sessionObj.air_time.month - 1, date: curSession.sessionObj.air_time.day} : null
        };
        setRedirectState(state);
      }, 2000);
      let message = 'Session created successfully.'
      if(doEdit && !doClone) {
        message = 'Session updated successfully.'
      }
      showSnackbar(message, 'success');
      // setIsSubmitting(false);
    } catch (e) {
      setStatus(null);
      showSnackbar(e.message, 'error');
      setIsSubmitting(false);
      setShowError(false);
    }

    // const url = await uploadSessionNotes(fileData.value, '11111111');
    // console.log(url);
  }

  const handleNoteChange = async (e) => {
    if(e.target.files.length === 0) return;
    const pdfFile = e.target.files[0];
    const pdfPageCount = await getPdfPageCount(pdfFile);

    let size = (pdfFile.size / (1000 * 1000)); // This size is in mb
    let unit = 'mb';

    if(size < 1) {
      size = pdfFile.size / 1000;
      unit = 'kb';
    }

    const obj = {
      value: pdfFile,
      pageCount: pdfPageCount,
      fileName: pdfFile.name,
      size: size.toFixed(2),
      sizeUnit: unit
    }
    setFileData(obj);
  }

  const handleYoutubeLink = (val) => {
    console.log('nice one')
    function youtube_parser(url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : false;
    }

    const id = youtube_parser(val);
    if (id) {
      setYoutubeId(id)
    } else {
      setYoutubeId(null);
      handleChange({target: {name: 'video_length', value: null}});
    }
  }

  const onReady = (e) => {
    handleChange({target: {name: 'video_length', value: e.target.getDuration()}});
  }

  const gradeItems = useMemo(() => {
    return availableGrades.map(c => ({
      id: c.serial_order,
      label: c.grade_name,
      value: c.grade_id
    })).sort((a, b) => a.id - b.id)
  }, [availableGrades]);

  const sessionLengthItems = useMemo(() => {
    if(!time) return;
    let endTime = new Date();
    endTime.setHours(24);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);
    let startTime = new Date();
    startTime.setHours(time.getHours());
    startTime.setMinutes(time.getMinutes());
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    let diff = Math.floor((endTime - startTime) / 60000);
    console.log('diff - ', diff, endTime, startTime);
    return defaultSessionLengths.reduce((acc, item) => {
      if(item.value <= diff) acc.push(item);
      return acc;
    }, []);
  }, [time]);

  const chapterItems = useMemo(() => {
    return selectedSubject?.chapters?.map(c => ({
      id: c.serial_order,
      label: c.chapter_name,
      value: c.chapter_id
    }))?.sort((a, b) => a.id - b.id) || null;
  }, [selectedSubject]);

  const onGradeChange = useCallback((grade) => {
    setFetchingCategory(true);
    return getSubjectCodes({grade})
      .then(c => {
        form.get('chapter') && form.get('chapter').patchValue(null);
        setSelectedCategory(null);
        setSelectedSubject(null);
        setCategories(c);
        setFetchingCategory(false);
        return c;
      })
  }, []);

  // const fetchInstructors = useCallback(async (startAt = 0, limit = 10) => {
  //   // let i = 0;
  //   // let id = setInterval(() => {
  //   //   i += 100;
  //   //   console.log(i);
  //   // }, 100)
  //   if(!user) return;
  //   const query = db.collection('users').where('is_instructor', '==', true);
  //   const instructorsList = [];
  //   const references = await query.get().then(snapshot => {
  //     let arr = [];
  //     snapshot.forEach((doc) => {
  //       arr.push(doc.ref.collection('meta').doc(doc.id).get());
  //     })
  //     return arr;
  //   });
  //   const documents = await Promise.all(references);
  //   console.log('documents - --  - -', references.length);
  //   for(let i = 0; i < documents.length; i++) {
  //     let document = documents[i];
  //     if(document.exists) {
  //       instructorsList.push({
  //         id: document.id,
  //         label: document.data().name,
  //         value: document.id,
  //         image: document.data().profile_url,
  //         role: document.data().role
  //       })
  //     }
  //   }
  //   // clearInterval(id);
  //   if(isMounted()) {
  //     setInstructors(instructorsList);
  //   }
  // }, [user]);

  // useEffect(() => {
  //   fetchInstructors(0, 10).then();
  // }, [fetchInstructors]);

  const handleCategoryClick = useCallback((categoryId, categoriesBeforeState) => {
    form.get('chapter') && form.get('chapter').patchValue(null);
    if (!categories && !categoriesBeforeState) return;
    let categoryList = categories;
    if(categoriesBeforeState) categoryList = categoriesBeforeState;
    let category = categoryList.find(c => c.id === categoryId);
    setSelectedSubject(null);
    if (!category) {
      setSelectedCategory(null);
      return null
    }
    setSelectedCategory(category);
    if (category._meta?.length === 1) {
      setSelectedSubject(category._meta[0]);
    }
    form.validate();
    return category;
  }, [categories, form]);

  const handleSubjectClick = useCallback((subjectId, categoryBeforeState) => {
    form.get('chapter') && form.get('chapter').patchValue(null);
    form.validate();
    if (!categoryBeforeState && (!categories || !selectedCategory || !selectedCategory._meta)) return;
    let category = categoryBeforeState ?? selectedCategory;
    let subject = category._meta.find(c => c.subject_id === subjectId);
    if (!subject) {
      setSelectedSubject(null);
      return
    }
    setSelectedSubject(subject);
  }, [categories, selectedCategory]);

  const resetForm = useCallback(() => {
    handleChange({target: {name: 'session_name', value: ''}});
    handleChange({target: {name: 'instructor_name', value: ''}});
    handleChange({target: {name: 'access_tier', value: null}});
    handleChange({target: {name: 'grade', value: null}});
    handleChange({target: {name: 'video_link', value: ''}});
    handleChange({target: {name: 'session_length', value: null}});
    setYoutubeId(null);
    handleDate(new Date());
    handleTime(new Date());
    setFileData(null);
    setCategories(null);
    setSelectedCategory(null)
    setSelectedSubject(null);
  }, [handleChange]);

  const doEdit = useMemo(() => {
    return query.get('edit') === 'true';
  }, [query]);
  
  const doClone = useMemo(() => {
    return query.get('duplicate') === 'true';
  }, [query]);

  const sessionIdInUrl = useMemo(() => {
    return query.get('sessionId');
  }, [query]);

  const gradeInUrl = useMemo(() => {
    return query.get('grade');
  }, [query]);

  useEffect(() => {
    if(!user || !instructors || instructors.length < 1) return;
    if(!doEdit) {
      handleChange({target: {name: 'instructor', value: user.uid}});
    }
  },[instructors, user, handleChange, doEdit])

  useEffect(() => {
    if(!sessionIdInUrl || !gradeInUrl) {
      handleDate(new Date());
      handleTime(new Date());
      return
    };
    fetchSessionByIdAndGrade(sessionIdInUrl, gradeInUrl, true)
      .then(sessionObj => {
        console.log('isMounted, sessionObj - ', isMounted(), sessionObj);
        if(isMounted() && sessionObj) {
          setFetchedSessionObj(sessionObj);
        }
      })
  }, [sessionIdInUrl, gradeInUrl]);

  useEffect(() => {
    if(!fetchedSessionObj) return;
    handleChange({target: {name: 'session_name', value:fetchedSessionObj.transformedObj.sessionObj.display_name}});
    handleChange({target: {name: 'instructor_name', value:fetchedSessionObj.transformedObj.sessionObj.instructor_name}});
    handleChange({target: {name: 'access_tier', value:fetchedSessionObj.transformedObj.tier}});
    handleChange({target: {name: 'grade', value:fetchedSessionObj.transformedObj.grade.id}});
    handleChange({target: {name: 'video_link', value:fetchedSessionObj.obj.video_key}});
    handleChange({target: {name: 'instructor', value: fetchedSessionObj.obj.instructor_info?.uid || null}});
    handleChange({target: {name: 'session_length', value:fetchedSessionObj.transformedObj.sessionObj.session_length}});
    handleYoutubeLink(fetchedSessionObj.obj.video_key);
    handleDate(fetchedSessionObj.transformedObj.start_ts);
    handleTime(fetchedSessionObj.transformedObj.start_ts);
    if(fetchedSessionObj.obj.notes_link) {
      setFileData({value:fetchedSessionObj.obj.notes_link});
    }
    onGradeChange(fetchedSessionObj.transformedObj.grade.id).then(c => {
      let category = handleCategoryClick(fetchedSessionObj.transformedObj.categoryId, c);
      handleSubjectClick(fetchedSessionObj.transformedObj.subjectId, category);
      handleChange({target: {name: 'chapter', value:fetchedSessionObj.transformedObj.chapterId}});
    })
  }, [fetchedSessionObj, handleChange])

  useEffect(() => {
    if(sessionIdInUrl && gradeInUrl) {
      return;
    }
    if(!doEdit) {
      resetForm();
      return;
    }
    // if(doFetchSession) {
      // const curSession = await fetchSession
    // }
    if(doEdit && gradeItems.length > 0 && curSession && curSessionDetails) {
      handleChange({target: {name: 'session_name', value: curSession.sessionObj.display_name}});
      handleChange({target: {name: 'instructor_name', value: curSession.sessionObj.instructor_name}});
      handleChange({target: {name: 'access_tier', value: curSession.tier}});
      handleChange({target: {name: 'grade', value: curSession.grade.id}});
      handleChange({target: {name: 'video_link', value: curSessionDetails.videokey}});
      handleChange({target: {name: 'session_length', value: curSession.sessionObj.session_length}});
      handleChange({target: {name: 'instructor', value: curSession.sessionObj.instructor_info?.uid || null}});
      handleYoutubeLink(curSessionDetails.videokey);
      handleDate(curSession.start_ts);
      handleTime(curSession.start_ts);
      if(curSessionDetails.notes) {
        setFileData({value: curSessionDetails.notes});
      }
      onGradeChange(curSession.grade.id).then(c => {
        let category = handleCategoryClick(curSession.categoryId, c);
        handleSubjectClick(curSession.subjectId, category);
        handleChange({target: {name: 'chapter', value: curSession.chapterId}});
      })

    }
  }, [doEdit, sessionIdInUrl, gradeInUrl, handleChange, gradeItems]);

  return (
    <div className={"session__form__area" + (isDark || isSmallScreen ? ' dark' : '')}>
      <div className="session__form__title">
        <h5>{doEdit && !doClone ? 'Edit' : 'Create'} Session</h5>
      </div>
      <div className="row">
        <div className="col-md-6">
          <SessionFormInput
            invalid={showError && form.errors['session_name']}
            placeholder="Session Name"
            {...register('session_name')}
          />
          <SessionFormInput
            invalid={showError && form.errors['instructor_name']}
            placeholder="Instructor's Name"
            {...register('instructor_name')}
          />
          <SessionFormSelect
            invalid={showError && form.errors['access_tier']}
            id={'select-session-access-tier'}
            placeholder="Session Access Tier"
            items={tierItems}
            {...register('access_tier')}
          />
          <SessionFormSelect
            invalid={showError && form.errors['instructor']}
            id={'select-assign-instructor'}
            placeholder="Assign Instructor"
            items={instructors}
            emptyLabel={"No Instructors"}
            {...register('instructor')}
          />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              label="Date&Time picker"
              value={date}
              // name={'air_date'}
              // onChange={handleDate}
              onChange={handleDate}
              format={"MMMM d, yyyy"}
              TextFieldComponent={(params) => {
                return (
                  <SessionFormInput
                    placeholder="Air Date"
                    ContainerProps={{
                      style: {
                        cursor: 'pointer'
                      }
                    }}
                    {...params}
                    SvgProps={{
                      onClick: params.onClick
                    }}
                    SvgIcon={<DateRangeIcon/>}
                  />
                )
              }}
            />
            <TimePicker
              label="Date&Time picker"
              value={time}
              // name={'air_time'}
              // onChange={handleDate}
              onChange={handleTime}
              format={"hh:mm aa"}
              TextFieldComponent={(params) => {
                return (
                  <SessionFormInput
                    placeholder="Air Time"
                    ContainerProps={{
                      style: {
                        cursor: 'pointer'
                      }
                    }}
                    {...params}
                    SvgProps={{
                      onClick: params.onClick
                    }}
                    SvgIcon={<TimerIcon/>}
                  />
                )
              }}
            />
          </MuiPickersUtilsProvider>
          <SessionFormInput
            invalid={showError && (!youtubeVideoId)}
            placeholder="Youtube Lecture Link"
            onTextChange={handleYoutubeLink}
            {...register('video_link')}
          />
          <div className="video__container">
            {!youtubeVideoId ? <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: isDark || isSmallScreen ? '#0c0c0c' : '#f2f2f2',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'center',
                position: 'absolute'
              }}>
                <img width={70} src={YoutubeIcon} style={{marginBottom: '9px', opacity: 0.5}} alt="youtube-icon"/>
              </div>:
              <YouTube
                videoId={youtubeVideoId || ''}
                id={'video-preview'}
                containerClassName={'video__wrapper'}
                onReady={onReady}
              />
            }
          </div>
        </div>
        <div className="col-md-6">
          <SessionFormSelect
            invalid={showError && form.errors['session_length']}
            id={'select-session-length'}
            placeholder="Session Length"
            items={sessionLengthItems}
            {...register('session_length')}
          />
          <SessionFormSelect
            invalid={showError && form.errors['grade']}
            id={'select-session-grade'}
            placeholder="Select Grade"
            items={gradeItems}
            {...register('grade')}
            onValueChange={onGradeChange}
          />
          {(categories || fetchingCategory) && (
            <>
              <div className="custom-chip-title">
                <p>Category <span style={{color: 'red'}}>*</span></p>
              </div>
              <div className="custom-chip-container">
                {fetchingCategory ? (
                  <>
                    <ChipLoader isDark={isSmallScreen} height={37} width={90} viewBox={"0 0 120 50"} />
                    <ChipLoader isDark={isSmallScreen} height={37} viewBox={"10 0 120 50"} />
                  </>
                ) : categories.map(category => (
                  <div key={category.id} className={'custom-chip'} onClick={() => handleCategoryClick(category.id)}>
                    <div
                      className={'customChip' + (isDark || isSmallScreen ? ' dark' : '') + (category.id === selectedCategory?.id ? " selected" : '')}
                    >
                      {category.category_name}
                    </div>
                  </div>
                ))}
              </div>
              {(selectedCategory && !fetchingCategory) && (
                <>
                  <div className="custom-chip-title">
                    <p>Subject <span style={{color: 'red'}}>*</span></p>
                  </div>
                  <div className="custom-chip-container">
                    {selectedCategory._meta?.map(subject => (
                      <div key={subject.subject_id} className={'custom-chip'}
                           onClick={() => handleSubjectClick(subject.subject_id)}>
                        <div
                          className={'customChip' + (isDark || isSmallScreen ? ' dark' : '') + (subject.subject_id === selectedSubject?.subject_id ? " selected" : '')}
                        >
                          {subject.subject_name}
                        </div>
                      </div>
                    )) || <p style={{color: '#727272', fontSize: '14px'}}>No Subjects to select here.</p>}
                  </div>
                </>
              )}
            </>
          )}
          {(selectedSubject && !fetchingCategory) && <SessionFormSelect
            id={'select-session-chapter'}
            placeholder="Select Chapter"
            invalid={showError && form.errors['chapter']}
            items={chapterItems || []}
            emptyLabel={"No Chapters"}
            {...register('chapter')}
          />}
          <div className="session__form__upload-btn">
            {fileData ? (
              <>
                <div className="session__form__upload-btn-flex-left session__form__upload-btn-info">
                  <img width={20} height={20} src={PdfImage} alt="Pdf Icon"/>
                  {fileData?.value instanceof File ? <>
                    <span className="session__form__upload-btn-info-filename">{fileData.fileName}</span>
                    <span>{fileData.size + ' ' + fileData.sizeUnit}</span>
                    {fileData.pageCount && <span>{fileData.pageCount} pages</span>}
                  </> : <>
                    <span className="session__form__upload-btn-info-filename" style={{maxWidth: '100%'}}>Attachment.pdf</span>
                  </>}
                </div>
                <div className="session__form__upload-btn-info-controls">
                  <Tooltip title="Delete Attachment" >
                    <svg style={{marginLeft: '10px'}} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                         xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                         viewBox="0 0 384 384" xmlSpace="preserve"
                         onClick={() => setFileData(null)}
                    >
                      <g>
                        <path
                          d="M64,341.333C64,364.907,83.093,384,106.667,384h170.667C300.907,384,320,364.907,320,341.333v-256H64V341.333z"/>
                        <polygon
                          points="266.667,21.333 245.333,0 138.667,0 117.333,21.333 42.667,21.333 42.667,64 341.333,64 341.333,21.333 			"/>
                      </g>
                    </svg>
                  </Tooltip>
                  <Tooltip title="Change Attachment" >
                    <div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', alignItems: 'center', position: 'relative', marginLeft: '10px'}}>
                      <input accept="application/pdf" type="file" onChange={handleNoteChange}/>
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                           viewBox="0 0 512.422 512.422" xmlSpace="preserve">
                        <g>
                          <path d="M41.053,223.464c2.667,1.067,5.76,1.067,8.427-0.213l83.307-37.867c5.333-2.56,7.573-8.96,5.013-14.293
                    c-2.453-5.12-8.533-7.467-13.76-5.12l-58.347,26.56c27.84-83.307,105.387-138.987,194.667-138.987
                    c93.547,0,175.36,62.507,198.933,152c1.493,5.653,7.36,9.067,13.013,7.573c5.653-1.493,9.067-7.36,7.573-13.013
                    c-26.027-98.773-116.267-167.893-219.52-167.893c-98.453,0-184.107,61.44-215.04,153.387l-24.533-61.333
                    c-1.813-5.547-7.893-8.64-13.44-6.827c-5.547,1.813-8.64,7.893-6.827,13.44c0.107,0.427,0.32,0.853,0.533,1.28l34.027,85.333
                    C36.146,220.158,38.279,222.398,41.053,223.464z"/>
                          <path d="M511.773,380.904c-0.107-0.213-0.213-0.427-0.213-0.64l-34.027-85.333c-1.067-2.667-3.2-4.907-5.973-5.973
                    c-2.667-1.067-5.76-0.96-8.427,0.213l-83.307,37.867c-5.44,2.24-8,8.533-5.76,13.973c2.24,5.44,8.533,8,13.973,5.76
                    c0.213-0.107,0.427-0.213,0.64-0.32l58.347-26.56c-28.053,83.307-105.707,138.987-194.88,138.987
                    c-93.547,0-175.36-62.507-198.933-152c-1.493-5.653-7.36-9.067-13.013-7.573c-5.653,1.493-9.067,7.36-7.573,13.013
                    c25.92,98.88,116.267,167.893,219.52,167.893c98.453,0,184-61.44,215.04-153.387l24.533,61.333
                    c2.027,5.547,8.107,8.427,13.653,6.4C510.919,392.531,513.799,386.451,511.773,380.904z"/>
                        </g>
                      </svg>
                    </div>
                  </Tooltip>
                </div>
              </>
              )
            : <>
              <input accept="application/pdf" type="file" onChange={handleNoteChange}/>
              <div className="session__form__upload-btn-flex" style={{width: '100%', height: '100%'}}>
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                     viewBox="0 0 286.036 286.036" xmlSpace="preserve">
                  <g>
                    <path style={{fill:'#39B29D'}} d="M231.641,113.009c-3.915-40.789-37.875-72.792-79.684-72.792c-32.351,0-60.053,19.201-72.819,46.752
                  c-3.844-1.225-7.849-2.056-12.095-2.056c-22.214,0-40.226,18.021-40.226,40.226c0,4.416,0.885,8.591,2.199,12.551
                  C11.737,147.765,0,166.26,0,187.696c0,32.092,26.013,58.105,58.105,58.105v0.018h160.896v-0.018
                  c37.044,0,67.035-30.009,67.035-67.044C286.036,146.075,262.615,118.927,231.641,113.009z M176.808,164.472h-15.912v35.864
                  c0,4.943-3.987,8.957-8.939,8.957h-17.878c-4.934,0-8.939-4.014-8.939-8.957v-35.864h-15.921c-9.708,0-13.668-6.481-8.823-14.383
                  l33.799-33.316c6.624-6.615,10.816-6.838,17.646,0l33.799,33.316C190.503,158,186.516,164.472,176.808,164.472z"/>
                  </g>
                </svg>
                <span>Upload Attachment</span>
              </div>
            </>}
          </div>
        </div>
      </div>
      <div className="row">
        <button className={"session__form__submit-btn" + (status === 'done' ? ' completed' : '')} disabled={!isFormValid()} onClick={handleSubmit}>
          <div className={"session__form__submit-btn__bg" + (status ? ' shrink' : '')}>
            {(status === 'uploading' || status === 'cloning') ? <Lottie
              style={{width: '40px'}}
              options={{animationData: uploadingLottie, loop: true}}
            /> : status === 'submitting' || status === 'editting' ? <Lottie
              style={{width: '40px'}}
              options={{animationData: waitingLottie, loop: true}}
            /> : status === 'done' ? <Lottie
              style={{width: '40px', transform: 'scale(2)'}}
              options={{animationData: successTickLottie, loop: false}}
            /> : null}
          </div>
          {isSubmitting ? <Lottie
              style={{width: '30px'}}
              options={{ animationData: circularProgress, loop: true }}
            /> :
            <span style={{position: 'relative', zIndex: 2, lineHeight: '32px', mixBlendMode: status ? 'exclusion' : 'normal'}}>{(status === 'uploading' || status === 'cloning') ? (status === 'cloning' ? 'Cloning - ' : 'Uploading - ') + progress.toFixed(0) + '%' : status === 'submitting' ? 'Creating session' : status === 'editting' ? 'Updating the session' : status === 'done' ? '' : doEdit && !doClone ? 'Update' : 'Create'}</span>}
          <div className="session__form__submit-btn__wave" style={{width: progress + '%'}}>
            <Lottie
              style={{
                width: '111px',
                height: '78px',
                overflow: 'hidden',
                transform: 'rotate(-90deg)',
                position: 'absolute',
                right: '-72px',
                top: '-20px',
              }}
              options={{ animationData: waveLottie, loop: true }}
            />
          </div>
        </button>
      </div>
    </div>
  )
}

export default SessionFormArea;
