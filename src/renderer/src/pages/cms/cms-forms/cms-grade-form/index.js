import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CloseRounded} from "@material-ui/icons";
import {SessionFormInput} from "../../../../components/livesessions/sessionform-input";
import PustackButton from "../../../../components/global/pustack-btn";
import {showSnackbar} from "../../../../helpers";
import {db} from "../../../../firebase_config";
import useForm, {Validators} from "../../../../hooks/form";
import {CmsContext} from "../../../../context/cms/CmsContext";
import {useOverlayLoader} from "../../../../hooks/overlayLoader";
import {joinToId, sanitizeId} from "../cms-category-form";
import {createLog, prepareAffectedKeys} from "../../../../helpers/cms";
import {UserContext} from "../../../../context";
import {normalizeText, uploadImage} from "../cms-chapter-form";
import useSubmitCMS from "../../../../hooks/cms/useSubmitCMS";

export default function CmsGradeForm({allGrades}) {
  const formRef = useRef(null);
  // const [loading, setLoading] = useOverlayLoader(false);
  const [user] = useContext(UserContext).user;
  const {form, errors, register, handleChangeValue} = useForm({
    grade_name: ['', [Validators.req()]],
    grade_number: ['', [Validators.req(), Validators.isInt()]],
    serial_order: ['', [Validators.req(), Validators.isInt({min: 1})]],
  });
  const {handleSubmit, loading} = useSubmitCMS();

  const [editFormData, setEditFormData] = useContext(CmsContext).editFormData;


  const isEditMode = useMemo(() => {
    return Boolean(editFormData) && !editFormData.duplicate
  }, [editFormData]);

  useEffect(() => {
    if(!editFormData) {
      form.reset();
      return
    }
    handleChangeValue('grade_name', editFormData.grade_name);
    handleChangeValue('grade_number', editFormData.grade_number);
    handleChangeValue('serial_order', +editFormData.serial_order);

  }, [editFormData, handleChangeValue])

  const isFormValid = () => {
    return !form._invalid;
  }

  const isUniqueGrade = (id, gradeName, serialOrder) => {
    return allGrades.every(c => {
      if(isEditMode) {
        return (c.serial_order !== +serialOrder && c.generic_name !== gradeName.trim().toLowerCase()) || c.id === id;
      }
      return c.generic_name !== gradeName.trim() && c.serial_order !== +serialOrder && c.id !== id
    })
  }

  const generateGradeId = (gradeNumber) => {
    return `class_` + gradeNumber;
  }

  const createScope = async (gradeId, scope) => {
    await db.collection(`cms_data/${gradeId}/scope`).doc(scope.id).set(scope);
  }


  const handleSubmit1 = async (e) => {
    await handleSubmit({
      e,
      form,
      isEditMode,
      allItems: allGrades,
      isFormValid: isFormValid,
      header: 'Grade',
      type: 'grade',
      getMetaData: function() {
        const name = formRef.current.grade_name.value;
        const serialOrder = +formRef.current.serial_order.value;
        const gradeNumber = +formRef.current.grade_number.value;

        let id;

        if (isEditMode) {
          id = editFormData.id;
        } else {
          id = generateGradeId(gradeNumber);
          id = sanitizeId(allGrades, id, name);
        }

        return {id, genericName: name.trim().toLowerCase(), serialOrder, options: [{value: gradeNumber, key: 'grade_number', label: 'Grade Number'}]};
      },
      createObj: async function(gradeId) {
        const gradeName = formRef.current.grade_name.value;
        const serialOrder = formRef.current.serial_order.value;
        const gradeNumber = formRef.current.grade_number.value;


        // return;
        return {
          id: gradeId,
          grade_name: gradeName.trim(),
          grade_number: +gradeNumber,
          serial_order: +serialOrder,
          generic_name: gradeName.trim().toLowerCase()
        };
      },
      onItemCRUDComplete: async function(obj, docRef) {
        if (!isEditMode) {
          await createScope(obj.id, {
            id: joinToId(obj.id, 'learn'),
            serial_order: 1,
            generic_name: 'learn',
            scope_name: 'Learn'
          });

          await createScope(obj.id, {
            id: joinToId(obj.id, 'tips'),
            serial_order: 2,
            generic_name: 'tips',
            scope_name: 'Tips'
          });

          await createScope(obj.id, {
            id: joinToId(obj.id, 'practice'),
            serial_order: 3,
            generic_name: 'practice',
            scope_name: 'Practice'
          });
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
    //
    //   form.validate();
    //   if (!isFormValid()) return;
    //
    //   setLoading(true);
    //
    //   const gradeName = formRef.current.grade_name.value;
    //   const serialOrder = formRef.current.serial_order.value;
    //   const gradeNumber = formRef.current.grade_number.value;
    //   let gradeId;
    //
    //   if (isEditMode) {
    //     gradeId = editFormData.id;
    //   } else {
    //     gradeId = generateGradeId(gradeNumber);
    //     gradeId = sanitizeId(allGrades, gradeId, gradeName);
    //   }
    //
    //   if (!isUniqueGrade(gradeId, gradeName.toLowerCase(), serialOrder)) {
    //     showSnackbar('Serial order and Name must be unique in the group.', 'error');
    //     return setLoading(false);
    //   }
    //
    //   // return;
    //   const gradeObj = {
    //     id: gradeId,
    //     grade_name: gradeName.trim(),
    //     grade_number: gradeNumber,
    //     serial_order: serialOrder,
    //     generic_name: gradeName.trim().toLowerCase()
    //   };
    //
    //   await createGrade(gradeObj)
    //
    //   if (!isEditMode) {
    //     await createScope(gradeId, {
    //       id: joinToId(gradeId, 'learn'),
    //       serial_order: 1,
    //       generic_name: 'learn',
    //       scope_name: 'Learn'
    //     });
    //
    //     await createScope(gradeId, {
    //       id: joinToId(gradeId, 'tips'),
    //       serial_order: 2,
    //       generic_name: 'tips',
    //       scope_name: 'Tips'
    //     });
    //
    //     await createScope(gradeId, {
    //       id: joinToId(gradeId, 'practice'),
    //       serial_order: 3,
    //       generic_name: 'practice',
    //       scope_name: 'Practice'
    //     });
    //   }
    //
    //   const msg = isEditMode ? 'Grade updated' : 'Grade created';
    //
    //   showSnackbar(msg, 'success');
    //   form.reset();
    //   setEditFormData(null);
    //   console.log('setLoading - false');
    //   setLoading(false);
    //   setActiveItemInColumn({id: gradeId, type: 'grade'});
    //
    //   logObj = {
    //     level: 'success',
    //     action: isEditMode ? 'UPDATE' : 'CREATE',
    //     status: msg,
    //     user,
    //     affectedKeys: isEditMode ? prepareAffectedKeys(editFormData, gradeObj) : null,
    //     itemId: gradeObj.id
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
        <h2>{isEditMode ? 'Edit' : 'Create'} Grade</h2>
        {/*<div className="cms-modal-close">*/}
        {/*  <CloseRounded />*/}
        {/*</div>*/}
      </header>
      <label htmlFor="">Grade Name</label>
      <SessionFormInput
        // placeholder="Grade Name"
        // name="grade_name"
        invalid={errors?.grade_name}
        {...register('grade_name')}
      />
      <label htmlFor="">Grade Number</label>
      <SessionFormInput
        // placeholder="Grade Number"
        // name="grade_number"
        type="number"
        invalid={errors?.grade_number}
        {...register('grade_number')}
      />
      <label htmlFor="">Serial Order</label>
      <SessionFormInput
        // placeholder="Serial Order"
        // name="serial_order"
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
