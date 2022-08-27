import React, { createContext, useContext, useReducer } from "react";

export const PostsContext = createContext();

export const PostsProvider = ({ reducer, initialState, children }) => (
  <PostsContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </PostsContext.Provider>
);

export const usePostsValue = () => useContext(PostsContext);