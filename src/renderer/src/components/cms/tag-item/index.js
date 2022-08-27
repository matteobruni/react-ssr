import React from 'react';
import "./style.scss";
import CloseIcon from "@material-ui/icons/Close";

export default function TagItem({label, onCrossClick}) {

  return (
    <div className="pustack-tag-item">
      <span>{label}</span>
      <CloseIcon onClick={onCrossClick} />
    </div>
  )
}
