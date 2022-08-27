import React, {useState} from 'react';
import {Dialog} from "@material-ui/core";
import {SessionFormInput} from "../../../components/livesessions/sessionform-input";
import PustackButton from "../../../components/global/pustack-btn";
import {CloseRounded} from "@material-ui/icons";

export default function CmsModal({open, setOpen}) {

  return (
    <Dialog
      className={"blaze__book__modal"}
      // disableBackdropClick={false}
      open={open}
      // open={true}
      onClose={() => setOpen(false)}
      disableEscapeKeyDown={true}
    >
      <div className="cms-modal">
        <header>
          <h2>Create Grade</h2>
          <div className="cms-modal-close" onClick={() => setOpen(false)}>
            <CloseRounded />
          </div>
        </header>
        <SessionFormInput
          placeholder="Grade Name"
        />
        <SessionFormInput
          placeholder="Grade Number"
        />
        <SessionFormInput
          placeholder="Serial Order"
        />
        <PustackButton className="cms-button">
          Create
        </PustackButton>
      </div>
    </Dialog>
  )
}
