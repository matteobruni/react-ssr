import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InfoOutlined} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import {fetchIndianTime, showSnackbar} from "../../../../helpers";
import {db, storage} from "../../../../firebase_config";
import {Tooltip} from "@material-ui/core";
import useForm, {Validators} from "../../../../hooks/form";
import PdfImage from "../../../../assets/blaze/pdf 2.svg";
import PustackUploadButton from "../../../../components/global/pustack-upload-btn";
import firebase from "firebase";
import Lottie from "lottie-react-web";
import uploadingLottie from "../../../../assets/lottie/uploading.json";
import successTickLottie from "../../../../assets/lottie/success.json";
import circularProgress from "../../../../assets/lottie/circularProgress.json";
import waveLottie from "../../../../assets/lottie/wave.json";
import PustackTabButton from "../../../../components/global/pustack-tab-btn";
import {tierItems} from "../cms-tip-form";
import TagItem from "../../../../components/cms/tag-item";
import {baseUrl} from "../../../../database/agora/config";
import axios from "axios";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {useOverlayLoader} from "../../../../hooks/overlayLoader";
import {URL_REGEX} from "../../cms-info";
import {joinToId, sanitizeId} from "../cms-category-form";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import {uploadImage} from "../cms-chapter-form";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";



const normalizeText = (str) => str.replaceAll(' ', '').toLowerCase();
export const URL_VALIDATORS = [Validators.req(), Validators.test(URL_REGEX)];

