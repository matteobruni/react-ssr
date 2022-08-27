import React from "react";
import {
  LiveSessionSidebarShimmer,
  LiveSessionLectureShimmer,
} from "../../../components";
import "./style.scss";

export default function LiveSessionPlaceholder() {
  return (
    <>
      <section className="livesession__placeholder">
        <div className="row livediv">
          <div className="col live">
            <LiveSessionSidebarShimmer />
          </div>

          <div className="col-lg-12 col-md-12 col-xs-12">
            <div className="row no-gutters">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-12 col-lg-9">
                    <div
                      className="session__area"
                      style={{ background: "white" }}
                    >
                      <LiveSessionLectureShimmer />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
