import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CloseRounded} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import PustackButton from "../../../../components/global/pustack-btn";
import {fetchIndianTime, showSnackbar} from "../../../../helpers";
import {db, storage} from "../../../../firebase_config";
import useForm, {Validators} from "../../../../hooks/form";
import PustackUploadButton from "../../../../components/global/pustack-upload-btn";
import firebase from "firebase";
import Lottie from "lottie-react-web";
import uploadingLottie from "../../../../assets/lottie/uploading.json";
import successTickLottie from "../../../../assets/lottie/success.json";
import circularProgress from "../../../../assets/lottie/circularProgress.json";
import waveLottie from "../../../../assets/lottie/wave.json";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {useOverlayLoader} from "../../../../hooks/overlayLoader";
import {HEX_REGEX} from "../../cms-info";
import {joinToId, sanitizeId} from "../cms-category-form";
import {HexColorPicker} from "react-colorful";
import Menu from '@material-ui/core/Menu';
import HexColorInput from "../../../../components/cms/hex-color-input";
import axios from "axios";
import {baseUrl} from "../../../../database/agora/config";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import {uploadImage} from "../cms-chapter-form";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";



const normalizeText = (str) => str.replaceAll(' ', '').toLowerCase();

export default function CmsSubjectForm({allSubjects, keys}) {
  const formRef = useRef(null);
  const [resetIndex, setResetIndex] = useState(0);
  const [status, setStatus] = useState(null);
  const [illustrationArt, setIllustrationArt] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const {handleSubmit, loading} = useSubmitCMS();
  const [progress, setProgress] = useState(0);
  const [user] = useContext(UserContext).user;
  const {form, errors, register, handleChangeValue} = useForm({
    subject_name: ['', [Validators.req()]],
    description: ['', [Validators.req()]],
    hex_color: ['', [Validators.req(), Validators.test(HEX_REGEX)]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
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
    handleChangeValue('subject_name', editFormData.subject_name);
    handleChangeValue('description', editFormData.description);
    handleChangeValue('hex_color', editFormData.hex_color);
    handleChangeValue('serial_order', +editFormData.serial_order);
    setIllustrationArt(editFormData.illustration_art);
    setMainImage(editFormData.main_thumbnail_url);

  }, [editFormData, handleChangeValue])

  const isUniqueSubject = (id, subjectName, serialOrder) => {
    return allSubjects.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== subjectName.trim()) || c.id === id;
      }
      return c.generic_name !== subjectName.trim() && c.serial_order !== +serialOrder && c.id !== id
    })
  }

  const getImagePath = (subjectId, fileName) => {
    return [
      'cms_data',
      keys.grade_id,
      'scope',
      keys.scope_id,
      'category',
      keys.category_id,
      'subject',
      subjectId,
      fileName
    ].join('/')
  }

  const isFormValid = () => {
    return !(form._invalid || !illustrationArt || !mainImage);
  }

  const resetForm = () => {
    form.reset();
    // Will be responsible for resetting the files
    setResetIndex(c => c+1);
  }

  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allSubjects,
      isFormValid: isFormValid,
      header: 'Subject',
      type: 'subject',
      getMetaData: function() {
        const name = form.get('subject_name').value;
        const serialOrder = +form.get('serial_order').value;

        let id;

        if (isEditMode) {
          id = editFormData.id;
        } else {
          id = joinToId(keys.category_id, normalizeText(name));
          id = sanitizeId(allSubjects, id, name);
        }
        return {id, genericName: name.trim().toLowerCase(), serialOrder};
      },
      createObj: async function(subjectId) {

        const progressCb = ({progress}) => {
          setStatus('uploading');
          setProgress(progress);
        };

        const illustrationUrl = await uploadImage({
          data: illustrationArt,
          editFormData,
          isEditMode,
          fileName: 'illustration_art.png',
          id: subjectId,
          getImagePath,
          progressCb
        })

        const mainImageUrl = await uploadImage({
          data: mainImage,
          editFormData,
          isEditMode,
          fileName: 'main_image.png',
          id: subjectId,
          getImagePath,
          progressCb
        })

        setStatus(null);
        setProgress(0);

        return {
          description: form.get('description').value.trim(),
          generic_name: form.get('subject_name').value.trim().toLowerCase(),
          id: subjectId,
          mini_thumbnail_url: null,
          hex_color: form.get('hex_color').value,
          main_thumbnail_url: mainImageUrl,
          illustration_art: illustrationUrl,
          serial_order: +form.get('serial_order').value,
          subject_name: form.get('subject_name').value.trim(),
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
    //   let subjectId;
    //   const subjectName = form.get('subject_name').value;
    //
    //   if (isEditMode) {
    //     subjectId = editFormData.id;
    //   } else {
    //     subjectId = joinToId(keys.category_id, normalizeText(subjectName));
    //     subjectId = sanitizeId(allSubjects, subjectId, subjectName);
    //   }
    //
    //   itemId = subjectId;
    //
    //   if (!isUniqueSubject(subjectId, form.get('subject_name').value.toLowerCase(), form.get('serial_order').value)) {
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
    //   let illustrationUrl = illustrationArt;
    //
    //   if (illustrationArt instanceof File) {
    //     illustrationUrl = await uploadImage(getImagePath(subjectId, 'illustration_art.png'), illustrationArt, progressCb, completeCb);
    //   } else if (typeof illustrationArt === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'illustration_art.png');
    //     const destination = getImagePath(subjectId, 'illustration_art.png');
    //     setStatus('Copying Attachment');
    //     const response = await axios.post(baseUrl() + '/copyFile', {
    //       source_file: source,
    //       destination_file: destination
    //     });
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     illustrationUrl = response.data.success;
    //   }
    //
    //   let mainImageUrl = mainImage;
    //
    //   if (mainImage instanceof File) {
    //     mainImageUrl = await uploadImage(getImagePath(subjectId, 'main_image.png'), mainImage, progressCb, completeCb);
    //   } else if (typeof mainImage === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'main_image.png');
    //     const destination = getImagePath(subjectId, 'main_image.png');
    //     setStatus('Copying Attachment');
    //     const response = await axios.post(baseUrl() + '/copyFile', {
    //       source_file: source,
    //       destination_file: destination
    //     });
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     mainImageUrl = response.data.success;
    //   }
    //
    //   setStatus(null);
    //   setProgress(0);
    //
    //   const subject = {
    //     description: form.get('description').value.trim(),
    //     generic_name: form.get('subject_name').value.trim().toLowerCase(),
    //     id: subjectId,
    //     mini_thumbnail_url: null,
    //     hex_color: form.get('hex_color').value,
    //     main_thumbnail_url: mainImageUrl,
    //     illustration_art: illustrationUrl,
    //     serial_order: +form.get('serial_order').value,
    //     subject_name: form.get('subject_name').value.trim(),
    //   }
    //
    //   const subjectRef = db.collection('cms_data')
    //     .doc(keys.grade_id)
    //     .collection('scope')
    //     .doc(keys.scope_id)
    //     .collection('category')
    //     .doc(keys.category_id)
    //     .collection('subject')
    //     .doc(subject.id);
    //
    //   await subjectRef.set(subject, {merge: isEditMode});
    //
    //   setStatus('completed');
    //
    //   await new Promise((res) => setTimeout(res, 2000));
    //   setStatus(null);
    //   setLoading(false);
    //   setEditFormData(null);
    //   setActiveItemInColumn({id: subjectId, type: 'subject'});
    //   let msg = 'Subject has been ' + (!isEditMode ? 'created' : 'updated') + ' successfully!';
    //   showSnackbar(msg, 'success');
    //   resetForm();
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, {
    //       ...subject,
    //       updated_on: editFormData.updated_on
    //     }) : null,
    //     itemId: subject.id
    //   };
    // } catch (e) {
    //   setStatus(null);
    //   setLoading(false);
    //   setEditFormData(null);
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
        <h2>{isEditMode ? 'Edit' : 'Create'} Subject</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Name</label>
      <SessionFormInput
        invalid={errors?.subject_name}
        {...register('subject_name')}
      />
      <label htmlFor="">Description</label>
      <SessionFormInput
        invalid={errors?.description}
        {...register('description')}
      />
      <HexColorInput form={form} register={register} controlName="hex_color" handleChangeValue={handleChangeValue} />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        invalid={errors?.serial_order}
        type="number"
        {...register('serial_order')}
      />
      <PustackUploadButton url={typeof illustrationArt === 'string' ? illustrationArt : null} setFile={setIllustrationArt} resetIndex={resetIndex} label="Upload Illustration Art" />
      <PustackUploadButton url={typeof mainImage === 'string' ? mainImage : null} setFile={setMainImage} resetIndex={resetIndex} label="Upload Main Image" />
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
