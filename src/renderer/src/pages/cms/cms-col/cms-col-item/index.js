import React, {useContext, useEffect, useMemo, useState} from 'react';
import {FileCopy} from "@material-ui/icons";
import {ChevronRight} from "../../index";
import {FolderCMSIcon} from "../index";
import {db} from "../../../../firebase_config";
import {Tooltip} from "@material-ui/core";
// import inProgressLottie from "../../../../assets/lottie/in-progress.json";
import inProgressLottie from "../../../../assets/lottie/in-progress-light.json";
import Lottie from "lottie-react-web";
import videoIcon from '../../../../assets/images/icons/video_icon.png';
import PdfImage from "../../../../assets/blaze/pdf 2.svg";
import {CmsContext} from "../../../../context/cms/CmsContext";

export default function CmsColItem({path, handleItemClick, item, type, keys}) {
  const [statusData, setStatusData] = useState({});
  const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;

  useEffect(() => {
    // console.log('path - ', path)
    if(!item || !keys) return;
    let unsubscribes;
    try {
      if(type === 'lecture_header_item' || type === 'lecture_item') {
        let ref = db
          .collection('cms_data')
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
          .doc(keys.tab_id)
          .collection('lecture_item');

        if(type === 'lecture_header_item') {
          ref = ref
            .doc(keys.lecture_item_id)
            .collection('lecture_header_item')
            .doc(item.id);
        } else {
          ref = ref.doc(item.id);
        }
        unsubscribes = ref
          .collection('status_tracker')
          .doc('status_tracker')
          .onSnapshot(snapshot => {
            setStatusData(c => ({...c, [item.id]: snapshot.data()}));
          });
      }
      if(type === 'exam_header_item' || type === 'exam_item') {
        let ref = db
          .collection('cms_data')
          .doc(keys.grade_id)
          .collection('scope')
          .doc(keys.scope_id)
          .collection('category')
          .doc(keys.category_id)
          .collection('exam')
          .doc(keys.practice_id)
          .collection('exam_item')

        if(type === 'exam_header_item') {
          ref = ref
            .doc(keys.exam_item_id)
            .collection('exam_header_item')
            .doc(item.id);
        } else {
          ref = ref
            .doc(item.id);
        }
        unsubscribes = ref
          .collection('status_tracker')
          .doc('status_tracker')
          .onSnapshot(snapshot => {
            setStatusData(c => ({...c, [item.id]: snapshot.data()}));
          });
      }
      if(type === 'tip') {
        unsubscribes = db
          .collection('cms_data')
          .doc(keys.grade_id)
          .collection('scope')
          .doc(keys.scope_id)
          .collection('category')
          .doc(keys.category_id)
          .collection('tip')
          .doc(item.id)
          .collection('status_tracker')
          .doc('status_tracker')
          .onSnapshot(snapshot => {
            setStatusData(c => ({...c, [item.id]: snapshot.data()}));
          });
      }
    } catch (e) {
      console.log('Error in cms-col - ', e);
    }

    return () => {
      if(unsubscribes) unsubscribes();
    }
  },[type, keys, item]);

  const statusMap = useMemo(() => {
    let statusArr = [];
    const itemStatusData = statusData[item.id];
    if(!itemStatusData) return [];
    const keys = Object.keys(itemStatusData);
    keys.sort().forEach(key => {
      if(!itemStatusData[key]) return;
      if(itemStatusData[key].success) statusArr.push({status: 'success', label: itemStatusData[key].success});
      else if(itemStatusData[key].fail) statusArr.push({status: 'fail', label: itemStatusData[key].fail});
      else statusArr.push({status: 'in-progress', label: itemStatusData[key]['in-progress']});
    })
    return statusArr;
  }, [statusData, item]);

  const itemType = useMemo(() => {
    const key = Object.keys(item.docData).find(c => c.endsWith('item_type'));
    if(!key) return null;
    return item.docData[key];
  }, [item])

  return (
    <div key={item.id} className={"cms-content-main-col-item" + (path.find(c => c.path === item.id) ? ' active' : '')} onClick={() => {
      setActiveItemInColumn({id: item.id, type});
    }}>
      {item.fileType !== 'file' ? <FolderCMSIcon style={{color: '#69cbf8'}}/> :
        itemType === 'video' ? <img src={videoIcon} alt=""/> : itemType === 'note' ? <img src={PdfImage} alt=""/> : <FileCopy style={{color: '#ffcd4e', fontSize: '2.6em'}} />}
      <p>{item.name}</p>
      {/*<Tooltip style={{fontStyle: '1.5em'}} title={'map.label'}>*/}
      {/*  <div>*/}
      {/*    <Lottie*/}
      {/*      title={'map.label'}*/}
      {/*      style={{width: '1.1em', height: '1.1em'}}*/}
      {/*      options={{animationData: inProgressLottie1, loop: true}}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</Tooltip>*/}
      {item.fileType === 'file' && statusMap.map(map => (
        <Tooltip key={map.label} style={{fontStyle: '1.5em'}} title={map.label}>
          {/*<div className={"cms-content-main-col-item-status " + map.status}/>*/}
          {map.status !== 'in-progress' ? <div className={"cms-content-main-col-item-status " + map.status}/> :
            <div>
              <Lottie
                title={map.label}
                style={{width: '1.25em', height: '1.25em'}}
                options={{animationData: inProgressLottie, loop: true}}
              />
            </div>
          }
        </Tooltip>
      ))}
      {item.fileType !== 'file' && <ChevronRight/>}
    </div>
  )
}
