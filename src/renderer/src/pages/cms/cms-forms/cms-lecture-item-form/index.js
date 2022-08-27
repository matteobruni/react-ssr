import React from 'react';
import CmsLectureBaseForm from "../cms-lecture-base-form";

export default function CmsLectureItemForm(props) {
  const lectureTypeItems = [{id: 1, value: 'video'}, {id: 2, value: 'note'}, {id: 3, value: 'header'}];

  return (
    <CmsLectureBaseForm {...props} isLectureHeaderItem={false} lectureTypeItems={lectureTypeItems} />
  )
}
