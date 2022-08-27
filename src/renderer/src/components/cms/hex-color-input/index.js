import React, {useState} from 'react';
import {SessionFormInput} from "../../livesessions/sessionform-input";
import Menu from "@material-ui/core/Menu";
import {HexColorPicker} from "react-colorful";

export default function HexColorInput({controlName, form, register, handleChangeValue}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickColorInput = (e) => {
    setAnchorEl(e.nativeEvent.target);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  return (
    <>
      <label htmlFor="">Hex Color (Format: #ff5e4c)</label>
      <SessionFormInput
        // onClick={handleClickColorInput}
        {...register(controlName)}
        SideElementProps={{
          style: {backgroundColor: form.get(controlName).value},
          onClick: handleClickColorInput
        }}
      />
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorReference={'anchorEl'}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          style: {overflow: 'unset', borderRadius: '10px'}
        }}
      >
        <HexColorPicker color={form.get(controlName).value} onChange={color => handleChangeValue(controlName, color)} />
      </Menu>
    </>
  )
}
