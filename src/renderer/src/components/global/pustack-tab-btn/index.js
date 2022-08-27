import React, {useEffect, useRef, useState} from 'react';
import "./style.scss";

const ITEM_CLASS = 'pustack-tab-button-item';
export default function PustackTabButton({items, activeIndex = 0, setActiveIndex}) {
  const [obj, setObj] = useState(null);
  const buttonRef = useRef(null);

  function handleActiveItem() {
    const btn = buttonRef.current;
    const buttonItem = btn.querySelector(`[data-index="${activeIndex}"]`);
    if(!buttonItem) return;
    setObj({
      left: buttonItem.offsetLeft,
      width: buttonItem.clientWidth
    })
  }

  useEffect(() => {
    handleActiveItem()
  }, [activeIndex, items, buttonRef.current]);


  return (
    <div className="pustack-tab-button" ref={buttonRef}>
      {obj && <div className="pustack-tab-button-slider" style={{left: obj.left, width: obj.width}}/>}
      {items.map((item) => (
        <div key={item.id} className={ITEM_CLASS} data-index={item.id} onClick={e => setActiveIndex(item.id)}>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
