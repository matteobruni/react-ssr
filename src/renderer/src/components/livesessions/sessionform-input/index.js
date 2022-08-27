import React, {useContext, useEffect, useMemo, useState} from 'react';
import "./style.scss";
import {ThemeContext} from "../../../context";
import {InputLabel, MenuItem, Select} from "@material-ui/core";
import {useMediaQuery} from "react-responsive";

export const SessionFormSelect = ({
  id = 'any-id-goes-here',
  placeholder: label,
  emptyLabel,
  name,
  invalid,
  style,
  forceDark,
  value,
  multiple,
  className,
  PopoverClasses = {},
  items = [{id: 1, label: 'No item found', value: 1}],
  onChange = function() {},
  onValueChange = function() {}
}) => {
  const [isDarkTheme] = useContext(ThemeContext).theme;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  const isDark = useMemo(() => {
    if(forceDark) return forceDark;
    return isDarkTheme;
  }, [isDarkTheme, forceDark])

  const itemList = useMemo(() => {
   return items?.map(item => (
      <MenuItem key={item.id} value={item.value}>
        {item.image && (
          <img style={{borderRadius: 40, flexShrink: 0, flexGrow: 0, marginRight: '8px', width: '25px', height: '25px'}} src={item.image} alt={item.label}/>
        )}
        {item.label}
      </MenuItem>
    ))
  }, [items])

  const handleChange = (e) => {
    onValueChange(e.target.value);
    onChange(e);
  }

  useEffect(() => {
    if(!value) {
      onChange({target: {name, value: null}});
    } else {
      let isThere = items.some(c => c.value === value);
      if(!isThere) {
        onChange({target: {name, value: null}});
      }
    }
  }, [items]);

  // console.log('value, name - ', value, name);

  return (
    <div style={{
      marginTop: '20px',
      position: 'relative',
      ...style
    }} className={(invalid ? 'error ' : '') + (className ? className + ' ' : '')}>
      {(value === null || value === undefined || value.length === 0) && <InputLabel style={{
        position: 'absolute',
        top: '50%',
        left: '25px',
        transform: 'translateY(-50%)',
        color: isDark || isSmallScreen ? '#747474' : '#757575',
        zIndex: 2,
        pointerEvents: 'none'
      }} id={id + '-label'}>
        {itemList?.length > 0 ? (label || 'Select Item') : (emptyLabel || 'No Items')}
      </InputLabel>}
      <Select
        labelId={id + '-label'}
        id={id}
        value={value}
        label={label || ''}
        disabled={!itemList || itemList.length === 0}
        onChange={handleChange}
        multiple={multiple}
        name={name}
        MenuProps={{
          PaperProps: {
            style: {
              backgroundColor: isDark || isSmallScreen ? '#0c0c0c' : '#f2f2f2',
              color: isDark || isSmallScreen ? '#f2f2f2' : '#0c0c0c'
            }
          },
          PopoverClasses
        }}
      >
        {itemList}
      </Select>
    </div>
  )
}

export const SessionFormInput = ({
  placeholder,
  type = 'text',
  onTextChange = function() {},
  onChange = function() {},
  name,
  invalid,
  value,
  InputProps = {},
  SvgIcon,
  SvgProps,
  SideElement,
  SideElementProps,
  ContainerProps,
  ...props
}) => {
  const [isDark] = useContext(ThemeContext).theme;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  function handleChange(e) {
    onTextChange(e.target.value);
    typeof onChange === 'function' && onChange(e);
  }

  return (
    <div className={"session__form__input" + (isDark || isSmallScreen ? ' dark' : '')} {...ContainerProps}>
      <input
        className={invalid ? 'error' : ''}
        {...{placeholder, type, name, onChange: handleChange, value, ...InputProps}}
      />
      {Boolean(SvgIcon) && (
        <div className="session__form__input__icon" {...SvgProps}>
          {SvgIcon}
        </div>
      )}
      {(Boolean(SideElement) || Boolean(SideElementProps)) && (
        <div className="session__form__input__side-element" {...SideElementProps}>
          {SideElement}
        </div>
      )}
    </div>
  )
}
