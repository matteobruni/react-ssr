import React from 'react';
import CmsExamBaseForm from "../cms-exam-base-form";

export default function CmsExamItemForm(props) {
  const lectureTypeItems = [{id: 1, value: 'video'}, {id: 2, value: 'note'}, {id: 3, value: 'header'}];

  return (
    <CmsExamBaseForm {...props} isLectureHeaderItem={false} lectureTypeItems={lectureTypeItems} />
  )
}
