import React, {lazy, Suspense, useCallback, useContext, useEffect, useState} from 'react'
import {GoogleReCaptchaProvider, useGoogleReCaptcha} from "react-google-recaptcha-v3";
import LogoWhite from "../../assets/images/logo-white.png";
import {PustackProContext} from "../../context";
import "./style.scss";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import InstagramIcon from "@material-ui/icons/Instagram";
import EmailRoundedIcon from "@material-ui/icons/MailRounded";
import {appGooglePlayLink, googlePlayBadge, privacyPolicy, showSnackbar, termsOfService} from "../../helpers";
import {refundAndCancellationPolicy} from "../../helpers/links";
import {Link, useHistory, useLocation} from "react-router-dom";
import useForm, {Validators} from "../../hooks/form";
import axios from "axios";
import {CircleLoader} from "../../components";
import circularProgress from "../../assets/lottie/circularProgress.json";
import Lottie from "lottie-react-web";

const OnBoarding = lazy(() => import("../../containers/landing/onboarding"));

function EmailIcon(props) {
  return (
    <svg
      width={25}
      height={25}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g data-name="Layer 29">
        <path d="m12 10.87 9.46-5.55A3 3 0 0 0 19 4H5a3 3 0 0 0-2.48 1.31z" />
        <path d="M13 12.59a2 2 0 0 1-1 .27 2 2 0 0 1-1-.26L2 7.33V17a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7.33z" />
      </g>
    </svg>
  )
}

function MobileIcon(props) {
  return (
    <svg
      // width={25}
      height={21}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 384"
      style={{
        enableBackground: "new 0 0 384 384",
      }}
      xmlSpace="preserve"
      {...props}
    >
      <path d="M353.188 252.052c-23.51 0-46.594-3.677-68.469-10.906-10.719-3.656-23.896-.302-30.438 6.417l-43.177 32.594c-50.073-26.729-80.917-57.563-107.281-107.26l31.635-42.052c8.219-8.208 11.167-20.198 7.635-31.448-7.26-21.99-10.948-45.063-10.948-68.583C132.146 13.823 118.323 0 101.333 0h-70.52C13.823 0 0 13.823 0 30.813 0 225.563 158.438 384 353.188 384c16.99 0 30.813-13.823 30.813-30.813v-70.323c-.001-16.989-13.824-30.812-30.813-30.812z" />
    </svg>)
}

function UserIcon(props) {
  return (
    <svg
      // width={25}
      height={22}
      viewBox="-42 0 512 512.002"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M210.352 246.633c33.882 0 63.222-12.153 87.195-36.13 23.973-23.972 36.125-53.304 36.125-87.19 0-33.876-12.152-63.211-36.129-87.192C273.566 12.152 244.23 0 210.352 0c-33.887 0-63.22 12.152-87.192 36.125s-36.129 53.309-36.129 87.188c0 33.886 12.156 63.222 36.133 87.195 23.977 23.969 53.313 36.125 87.188 36.125zM426.129 393.703c-.692-9.976-2.09-20.86-4.149-32.351-2.078-11.579-4.753-22.524-7.957-32.528-3.308-10.34-7.808-20.55-13.37-30.336-5.774-10.156-12.555-19-20.165-26.277-7.957-7.613-17.699-13.734-28.965-18.2-11.226-4.44-23.668-6.69-36.976-6.69-5.227 0-10.281 2.144-20.043 8.5a2711.03 2711.03 0 0 1-20.879 13.46c-6.707 4.274-15.793 8.278-27.016 11.903-10.949 3.543-22.066 5.34-33.039 5.34-10.972 0-22.086-1.797-33.047-5.34-11.21-3.622-20.296-7.625-26.996-11.899-7.77-4.965-14.8-9.496-20.898-13.469-9.75-6.355-14.809-8.5-20.035-8.5-13.313 0-25.75 2.254-36.973 6.7-11.258 4.457-21.004 10.578-28.969 18.199-7.605 7.281-14.39 16.12-20.156 26.273-5.558 9.785-10.058 19.992-13.371 30.34-3.2 10.004-5.875 20.945-7.953 32.524-2.059 11.476-3.457 22.363-4.149 32.363A438.821 438.821 0 0 0 0 423.949c0 26.727 8.496 48.363 25.25 64.32 16.547 15.747 38.441 23.735 65.066 23.735h246.532c26.625 0 48.511-7.984 65.062-23.734 16.758-15.946 25.254-37.586 25.254-64.325-.004-10.316-.351-20.492-1.035-30.242zm0 0" />
    </svg>
  )
}

