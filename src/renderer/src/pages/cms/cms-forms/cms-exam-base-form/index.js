import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InfoOutlined} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import {fetchIndianTime, showSnackbar} from "../../../../helpers";
import {db, storage} from "../../../../firebase_config";
import {Tooltip} from "@material-ui/core";
import useForm, {Validators} from "../../../../hooks/form";
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
import {URL_VALIDATORS} from "../cms-lecture-base-form";
import {joinToId, sanitizeId} from "../cms-category-form";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import {uploadImage} from "../cms-chapter-form";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";



const normalizeText = (str) => str.replaceAll(' ', '').toLowerCase();

export default function CmsExamBaseForm({allExamItems, keys, isLectureHeaderItem, lectureTypeItems: typeItems}) {
  const formRef = useRef(null);
  const [resetIndex, setResetIndex] = useState(0);
  // const [loading, setLoading] = useOverlayLoader(false);
  const [status, setStatus] = useState(null);
  const [tagImage, setTagImage] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [progress, setProgress] = useState(0);
  const [user] = useContext(UserContext).user;
  const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const [includeHeader, setIncludeHeader] = useState(() => !isLectureHeaderItem);
  const [manualTagItems, setManualTagItems] = useState([]);
  const [activeTierIndex, setActiveTierIndex] = useState(1);
  const [activeTypeIndex, setActiveTypeIndex] = useState(1);
  const {form, errors, register, handleChangeValue} = useForm({
    exam_item_name: ['', [Validators.req()]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
    generic_url: ['', URL_VALIDATORS],
    youtube_url: ['', URL_VALIDATORS],
  });
  const {handleSubmit, loading} = useSubmitCMS();
  const [lectureTypeItems, setLectureTypeItems] = useState([{id: 1, value: 'video'}, {id: 2, value: 'note'}, {id: 3, value: 'header'}]);

  useEffect(() => {
    if(!includeHeader) return setLectureTypeItems(typeItems.filter(c => c.value !== 'header'));
    setLectureTypeItems(typeItems);
  }, [includeHeader]);

  const typeKey = useMemo(() => isLectureHeaderItem ? 'lecture_header_item_type' : 'exam_item_type', [isLectureHeaderItem]);
  const nameKey = useMemo(() => isLectureHeaderItem ? 'lecture_header_item_name' : 'exam_item_name', [isLectureHeaderItem]);
  const type = useMemo(() => !isLectureHeaderItem ? 'exam_item' : 'exam_header_item', [isLectureHeaderItem])


  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;

  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate;
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
    handleChangeValue('exam_item_name', editFormData[nameKey]);
    handleChangeValue('serial_order', +editFormData.serial_order);
    handleChangeValue('generic_url', editFormData.generic_url);
    handleChangeValue('youtube_url', editFormData.youtube_url);
    setAttachment(editFormData.notes_link);
    setManualTagItems(editFormData.manual_tags);
    setActiveTierIndex(tierItems.find(c => c.value === editFormData.tier).id);

    if(editFormData[typeKey] === 'header') setLectureTypeItems(typeItems.filter(c => c.value === 'header'));
    else setIncludeHeader(false);

    setActiveTypeIndex(lectureTypeItems.find(c => c.value === editFormData[typeKey]).id);
    // setTagImage(editFormData.pdf_attachment);

  }, [editFormData, handleChangeValue])

  const isUniqueLectureItem = (id, lectureItemName, serialOrder) => {
    return allExamItems.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== lectureItemName.trim().toLowerCase()) || c.id === id;
      }
      return c.generic_name !== lectureItemName.trim().toLowerCase() && c.serial_order !== +serialOrder && c.id !== id
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
      'exam',
      keys.practice_id,
      'exam_item',
    ];

    if(isLectureHeaderItem) {
      arr.push(keys.exam_item_id, 'exam_header_item', itemId);
    } else {
      arr.push(itemId);
    }
    return arr.join('/');
  }

  const isFormValid = () => {
    // console.log('form - ', form);
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
      allItems: allExamItems,
      isFormValid: isFormValid,
      header: isLectureHeaderItem ? 'Exam Header Item' : 'Exam Item',
      type: type,
      resetForm: resetForm,
      getMetaData: function() {
        const name = form.get('exam_item_name').value;
        const serialOrder = +form.get('serial_order').value;

        let startId = keys.practice_id;
        if(isLectureHeaderItem) {
          startId = keys.exam_item_id;
        }

        let id;

        if(isEditMode) id = editFormData.id;
        else id = joinToId(startId, normalizeText(name));

        if(!isEditMode) {
          id = sanitizeId(allExamItems, id, name);
        }

        return {id, genericName: name.trim().toLowerCase(), serialOrder};
      },
      createObj: async function(lectureItemId) {

        const progressCb = ({progress}) => {
          setStatus('uploading');
          setProgress(progress);
        };

        const attachmentUrl = await uploadImage({
          data: attachment,
          editFormData,
          isEditMode,
          fileName: 'notes.pdf',
          id: lectureItemId,
          getImagePath: itemPath,
          progressCb
        })

        setStatus(null);
        setProgress(0);

        let lectureItem = {
          id: lectureItemId,
          generic_name: form.get('exam_item_name').value.trim().toLowerCase(),
          manual_tags: manualTagItems,
          plan: null,
          notes_link: attachmentUrl,
          serial_order: +form.get('serial_order').value,
          tier: tierItems.find(c => c.id === activeTierIndex).value,
          [nameKey]: form.get('exam_item_name').value.trim(),
          [typeKey]: lectureTypeItems.find(c => c.id === activeTypeIndex).value,
          youtube_url: null,
          generic_url: null
        }

        if(activeTypeIndex === 1) {
          lectureItem.youtube_url = form.get('youtube_url').value.trim();
          lectureItem.generic_url = form.get('generic_url').value.trim();
        }

        return lectureItem;
      },
      onItemCRUDComplete: async function(obj, docRef) {
        await docRef
          .collection('status_tracker')
          .doc('status_tracker')
          .set({
            // elastic_status: {'in-progress': 'Feeding data to elastic search'},
            meta_status: {'in-progress': 'Updating to meta'},
          });
      }
    })
  }

  return (
    <form className="cms-modal" ref={formRef}>
      <header>
        <h2>{(isEditMode ? 'Edit' : 'Create') + (isLectureHeaderItem ? ' Exam Header Item' : ' Exam Item')}</h2>
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
        invalid={errors?.exam_item_name}
        {...register('exam_item_name')}
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
