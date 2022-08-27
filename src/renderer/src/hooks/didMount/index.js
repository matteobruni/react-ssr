import React, { useEffect, useRef } from 'react';

/**
 * It will prevent the callback to run on the very first render.
 * @param func
 * @param deps
 */
const useDidMountEffect = (func, deps) => {
  const didMount = useRef(false);

  useEffect(() => {
    console.log('Ran')
    if (didMount.current) {
      func();
    }
    else {
      let f = func(true);
      console.log('f - ', f);
      if(f) {
        didMount.current = true
      }
    }
  }, deps);
}

export default useDidMountEffect;
