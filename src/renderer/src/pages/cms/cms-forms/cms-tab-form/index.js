import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CloseRounded} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import PustackButton from "../../../../components/global/pustack-btn";
import {showSnackbar} from "../../../../helpers";
import {db} from "../../../../firebase_config";
import useForm, {Validators} from "../../../../hooks/form";
import {normalizeText} from "../cms-chapter-form";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {useOverlayLoader} from "../../../../hooks/overlayLoader";
import {joinToId, sanitizeId} from "../cms-category-form";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";


export default function CmsTabForm({allTabs, keys}) {
  const formRef = useRef(null);
  // const [, setLoading] = useOverlayLoader(false);
  const {form, errors, register, handleChangeValue} = useForm({
    tab_name: ['', [Validators.req()]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
  })
  const [user] = useContext(UserContext).user;
  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;
  const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const {handleSubmit, loading} = useSubmitCMS();

  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate
  }, [editFormData]);

  useEffect(() => {
    if(!editFormData) {
      form.reset();
      return
    }
    handleChangeValue('tab_name', editFormData.tab_name);
    handleChangeValue('serial_order', +editFormData.serial_order);

  }, [editFormData, handleChangeValue])

  const isFormValid = () => {
    return !form._invalid;
  }

  const isUniqueTab = (id, tabName, serialOrder) => {
    return allTabs.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== tabName.trim()) || c.id === id;
      }
      return c.generic_name !== tabName.trim() && c.serial_order !== +serialOrder && c.id !== id;
    })
  }

  const createTab = async (tab) => {
    await db
      .collection(`cms_data`)
      .doc(keys.grade_id)
      .collection('scope')
      .doc(keys.scope_id)
      .collection('category')
      .doc(keys.category_id)
      .collection('subject')
      .doc(keys.subject_id)
      .collection('chapter')
      .doc(keys.chapter_id)
      .collection('tab')
      .doc(tab.id)
      .set(tab, {merge: isEditMode})
  }

  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allTabs,
      isFormValid: isFormValid,
      header: 'Tab',
      type: 'tab',
      getMetaData: function() {
        const name = form.get('tab_name').value;
        const serialOrder = +form.get('serial_order').value;

        let id;

        if (isEditMode) id = editFormData.id;
        else id = joinToId(keys.chapter_id, normalizeText(name));

        if (!isEditMode) {
          id = sanitizeId(allTabs, id, name);
        }
        return {id, genericName: name.trim().toLowerCase(), serialOrder};
      },
      createObj: async function(tabId) {

        // return;
        return {
          id: tabId,
          tab_name: form.get('tab_name').value.trim(),
          serial_order: +form.get('serial_order').value,
          generic_name: form.get('tab_name').value.trim().toLowerCase()
        };
      }
    })
    // let logObj = {};
    // let itemId = null;
    // window.onbeforeunload = function() {
    //   return 'Please Confirm!';
    // }
    // try {
    //   e.preventDefault();
    //
    //   form.validate();
    //   if (!isFormValid()) return;
    //
    //   setLoading(true);
    //
    //   let tabId;
    //   const tabName = form.get('tab_name').value;
    //
    //   if (isEditMode) tabId = editFormData.id;
    //   else tabId = joinToId(keys.chapter_id, normalizeText(tabName));
    //
    //   if (!isEditMode) {
    //     tabId = sanitizeId(allTabs, tabId, tabName);
    //   }
    //
    //   itemId = tabId;
    //
    //   if (!isUniqueTab(tabId, form.get('tab_name').value.toLowerCase(), form.get('serial_order').value)) {
    //     showSnackbar('Serial order and Name must be unique in the group.', 'error');
    //     return setLoading(false);
    //   }
    //
    //   const tabObj = {
    //     id: tabId,
    //     tab_name: form.get('tab_name').value.trim(),
    //     serial_order: +form.get('serial_order').value,
    //     generic_name: form.get('tab_name').value.trim().toLowerCase()
    //   };
    //
    //   await createTab(tabObj)
    //   const msg = isEditMode ? 'Tab is updated successfully!' : 'Tab is created successfully!';
    //   showSnackbar(msg, 'success');
    //   form.reset();
    //   setEditFormData(null);
    //   setLoading(false);
    //   setActiveItemInColumn({id: tabId, type: 'tab'});
    //
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, tabObj) : null,
    //     itemId: tabObj.id
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
        <h2>{isEditMode ? 'Edit' : 'Create'} Tab</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Name</label>
      <SessionFormInput
        // placeholder="Grade Name"
        // name="grade_name"
        invalid={errors?.tab_name}
        {...register('tab_name')}
      />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        // placeholder="Grade Number"
        // name="grade_number"
        type="number"
        invalid={errors?.serial_order}
        {...register('serial_order')}
      />
      <PustackButton isLoading={loading} className="cms-button" disabled={!isFormValid()} onClick={handleSubmit1}>
        {isEditMode ? 'Update' : 'Create'}
      </PustackButton>
    </form>
  )
}
