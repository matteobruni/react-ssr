import React, { useContext } from "react";
import { Radio, withStyles } from "@material-ui/core";
import { ThemeContext } from "../../../context";

export default function CustomRadioBtn({ value, onChange, checked }) {
  const [isDark] = useContext(ThemeContext).theme;

  const BrownRadio = withStyles({
    root: {
      color: isDark ? "#bb281b" : "#891010",
      padding: "0px",
      "&$checked": {
        color: isDark ? "#bb281b" : "#891010",
      },
    },
    checked: {},
  })((props) => <Radio color="default" {...props} />);
  return (
    <BrownRadio
      checked={checked}
      onChange={onChange}
      value={value}
      color="default"
      name="radio-button-demo"
      inputProps={{ "aria-label": "E" }}
    />
  );
}