export default function CmsLectureBaseForm({allLectureItems, keys, path, isLectureHeaderItem, lectureTypeItems: typeItems}) {
  const formRef = useRef(null);
  const [resetIndex, setResetIndex] = useState(0);
  // const [loading, setLoading] = useOverlayLoader(false);
  const [status, setStatus] = useState(null);
  const [tagImage, setTagImage] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [user] = useContext(UserContext).user;
  const [progress, setProgress] = useState(0);
  const [includeHeader, setIncludeHeader] = useState(() => !isLectureHeaderItem);
  const [manualTagItems, setManualTagItems] = useState([]);
  const [activeTierIndex, setActiveTierIndex] = useState(1);
  const [activeTypeIndex, setActiveTypeIndex] = useState(1);
  const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const {form, errors, register, handleChangeValue} = useForm({
    lecture_item_name: ['', [Validators.req()]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
    generic_url: ['', URL_VALIDATORS],
    youtube_url: ['', URL_VALIDATORS],
  })
  const {handleSubmit, loading} = useSubmitCMS();

  const [lectureTypeItems, setLectureTypeItems] = useState([{id: 1, value: 'video'}, {id: 2, value: 'note'}, {id: 3, value: 'header'}]);

  useEffect(() => {
    if(!includeHeader) return setLectureTypeItems(typeItems.filter(c => c.value !== 'header'));
    setLectureTypeItems(typeItems);
  }, [includeHeader]);

  const typeKey = useMemo(() => isLectureHeaderItem ? 'lecture_header_item_type' : 'lecture_item_type', [isLectureHeaderItem]);
  const nameKey = useMemo(() => isLectureHeaderItem ? 'lecture_header_item_name' : 'lecture_item_name', [isLectureHeaderItem]);
  const type = useMemo(() => !isLectureHeaderItem ? 'lecture_item' : 'lecture_header_item', [isLectureHeaderItem])

  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;
  
  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate
  }, [editFormData]);

  useEffect(() => {
    if(!editFormData) {
      form.reset();
      setIncludeHeader(!isLectureHeaderItem);
      setAttachment(null);
      setManualTagItems([]);
      setActiveTierIndex(1);
      return
    }
    handleChangeValue('lecture_item_name', editFormData[nameKey]);
    handleChangeValue('serial_order', +editFormData.serial_order);
    handleChangeValue('generic_url', editFormData.generic_url);
    handleChangeValue('youtube_url', editFormData.youtube_url);
    setAttachment(editFormData.notes_link);
    setTagImage(editFormData.tag_images);
    setManualTagItems(editFormData.manual_tags);
    setActiveTierIndex(tierItems.find(c => c.value === editFormData.tier).id);

    if(editFormData[typeKey] === 'header') setLectureTypeItems(typeItems.filter(c => c.value === 'header'));
    else setIncludeHeader(false);

    setActiveTypeIndex(lectureTypeItems.find(c => c.value === editFormData[typeKey]).id);
    // setTagImage(editFormData.pdf_attachment);

  }, [editFormData, handleChangeValue])

  const isUniqueLectureItem = (id, lectureItemName, serialOrder) => {
    return allLectureItems.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== lectureItemName.trim()) || c.id === id;
      }
      return c.generic_name !== lectureItemName.trim() && c.serial_order !== +serialOrder && c.id !== id
    })
  }

  const handleChangeType = (typeIndex) => {
    // If the active Type is 'video' [0]
    if(typeIndex !== 1) {
      form.removeControl('generic_url');
      form.removeControl('youtube_url');
    }
    if(typeIndex === 1 && !form.controls['generic_url']) {
      form.registerControl('generic_url', [editFormData ? editFormData.generic_url : '', URL_VALIDATORS]);
      form.registerControl('youtube_url', [editFormData ? editFormData.youtube_url : '', URL_VALIDATORS]);
    }
    form.validate();
    // If the active Type is 'note' [1]
    // If the active Type is 'header' [2]
  }

  useEffect(() => {
    handleChangeType(activeTypeIndex);
  }, [activeTypeIndex]);

  const itemPath = (itemId) => {
    const arr = [
      'cms_data',
      keys.grade_id,
      'scope',
      keys.scope_id,
      'category',
      keys.category_id,
      'subject',
      keys.subject_id,
      'chapter',
      keys.chapter_id,
      'tab',
      keys.tab_id,
      'lecture_item'
    ];

    if(isLectureHeaderItem) {
      arr.push(keys.lecture_item_id, 'lecture_header_item', itemId);
    } else {
      arr.push(itemId);
    }
    return arr;
  }

  const getImagePath = (lectureItemId, fileName) => {
    return [
      ...itemPath(lectureItemId),
      fileName
    ].join('/')
  }

  const isFormValid = () => {
    console.log('form - ', form);
    return !(form._invalid || (activeTypeIndex === 2 ? !attachment : false));
  }

  const resetForm = () => {
    form.reset();
    // Will be responsible for resetting the files
    setResetIndex(c => c+1);
    setEditFormData(null);
  }

  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allLectureItems,
      isFormValid: isFormValid,
      header: isLectureHeaderItem ? 'Lecture Header Item' : 'Lecture Item',
      type: type,
      resetForm: resetForm,
      getMetaData: function() {
        const name = form.get('lecture_item_name').value;
        const serialOrder = +form.get('serial_order').value;

        let startId = keys.tab_id;
        if(isLectureHeaderItem) {
          startId = keys.lecture_item_id;
        }

        let id;

        if(isEditMode) id = editFormData.id;
        else id = joinToId(startId, normalizeText(name));

        if(!isEditMode) {
          id = sanitizeId(allLectureItems, id, name);
        }

        return {id, genericName: name.trim().toLowerCase(), serialOrder};
      },
      createObj: async function(lectureItemId) {

        const progressCb = ({progress}) => {
          setStatus('uploading');
          setProgress(progress);
        };

        const tagUrl = await uploadImage({
          data: tagImage,
          editFormData,
          isEditMode,
          fileName: 'tag_image.png',
          id: lectureItemId,
          getImagePath,
          progressCb
        })

        let response;

        if (tagImage instanceof File) {
          setStatus('Extracting text from image');
          response = await axios.post(baseUrl() + '/extractTextFromImage', {path: tagUrl});
        } else if (typeof tagImage === 'string') {
          response = {
            data: editFormData.image_content
          }
        }

        const attachmentUrl = await uploadImage({
          data: attachment,
          editFormData,
          isEditMode,
          fileName: 'notes.pdf',
          id: lectureItemId,
          getImagePath,
          progressCb
        })

        setStatus(null);
        setProgress(0);

        const grade_name = path.find(c => c.path === keys.grade_id).name;
        const category_name = path.find(c => c.path === keys.category_id).name;
        const subject_name = path.find(c => c.path === keys.subject_id).name;
        const chapter_name = path.find(c => c.path === keys.chapter_id).name;

        let lectureItem = {
          id: lectureItemId,
          [nameKey]: form.get('lecture_item_name').value.trim(),
          [typeKey]: lectureTypeItems.find(c => c.id === activeTypeIndex).value,
          tab_id: keys.tab_id,
          tab_name: path.find(c => c.path === keys.tab_id).name,
          generic_name: form.get('lecture_item_name').value.trim().toLowerCase(),
          side_image_url: '',
          manual_tags: manualTagItems,
          notes_link: attachmentUrl,
          plan: null,
          tag_images: tagUrl,
          image_tag: '',
          serial_order: +form.get('serial_order').value,
          image_content: response ? response.data : null,
          grade_id: keys.grade_id,
          grade_name,
          subject_id: keys.subject_id,
          subject_name,
          chapter_id: keys.chapter_id,
          chapter_name,
          category_id: keys.category_id,
          category_name,
          tier: tierItems.find(c => c.id === activeTierIndex).value,
          youtube_url: null,
          generic_url: null
        }

        if (isLectureHeaderItem) {
          lectureItem.lecture_item_name = path.find(c => c.path === keys.lecture_item_id).name;
        }

        if (activeTypeIndex === 1) {
          lectureItem.youtube_url = form.get('youtube_url').value.trim();
          lectureItem.generic_url = form.get('generic_url').value.trim();
        }

        if (activeTypeIndex !== 3) {
          lectureItem.generated_tags = [grade_name, category_name, subject_name, chapter_name, form.get('lecture_item_name').value];

          if (isLectureHeaderItem) {
            lectureItem.generated_tags = [grade_name, category_name, subject_name, chapter_name, path.find(c => c.path === keys.lecture_item_id).name, form.get('lecture_item_name').value];
          }
        }

        return lectureItem;
      },
      onItemCRUDComplete: async function(obj, docRef) {


        const ist = await fetchIndianTime();

        let path = [];
        let curRef = docRef;
        while(true) {
          path.push(curRef);
          curRef = curRef.parent;
          if(curRef.id === 'subject') break;
        }

        const subjectRef = path.at(-1);

        await subjectRef.set({
          updated_on: +ist
        }, {merge: true});

        // Updating status_tracker

        // setStatus('Updating status');

        await docRef
          .collection('status_tracker')
          .doc('status_tracker')
          .set({
            elastic_status: {'in-progress': 'Feeding data to elastic search'},
            meta_status: {'in-progress': 'Updating to meta'},
          });
      }
    })
    //
    // let logObj = {};
    // let itemId = null;
    // window.onbeforeunload = function() {
    //   return 'Please Confirm!';
    // }
    // try {
    //   e.preventDefault();
    //   //
    //   // console.log('editFormData - ', editFormData);
    //   //
    //   // return;
    //
    //   if (loading) return;
    //
    //
    //   form.validate();
    //   if (!isFormValid()) return;
    //
    //   setLoading(true);
    //
    //
    //   let startId = keys.tab_id;
    //   if (isLectureHeaderItem) {
    //     startId = keys.lecture_item_id;
    //   }
    //
    //   let lectureItemId;
    //   const lectureName = form.get('lecture_item_name').value;
    //
    //   if (isEditMode) lectureItemId = editFormData.id;
    //   else lectureItemId = joinToId(startId, normalizeText(lectureName));
    //
    //   if (!isEditMode) {
    //     lectureItemId = sanitizeId(allLectureItems, lectureItemId, lectureName);
    //   }
    //
    //   itemId = lectureItemId;
    //
    //   if (!isUniqueLectureItem(lectureItemId, lectureName.toLowerCase(), form.get('serial_order').value)) {
    //     // TODO: Make this info better
    //     showSnackbar('Serial order and Name must be unique in the group.', 'error');
    //     return setLoading(false);
    //   }
    //
    //   setStatus('loading');
    //
    //   const progressCb = ({progress}) => {
    //     setStatus('Uploading ' + progress.toFixed(0) + '%');
    //     // setProgress(progress);
    //
    //   };
    //
    //   const completeCb = () => {
    //   };
    //
    //   let tagUrl = tagImage, response = null;
    //   let attachmentUrl = attachment;
    //
    //   if (tagImage instanceof File) {
    //     tagUrl = await uploadImage(getImagePath(lectureItemId, 'tag_image.png'), tagImage, progressCb, completeCb);
    //     setStatus('Extracting text from image');
    //     response = await axios.post(baseUrl() + '/extractTextFromImage', {path: tagUrl});
    //   } else if (typeof tagImage === 'string') {
    //     const source = getImagePath(editFormData.id, 'tag_image.png');
    //     const destination = getImagePath(lectureItemId, 'tag_image.png');
    //     setStatus('Copying Attachment');
    //     const res = await axios.post(baseUrl() + '/copyFile', {source_file: source, destination_file: destination});
    //     if (res.data.error) {
    //       throw new Error(res.data.error.messsage);
    //     }
    //     tagUrl = res.data.success;
    //     response = {
    //       data: editFormData.image_content
    //     }
    //   }
    //
    //
    //   if (attachment instanceof File) {
    //     attachmentUrl = await uploadImage(itemPath(lectureItemId).join('/') + '/notes.pdf', attachment, progressCb, completeCb);
    //   } else if (typeof attachment === 'string' && !isEditMode) {
    //     const source = itemPath(editFormData.id).join('/') + '/notes.pdf';
    //     const destination = itemPath(lectureItemId).join('/') + '/notes.pdf';
    //     setStatus('Copying Attachment');
    //     const response = await axios.post(baseUrl() + '/copyFile', {
    //       source_file: source,
    //       destination_file: destination
    //     });
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     attachmentUrl = response.data.success;
    //   }
    //
    //   setStatus('loading');
    //
    //   // TODO: upload pdf files to grade directly
    //   const grade_name = path.find(c => c.path === keys.grade_id).name;
    //   const category_name = path.find(c => c.path === keys.category_id).name;
    //   const subject_name = path.find(c => c.path === keys.subject_id).name;
    //   const chapter_name = path.find(c => c.path === keys.chapter_id).name;
    //
    //   let lectureItem = {
    //     id: lectureItemId,
    //     [nameKey]: form.get('lecture_item_name').value.trim(),
    //     [typeKey]: lectureTypeItems.find(c => c.id === activeTypeIndex).value,
    //     // lecture_header_item_name: '',
    //     // lecture_header_item_type: '',
    //     tab_id: keys.tab_id,
    //     tab_name: path.find(c => c.path === keys.tab_id).name,
    //     generic_name: form.get('lecture_item_name').value.trim().toLowerCase(),
    //     side_image_url: '',
    //     manual_tags: manualTagItems,
    //     notes_link: attachmentUrl,
    //     plan: null,
    //     tag_images: tagUrl,
    //     image_tag: '',
    //     serial_order: +form.get('serial_order').value,
    //     image_content: response ? response.data : null,
    //     grade_id: keys.grade_id,
    //     grade_name,
    //     subject_id: keys.subject_id,
    //     subject_name,
    //     chapter_id: keys.chapter_id,
    //     chapter_name,
    //     category_id: keys.category_id,
    //     category_name,
    //     tier: tierItems.find(c => c.id === activeTierIndex).value,
    //     youtube_url: null,
    //     generic_url: null
    //     // updated_on: +ist,
    //   }
    //
    //   if (isLectureHeaderItem) {
    //     // lectureItem.lecture_header_item_name = form.get('lecture_item_name').value;
    //     // lectureItem.lecture_header_item_type = lectureTypeItems[activeTypeIndex].value;
    //     lectureItem.lecture_item_name = path.find(c => c.path === keys.lecture_item_id).name;
    //   }
    //
    //   if (activeTypeIndex === 1) {
    //     lectureItem.youtube_url = form.get('youtube_url').value.trim();
    //     lectureItem.generic_url = form.get('generic_url').value.trim();
    //   }
    //
    //   if (activeTypeIndex !== 3) {
    //     lectureItem.generated_tags = [grade_name, category_name, subject_name, chapter_name, form.get('lecture_item_name').value];
    //
    //     if (isLectureHeaderItem) {
    //       lectureItem.generated_tags = [grade_name, category_name, subject_name, chapter_name, path.find(c => c.path === keys.lecture_item_id).name, form.get('lecture_item_name').value];
    //     }
    //   }
    //
    //   setStatus('Creating Lecture Item');
    //
    //   const subjectRef = db
    //     .collection(`cms_data`)
    //     .doc(keys.grade_id)
    //     .collection('scope')
    //     .doc(keys.scope_id)
    //     .collection('category')
    //     .doc(keys.category_id)
    //     .collection('subject')
    //     .doc(keys.subject_id);
    //
    //   let lectureItemRef = subjectRef
    //     .collection('chapter')
    //     .doc(keys.chapter_id)
    //     .collection('tab')
    //     .doc(keys.tab_id)
    //     .collection('lecture_item');
    //   // .doc(lectureItemId);
    //
    //   if (isLectureHeaderItem) {
    //     lectureItemRef = lectureItemRef
    //       .doc(keys.lecture_item_id)
    //       .collection('lecture_header_item')
    //       .doc(lectureItemId);
    //   } else {
    //     lectureItemRef = lectureItemRef.doc(lectureItemId);
    //   }
    //
    //   await lectureItemRef.set(lectureItem, {merge: isEditMode});
    //
    //   // setStatus('Updating Subject');
    //
    //   const ist = await fetchIndianTime();
    //
    //   await subjectRef.set({
    //     updated_on: +ist
    //   }, {merge: true});
    //
    //   // Updating status_tracker
    //
    //   // setStatus('Updating status');
    //
    //   await lectureItemRef
    //     .collection('status_tracker')
    //     .doc('status_tracker')
    //     .set({
    //       elastic_status: {'in-progress': 'Feeding data to elastic search'},
    //       meta_status: {'in-progress': 'Updating to meta'},
    //     });
    //
    //
    //   setStatus('completed')
    //
    //   await new Promise((res) => setTimeout(res, 2000));
    //   setStatus('ideal');
    //   setLoading(false);
    //   let titleToShow = isLectureHeaderItem ? 'Lecture Header Item' : 'Lecture Item';
    //   const msg = titleToShow + ' has been ' + (isEditMode ? 'updated' : 'created') + ' successfully!'
    //   showSnackbar(msg, 'success');
    //   resetForm();
    //   setActiveItemInColumn({type, id: lectureItemId});
    //   setEditFormData(null);
    //
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, lectureItem) : null,
    //     itemId: lectureItem.id
    //   }
    // } catch (e) {
    //   logObj = {
    //     level: 'error',
    //     affectedKeys: null,
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: null,
    //     user,
    //     error: e.message,
    //     itemId
    //   };
    // }
    // await createLog(logObj);
    // window.onbeforeunload = null;
  }

  return (
    <form className="cms-modal" ref={formRef}>
      <header>
        <h2>{(isEditMode ? 'Edit' : 'Create') + (isLectureHeaderItem ? ' Lecture Header Item' : ' Lecture Item')}</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Type</label>
      <PustackTabButton items={lectureTypeItems} activeIndex={activeTypeIndex} setActiveIndex={setActiveTypeIndex} />
      <label htmlFor="">Tier</label>
      <PustackTabButton items={tierItems} activeIndex={activeTierIndex} setActiveIndex={setActiveTierIndex} />
      <label htmlFor="">Name</label>
      <SessionFormInput
        invalid={errors?.lecture_item_name}
        {...register('lecture_item_name')}
      />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        invalid={errors?.serial_order}
        type="number"
        {...register('serial_order')}
      />
      {activeTypeIndex === 1 && (
        <>
          <label htmlFor="">Generic Url</label>
          <SessionFormInput
            invalid={errors?.generic_url}
            {...register('generic_url')}
          />
          <label htmlFor="">Youtube Url</label>
          <SessionFormInput
            invalid={errors?.youtube_url}
            {...register('youtube_url')}
          />
        </>
      )}
      {activeTypeIndex !== 3 && (
        <>
          <PustackUploadButton url={typeof attachment === 'string' ? attachment : null} setFile={setAttachment} accept={'application/pdf'} resetIndex={resetIndex} label="Upload Pdf Attachment" />
          <PustackUploadButton url={typeof tagImage === 'string' ? tagImage : null} setFile={setTagImage} resetIndex={resetIndex} label="Upload Tag Image" />
          <label htmlFor="">Manual Tags</label>
          <SessionFormInput
            invalid={errors?.manual_tags}
            {...register('manual_tags')}
            InputProps={{
              onKeyPress: function(e) {
                if(e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.target.value.trim();
                  if(val.length === 0) return;
                  setManualTagItems(c => {
                    if(c.includes(val)) return c;
                    return [...c, val];
                  });
                  e.target.value = '';
                }
              }
            }}
            // SvgIcon={
            // <Tooltip title={"Separate tags with comma (,)"} >
            //   <InfoOutlined style={{
            //     strokeWidth: 0,
            //     fontSize: '3em',
            //     fill: '#ffcd4d'
            //   }} />
            // </Tooltip>
            // }
          />
          <p>Hit Enter to create a tag</p>
          <div className="cms-content-info-details-tags-items">
            {manualTagItems.map(item => (
              <TagItem label={item} key={item} onCrossClick={() => setManualTagItems(c => c.filter(a => a !== item))} />
            ))}
          </div>
        </>
      )}
      <button className={"session__form__submit-btn" + (status === 'completed' ? ' completed' : '')} disabled={!isFormValid()} onClick={handleSubmit1}>
        <div className={"session__form__submit-btn__bg" + (status ? ' shrink' : '')}>
          {status !== 'completed' ? <Lottie
            style={{width: '40px'}}
            options={{animationData: uploadingLottie, loop: true}}
          /> : <Lottie
            style={{width: '40px', transform: 'scale(2)'}}
            options={{animationData: successTickLottie, loop: false}}
          />}
        </div>
        {loading && !['uploading', 'completed'].includes(status) ? <Lottie
            style={{height: '30px', zIndex: 2, position: 'relative'}}
            options={{ animationData: circularProgress, loop: true }}
          /> :
          <span style={{
            position: 'relative',
            zIndex: 2,
            lineHeight: '32px',
            mixBlendMode: status !== 'ideal' ? 'exclusion' : 'normal'
          }}>
            {/*{status === 'uploading' ? 'Uploading ' + progress.toFixed(0) + '%' : status === 'completed' ? '' : 'Create'}*/}
            {status === 'uploading' ? 'Uploading ' + progress.toFixed(0) + '%' : status === 'completed' ? '' : isEditMode ? 'Update' : 'Create'}
          </span>}
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
      {/*<PustackButton isLoading={loading} className="cms-button" onClick={handleSubmit} disabled={!isFormValid()}>*/}
      {/*  Create*/}
      {/*</PustackButton>*/}
    </form>
  )
}