function MapIcon(props) {
  return (
    <svg
      height={22}
      viewBox="0 0 64 64"
      width={22}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M32 0A24.032 24.032 0 0 0 8 24c0 17.23 22.36 38.81 23.31 39.72a.99.99 0 0 0 1.38 0C33.64 62.81 56 41.23 56 24A24.032 24.032 0 0 0 32 0zm0 35a11 11 0 1 1 11-11 11.007 11.007 0 0 1-11 11z" />
    </svg>
  )
}

function ContactFormInput({Icon, label, ...props}) {

  return (
    <>
      <label htmlFor={label}>{label} <span style={{color: 'red'}}>*</span></label>
      <div className="contact_us-form-input">
        <input name={label} {...props}/>
        {Icon && <div className="contact_us-form-input-icon">
          <Icon/>
        </div>}
      </div>
    </>
  )
}

/* SmtpJS.com - v3.0.0 */

const RecaptchaComponent = ({Component}) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async (e) => {
    if(e) e.preventDefault();

    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available');
      return;
    }

    const token = await executeRecaptcha('yourAction');

    // console.log('token - ', token);
    // Do whatever you want with the token
  }, [executeRecaptcha]);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify(null).then();
  }, [handleReCaptchaVerify]);

  return (
    <div onClick={handleReCaptchaVerify}>
      {Component}
    </div>
  )
};

