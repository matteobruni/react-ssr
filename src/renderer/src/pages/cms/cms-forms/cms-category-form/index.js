import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CloseRounded} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import PustackButton from "../../../../components/global/pustack-btn";
import {fetchIndianTime, showSnackbar} from "../../../../helpers";
import {db} from "../../../../firebase_config";
import {Switch} from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import useForm, {Validators} from "../../../../hooks/form";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {useOverlayLoader} from "../../../../hooks/overlayLoader";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";



export const joinToId = (...args) => args.join('_').toLowerCase().replaceAll(/[^a-zA-Z0-9_]/g, '');
const normalizeText = (str) => str.replaceAll(' ', '').toLowerCase();

const PurpleSwitch = withStyles({
  switchBase: {
    color: 'lightgray',
    '&$checked': {
      color: 'dodgerblue',
    },
    '&$checked + $track': {
      backgroundColor: 'dodgerblue',
    },
  },
  checked: {},
  track: {},
})(Switch);

export const sanitizeId = (allItems, id, name) => {
  let index = 1;
  let isThere = true;
  let cloneId = id;
  while(isThere) {
    const validate = () => allItems.some(c => (c.generic_name !== name.toLowerCase() && cloneId === c.id));
    if(validate()) {
      cloneId = id
      cloneId += '_' + index.toString();
      index += 1;
    } else {
      isThere = false;
    }
  }
  return cloneId;
}

export default function CmsCategoryForm({allCategories, keys}) {
  const formRef = useRef(null);
  const [checked, setChecked] = useState(false);
  const {form, errors, register, handleChangeValue} = useForm({
    category_name: ['', [Validators.req()]],
    category_description: ['', [Validators.req()]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
  });
  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;
  const {handleSubmit, loading} = useSubmitCMS();

  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate
  }, [editFormData]);

  const isNotLearn = useMemo(() => !keys.scope_id.includes('learn'), [keys])

  useEffect(() => {
    if(!editFormData) {
      resetForm();
      return
    }
    handleChangeValue('category_name', editFormData.category_name);
    handleChangeValue('category_description', editFormData.category_description ?? editFormData.description);
    handleChangeValue('serial_order', +editFormData.serial_order);
    setChecked(editFormData.skippable);
  }, [editFormData, handleChangeValue]);

  const isFormValid = () => {
    return !form._invalid;
  }

  const resetForm = () => {
    form.reset();
    setChecked(false);
    setEditFormData(null);
  }

  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allCategories,
      isFormValid: isFormValid,
      header: 'Category',
      type: 'category',
      resetForm: resetForm,
      getMetaData: function() {
        const name = formRef.current.category_name.value;
        const serialOrder = +formRef.current.serial_order.value;

        let id;
        if (isEditMode) id = editFormData.id;
        else id = joinToId(keys.scope_id, normalizeText(name));

        if (!isEditMode) {
          id = sanitizeId(allCategories, id, name);
        }

        return {id, genericName: name.trim().toLowerCase(), serialOrder: serialOrder};
      },
      createObj: async function(id) {
        const categoryName = formRef.current.category_name.value;
        const serialOrder = +formRef.current.serial_order.value;
        const skippable = isNotLearn || formRef.current.skippable.checked;
        const categoryDescription = formRef.current.category_description.value;


        return {
          id,
          category_image_url: null,
          category_name: categoryName.trim(),
          description: categoryDescription.trim(),
          generic_name: categoryName.trim().toLowerCase(),
          serial_order: serialOrder,
          skippable
        }
      },
      onItemCRUDComplete: async function(obj, docRef) {
        if (!isEditMode) {
          // const ist = await fetchIndianTime();

          if (keys.scope_id.includes('learn')) {
            const subject = {
              description: obj.description.trim(),
              generic_name: obj.category_name.trim().toLowerCase(),
              id: joinToId(keys.scope_id, normalizeText(obj.category_name.trim())),
              main_thumbnail_url: null,
              mini_thumbnail_url: null,
              serial_order: 1,
              subject_name: obj.category_name.trim(),
              // updated_on: +ist,
            }

            if (obj.skippable === 'true' || obj.skippable === true) {
              await docRef
                .collection('subject')
                .doc(obj.id)
                .set(subject);
            }
          }
        }
      }
    })
  }

  return (
    <form className="cms-modal" ref={formRef}>
      <header>
        <h2>{isEditMode ? 'Edit' : 'Create'} Category</h2>
      </header>
      <label htmlFor="">Category Name</label>
      <SessionFormInput
        invalid={errors?.category_name}
        {...register('category_name')}
      />
      <label htmlFor="">Category Description</label>
      <SessionFormInput
        invalid={errors?.category_description}
        {...register('category_description')}
      />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        invalid={errors?.serial_order}
        type="number"
        {...register('serial_order')}
      />
      {!isNotLearn && <div className="cms-modal-flex">
        Skippable
        <PurpleSwitch
          checked={checked}
          onChange={() => {
            if (!isEditMode) setChecked(c => !c);
          }}
          color="primary"
          name="skippable"
          inputProps={{'aria-label': 'primary checkbox'}}
        />
      </div>}
      <PustackButton isLoading={loading} className="cms-button" onClick={handleSubmit1} disabled={!isFormValid()}>
        {isEditMode ? 'Update' : 'Create'}
      </PustackButton>
    </form>
  )
}
