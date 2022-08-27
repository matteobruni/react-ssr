import React, {Fragment, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {CmsContext} from "../../../context/cms/CmsContext";
import {createLog, deleteFn, prepareAffectedKeys} from "../../../helpers/cms";
import {prepareObjectFromKeys} from "../../../database/cms";
import PustackButton from "../../../components/global/pustack-btn";
import {fetchIndianTime, showSnackbar} from "../../../helpers";
import {ModalContext} from "../../../context/global/ModalContext";
import {ThemeContext, UserContext} from "../../../context";
import Lottie from "lottie-react-web";
import {circularProgress} from "../../../assets";
import refreshLottie from '../../../assets/lottie/refresh.json';
import refreshButton from '../../../assets/images/sync.png';
import axios from "axios";
import {baseUrl} from "../../../database/agora/config";
import {db, functions} from "../../../firebase_config";
import {Tooltip} from "@material-ui/core";
import {useHistory} from "react-router-dom";

const IMAGE_KEYS = ['illustration_art', 'main_thumbnail_url', 'mini_thumbnail_url', 'banner_image'];
const REFRESHABLE_TYPES = ['category', 'chapter', 'practice'];
export const URL_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
export const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const DeleteCmsItemConfirmation = ({itemId, itemRef, name, header, type, keys, handleAfterDeleteItem}) => {
  const [, setConfirmationModalData] = useContext(ModalContext).state;
  const [isDarkMode] = useContext(ThemeContext).theme;
  const [deleting, setDeleting] = useState(false);
  const [user] = useContext(UserContext).user;
  // const [,setActiveItemInColumn] = useContext(CmsContext).activeItemInColumn;

  // TODO: Refactor this
  const handleDeleteItem = useCallback(async () => {
    document.body.style.pointerEvents = 'none';
    if(deleting) return;
    setDeleting(true);
    const docRef = db.collection('cms_logs').doc();
    const ist = await fetchIndianTime();
    try {
      await itemRef.set({log_id: docRef.id}, {merge: true});

      const response = await deleteFn[type](keys, {
        uid: user.uid,
        name: user.name,
        profilePicture: user.profile_url
      });

      console.log('response - ', response);

      if(response.status !== 200) {
        await docRef.set({
          id: docRef.id,
          requested_by: {
            id: user.uid,
            name: user.name,
            image: user.profile_url
          },
          action: 'DELETE',
          status: response instanceof Error ? response.message : response.data.fail,
          item_id: itemId,
          level: 'error',
          timestamp: +ist
        });
      } else {
        await docRef.set({
          id: docRef.id,
          requested_by: {
            id: user.uid,
            name: user.name,
            image: user.profile_url
          },
          action: 'DELETE',
          status: 'Delete for the item requested.',
          item_id: itemId,
          level: 'success',
          timestamp: +ist
        });
      }
      showSnackbar('Item is deleted successfully!', 'success');
    } catch (e) {
      console.log('Error in deleting the CMS Item', e);
      await docRef.set({
        id: docRef.id,
        requested_by: {
          id: user.uid,
          name: user.name,
          image: user.profile_url
        },
        action: 'DELETE',
        status: e.message,
        item_id: itemId,
        level: 'error',
        timestamp: +ist
      });
    }
    setDeleting(false);
    setConfirmationModalData(data => ({...data, open: false}));
    document.body.style.pointerEvents = 'all';
    handleAfterDeleteItem(type, itemId);
  }, [keys]);


  return (
    <div className={"delete-session-confirmation" + (isDarkMode ? ' dark' : '')}>
      <h2>Delete {header}</h2>
      <div className="text">Are you sure you want to delete <span className="delete-session-confirmation-item">{name}</span> item? This cannot be undone.</div>
      <div className="flex-buttons">
        <div className="danger btn"
             onClick={handleDeleteItem}
        >{
          deleting ? (
            <Lottie options={{animationData: circularProgress, loop: true}} style={{padding: 0}} />
          ) : 'Yes'
        }</div>
        <div className="btn" onClick={() => {
          setConfirmationModalData(data => ({...data, open: false}))
        }}>No</div>
      </div>
    </div>
  )
}

const MAX_TEXT_LENGTH = 80;

const isUrl = (text) => {
  const regex = new RegExp(URL_REGEX);

  return typeof text !== "string" ? false : text.match(regex);
}

// const classNames = (...arr) => {
//
// }

const isHex = (string) => {
  const regex = new RegExp(HEX_REGEX);

  return typeof string !== "string" ? false : string.match(regex);
}

export const TrimmedText = ({keyId: key, value}) => {
  const [text, setText] = useState(value);
  const [isTrimmed, setIsTrimmed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if(typeof value !== 'string') {
      setText(value);
      return;
    }
    if(value.toString().length <= MAX_TEXT_LENGTH){
      setText(value);
      setIsTrimmed(false);
      return;
    }
    if(expanded) return setText(value);
    const newTrimmedText = value.toString().slice(0, MAX_TEXT_LENGTH - 3);
    setText(newTrimmedText + '...');
    setIsTrimmed(true);
  }, [value, expanded]);

  return (
    <div className={"cms-content-info-details-information-items-value" + (isHex(value) ? ' hex' : '') + (isUrl(value) ? ' url' : '') + (typeof value === 'boolean' ? ' boolean' : '')}>
      {!isUrl(value || key?.includes('name') || key?.includes('content') || key?.includes('id')) ? (
        isHex(value) ? <>
          <div className="color-container" style={{backgroundColor: value.toString()}} />
          <span>{text.toString()}</span>
        </> : <>
          <span>{text.toString()}</span>
          {isTrimmed && (
            <div className='trimmed' onClick={() => {
              if(isTrimmed) {
                setExpanded(c => !c);
              }
            }}>
              <button>Show {expanded ? 'Less' : 'More'}</button>
            </div>
          )}
        </>
      ) : (
        <a href={value} target="_blank">
          Link
          <svg
            width={11}
            height={11}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 6.5V9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h2.5m1.75 3.75L10 1 6.25 4.75ZM7.5 1H10v2.5L7.5 1Z"
              stroke="#DC3737"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      )}
    </div>
  )
}

