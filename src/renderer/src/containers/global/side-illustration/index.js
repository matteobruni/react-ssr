import React from "react";
import Lottie from "lottie-react-web";
import earth from "../../../assets/onboarding/planet_earth.svg";
import astronaut from "../../../assets/onboarding/astronaut.json";
import "./style.scss";

const SideIllustration = () => {
  return (
    <div
      className="side-illustration fadeIn"
      style={{ animationDelay: "0.5s" }}
    >
      <Lottie options={{ animationData: astronaut, loop: true }} />
      <img alt="earth" className="earth-img" src={earth} draggable={false} />
    </div>
  );
};

export default SideIllustration;
