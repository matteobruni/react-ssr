import React, {useContext, useEffect, useRef, useState} from 'react';
import AddIcon from "@material-ui/icons/Add";
import {FileCopy, Folder} from "@material-ui/icons";
import {ChevronRight} from "../index";
import PustackShimmer from "../../../components/global/shimmer";
import Lottie from "lottie-react-web";
import EmptyBox from "../../../assets/lottie/empty-box.json";
import {CmsContext} from "../../../context/cms/CmsContext";
import {db} from "../../../firebase_config";
import CmsColItem from "./cms-col-item";

export const FolderCMSIcon = (props) => {
  return (
    <svg
      width={25}
      height={25}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M23.611 4.167H11.878c-.49 0-.962-.195-1.31-.543L8.877 1.931a1.852 1.852 0 0 0-1.31-.542H1.39C.622 1.389 0 2.01 0 2.778v19.444c0 .767.622 1.39 1.389 1.39H23.61c.767 0 1.389-.623 1.389-1.39V5.556c0-.768-.622-1.39-1.389-1.39Z"
        fill="#00AAF0"
      />
      <path
        d="M23.611 6.944H1.39C.622 6.944 0 7.566 0 8.334v13.888c0 .767.622 1.39 1.389 1.39H23.61c.767 0 1.389-.623 1.389-1.39V8.333c0-.767-.622-1.389-1.389-1.389Z"
        fill="#00C3FF"
      />
      <path
        d="M22.917 9.722h-.926a.694.694 0 0 1 0-1.389h.926a.694.694 0 0 1 0 1.39ZM19.213 9.722h-4.167a.694.694 0 0 1 0-1.389h4.167a.695.695 0 0 1 0 1.39Z"
        fill="#78D7FF"
      />
      <path
        d="M1.852 17.13v-6.895c0-.462-.315-.889-.77-.963A.927.927 0 0 0 0 10.185v12.037c0 .767.622 1.39 1.389 1.39H23.61c.767 0 1.389-.623 1.389-1.39v-.463H6.48a4.63 4.63 0 0 1-4.63-4.63Z"
        fill="#00AAF0"
      />
    </svg>
  )
}

export default React.forwardRef(function CmsCol({keys, header, dirRef, loader, items, path, type = 'grade', setPath, handleItemClick}, ref) {
  const [unsubscribes] = useContext(CmsContext).unsubscribes;
  const [activeItemInColumn, setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;
  const [, setEditFormData] = useContext(CmsContext).editFormData;
  const [infoData, setInfoData] = useContext(CmsContext).infoData;
  const [_, setActiveDirRef] = useContext(CmsContext).activeDirRef;

  // useEffect(() => {
  //   console.log('activeItemInColumn =- ', activeItemInColumn);
  //   if(!activeItemInColumn) return;
  //   const item = items.find(c => c.id === activeItemInColumn.id);
  //   const pathIndex = path.findIndex(c => c.type === type);
  //   if(!item) {
  //     setActiveItemInColumn(null);
  //     return
  //   }
  //   console.log('pathIndex - ', pathIndex);
  //   handleItemClick(item.docData, item.id, item.typeof, item.fileType, item.skippable, item.headerData, pathIndex, true);
  //   setActiveItemInColumn(null);
  // }, [activeItemInColumn, items, path, type])

  useEffect(() => {
    // console.log('unsubscribes - ', unsubscribes);
    return () => {
      typeof unsubscribes[type] === 'function' && unsubscribes[type]();
    }
  }, [unsubscribes[type]]);

  useEffect(() => {}, [infoData]);


  // useEffect(() => {
  //   if(prevItems.current?.length ? items?.length > prevItems.current?.length : items?.length > 0) handleAddItem(items.at(-1));
  //   prevItems.current = items;
  // }, [items])

  return (
    <div className="cms-content-main-col">
      <div className="cms-content-main-col-header">
        {loader ?
          <>
            <PustackShimmer style={{width: '70px', height: '30px', borderRadius: '5px'}} />
            <PustackShimmer style={{width: '30px', height: '30px', borderRadius: '25px'}} />
          </> :
          <>
            <h3>{header}</h3>
            <div className={"cms-content-main-col-add" + (type === 'scope' ? ' hide' : '') + (infoData === type ? ' form-active' : '')} onClick={() => {
              // console.log('infoData - ', infoData, path, type);
              if(infoData === type) {
                setActiveItemInColumn({id: path.at(-1)?.path, type: path.at(-1)?.type});
                return;
              }
              setInfoData(type);
              setEditFormData(null);
              setActiveDirRef(dirRef);
              setPath(c => {
                const lastIndex = c.findIndex(a => a.type === type);
                if(lastIndex < 0) return c;
                return c.slice(0, lastIndex + 1);
              })
            }}>
              <AddIcon />
            </div>
          </>
        }
      </div>
      <div className="cms-content-main-col-items" ref={ref}>
        {loader ?
          <>
            <div className={"cms-content-main-col-item"}>
              <PustackShimmer style={{width: '30px', height: '25px', marginRight: '8px', borderRadius: '5px'}} />
              <PustackShimmer style={{width: '110px', height: '25px', borderRadius: '5px'}} />
            </div>
            <div className={"cms-content-main-col-item"}>
              <PustackShimmer style={{width: '30px', height: '25px', marginRight: '8px', borderRadius: '5px'}} />
              <PustackShimmer style={{width: '90px', height: '25px', borderRadius: '5px'}} />
            </div>
            <div className={"cms-content-main-col-item"}>
              <PustackShimmer style={{width: '30px', height: '25px', marginRight: '8px', borderRadius: '5px'}} />
              <PustackShimmer style={{width: '100px', height: '25px', borderRadius: '5px'}} />
            </div>
            <div className={"cms-content-main-col-item"}>
              <PustackShimmer style={{width: '30px', height: '25px', marginRight: '8px', borderRadius: '5px'}} />
              <PustackShimmer style={{width: '90px', height: '25px', borderRadius: '5px'}} />
            </div>
          </> : items.length === 0 ? <>
            <div className="cms-content-main-col-empty">
              <Lottie
                options={{animationData: EmptyBox, loop: false}}
                speed={0.45}
              />
              <p>No Items</p>
            </div>
          </> : items.map(item => (
            <CmsColItem key={item.id} type={type} keys={keys} path={path} handleItemClick={handleItemClick} item={item} />
        ))}
      </div>
      {/*<div className="cms-content-main-col-item">*/}
      {/*  <Folder style={{color: '#69cbf8', fontSize: '2.6em'}} />*/}
      {/*  <p>Learn</p>*/}
      {/*  <ChevronRight />*/}
      {/*</div>*/}
      {/*<div className="cms-content-main-col-item">*/}
      {/*  <Folder style={{color: '#69cbf8', fontSize: '2.6em'}} />*/}
      {/*  <p>Tips</p>*/}
      {/*  <ChevronRight />*/}
      {/*</div>*/}
      {/*<div className="cms-content-main-col-item">*/}
      {/*  <Folder style={{color: '#69cbf8', fontSize: '2.6em'}} />*/}
      {/*  <p>Practice</p>*/}
      {/*  <ChevronRight />*/}
      {/*</div>*/}
    </div>
  )
})
