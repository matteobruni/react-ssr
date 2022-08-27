import React, { useContext, useState } from "react";
import {PustackProContext, UserContext} from "../../../context";
import Particles from "react-tsparticles";
import Lottie from "lottie-react-web";
import Typist from "react-typist";

import Orbit from "../../../assets/blaze/orbit.png";
import Saturn from "../../../assets/blaze/stars/saturn.png";
import teacher1 from "../../../assets/images/teachers/Divyam Sir.jpg";
import teacher5 from "../../../assets/images/teachers/Rupal Ma_am.jpg";
import teacher4 from "../../../assets/images/teachers/Manish Sir.jpg";
import teacher6 from "../../../assets/images/teachers/Shreya Ma_am.jpg";
import teacher3 from "../../../assets/images/teachers/Ishita Ma_am.jpg";
import teacher2 from "../../../assets/images/teachers/Himanshu Sir.jpg";
import StarsTopLeft from "../../../assets/blaze/stars/stars-bg-tl.png";
import StarsTopRight from "../../../assets/blaze/stars/stars-bg-tr.png";
import StarsBottomLeft from "../../../assets/blaze/stars/stars-bg-bl.png";
import StarsBottomRight from "../../../assets/blaze/stars/stars-bg-br.png";

import { showSnackbar } from "../../../helpers";
import UFOLottie from "../../../assets/blaze/ufo.json";
import RocketLottie from "../../../assets/blaze/rocket.json";
import SatLottie from "../../../assets/blaze/satellite.json";

import "./styles.scss";
import {getActiveStudentSessions, usedMinutesForToday} from "../../../database/blaze/fetch-data";
import BookSession from "../sidebar/components/bookSession";

