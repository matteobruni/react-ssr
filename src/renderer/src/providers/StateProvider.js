import React from "react";

import { UserProvider } from "./User/UserProvider";
import { PostsProvider } from "./Posts/PostsProvider";

import userReducer, {
  initialState as initialUserState,
} from "./User/UserReducer";

import postsReducer, {
  initialState as initialPostsState,
} from './Posts/PostsReducer';

export const StateProvider = ({ children }) => (
  <UserProvider initialState={initialUserState} reducer={userReducer} >
    <PostsProvider initialState={initialPostsState} reducer={postsReducer}>
      {children}
    </PostsProvider>
  </UserProvider>
);
