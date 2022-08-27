import "react-hot-loader"
import React from "react"
import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import App from './src/App';
import {PustackProContextProvider, ThemeContextProvider, UserContextProvider} from "./src/context";

const Root = () => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <PustackProContextProvider>
          <ThemeContextProvider>
            <UserContextProvider>
              <App />
            </UserContextProvider>
          </ThemeContextProvider>
        </PustackProContextProvider>
      </HelmetProvider>
    </BrowserRouter>
  )
}

export default Root
