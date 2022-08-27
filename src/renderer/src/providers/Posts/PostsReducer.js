export const initialState = {
  posts: null,
};

export const actionTypes = {
  SET_POSTS: "SET_POSTS",
  GET_POSTS: "GET_POSTS",
};

const postsReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_POSTS:
      return {
        ...state,
        posts: action.posts,
      };

    case actionTypes.GET_POSTS:
      return {
        ...state,
        posts: state.posts,
      };

    default:
      return state;
  }
};

export default postsReducer;
