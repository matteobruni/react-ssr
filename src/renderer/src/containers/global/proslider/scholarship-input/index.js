import React, {useContext, useEffect} from "react";
import {ThemeContext} from "../../../../context";
import {useMediaQuery} from "react-responsive";


export const ScholarshipInput = ({value, onChange, invalidKeys, className, placeholder = 'Type here...', name, type = "text", ...props}) => {
  const [isDark] = useContext(ThemeContext).theme;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  // function handleChange(e) {
  //   onTextChange(e.target.value);
  //   typeof onChange === 'function' && onChange(e);
  // }

  useEffect(() => {
    console.log('invalidKeys = ', invalidKeys, name);
  }, [invalidKeys])

  return (
    <div className={"scholarship-form-input " + (className ?? '') + (invalidKeys.includes(name) ? ' error' : '')}>
      <input value={value} name={name} onChange={onChange} type={type} {...props}/>
      <label htmlFor="">{placeholder}</label>
    </div>
  )
}
