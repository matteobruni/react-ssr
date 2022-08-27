import React, {useContext} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {ModalContext} from "../../../context/global/ModalContext";
import './styles.css';


const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '6px',
    // border: '2px solid #000',
    boxShadow: '0px -4px 10px 0px #0000000D, 0px 10px 20px 0px #0000001A',
    padding: theme.spacing(2, 4, 3),
  },
}));
// box-shadow: 0px -4px 10px 0px #0000000D;
//
// box-shadow: 0px 10px 20px 0px #0000001A;


function AppModal() {
  const classes = useStyles();
  const [modalData, setModalData] = useContext(ModalContext).state;

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={modalData?.open}
      onClose={() => {
        setModalData(data => ({...data, open: false}));
      }}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={modalData?.open}>
        {modalData?.Children || (
          <div className={classes.paper}>
            <p>No content in the modal</p>
          </div>
        )}
      </Fade>
    </Modal>
  )
}

export default AppModal;