export default function ContactUsPage() {
  const history = useHistory();
  const {register, handleChange, form} = useForm({
    name: ['', [Validators.req()]],
    email: ['', [Validators.req(), Validators.test(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phone: ['', [Validators.req(), Validators.isInt()]],
    message: ['', [Validators.req()]]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [revealed, setRevealed] = useState({phone: false, email: false})
  const GooglePlay = () => (
    <a target="_blank" rel="noopener noreferrer" href={appGooglePlayLink}>
      <img alt="Get it on Google Play" src={googlePlayBadge} />
    </a>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    // form.validate();
    if(form._invalid) return;
    setIsSubmitting(true);
    const requestObj = {
      name: form.controls.name.value,
      email: form.controls.email.value,
      phone: form.controls.phone.value,
      message: form.controls.message.value
    }
    const response = await axios.post('https://us-central1-avian-display-193502.cloudfunctions.net/sendMail', {
      "data": {
        "from": form.controls.email.value,
        "to":"contact@pustack.com",
        "message": `
          Name: ${requestObj.name}
          Email: ${requestObj.email}
          Phone Number: ${requestObj.phone}
          Message: ${requestObj.message}
        `,
        "subject":"Support"
      }
    });
    // console.log('response - ', response)
    setIsSubmitting(false);
    if(response.status === 200) {
      handleChange({target: {name: 'name', value: ''}});
      handleChange({target: {name: 'email', value: ''}});
      handleChange({target: {name: 'phone', value: ''}});
      handleChange({target: {name: 'message', value: ''}});
      showSnackbar('Submitted successfully.', 'success');
      return;
    }
    console.log(response);
    showSnackbar('Something went wrong.', 'error');
  }

  return (
    <div className="contact_us">
      <nav className="nav__wrapper">
          <span className="nav__logo">
            <img
              src={LogoWhite}
              alt="Pustack Logo"
              draggable={false}
              className="nav__logo__img"
              onClick={() => window.location.replace('/')}
            />
          </span>

        <span className="nav__links">
            {/*<a href="https://tutor.pustack.com">Tutor Login</a>*/}
            <span
              className="nav__link signup__btn"
              onClick={() => {
                setIsSliderOpen(true);
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
            >
              Sign In
            </span>
          </span>
      </nav>
      <div className="contact_us-body">
        {/*<div className="contact_us-map-container" style={{width: '100%'}}>*/}
        {/*  <iframe width="100%" height="600" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=28.451220766328596,%2077.09627140867295+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed" />*/}
        {/*</div>*/}
        <div className="contact_us-form">
          <GoogleReCaptchaProvider reCaptchaKey={"6Lcj_tIeAAAAABPRqa9X2CJ3rauTXujhzZEn-C58"}>
            <div className="contact_us-form-group">
              <h2>Contact Us</h2>
              <p>We are looking forward to hearing from you.</p>
              <div className="contact_us-form-group-info">
                <div>
                  <MobileIcon height={22} />
                  {revealed.phone ?
                    <span>+91-93069-44779</span> :
                    <RecaptchaComponent Component={(
                      <span className="reveal-btn" onClick={() => setRevealed(c => ({...c, phone: true}))}>Click for Phone Number</span>
                    )} />
                  }
                </div>
                <div>
                  <EmailIcon height={27} />
                  {revealed.email ?
                    <span>contact@pustack.com</span> :
                    <RecaptchaComponent Component={(
                      <span className="reveal-btn" onClick={() => setRevealed(c => ({...c, email: true}))}>Click for Email</span>
                    )} />
                  }
                </div>
                <div>
                  <MapIcon height={25} />
                  <span>283, New Sukhdev Nagar, Panipat, Haryana 132103</span>
                </div>
              </div>
              <div className="contact_us-form-group-social">
                <a
                  href="https://www.youtube.com/pustack"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YouTubeIcon />
                </a>
                <a
                  href="https://www.facebook.com/pustack.official"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://www.linkedin.com/company/pustack"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="https://www.instagram.com/pustack_app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>
            <form className="contact_us-form-group modal">
              <ContactFormInput
                label="Full Name"
                {...register('name')}
                Icon={() => (
                  <UserIcon height={20} />
                )}
              />
              <ContactFormInput
                label="Mobile Number"
                {...register('phone')}
                Icon={() => (
                  <MobileIcon height={17} />
                )}
              />
              <ContactFormInput
                label="Email"
                {...register('email')}
                Icon={() => (
                  <EmailIcon height={23} />
                )}
              />
              <label>Your Message <span style={{color: 'red'}}>*</span></label>
              <div className="contact_us-form-input textarea">
                <textarea {...register('message')} id="" cols="30" rows="3" placeholder="Type your message..." />
              </div>
              <RecaptchaComponent Component={(
                <button disabled={form._invalid} onClick={handleSubmit}>
                  {isSubmitting ? (
                    <Lottie
                      style={{width: '30px'}}
                      options={{ animationData: circularProgress, loop: true }}
                    />
                  ) : 'Send Message'}
                </button>
              )} />
            </form>
          </GoogleReCaptchaProvider>
        </div>
      </div>
      <footer className="desktop__landing__footer">
        <div className="final__footer" style={{display: 'flex', opacity: 1}}>
          <h6 className="copyright">
            © {new Date().getFullYear()} PuStack Technologies, Inc.
          </h6>
          <div className="company__details">
            <h1>COMPANY</h1>
            <div>
              <h6>
                <Link to="/about">
                  About Us
                </Link>
              </h6>
              <h6>
                {/*<Link to={"/privacy_policy"} />*/}
                <a target="_blank" href={"/privacy_policy"}>Privacy Policy</a>
              </h6>
              <h6>
                <a target="_blank" href={"/terms_of_service"}>Terms of Service</a>
              </h6>
            </div>
          </div>
          <div className="other__links">
            <h1>OTHER LINKS</h1>
            <div>
              <h6>
                <Link to="/sitemap">
                  Site Map
                </Link>
                {/*<a href="/sitemap">Site Map</a>*/}
              </h6>
            </div>
            <div>
              <h6>
                <a target="_blank" href={"/cancellation_policy"} >Refund & Cancellation Policy</a>
              </h6>
            </div>
            <div>
              <h6>
                <Link to="/contact">
                  Contact Us
                </Link>
                {/*<a href="/contact" >Contact Us</a>*/}
              </h6>
            </div>
          </div>
          <div className="app__links">
            <h1>STUDENT APP</h1>
            <div className="play-button">
              <GooglePlay />
            </div>
          </div>
          <div>
            <a
              href="https://www.instagram.com/pustack_app"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram__icon"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/pustack.official"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.youtube.com/pustack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <YouTubeIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/pustack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon />
            </a>

            <a
              href="mailto:contact@pustack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <EmailRoundedIcon />
            </a>
          </div>
        </div>
      </footer>
      <Suspense fallback={<></>}>
        <OnBoarding
          isOpen={isSliderOpen}
          handleClose={() => setIsSliderOpen(!isSliderOpen)}
        />
      </Suspense>
    </div>
  )
}
