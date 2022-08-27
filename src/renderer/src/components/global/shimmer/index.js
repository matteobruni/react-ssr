import React, {useContext} from 'react';
import "./style.scss";
import {ThemeContext} from "../../../context";

export default function PustackShimmer({className, style}) {
  const [isDark] = useContext(ThemeContext).theme;

  return (
    <div style={style} className={"pustack-shimmer " + (isDark ? ' dark-shim ' : '') + (className ?? '')} />
  )
}
