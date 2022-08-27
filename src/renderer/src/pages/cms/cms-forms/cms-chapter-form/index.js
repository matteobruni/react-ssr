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
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";



export const normalizeText = (str) => str.replaceAll(' ', '').toLowerCase();

export const uploadImage = async ({data, id, isEditMode, editFormData, fileName, getImagePath, progressCb}) => {
  let url = data;
  if (data instanceof File) {
    url = await uploadImageToDB(getImagePath(id, fileName), data, progressCb, () => {});
  } else if (typeof data === 'string' && !isEditMode) {
    const source = getImagePath(editFormData.id, fileName);
    const destination = getImagePath(id, fileName);
    const response = await axios.post(baseUrl() + '/copyFile', {
      source_file: source,
      destination_file: destination
    });
    if (response.data.error) {
      throw new Error(response.data.error.message);
    }
    url = response.data.success;
  }
  return url;
}

export const uploadImageToDB = (path, file, progressCB, completeProgressCB) => {
  return new Promise((res, rej) => {
    const uploadTask = storage
      .ref()
      .child(path)
      .put(file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
        progressCB({progress, bytesTransferred: snapshot.bytesTransferred, totalBytes: snapshot.totalBytes});
        // switch (snapshot.state) {
        //   case firebase.storage.TaskState.PAUSED: // or 'paused'
        //     console.log('Upload is paused');
        //     break;
        //   case firebase.storage.TaskState.RUNNING: // or 'running'
        //     console.log('Upload is running');
        //     break;
        // }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        rej(error);
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          completeProgressCB(downloadURL);
          res(downloadURL)
        });
      })
  });
}

