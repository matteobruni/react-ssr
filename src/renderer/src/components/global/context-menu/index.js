import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import ReactDOM from "react-dom";
import "./style.scss"
import {ThemeContext} from "../../../context";

const CONTAINER_CLASS = 'context-menu-container';

export function PustackContextMenuItem({label, onItemClick}) {
  return (
    <div onClick={onItemClick} className="context-menu-item">
      <span>{label}</span>
    </div>
  )
}

export default function PustackContextMenu({posX, posY, autoScrollRef, handleClose, children}) {
  const ref = useRef();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [isDarkMode] = useContext(ThemeContext).theme;

  useLayoutEffect(() => {
    if(!ref.current || !posX || !posY) return;
    const {x, y} = ref.current.getBoundingClientRect();
    let isOverflowY = ref.current.clientHeight + y > window.innerHeight;
    let isOverflowX = ref.current.clientWidth + x > window.innerWidth;
    let addY = 0, addX = 0;
    if(isOverflowY) {
      addY = window.innerHeight - (ref.current.clientHeight + y + 15);
    }
    if(isOverflowX) {
      addX = window.innerWidth - (ref.current.clientWidth + x + 15);
    }
    setTop(posY + addY);
    setLeft(posX + addX);
  }, [posX, posY, ref.current]);

  useEffect(() => {
    if(!autoScrollRef.current) return;
    function handleOutsideClick(e) {
      const isInside = e.composedPath().some(c => c.classList?.contains(CONTAINER_CLASS));
      if(!isInside) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    autoScrollRef.current.addEventListener('scroll', handleClose);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      autoScrollRef.current && autoScrollRef.current.removeEventListener('scroll', handleClose);
    }
  }, [autoScrollRef.current])

  return posX && posY && ReactDOM.createPortal(
    <div className={CONTAINER_CLASS + (isDarkMode ? ' dark' : '')} ref={ref} style={{transform: `translate(${left}px, ${top}px)`}}>
      {children}
    </div>, document.getElementById('context-menu')
  )
}