export default function BlazeLanding({ openPopUp }) {
  const [user] = useContext(UserContext).user;
  const [isProTier] = useContext(UserContext).tier;
  const [_, setShowWarning] = useContext(PustackProContext).warning;
  const [typistKey, setTypistKey] = useState(1);
  return (
    <>
      <div
        className="blaze__landing__wrapper fadeIn"
        style={{ animationDelay: "0.5s" }}
      >
        <Particles
          height={"calc(100vh - 142px)"}
          width="100%"
          params={{
            particles: {
              number: {
                value: 355,
                density: {
                  enable: true,
                  value_area: 789.1476416322727,
                },
              },
              color: {
                value: "ffffff",
              },
              shape: {
                type: "circle",
                stroke: {
                  width: 0,
                  color: "#000000",
                },
                polygon: {
                  nb_sides: 5,
                },
              },
              opacity: {
                value: 0.48927153781200905,
                random: false,
                anim: {
                  enable: true,
                  speed: 0.2,
                  opacity_min: 0,
                  sync: false,
                },
              },
              size: {
                value: 2,
                random: true,
                anim: {
                  enable: true,
                  speed: 2,
                  size_min: 0,
                  sync: false,
                },
              },
              line_linked: {
                enable: false,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1,
              },
              move: {
                enable: true,
                speed: 0.2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: false,
                  rotateX: 600,
                  rotateY: 1200,
                },
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: true,
                  mode: "bubble",
                },
                onclick: {
                  enable: true,
                  mode: "push",
                },
                resize: true,
              },
              modes: {
                grab: {
                  distance: 400,
                  line_linked: {
                    opacity: 1,
                  },
                },
                bubble: {
                  distance: 83.91608391608392,
                  size: 1,
                  duration: 3,
                  opacity: 1,
                  speed: 3,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
                push: {
                  particles_nb: 4,
                },
                remove: {
                  particles_nb: 2,
                },
              },
            },
            retina_detect: true,
          }}
        />

        <div className="stars__overlay">
          <div className="main__wrapper">
            <img
              className="top__left"
              src={StarsTopLeft}
              alt="PuStack Space"
              draggable={false}
            />
            <img
              className="top__right"
              src={StarsTopRight}
              alt="PuStack Space"
              draggable={false}
            />
            <img
              className="bottom__left"
              src={StarsBottomLeft}
              alt="PuStack Space"
              draggable={false}
            />
            <img
              className="bottom__right"
              src={StarsBottomRight}
              alt="PuStack Space"
              draggable={false}
            />
          </div>
        </div>

        <div className="blaze__circle">
          <div className="orbits__wrapper">
            <div className="orbit__3">
              <div className="orbit__wrapper">
                <img
                  src={Orbit}
                  alt="Orbit 1"
                  className="orbit__img"
                  draggable={false}
                />
                <div className="teacher__wrapper__1">
                  <div className="teacher__content">
                    <img
                      className="teacher__img"
                      src={teacher1}
                      alt="divyam"
                      draggable={false}
                    />
                    <div className="teacher__tooltip">
                      <div className="name">Divyam Sir</div>
                      <div className="teacher__details">
                        <div className="subject">English</div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="teacher__wrapper__2">
                  <div className="teacher__content">
                    <img
                      className="teacher__img"
                      src={teacher4}
                      alt="teacher"
                      draggable={false}
                    />
                    <div className="teacher__tooltip">
                      <div className="name">Manish Sir</div>
                      <div className="teacher__details">
                        <div className="subject">Science</div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="teacher__wrapper__2 t3">
                  <div className="teacher__content">
                    <img
                      className="teacher__img"
                      src={teacher3}
                      alt="teacher"
                      draggable={false}
                    />
                    <div className="teacher__tooltip">
                      <div className="name">Ishita Ma'am</div>
                      <div className="teacher__details">
                        <div className="subject">SST</div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="orbit__2">
              <div className="orbit__wrapper">
                <img
                  src={Orbit}
                  alt="Orbit 1"
                  className="orbit__img"
                  draggable={false}
                />

                <div className="saturn">
                  <img src={Saturn} alt="saturn" draggable={false} />
                </div>
                <div className="teacher__wrapper__2 t4">
                  <div className="teacher__content">
                    <img
                      className="teacher__img"
                      src={teacher6}
                      alt="shreya"
                      draggable={false}
                    />
                    <div className="teacher__tooltip">
                      <div className="name">Shreya Ma'am</div>
                      <div className="teacher__details">
                        <div className="subject">SST</div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="orbit__1">
              <div className="orbit__wrapper">
                <img
                  src={Orbit}
                  alt="Orbit 1"
                  className="orbit__img"
                  draggable={false}
                />
                <div className="teacher__wrapper__2 t2">
                  <div className="teacher__content">
                    <img
                      className="teacher__img"
                      src={teacher2}
                      alt="himanshu"
                      draggable={false}
                    />
                    <div className="teacher__tooltip">
                      <div className="name">Himanshu Sir</div>
                      <div className="teacher__details">
                        <div className="subject">Maths</div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="teacher__wrapper__2 t5">
                  <div className="teacher__content">
                    <img
                      className="teacher__img"
                      src={teacher5}
                      alt="rupal"
                      draggable={false}
                    />
                    <div className="teacher__tooltip">
                      <div className="name">Rupal Ma'am</div>
                      <div className="teacher__details">
                        <div className="subject">Science</div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <img
              className="user__img__blaze"
              src={user?.profile_url}
              key={user?.profile_url}
              alt="user"
              draggable={false}
            />
          </div>
        </div>

        <div className="blaze__landing__content">
          <div className="blaze__landing__header">
            <span>Connect with best</span>
            <span>
              online tutors for{" "}
              <Typist
                className="typing__text"
                startDelay={0}
                cursor={{
                  show: false,
                  blink: false,
                  element: "|",
                  hideWhenDone: true,
                  hideWhenDoneDelay: 500,
                }}
                key={typistKey}
                onTypingDone={() => setTypistKey(typistKey + 1)}
              >
                {[
                  "maths",
                  "physics",
                  "history",
                  "chemistry",
                  "biology",
                  "english",
                ].map((word) => [
                  <span className={word}>{word}.</span>,
                  <Typist.Backspace count={word.length + 1} delay={1000} />,
                ])}
              </Typist>
            </span>
          </div>
          <div className="landing__additional">
            Get your doubts resolved by experts, in a<br />
            live
            <span className="highlighted"> 1-on-1 interaction</span>.
          </div>

          <BookSession className="landing__action" aria-label="booksession" openPopUp={openPopUp}>
            Book my session
          </BookSession>

          <div className="rocket">
            <Lottie speed={0.5} options={{ animationData: RocketLottie }} />
          </div>

          <div className="ufo">
            <Lottie speed={0.5} options={{ animationData: UFOLottie }} />
          </div>

          <div className="sat">
            <Lottie speed={0.5} options={{ animationData: SatLottie }} />
          </div>
        </div>
      </div>
    </>
  );
}
