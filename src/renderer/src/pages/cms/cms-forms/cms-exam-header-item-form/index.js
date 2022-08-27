import React from 'react';
import CmsExamBaseForm from "../cms-exam-base-form";

export default function CmsExamHeaderItemForm(props) {
  const lectureTypeItems = [{id: 1, value: 'video'}, {id: 2, value: 'note'}];

  return (
    <CmsExamBaseForm {...props} isLectureHeaderItem={true} lectureTypeItems={lectureTypeItems} />
  )
}
