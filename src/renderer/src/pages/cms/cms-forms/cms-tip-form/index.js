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
import PustackTabButton from "../../../../components/global/pustack-tab-btn";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {URL_VALIDATORS} from "../cms-lecture-base-form";
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

export const tierItems = [{id: 1, value: 'basic'}, {id: 2, value: 'pro'}];

export default function CmsTipForm({allTips, keys}) {
  const formRef = useRef(null);
  const [resetIndex, setResetIndex] = useState(0);
  // const [loading, setLoading] = useOverlayLoader(false);
  const [status, setStatus] = useState(null);
  const [illustrationArt, setIllustrationArt] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [tier, setTier] = useState('basic');
  const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const [user] = useContext(UserContext).user;
  const [activeIndex, setActiveIndex] = useState(1);
  const {handleSubmit, loading} = useSubmitCMS();
  const {form, errors, register, handleChangeValue} = useForm({
    tip_name: ['', [Validators.req()]],
    description: ['', [Validators.req()]],
    hex_color: ['', [Validators.req(), Validators.test(HEX_REGEX)]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
    generic_url: ['', URL_VALIDATORS],
    youtube_url: ['', URL_VALIDATORS],
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
    handleChangeValue('tip_name', editFormData.tip_name);
    handleChangeValue('description', editFormData.description);
    handleChangeValue('hex_color', editFormData.hex_color);
    handleChangeValue('serial_order', +editFormData.serial_order);
    handleChangeValue('generic_url', editFormData.generic_url);
    handleChangeValue('youtube_url', editFormData.youtube_url);
    setIllustrationArt(editFormData.banner_image);
    setMainImage(editFormData.pdf_attachment);

  }, [editFormData, handleChangeValue])

  const isUniqueTip = (id, tipName, serialOrder) => {
    return allTips.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== tipName.trim()) || c.id === id;
      }
      return c.generic_name !== tipName.trim() && c.serial_order !== +serialOrder && c.id !== id;
    })
  }

  const getImagePath = (tipId, fileName) => {
    return [
      'cms_data',
      keys.grade_id,
      'scope',
      keys.scope_id,
      'category',
      keys.category_id,
      'tip',
      tipId,
      fileName
    ].join('/')
  }

  const isFormValid = () => {
    return !(form._invalid || !illustrationArt || !mainImage);
  }

  const resetForm = () => {
    form.reset();
    setEditFormData(null);
    // Will be responsible for resetting the files
    setResetIndex(c => c+1);
  }

  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allTips,
      isFormValid: isFormValid,
      header: 'Tip',
      type: 'tip',
      getMetaData: function() {
        const name = form.get('tip_name').value;
        const serialOrder = +form.get('serial_order').value;

        let id;

        if (isEditMode) id = editFormData.id;
        else id = joinToId(keys.category_id, normalizeText(name));

        if (!isEditMode) {
          id = sanitizeId(allTips, id, name);
        }
        return {id, genericName: name.trim().toLowerCase(), serialOrder};
      },
      createObj: async function(tipId) {

        const progressCb = ({progress}) => {
          setStatus('uploading');
          setProgress(progress);
        };

        const illustrationUrl = await uploadImage({
          data: illustrationArt,
          editFormData,
          isEditMode,
          fileName: 'illustration_art.png',
          id: tipId,
          getImagePath,
          progressCb
        })

        const mainImageUrl = await uploadImage({
          data: mainImage,
          editFormData,
          isEditMode,
          fileName: 'attachment.pdf',
          id: tipId,
          getImagePath,
          progressCb
        })

        return {
          description: form.get('description').value.trim(),
          generic_name: form.get('tip_name').value.trim().toLowerCase(),
          id: tipId,
          mini_thumbnail_url: null,
          hex_color: form.get('hex_color').value,
          pdf_attachment: mainImageUrl,
          banner_image: illustrationUrl,
          serial_order: +form.get('serial_order').value,
          tip_name: form.get('tip_name').value.trim(),
          generic_url: form.get('generic_url').value.trim(),
          youtube_url: form.get('youtube_url').value.trim(),
          tier: tierItems.find(c => c.id === activeIndex).value,
        }
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
    //   let tipId;
    //   const tipName = form.get('tip_name').value;
    //
    //   if (isEditMode) tipId = editFormData.id;
    //   else tipId = joinToId(keys.category_id, normalizeText(tipName));
    //
    //   if (!isEditMode) {
    //     tipId = sanitizeId(allTips, tipId, tipName);
    //   }
    //
    //   itemId = tipId;
    //
    //   if (!isUniqueTip(tipId, form.get('tip_name').value.toLowerCase(), form.get('serial_order').value)) {
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
    //     illustrationUrl = await uploadImage(getImagePath(tipId, 'illustration_art.png'), illustrationArt, progressCb, completeCb);
    //   } else if (typeof illustrationArt === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'illustration_art.png');
    //     const destination = getImagePath(tipId, 'illustration_art.png');
    //     setStatus('Copying Attachment');
    //     const response = await axios.post(baseUrl() + '/copyFile', {
    //       source_file: source,
    //       destination_file: destination
    //     });
    //     console.log('response - ', response, source, destination);
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     illustrationUrl = response.data.success;
    //   }
    //
    //   let mainImageUrl = mainImage;
    //
    //   if (mainImage instanceof File) {
    //     mainImageUrl = await uploadImage(getImagePath(tipId, 'attachment.pdf'), mainImage, progressCb, completeCb);
    //   } else if (typeof mainImage === 'string' && !isEditMode) {
    //     const source = getImagePath(editFormData.id, 'attachment.pdf');
    //     const destination = getImagePath(tipId, 'attachment.pdf');
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
    //   const tip = {
    //     description: form.get('description').value.trim(),
    //     generic_name: form.get('tip_name').value.trim().toLowerCase(),
    //     id: tipId,
    //     mini_thumbnail_url: null,
    //     hex_color: form.get('hex_color').value,
    //     pdf_attachment: mainImageUrl,
    //     banner_image: illustrationUrl,
    //     serial_order: +form.get('serial_order').value,
    //     tip_name: form.get('tip_name').value.trim(),
    //     generic_url: form.get('generic_url').value.trim(),
    //     youtube_url: form.get('youtube_url').value.trim(),
    //     tier: tierItems.find(c => c.id === activeIndex).value,
    //     // updated_on: +ist,
    //   }
    //
    //   const tipRef = db.collection('cms_data')
    //     .doc(keys.grade_id)
    //     .collection('scope')
    //     .doc(keys.scope_id)
    //     .collection('category')
    //     .doc(keys.category_id)
    //     .collection('tip')
    //     .doc(tip.id);
    //
    //   await tipRef.set(tip, {merge: isEditMode});
    //
    //   // Updating status_tracker
    //   // setStatus('Updating status');
    //
    //   await tipRef
    //     .collection('status_tracker')
    //     .doc('status_tracker')
    //     .set({
    //       // elastic_status: {'in-progress': 'Feeding data to elastic search'},
    //       meta_status: {'in-progress': 'Updating to meta'},
    //     });
    //
    //   setStatus('completed');
    //
    //   await new Promise((res) => setTimeout(res, 2000));
    //   setStatus(null);
    //   setLoading(false);
    //   setActiveItemInColumn({id: tipId, type: 'tip'});
    //   const msg = 'Tip has been ' + (!isEditMode ? 'created' : 'updated') + ' successfully!';
    //   showSnackbar(msg, 'success');
    //   resetForm();
    //
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, tip) : null,
    //     itemId: tip.id
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
    //   showSnackbar('Something went wrong.', 'error');
    // }
    // await createLog(logObj)
    // window.onbeforeunload = null;
  }

  return (
    <form className="cms-modal" ref={formRef}>
      <header>
        <h2>{isEditMode ? 'Edit' : 'Create'} Tip</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Tier</label>
      <PustackTabButton items={tierItems} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      <label htmlFor="">Name</label>
      <SessionFormInput
        invalid={errors?.tip_name}
        {...register('tip_name')}
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
      <PustackUploadButton url={typeof illustrationArt === 'string' ? illustrationArt : null} setFile={setIllustrationArt} resetIndex={resetIndex} label="Upload Banner Image" />
      <PustackUploadButton url={typeof mainImage === 'string' ? mainImage : null} setFile={setMainImage} accept={'application/pdf'} resetIndex={resetIndex} label="Upload Pdf Attachment" />
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
