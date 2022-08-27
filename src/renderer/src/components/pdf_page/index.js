import React from 'react';
import {PdfPreview} from "../index";

export default function PdfPage({pdfLink}) {

  return (
    <PdfPreview
      containerClasses={{
        width: '100%',
        height: '100%',
        maxWidth: 'unset'
      }}
      isPage={true}
      pdf={pdfLink}
    />
  )
}