export default function CmsChapterForm({allChapters, keys}) {
  const formRef = useRef(null);
  // const [loading, setLoading] = useOverlayLoader(false);
  const [resetIndex, setResetIndex] = useState(0);
  const [status, setStatus] = useState(null);
  const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const [illustrationArt, setIllustrationArt] = useState(null);
  const [progress, setProgress] = useState(0);
  const [user] = useContext(UserContext).user;
  const {form, errors, register, handleChangeValue} = useForm({
    chapter_name: ['', [Validators.req()]],
    chapter_number: ['', [Validators.req()]],
    description: ['', [Validators.req()]],
    hex_color: ['', [Validators.req(), Validators.test(HEX_REGEX)]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
  })
  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;
  const {handleSubmit, loading} = useSubmitCMS();

  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate
  }, [editFormData]);

  useEffect(() => {
    if(!editFormData) {
      form.reset();
      return
    }
    handleChangeValue('chapter_name', editFormData.chapter_name);
    handleChangeValue('chapter_number', editFormData.chapter_number);
    handleChangeValue('description', editFormData.description);
    handleChangeValue('hex_color', editFormData.hex_color);
    handleChangeValue('serial_order', +editFormData.serial_order);
    setIllustrationArt(editFormData.illustration_art);

  }, [editFormData, handleChangeValue])

  const isUniqueSubject = (id, chapterName, chapterNumber, serialOrder) => {
    return allChapters.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== chapterName.trim().toLowerCase() && c.chapter_number !== +chapterNumber) || c.id === id;
      }
      return c.generic_name !== chapterName.trim().toLowerCase() && c.serial_order !== +serialOrder && c.chapter_number !== +chapterNumber && c.id !== id
    })
  }

  const resetForm = () => {
    form.reset();
    // Will be responsible for resetting the files
    setResetIndex(c => c+1);
    setEditFormData(null);
  }

  const getImagePath = (chapterId, fileName) => {
    return [
      'cms_data',
      keys.grade_id,
      'scope',
      keys.scope_id,
      'category',
      keys.category_id,
      'subject',
      keys.subject_id,
      'chapter',
      chapterId,
      fileName
    ].join('/')
  }

  const isFormValid = () => {
    return !(form._invalid || !illustrationArt);
  }

  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allChapters,
      isFormValid: isFormValid,
      header: 'Chapter',
      type: 'chapter',
      resetForm: resetForm,
      getMetaData: function() {
        const name = form.get('chapter_name').value;
        const serialOrder = +form.get('serial_order').value;
        const chapterNumber = +form.get('chapter_number').value;

        let id;
        if (isEditMode) id = editFormData.id;
        else id = joinToId(keys.subject_id ?? keys.category_id, normalizeText(name));

        if (!isEditMode) {
          id = sanitizeId(allChapters, id, name);
        }

        return {id, genericName: name.trim().toLowerCase(), serialOrder, options: [{key: 'chapter_number', value: chapterNumber, label: 'Chapter Number'}]};
      },
      createObj: async function(chapterId) {
        const progressCb = ({progress}) => {
          setStatus('uploading');
          setProgress(progress);
        };

        const illustrationUrl = await uploadImage({
          data: illustrationArt,
          editFormData,
          isEditMode,
          fileName: 'illustration.png',
          id: chapterId,
          getImagePath,
          progressCb
        })

        setStatus(null);
        setProgress(0);

        return {
          description: form.get('description').value.trim(),
          generic_name: form.get('chapter_name').value.trim().toLowerCase(),
          id: chapterId,
          hex_color: form.get('hex_color').value,
          illustration_art: illustrationUrl,
          serial_order: +form.get('serial_order').value,
          chapter_name: form.get('chapter_name').value.trim(),
          chapter_number: +form.get('chapter_number').value,
        }
      }
    })


    // let logObj = {};
    // let itemId = null;
    // window.onbeforeunload = function() {
    //   return 'Please confirm!'
    // }
    // try {
    //   e.preventDefault();
    //   if (loading) return;
    //
    //
    //   form.validate();
    //   if (!isFormValid()) return;
    //
    //   let chapterId;
    //   let chapterName = form.get('chapter_name').value;
    //
    //   if (isEditMode) chapterId = editFormData.id;
    //   else chapterId = joinToId(keys.subject_id ?? keys.category_id, normalizeText(chapterName));
    //
    //   if (!isEditMode) {
    //     chapterId = sanitizeId(allChapters, chapterId, chapterName);
    //   }
    //
    //   itemId = chapterId;
    //
    //   if (!isUniqueSubject(chapterId, chapterName.toLowerCase(), form.get('chapter_number').value, form.get('serial_order').value)) {
    //     showSnackbar('Serial order, Chapter Number and Name must be unique in the group.', 'error');
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
    //     illustrationUrl = await uploadImage(getImagePath(chapterId, 'illustration.png'), illustrationArt, progressCb, completeCb);
    //   } else if (typeof illustrationArt === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'illustration.png');
    //     const destination = getImagePath(chapterId, 'illustration.png');
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
    //   setStatus(null);
    //   setProgress(0);
    //
    //   const ist = await fetchIndianTime();
    //
    //   const chapter = {
    //     description: form.get('description').value.trim(),
    //     generic_name: form.get('chapter_name').value.trim().toLowerCase(),
    //     id: chapterId,
    //     hex_color: form.get('hex_color').value,
    //     illustration_art: illustrationUrl,
    //     serial_order: +form.get('serial_order').value,
    //     chapter_name: form.get('chapter_name').value.trim(),
    //     chapter_number: +form.get('chapter_number').value,
    //     updated_on: +ist,
    //   }
    //
    //   const chapterRef = db.collection('cms_data')
    //     .doc(keys.grade_id)
    //     .collection('scope')
    //     .doc(keys.scope_id)
    //     .collection('category')
    //     .doc(keys.category_id)
    //     .collection('subject')
    //     .doc(keys.subject_id)
    //     .collection('chapter')
    //     .doc(chapterId);
    //
    //   await chapterRef.set(chapter, {merge: isEditMode});
    //
    //
    //   setStatus('completed');
    //
    //   await new Promise((res) => setTimeout(res, 2000));
    //   setStatus(null);
    //   setLoading(false);
    //   setActiveItemInColumn({id: chapterId, type: 'chapter'});
    //   const msg = 'Chapter has been ' + (!isEditMode ? 'created' : 'updated') + ' successfully!';
    //   showSnackbar(msg, 'success');
    //   resetForm();
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, chapter) : null,
    //     itemId: chapter.id
    //   };
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
        <h2>{isEditMode ? 'Edit' : 'Create'} Chapter</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Name</label>
      <SessionFormInput
        invalid={errors?.chapter_name}
        {...register('chapter_name')}
      />
      <label htmlFor="">Description</label>
      <SessionFormInput
        invalid={errors?.description}
        {...register('description')}
      />
      <label htmlFor="">Number</label>
      <SessionFormInput
        invalid={errors?.chapter_number}
        type="number"
        {...register('chapter_number')}
      />
      <HexColorInput form={form} register={register} controlName="hex_color" handleChangeValue={handleChangeValue} />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        invalid={errors?.serial_order}
        type="number"
        {...register('serial_order')}
      />
      <PustackUploadButton url={typeof illustrationArt === 'string' ? illustrationArt : null} resetIndex={resetIndex} setFile={setIllustrationArt} label="Upload Illustration Art" />
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
        {loading && !['uploading', 'completed'].includes(status) ? <Lottie
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
