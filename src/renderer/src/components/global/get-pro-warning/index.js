import React, {useContext} from 'react'
import ReactDOM from 'react-dom';
import {PustackProContext, UserContext} from "../../../context";
import {CloseOutlined, CloseRounded} from "@material-ui/icons";
import CancelIcon from "@material-ui/icons/Cancel";
import WelcomeBg from "../../../assets/onboarding/welcome.jpeg";
import {logoDark2} from "../../../assets";
import Dialog from "@material-ui/core/Dialog";

export default function GetProWarning() {
  const [user] = useContext(UserContext).user;
  const [showWarning, setShowWarning] = useContext(PustackProContext).warning;
  const [_, setIsOpen] = useContext(PustackProContext).value;

  return (
    showWarning && ReactDOM.createPortal(
      <Dialog
        onClose={() => setShowWarning(false)}
        aria-labelledby="simple-dialog-title"
        open={showWarning}
        // open={true}
        className="pro-warning welcome-dialog-wrapper"
      >
        <div className="welcome-dialog">
          <CancelIcon
            className="close-welcome-dialog"
            onClick={() => setShowWarning(false)}
          />
          <img
            className="welcome-background"
            src={WelcomeBg}
            alt="welcome"
            draggable={false}
          />
          <img className="logo" src={logoDark2} alt="logo" draggable={false} />
          <div className="welcome-text">
            <h1>Hey {user?.name?.split(" ")[0]}, </h1>{" "}
            {showWarning?.Content ?? (
              <>
                <h1>Session limit reached!</h1>
                <h2>
                  Join Pro to create more than one session at a time.
                </h2>
              </>
            )}
            <div>
              <button
                style={{
                  width: 'unset',
                  padding: '0 15px'
                }}
                onClick={() => {
                  setIsOpen(true);
                  setShowWarning(false);
                }}
              >
                Get Unlimited Access
              </button>
            </div>
          </div>
        </div>
      </Dialog>,
      document.getElementById('modal')
    )
  )
}
