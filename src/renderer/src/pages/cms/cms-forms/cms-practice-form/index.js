import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CloseRounded} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import PustackButton from "../../../../components/global/pustack-btn";
import {fetchIndianTime, showSnackbar} from "../../../../helpers";
import {db, storage} from "../../../../firebase_config";
import {Switch, Tooltip} from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import useForm, {Validators} from "../../../../hooks/form";
import PdfImage from "../../../../assets/blaze/pdf 2.svg";
import PustackUploadButton from "../../../../components/global/pustack-upload-btn";
import firebase from "firebase";
import Lottie from "lottie-react-web";
import uploadingLottie from "../../../../assets/lottie/uploading.json";
import waitingLottie from "../../../../assets/lottie/waiting.json";
import successTickLottie from "../../../../assets/lottie/success.json";
import circularProgress from "../../../../assets/lottie/circularProgress.json";
import waveLottie from "../../../../assets/lottie/wave.json";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {useOverlayLoader} from "../../../../hooks/overlayLoader";
import {HEX_REGEX} from "../../cms-info";
import {joinToId, sanitizeId} from "../cms-category-form";
import HexColorInput from "../../../../components/cms/hex-color-input";
import axios from "axios";
import {baseUrl} from "../../../../database/agora/config";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import {uploadImage} from "../cms-chapter-form";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";



const normalizeText = (str) => str.replaceAll(' ', '').toLowerCase();

