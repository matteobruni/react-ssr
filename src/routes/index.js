import React from "react"
import { Switch, Route } from "react-router-dom"

import HomeView from "./Home";

// eslint-disable-next-line no-unused-vars
export const getInitialData = (req, store) => {
  return []
}

export default function initRenderRoutes() {
  return (
    <Switch>
      <Route exact path="/" component={HomeView} />
    </Switch>
  )
}