export default function CmsInfo({infoData, type, keys, header, handleAfterDeleteItem}) {
  const [_, setEditFormData] = useContext(CmsContext).editFormData;
  const [, setInfoData] = useContext(CmsContext).infoData;
  const [, setConfirmationModalData] = useContext(ModalContext).state;
  const [refreshing, setRefreshing] = useState(false);
  const [user] = useContext(UserContext).user;
  const [, setActiveDirRef] = useContext(CmsContext).activeDirRef;
  const history = useHistory();

  const data = useMemo(() => {
    if(infoData) return infoData.docData;
    return null;
  }, [infoData]);

  const handleRefresh = useCallback(async () => {
    let logObj = {};
    try {
      if(!keys || refreshing) return;
      setRefreshing(true);
      let res, refreshFn;
      if(type === 'chapter') {
        refreshFn = functions.httpsCallable(
          "onChapterRefresh"
        );
      }
      if(type === 'category') {
        if(keys.scope_id.includes('learn')) {
          refreshFn = functions.httpsCallable(
            "onLearnCategoryRefresh"
          );
        }
        if(keys.scope_id.includes('practice')) {
          refreshFn = functions.httpsCallable(
            "onPracticeCategoryRefresh"
          );

        }
        if(keys.scope_id.includes('tip')) {
          refreshFn = functions.httpsCallable(
            "onTipCategoryRefresh"
          );
        }
      }
      // console.log('type - ', type);
      if(type === 'practice') {
        refreshFn = functions.httpsCallable(
          "onExamRefresh"
        );
      }
      res = await refreshFn({...keys, exam_id: keys.practice_id});
      // console.log('res - ', res);
      setRefreshing(false);
      showSnackbar(res.data.SUCCESS ?? res.data.FAIL, res.data.SUCCESS ? 'success' : 'error');

      logObj = {
        level: res.data.SUCCESS ? 'success' : 'error',
        action: 'REFRESH',
        status: res.data.SUCCESS ?? res.data.FAIL,
        user,
        affectedKeys: null,
        itemId: data.id
      }

    } catch (e) {
      logObj = {
        level: 'error',
        affectedKeys: null,
        action: 'REFRESH',
        status: null,
        user,
        error: e.message,
        itemId: data.id
      };
      setRefreshing(false);
      showSnackbar('Something went wrong', 'error');
    }
    await createLog(logObj);
  }, [keys, type, refreshing])

  const images = useMemo(() => {
    let arr = [];
    IMAGE_KEYS.forEach(key => {
      if(data[key]) arr.push(data[key]);
    })
    return arr;
  }, [data]);

  return (
    <div className="cms-content-info-details">
      <div className={"cms-content-info-details-action" + (type === 'scope' ? ' disabled' : '')}>
        <h3 className="cms-content-info-details-header">
          Action
          <div className="cms-content-info-details-header-group">
            {REFRESHABLE_TYPES.includes(type) && <button onClick={handleRefresh} className={refreshing ? 'refreshing' : ''}>
              Refresh
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 437.716 437.716"
                style={{
                  enableBackground: "new 0 0 437.716 437.716",
                }}
                xmlSpace="preserve"
              >
                <path d="M436.599 179.224a15 15 0 0 0-13.816-9.321l-51.272-.229c-10.809-33.509-32.542-63.264-62.947-83.777-34.538-23.302-76.159-32.201-117.196-25.057-40.917 7.123-76.992 29.424-101.578 62.794-4.914 6.669-3.491 16.06 3.179 20.974 6.669 4.915 16.061 3.491 20.974-3.179 41.573-56.427 119.689-69.896 177.844-30.663 21.853 14.744 38.195 35.36 47.768 58.765l-37.897-.169h-.067a15 15 0 0 0-10.653 25.559l60.294 60.835c.038.039.081.071.119.109.105.104.219.198.327.299.247.23.495.461.756.673.115.094.239.177.357.268.268.205.536.41.815.595.123.081.253.15.378.228.292.181.583.361.886.522.111.059.229.107.343.164.332.164.665.326 1.007.465.087.035.179.063.267.097.382.147.767.285 1.16.401.066.02.136.033.202.052.422.118.848.222 1.28.302.017.003.032.009.049.012.08.015.159.02.239.033.367.061.734.118 1.106.151.081.008.162.007.243.014.35.026.699.055 1.053.057h.066c.318 0 .634-.026.949-.047.137-.008.275-.008.411-.02.255-.023.505-.065.757-.101.207-.029.414-.054.619-.092.245-.045.486-.106.729-.163.202-.048.404-.094.604-.151.246-.069.488-.149.73-.231.185-.063.369-.126.551-.196a15.198 15.198 0 0 0 1.962-.916c.143-.08.283-.167.424-.252.248-.149.495-.299.734-.462.121-.083.235-.174.354-.26a14.88 14.88 0 0 0 1.735-1.454l60.832-60.294a15.009 15.009 0 0 0 3.323-16.335zM344.741 293.12c-6.668-4.914-16.059-3.492-20.974 3.177-41.576 56.417-119.69 69.882-177.834 30.651-21.849-14.741-38.19-35.354-47.763-58.753l37.888.169H136.145c8.284 0 15-6.716 15-15a14.96 14.96 0 0 0-4.816-11.014l-59.838-60.383c-.038-.038-.08-.071-.119-.108-.117-.115-.243-.221-.364-.333-.235-.217-.468-.436-.715-.637-.14-.114-.291-.216-.435-.325-.243-.183-.482-.369-.734-.536-.16-.107-.33-.199-.495-.299-.253-.154-.503-.311-.763-.45-.159-.084-.327-.155-.489-.234-.283-.137-.564-.276-.855-.395-.139-.057-.285-.102-.427-.155a14.948 14.948 0 0 0-.994-.344c-.121-.036-.246-.061-.369-.094a14.216 14.216 0 0 0-1.106-.261c-.03-.005-.057-.015-.087-.02-.11-.02-.219-.026-.33-.043-.35-.056-.699-.108-1.054-.139-.2-.018-.398-.022-.598-.032-.219-.011-.436-.035-.655-.036h-.067c-.057 0-.113.008-.17.008-.251.003-.498.022-.747.037-.236.015-.472.024-.706.05-.277.03-.549.077-.822.122-.205.034-.412.063-.615.105-.279.058-.553.133-.827.207-.195.052-.391.1-.584.16-.265.083-.524.182-.783.279-.196.073-.394.142-.587.224-.245.104-.481.222-.72.338-.198.097-.398.189-.592.294-.228.124-.446.261-.667.396-.191.117-.386.23-.572.356-.223.15-.435.315-.649.477-.17.128-.342.25-.506.386-.234.193-.455.401-.677.608-.109.102-.227.194-.334.299l-.149.147-.025.025-60.662 60.124a15.001 15.001 0 0 0 10.492 25.654l51.278.229c10.811 33.504 32.542 63.255 62.942 83.766 26.76 18.055 57.768 27.463 89.465 27.463 9.21 0 18.484-.796 27.723-2.403 40.914-7.121 76.987-29.417 101.575-62.783 4.916-6.669 3.494-16.059-3.175-20.974z" />
              </svg>
              {/*<Lottie style={{width: '1.4em'}} options={{animationData: refreshLottie, loop: true}}/>*/}
            </button>}
            <Tooltip title="Show Activity">
              <svg
                onClick={() => {
                  history.push(`/cms/log?key=item_id&value=${data.id}`);
                }}
                height={17}
                viewBox="0 0 56 60"
                width={17}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 60h40a4 4 0 0 0 4-4V10.83a2.984 2.984 0 0 0-.255-1.2.459.459 0 0 0-.033-.062 2.975 2.975 0 0 0-.592-.861L47.294.88a2.975 2.975 0 0 0-.861-.592.459.459 0 0 0-.062-.033A2.984 2.984 0 0 0 45.17 0H12a4 4 0 0 0-4 4v28H2a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h6v2a4 4 0 0 0 4 4zM52.586 9H49.88A2.883 2.883 0 0 1 47 6.12V3.414zM10 4a2 2 0 0 1 2-2h33v4.12A4.885 4.885 0 0 0 49.88 11H54v45a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2v-2h24a2 2 0 0 0 2-2V34a2 2 0 0 0-2-2H10zM2 34h32v18H2z" />
                <path d="M15 9h24a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM15 14h24a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM15 19h34a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM15 24h34a1 1 0 0 0 0-2H15a1 1 0 0 0 0 2zM50 28a1 1 0 0 0-1-1H15a1 1 0 0 0 0 2h34a1 1 0 0 0 1-1zM49 32h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 37h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 42h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 47h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM49 52h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2zM17 49a4 4 0 0 0 4-4v-4a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4zm-2-8a2 2 0 1 1 4 0v4a2 2 0 1 1-4 0zM12 48a1 1 0 0 0-1-1H7v-9a1 1 0 0 0-2 0v9a2 2 0 0 0 2 2h4a1 1 0 0 0 1-1zM27 49a4 4 0 0 0 4-4v-1a1 1 0 0 0-1-1h-2a1 1 0 0 0 0 2h1a2 2 0 1 1-4 0v-4a2 2 0 0 1 3.887-.667 1 1 0 0 0 1.884-.666A4 4 0 0 0 23 41v4a4 4 0 0 0 4 4z" />
              </svg>
            </Tooltip>
          </div>
        </h3>
        <div className="cms-content-info-details-action-btns">
          <div onClick={() => {
            setEditFormData(data);
            setInfoData(type);
            setActiveDirRef(infoData.ref.parent);
          }}>
            <button>
              <svg
                width={23}
                height={23}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m2.696 14.822-1.214 5.24a1.316 1.316 0 0 0 1.278 1.596c.091.01.183.01.275 0l5.27-1.213 10.12-10.082-5.647-5.635L2.696 14.822ZM21.607 5.316l-3.77-3.77a1.323 1.323 0 0 0-1.865 0l-2.095 2.096 5.641 5.641 2.096-2.096a1.322 1.322 0 0 0-.007-1.871Z"
                  fill="#00C3FF"
                />
              </svg>
            </button>
            <p>Edit</p>
          </div>
          <div>
            <button onClick={() => {
              setEditFormData({...data, duplicate: true});
              setInfoData(type);
              setActiveDirRef(infoData.ref.parent);
            }}>
              <svg
                width={22}
                height={22}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.286 9.429a3.143 3.143 0 0 1 3.143-3.143h9.428A3.143 3.143 0 0 1 22 9.429v9.428A3.143 3.143 0 0 1 18.857 22H9.43a3.143 3.143 0 0 1-3.143-3.143V9.43Z"
                  fill="#61D789"
                />
                <path
                  d="M3.143 0A3.143 3.143 0 0 0 0 3.143v9.428a3.143 3.143 0 0 0 3.143 3.143V3.143h12.571A3.143 3.143 0 0 0 12.571 0H3.143Z"
                  fill="#61D789"
                />
              </svg>
            </button>
            <p>Duplicate</p>
          </div>
          <div>
            <PustackButton onClick={async () => {
              setConfirmationModalData({open: true, Children: <DeleteCmsItemConfirmation itemRef={infoData.ref} itemId={data.id} handleAfterDeleteItem={handleAfterDeleteItem} header={header} name={data.generic_name} type={type} keys={keys} />});
            }}>
              <svg
                width={26}
                height={26}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 1.857a3.714 3.714 0 0 1 3.71 3.529l.004.185h4.643a.929.929 0 0 1 .109 1.851l-.109.007h-.788l-1.096 13.513a3.482 3.482 0 0 1-3.47 3.2H9.997a3.482 3.482 0 0 1-3.471-3.2L5.43 7.43h-.787a.929.929 0 0 1-.922-.82L3.714 6.5a.929.929 0 0 1 .82-.922l.109-.007h4.643A3.714 3.714 0 0 1 13 1.857Zm-2.09 8.59a.696.696 0 0 0-.69.601l-.006.095v7.428l.007.095a.696.696 0 0 0 1.38 0l.006-.095v-7.428l-.006-.095a.696.696 0 0 0-.69-.602Zm4.18 0a.696.696 0 0 0-.69.601l-.007.095v7.428l.006.095a.697.697 0 0 0 1.38 0l.007-.095v-7.428l-.007-.095a.697.697 0 0 0-.69-.602Z"
                  fill="#DC3737"
                />
                <path
                  d="M13 3.714a1.857 1.857 0 0 0-1.852 1.718l-.005.14h3.714l-.005-.14A1.857 1.857 0 0 0 13 3.714Z"
                  fill="#fff"
                />
              </svg>
            </PustackButton>
            <p>Delete</p>
          </div>
        </div>
      </div>
      {images.length > 0 && <div className="cms-content-info-details-illustration">
        <h3 className="cms-content-info-details-header">Illustration Arts</h3>
        <div className="cms-content-info-details-illustration-images">
          {images.map(image => (
            <div key={image} className="cms-content-info-details-illustration-images-image_container">
              <img src={image} alt=""/>
            </div>
          ))}
        </div>
      </div>}
      <div className="cms-content-info-details-information">
        <h3 className="cms-content-info-details-header">Information</h3>
        <div className="cms-content-info-details-information-items">
          {Object.keys(data).sort().map(key => {
            if(key === 'generic_name') return;

            if(type === 'lecture_item' || type === 'lecture_header_item') {
              if(key.includes('chapter') || key.includes('subject') || key.includes('category') || key.includes('grade') || key.includes('tab')) {
                return;
              }
            }

            if((typeof data[key] === 'string' && data[key].length > 0) || typeof data[key] === 'boolean' || typeof data[key] === 'number') {
              return (
                <Fragment key={key}>
                  <span>{key.split('_').join(' ')}</span>
                  <TrimmedText keyId={key} value={data[key]} />
                </Fragment>
              )
            }
          })}
        </div>
      </div>
      {data.manual_tags?.length > 0 && <div className="cms-content-info-details-tags">
        <h3 className="cms-content-info-details-header">Manual Tags</h3>
        <div className="cms-content-info-details-tags-items">
          {data.manual_tags.map(tagItem => <span key={tagItem}>{tagItem}</span>)}
        </div>
      </div>}
      {data.generated_tags?.length > 0 && <div className="cms-content-info-details-tags">
        <h3 className="cms-content-info-details-header">Auto-Generated Tags</h3>
        <div className="cms-content-info-details-tags-items">
          {data.generated_tags.map(tagItem => <span key={tagItem}>{tagItem}</span>)}
        </div>
      </div>}
    </div>
  )
}