export default function CmsPracticeForm({allPractices, keys}) {
  const formRef = useRef(null);
  const [resetIndex, setResetIndex] = useState(0);
  // const [loading, setLoading] = useOverlayLoader(false);
  const [status, setStatus] = useState(null);
  const [miniThumbnailUrl, setMiniThumbnailUrl] = useState(null);
  const [mainThumbnailUrl, setMainThumbnailUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const {handleSubmit, loading} = useSubmitCMS();
  const {form, errors, register, handleChangeValue} = useForm({
    exam_name: ['', [Validators.req()]],
    description: ['', [Validators.req()]],
    hex_color: ['', [Validators.req(), Validators.test(HEX_REGEX)]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
    exam_number: ['', [Validators.req(), Validators.isInt()]],
  })

  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;


  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate
  }, [editFormData]);

  useEffect(() => {
    if(!editFormData) {
      form.reset();
      return
    }
    handleChangeValue('exam_name', editFormData.exam_name);
    handleChangeValue('description', editFormData.description);
    handleChangeValue('hex_color', editFormData.hex_color);
    handleChangeValue('serial_order', +editFormData.serial_order);
    handleChangeValue('exam_number', editFormData.exam_number);
    setMiniThumbnailUrl(editFormData.mini_thumbnail_url);
    setMainThumbnailUrl(editFormData.main_thumbnail_url);

  }, [editFormData, handleChangeValue])

  const isUniqueSubject = (id, examName, serialOrder) => {
    return allPractices.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== examName.trim()) || c.id === id;
      }
      return c.generic_name !== examName.trim() && c.serial_order !== +serialOrder && c.id !== id
    })
  }

  const getImagePath = (examId, fileName) => {
    return [
      'cms_data',
      keys.grade_id,
      'scope',
      keys.scope_id,
      'category',
      keys.category_id,
      'exam',
      examId,
      fileName
    ].join('/')
  }

  const isFormValid = () => {
    return !(form._invalid || !miniThumbnailUrl || !mainThumbnailUrl);
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
      allItems: allPractices,
      isFormValid: isFormValid,
      header: 'Exam',
      type: 'practice',
      getMetaData: function() {
        const name = form.get('exam_name').value;
        const serialOrder = +form.get('serial_order').value;

        let id;
        if (isEditMode) id = editFormData.id;
        else id = joinToId(keys.category_id, normalizeText(name));

        if (!isEditMode) {
          id = sanitizeId(allPractices, id, name);
        }
        return {id, genericName: name.trim().toLowerCase(), serialOrder};
      },
      createObj: async function(examId) {

        const progressCb = ({progress}) => {
          setStatus('uploading');
          setProgress(progress);
        };

        const mainUrl = await uploadImage({
          data: mainThumbnailUrl,
          editFormData,
          isEditMode,
          fileName: 'main_thumbnail.png',
          id: examId,
          getImagePath,
          progressCb
        })

        const miniUrl = await uploadImage({
          data: miniThumbnailUrl,
          editFormData,
          isEditMode,
          fileName: 'mini_thumbnail.png',
          id: examId,
          getImagePath,
          progressCb
        })

        return {
          description: form.get('description').value.trim(),
          generic_name: form.get('exam_name').value.trim().toLowerCase(),
          id: examId,
          hex_color: form.get('hex_color').value,
          main_thumbnail_url: mainUrl,
          mini_thumbnail_url: miniUrl,
          serial_order: +form.get('serial_order').value,
          exam_name: form.get('exam_name').value.trim(),
          exam_number: form.get('exam_number').value,
        }
      }
    })
    // let logObj = {};
    // let itemId = null;
    // window.onbeforeunload = function() {
    //   return 'Please Confirm!';
    // }
    // try {
    //   e.preventDefault();
    //   if (loading) return;
    //
    //
    //   form.validate();
    //   if (!isFormValid()) return;
    //
    //   const examName = form.get('exam_name').value;
    //
    //   let examId;
    //   if (isEditMode) examId = editFormData.id;
    //   else examId = joinToId(keys.category_id, normalizeText(examName));
    //
    //   if (!isEditMode) {
    //     examId = sanitizeId(allPractices, examId, examName);
    //   }
    //
    //   itemId = examId;
    //
    //   if (!isUniqueSubject(examId, form.get('exam_name').value.toLowerCase(), form.get('serial_order').value)) {
    //     showSnackbar('Serial order and Name must be unique in the group.', 'error');
    //     return setLoading(false);
    //   }
    //
    //   setLoading(true);
    //
    //   const progressCb = ({progress}) => {
    //     setStatus('uploading');
    //     setProgress(progress);
    //   };
    //
    //   const completeCb = () => {
    //   };
    //
    //   let miniUrl = miniThumbnailUrl;
    //
    //   if (miniThumbnailUrl instanceof File) {
    //     miniUrl = await uploadImage(getImagePath(examId, 'mini_thumbnail.png'), miniThumbnailUrl, progressCb, completeCb);
    //   } else if (typeof miniThumbnailUrl === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'mini_thumbnail.png');
    //     const destination = getImagePath(examId, 'mini_thumbnail.png');
    //     setStatus('Copying Attachment');
    //     const response = await axios.post(baseUrl() + '/copyFile', {
    //       source_file: source,
    //       destination_file: destination
    //     });
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     miniUrl = response.data.success;
    //   }
    //
    //   let mainUrl = mainThumbnailUrl;
    //
    //   if (mainThumbnailUrl instanceof File) {
    //     mainUrl = await uploadImage(getImagePath(examId, 'main_thumbnail.png'), mainThumbnailUrl, progressCb, completeCb);
    //   } else if (typeof mainThumbnailUrl === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'main_thumbnail.png');
    //     const destination = getImagePath(examId, 'main_thumbnail.png');
    //     setStatus('Copying Attachment');
    //     const response = await axios.post(baseUrl() + '/copyFile', {
    //       source_file: source,
    //       destination_file: destination
    //     });
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     mainUrl = response.data.success;
    //   }
    //   //
    //   // const miniUrl = await uploadImage(getImagePath(examId, miniThumbnailUrl.name), miniThumbnailUrl, progressCb, completeCb);
    //   //
    //   // const mainUrl = await uploadImage(getImagePath(examId, mainThumbnailUrl.name), mainThumbnailUrl, progressCb, completeCb);
    //
    //   setStatus(null);
    //   setProgress(0);
    //
    //   const exam = {
    //     description: form.get('description').value.trim(),
    //     generic_name: form.get('exam_name').value.trim().toLowerCase(),
    //     id: examId,
    //     hex_color: form.get('hex_color').value,
    //     main_thumbnail_url: mainUrl,
    //     mini_thumbnail_url: miniUrl,
    //     serial_order: +form.get('serial_order').value,
    //     exam_name: form.get('exam_name').value.trim(),
    //     exam_number: form.get('exam_number').value,
    //   }
    //
    //   const subjectRef = db.collection('cms_data')
    //     .doc(keys.grade_id)
    //     .collection('scope')
    //     .doc(keys.scope_id)
    //     .collection('category')
    //     .doc(keys.category_id)
    //     .collection('exam')
    //     .doc(exam.id);
    //
    //   await subjectRef.set(exam, {merge: isEditMode});
    //
    //   setStatus('completed');
    //
    //   await new Promise((res) => setTimeout(res, 2000));
    //   setStatus(null);
    //   setLoading(false);
    //   setActiveItemInColumn({id: examId, type: 'practice'});
    //   const msg = 'Exam has been ' + (!isEditMode ? 'created' : 'updated') + ' successfully!';
    //   showSnackbar(msg, 'success');
    //   resetForm();
    //
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, exam) : null,
    //     itemId: exam.id
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
    // await createLog(logObj)
    // window.onbeforeunload = null;
  }

  return (
    <form className="cms-modal" ref={formRef}>
      <header>
        <h2>{isEditMode ? 'Edit' : 'Create'} Exam</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Name</label>
      <SessionFormInput
        invalid={errors?.exam_name}
        {...register('exam_name')}
      />
      <label htmlFor="">Description</label>
      <SessionFormInput
        invalid={errors?.description}
        {...register('description')}
      />
      <label htmlFor="">Number</label>
      <SessionFormInput
        invalid={errors?.exam_number}
        type="number"
        {...register('exam_number')}
      />
      <HexColorInput form={form} register={register} controlName="hex_color" handleChangeValue={handleChangeValue} />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        invalid={errors?.serial_order}
        type="number"
        {...register('serial_order')}
      />
      <PustackUploadButton url={typeof mainThumbnailUrl === 'string' ? mainThumbnailUrl : null} setFile={setMainThumbnailUrl} resetIndex={resetIndex} label="Upload Main Image" />
      <PustackUploadButton url={typeof miniThumbnailUrl === 'string' ? miniThumbnailUrl : null} setFile={setMiniThumbnailUrl} resetIndex={resetIndex} label="Upload Mini Image" />
      <button className={"session__form__submit-btn" + (status === 'completed' ? ' completed' : '')} disabled={!isFormValid()} onClick={handleSubmit1}>
        <div className={"session__form__submit-btn__bg" + (status ? ' shrink' : '')}>
          {status === 'uploading' ? <Lottie
            style={{width: '40px'}}
            options={{animationData: uploadingLottie, loop: true}}
          /> : status === 'completed' ? <Lottie
            style={{width: '40px', transform: 'scale(2)'}}
            options={{animationData: successTickLottie, loop: false}}
          /> : null}
        </div>
        {(loading && !['uploading', 'completed'].includes(status)) ? <Lottie
            style={{height: '30px', zIndex: 2, position: 'relative'}}
            options={{ animationData: circularProgress, loop: true }}
          /> :
          <span style={{
            position: 'relative',
            zIndex: 2,
            lineHeight: '32px',
            mixBlendMode: status ? 'exclusion' : 'normal'
          }}>
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
