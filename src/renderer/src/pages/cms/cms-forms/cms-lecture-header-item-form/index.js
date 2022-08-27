import React from 'react';
import CmsLectureBaseForm from "../cms-lecture-base-form";

export default function CmsLectureHeaderItemForm(props) {
  const lectureTypeItems = [{id: 1, value: 'video'}, {id: 2, value: 'note'}];

  return (
    <CmsLectureBaseForm {...props} isLectureHeaderItem={true} lectureTypeItems={lectureTypeItems} />
  )
}
