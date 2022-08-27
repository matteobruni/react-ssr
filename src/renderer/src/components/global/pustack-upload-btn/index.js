import React, {useEffect, useMemo, useRef, useState} from 'react';
import PdfImage from "../../../assets/blaze/pdf 2.svg";
import {Tooltip} from "@material-ui/core";

export default function PustackUploadButton({label, accept, setFile, resetIndex, url}) {
  const [fileData, setFileData] = useState(null);
  const initUrl = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    setFileData(null);
    setFile(null);
  }, [resetIndex]);

  useEffect(() => {
    if(typeof url === 'string') initUrl.current = url;
  }, [url]);

  useEffect(() => {
    if(!fileData) return;
    if(fileData.value instanceof File) {
      let url = URL.createObjectURL(fileData.value);
      setBlobUrl(url);
    }
  }, [fileData]);

  const handleNoteChange = async (e) => {
    if(e.target.files.length === 0) return;
    const pdfFile = e.target.files[0];
    // const pdfPageCount = await getPdfPageCount(pdfFile);

    let size = (pdfFile.size / (1000 * 1000)); // This size is in mb
    let unit = 'mb';

    if(size < 1) {
      size = pdfFile.size / 1000;
      unit = 'kb';
    }

    const obj = {
      value: pdfFile,
      // pageCount: pdfPageCount,
      fileName: pdfFile.name,
      size: size.toFixed(2),
      sizeUnit: unit
    }
    setFileData(obj);
    setFile(obj.value);
  }

  return (
    url ? <div className="session__form__upload-btn" style={{flex: 1, cursor: 'pointer'}}>
      <div className="session__form__upload-btn-flex-center session__form__upload-btn-info">
        {accept === 'application/pdf' ? <img width={20} height={20} src={PdfImage} alt="Pdf Icon"/> :
          <div className="session__form__upload-btn-image-view">
            <img width={20} height={20} src={url} alt="Pdf Icon"/>
          </div>
        }
        <a href={url} target="_blank">
          <span className="session__form__upload-btn-info-filename" style={{maxWidth: '100%', fontSize: '14px', color: '#38b29d'}}>View Attachment
          <svg
            width={11}
            height={11}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 6.5V9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h2.5m1.75 3.75L10 1 6.25 4.75ZM7.5 1H10v2.5L7.5 1Z"
              stroke="#38b29d"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        </a>
      </div>
      <div className="session__form__upload-btn-info-controls">
        {/*<Tooltip title="Delete Attachment" >*/}
        {/*  <svg style={{marginLeft: '10px'}} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"*/}
        {/*       xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"*/}
        {/*       viewBox="0 0 384 384" xmlSpace="preserve"*/}
        {/*       onClick={() => {*/}
        {/*         setFileData(null);*/}
        {/*         setFile(null);*/}
        {/*       }}*/}
        {/*  >*/}
        {/*    <g>*/}
        {/*      <path*/}
        {/*        d="M64,341.333C64,364.907,83.093,384,106.667,384h170.667C300.907,384,320,364.907,320,341.333v-256H64V341.333z"/>*/}
        {/*      <polygon*/}
        {/*        points="266.667,21.333 245.333,0 138.667,0 117.333,21.333 42.667,21.333 42.667,64 341.333,64 341.333,21.333 			"/>*/}
        {/*    </g>*/}
        {/*  </svg>*/}
        {/*</Tooltip>*/}
        <Tooltip title="Change Attachment" >
          <div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', alignItems: 'center', position: 'relative', marginLeft: '10px'}}>
            <input accept={accept ?? "image/*"} type="file" onChange={handleNoteChange}/>
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 viewBox="0 0 512.422 512.422" xmlSpace="preserve">
              <g>
                <path d="M41.053,223.464c2.667,1.067,5.76,1.067,8.427-0.213l83.307-37.867c5.333-2.56,7.573-8.96,5.013-14.293
                    c-2.453-5.12-8.533-7.467-13.76-5.12l-58.347,26.56c27.84-83.307,105.387-138.987,194.667-138.987
                    c93.547,0,175.36,62.507,198.933,152c1.493,5.653,7.36,9.067,13.013,7.573c5.653-1.493,9.067-7.36,7.573-13.013
                    c-26.027-98.773-116.267-167.893-219.52-167.893c-98.453,0-184.107,61.44-215.04,153.387l-24.533-61.333
                    c-1.813-5.547-7.893-8.64-13.44-6.827c-5.547,1.813-8.64,7.893-6.827,13.44c0.107,0.427,0.32,0.853,0.533,1.28l34.027,85.333
                    C36.146,220.158,38.279,222.398,41.053,223.464z"/>
                <path d="M511.773,380.904c-0.107-0.213-0.213-0.427-0.213-0.64l-34.027-85.333c-1.067-2.667-3.2-4.907-5.973-5.973
                    c-2.667-1.067-5.76-0.96-8.427,0.213l-83.307,37.867c-5.44,2.24-8,8.533-5.76,13.973c2.24,5.44,8.533,8,13.973,5.76
                    c0.213-0.107,0.427-0.213,0.64-0.32l58.347-26.56c-28.053,83.307-105.707,138.987-194.88,138.987
                    c-93.547,0-175.36-62.507-198.933-152c-1.493-5.653-7.36-9.067-13.013-7.573c-5.653,1.493-9.067,7.36-7.573,13.013
                    c25.92,98.88,116.267,167.893,219.52,167.893c98.453,0,184-61.44,215.04-153.387l24.533,61.333
                    c2.027,5.547,8.107,8.427,13.653,6.4C510.919,392.531,513.799,386.451,511.773,380.904z"/>
              </g>
            </svg>
          </div>
        </Tooltip>
      </div>
    </div> : <div className="session__form__upload-btn">
      {fileData ? (
          <>
            <div className="session__form__upload-btn-flex-left session__form__upload-btn-info">
              {accept === 'application/pdf' ? <img width={20} height={20} src={PdfImage} alt="Pdf Icon"/> :
                <div className="session__form__upload-btn-image-view">
                  <img width={20} height={20} src={blobUrl} alt="Pdf Icon"/>
                </div>
              }
              {/*<img width={20} height={20} src={PdfImage} alt="Pdf Icon"/>*/}
              {fileData?.value instanceof File ? <>
                <span className="session__form__upload-btn-info-filename">{fileData.fileName}</span>
                <span>{fileData.size + ' ' + fileData.sizeUnit}</span>
                {/*{fileData.pageCount && <span>{fileData.pageCount} pages</span>}*/}
              </> : <>
                <span className="session__form__upload-btn-info-filename" style={{maxWidth: '100%'}}>Attachment.jpeg</span>
              </>}
            </div>
            <div className="session__form__upload-btn-info-controls">
              <Tooltip title="Delete Attachment" >
                <svg style={{marginLeft: '10px'}} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                     xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                     viewBox="0 0 384 384" xmlSpace="preserve"
                     onClick={() => {
                       setFileData(null);
                       setFile(initUrl.current);
                     }}
                >
                  <g>
                    <path
                      d="M64,341.333C64,364.907,83.093,384,106.667,384h170.667C300.907,384,320,364.907,320,341.333v-256H64V341.333z"/>
                    <polygon
                      points="266.667,21.333 245.333,0 138.667,0 117.333,21.333 42.667,21.333 42.667,64 341.333,64 341.333,21.333 			"/>
                  </g>
                </svg>
              </Tooltip>
              <Tooltip title="Change Attachment" >
                <div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', alignItems: 'center', position: 'relative', marginLeft: '10px'}}>
                  <input accept={accept ?? "image/*"} type="file" onChange={handleNoteChange}/>
                  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                       viewBox="0 0 512.422 512.422" xmlSpace="preserve">
                    <g>
                      <path d="M41.053,223.464c2.667,1.067,5.76,1.067,8.427-0.213l83.307-37.867c5.333-2.56,7.573-8.96,5.013-14.293
                    c-2.453-5.12-8.533-7.467-13.76-5.12l-58.347,26.56c27.84-83.307,105.387-138.987,194.667-138.987
                    c93.547,0,175.36,62.507,198.933,152c1.493,5.653,7.36,9.067,13.013,7.573c5.653-1.493,9.067-7.36,7.573-13.013
                    c-26.027-98.773-116.267-167.893-219.52-167.893c-98.453,0-184.107,61.44-215.04,153.387l-24.533-61.333
                    c-1.813-5.547-7.893-8.64-13.44-6.827c-5.547,1.813-8.64,7.893-6.827,13.44c0.107,0.427,0.32,0.853,0.533,1.28l34.027,85.333
                    C36.146,220.158,38.279,222.398,41.053,223.464z"/>
                      <path d="M511.773,380.904c-0.107-0.213-0.213-0.427-0.213-0.64l-34.027-85.333c-1.067-2.667-3.2-4.907-5.973-5.973
                    c-2.667-1.067-5.76-0.96-8.427,0.213l-83.307,37.867c-5.44,2.24-8,8.533-5.76,13.973c2.24,5.44,8.533,8,13.973,5.76
                    c0.213-0.107,0.427-0.213,0.64-0.32l58.347-26.56c-28.053,83.307-105.707,138.987-194.88,138.987
                    c-93.547,0-175.36-62.507-198.933-152c-1.493-5.653-7.36-9.067-13.013-7.573c-5.653,1.493-9.067,7.36-7.573,13.013
                    c25.92,98.88,116.267,167.893,219.52,167.893c98.453,0,184-61.44,215.04-153.387l24.533,61.333
                    c2.027,5.547,8.107,8.427,13.653,6.4C510.919,392.531,513.799,386.451,511.773,380.904z"/>
                    </g>
                  </svg>
                </div>
              </Tooltip>
            </div>
          </>
        )
        : <>
          <input accept={accept ?? "image/*"} type="file" onChange={handleNoteChange}/>
          <div className="session__form__upload-btn-flex" style={{width: '100%', height: '100%'}}>
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 viewBox="0 0 286.036 286.036" xmlSpace="preserve">
              <g>
                <path style={{fill:'#39B29D'}} d="M231.641,113.009c-3.915-40.789-37.875-72.792-79.684-72.792c-32.351,0-60.053,19.201-72.819,46.752
                  c-3.844-1.225-7.849-2.056-12.095-2.056c-22.214,0-40.226,18.021-40.226,40.226c0,4.416,0.885,8.591,2.199,12.551
                  C11.737,147.765,0,166.26,0,187.696c0,32.092,26.013,58.105,58.105,58.105v0.018h160.896v-0.018
                  c37.044,0,67.035-30.009,67.035-67.044C286.036,146.075,262.615,118.927,231.641,113.009z M176.808,164.472h-15.912v35.864
                  c0,4.943-3.987,8.957-8.939,8.957h-17.878c-4.934,0-8.939-4.014-8.939-8.957v-35.864h-15.921c-9.708,0-13.668-6.481-8.823-14.383
                  l33.799-33.316c6.624-6.615,10.816-6.838,17.646,0l33.799,33.316C190.503,158,186.516,164.472,176.808,164.472z"/>
              </g>
            </svg>
            <span>{label}</span>
          </div>
        </>}
    </div>
  )
}
